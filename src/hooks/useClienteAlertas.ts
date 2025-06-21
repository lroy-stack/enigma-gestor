import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ClienteAlerta } from '@/types/database';

// Hook para obtener todas las alertas de un cliente
export function useClienteAlertas(clienteId: string) {
  return useQuery({
    queryKey: ['cliente-alertas', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cliente_alertas')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('activa', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClienteAlerta[];
    },
    enabled: !!clienteId,
    staleTime: 60000, // 1 minuto
  });
}

// Hook para obtener todas las alertas activas
export function useAlertasActivas() {
  return useQuery({
    queryKey: ['alertas-activas'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('cliente_alertas')
        .select(`
          *,
          contacts:cliente_id (
            id,
            name,
            last_name,
            email
          )
        `)
        .eq('activa', true)
        .or(`fecha_fin.is.null,fecha_fin.gte.${today}`)
        .lte('fecha_inicio', today)
        .order('severidad', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });
}

// Hook para crear una nueva alerta de cliente
export function useCreateClienteAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (alertaData: Omit<ClienteAlerta, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('cliente_alertas')
        .insert([{
          ...alertaData,
          severidad: alertaData.severidad || 'media',
          activa: alertaData.activa !== false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ClienteAlerta;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-alertas', data.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['alertas-activas'] });
      toast({
        title: 'Alerta creada',
        description: 'La alerta del cliente se ha creado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error creating alerta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la alerta',
        variant: 'destructive',
      });
    },
  });
}

// Hook para actualizar una alerta de cliente
export function useUpdateClienteAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClienteAlerta> & { id: string }) => {
      const { data, error } = await supabase
        .from('cliente_alertas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ClienteAlerta;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-alertas', data.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['alertas-activas'] });
      toast({
        title: 'Alerta actualizada',
        description: 'La alerta se ha actualizado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error updating alerta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la alerta',
        variant: 'destructive',
      });
    },
  });
}

// Hook para desactivar una alerta
export function useDeactivateClienteAlerta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('cliente_alertas')
        .update({ activa: false })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ClienteAlerta;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-alertas', data.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['alertas-activas'] });
      toast({
        title: 'Alerta desactivada',
        description: 'La alerta se ha desactivado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error deactivating alerta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desactivar la alerta',
        variant: 'destructive',
      });
    },
  });
}