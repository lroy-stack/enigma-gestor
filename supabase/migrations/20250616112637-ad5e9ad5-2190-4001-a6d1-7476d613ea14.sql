
-- Crear tabla para tags/categorías de clientes
CREATE TABLE public.cliente_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tag_nombre TEXT NOT NULL,
  tag_color TEXT DEFAULT '#237584',
  creado_por UUID REFERENCES public.personal(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para notas de clientes
CREATE TABLE public.cliente_notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  tipo_nota TEXT DEFAULT 'general', -- 'general', 'preferencia', 'alerta', 'seguimiento'
  es_privada BOOLEAN DEFAULT false,
  creado_por UUID REFERENCES public.personal(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para alertas y recordatorios
CREATE TABLE public.cliente_alertas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL, -- 'seguimiento', 'cumpleanos', 'inactividad', 'personalizada'
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_alerta DATE NOT NULL,
  hora_alerta TIME,
  completada BOOLEAN DEFAULT false,
  creado_por UUID REFERENCES public.personal(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para historial de interacciones
CREATE TABLE public.cliente_interacciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_interaccion TEXT NOT NULL, -- 'reserva', 'visita', 'llamada', 'email', 'whatsapp', 'nota'
  descripcion TEXT,
  fecha_interaccion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB, -- datos adicionales específicos del tipo de interacción
  creado_por UUID REFERENCES public.personal(id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_cliente_tags_cliente_id ON public.cliente_tags(cliente_id);
CREATE INDEX idx_cliente_notas_cliente_id ON public.cliente_notas(cliente_id);
CREATE INDEX idx_cliente_alertas_cliente_id ON public.cliente_alertas(cliente_id);
CREATE INDEX idx_cliente_alertas_fecha ON public.cliente_alertas(fecha_alerta, completada);
CREATE INDEX idx_cliente_interacciones_cliente_id ON public.cliente_interacciones(cliente_id);
CREATE INDEX idx_cliente_interacciones_fecha ON public.cliente_interacciones(fecha_interaccion);

-- Función para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION public.actualizar_fecha_modificacion_nota()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_modificacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha de modificación en notas
CREATE TRIGGER trigger_actualizar_fecha_modificacion_nota
  BEFORE UPDATE ON public.cliente_notas
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_fecha_modificacion_nota();

-- Función para registrar interacciones automáticamente
CREATE OR REPLACE FUNCTION public.registrar_interaccion_reserva()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cliente_interacciones (
    cliente_id, 
    tipo_interaccion, 
    descripcion, 
    metadata
  ) VALUES (
    NEW.cliente_id,
    'reserva',
    'Nueva reserva creada para ' || NEW.numero_comensales || ' personas',
    jsonb_build_object(
      'reserva_id', NEW.id,
      'fecha_reserva', NEW.fecha_reserva,
      'hora_reserva', NEW.hora_reserva,
      'estado', NEW.estado_reserva
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar interacciones de reservas
CREATE TRIGGER trigger_registrar_interaccion_reserva
  AFTER INSERT ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_interaccion_reserva();
