
-- Crear tabla para métricas de reservas por día
CREATE TABLE public.reservas_metricas_diarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  total_reservas INTEGER DEFAULT 0,
  total_comensales INTEGER DEFAULT 0,
  reservas_completadas INTEGER DEFAULT 0,
  reservas_canceladas INTEGER DEFAULT 0,
  reservas_no_show INTEGER DEFAULT 0,
  reservas_vip INTEGER DEFAULT 0,
  duracion_promedio_minutos INTEGER DEFAULT 0,
  ingresos_estimados DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(fecha)
);

-- Crear tabla para métricas por franja horaria
CREATE TABLE public.reservas_metricas_horarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  total_reservas INTEGER DEFAULT 0,
  total_comensales INTEGER DEFAULT 0,
  zona TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(fecha, hora_inicio, zona)
);

-- Crear tabla para métricas por canal de reserva
CREATE TABLE public.reservas_metricas_canales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  canal TEXT NOT NULL, -- 'web', 'telefono', 'whatsapp', 'en_persona'
  total_reservas INTEGER DEFAULT 0,
  total_comensales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(fecha, canal)
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_reservas_metricas_diarias_fecha ON public.reservas_metricas_diarias(fecha);
CREATE INDEX idx_reservas_metricas_horarias_fecha ON public.reservas_metricas_horarias(fecha);
CREATE INDEX idx_reservas_metricas_canales_fecha ON public.reservas_metricas_canales(fecha);

-- Función para actualizar métricas diarias
CREATE OR REPLACE FUNCTION public.actualizar_metricas_reservas_diarias(p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.reservas_metricas_diarias (
    fecha, total_reservas, total_comensales, reservas_completadas, 
    reservas_canceladas, reservas_no_show, reservas_vip, duracion_promedio_minutos
  )
  SELECT 
    p_fecha,
    COUNT(*) as total_reservas,
    SUM(numero_comensales) as total_comensales,
    COUNT(CASE WHEN estado_reserva = 'completada' THEN 1 END) as reservas_completadas,
    COUNT(CASE WHEN estado_reserva LIKE 'cancelada%' THEN 1 END) as reservas_canceladas,
    COUNT(CASE WHEN estado_reserva = 'no_show' THEN 1 END) as reservas_no_show,
    COUNT(CASE WHEN clientes.vip_status = true THEN 1 END) as reservas_vip,
    COALESCE(AVG(mt.duracion_minutos), 120) as duracion_promedio_minutos
  FROM public.reservas r
  LEFT JOIN public.clientes ON r.cliente_id = clientes.id
  LEFT JOIN public.mesa_tracking mt ON r.mesa_id = mt.mesa_id AND r.fecha_reserva = mt.fecha
  WHERE r.fecha_reserva = p_fecha
  ON CONFLICT (fecha) DO UPDATE SET
    total_reservas = EXCLUDED.total_reservas,
    total_comensales = EXCLUDED.total_comensales,
    reservas_completadas = EXCLUDED.reservas_completadas,
    reservas_canceladas = EXCLUDED.reservas_canceladas,
    reservas_no_show = EXCLUDED.reservas_no_show,
    reservas_vip = EXCLUDED.reservas_vip,
    duracion_promedio_minutos = EXCLUDED.duracion_promedio_minutos,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar métricas horarias
CREATE OR REPLACE FUNCTION public.actualizar_metricas_reservas_horarias(p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  hora_slot TIME;
  zona_mesa TEXT;
BEGIN
  -- Crear slots de 30 minutos desde las 18:00 hasta las 23:00
  FOR i IN 0..9 LOOP
    hora_slot := ('18:00:00'::TIME + (i * INTERVAL '30 minutes'));
    
    FOR zona_mesa IN SELECT DISTINCT tipo_mesa FROM public.mesas WHERE activa = true LOOP
      INSERT INTO public.reservas_metricas_horarias (
        fecha, hora_inicio, hora_fin, zona, total_reservas, total_comensales
      )
      SELECT 
        p_fecha,
        hora_slot,
        hora_slot + INTERVAL '30 minutes',
        zona_mesa,
        COUNT(*) as total_reservas,
        SUM(r.numero_comensales) as total_comensales
      FROM public.reservas r
      JOIN public.mesas m ON r.mesa_id = m.id
      WHERE r.fecha_reserva = p_fecha 
        AND r.hora_reserva >= hora_slot
        AND r.hora_reserva < hora_slot + INTERVAL '30 minutes'
        AND m.tipo_mesa = zona_mesa
      GROUP BY zona_mesa
      HAVING COUNT(*) > 0
      ON CONFLICT (fecha, hora_inicio, zona) DO UPDATE SET
        total_reservas = EXCLUDED.total_reservas,
        total_comensales = EXCLUDED.total_comensales;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar métricas por canal
CREATE OR REPLACE FUNCTION public.actualizar_metricas_reservas_canales(p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.reservas_metricas_canales (
    fecha, canal, total_reservas, total_comensales
  )
  SELECT 
    p_fecha,
    origen_reserva,
    COUNT(*) as total_reservas,
    SUM(numero_comensales) as total_comensales
  FROM public.reservas
  WHERE fecha_reserva = p_fecha
  GROUP BY origen_reserva
  ON CONFLICT (fecha, canal) DO UPDATE SET
    total_reservas = EXCLUDED.total_reservas,
    total_comensales = EXCLUDED.total_comensales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar métricas automáticamente
CREATE OR REPLACE FUNCTION public.trigger_actualizar_metricas_reservas()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar métricas para la fecha de la reserva
  PERFORM public.actualizar_metricas_reservas_diarias(NEW.fecha_reserva);
  PERFORM public.actualizar_metricas_reservas_horarias(NEW.fecha_reserva);
  PERFORM public.actualizar_metricas_reservas_canales(NEW.fecha_reserva);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_metricas_reservas
  AFTER INSERT OR UPDATE ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_metricas_reservas();

-- Vista para estadísticas de zonas
CREATE VIEW public.vista_estadisticas_zonas AS
SELECT 
  m.tipo_mesa as zona,
  COUNT(m.id) as total_mesas,
  COUNT(me.mesa_id) FILTER (WHERE me.estado = 'ocupada') as mesas_ocupadas,
  COUNT(me.mesa_id) FILTER (WHERE me.estado = 'reservada') as mesas_reservadas,
  COUNT(me.mesa_id) FILTER (WHERE me.estado = 'libre') as mesas_libres,
  ROUND(
    (COUNT(me.mesa_id) FILTER (WHERE me.estado IN ('ocupada', 'reservada'))::DECIMAL / COUNT(m.id)::DECIMAL) * 100, 
    1
  ) as porcentaje_ocupacion,
  COUNT(r.id) as total_reservas_hoy
FROM public.mesas m
LEFT JOIN public.mesa_estados me ON m.id = me.mesa_id
LEFT JOIN public.reservas r ON m.id = r.mesa_id AND r.fecha_reserva = CURRENT_DATE
WHERE m.activa = true
GROUP BY m.tipo_mesa;
