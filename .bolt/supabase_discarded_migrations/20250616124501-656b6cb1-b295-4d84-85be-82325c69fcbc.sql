
-- Crear tabla para tipos de notificaciones
CREATE TABLE public.notification_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL, -- Para iconos de lucide-react
  color TEXT NOT NULL DEFAULT '#237584',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla principal de notificaciones
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type_code TEXT NOT NULL REFERENCES public.notification_types(code),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'high', 'normal', 'low'
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- Datos específicos de cada notificación
  actions JSONB DEFAULT '[]'::jsonb, -- Acciones disponibles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  -- Relaciones opcionales
  reserva_id UUID REFERENCES public.reservas(id),
  cliente_id UUID REFERENCES public.clientes(id),
  mesa_id UUID REFERENCES public.mesas(id),
  personal_id UUID REFERENCES public.personal(id)
);

-- Insertar tipos de notificaciones predefinidos
INSERT INTO public.notification_types (code, name, description, icon_name, color) VALUES
('nueva_reserva', 'Nueva Reserva', 'Nueva reserva recibida', 'calendar', '#237584'),
('cliente_llego', 'Cliente Llegó', 'Cliente ha llegado al restaurante', 'user-check', '#007AFF'),
('cancelacion', 'Cancelación', 'Reserva cancelada', 'x-circle', '#FF3B30'),
('no_show', 'No Show', 'Cliente no se presentó', 'user-x', '#FF3B30'),
('modificacion', 'Modificación', 'Reserva modificada', 'edit', '#FF9500'),
('vip_recordatorio', 'VIP', 'Recordatorio cliente VIP', 'crown', '#CB5910'),
('confirmacion_pendiente', 'Confirmación Pendiente', 'Necesita confirmación', 'clock', '#FF9500'),
('problema_mesa', 'Problema Mesa', 'Problema con mesa', 'alert-triangle', '#FF3B30'),
('ocupacion_alta', 'Ocupación Alta', 'Alta ocupación del restaurante', 'bar-chart-3', '#9FB289'),
('recordatorio', 'Recordatorio', 'Recordatorio general', 'bell', '#6B7280'),
('sistema', 'Sistema', 'Notificación del sistema', 'settings', '#6B7280');

-- Índices para optimizar consultas
CREATE INDEX idx_notifications_type_code ON public.notifications(type_code);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON public.notifications(priority);
CREATE INDEX idx_notifications_expires_at ON public.notifications(expires_at);
CREATE INDEX idx_notifications_reserva_id ON public.notifications(reserva_id);
CREATE INDEX idx_notifications_cliente_id ON public.notifications(cliente_id);

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, read_at = now()
  WHERE id = notification_id;
  
  RETURN FOUND;
END;
$$;

-- Función para marcar todas las notificaciones como leídas
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = true, read_at = now()
  WHERE is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Función para limpiar notificaciones expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Función para crear notificación
CREATE OR REPLACE FUNCTION public.create_notification(
  p_type_code TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_data JSONB DEFAULT '{}'::jsonb,
  p_actions JSONB DEFAULT '[]'::jsonb,
  p_reserva_id UUID DEFAULT NULL,
  p_cliente_id UUID DEFAULT NULL,
  p_mesa_id UUID DEFAULT NULL,
  p_personal_id UUID DEFAULT NULL,
  p_expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  expires_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular fecha de expiración si se proporciona
  IF p_expires_hours IS NOT NULL THEN
    expires_timestamp := now() + (p_expires_hours || ' hours')::INTERVAL;
  END IF;
  
  INSERT INTO public.notifications (
    type_code, title, message, priority, data, actions,
    reserva_id, cliente_id, mesa_id, personal_id, expires_at
  ) VALUES (
    p_type_code, p_title, p_message, p_priority, p_data, p_actions,
    p_reserva_id, p_cliente_id, p_mesa_id, p_personal_id, expires_timestamp
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger para crear notificación automática cuando se crea una reserva
CREATE OR REPLACE FUNCTION public.trigger_notification_nueva_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cliente_nombre TEXT;
BEGIN
  -- Obtener nombre del cliente
  SELECT CONCAT(nombre, ' ', apellido) INTO cliente_nombre
  FROM public.clientes WHERE id = NEW.cliente_id;
  
  -- Crear notificación
  PERFORM public.create_notification(
    'nueva_reserva',
    'Nueva Reserva Recibida',
    cliente_nombre || ' ha creado una nueva reserva para ' || NEW.numero_comensales || ' personas',
    'normal',
    jsonb_build_object(
      'reserva_id', NEW.id,
      'cliente_nombre', cliente_nombre,
      'fecha', NEW.fecha_reserva,
      'hora', NEW.hora_reserva,
      'comensales', NEW.numero_comensales,
      'origen', NEW.origen_reserva
    ),
    '["ver_reserva", "confirmar"]'::jsonb,
    NEW.id,
    NEW.cliente_id
  );
  
  RETURN NEW;
END;
$$;

-- Crear trigger para nuevas reservas
CREATE TRIGGER trigger_notification_nueva_reserva
  AFTER INSERT ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notification_nueva_reserva();

-- Trigger para notificación de cancelación
CREATE OR REPLACE FUNCTION public.trigger_notification_cancelacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cliente_nombre TEXT;
BEGIN
  -- Solo si el estado cambió a cancelado
  IF OLD.estado_reserva != NEW.estado_reserva AND 
     NEW.estado_reserva IN ('cancelada_usuario', 'cancelada_restaurante') THEN
    
    -- Obtener nombre del cliente
    SELECT CONCAT(nombre, ' ', apellido) INTO cliente_nombre
    FROM public.clientes WHERE id = NEW.cliente_id;
    
    -- Crear notificación
    PERFORM public.create_notification(
      'cancelacion',
      'Reserva Cancelada',
      cliente_nombre || ' ha cancelado su reserva para ' || NEW.fecha_reserva,
      'normal',
      jsonb_build_object(
        'reserva_id', NEW.id,
        'cliente_nombre', cliente_nombre,
        'fecha', NEW.fecha_reserva,
        'hora', NEW.hora_reserva,
        'motivo', COALESCE(NEW.notas_restaurante, 'Sin motivo especificado')
      ),
      '["reasignar_mesa"]'::jsonb,
      NEW.id,
      NEW.cliente_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para cancelaciones
CREATE TRIGGER trigger_notification_cancelacion
  AFTER UPDATE ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notification_cancelacion();
