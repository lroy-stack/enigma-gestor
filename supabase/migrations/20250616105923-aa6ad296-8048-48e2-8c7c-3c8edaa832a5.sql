
-- PARTE 3: FUNCIONES AVANZADAS Y TRIGGERS
-- =======================================

-- 1. FUNCIÓN PARA INICIAR SERVICIO EN MESA
-- ========================================
CREATE OR REPLACE FUNCTION public.iniciar_servicio_mesa(
  p_mesa_id UUID,
  p_numero_comensales INTEGER DEFAULT NULL,
  p_reserva_id UUID DEFAULT NULL,
  p_ingresos_estimados DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  tracking_id UUID;
BEGIN
  -- Insertar registro de tracking
  INSERT INTO public.mesa_tracking (
    mesa_id, fecha, hora_ocupacion, numero_comensales, 
    reserva_id, ingresos_estimados
  )
  VALUES (
    p_mesa_id, CURRENT_DATE, NOW(), p_numero_comensales,
    p_reserva_id, p_ingresos_estimados
  )
  RETURNING id INTO tracking_id;
  
  -- Actualizar estado de mesa
  UPDATE public.mesa_estados 
  SET 
    estado = 'ocupada',
    tiempo_ocupacion = NOW(),
    updated_at = NOW()
  WHERE mesa_id = p_mesa_id;
  
  RETURN tracking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNCIÓN PARA FINALIZAR SERVICIO EN MESA
-- ==========================================
CREATE OR REPLACE FUNCTION public.finalizar_servicio_mesa(
  p_mesa_id UUID,
  p_ingresos_reales DECIMAL DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  tracking_record RECORD;
BEGIN
  -- Buscar registro de tracking activo
  SELECT * INTO tracking_record
  FROM public.mesa_tracking
  WHERE mesa_id = p_mesa_id 
    AND fecha = CURRENT_DATE 
    AND hora_liberacion IS NULL
  ORDER BY hora_ocupacion DESC
  LIMIT 1;
  
  IF tracking_record.id IS NOT NULL THEN
    -- Actualizar tracking con hora de liberación
    UPDATE public.mesa_tracking
    SET 
      hora_liberacion = NOW(),
      duracion_minutos = EXTRACT(EPOCH FROM (NOW() - hora_ocupacion))/60,
      ingresos_estimados = COALESCE(p_ingresos_reales, ingresos_estimados)
    WHERE id = tracking_record.id;
    
    -- Cambiar estado a limpieza
    UPDATE public.mesa_estados 
    SET 
      estado = 'limpieza',
      tiempo_ocupacion = NULL,
      updated_at = NOW()
    WHERE mesa_id = p_mesa_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNCIÓN PARA ACTUALIZAR MÉTRICAS DIARIAS
-- ===========================================
CREATE OR REPLACE FUNCTION public.actualizar_metricas_diarias()
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.metricas_diarias (
    fecha, mesa_id, total_ocupaciones, tiempo_total_ocupado_minutos,
    tiempo_promedio_ocupacion_minutos, total_reservas, reservas_confirmadas,
    reservas_no_show, rotaciones_mesa, ingresos_estimados_total
  )
  SELECT 
    CURRENT_DATE,
    m.id,
    COALESCE(COUNT(mt.id), 0),
    COALESCE(SUM(mt.duracion_minutos), 0),
    COALESCE(AVG(mt.duracion_minutos), 0),
    COALESCE(COUNT(r.id), 0),
    COALESCE(COUNT(CASE WHEN r.estado_reserva = 'confirmada' THEN 1 END), 0),
    COALESCE(COUNT(CASE WHEN r.estado_reserva = 'no_show' THEN 1 END), 0),
    COALESCE(COUNT(mt.id), 0),
    COALESCE(SUM(mt.ingresos_estimados), 0)
  FROM public.mesas m
  LEFT JOIN public.mesa_tracking mt ON m.id = mt.mesa_id AND mt.fecha = CURRENT_DATE
  LEFT JOIN public.reservas r ON m.id = r.mesa_id AND r.fecha_reserva = CURRENT_DATE
  WHERE m.activa = true
  GROUP BY m.id
  ON CONFLICT (fecha, mesa_id) DO UPDATE SET
    total_ocupaciones = EXCLUDED.total_ocupaciones,
    tiempo_total_ocupado_minutos = EXCLUDED.tiempo_total_ocupado_minutos,
    tiempo_promedio_ocupacion_minutos = EXCLUDED.tiempo_promedio_ocupacion_minutos,
    total_reservas = EXCLUDED.total_reservas,
    reservas_confirmadas = EXCLUDED.reservas_confirmadas,
    reservas_no_show = EXCLUDED.reservas_no_show,
    rotaciones_mesa = EXCLUDED.rotaciones_mesa,
    ingresos_estimados_total = EXCLUDED.ingresos_estimados_total,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER PARA HISTORIAL DE ESTADOS
-- ====================================
CREATE OR REPLACE FUNCTION public.trigger_historial_mesa_estados()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado != NEW.estado THEN
    INSERT INTO public.mesa_estados_historial (
      mesa_id, estado_anterior, estado_nuevo, timestamp_cambio
    )
    VALUES (NEW.mesa_id, OLD.estado, NEW.estado, NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_mesa_estados_historial
  AFTER UPDATE ON public.mesa_estados
  FOR EACH ROW
  EXECUTE FUNCTION trigger_historial_mesa_estados();

-- 5. TRIGGER PARA ANALYTICS DE CLIENTES
-- =====================================
CREATE OR REPLACE FUNCTION public.trigger_actualizar_cliente_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cliente_analytics (
    cliente_id, total_reservas, primera_visita, ultima_visita
  )
  VALUES (
    NEW.cliente_id, 1, NEW.fecha_reserva, NEW.fecha_reserva
  )
  ON CONFLICT (cliente_id) DO UPDATE SET
    total_reservas = cliente_analytics.total_reservas + 1,
    ultima_visita = GREATEST(cliente_analytics.ultima_visita, NEW.fecha_reserva),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_reserva_analytics
  AFTER INSERT ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_cliente_analytics();

-- 6. VISTA DE ESTADO ACTUAL DEL RESTAURANTE
-- =========================================
CREATE VIEW public.vista_estado_restaurante AS
SELECT 
  m.tipo_mesa as zona,
  COUNT(*) as total_mesas,
  COUNT(CASE WHEN me.estado = 'libre' THEN 1 END) as mesas_libres,
  COUNT(CASE WHEN me.estado = 'ocupada' THEN 1 END) as mesas_ocupadas,
  COUNT(CASE WHEN me.estado = 'reservada' THEN 1 END) as mesas_reservadas,
  COUNT(CASE WHEN me.estado = 'limpieza' THEN 1 END) as mesas_limpieza,
  COUNT(CASE WHEN me.estado = 'fuera_servicio' THEN 1 END) as mesas_mantenimiento,
  ROUND(
    (COUNT(CASE WHEN me.estado IN ('ocupada', 'reservada') THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
    2
  ) as porcentaje_ocupacion
FROM public.mesas m
JOIN public.mesa_estados me ON m.id = me.mesa_id
WHERE m.activa = true
GROUP BY m.tipo_mesa;

-- 7. VISTA DE RESERVAS DEL DÍA
-- ============================
CREATE VIEW public.vista_reservas_hoy AS
SELECT 
  r.id,
  r.hora_reserva,
  r.numero_comensales,
  r.estado_reserva,
  c.nombre || ' ' || c.apellido as cliente_nombre,
  c.telefono,
  m.numero_mesa,
  m.tipo_mesa as zona,
  m.capacidad as capacidad_mesa
FROM public.reservas r
JOIN public.clientes c ON r.cliente_id = c.id
LEFT JOIN public.mesas m ON r.mesa_id = m.id
WHERE r.fecha_reserva = CURRENT_DATE
ORDER BY r.hora_reserva;
