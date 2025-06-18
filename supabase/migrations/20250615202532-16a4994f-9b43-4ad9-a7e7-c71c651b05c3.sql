
-- Configuración inicial del esquema de base de datos para Enigma Cocina con Alma

-- 1. Tabla de configuración del restaurante
CREATE TABLE public.restaurante_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_restaurante TEXT NOT NULL DEFAULT 'Enigma Cocina con Alma',
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email_reservas TEXT NOT NULL,
    capacidad_maxima INTEGER NOT NULL DEFAULT 170,
    duracion_reserva_default_minutos INTEGER NOT NULL DEFAULT 120,
    auto_aceptar_reservas BOOLEAN DEFAULT false,
    politica_cancelacion TEXT,
    mensaje_bienvenida_email TEXT,
    mensaje_confirmacion_whatsapp TEXT,
    horarios_operacion JSONB
);

-- 2. Tabla de personal del restaurante
CREATE TABLE public.personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'manager', 'staff', 'host')),
    activo BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de clientes
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT UNIQUE NOT NULL,
    idioma_preferido TEXT DEFAULT 'es',
    historial_reservas_ids UUID[],
    preferencias_dieteticas TEXT[],
    notas_privadas TEXT,
    vip_status BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    ultima_visita TIMESTAMPTZ
);

-- 4. Tabla de mesas
CREATE TABLE public.mesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_mesa TEXT UNIQUE NOT NULL,
    capacidad INTEGER NOT NULL,
    tipo_mesa TEXT NOT NULL CHECK (tipo_mesa IN ('estandar', 'ventana', 'terraza_superior', 'terraza_inferior', 'barra')),
    ubicacion_descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    es_combinable_con UUID[],
    notas_mesa TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0
);

-- 5. Tabla de reservas
CREATE TABLE public.reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    numero_comensales INTEGER NOT NULL,
    mesa_id UUID REFERENCES public.mesas(id),
    estado_reserva TEXT NOT NULL DEFAULT 'pendiente_confirmacion' CHECK (estado_reserva IN ('pendiente_confirmacion', 'confirmada', 'cancelada_usuario', 'cancelada_restaurante', 'completada', 'no_show')),
    origen_reserva TEXT NOT NULL CHECK (origen_reserva IN ('web', 'chatbot', 'whatsapp', 'telefono', 'en_persona')),
    notas_cliente TEXT,
    notas_restaurante TEXT,
    enigmito_log_id UUID,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    fecha_modificacion TIMESTAMPTZ,
    asignada_por UUID REFERENCES public.personal(id)
);

-- 6. Tabla de disponibilidad de mesas
CREATE TABLE public.disponibilidad_mesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    mesa_id UUID REFERENCES public.mesas(id) NOT NULL,
    franja_horaria_inicio TIME NOT NULL,
    franja_horaria_fin TIME NOT NULL,
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservada', 'bloqueada')),
    reserva_id UUID REFERENCES public.reservas(id)
);

-- 7. Tabla de horarios de operación detallados
CREATE TABLE public.horarios_operacion_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    tipo_servicio TEXT NOT NULL CHECK (tipo_servicio IN ('almuerzo', 'cena', 'continuo')),
    activo BOOLEAN DEFAULT true,
    notas TEXT
);

-- 8. Tabla de logs de Enigmito (IA)
CREATE TABLE public.enigmito_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id_procesada UUID REFERENCES public.reservas(id),
    timestamp TIMESTAMPTZ DEFAULT now(),
    prompt_entrada TEXT NOT NULL,
    respuesta_ia TEXT NOT NULL,
    confianza_ia FLOAT CHECK (confianza_ia >= 0 AND confianza_ia <= 1),
    accion_tomada TEXT NOT NULL,
    errores_detectados TEXT
);

