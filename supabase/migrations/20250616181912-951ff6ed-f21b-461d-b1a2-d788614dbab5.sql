
-- Crear vista de estadísticas por zonas
CREATE OR REPLACE VIEW vista_estadisticas_zonas AS
SELECT 
  m.zona,
  COUNT(m.id) as total_mesas,
  COUNT(CASE WHEN em.estado = 'libre' THEN 1 END) as mesas_libres,
  COUNT(CASE WHEN em.estado = 'ocupada' THEN 1 END) as mesas_ocupadas,
  COUNT(CASE WHEN em.estado = 'reservada' THEN 1 END) as mesas_reservadas,
  COUNT(CASE WHEN em.estado = 'limpieza' THEN 1 END) as mesas_limpieza,
  COUNT(CASE WHEN em.estado = 'fuera_servicio' THEN 1 END) as mesas_fuera_servicio,
  SUM(m.capacidad) as capacidad_total,
  SUM(CASE WHEN em.estado IN ('ocupada', 'reservada') THEN m.capacidad ELSE 0 END) as capacidad_ocupada,
  ROUND(
    (COUNT(CASE WHEN em.estado IN ('ocupada', 'reservada') THEN 1 END)::DECIMAL / COUNT(m.id)::DECIMAL) * 100, 
    2
  ) as porcentaje_ocupacion
FROM mesas m
LEFT JOIN estados_mesa em ON m.id = em.mesa_id
WHERE m.activa = true
GROUP BY m.zona;

-- Crear vista materializada para estadísticas de reservas diarias
CREATE MATERIALIZED VIEW IF NOT EXISTS reservas_stats_daily AS
SELECT 
  fecha_reserva,
  COUNT(*) as total_reservas,
  COUNT(CASE WHEN estado_reserva = 'confirmada' THEN 1 END) as confirmadas,
  COUNT(CASE WHEN estado_reserva = 'pendiente_confirmacion' THEN 1 END) as pendientes,
  COUNT(CASE WHEN estado_reserva = 'completada' THEN 1 END) as completadas,
  COUNT(CASE WHEN estado_reserva LIKE 'cancelada%' THEN 1 END) as canceladas,
  COUNT(CASE WHEN estado_reserva = 'no_show' THEN 1 END) as no_shows,
  SUM(numero_comensales) as total_comensales,
  AVG(numero_comensales::DECIMAL) as promedio_comensales
FROM reservas 
WHERE fecha_reserva >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY fecha_reserva
ORDER BY fecha_reserva DESC;

-- Crear índice único para la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_stats_daily_fecha 
ON reservas_stats_daily (fecha_reserva);

-- Función para actualizar estadísticas diarias
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY reservas_stats_daily;
END;
$$;

-- Añadir alias para compatibilidad en combinaciones_mesa
ALTER TABLE combinaciones_mesa 
ADD COLUMN IF NOT EXISTS mesas_combinadas UUID[] 
GENERATED ALWAYS AS (mesas_secundarias) STORED;

-- Crear índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_estados_mesa_estado_mesa 
ON estados_mesa (estado, mesa_id);

CREATE INDEX IF NOT EXISTS idx_reservas_cliente_estado 
ON reservas (cliente_id, estado_reserva, fecha_reserva DESC);

-- Actualizar la vista materializada inicial
REFRESH MATERIALIZED VIEW reservas_stats_daily;
