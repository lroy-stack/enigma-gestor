-- Migration: Enhance notification system with more triggers and time-based events
-- Date: 2025-06-22

-- Add 'customer_modified' notification type if it doesn't exist
INSERT INTO notification_types (code, name, description, icon_name, color, is_active) VALUES
    ('customer_modified', 'Contacto Modificado', 'Información de un contacto ha sido actualizada', 'user-check', '#237584', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Enhance notify_reservation_update to cover other modifications
-- =====================================================

-- Drop the old trigger function if it exists to replace it with the new one
DROP FUNCTION IF EXISTS notify_reservation_status_change() CASCADE;

CREATE OR REPLACE FUNCTION notify_reservation_update()
RETURNS TRIGGER AS $$
DECLARE
    v_changes_detected BOOLEAN := FALSE;
    v_message TEXT;
    v_data JSONB := '{}';
    v_actions TEXT[] := ARRAY['Ver detalles'];
    v_priority VARCHAR(10) := 'normal';
BEGIN
    -- Check for status change
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{estado_anterior}', to_jsonb(OLD.estado));
        v_data := jsonb_set(v_data, '{estado_nuevo}', to_jsonb(NEW.estado));

        CASE NEW.estado
            WHEN 'confirmada' THEN
                v_message := NEW.nombre || ' - ' || to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva || ' ha sido confirmada.';
                v_priority := 'normal';
                v_actions := ARRAY['Preparar mesa', 'Ver detalles'];
            WHEN 'cancelada' THEN
                v_message := NEW.nombre || ' - ' || to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva || ' ha sido cancelada.';
                v_priority := 'normal';
                v_actions := ARRAY['Contactar cliente', 'Reubicar mesa'];
            WHEN 'completada' THEN
                v_message := NEW.nombre || ' - ' || to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva || ' ha sido completada.';
                v_priority := 'low';
            WHEN 'no_show' THEN
                v_message := NEW.nombre || ' - ' || to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva || ' - Cliente no se presentó.';
                v_priority := 'high';
                v_actions := ARRAY['Liberar mesa', 'Contactar cliente'];
            ELSE
                v_message := NEW.nombre || ' - ' || to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva || ' - Estado cambiado a ' || NEW.estado || '.';
        END CASE;
    ELSE
        -- Check for other field changes (non-status changes)
        IF OLD.personas IS DISTINCT FROM NEW.personas THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{personas_anterior}', to_jsonb(OLD.personas));
            v_data := jsonb_set(v_data, '{personas_nuevo}', to_jsonb(NEW.personas));
        END IF;
        IF OLD.fecha_reserva IS DISTINCT FROM NEW.fecha_reserva THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{fecha_anterior}', to_jsonb(OLD.fecha_reserva));
            v_data := jsonb_set(v_data, '{fecha_nuevo}', to_jsonb(NEW.fecha_reserva));
        END IF;
        IF OLD.hora_reserva IS DISTINCT FROM NEW.hora_reserva THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{hora_anterior}', to_jsonb(OLD.hora_reserva));
            v_data := jsonb_set(v_data, '{hora_nuevo}', to_jsonb(NEW.hora_reserva));
        END IF;
        IF OLD.ocasion IS DISTINCT FROM NEW.ocasion THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{ocasion_anterior}', to_jsonb(OLD.ocasion));
            v_data := jsonb_set(v_data, '{ocasion_nuevo}', to_jsonb(NEW.ocasion));
        END IF;
        IF OLD.preferencia_mesa IS DISTINCT FROM NEW.preferencia_mesa THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{preferencia_mesa_anterior}', to_jsonb(OLD.preferencia_mesa));
            v_data := jsonb_set(v_data, '{preferencia_mesa_nuevo}', to_jsonb(NEW.preferencia_mesa));
        END IF;
        IF OLD.requisitos_dieteticos IS DISTINCT FROM NEW.requisitos_dieteticos THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{requisitos_dieteticos_anterior}', to_jsonb(OLD.requisitos_dieteticos));
            v_data := jsonb_set(v_data, '{requisitos_dieteticos_nuevo}', to_jsonb(NEW.requisitos_dieteticos));
        END IF;
        IF OLD.notas IS DISTINCT FROM NEW.notas THEN
            v_changes_detected := TRUE;
            v_data := jsonb_set(v_data, '{notas_anterior}', to_jsonb(OLD.notas));
            v_data := jsonb_set(v_data, '{notas_nuevo}', to_jsonb(NEW.notas));
        END IF;

        IF v_changes_detected THEN
            v_message := NEW.nombre || ' - ' || to_char(NEW.fecha_reserva::date, 'DD/MM/YYYY') || ' ' || NEW.hora_reserva || ' ha sido modificada.';
            v_priority := 'normal';
            v_actions := ARRAY['Ver cambios', 'Contactar cliente'];
        END IF;
    END IF;

    IF v_changes_detected THEN
        INSERT INTO notifications (
            type_code, title, message, priority, data, actions, reserva_id, created_at
        ) VALUES (
            CASE 
                WHEN OLD.estado IS DISTINCT FROM NEW.estado THEN
                    CASE NEW.estado
                        WHEN 'confirmada' THEN 'reservation_confirmed'
                        WHEN 'cancelada' THEN 'reservation_cancelled'
                        WHEN 'completada' THEN 'reservation_completed'
                        WHEN 'no_show' THEN 'reservation_no_show'
                        ELSE 'reservation_modified'
                    END
                ELSE 'reservation_modified'
            END,
            CASE 
                WHEN OLD.estado IS DISTINCT FROM NEW.estado THEN
                    CASE NEW.estado
                        WHEN 'confirmada' THEN 'Reserva Confirmada'
                        WHEN 'cancelada' THEN 'Reserva Cancelada'
                        WHEN 'completada' THEN 'Reserva Completada'
                        WHEN 'no_show' THEN 'Cliente No Show'
                        ELSE 'Reserva Modificada'
                    END
                ELSE 'Reserva Modificada'
            END,
            v_message,
            v_priority,
            jsonb_build_object(
                'cliente_nombre', NEW.nombre,
                'fecha_reserva', NEW.fecha_reserva,
                'hora_reserva', NEW.hora_reserva,
                'personas', NEW.personas,
                'cambios', v_data,
                'source', 'trigger_update'
            ),
            v_actions,
            NEW.id,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger for updates on 'reservas' to use the new function
DROP TRIGGER IF EXISTS trigger_notify_reservation_status_change ON reservas; -- Drop old trigger if it exists
CREATE TRIGGER trigger_notify_reservation_update
    AFTER UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION notify_reservation_update();

-- =====================================================
-- Trigger for contacts modifications
-- =====================================================

CREATE OR REPLACE FUNCTION notify_contact_modified()
RETURNS TRIGGER AS $$
DECLARE
    v_changes_detected BOOLEAN := FALSE;
    v_message TEXT;
    v_data JSONB := '{}';
    v_priority VARCHAR(10) := 'normal';
BEGIN
    -- Check for changes in relevant fields
    IF OLD.name IS DISTINCT FROM NEW.name THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{name_anterior}', to_jsonb(OLD.name));
        v_data := jsonb_set(v_data, '{name_nuevo}', to_jsonb(NEW.name));
    END IF;
    IF OLD.last_name IS DISTINCT FROM NEW.last_name THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{last_name_anterior}', to_jsonb(OLD.last_name));
        v_data := jsonb_set(v_data, '{last_name_nuevo}', to_jsonb(NEW.last_name));
    END IF;
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{email_anterior}', to_jsonb(OLD.email));
        v_data := jsonb_set(v_data, '{email_nuevo}', to_jsonb(NEW.email));
    END IF;
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{phone_anterior}', to_jsonb(OLD.phone));
        v_data := jsonb_set(v_data, '{phone_nuevo}', to_jsonb(NEW.phone));
    END IF;
    IF OLD.vip_status IS DISTINCT FROM NEW.vip_status THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{vip_status_anterior}', to_jsonb(OLD.vip_status));
        v_data := jsonb_set(v_data, '{vip_status_nuevo}', to_jsonb(NEW.vip_status));
        
        -- If customer was upgraded to VIP, set higher priority
        IF NEW.vip_status = true AND (OLD.vip_status = false OR OLD.vip_status IS NULL) THEN
            v_priority := 'high';
        END IF;
    END IF;
    IF OLD.preferencias_comida IS DISTINCT FROM NEW.preferencias_comida THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{preferencias_comida_anterior}', to_jsonb(OLD.preferencias_comida));
        v_data := jsonb_set(v_data, '{preferencias_comida_nuevo}', to_jsonb(NEW.preferencias_comida));
    END IF;
    IF OLD.restricciones_dieteticas IS DISTINCT FROM NEW.restricciones_dieteticas THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{restricciones_dieteticas_anterior}', to_jsonb(OLD.restricciones_dieteticas));
        v_data := jsonb_set(v_data, '{restricciones_dieteticas_nuevo}', to_jsonb(NEW.restricciones_dieteticas));
    END IF;
    IF OLD.notas_internas IS DISTINCT FROM NEW.notas_internas THEN
        v_changes_detected := TRUE;
        v_data := jsonb_set(v_data, '{notas_internas_anterior}', to_jsonb(OLD.notas_internas));
        v_data := jsonb_set(v_data, '{notas_internas_nuevo}', to_jsonb(NEW.notas_internas));
    END IF;

    IF v_changes_detected THEN
        v_message := 'Contacto ' || NEW.name || ' ' || NEW.last_name || ' ha sido modificado.';
        
        -- Special message for VIP status change
        IF OLD.vip_status IS DISTINCT FROM NEW.vip_status THEN
            IF NEW.vip_status = true THEN
                v_message := 'Contacto ' || NEW.name || ' ' || NEW.last_name || ' ha sido promovido a VIP.';
            ELSE
                v_message := 'Contacto ' || NEW.name || ' ' || NEW.last_name || ' ya no es VIP.';
            END IF;
        END IF;

        INSERT INTO notifications (
            type_code, title, message, priority, data, actions, cliente_id, created_at
        ) VALUES (
            'customer_modified',
            'Contacto Modificado',
            v_message,
            v_priority,
            jsonb_build_object(
                'cliente_nombre', NEW.name || ' ' || NEW.last_name,
                'cliente_email', NEW.email,
                'cliente_telefono', NEW.phone,
                'vip_status', NEW.vip_status,
                'cambios', v_data,
                'source', 'trigger_update'
            ),
            ARRAY['Ver perfil', 'Contactar cliente'],
            NEW.id,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_contact_modified ON contacts;
CREATE TRIGGER trigger_notify_contact_modified
    AFTER UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION notify_contact_modified();

-- =====================================================
-- RPC Function for time-based upcoming reservations
-- =====================================================

CREATE OR REPLACE FUNCTION check_upcoming_reservations(
    p_time_window_minutes INTEGER DEFAULT 15,
    p_max_notifications INTEGER DEFAULT 10
)
RETURNS TABLE(
    reserva_id UUID,
    title TEXT,
    message TEXT,
    priority VARCHAR(10),
    data JSONB,
    actions TEXT[]
) AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_today DATE := v_now::DATE;
    v_current_time TIME := v_now::TIME;
    v_future_time TIME := (v_now + (p_time_window_minutes || ' minutes')::INTERVAL)::TIME;
BEGIN
    RETURN QUERY
    SELECT
        r.id AS reserva_id,
        'Reserva Próxima: ' || r.nombre AS title,
        r.nombre || ' (' || r.personas || 'p) llega en ' || p_time_window_minutes || ' minutos a las ' || r.hora_reserva || '.' AS message,
        'high' AS priority,
        jsonb_build_object(
            'cliente_nombre', r.nombre,
            'fecha_reserva', r.fecha_reserva,
            'hora_reserva', r.hora_reserva,
            'personas', r.personas,
            'mesa_asignada', t.numero_mesa,
            'time_window_minutes', p_time_window_minutes
        ) AS data,
        ARRAY['Preparar mesa', 'Contactar cliente'] AS actions
    FROM
        reservas r
    LEFT JOIN
        mesas t ON r.mesa_id = t.id
    WHERE
        r.fecha_reserva = v_today
        AND r.estado IN ('confirmada', 'pendiente')
        AND (r.hora_reserva::TIME BETWEEN v_current_time AND v_future_time)
        -- Ensure we don't notify for the same reservation multiple times within the window
        AND NOT EXISTS (
            SELECT 1 FROM notifications n
            WHERE n.reserva_id = r.id
            AND n.type_code = 'reservation_upcoming'
            AND n.created_at > v_now - (p_time_window_minutes || ' minutes')::INTERVAL
        )
    ORDER BY r.hora_reserva
    LIMIT p_max_notifications;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function to clean up duplicate notifications
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_duplicate_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Find and delete duplicates based on similar type and data within a short timeframe
    WITH duplicates AS (
        SELECT id
        FROM (
            SELECT 
                id,
                type_code,
                reserva_id,
                cliente_id,
                mesa_id,
                created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY type_code, COALESCE(reserva_id, '00000000-0000-0000-0000-000000000000'), 
                                COALESCE(cliente_id, '00000000-0000-0000-0000-000000000000'), 
                                COALESCE(mesa_id, '00000000-0000-0000-0000-000000000000')
                    ORDER BY created_at DESC
                ) as rn
            FROM notifications
            -- Only look at notifications created in the last 24 hours
            WHERE created_at > NOW() - INTERVAL '24 hours'
            AND reserva_id IS NOT NULL OR cliente_id IS NOT NULL OR mesa_id IS NOT NULL
        ) t
        WHERE rn > 1  -- Keep the most recent notification
    )
    DELETE FROM notifications 
    WHERE id IN (SELECT id FROM duplicates)
    RETURNING id INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION notify_reservation_update() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_contact_modified() TO authenticated;
GRANT EXECUTE ON FUNCTION check_upcoming_reservations(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_duplicate_notifications() TO authenticated;

COMMENT ON FUNCTION notify_reservation_update() IS 'Generates notifications when a reservation is updated';
COMMENT ON FUNCTION notify_contact_modified() IS 'Generates notifications when a contact is modified';
COMMENT ON FUNCTION check_upcoming_reservations() IS 'Finds reservations that are coming up soon for notification';
COMMENT ON FUNCTION cleanup_duplicate_notifications() IS 'Removes duplicate notifications within a timeframe';

COMMENT ON MIGRATION '20250622_enhance_notifications' IS 'Enhances notification system with triggers for reservation and contact modifications, time-based upcoming reservation checks, and duplicate cleanup';