-- 9. Tabla de plantillas de notificaciones
CREATE TABLE public.notificaciones_plantillas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_plantilla TEXT UNIQUE NOT NULL,
    canal TEXT NOT NULL CHECK (canal IN ('email', 'whatsapp', 'sms')),
    idioma TEXT NOT NULL DEFAULT 'es',
    asunto TEXT,
    cuerpo TEXT NOT NULL,
    variables_disponibles TEXT[]
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_reservas_fecha_hora ON public.reservas(fecha_reserva, hora_reserva);
CREATE INDEX idx_reservas_cliente ON public.reservas(cliente_id);
CREATE INDEX idx_reservas_mesa ON public.reservas(mesa_id);
CREATE INDEX idx_reservas_estado ON public.reservas(estado_reserva);
CREATE INDEX idx_disponibilidad_fecha_mesa ON public.disponibilidad_mesas(fecha, mesa_id);
CREATE INDEX idx_personal_user_id ON public.personal(user_id);
CREATE INDEX idx_clientes_email ON public.clientes(email);
CREATE INDEX idx_clientes_telefono ON public.clientes(telefono);

-- Insertar configuración inicial del restaurante
INSERT INTO public.restaurante_config (
    nombre_restaurante,
    direccion,
    telefono,
    email_reservas,
    capacidad_maxima,
    duracion_reserva_default_minutos,
    auto_aceptar_reservas,
    politica_cancelacion,
    mensaje_bienvenida_email,
    mensaje_confirmacion_whatsapp,
    horarios_operacion
) VALUES (
    'Enigma Cocina con Alma',
    'España',
    '+34 XXX XXX XXX',
    'reservas@enigmaconalma.com',
    170,
    120,
    false,
    'Cancelaciones gratuitas hasta 24h antes. Cancelaciones tardías pueden incurrir en penalización.',
    '¡Bienvenido a Enigma Cocina con Alma! Gracias por elegirnos para tu experiencia gastronómica.',
    'Hola {nombre}, tu reserva en Enigma Cocina con Alma está confirmada para el {fecha} a las {hora}. ¡Te esperamos!',
    '{
        "lunes": {"cerrado": true},
        "martes": {"apertura": "18:30", "cierre": "23:00"},
        "miercoles": [
            {"apertura": "13:00", "cierre": "16:00", "servicio": "almuerzo"},
            {"apertura": "18:00", "cierre": "23:00", "servicio": "cena"}
        ],
        "jueves": [
            {"apertura": "13:00", "cierre": "16:00", "servicio": "almuerzo"},
            {"apertura": "18:00", "cierre": "23:00", "servicio": "cena"}
        ],
        "viernes": [
            {"apertura": "13:00", "cierre": "16:00", "servicio": "almuerzo"},
            {"apertura": "18:00", "cierre": "23:00", "servicio": "cena"}
        ],
        "sabado": [
            {"apertura": "13:00", "cierre": "16:00", "servicio": "almuerzo"},
            {"apertura": "18:00", "cierre": "23:00", "servicio": "cena"}
        ],
        "domingo": [
            {"apertura": "13:00", "cierre": "16:00", "servicio": "almuerzo"},
            {"apertura": "18:00", "cierre": "23:00", "servicio": "cena"}
        ]
    }'::jsonb
);

-- Insertar horarios de operación detallados
INSERT INTO public.horarios_operacion_detalle (dia_semana, hora_apertura, hora_cierre, tipo_servicio, activo) VALUES
(1, '00:00', '00:00', 'continuo', false), -- Lunes cerrado
(2, '18:30', '23:00', 'cena', true), -- Martes
(3, '13:00', '16:00', 'almuerzo', true), -- Miércoles almuerzo
(3, '18:00', '23:00', 'cena', true), -- Miércoles cena
(4, '13:00', '16:00', 'almuerzo', true), -- Jueves almuerzo
(4, '18:00', '23:00', 'cena', true), -- Jueves cena
(5, '13:00', '16:00', 'almuerzo', true), -- Viernes almuerzo
(5, '18:00', '23:00', 'cena', true), -- Viernes cena
(6, '13:00', '16:00', 'almuerzo', true), -- Sábado almuerzo
(6, '18:00', '23:00', 'cena', true), -- Sábado cena
(0, '13:00', '16:00', 'almuerzo', true), -- Domingo almuerzo
(0, '18:00', '23:00', 'cena', true); -- Domingo cena

