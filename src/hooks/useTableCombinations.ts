
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TableCombination } from '@/types/database';

export { type TableCombination };

export function useTableCombinations() {
  return useQuery({
    queryKey: ['table-combinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('combinaciones_mesa')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TableCombination[];
    },
    staleTime: 60000,
  });
}

export function useCreateTableCombination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (combination: Omit<TableCombination, 'id' | 'created_at' | 'updated_at' | 'mesas_combinadas'>) => {
      const { data, error } = await supabase
        .from('combinaciones_mesa')
        .insert([combination])
        .select()
        .single();
      
      if (error) throw error;
      return data as TableCombination;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-combinations'] });
    },
  });
}

export function useDeleteTableCombination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (combinationId: string) => {
      const { error } = await supabase
        .from('combinaciones_mesa')
        .update({ activa: false })
        .eq('id', combinationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-combinations'] });
    },
  });
}
