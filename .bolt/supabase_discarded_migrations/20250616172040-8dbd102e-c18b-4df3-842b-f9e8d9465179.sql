
-- FASE 1: Limpieza completa de la base de datos
DROP VIEW IF EXISTS vista_estadisticas_zonas CASCADE;
DROP VIEW IF EXISTS vista_estado_restaurante CASCADE;
DROP VIEW IF EXISTS vista_reservas_hoy CASCADE;

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS trigger_historial_mesa_estados ON mesa_estados CASCADE;
DROP TRIGGER IF EXISTS trigger_actualizar_metricas_reservas ON reservas CASCADE;
DROP TRIGGER IF EXISTS trigger_actualizar_cliente_analytics ON reservas CASCADE;
DROP TRIGGER IF EXISTS trigger_notification_nueva_reserva ON reservas CASCADE;
DROP TRIGGER IF EXISTS trigger_notification_cancelacion ON reservas CASCADE;

-- Eliminar funciones relacionadas con mesas
DROP FUNCTION IF EXISTS actualizar_estado_mesa CASCADE;
DROP FUNCTION IF EXISTS obtener_mesas_combinables CASCADE;
DROP FUNCTION IF EXISTS iniciar_servicio_mesa CASCADE;
DROP FUNCTION IF EXISTS finalizar_servicio_mesa CASCADE;
DROP FUNCTION IF EXISTS actualizar_metricas_diarias CASCADE;
DROP FUNCTION IF EXISTS trigger_historial_mesa_estados CASCADE;

-- Eliminar tablas en orden correcto
DROP TABLE IF EXISTS mesa_tracking CASCADE;
DROP TABLE IF EXISTS mesa_estados_historial CASCADE;
DROP TABLE IF EXISTS mesa_estados CASCADE;
DROP TABLE IF EXISTS mesa_combinaciones CASCADE;
DROP TABLE IF EXISTS metricas_diarias CASCADE;
DROP TABLE IF EXISTS disponibilidad_mesas CASCADE;
DROP TABLE IF EXISTS mesas CASCADE;

-- FASE 2: Nueva arquitectura optimizada
CREATE TYPE estado_mesa_enum AS ENUM ('libre', 'ocupada', 'reservada', 'limpieza', 'fuera_servicio');
CREATE TYPE tipo_mesa_enum AS ENUM ('estandar', 'terraza_superior', 'terraza_inferior', 'barra', 'vip');
CREATE TYPE zona_enum AS ENUM ('interior', 'campanar', 'justicia', 'barra');

-- Tabla principal de mesas
CREATE TABLE mesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_mesa TEXT NOT NULL UNIQUE,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  tipo_mesa tipo_mesa_enum NOT NULL DEFAULT 'estandar',
  zona zona_enum NOT NULL DEFAULT 'interior',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  es_combinable BOOLEAN DEFAULT true,
  mesas_adyacentes UUID[] DEFAULT ARRAY[]::UUID[],
  ubicacion_descripcion TEXT,
  notas_mesa TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de estados
CREATE TABLE estados_mesa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
  estado estado_mesa_enum NOT NULL DEFAULT 'libre',
  reserva_id UUID REFERENCES reservas(id),
  tiempo_ocupacion TIMESTAMP WITH TIME ZONE,
  tiempo_estimado_liberacion TIMESTAMP WITH TIME ZONE,
  numero_comensales INTEGER,
  notas_estado TEXT,
  asignado_por UUID REFERENCES personal(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mesa_id)
);

-- Tabla para combinaciones
CREATE TABLE combinaciones_mesa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_combinacion TEXT NOT NULL,
  mesa_principal_id UUID NOT NULL REFERENCES mesas(id),
  mesas_secundarias UUID[] NOT NULL,
  capacidad_total INTEGER NOT NULL,
  reserva_id UUID REFERENCES reservas(id),
  estado_combinacion estado_mesa_enum DEFAULT 'libre',
  creado_por UUID REFERENCES personal(id),
  distancia_maxima_metros NUMERIC DEFAULT 2.0,
  es_optima BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Función para sugerir mesas
