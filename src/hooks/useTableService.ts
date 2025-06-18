
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStartTableService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      mesaId,
      numeroComensales,
      reservaId,
      ingresosEstimados
    }: {
      mesaId: string;
      numeroComensales?: number;
      reservaId?: string;
      ingresosEstimados?: number;
    }) => {
      const { data, error } = await supabase.rpc('iniciar_servicio_mesa', {
        p_mesa_id: mesaId,
        p_numero_comensales: numeroComensales,
        p_reserva_id: reservaId,
        p_ingresos_estimados: ingresosEstimados
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables-with-states'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-stats'] });
      toast.success('Servicio iniciado correctamente');
    },
    onError: (error) => {
      console.error('Error iniciando servicio:', error);
      toast.error('Error al iniciar servicio');
    },
  });
}

export function useFinishTableService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      mesaId,
      ingresosReales
    }: {
      mesaId: string;
      ingresosReales?: number;
    }) => {
      const { data, error } = await supabase.rpc('finalizar_servicio_mesa', {
        p_mesa_id: mesaId,
        p_ingresos_reales: ingresosReales
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables-with-states'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-stats'] });
      toast.success('Servicio finalizado, mesa en limpieza');
    },
    onError: (error) => {
      console.error('Error finalizando servicio:', error);
      toast.error('Error al finalizar servicio');
    },
  });
}

export function useUpdateDailyMetrics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('actualizar_metricas_diarias');
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-metrics'] });
      toast.success('Métricas actualizadas');
    },
    onError: (error) => {
      console.error('Error actualizando métricas:', error);
      toast.error('Error al actualizar métricas');
    },
  });
}
