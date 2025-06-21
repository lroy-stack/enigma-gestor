-- Migration: Sistema completo de notificaciones para Enigma GESTOR
-- Fecha: 2025-06-21

-- Crear tabla de tipos de notificaciones
CREATE TABLE IF NOT EXISTS notification_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'bell',
    color VARCHAR(7) DEFAULT '#237584',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL REFERENCES notification_types(code),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    actions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Referencias opcionales a otras entidades
    reserva_id UUID,
    cliente_id UUID,
    mesa_id UUID,
    personal_id UUID
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_type_code ON notifications(type_code);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_reserva_id ON notifications(reserva_id);
CREATE INDEX IF NOT EXISTS idx_notifications_cliente_id ON notifications(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notifications_mesa_id ON notifications(mesa_id);
CREATE INDEX IF NOT EXISTS idx_notifications_personal_id ON notifications(personal_id);

-- Trigger para actualizar updated_at en notification_types
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_types_updated_at 
    BEFORE UPDATE ON notification_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar tipos de notificaciones predefinidos
INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('reservation_new', 'Nueva Reserva', 'Nueva reserva creada en el sistema', 'calendar', '#237584'),
    ('reservation_confirmed', 'Reserva Confirmada', 'Reserva confirmada por el cliente', 'calendar-check', '#9FB289'),
    ('reservation_cancelled', 'Reserva Cancelada', 'Reserva cancelada por el cliente o restaurante', 'calendar-x', '#CB5910'),
    ('customer_arrived', 'Cliente Llegó', 'Cliente ha llegado al restaurante', 'user-check', '#9FB289'),
    ('customer_vip', 'Cliente VIP', 'Cliente VIP requiere atención especial', 'crown', '#CB5910'),
    ('table_available', 'Mesa Disponible', 'Mesa liberada y disponible', 'table', '#9FB289'),
    ('table_occupied', 'Mesa Ocupada', 'Mesa ocupada por clientes', 'table', '#237584'),
    ('system', 'Sistema', 'Notificación del sistema', 'settings', '#8E8E93'),
    ('backup', 'Respaldo', 'Respaldo de datos completado', 'shield', '#8E8E93'),
    ('alert', 'Alerta', 'Alerta general del sistema', 'alert-triangle', '#CB5910')
ON CONFLICT (code) DO NOTHING;

-- Función para crear notificaciones
CREATE OR REPLACE FUNCTION create_notification(
    p_type_code VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_priority VARCHAR DEFAULT 'normal',
    p_data JSONB DEFAULT '{}',
    p_actions TEXT[] DEFAULT '{}',
    p_reserva_id UUID DEFAULT NULL,
    p_cliente_id UUID DEFAULT NULL,
    p_mesa_id UUID DEFAULT NULL,
    p_personal_id UUID DEFAULT NULL,
    p_expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    expires_at_value TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular fecha de expiración si se especifica
    IF p_expires_hours IS NOT NULL THEN
        expires_at_value = NOW() + (p_expires_hours || ' hours')::INTERVAL;
    END IF;
    
    -- Insertar la notificación
    INSERT INTO notifications (
        type_code, title, message, priority, data, actions,
        reserva_id, cliente_id, mesa_id, personal_id, expires_at
    ) VALUES (
        p_type_code, p_title, p_message, p_priority, p_data, p_actions,
        p_reserva_id, p_cliente_id, p_mesa_id, p_personal_id, expires_at_value
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications 
    SET is_read = true, read_at = NOW() 
    WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar todas las notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS VOID AS $$
BEGIN
    UPDATE notifications 
    SET is_read = true, read_at = NOW() 
    WHERE is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar notificaciones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de notificaciones
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE(
    total_notifications BIGINT,
    unread_notifications BIGINT,
    high_priority_unread BIGINT,
    recent_notifications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM notifications) as total_notifications,
        (SELECT COUNT(*) FROM notifications WHERE is_read = false) as unread_notifications,
        (SELECT COUNT(*) FROM notifications WHERE is_read = false AND priority = 'high') as high_priority_unread,
        (SELECT COUNT(*) FROM notifications WHERE created_at > NOW() - INTERVAL '24 hours') as recent_notifications;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configurar Row Level Security (RLS)
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para notification_types
CREATE POLICY "notification_types_select_policy" ON notification_types
    FOR SELECT USING (true);

-- Políticas de acceso para notifications
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (true);

CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (true);

-- Insertar algunas notificaciones de ejemplo para testing
INSERT INTO notifications (type_code, title, message, priority, data) VALUES
    ('reservation_new', 'Nueva Reserva', 'Mesa para 4 personas mañana a las 20:30', 'high', '{"personas": 4, "hora": "20:30"}'),
    ('customer_vip', 'Cliente VIP Llegó', 'María García ha llegado - Mesa 12', 'high', '{"cliente_nombre": "María García", "mesa": "12"}'),
    ('table_available', 'Mesa Liberada', 'Mesa 8 disponible tras cancelación', 'normal', '{"mesa": "8"}'),
    ('system', 'Respaldo Completado', 'Copia de seguridad realizada correctamente', 'low', '{"backup_time": "2025-06-21 02:00:00"}');

-- Comentarios para documentación
COMMENT ON TABLE notification_types IS 'Tipos de notificaciones disponibles en el sistema';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema de gestión';
COMMENT ON FUNCTION create_notification IS 'Crear una nueva notificación en el sistema';
COMMENT ON FUNCTION mark_notification_as_read IS 'Marcar una notificación específica como leída';
COMMENT ON FUNCTION mark_all_notifications_as_read IS 'Marcar todas las notificaciones como leídas';
COMMENT ON FUNCTION cleanup_expired_notifications IS 'Limpiar notificaciones que han expirado';
COMMENT ON FUNCTION get_notification_stats IS 'Obtener estadísticas de notificaciones';