-- Insertar mesas de ejemplo basadas en la capacidad real de Enigma
INSERT INTO public.mesas (numero_mesa, capacidad, tipo_mesa, ubicacion_descripcion, activa) VALUES
-- Sala Principal (60 personas) - Mesas de 2 y 4 personas
('S1', 2, 'estandar', 'Sala principal - Mesa junto a la entrada', true),
('S2', 2, 'estandar', 'Sala principal - Mesa central', true),
('S3', 4, 'estandar', 'Sala principal - Mesa para familia', true),
('S4', 4, 'estandar', 'Sala principal - Mesa central', true),
('S5', 6, 'estandar', 'Sala principal - Mesa grande', true),
('S6', 2, 'ventana', 'Sala principal - Mesa junto a ventana', true),
('S7', 2, 'ventana', 'Sala principal - Mesa con vista', true),
('S8', 4, 'ventana', 'Sala principal - Mesa panorámica', true),
-- Terraza Superior (60 personas)
('TS1', 2, 'terraza_superior', 'Terraza superior - Mesa íntima', true),
('TS2', 4, 'terraza_superior', 'Terraza superior - Mesa familiar', true),
('TS3', 4, 'terraza_superior', 'Terraza superior - Mesa con vista', true),
('TS4', 6, 'terraza_superior', 'Terraza superior - Mesa grande', true),
('TS5', 2, 'terraza_superior', 'Terraza superior - Mesa romántica', true),
('TS6', 4, 'terraza_superior', 'Terraza superior - Mesa central', true),
-- Terraza Inferior (50 personas) - Solo junio-octubre
('TI1', 2, 'terraza_inferior', 'Terraza inferior - Mesa estacional', true),
('TI2', 4, 'terraza_inferior', 'Terraza inferior - Mesa al aire libre', true),
('TI3', 6, 'terraza_inferior', 'Terraza inferior - Mesa grande', true),
('TI4', 4, 'terraza_inferior', 'Terraza inferior - Mesa familiar', true),
-- Área de Barra
('B1', 1, 'barra', 'Barra - Asiento individual', true),
('B2', 1, 'barra', 'Barra - Asiento individual', true),
('B3', 2, 'barra', 'Barra - Asientos juntos', true),
('B4', 2, 'barra', 'Barra - Asientos de esquina', true);

-- Insertar plantillas de notificación básicas
INSERT INTO public.notificaciones_plantillas (nombre_plantilla, canal, idioma, asunto, cuerpo, variables_disponibles) VALUES
('confirmacion_reserva_email', 'email', 'es', 'Confirmación de Reserva - Enigma Cocina con Alma', 
 'Estimado/a {nombre_cliente},\n\nTu reserva ha sido confirmada:\n- Fecha: {fecha_reserva}\n- Hora: {hora_reserva}\n- Comensales: {numero_comensales}\n- Mesa: {numero_mesa}\n\n¡Te esperamos en Enigma Cocina con Alma!\n\nSaludos cordiales,\nEl equipo de Enigma', 
 ARRAY['nombre_cliente', 'fecha_reserva', 'hora_reserva', 'numero_comensales', 'numero_mesa']),
('confirmacion_reserva_whatsapp', 'whatsapp', 'es', NULL, 
 'Hola {nombre_cliente}! 👋\n\nTu reserva está confirmada:\n📅 {fecha_reserva}\n🕐 {hora_reserva}\n👥 {numero_comensales} personas\n🪑 Mesa {numero_mesa}\n\n¡Te esperamos en Enigma Cocina con Alma! 🍽️', 
 ARRAY['nombre_cliente', 'fecha_reserva', 'hora_reserva', 'numero_comensales', 'numero_mesa']),
