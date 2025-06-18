
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mesas')
        .select('*')
        .order('numero_mesa');
      
      if (error) throw error;
      
      return data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTable(id: string) {
  return useQuery({
    queryKey: ['table', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mesas')
        .select(`
          *,
          mesa_estados (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (table: any) => {
      const { data, error } = await supabase
        .from('mesas')
        .insert([table])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tables-with-states'] });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('mesas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tables-with-states'] });
    },
  });
}

// Nuevas funciones para combinaciones
export function useTableCombinations() {
  return useQuery({
    queryKey: ['table-combinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mesa_combinaciones')
        .select(`
          *,
          mesas!mesa_combinaciones_mesa_principal_id_fkey (*)
        `)
        .eq('activa', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteTableCombination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (combinationId: string) => {
      const { error } = await supabase
        .from('mesa_combinaciones')
        .update({ activa: false })
        .eq('id', combinationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-combinations'] });
    },
  });
}
