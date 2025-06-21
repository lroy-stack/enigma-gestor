import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Reserva, ReservaFormData } from '@/types/database';

// Hook simple para obtener todas las reservas
export function useReservas() {
  return useQuery({
    queryKey: ['reservas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('fecha_reserva', { ascending: false })
        .order('hora_reserva', { ascending: true });
      
      if (error) {
        console.error('Error fetching reservas:', error);
        throw error;
      }
      
      return data as Reserva[];
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });
}

// Hook para obtener reservas de hoy
export function useReservasHoy() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['reservas-hoy', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha_reserva', today)
        .order('hora_reserva', { ascending: true });
      
      if (error) {
        console.error('Error fetching reservas hoy:', error);
        throw error;
      }
      
      return data as Reserva[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// Hook para obtener una reserva específica
export function useReserva(id: string) {
  return useQuery({
    queryKey: ['reserva', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching reserva:', error);
        throw error;
      }
      
      return data as Reserva;
    },
    enabled: !!id,
    staleTime: 60000,
  });
}

// Hook para crear nueva reserva
export function useCrearReserva() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (reservaData: ReservaFormData) => {
      const nuevaReserva = {
        ...reservaData,
        estado: 'pendiente', // Estado por defecto
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reservas')
        .insert([nuevaReserva])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating reserva:', error);
        throw error;
      }
      
      return data as Reserva;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reservas-hoy'] });
      
      toast({
        title: 'Reserva creada',
        description: `Reserva para ${data.nombre} creada correctamente`,
      });
    },
    onError: (error) => {
      console.error('Error creating reserva:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la reserva',
        variant: 'destructive',
      });
    },
  });
}

// Hook para actualizar reserva
export function useActualizarReserva() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reserva> & { id: string }) => {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating reserva:', error);
        throw error;
      }
      
      return data as Reserva;
    },
    onSuccess: (data) => {
      // Actualizar cache específico y invalidar listas
      queryClient.setQueryData(['reserva', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reservas-hoy'] });
      
      toast({
        title: 'Reserva actualizada',
        description: `Reserva de ${data.nombre} actualizada correctamente`,
      });
    },
    onError: (error) => {
      console.error('Error updating reserva:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la reserva',
        variant: 'destructive',
      });
    },
  });
}

// Hook para cambiar estado de reserva
export function useCambiarEstadoReserva() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { data, error } = await supabase
        .from('reservas')
        .update({ 
          estado,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating reserva estado:', error);
        throw error;
      }
      
      return data as Reserva;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['reserva', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reservas-hoy'] });
      
      toast({
        title: 'Estado actualizado',
        description: `Reserva de ${data.nombre} marcada como ${data.estado}`,
      });
    },
    onError: (error) => {
      console.error('Error updating estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    },
  });
}

// Hook para eliminar reserva
export function useEliminarReserva() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting reserva:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      // Remover de cache y invalidar listas
      queryClient.removeQueries({ queryKey: ['reserva', id] });
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reservas-hoy'] });
      
      toast({
        title: 'Reserva eliminada',
        description: 'La reserva ha sido eliminada correctamente',
      });
    },
    onError: (error) => {
      console.error('Error deleting reserva:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la reserva',
        variant: 'destructive',
      });
    },
  });
}

// Hook para estadísticas básicas
export function useEstadisticasReservas(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['estadisticas-reservas', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('estado, personas')
        .eq('fecha_reserva', targetDate);
      
      if (error) {
        console.error('Error fetching estadisticas:', error);
        throw error;
      }
      
      const reservas = data || [];
      
      return {
        total: reservas.length,
        pendientes: reservas.filter(r => r.estado === 'pendiente').length,
        confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
        canceladas: reservas.filter(r => r.estado === 'cancelada').length,
        completadas: reservas.filter(r => r.estado === 'completada').length,
        total_personas: reservas.reduce((sum, r) => sum + (r.personas || 0), 0),
        promedio_personas: reservas.length > 0 
          ? Math.round(reservas.reduce((sum, r) => sum + (r.personas || 0), 0) / reservas.length)
          : 0
      };
    },
    staleTime: 300000, // 5 minutos
  });
}