('recordatorio_24h_whatsapp', 'whatsapp', 'es', NULL, 
 'Hola {nombre_cliente}! 👋\n\nTe recordamos tu reserva para mañana:\n📅 {fecha_reserva}\n🕐 {hora_reserva}\n👥 {numero_comensales} personas\n\n¡Te esperamos en Enigma Cocina con Alma! 🍽️', 
 ARRAY['nombre_cliente', 'fecha_reserva', 'hora_reserva', 'numero_comensales']);

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE public.restaurante_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidad_mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_operacion_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enigmito_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_plantillas ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT rol 
    FROM public.personal 
    WHERE user_id = auth.uid() AND activo = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas RLS para la tabla personal
CREATE POLICY "Los usuarios pueden ver su propia información" ON public.personal
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins y managers pueden ver todo el personal" ON public.personal
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Los usuarios pueden actualizar su propia información" ON public.personal
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Solo admins pueden insertar nuevo personal" ON public.personal
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- Políticas RLS para la tabla clientes
CREATE POLICY "Personal autenticado puede ver clientes" ON public.clientes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Personal autenticado puede gestionar clientes" ON public.clientes
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas RLS para la tabla reservas
CREATE POLICY "Personal autenticado puede ver todas las reservas" ON public.reservas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Personal autenticado puede gestionar reservas" ON public.reservas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas RLS para la tabla mesas
CREATE POLICY "Personal autenticado puede ver mesas" ON public.mesas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins y managers pueden gestionar mesas" ON public.mesas
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Políticas RLS para configuración del restaurante
CREATE POLICY "Personal autenticado puede ver configuración" ON public.restaurante_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden modificar configuración" ON public.restaurante_config
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para otras tablas (solo personal autenticado)
CREATE POLICY "Personal autenticado acceso completo" ON public.disponibilidad_mesas
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Personal autenticado acceso completo" ON public.horarios_operacion_detalle
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Personal autenticado acceso completo" ON public.enigmito_logs
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Personal autenticado acceso completo" ON public.notificaciones_plantillas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Función: verificar_disponibilidad_mesa
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad_mesa(
  p_fecha DATE,
  p_hora_inicio TIME,
  p_num_comensales INTEGER,
  p_duracion_minutos INTEGER DEFAULT 120
)
RETURNS TABLE (
  id UUID,
  numero_mesa TEXT,
  capacidad INTEGER
) AS $$
DECLARE
  p_hora_fin TIME;
BEGIN
  -- Calcular hora de fin
  p_hora_fin := p_hora_inicio + (p_duracion_minutos || ' minutes')::INTERVAL;
  
  RETURN QUERY
  SELECT m.id, m.numero_mesa, m.capacidad
  FROM public.mesas m
  WHERE m.activa = true
    AND m.capacidad >= p_num_comensales
    AND NOT EXISTS (
      SELECT 1 
      FROM public.reservas r
      WHERE r.mesa_id = m.id
        AND r.fecha_reserva = p_fecha
        AND r.estado_reserva IN ('confirmada', 'pendiente_confirmacion')
        AND (
          (r.hora_reserva, r.hora_reserva + INTERVAL '120 minutes') OVERLAPS 
          (p_hora_inicio, p_hora_fin)
        )
    )
  ORDER BY m.capacidad ASC, m.numero_mesa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: registrar_cliente_si_no_existe
CREATE OR REPLACE FUNCTION public.registrar_cliente_si_no_existe(
  p_nombre TEXT,
  p_apellido TEXT,
  p_email TEXT,
  p_telefono TEXT
)
RETURNS UUID AS $$
DECLARE
  cliente_id UUID;
BEGIN
  -- Intentar encontrar cliente existente por email o teléfono
  SELECT id INTO cliente_id
  FROM public.clientes
  WHERE email = p_email OR telefono = p_telefono
  LIMIT 1;
  
  -- Si no existe, crear nuevo cliente
  IF cliente_id IS NULL THEN
    INSERT INTO public.clientes (nombre, apellido, email, telefono)
    VALUES (p_nombre, p_apellido, p_email, p_telefono)
    RETURNING id INTO cliente_id;
  END IF;
  
  RETURN cliente_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar fecha_modificacion en reservas
CREATE OR REPLACE FUNCTION public.update_modified_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_modificacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservas_modified_time
  BEFORE UPDATE ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_time();
