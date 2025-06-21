-- Additional RPC functions for the restaurant management system
-- This migration creates specialized functions that the hooks expect

-- =====================================================
-- NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications 
    SET read = true, read_at = NOW()
    WHERE id = notification_id 
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read = true, read_at = NOW()
    WHERE user_id = auth.uid() 
    AND read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type_name VARCHAR(100),
    p_title VARCHAR(255),
    p_message TEXT DEFAULT NULL,
    p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_type_id UUID;
    v_notification_id UUID;
BEGIN
    -- Get notification type ID
    SELECT id INTO v_type_id 
    FROM notification_types 
    WHERE name = p_type_name AND enabled = true;
    
    IF v_type_id IS NULL THEN
        RAISE EXCEPTION 'Notification type % not found or disabled', p_type_name;
    END IF;
    
    -- Create notification
    INSERT INTO notifications (user_id, type_id, title, message, data)
    VALUES (p_user_id, v_type_id, p_title, p_message, p_data)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TABLE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to apply table combination
CREATE OR REPLACE FUNCTION aplicar_combinacion_mesa(
    p_combinacion_id UUID,
    p_reserva_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_mesas_ids UUID[];
    mesa_id UUID;
BEGIN
    -- Get table IDs from combination
    SELECT mesas_ids INTO v_mesas_ids
    FROM combinaciones_mesa 
    WHERE id = p_combinacion_id AND activa = true;
    
    IF v_mesas_ids IS NULL THEN
        RETURN false;
    END IF;
    
    -- Update all tables in combination to 'combinada' state
    FOREACH mesa_id IN ARRAY v_mesas_ids
    LOOP
        PERFORM actualizar_estado_mesa(mesa_id, 'combinada', auth.uid(), 
            'Combinada - ID: ' || p_combinacion_id::TEXT);
    END LOOP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table current state
CREATE OR REPLACE FUNCTION get_mesa_estado_actual(p_mesa_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_estado VARCHAR(50);
BEGIN
    SELECT estado INTO v_estado
    FROM estados_mesa 
    WHERE mesa_id = p_mesa_id 
    ORDER BY fecha_cambio DESC 
    LIMIT 1;
    
    RETURN COALESCE(v_estado, 'disponible');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RESERVATION FUNCTIONS
-- =====================================================

-- Function to get daily reservation stats
CREATE OR REPLACE FUNCTION get_reservas_stats_daily(p_fecha DATE)
RETURNS TABLE (
    total_reservas BIGINT,
    confirmadas BIGINT,
    pendientes BIGINT,
    canceladas BIGINT,
    no_show BIGINT,
    total_comensales BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reservas,
        COUNT(*) FILTER (WHERE status = 'confirmed' OR estado_reserva = 'confirmada') as confirmadas,
        COUNT(*) FILTER (WHERE status = 'pending' OR estado_reserva = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE status = 'cancelled' OR estado_reserva = 'cancelada') as canceladas,
        COUNT(*) FILTER (WHERE estado_reserva = 'no_show') as no_show,
        COALESCE(SUM(COALESCE(numero_comensales, personas, 2)), 0) as total_comensales
    FROM reservations r
    LEFT JOIN reservas res ON res.id = r.id
    WHERE r.date = p_fecha OR res.fecha_reserva = p_fecha;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign table to reservation
CREATE OR REPLACE FUNCTION auto_assign_table_to_reservation(
    p_reservation_id UUID,
    p_personas INTEGER,
    p_fecha DATE,
    p_hora TIME,
    p_zona VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_mesa_id UUID;
BEGIN
    -- Get the best available table
    SELECT mesa_id INTO v_mesa_id
    FROM sugerir_mesas_para_reserva(p_personas, p_fecha, p_hora, p_zona)
    LIMIT 1;
    
    IF v_mesa_id IS NOT NULL THEN
        -- Update reservation with table assignment
        UPDATE reservations 
        SET table_id = v_mesa_id
        WHERE id = p_reservation_id;
        
        -- Mark table as reserved
        PERFORM actualizar_estado_mesa(v_mesa_id, 'reservada', auth.uid(), 
            'Auto-asignada a reserva: ' || p_reservation_id::TEXT);
    END IF;
    
    RETURN v_mesa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CUSTOMER ANALYTICS FUNCTIONS
-- =====================================================

-- Function to update customer analytics
CREATE OR REPLACE FUNCTION update_customer_analytics(p_cliente_id UUID)
RETURNS VOID AS $$
DECLARE
    v_mes DATE;
    v_visitas INTEGER;
    v_gasto DECIMAL(10,2);
BEGIN
    v_mes := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Count visits this month
    SELECT COUNT(*) INTO v_visitas
    FROM reservations r
    WHERE r.customer_id = p_cliente_id
    AND r.date >= v_mes
    AND (r.status = 'completed' OR r.estado_reserva = 'completada');
    
    -- Calculate spending (placeholder - you'll need to implement based on your billing system)
    v_gasto := v_visitas * 45.00; -- Average meal cost
    
    -- Insert or update analytics
    INSERT INTO cliente_analytics (cliente_id, mes, visitas_mes, gasto_mes)
    VALUES (p_cliente_id, v_mes, v_visitas, v_gasto)
    ON CONFLICT (cliente_id, mes) 
    DO UPDATE SET 
        visitas_mes = v_visitas,
        gasto_mes = v_gasto;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- METRICS UPDATE FUNCTIONS
-- =====================================================

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics(p_fecha DATE)
RETURNS VOID AS $$
DECLARE
    v_total_reservas INTEGER;
    v_confirmadas INTEGER;
    v_canceladas INTEGER;
    v_no_show INTEGER;
    v_total_comensales INTEGER;
    v_tasa_ocupacion DECIMAL(5,2);
BEGIN
    -- Get reservation stats
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'confirmed' OR estado_reserva = 'confirmada'),
        COUNT(*) FILTER (WHERE status = 'cancelled' OR estado_reserva = 'cancelada'),
        COUNT(*) FILTER (WHERE estado_reserva = 'no_show'),
        COALESCE(SUM(COALESCE(numero_comensales, personas, 2)), 0)
    INTO v_total_reservas, v_confirmadas, v_canceladas, v_no_show, v_total_comensales
    FROM reservations r
    LEFT JOIN reservas res ON res.id = r.id
    WHERE r.date = p_fecha OR res.fecha_reserva = p_fecha;
    
    -- Calculate occupancy rate (simplified)
    SELECT ROUND(100.0 * v_total_comensales / NULLIF(SUM(capacity), 0), 2)
    INTO v_tasa_ocupacion
    FROM tables 
    WHERE activa = true;
    
    -- Insert or update metrics
    INSERT INTO reservas_metricas_diarias (
        fecha, total_reservas, reservas_confirmadas, reservas_canceladas, 
        reservas_no_show, total_comensales, tasa_ocupacion
    )
    VALUES (
        p_fecha, v_total_reservas, v_confirmadas, v_canceladas,
        v_no_show, v_total_comensales, v_tasa_ocupacion
    )
    ON CONFLICT (fecha) 
    DO UPDATE SET 
        total_reservas = v_total_reservas,
        reservas_confirmadas = v_confirmadas,
        reservas_canceladas = v_canceladas,
        reservas_no_show = v_no_show,
        total_comensales = v_total_comensales,
        tasa_ocupacion = v_tasa_ocupacion,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEARCH FUNCTIONS
-- =====================================================

-- Function to search customers
CREATE OR REPLACE FUNCTION search_customers(p_query TEXT)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(20),
    vip_status BOOLEAN,
    total_visitas INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name as nombre,
        c.last_name as apellido,
        c.email,
        c.phone as telefono,
        COALESCE(c.vip_status, false) as vip_status,
        COALESCE(c.total_visitas, 0) as total_visitas
    FROM contacts c
    WHERE 
        c.name ILIKE '%' || p_query || '%' OR
        c.last_name ILIKE '%' || p_query || '%' OR
        c.email ILIKE '%' || p_query || '%' OR
        c.phone ILIKE '%' || p_query || '%'
    ORDER BY 
        CASE WHEN c.vip_status THEN 1 ELSE 2 END,
        c.total_visitas DESC,
        c.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update customer stats when reservation changes
CREATE OR REPLACE FUNCTION trigger_update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer visit count and last visit date
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.customer_id IS NOT NULL AND (NEW.status = 'completed' OR NEW.estado_reserva = 'completada') THEN
            UPDATE contacts 
            SET 
                total_visitas = COALESCE(total_visitas, 0) + 
                    CASE WHEN TG_OP = 'INSERT' THEN 1 
                         WHEN TG_OP = 'UPDATE' AND (OLD.status != 'completed' AND OLD.estado_reserva != 'completada') THEN 1 
                         ELSE 0 END,
                fecha_ultima_visita = NEW.date
            WHERE id = NEW.customer_id;
            
            -- Update customer analytics
            PERFORM update_customer_analytics(NEW.customer_id);
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reservations
CREATE TRIGGER trigger_reservations_customer_stats 
    AFTER INSERT OR UPDATE ON reservations
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_update_customer_stats();

-- Trigger to update daily metrics
CREATE OR REPLACE FUNCTION trigger_update_daily_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_daily_metrics(NEW.date);
        IF TG_OP = 'UPDATE' AND NEW.date != OLD.date THEN
            PERFORM update_daily_metrics(OLD.date);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_daily_metrics(OLD.date);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reservations
CREATE TRIGGER trigger_reservations_daily_metrics 
    AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_update_daily_metrics();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION mark_notification_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read() TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION aplicar_combinacion_mesa(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_mesa_estado_actual(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reservas_stats_daily(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_table_to_reservation(UUID, INTEGER, DATE, TIME, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION search_customers(TEXT) TO authenticated;

COMMENT ON MIGRATION '20250118_create_rpc_functions' IS 'Creates RPC functions required by the application hooks';