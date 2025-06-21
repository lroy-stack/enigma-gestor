-- Migration to extend the database schema for the complete restaurant management system
-- This migration adds all missing tables and features required by the application

-- =====================================================
-- 1. STAFF/PERSONNEL MANAGEMENT
-- =====================================================

-- Create personal (staff) table
CREATE TABLE IF NOT EXISTS personal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'manager', 'staff', 'host')),
    activo BOOLEAN DEFAULT true,
    avatar_url TEXT,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for personal
CREATE INDEX IF NOT EXISTS idx_personal_user_id ON personal(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_email ON personal(email);
CREATE INDEX IF NOT EXISTS idx_personal_rol ON personal(rol);

-- =====================================================
-- 2. EXTEND EXISTING TABLES
-- =====================================================

-- Add missing fields to contacts table to match clientes functionality
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS vip_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferencias_comida TEXT,
ADD COLUMN IF NOT EXISTS restricciones_dieteticas TEXT,
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS empresa VARCHAR(255),
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10),
ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100),
ADD COLUMN IF NOT EXISTS pais VARCHAR(100),
ADD COLUMN IF NOT EXISTS notas_internas TEXT,
ADD COLUMN IF NOT EXISTS fecha_ultima_visita DATE,
ADD COLUMN IF NOT EXISTS total_visitas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gasto_promedio DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gasto_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS calificacion_promedio DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS consentimiento_marketing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS idioma_preferido VARCHAR(10) DEFAULT 'es',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create clientes view for backward compatibility
CREATE OR REPLACE VIEW clientes AS
SELECT 
    id,
    name as nombre,
    last_name as apellido,
    email,
    phone as telefono,
    vip_status,
    preferencias_comida as preferencias,
    restricciones_dieteticas,
    fecha_nacimiento,
    empresa,
    direccion,
    codigo_postal,
    ciudad,
    pais,
    notas_internas,
    fecha_ultima_visita,
    total_visitas,
    gasto_promedio,
    gasto_total,
    calificacion_promedio,
    consentimiento_marketing,
    idioma_preferido,
    created_at as fecha_creacion,
    updated_at
FROM contacts;

-- Add missing fields to tables table to match mesas functionality
ALTER TABLE tables
ADD COLUMN IF NOT EXISTS tipo_mesa VARCHAR(50) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS zona VARCHAR(50),
ADD COLUMN IF NOT EXISTS ubicacion_descripcion TEXT,
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS es_combinable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notas TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create mesas view for backward compatibility
CREATE OR REPLACE VIEW mesas AS
SELECT 
    id,
    number as numero_mesa,
    capacity as capacidad,
    tipo_mesa,
    zona,
    ubicacion_descripcion,
    activa,
    x_position as position_x,
    y_position as position_y,
    es_combinable,
    notas,
    created_at,
    updated_at
FROM tables;

-- =====================================================
-- 3. CRM TABLES
-- =====================================================

-- Cliente tags
CREATE TABLE IF NOT EXISTS cliente_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_cliente_tags_cliente ON cliente_tags(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_tags_tag ON cliente_tags(tag);

-- Cliente notes
CREATE TABLE IF NOT EXISTS cliente_notas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    nota TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'general',
    es_importante BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_notas_cliente ON cliente_notas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_notas_tipo ON cliente_notas(tipo);

-- Cliente alerts
CREATE TABLE IF NOT EXISTS cliente_alertas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    severidad VARCHAR(20) DEFAULT 'media' CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
    activa BOOLEAN DEFAULT true,
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_cliente_alertas_cliente ON cliente_alertas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_alertas_activa ON cliente_alertas(activa);

-- Cliente interactions
CREATE TABLE IF NOT EXISTS cliente_interacciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tipo_interaccion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    resultado VARCHAR(50),
    fecha_interaccion TIMESTAMPTZ DEFAULT NOW(),
    personal_id UUID REFERENCES personal(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_interacciones_cliente ON cliente_interacciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_interacciones_fecha ON cliente_interacciones(fecha_interaccion);

-- =====================================================
-- 4. TABLE MANAGEMENT FEATURES
-- =====================================================

-- Table states
CREATE TABLE IF NOT EXISTS estados_mesa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mesa_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'mantenimiento', 'combinada')),
    fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
    cambiado_por UUID REFERENCES auth.users(id),
    notas TEXT
);

CREATE INDEX IF NOT EXISTS idx_estados_mesa_mesa ON estados_mesa(mesa_id);
CREATE INDEX IF NOT EXISTS idx_estados_mesa_estado ON estados_mesa(estado);