CREATE OR REPLACE FUNCTION sugerir_mesas_para_reserva(
  p_num_comensales INTEGER,
  p_zona_preferida TEXT DEFAULT NULL,
  p_fecha DATE DEFAULT CURRENT_DATE,
  p_hora TIME DEFAULT CURRENT_TIME
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sugerencias JSONB := '[]'::JSONB;
  suggestion JSONB;
  mesa RECORD;
  combinacion RECORD;
  zona_filtro zona_enum;
BEGIN
  -- Convertir zona preferida a enum si se proporciona
  IF p_zona_preferida IS NOT NULL THEN
    zona_filtro := p_zona_preferida::zona_enum;
  END IF;

  -- Mesa individual exacta
  FOR mesa IN 
    SELECT m.*, em.estado 
    FROM mesas m
    JOIN estados_mesa em ON m.id = em.mesa_id
    WHERE m.capacidad = p_num_comensales
      AND em.estado = 'libre'
      AND m.activa = true
      AND (zona_filtro IS NULL OR m.zona = zona_filtro)
    ORDER BY m.zona, m.numero_mesa
  LOOP
    suggestion := jsonb_build_object(
      'tipo', 'individual',
      'score', 100,
      'mesas', jsonb_build_array(
        jsonb_build_object(
          'id', mesa.id,
          'numero', mesa.numero_mesa,
          'capacidad', mesa.capacidad,
          'zona', mesa.zona
        )
      ),
      'capacidad_total', mesa.capacidad,
      'descripcion', 'Mesa individual perfecta para ' || p_num_comensales || ' personas',
      'zona', mesa.zona
    );
    sugerencias := sugerencias || suggestion;
  END LOOP;

  -- Mesa individual con capacidad superior
  FOR mesa IN 
    SELECT m.*, em.estado 
    FROM mesas m
    JOIN estados_mesa em ON m.id = em.mesa_id
    WHERE m.capacidad > p_num_comensales
      AND m.capacidad <= p_num_comensales + 2
      AND em.estado = 'libre'
      AND m.activa = true
      AND (zona_filtro IS NULL OR m.zona = zona_filtro)
    ORDER BY m.capacidad ASC, m.zona, m.numero_mesa
  LOOP
    suggestion := jsonb_build_object(
      'tipo', 'individual_mayor',
      'score', 85 - ((mesa.capacidad - p_num_comensales) * 5),
      'mesas', jsonb_build_array(
        jsonb_build_object(
          'id', mesa.id,
          'numero', mesa.numero_mesa,
          'capacidad', mesa.capacidad,
          'zona', mesa.zona
        )
      ),
      'capacidad_total', mesa.capacidad,
      'descripcion', 'Mesa de ' || mesa.capacidad || ' para ' || p_num_comensales || ' personas (espaciosa)',
      'zona', mesa.zona
    );
    sugerencias := sugerencias || suggestion;
  END LOOP;

  -- Combinación de 2 mesas adyacentes
  FOR combinacion IN
    SELECT 
      m1.id as mesa1_id, m1.numero_mesa as mesa1_numero, m1.capacidad as mesa1_cap, m1.zona as zona,
      m2.id as mesa2_id, m2.numero_mesa as mesa2_numero, m2.capacidad as mesa2_cap,
      (m1.capacidad + m2.capacidad) as capacidad_total,
      SQRT(POW(m1.position_x - m2.position_x, 2) + POW(m1.position_y - m2.position_y, 2)) as distancia
    FROM mesas m1
    JOIN estados_mesa em1 ON m1.id = em1.mesa_id
    JOIN mesas m2 ON m2.zona = m1.zona AND m2.id != m1.id
    JOIN estados_mesa em2 ON m2.id = em2.mesa_id
    WHERE (m1.capacidad + m2.capacidad) >= p_num_comensales
      AND (m1.capacidad + m2.capacidad) <= p_num_comensales + 2
      AND em1.estado = 'libre'
      AND em2.estado = 'libre'
      AND m1.activa = true AND m2.activa = true
      AND m1.es_combinable = true AND m2.es_combinable = true
      AND (zona_filtro IS NULL OR m1.zona = zona_filtro)
      AND SQRT(POW(m1.position_x - m2.position_x, 2) + POW(m1.position_y - m2.position_y, 2)) <= 100
    ORDER BY distancia ASC, capacidad_total ASC
    LIMIT 5
  LOOP
    suggestion := jsonb_build_object(
      'tipo', 'combinacion_2',
      'score', 75 - (combinacion.distancia::INTEGER / 10),
      'mesas', jsonb_build_array(
        jsonb_build_object(
          'id', combinacion.mesa1_id,
          'numero', combinacion.mesa1_numero,
          'capacidad', combinacion.mesa1_cap,
          'zona', combinacion.zona
        ),
        jsonb_build_object(
          'id', combinacion.mesa2_id,
          'numero', combinacion.mesa2_numero,
          'capacidad', combinacion.mesa2_cap,
          'zona', combinacion.zona
        )
      ),
      'capacidad_total', combinacion.capacidad_total,
      'descripcion', 'Combinación: Mesa ' || combinacion.mesa1_numero || ' + Mesa ' || combinacion.mesa2_numero,
      'zona', combinacion.zona,
      'distancia', combinacion.distancia
    );
    sugerencias := sugerencias || suggestion;
  END LOOP;

  -- Ordenar sugerencias por score descendente
  SELECT jsonb_agg(suggestion ORDER BY (suggestion->>'score')::INTEGER DESC)
  INTO sugerencias
  FROM jsonb_array_elements(sugerencias) suggestion;

  RETURN COALESCE(sugerencias, '[]'::JSONB);
END;
$$;

-- Función para aplicar combinación
CREATE OR REPLACE FUNCTION aplicar_combinacion_mesa(
  p_mesas_ids UUID[],
  p_reserva_id UUID,
  p_nombre_combinacion TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  combinacion_id UUID;
  mesa_principal_id UUID;
  capacidad_total INTEGER;
  mesas_secundarias UUID[];
BEGIN
  IF EXISTS (
    SELECT 1 FROM estados_mesa 
    WHERE mesa_id = ANY(p_mesas_ids) 
    AND estado != 'libre'
  ) THEN
    RAISE EXCEPTION 'Una o más mesas no están disponibles';
  END IF;

  SELECT id INTO mesa_principal_id
  FROM mesas 
  WHERE id = ANY(p_mesas_ids)
  ORDER BY capacidad DESC
  LIMIT 1;

  SELECT SUM(capacidad) INTO capacidad_total
  FROM mesas 
  WHERE id = ANY(p_mesas_ids);

  SELECT ARRAY(
    SELECT id FROM mesas 
    WHERE id = ANY(p_mesas_ids) 
    AND id != mesa_principal_id
  ) INTO mesas_secundarias;

  INSERT INTO combinaciones_mesa (
    nombre_combinacion,
    mesa_principal_id,
    mesas_secundarias,
    capacidad_total,
    reserva_id,
    estado_combinacion
  ) VALUES (
    COALESCE(p_nombre_combinacion, 'Combinación para ' || capacidad_total || ' personas'),
    mesa_principal_id,
    mesas_secundarias,
    capacidad_total,
    p_reserva_id,
    'reservada'
  ) RETURNING id INTO combinacion_id;

  UPDATE estados_mesa 
  SET 
    estado = 'reservada',
    reserva_id = p_reserva_id,
    updated_at = now()
  WHERE mesa_id = ANY(p_mesas_ids);

  RETURN combinacion_id;
END;
$$;

-- Función para actualizar estado de mesa
CREATE OR REPLACE FUNCTION actualizar_estado_mesa(
  p_mesa_id UUID,
  p_nuevo_estado TEXT,
  p_reserva_id UUID DEFAULT NULL,
  p_tiempo_estimado_liberacion TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE estados_mesa 
  SET 
    estado = p_nuevo_estado::estado_mesa_enum,
    reserva_id = p_reserva_id,
    tiempo_estimado_liberacion = p_tiempo_estimado_liberacion,
    notas_estado = p_notas,
    updated_at = now()
  WHERE mesa_id = p_mesa_id;
  
  RETURN FOUND;
END;
$$;

-- Insertar datos iniciales
INSERT INTO mesas (numero_mesa, capacidad, tipo_mesa, zona, position_x, position_y, es_combinable, ubicacion_descripcion) VALUES
('T1', 2, 'terraza_superior', 'campanar', 100, 150, true, 'Terraza Campanar - Primera fila'),
('T2', 2, 'terraza_superior', 'campanar', 200, 150, true, 'Terraza Campanar - Primera fila'),
('T3', 2, 'terraza_superior', 'campanar', 300, 150, true, 'Terraza Campanar - Primera fila'),
('T10', 4, 'terraza_superior', 'campanar', 100, 250, true, 'Terraza Campanar - Central'),
('T11', 4, 'terraza_superior', 'campanar', 250, 250, true, 'Terraza Campanar - Central'),
('T12', 4, 'terraza_superior', 'campanar', 400, 250, true, 'Terraza Campanar - Central'),
('T13', 2, 'terraza_superior', 'campanar', 100, 350, true, 'Terraza Campanar - Lateral'),
('T14', 2, 'terraza_superior', 'campanar', 250, 350, true, 'Terraza Campanar - Lateral'),
('M1', 2, 'estandar', 'interior', 100, 100, true, 'Sala Interior - Ventana'),
('M2', 4, 'estandar', 'interior', 100, 200, true, 'Sala Interior - Centro'),
('M3', 2, 'estandar', 'interior', 100, 300, true, 'Sala Interior - Rincón'),
('M6', 4, 'estandar', 'interior', 300, 100, true, 'Sala Interior - Central'),
('M7', 4, 'estandar', 'interior', 300, 200, true, 'Sala Interior - Central'),
('M8', 2, 'estandar', 'interior', 300, 300, true, 'Sala Interior - Lateral'),
('M10', 6, 'estandar', 'interior', 200, 250, true, 'Sala Interior - Mesa grande central'),
('T4', 4, 'terraza_inferior', 'justicia', 100, 400, true, 'Terraza Justicia - Primera línea'),
('T5', 4, 'terraza_inferior', 'justicia', 250, 400, true, 'Terraza Justicia - Primera línea'),
('T8', 2, 'terraza_inferior', 'justicia', 400, 400, true, 'Terraza Justicia - Esquina'),
('T9', 2, 'terraza_inferior', 'justicia', 100, 500, true, 'Terraza Justicia - Segunda línea'),
('T20', 4, 'terraza_inferior', 'justicia', 250, 500, true, 'Terraza Justicia - Segunda línea'),
('T21', 4, 'terraza_inferior', 'justicia', 400, 500, true, 'Terraza Justicia - Segunda línea'),
('T22', 2, 'terraza_inferior', 'justicia', 100, 600, true, 'Terraza Justicia - Fondo'),
('T23', 2, 'terraza_inferior', 'justicia', 200, 600, true, 'Terraza Justicia - Fondo'),
('T24', 2, 'terraza_inferior', 'justicia', 300, 600, true, 'Terraza Justicia - Fondo');

-- Insertar estados iniciales
INSERT INTO estados_mesa (mesa_id, estado)
SELECT id, 'libre'::estado_mesa_enum
FROM mesas;

-- Crear índices optimizados (sin funciones inmutables)
CREATE INDEX idx_mesas_zona_capacidad ON mesas(zona, capacidad);
CREATE INDEX idx_mesas_activa ON mesas(activa);
CREATE INDEX idx_estados_mesa_estado ON estados_mesa(estado);
CREATE INDEX idx_combinaciones_activas ON combinaciones_mesa(activa);

-- Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_mesa()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mesas_updated_at
  BEFORE UPDATE ON mesas
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_mesa();

CREATE TRIGGER trigger_estados_updated_at
  BEFORE UPDATE ON estados_mesa
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_mesa();
