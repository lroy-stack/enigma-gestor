import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ClienteNota } from '@/types/database';

// Hook para obtener todas las notas de un cliente
export function useClienteNotas(clienteId: string) {
  return useQuery({
    queryKey: ['cliente-notas', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cliente_notas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClienteNota[];
    },
    enabled: !!clienteId,
    staleTime: 60000, // 1 minuto
  });
}

// Hook para crear una nueva nota de cliente
export function useCreateClienteNota() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (notaData: Omit<ClienteNota, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('cliente_notas')
        .insert([{
          ...notaData,
          tipo: notaData.tipo || 'general',
          es_importante: notaData.es_importante || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ClienteNota;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-notas', data.cliente_id] });
      toast({
        title: 'Nota agregada',
        description: 'La nota del cliente se ha guardado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error creating nota:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar la nota',
        variant: 'destructive',
      });
    },
  });
}

// Hook para actualizar una nota de cliente
export function useUpdateClienteNota() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClienteNota> & { id: string }) => {
      const { data, error } = await supabase
        .from('cliente_notas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ClienteNota;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-notas', data.cliente_id] });
      toast({
        title: 'Nota actualizada',
        description: 'La nota se ha actualizado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error updating nota:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la nota',
        variant: 'destructive',
      });
    },
  });
}

// Hook para eliminar una nota de cliente
export function useDeleteClienteNota() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cliente_notas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (_, id) => {
      // Invalidar todas las notas ya que no sabemos el cliente_id
      queryClient.invalidateQueries({ queryKey: ['cliente-notas'] });
      toast({
        title: 'Nota eliminada',
        description: 'La nota se ha eliminado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error deleting nota:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la nota',
        variant: 'destructive',
      });
    },
  });
}