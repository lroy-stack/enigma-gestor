import { useCallback } from 'react';
import { useNotifications } from './useNotifications';

// Definir todos los tipos de eventos del sistema
export type NotificationEventType = 
  // Reservas
  | 'reserva_nueva_creada'
  | 'reserva_confirmada' 
  | 'reserva_modificada'
  | 'reserva_cancelada_usuario'
  | 'reserva_cancelada_restaurante'
  | 'reserva_no_show'
  | 'reserva_proxima_15min'
  | 'reserva_proxima_2horas'
  | 'reserva_retraso_detectado'
  | 'mesa_asignada_reserva'
  | 'mesa_no_disponible'
  | 'capacidad_maxima_alcanzada'
  
  // Clientes
  | 'cliente_vip_reserva'
  | 'cliente_nuevo_primera_visita'
  | 'cliente_cumpleanos'
  | 'cliente_aniversario'
  | 'cliente_queja_recibida'
  | 'cliente_elogio_recibido'
  | 'cliente_inactivo'
  | 'alerta_cliente_activa'
  | 'alerta_restricciones_dieteticas'
  
  // Mesas
  | 'mesa_ocupada'
  | 'mesa_liberada'
  | 'mesa_limpieza_requerida'
  | 'mesa_fuera_servicio'
  | 'mesa_tiempo_limite_75'
  | 'mesa_tiempo_limite_100'
  | 'combinacion_mesa_creada'
  | 'combinacion_mesa_disuelta'
  
  // Configuración
  | 'horario_modificado'
  | 'capacidad_modificada'
  | 'politica_cancelacion_cambiada'
  | 'menu_actualizado'
  
  // Personal
  | 'personal_nuevo_creado'
  | 'personal_rol_cambiado'
  | 'personal_desactivado'
  | 'personal_reconocimiento'
  
  // Sistema
  | 'sistema_capacidad_critica'
  | 'integracion_fallida'
  | 'informe_diario_generado'
  | 'meta_ocupacion_alcanzada'
  | 'emergencia_evacuacion'
  | 'evento_especial_activado'
  | 'tiempo_espera_excesivo'
  | 'satisfaccion_baja_detectada'
  
  // Integraciones
  | 'enigmito_ia_procesamiento'
  | 'webhook_externo_recibido';

export interface NotificationEventData {
  eventType: NotificationEventType;
  title: string;
  message: string;
  priority: 'high' | 'normal' | 'low';
  data?: any;
  actions?: string[];
  reserva_id?: string;
  cliente_id?: string;
  mesa_id?: string;
  personal_id?: string;
  expires_hours?: number;
}

// Mapeo de eventos a códigos de tipo de notificación
const EVENT_TO_TYPE_CODE: Record<NotificationEventType, string> = {
  // Reservas
  'reserva_nueva_creada': 'reservation_new',
  'reserva_confirmada': 'reservation_confirmed',
  'reserva_modificada': 'reservation_modified',
  'reserva_cancelada_usuario': 'reservation_cancelled',
  'reserva_cancelada_restaurante': 'reservation_cancelled',
  'reserva_no_show': 'reservation_no_show',
  'reserva_proxima_15min': 'reservation_upcoming',
  'reserva_proxima_2horas': 'reservation_upcoming',
  'reserva_retraso_detectado': 'reservation_delay',
  'mesa_asignada_reserva': 'table_assigned',
  'mesa_no_disponible': 'table_unavailable',
  'capacidad_maxima_alcanzada': 'capacity_full',
  
  // Clientes  
  'cliente_vip_reserva': 'customer_vip',
  'cliente_nuevo_primera_visita': 'customer_new',
  'cliente_cumpleanos': 'customer_birthday',
  'cliente_aniversario': 'customer_anniversary',
  'cliente_queja_recibida': 'customer_complaint',
  'cliente_elogio_recibido': 'customer_compliment',
  'cliente_inactivo': 'customer_inactive',
  'alerta_cliente_activa': 'customer_alert',
  'alerta_restricciones_dieteticas': 'customer_dietary',
  
  // Mesas
  'mesa_ocupada': 'table_occupied',
  'mesa_liberada': 'table_available',
  'mesa_limpieza_requerida': 'table_cleaning',
  'mesa_fuera_servicio': 'table_out_of_service',
  'mesa_tiempo_limite_75': 'table_time_warning',
  'mesa_tiempo_limite_100': 'table_time_exceeded',
  'combinacion_mesa_creada': 'table_combination_created',
  'combinacion_mesa_disuelta': 'table_combination_dissolved',
  
  // Configuración
  'horario_modificado': 'config_hours_changed',
  'capacidad_modificada': 'config_capacity_changed',
  'politica_cancelacion_cambiada': 'config_policy_changed',
  'menu_actualizado': 'config_menu_updated',
  
  // Personal
  'personal_nuevo_creado': 'staff_new',
  'personal_rol_cambiado': 'staff_role_changed',
  'personal_desactivado': 'staff_deactivated',
  'personal_reconocimiento': 'staff_recognition',
  
  // Sistema
  'sistema_capacidad_critica': 'system_capacity_critical',
  'integracion_fallida': 'system_integration_failed',
  'informe_diario_generado': 'system_daily_report',
  'meta_ocupacion_alcanzada': 'system_goal_achieved',
  'emergencia_evacuacion': 'emergency_evacuation',
  'evento_especial_activado': 'special_event_activated',
  'tiempo_espera_excesivo': 'wait_time_exceeded',
  'satisfaccion_baja_detectada': 'satisfaction_low',
  
  // Integraciones
  'enigmito_ia_procesamiento': 'ai_processing',
  'webhook_externo_recibido': 'webhook_received'
};

