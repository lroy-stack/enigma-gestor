
-- Crear índices para optimizar las consultas de reservas
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_reserva ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_estado_reserva ON reservas(estado_reserva); 
CREATE INDEX IF NOT EXISTS idx_reservas_cliente_id ON reservas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reservas_mesa_id ON reservas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_estado ON reservas(fecha_reserva, estado_reserva);
CREATE INDEX IF NOT EXISTS idx_estados_mesa_estado ON estados_mesa(estado);
CREATE INDEX IF NOT EXISTS idx_estados_mesa_mesa_id ON estados_mesa(mesa_id);

-- Crear vista materializada para estadísticas diarias (actualizada automáticamente)
CREATE MATERIALIZED VIEW IF NOT EXISTS reservas_stats_daily AS
SELECT 
  fecha_reserva,
  COUNT(*) as total_reservas,
  COUNT(CASE WHEN estado_reserva = 'confirmada' THEN 1 END) as confirmadas,
  COUNT(CASE WHEN estado_reserva = 'pendiente_confirmacion' THEN 1 END) as pendientes,
  COUNT(CASE WHEN estado_reserva = 'completada' THEN 1 END) as completadas,
  SUM(numero_comensales) as total_comensales
FROM reservas 
WHERE fecha_reserva >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fecha_reserva;

-- Crear índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_stats_daily_fecha ON reservas_stats_daily(fecha_reserva);