-- Table combinations
CREATE TABLE IF NOT EXISTS combinaciones_mesa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    mesas_ids UUID[] NOT NULL,
    capacidad_total INTEGER NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_combinaciones_activa ON combinaciones_mesa(activa);

-- Table availability
CREATE TABLE IF NOT EXISTS disponibilidad_mesas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mesa_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(50) DEFAULT 'disponible',
    reserva_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mesa_id, fecha, hora_inicio)
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_mesa_fecha ON disponibilidad_mesas(mesa_id, fecha);

-- =====================================================
-- 5. NOTIFICATION SYSTEM
-- =====================================================

-- Notification types
CREATE TABLE IF NOT EXISTS notification_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default notification types
INSERT INTO notification_types (name, description, icon, color) VALUES
('reservation_created', 'Nueva reserva creada', 'Calendar', '#10B981'),
('reservation_confirmed', 'Reserva confirmada', 'CheckCircle', '#10B981'),
('reservation_cancelled', 'Reserva cancelada', 'XCircle', '#EF4444'),
('table_available', 'Mesa disponible', 'Users', '#3B82F6'),
('customer_vip', 'Cliente VIP', 'Star', '#F59E0B'),
('staff_message', 'Mensaje del personal', 'MessageSquare', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES notification_types(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- 6. RESTAURANT CONFIGURATION
-- =====================================================

-- Restaurant configuration
CREATE TABLE IF NOT EXISTS configuracion_restaurante (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    descripcion TEXT,
    capacidad_total INTEGER,
    hora_apertura TIME,
    hora_cierre TIME,
    dias_operacion JSONB,
    configuracion_reservas JSONB,
    redes_sociales JSONB,
    politicas JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO configuracion_restaurante (
    nombre, 
    capacidad_total,
    hora_apertura,
    hora_cierre,
    dias_operacion,
    configuracion_reservas
) VALUES (
    'Enigma Cocina con Alma',
    100,
    '13:00',
    '23:00',
    '{"lunes": true, "martes": true, "miercoles": true, "jueves": true, "viernes": true, "sabado": true, "domingo": false}',
    '{"duracion_minima": 90, "duracion_maxima": 180, "anticipacion_maxima": 60, "tiempo_confirmacion": 24}'
) ON CONFLICT DO NOTHING;

-- Operating hours detail
CREATE TABLE IF NOT EXISTS horarios_operacion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    tipo_servicio VARCHAR(50) DEFAULT 'normal',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ANALYTICS TABLES AND VIEWS
-- =====================================================

-- Reservations daily metrics
CREATE TABLE IF NOT EXISTS reservas_metricas_diarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    total_reservas INTEGER DEFAULT 0,
    reservas_confirmadas INTEGER DEFAULT 0,
    reservas_canceladas INTEGER DEFAULT 0,
    reservas_no_show INTEGER DEFAULT 0,
    total_comensales INTEGER DEFAULT 0,
    tasa_ocupacion DECIMAL(5,2),
    ingreso_promedio DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metricas_diarias_fecha ON reservas_metricas_diarias(fecha);

-- Reservations hourly metrics
CREATE TABLE IF NOT EXISTS reservas_metricas_horarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    hora INTEGER NOT NULL CHECK (hora BETWEEN 0 AND 23),
    total_reservas INTEGER DEFAULT 0,
    total_comensales INTEGER DEFAULT 0,
    mesas_ocupadas INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fecha, hora)
);

CREATE INDEX IF NOT EXISTS idx_metricas_horarias_fecha ON reservas_metricas_horarias(fecha, hora);

-- Channel metrics
CREATE TABLE IF NOT EXISTS reservas_metricas_canales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    canal VARCHAR(50) NOT NULL,
    total_reservas INTEGER DEFAULT 0,
    tasa_conversion DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fecha, canal)
);

-- Zone statistics view
CREATE OR REPLACE VIEW vista_estadisticas_zonas AS
SELECT 
    t.zona,
    COUNT(DISTINCT t.id) as total_mesas,
    SUM(t.capacity) as capacidad_total,
    COUNT(DISTINCT CASE WHEN e.estado = 'ocupada' THEN t.id END) as mesas_ocupadas,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN e.estado = 'ocupada' THEN t.id END) / NULLIF(COUNT(DISTINCT t.id), 0), 2) as porcentaje_ocupacion
FROM tables t
LEFT JOIN LATERAL (
    SELECT estado 
    FROM estados_mesa 
    WHERE mesa_id = t.id 
    ORDER BY fecha_cambio DESC 
    LIMIT 1
) e ON true
WHERE t.zona IS NOT NULL
GROUP BY t.zona;

