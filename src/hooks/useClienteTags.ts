import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ClienteTag } from '@/types/database';

// Hook para obtener todos los tags de un cliente
export function useClienteTags(clienteId: string) {
  return useQuery({
    queryKey: ['cliente-tags', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cliente_tags')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClienteTag[];
    },
    enabled: !!clienteId,
    staleTime: 60000, // 1 minuto
  });
}

// Hook para obtener todos los tags únicos (para autocompletado)
export function useAllTags() {
  return useQuery({
    queryKey: ['all-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cliente_tags')
        .select('tag, color')
        .order('tag');
      
      if (error) throw error;
      
      // Remover duplicados
      const uniqueTags = data?.reduce((acc, current) => {
        const existingTag = acc.find(tag => tag.tag === current.tag);
        if (!existingTag) {
          acc.push(current);
        }
        return acc;
      }, [] as { tag: string; color: string }[]);
      
      return uniqueTags || [];
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para crear un nuevo tag de cliente
export function useCreateClienteTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tagData: Omit<ClienteTag, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('cliente_tags')
        .insert([{
          ...tagData,
          color: tagData.color || '#3B82F6',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ClienteTag;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-tags', data.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['all-tags'] });
      toast({
        title: 'Tag agregado',
        description: `Tag "${data.tag}" agregado al cliente`,
      });
    },
    onError: (error) => {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar el tag',
        variant: 'destructive',
      });
    },
  });
}

// Hook para eliminar un tag de cliente
export function useDeleteClienteTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cliente_tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-tags'] });
      queryClient.invalidateQueries({ queryKey: ['all-tags'] });
      toast({
        title: 'Tag eliminado',
        description: 'El tag se ha eliminado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el tag',
        variant: 'destructive',
      });
    },
  });
}