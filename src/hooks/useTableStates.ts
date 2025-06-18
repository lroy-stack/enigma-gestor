
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MesaEstado, validateMesaEstado, ZonaMesa } from '@/types/mesa';

export interface TableState {
  id: string;
  mesa_id: string;
  estado: MesaEstado;
  reserva_id?: string;
  tiempo_ocupacion?: string;
  tiempo_estimado_liberacion?: string;
  numero_comensales?: number;
  notas_estado?: string;
  updated_at: string;
}

export interface TableWithState {
  id: string;
  numero_mesa: string;
  capacidad: number;
  tipo_mesa: string;
  zona: ZonaMesa;
  ubicacion_descripcion?: string;
  activa: boolean;
  position_x: number;
  position_y: number;
  notas_mesa?: string;
  es_combinable: boolean;
  estado?: TableState;
}

export function useTablesWithStates() {
  return useQuery({
    queryKey: ['tables-with-states'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mesas')
        .select(`
          *,
          estados_mesa (*)
        `)
        .eq('activa', true)
        .order('numero_mesa');
      
      if (error) throw error;
      
      return data.map(table => ({
        ...table,
        estado: table.estados_mesa?.[0] || null
      })) as TableWithState[];
    },
  });
}

export function useUpdateTableState() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      mesaId, 
      estado, 
      reservaId, 
      tiempoEstimado, 
      notas 
    }: {
      mesaId: string;
      estado: MesaEstado;
      reservaId?: string;
      tiempoEstimado?: string;
      notas?: string;
    }) => {
      const { data, error } = await supabase.rpc('actualizar_estado_mesa', {
        p_mesa_id: mesaId,
        p_nuevo_estado: estado,
        p_reserva_id: reservaId,
        p_tiempo_estimado_liberacion: tiempoEstimado,
        p_notas: notas
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables-with-states'] });
      toast.success('Estado de mesa actualizado');
    },
    onError: (error) => {
      console.error('Error updating table state:', error);
      toast.error('Error al actualizar estado de mesa');
    },
  });
}

export function useTableSuggestions() {
  return useMutation({
    mutationFn: async ({ 
      numComensales, 
      zonaPreferida 
    }: {
      numComensales: number;
      zonaPreferida?: string;
    }) => {
      const { data, error } = await supabase.rpc('sugerir_mesas_para_reserva', {
        p_num_comensales: numComensales,
        p_zona_preferida: zonaPreferida
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error getting table suggestions:', error);
      toast.error('Error al obtener sugerencias de mesas');
    },
  });
}

export function useApplyTableCombination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      mesasIds, 
      reservaId, 
      nombreCombinacion 
    }: {
      mesasIds: string[];
      reservaId: string;
      nombreCombinacion?: string;
    }) => {
      const { data, error } = await supabase.rpc('aplicar_combinacion_mesa', {
        p_mesas_ids: mesasIds,
        p_reserva_id: reservaId,
        p_nombre_combinacion: nombreCombinacion
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables-with-states'] });
      toast.success('Combinación de mesas aplicada exitosamente');
    },
    onError: (error) => {
      console.error('Error applying table combination:', error);
      toast.error('Error al aplicar combinación de mesas');
    },
  });
}
