
-- PARTE 2: TABLAS DE TRACKING Y ANALYTICS
-- =======================================

-- 1. TABLA DE HISTORIAL DE ESTADOS
-- ================================
CREATE TABLE public.mesa_estados_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id UUID REFERENCES public.mesas(id) NOT NULL,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  timestamp_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  motivo TEXT,
  notas TEXT
);

-- 2. TABLA DE TRACKING TEMPORAL
-- ============================
CREATE TABLE public.mesa_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id UUID REFERENCES public.mesas(id) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  hora_ocupacion TIMESTAMP WITH TIME ZONE,
  hora_liberacion TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  tipo_servicio TEXT DEFAULT 'normal',
  numero_comensales INTEGER,
  ingresos_estimados DECIMAL(10,2),
  reserva_id UUID REFERENCES public.reservas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE MÉTRICAS AGREGADAS
-- ==============================
CREATE TABLE public.metricas_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  mesa_id UUID REFERENCES public.mesas(id) NOT NULL,
  
  -- Métricas de ocupación
  total_ocupaciones INTEGER DEFAULT 0,
  tiempo_total_ocupado_minutos INTEGER DEFAULT 0,
  tiempo_promedio_ocupacion_minutos INTEGER DEFAULT 0,
  
  -- Métricas de reservas
  total_reservas INTEGER DEFAULT 0,
  reservas_confirmadas INTEGER DEFAULT 0,
  reservas_no_show INTEGER DEFAULT 0,
  tasa_ocupacion_porcentaje DECIMAL(5,2) DEFAULT 0,
  
  -- Métricas operacionales
  tiempo_limpieza_total_minutos INTEGER DEFAULT 0,
  rotaciones_mesa INTEGER DEFAULT 0,
  ingresos_estimados_total DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(fecha, mesa_id)
);

-- 4. TABLA DE ANALYTICS DE CLIENTES
-- =================================
CREATE TABLE public.cliente_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) NOT NULL,
  
  -- Métricas de visitas
  total_visitas INTEGER DEFAULT 0,
  total_reservas INTEGER DEFAULT 0,
  total_no_shows INTEGER DEFAULT 0,
  primera_visita DATE,
  ultima_visita DATE,
  
  -- Preferencias
  mesa_preferida_id UUID REFERENCES public.mesas(id),
  zona_preferida TEXT,
  horario_preferido_inicio TIME,
  horario_preferido_fin TIME,
  tamano_grupo_promedio DECIMAL(3,1),
  
  -- Métricas económicas
  gasto_promedio_estimado DECIMAL(10,2),
  gasto_total_estimado DECIMAL(10,2),
  
  -- Clasificación
  tipo_cliente TEXT DEFAULT 'regular',
  puntuacion_fidelidad INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cliente_id)
);

-- 5. POLÍTICAS RLS PARA SEGURIDAD
-- ===============================
ALTER TABLE public.mesa_estados_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesa_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para mesa_estados_historial
CREATE POLICY "Personal puede ver historial de mesas" ON public.mesa_estados_historial
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema puede insertar historial" ON public.mesa_estados_historial
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para mesa_tracking
CREATE POLICY "Personal puede ver tracking de mesas" ON public.mesa_tracking
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema puede insertar tracking" ON public.mesa_tracking
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema puede actualizar tracking" ON public.mesa_tracking
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para métricas_diarias
CREATE POLICY "Personal puede ver métricas" ON public.metricas_diarias
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema puede gestionar métricas" ON public.metricas_diarias
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para cliente_analytics
CREATE POLICY "Personal puede ver analytics de clientes" ON public.cliente_analytics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema puede gestionar cliente analytics" ON public.cliente_analytics
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- =============================
CREATE INDEX idx_mesa_tracking_fecha ON public.mesa_tracking (fecha);
CREATE INDEX idx_mesa_tracking_mesa_fecha ON public.mesa_tracking (mesa_id, fecha);
CREATE INDEX idx_mesa_tracking_reserva ON public.mesa_tracking (reserva_id);

CREATE INDEX idx_mesa_historial_mesa ON public.mesa_estados_historial (mesa_id);
CREATE INDEX idx_mesa_historial_timestamp ON public.mesa_estados_historial (timestamp_cambio);

CREATE INDEX idx_metricas_fecha ON public.metricas_diarias (fecha);
CREATE INDEX idx_metricas_mesa_fecha ON public.metricas_diarias (mesa_id, fecha);

CREATE INDEX idx_cliente_analytics_tipo ON public.cliente_analytics (tipo_cliente);
CREATE INDEX idx_cliente_analytics_zona ON public.cliente_analytics (zona_preferida);
