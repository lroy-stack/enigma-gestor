-- Migration: Triggers automáticos para notificaciones de reservas
-- Fecha: 2025-06-21

-- Función para crear notificación automática cuando se inserta una nueva reserva
CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear notificación automática para nueva reserva
    INSERT INTO notifications (
        type_code,
        title,
        message,
        priority,
        data,
        actions,
        reserva_id,
        created_at
    ) VALUES (
        'reservation_new',
        'Nueva Reserva Recibida',
        CASE 
            WHEN NEW.estado = 'confirmada' THEN 
                NEW.nombre || ' - ' || NEW.personas || ' personas - ' || 
                to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' a las ' || NEW.hora_reserva || ' (CONFIRMADA)'
            ELSE 
                NEW.nombre || ' - ' || NEW.personas || ' personas - ' || 
                to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' a las ' || NEW.hora_reserva || ' (Pendiente confirmación)'
        END,
        CASE 
            WHEN NEW.estado = 'confirmada' THEN 'normal'
            ELSE 'high'
        END,
        jsonb_build_object(
            'cliente_nombre', NEW.nombre,
            'cliente_email', NEW.email,
            'cliente_telefono', NEW.telefono,
            'fecha_reserva', NEW.fecha_reserva,
            'hora_reserva', NEW.hora_reserva,
            'personas', NEW.personas,
            'estado', NEW.estado,
            'ocasion', NEW.ocasion,
            'preferencia_mesa', NEW.preferencia_mesa,
            'requisitos_dieteticos', NEW.requisitos_dieteticos,
            'primera_visita', NEW.primera_visita,
            'source', 'database_trigger'
        ),
        ARRAY['Ver detalles', 'Contactar cliente', 'Confirmar'],
        NEW.id,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificación cuando se actualiza el estado de una reserva
CREATE OR REPLACE FUNCTION notify_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo notificar si cambió el estado
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO notifications (
            type_code,
            title,
            message,
            priority,
            data,
            actions,
            reserva_id,
            created_at
        ) VALUES (
            CASE NEW.estado
                WHEN 'confirmada' THEN 'reservation_confirmed'
                WHEN 'cancelada' THEN 'reservation_cancelled'
                WHEN 'completada' THEN 'reservation_completed'
                WHEN 'no_show' THEN 'reservation_no_show'
                ELSE 'reservation_modified'
            END,
            CASE NEW.estado
                WHEN 'confirmada' THEN 'Reserva Confirmada'
                WHEN 'cancelada' THEN 'Reserva Cancelada'
                WHEN 'completada' THEN 'Reserva Completada'
                WHEN 'no_show' THEN 'Cliente No Show'
                ELSE 'Reserva Modificada'
            END,
            NEW.nombre || ' - ' || 
            to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva ||
            CASE NEW.estado
                WHEN 'confirmada' THEN ' ha sido confirmada'
                WHEN 'cancelada' THEN ' ha sido cancelada'
                WHEN 'completada' THEN ' ha sido completada'
                WHEN 'no_show' THEN ' - Cliente no se presentó'
                ELSE ' ha sido modificada'
            END,
            CASE NEW.estado
                WHEN 'no_show' THEN 'high'
                WHEN 'cancelada' THEN 'normal'
                ELSE 'normal'
            END,
            jsonb_build_object(
                'cliente_nombre', NEW.nombre,
                'fecha_reserva', NEW.fecha_reserva,
                'hora_reserva', NEW.hora_reserva,
                'personas', NEW.personas,
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado,
                'source', 'status_change_trigger'
            ),
            CASE NEW.estado
                WHEN 'confirmada' THEN ARRAY['Preparar mesa', 'Ver detalles']
                WHEN 'cancelada' THEN ARRAY['Contactar cliente', 'Reubicar mesa']
                WHEN 'no_show' THEN ARRAY['Liberar mesa', 'Contactar cliente']
                ELSE ARRAY['Ver detalles']
            END,
            NEW.id,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger para nuevas reservas (INSERT)
DROP TRIGGER IF EXISTS trigger_notify_new_reservation ON reservas;
CREATE TRIGGER trigger_notify_new_reservation
    AFTER INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_reservation();

-- Crear el trigger para cambios de estado (UPDATE)
DROP TRIGGER IF EXISTS trigger_notify_reservation_status_change ON reservas;
CREATE TRIGGER trigger_notify_reservation_status_change
    AFTER UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION notify_reservation_status_change();

-- Función para limpiar notificaciones duplicadas (opcional)
CREATE OR REPLACE FUNCTION cleanup_duplicate_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar notificaciones duplicadas basadas en reserva_id y tipo en la última hora
    DELETE FROM notifications 
    WHERE id IN (
        SELECT id 
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (
                       PARTITION BY reserva_id, type_code 
                       ORDER BY created_at DESC
                   ) as rn
            FROM notifications 
            WHERE reserva_id IS NOT NULL 
            AND created_at > NOW() - INTERVAL '1 hour'
        ) t 
        WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para probar el sistema de notificaciones
CREATE OR REPLACE FUNCTION test_reservation_notifications()
RETURNS TABLE(
    test_case TEXT,
    result TEXT,
    notification_created BOOLEAN
) AS $$
DECLARE
    test_reservation_id UUID;
    notification_count INTEGER;
BEGIN
    -- Test 1: Insertar nueva reserva
    INSERT INTO reservas (
        nombre, email, telefono, fecha_reserva, hora_reserva, personas, estado
    ) VALUES (
        'Test Usuario', 'test@test.com', '+34123456789', 
        CURRENT_DATE + INTERVAL '1 day', '20:00', 4, 'pendiente'
    ) RETURNING id INTO test_reservation_id;
    
    -- Verificar si se creó la notificación
    SELECT COUNT(*) INTO notification_count 
    FROM notifications 
    WHERE reserva_id = test_reservation_id;
    
    RETURN QUERY SELECT 
        'Nueva reserva pendiente'::TEXT,
        'Reserva ID: ' || test_reservation_id::TEXT,
        notification_count > 0;
    
    -- Test 2: Actualizar estado a confirmada
    UPDATE reservas 
    SET estado = 'confirmada' 
    WHERE id = test_reservation_id;
    
    -- Verificar notificaciones totales
    SELECT COUNT(*) INTO notification_count 
    FROM notifications 
    WHERE reserva_id = test_reservation_id;
    
    RETURN QUERY SELECT 
        'Cambio a confirmada'::TEXT,
        'Total notificaciones: ' || notification_count::TEXT,
        notification_count >= 2;
    
    -- Limpiar datos de prueba
    DELETE FROM notifications WHERE reserva_id = test_reservation_id;
    DELETE FROM reservas WHERE id = test_reservation_id;
    
    RETURN QUERY SELECT 
        'Limpieza completada'::TEXT,
        'Datos de prueba eliminados'::TEXT,
        true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON FUNCTION notify_new_reservation IS 'Trigger function que crea notificación automática para nuevas reservas';
COMMENT ON FUNCTION notify_reservation_status_change IS 'Trigger function que crea notificación cuando cambia el estado de una reserva';
COMMENT ON FUNCTION cleanup_duplicate_notifications IS 'Limpia notificaciones duplicadas de la última hora';
COMMENT ON FUNCTION test_reservation_notifications IS 'Función de prueba para verificar el sistema de notificaciones automáticas';