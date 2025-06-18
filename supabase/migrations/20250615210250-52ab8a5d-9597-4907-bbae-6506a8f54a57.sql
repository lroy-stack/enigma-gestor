
-- Actualizar la base de datos para el sistema de mesas interactivo

-- Primero, limpiar las mesas existentes para reemplazarlas con las nuevas
DELETE FROM public.mesas;

-- Insertar las nuevas mesas con posiciones exactas
-- Terraza Campanar (arriba)
INSERT INTO public.mesas (numero_mesa, capacidad, tipo_mesa, ubicacion_descripcion, activa, position_x, position_y, notas_mesa) VALUES
-- Fila superior - mesas de 2 personas
('T1', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 40, 80, 'Mesa 2 personas'),
('T2', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 110, 80, 'Mesa 2 personas'),
('T3', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 180, 80, 'Mesa 2 personas'),
('T4', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 250, 80, 'Mesa 2 personas'),
('T5', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 320, 80, 'Mesa 2 personas'),
('T6', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 390, 80, 'Mesa 2 personas'),
('T7', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 460, 80, 'Mesa 2 personas'),
('T8', 2, 'terraza_superior', 'Terraza Campanar - Fila superior', true, 530, 80, 'Mesa 2 personas'),
-- Fila inferior - mezcla de 2 y 4 personas
('T9', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 600, 80, 'Mesa 4 personas'),
('T10', 2, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 690, 80, 'Mesa 2 personas'),
('T11', 2, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 760, 80, 'Mesa 2 personas'),
('T12', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 830, 80, 'Mesa 4 personas'),
('T13', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 920, 80, 'Mesa 4 personas'),
('T14', 4, 'terraza_superior', 'Terraza Campanar - Fila inferior', true, 1010, 80, 'Mesa 4 personas'),

-- Terraza Justicia (abajo)
-- Mesas de 4 personas
('T20', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 40, 80, 'Mesa 4 personas'),
('T21', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 150, 80, 'Mesa 4 personas'),
('T22', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 260, 80, 'Mesa 4 personas'),
('T23', 4, 'terraza_inferior', 'Terraza Justicia - Zona principal', true, 370, 80, 'Mesa 4 personas'),
-- Mesas de 2 personas
('T24', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 500, 80, 'Mesa 2 personas'),
('T25', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 570, 80, 'Mesa 2 personas'),
('T26', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 640, 80, 'Mesa 2 personas'),
('T27', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 710, 80, 'Mesa 2 personas'),
('T28', 2, 'terraza_inferior', 'Terraza Justicia - Zona lateral', true, 780, 80, 'Mesa 2 personas'),

-- Sala Interior
('M1', 2, 'estandar', 'Sala Interior - Zona lateral', true, 60, 280, 'Mesa 2 personas'),
('M2', 4, 'estandar', 'Sala Interior - Zona central', true, 60, 140, 'Mesa combinable 2p + 2p'),
('M3', 2, 'estandar', 'Sala Interior - Zona frontal', true, 60, 80, 'Mesa 2 personas'),
('M4', 4, 'estandar', 'Sala Interior - Zona central', true, 200, 80, 'Mesa 4 personas'),
('M5', 4, 'estandar', 'Sala Interior - Zona central', true, 340, 80, 'Mesa combinable 2p + 2p'),
('M6', 4, 'estandar', 'Sala Interior - Zona central', true, 420, 80, 'Mesa combinable 2p + 2p'),
('M7', 2, 'estandar', 'Sala Interior - Zona media', true, 200, 180, 'Mesa 2 personas'),
('M8', 2, 'estandar', 'Sala Interior - Zona media', true, 340, 180, 'Mesa 2 personas'),
('M10', 4, 'estandar', 'Sala Interior - Zona posterior', true, 300, 260, 'Mesa grande horizontal');

-- Crear tabla para gestionar combinaciones de mesas
CREATE TABLE IF NOT EXISTS public.mesa_combinaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_combinacion TEXT NOT NULL,
    mesa_principal_id UUID REFERENCES public.mesas(id) NOT NULL,
    mesas_combinadas UUID[] NOT NULL,
    capacidad_total INTEGER NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla para estados de mesa en tiempo real
CREATE TABLE IF NOT EXISTS public.mesa_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id UUID REFERENCES public.mesas(id) NOT NULL,
    estado TEXT NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre', 'ocupada', 'reservada', 'limpieza', 'fuera_servicio')),
    reserva_id UUID REFERENCES public.reservas(id),
    tiempo_ocupacion TIMESTAMPTZ,
    tiempo_estimado_liberacion TIMESTAMPTZ,
    notas_estado TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(mesa_id)
);

-- Insertar estados iniciales para todas las mesas
INSERT INTO public.mesa_estados (mesa_id, estado)
SELECT id, 'libre' FROM public.mesas;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.mesa_combinaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesa_estados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mesa_combinaciones
CREATE POLICY "Personal autenticado acceso completo combinaciones" ON public.mesa_combinaciones
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas RLS para mesa_estados
CREATE POLICY "Personal autenticado acceso completo estados" ON public.mesa_estados
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Función para actualizar el estado de una mesa
CREATE OR REPLACE FUNCTION public.actualizar_estado_mesa(
  p_mesa_id UUID,
  p_nuevo_estado TEXT,
  p_reserva_id UUID DEFAULT NULL,
  p_tiempo_estimado_liberacion TIMESTAMPTZ DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.mesa_estados 
  SET 
    estado = p_nuevo_estado,
    reserva_id = p_reserva_id,
    tiempo_estimado_liberacion = p_tiempo_estimado_liberacion,
    notas_estado = p_notas,
    updated_at = now()
  WHERE mesa_id = p_mesa_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener mesas disponibles para combinación
CREATE OR REPLACE FUNCTION public.obtener_mesas_combinables(p_mesa_id UUID)
RETURNS TABLE (
  id UUID,
  numero_mesa TEXT,
  capacidad INTEGER,
  position_x INTEGER,
  position_y INTEGER,
  distancia FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.numero_mesa,
    m.capacidad,
    m.position_x,
    m.position_y,
    SQRT(POW(m.position_x - base.position_x, 2) + POW(m.position_y - base.position_y, 2)) as distancia
  FROM public.mesas m
  CROSS JOIN (SELECT position_x, position_y, tipo_mesa FROM public.mesas WHERE id = p_mesa_id) base
  JOIN public.mesa_estados me ON m.id = me.mesa_id
  WHERE m.id != p_mesa_id
    AND m.activa = true
    AND me.estado = 'libre'
    AND m.tipo_mesa = base.tipo_mesa
    AND SQRT(POW(m.position_x - base.position_x, 2) + POW(m.position_y - base.position_y, 2)) <= 100
  ORDER BY distancia ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
