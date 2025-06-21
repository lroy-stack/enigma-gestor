-- Migration: Agregar todos los tipos de notificación comprehensivos
-- Fecha: 2025-06-21

-- Insertar tipos de notificaciones para reservas
INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('reservation_modified', 'Reserva Modificada', 'Reserva ha sido modificada', 'edit', '#CB5910'),
    ('reservation_no_show', 'No Show', 'Cliente no se presentó a su reserva', 'user-x', '#CB5910'),
    ('reservation_upcoming', 'Reserva Próxima', 'Recordatorio de reserva próxima', 'clock', '#237584'),
    ('reservation_delay', 'Retraso de Reserva', 'Cliente llega tarde a su reserva', 'alert-circle', '#CB5910'),
    ('table_assigned', 'Mesa Asignada', 'Mesa asignada a reserva', 'map-pin', '#9FB289'),
    ('table_unavailable', 'Mesa No Disponible', 'No hay mesa disponible para reserva', 'x-circle', '#CB5910'),
    ('capacity_full', 'Capacidad Completa', 'Restaurante a capacidad máxima', 'users', '#CB5910')

-- Insertar tipos para clientes
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('customer_new', 'Cliente Nuevo', 'Primera visita de cliente', 'user-plus', '#9FB289'),
    ('customer_birthday', 'Cumpleaños Cliente', 'Cliente cumple años', 'cake', '#CB5910'),
    ('customer_anniversary', 'Aniversario Cliente', 'Aniversario de cliente', 'heart', '#CB5910'),
    ('customer_complaint', 'Queja de Cliente', 'Cliente ha presentado una queja', 'frown', '#CB5910'),
    ('customer_compliment', 'Elogio de Cliente', 'Cliente ha dado un elogio', 'smile', '#9FB289'),
    ('customer_inactive', 'Cliente Inactivo', 'Cliente no ha visitado recientemente', 'user-minus', '#8E8E93'),
    ('customer_alert', 'Alerta de Cliente', 'Cliente con alerta activa', 'alert-triangle', '#CB5910'),
    ('customer_dietary', 'Restricciones Dietéticas', 'Cliente con restricciones especiales', 'utensils', '#CB5910')

-- Insertar tipos para mesas
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('table_cleaning', 'Mesa Requiere Limpieza', 'Mesa necesita ser limpiada', 'spray-can', '#8E8E93'),
    ('table_out_of_service', 'Mesa Fuera de Servicio', 'Mesa no disponible temporalmente', 'tool', '#CB5910'),
    ('table_time_warning', 'Advertencia de Tiempo', 'Mesa cerca del límite de tiempo', 'clock', '#CB5910'),
    ('table_time_exceeded', 'Tiempo Excedido', 'Mesa ha excedido tiempo asignado', 'timer', '#CB5910'),
    ('table_combination_created', 'Combinación Creada', 'Mesas combinadas para grupo grande', 'link', '#9FB289'),
    ('table_combination_dissolved', 'Combinación Disuelta', 'Combinación de mesas terminada', 'unlink', '#8E8E93')

-- Insertar tipos para configuración
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('config_hours_changed', 'Horarios Modificados', 'Horarios de operación cambiados', 'clock', '#237584'),
    ('config_capacity_changed', 'Capacidad Modificada', 'Capacidad del restaurante modificada', 'users', '#237584'),
    ('config_policy_changed', 'Política Cambiada', 'Política de cancelación modificada', 'file-text', '#237584'),
    ('config_menu_updated', 'Menú Actualizado', 'Menú ha sido actualizado', 'menu', '#237584')

-- Insertar tipos para personal
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('staff_new', 'Nuevo Personal', 'Nuevo miembro del personal agregado', 'user-plus', '#9FB289'),
    ('staff_role_changed', 'Rol Cambiado', 'Rol de personal modificado', 'user-check', '#237584'),
    ('staff_deactivated', 'Personal Desactivado', 'Miembro del personal desactivado', 'user-x', '#CB5910'),
    ('staff_recognition', 'Reconocimiento', 'Personal ha recibido reconocimiento', 'award', '#9FB289')

-- Insertar tipos para sistema
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('system_capacity_critical', 'Capacidad Crítica', 'Sistema cerca del límite de capacidad', 'server', '#CB5910'),
    ('system_integration_failed', 'Integración Fallida', 'Fallo en integración externa', 'wifi-off', '#CB5910'),
    ('system_daily_report', 'Reporte Diario', 'Reporte diario generado', 'bar-chart', '#8E8E93'),
    ('system_goal_achieved', 'Meta Alcanzada', 'Objetivo de ocupación alcanzado', 'target', '#9FB289'),
    ('emergency_evacuation', 'Evacuación de Emergencia', 'Evacuación requerida inmediatamente', 'alert-triangle', '#CB5910'),
    ('special_event_activated', 'Evento Especial', 'Modo de evento especial activado', 'star', '#CB5910'),
    ('wait_time_exceeded', 'Tiempo de Espera Excesivo', 'Clientes esperando demasiado tiempo', 'clock', '#CB5910'),
    ('satisfaction_low', 'Satisfacción Baja', 'Señales de baja satisfacción detectadas', 'frown', '#CB5910')

-- Insertar tipos para integraciones
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_types (code, name, description, icon_name, color) VALUES
    ('ai_processing', 'Procesamiento IA', 'Enigmito IA procesando solicitud', 'brain', '#237584'),
    ('webhook_received', 'Webhook Recibido', 'Actualización de plataforma externa', 'globe', '#8E8E93')

ON CONFLICT (code) DO NOTHING;

-- Crear función para obtener tipos de notificación por categoría
CREATE OR REPLACE FUNCTION get_notification_types_by_category()
RETURNS TABLE(
    category VARCHAR,
    types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN code LIKE 'reservation_%' THEN 'reservas'
            WHEN code LIKE 'customer_%' THEN 'clientes'
            WHEN code LIKE 'table_%' THEN 'mesas'
            WHEN code LIKE 'config_%' THEN 'configuracion'
            WHEN code LIKE 'staff_%' THEN 'personal'
            WHEN code LIKE 'system_%' OR code IN ('emergency_evacuation', 'special_event_activated', 'wait_time_exceeded', 'satisfaction_low') THEN 'sistema'
            WHEN code IN ('ai_processing', 'webhook_received') THEN 'integraciones'
            ELSE 'otros'
        END as category,
        json_agg(
            json_build_object(
                'code', code,
                'name', name,
                'description', description,
                'icon_name', icon_name,
                'color', color
            )
        ) as types
    FROM notification_types 
    WHERE is_active = true
    GROUP BY category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON FUNCTION get_notification_types_by_category IS 'Obtener tipos de notificación organizados por categoría';