-- Customer analytics
CREATE TABLE IF NOT EXISTS cliente_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    mes DATE NOT NULL,
    visitas_mes INTEGER DEFAULT 0,
    gasto_mes DECIMAL(10,2) DEFAULT 0,
    reservas_canceladas INTEGER DEFAULT 0,
    puntuacion_promedio DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cliente_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_cliente_analytics ON cliente_analytics(cliente_id, mes);

-- =====================================================
-- 8. UPDATE RESERVATIONS STRUCTURE
-- =====================================================

-- Add missing fields to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS numero_comensales INTEGER,
ADD COLUMN IF NOT EXISTS origen_reserva VARCHAR(50) DEFAULT 'web',
ADD COLUMN IF NOT EXISTS notas_cliente TEXT,
ADD COLUMN IF NOT EXISTS notas_internas TEXT,
ADD COLUMN IF NOT EXISTS preferencias_mesa TEXT,
ADD COLUMN IF NOT EXISTS confirmada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create estado_reserva type if not exists
DO $$ BEGIN
    CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add estado column if not exists
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS estado_reserva estado_reserva DEFAULT 'pendiente';

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_interacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE combinaciones_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_restaurante ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your security requirements)
CREATE POLICY "Enable read access for authenticated users" ON personal FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON personal FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON personal FOR UPDATE TO authenticated USING (true);

-- Similar policies for other tables...
CREATE POLICY "Enable all access for authenticated users" ON cliente_tags TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON cliente_notas TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON cliente_alertas TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON cliente_interacciones TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON estados_mesa TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON combinaciones_mesa TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON disponibilidad_mesas TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON notification_types TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON configuracion_restaurante TO authenticated USING (true);

-- User can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to check table availability
CREATE OR REPLACE FUNCTION verificar_disponibilidad_mesa(
    p_mesa_id UUID,
    p_fecha DATE,
    p_hora TIME,
    p_duracion INTEGER DEFAULT 120
) RETURNS BOOLEAN AS $$
DECLARE
    v_disponible BOOLEAN := true;
BEGIN
    -- Check if table is available at the given time
    SELECT NOT EXISTS (
        SELECT 1 
        FROM disponibilidad_mesas 
        WHERE mesa_id = p_mesa_id 
        AND fecha = p_fecha
        AND (
            (hora_inicio <= p_hora AND hora_fin > p_hora) OR
            (hora_inicio < (p_hora + (p_duracion || ' minutes')::INTERVAL) AND hora_fin > p_hora)
        )
        AND estado != 'disponible'
    ) INTO v_disponible;
    
    RETURN v_disponible;
END;
$$ LANGUAGE plpgsql;

-- Function to update table state
CREATE OR REPLACE FUNCTION actualizar_estado_mesa(
    p_mesa_id UUID,
    p_estado VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_notas TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO estados_mesa (mesa_id, estado, cambiado_por, notas)
    VALUES (p_mesa_id, p_estado, p_user_id, p_notas);
END;
$$ LANGUAGE plpgsql;

-- Function to suggest tables for reservation
CREATE OR REPLACE FUNCTION sugerir_mesas_para_reserva(
    p_personas INTEGER,
    p_fecha DATE,
    p_hora TIME,
    p_zona VARCHAR(50) DEFAULT NULL
) RETURNS TABLE (
    mesa_id UUID,
    numero_mesa INTEGER,
    capacidad INTEGER,
    zona VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as mesa_id,
        t.number as numero_mesa,
        t.capacity as capacidad,
        t.zona
    FROM tables t
    WHERE t.capacity >= p_personas
    AND t.activa = true
    AND (p_zona IS NULL OR t.zona = p_zona)
    AND verificar_disponibilidad_mesa(t.id, p_fecha, p_hora)
    ORDER BY t.capacity ASC, t.number ASC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_personal_updated_at BEFORE UPDATE ON personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample staff members
INSERT INTO personal (nombre, apellido, email, rol) VALUES
('Admin', 'Sistema', 'admin@enigma.com', 'admin'),
('Maria', 'García', 'maria.garcia@enigma.com', 'manager'),
('Carlos', 'López', 'carlos.lopez@enigma.com', 'host'),
('Ana', 'Martínez', 'ana.martinez@enigma.com', 'staff')
ON CONFLICT DO NOTHING;

-- Insert sample table zones
UPDATE tables SET zona = CASE 
    WHEN number <= 4 THEN 'terraza'
    WHEN number <= 8 THEN 'ventana'
    WHEN number <= 12 THEN 'principal'
    ELSE 'bar'
END WHERE zona IS NULL;

COMMENT ON MIGRATION '20250118_extend_schema_for_management_system' IS 'Extends the basic schema to support the complete restaurant management system features';