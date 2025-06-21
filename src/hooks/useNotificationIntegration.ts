import { useEffect, useCallback } from 'react';
import { useNotificationEmitter } from './useNotificationEmitter';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes, parseISO } from 'date-fns';

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
              emitReservaEvent('reserva_no_show', newRes);
              break;
          }
        }

        // Detectar modificaciones en datos
        const fieldsToCheck = ['fecha_reserva', 'hora_reserva', 'personas', 'notas', 'preferencia_mesa', 'requisitos_dieteticos'];
        const hasChanges = fieldsToCheck.some(field => oldRes[field] !== newRes[field]);
        
        if (hasChanges && oldRes.estado === newRes.estado) { // Solo notificar si no es cambio de estado
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

    // Detectar cambios en clientes existentes
    newData.forEach(newClient => {
      const oldClient = oldData.find(old => old.id === newClient.id);
      if (oldClient) {
        // Campos a verificar para detectar cambios importantes
        const fieldsToCheck = [
          'name', 'last_name', 'email', 'phone', 
          'vip_status', 'preferencias_comida', 'restricciones_dieteticas',
          'notas_internas'
        ];
        
        const hasChanges = fieldsToCheck.some(field => oldClient[field] !== newClient[field]);
        
        if (hasChanges) {
          const changes = fieldsToCheck.reduce((acc, field) => {
            if (oldClient[field] !== newClient[field]) {
              acc[field] = { old: oldClient[field], new: newClient[field] };
            }
            return acc;
          }, {} as any);
          
          // Destacar cambio de estado VIP
          if (oldClient.vip_status !== newClient.vip_status && newClient.vip_status) {
            emitClienteEvent('cliente_vip_reserva', newClient, {
              vip_upgrade: true,
              timestamp: new Date().toISOString(),
              changes
            });
          } else {
            // Otros cambios en el cliente
            emit({
              eventType: 'cliente_modificado' as any,
              title: 'Contacto Modificado',
              message: `Información de ${newClient.name} ${newClient.last_name} ha sido actualizada`,
              priority: 'normal',
              data: {
                client: newClient,
                changes,
                timestamp: new Date().toISOString()
              },
              actions: ['Ver perfil', 'Ver cambios'],
              cliente_id: newClient.id
            });
          }
        }
      }
    });
  }, [emitClienteEvent, emit]);

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
              emitMesaEvent('mesa_fuera_servicio', newMesa);
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
      console.log('🕐 Verificando eventos basados en tiempo...');

      // Comprobar reservas próximas (15 min)
      const now = new Date();
      const { data: upcomingReservations, error } = await supabase.rpc(
        'check_upcoming_reservations',
        { p_time_window_minutes: 15, p_max_notifications: 5 }
      );

      if (error) throw error;

      if (upcomingReservations && upcomingReservations.length > 0) {
        console.log(`✅ Encontradas ${upcomingReservations.length} reservas próximas`);

        // Emitir notificaciones para cada reserva próxima
        upcomingReservations.forEach((reservation: any) => {
          // Convertimos los datos de la reserva al formato esperado por emitReservaEvent
          const reservaData = {
            id: reservation.reserva_id,
            nombre: reservation.data.cliente_nombre,
            fecha_reserva: reservation.data.fecha_reserva,
            hora_reserva: reservation.data.hora_reserva,
            personas: reservation.data.personas,
            mesa: reservation.data.mesa_asignada
          };

          emitReservaEvent('reserva_proxima_15min', reservaData, {
            detected_by: 'time_check',
            timestamp: new Date().toISOString()
          });
        });
      } else {
        console.log('ℹ️ No hay reservas próximas en este momento');
      }

      // Aquí podrían añadirse más verificaciones basadas en tiempo:
      // - Mesas con tiempo excedido
      // - Clientes con cumpleaños próximos
      // - Reservas que no se han confirmado y la fecha se acerca
      
    } catch (error) {
      console.error('❌ Error verificando eventos basados en tiempo:', error);
    }
  }, [emitReservaEvent]);

  // Configurar verificación periódica de eventos basados en tiempo
  useEffect(() => {
    // Ejecutar verificación inicial después de un breve retraso
    const initialTimeout = setTimeout(() => {
      checkTimeBasedEvents();
    }, 5000); // 5 segundos después de cargar

    // Configurar intervalo regular
    const interval = setInterval(checkTimeBasedEvents, 60000); // Cada minuto
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
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