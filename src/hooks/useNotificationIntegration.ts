import { useEffect, useCallback } from 'react';
import { useNotificationEmitter } from './useNotificationEmitter';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para integrar notificaciones automáticas con las operaciones existentes
 * Este hook se encarga de escuchar cambios en las queries y emitir notificaciones accordingly
 */
export const useNotificationIntegration = () => {
  const { emitReservaEvent, emitClienteEvent, emitMesaEvent, emit } = useNotificationEmitter();
  const queryClient = useQueryClient();

  // Función para detectar cambios en reservas y emitir notificaciones
  const handleReservationChange = useCallback((
    oldData: any[],
    newData: any[],
    queryKey: string[]
  ) => {
    if (!oldData || !newData) return;

    // Detectar nuevas reservas
    const newReservations = newData.filter(newRes => 
      !oldData.find(oldRes => oldRes.id === newRes.id)
    );

    newReservations.forEach(reserva => {
      emitReservaEvent('reserva_nueva_creada', reserva, {
        timestamp: new Date().toISOString(),
        source: 'app'
      });
    });

    // Detectar cambios en reservas existentes
    newData.forEach(newRes => {
      const oldRes = oldData.find(old => old.id === newRes.id);
      if (oldRes) {
        // Detectar cambio de estado
        if (oldRes.estado !== newRes.estado) {
          switch (newRes.estado) {
            case 'confirmada':
              emitReservaEvent('reserva_confirmada', newRes);
              break;
            case 'cancelada':
              emitReservaEvent('reserva_cancelada_usuario', newRes);
              break;
            case 'no_show':
              emitReservaEvent('reserva_proxima_15min', newRes); // Placeholder for no_show event
              break;
          }
        }

        // Detectar modificaciones en datos
        const fieldsToCheck = ['fecha_reserva', 'hora_reserva', 'personas', 'notas'];
        const hasChanges = fieldsToCheck.some(field => oldRes[field] !== newRes[field]);
        
        if (hasChanges) {
          emitReservaEvent('reserva_modificada', newRes, {
            changes: fieldsToCheck.reduce((acc, field) => {
              if (oldRes[field] !== newRes[field]) {
                acc[field] = { old: oldRes[field], new: newRes[field] };
              }
              return acc;
            }, {} as any)
          });
        }
      }
    });
  }, [emitReservaEvent]);

  // Función para detectar cambios en clientes y emitir notificaciones
  const handleClienteChange = useCallback((
    oldData: any[],
    newData: any[],
    queryKey: string[]
  ) => {
    if (!oldData || !newData) return;

    // Detectar nuevos clientes
    const newClientes = newData.filter(newClient => 
      !oldData.find(oldClient => oldClient.id === newClient.id)
    );

    newClientes.forEach(cliente => {
      emitClienteEvent('cliente_nuevo_primera_visita', cliente, {
        timestamp: new Date().toISOString(),
        first_visit: true
      });
    });

    // Detectar cambios en status VIP
    newData.forEach(newClient => {
      const oldClient = oldData.find(old => old.id === newClient.id);
      if (oldClient && oldClient.vip_status !== newClient.vip_status && newClient.vip_status) {
        emitClienteEvent('cliente_vip_reserva', newClient, {
          vip_upgrade: true,
          timestamp: new Date().toISOString()
        });
      }
    });
  }, [emitClienteEvent]);

  // Función para detectar cambios en mesas y emitir notificaciones
  const handleMesaChange = useCallback((
    oldData: any[],
    newData: any[],
    queryKey: string[]
  ) => {
    if (!oldData || !newData) return;

    newData.forEach(newMesa => {
      const oldMesa = oldData.find(old => old.id === newMesa.id);
      if (oldMesa) {
        // Detectar cambios de estado
        if (oldMesa.estado !== newMesa.estado) {
          switch (newMesa.estado) {
            case 'ocupada':
              emitMesaEvent('mesa_ocupada', newMesa);
              break;
            case 'libre':
              emitMesaEvent('mesa_liberada', newMesa);
              break;
            case 'fuera_servicio':
              emitMesaEvent('mesa_tiempo_limite_100', newMesa); // Placeholder for out of service
              break;
          }
        }

        // Detectar cambios en disponibilidad
        if (oldMesa.activa !== newMesa.activa && !newMesa.activa) {
          emit({
            eventType: 'mesa_fuera_servicio',
            title: 'Mesa Fuera de Servicio',
            message: `Mesa ${newMesa.numero_mesa} marcada como fuera de servicio`,
            priority: 'high',
            data: { mesa: newMesa, reason: 'manual_disable' },
            actions: ['Reasignar reservas', 'Contactar mantenimiento'],
            mesa_id: newMesa.id
          });
        }
      }
    });
  }, [emitMesaEvent, emit]);

  // Escuchar cambios en las queries del QueryClient
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.status === 'success') {
        const queryKey = event.query.queryKey;
        const currentData = event.query.state.data;
        const previousData = event.query.state.dataUpdatedAt > 0 ? 
          queryClient.getQueryData(queryKey) : null;

        // Solo procesar si hay datos previos (evitar notificaciones en carga inicial)
        if (previousData && Array.isArray(currentData) && Array.isArray(previousData)) {
          const keyString = queryKey.join('-');
          
          // Routing basado en el tipo de query
          if (keyString.includes('reservation')) {
            handleReservationChange(previousData, currentData, queryKey as string[]);
          } else if (keyString.includes('customer') || keyString.includes('cliente')) {
            handleClienteChange(previousData, currentData, queryKey as string[]);
          } else if (keyString.includes('mesa') || keyString.includes('table')) {
            handleMesaChange(previousData, currentData, queryKey as string[]);
          }
        }
      }
    });

    return unsubscribe;
  }, [queryClient, handleReservationChange, handleClienteChange, handleMesaChange]);

  // Función manual para emitir notificaciones específicas
  const emitConfigurationChange = useCallback((
    changeType: 'hours' | 'capacity' | 'policy' | 'menu',
    changeData: any
  ) => {
    const eventMap = {
      hours: {
        eventType: 'horario_modificado' as const,
        title: 'Horarios Modificados',
        message: 'Los horarios de operación han sido actualizados'
      },
      capacity: {
        eventType: 'capacidad_modificada' as const,
        title: 'Capacidad Modificada',
        message: 'La capacidad del restaurante ha sido modificada'
      },
      policy: {
        eventType: 'politica_cancelacion_cambiada' as const,
        title: 'Política de Cancelación',
        message: 'Las políticas de cancelación han sido actualizadas'
      },
      menu: {
        eventType: 'menu_actualizado' as const,
        title: 'Menú Actualizado',
        message: 'El menú ha sido actualizado con nuevos elementos'
      }
    };

    const config = eventMap[changeType];
    if (config) {
      emit({
        ...config,
        priority: 'high',
        data: changeData,
        actions: ['Actualizar sistema', 'Comunicar a personal']
      });
    }
  }, [emit]);

  // Función para verificar eventos basados en tiempo
  const checkTimeBasedEvents = useCallback(async () => {
    try {
      // Aquí implementaremos la lógica para verificar:
      // - Reservas próximas (15 min, 2 horas)
      // - Mesas con tiempo excedido
      // - Clientes inactivos
      // - Cumpleaños de clientes
      
      const now = new Date();
      
      // Esta lógica se implementará cuando tengamos acceso a los datos
      console.log('🕐 Verificando eventos basados en tiempo...', now);
      
    } catch (error) {
      console.error('Error verificando eventos basados en tiempo:', error);
    }
  }, []);

  // Configurar verificación periódica de eventos basados en tiempo
  useEffect(() => {
    const interval = setInterval(checkTimeBasedEvents, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, [checkTimeBasedEvents]);

  return {
    emitConfigurationChange,
    checkTimeBasedEvents,
    // Exponer los emitters para uso manual
    emitReservaEvent,
    emitClienteEvent,
    emitMesaEvent,
    emit
  };
};