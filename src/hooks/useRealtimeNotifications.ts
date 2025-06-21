import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNotificationEmitter } from './useNotificationEmitter';

/**
 * Hook para escuchar notificaciones en tiempo real desde la base de datos
 * Se activa automáticamente cuando hay cambios en las tablas monitoreadas
 */
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { emitReservaEvent } = useNotificationEmitter();

  useEffect(() => {
    console.log('🔔 Iniciando sistema de notificaciones en tiempo real...');

    // Suscripción a cambios en la tabla notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('🆕 Nueva notificación detectada:', payload.new);
          
          const notification = payload.new;
          
          // Actualizar las queries de notificaciones
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Mostrar toast solo para notificaciones de alta prioridad
          if (notification.priority === 'high') {
            toast.info(notification.title, {
              description: notification.message,
              duration: 8000,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Navegar a notificaciones o abrir modal según el tipo
                  window.location.href = '/notificaciones';
                }
              }
            });
          }
        }
      )
      .subscribe();

    // Suscripción a cambios en la tabla reservas para debug
    const reservasChannel = supabase
      .channel('reservas-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'reservas'
        },
        (payload) => {
          console.log(`📅 Cambio en reservas detectado (${payload.eventType}):`, payload);
          
          // Actualizar las queries de reservas
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          queryClient.invalidateQueries({ queryKey: ['today-reservations'] });
          queryClient.invalidateQueries({ queryKey: ['reservation-stats'] });
          
          // Crear notificación automática para nuevas reservas externas
          if (payload.eventType === 'INSERT') {
            console.log('🆕 Nueva reserva desde fuente externa:', {
              nombre: payload.new?.nombre,
              fecha: payload.new?.fecha_reserva,
              hora: payload.new?.hora_reserva,
              estado: payload.new?.estado
            });
            
            // Emitir evento de notificación
            const eventType = payload.new?.estado === 'confirmada' ? 'reserva_confirmada' : 'reserva_nueva_creada';
            emitReservaEvent(eventType, payload.new, {
              origen: 'fuente_externa',
              detectado_por: 'tiempo_real',
              timestamp: new Date().toISOString()
            });
          }
        }
      )
      .subscribe();

    // Función de limpieza
    return () => {
      console.log('🔕 Desconectando canales de tiempo real...');
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(reservasChannel);
    };
  }, [queryClient]);

  // Función para probar el sistema manualmente
  const testNotificationSystem = async () => {
    try {
      console.log('🧪 Probando sistema de notificaciones...');
      
      const { data, error } = await supabase.rpc('test_reservation_notifications');
      
      if (error) {
        console.error('❌ Error en prueba:', error);
        toast.error('Error en prueba del sistema de notificaciones');
        return;
      }
      
      console.log('✅ Resultados de prueba:', data);
      toast.success('Sistema de notificaciones funcionando correctamente');
      
    } catch (error) {
      console.error('❌ Error ejecutando prueba:', error);
      toast.error('Error ejecutando prueba');
    }
  };

  return {
    testNotificationSystem
  };
};