export const useNotificationEmitter = () => {
  const { createNotification } = useNotifications();

  const emit = useCallback(async (eventData: NotificationEventData) => {
    try {
      const typeCode = EVENT_TO_TYPE_CODE[eventData.eventType];
      
      if (!typeCode) {
        console.warn(`Tipo de evento no mapeado: ${eventData.eventType}`);
        return;
      }

      await createNotification({
        type_code: typeCode,
        title: eventData.title,
        message: eventData.message,
        priority: eventData.priority,
        data: eventData.data,
        actions: eventData.actions,
        reserva_id: eventData.reserva_id,
        cliente_id: eventData.cliente_id,
        mesa_id: eventData.mesa_id,
        personal_id: eventData.personal_id,
        expires_hours: eventData.expires_hours
      });

      console.log(`✅ Notificación emitida: ${eventData.eventType}`);
    } catch (error) {
      console.error(`❌ Error emitiendo notificación ${eventData.eventType}:`, error);
    }
  }, [createNotification]);

  // Funciones helper para eventos comunes
  const emitReservaEvent = useCallback((
    eventType: Extract<NotificationEventType, `reserva_${string}`>,
    reservaData: any,
    customData?: any
  ) => {
    const eventConfigs = {
      reserva_nueva_creada: {
        title: 'Nueva Reserva',
        message: `Mesa para ${reservaData.personas} personas el ${reservaData.fecha_reserva} a las ${reservaData.hora_reserva}`,
        priority: 'normal' as const,
        actions: ['Confirmar', 'Ver detalles', 'Contactar cliente']
      },
      reserva_confirmada: {
        title: 'Reserva Confirmada',
        message: `Reserva confirmada para ${reservaData.nombre} - ${reservaData.fecha_reserva} ${reservaData.hora_reserva}`,
        priority: 'normal' as const,
        actions: ['Ver mesa asignada', 'Agregar notas']
      },
      reserva_modificada: {
        title: 'Reserva Modificada',
        message: `Cambios en reserva de ${reservaData.nombre}`,
        priority: 'normal' as const,
        actions: ['Ver cambios', 'Confirmar disponibilidad']
      },
      reserva_cancelada_usuario: {
        title: 'Reserva Cancelada por Cliente',
        message: `${reservaData.nombre} canceló su reserva del ${reservaData.fecha_reserva}`,
        priority: 'normal' as const,
        actions: ['Contactar cliente', 'Ofrecer nueva fecha']
      },
      reserva_proxima_15min: {
        title: 'Reserva Próxima',
        message: `${reservaData.nombre} llega en 15 minutos - Mesa ${reservaData.mesa || 'por asignar'}`,
        priority: 'high' as const,
        actions: ['Preparar mesa', 'Contactar si retraso'],
        expires_hours: 1
      }
    };

    const config = eventConfigs[eventType];
    if (config) {
      emit({
        eventType,
        ...config,
        data: { ...reservaData, ...customData },
        reserva_id: reservaData.id
      });
    }
  }, [emit]);

  const emitClienteEvent = useCallback((
    eventType: Extract<NotificationEventType, `cliente_${string}` | `alerta_${string}`>,
    clienteData: any,
    customData?: any
  ) => {
    const eventConfigs = {
      cliente_vip_reserva: {
        title: 'Cliente VIP',
        message: `Cliente VIP ${clienteData.name} ${clienteData.last_name} tiene reserva`,
        priority: 'high' as const,
        actions: ['Preparar atención especial', 'Asignar mejor mesa', 'Notificar chef']
      },
      cliente_nuevo_primera_visita: {
        title: 'Cliente Nuevo',
        message: `Primera visita de ${clienteData.name} ${clienteData.last_name}`,
        priority: 'normal' as const,
        actions: ['Preparar bienvenida', 'Asignar host experimentado']
      },
      alerta_cliente_activa: {
        title: 'Alerta de Cliente',
        message: `Cliente ${clienteData.name} tiene alerta activa: ${customData?.alert_type}`,
        priority: customData?.severity || 'high' as const,
        actions: ['Ver detalles alerta', 'Seguir protocolo']
      }
    };

    const config = eventConfigs[eventType];
    if (config) {
      emit({
        eventType,
        ...config,
        data: { ...clienteData, ...customData },
        cliente_id: clienteData.id
      });
    }
  }, [emit]);

  const emitMesaEvent = useCallback((
    eventType: Extract<NotificationEventType, `mesa_${string}` | `combinacion_${string}`>,
    mesaData: any,
    customData?: any
  ) => {
    const eventConfigs = {
      mesa_ocupada: {
        title: 'Mesa Ocupada',
        message: `Mesa ${mesaData.numero_mesa} ocupada por ${customData?.party_size || 'N/A'} personas`,
        priority: 'normal' as const,
        actions: ['Iniciar timer', 'Actualizar disponibilidad']
      },
      mesa_liberada: {
        title: 'Mesa Disponible',
        message: `Mesa ${mesaData.numero_mesa} disponible`,
        priority: 'normal' as const,
        actions: ['Limpiar mesa', 'Actualizar disponibilidad']
      },
      mesa_tiempo_limite_100: {
        title: 'Mesa Excede Tiempo',
        message: `Mesa ${mesaData.numero_mesa} excede tiempo asignado`,
        priority: 'high' as const,
        actions: ['Contactar cliente', 'Ofrecer bebida gratis', 'Reubicar siguiente'],
        expires_hours: 2
      }
    };

    const config = eventConfigs[eventType];
    if (config) {
      emit({
        eventType,
        ...config,
        data: { ...mesaData, ...customData },
        mesa_id: mesaData.id
      });
    }
  }, [emit]);

  return {
    emit,
    emitReservaEvent,
    emitClienteEvent,
    emitMesaEvent
  };
};