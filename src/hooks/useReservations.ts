
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Reserva, ReservaFormData } from '@/types/database';

export function useReservations(filters?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      // Consulta optimizada con menos JOINs y paginación
      let query = supabase
        .from('reservas')
        .select(`
          id,
          cliente_id,
          mesa_id,
          fecha_reserva,
          hora_reserva,
          numero_comensales,
          estado_reserva,
          origen_reserva,
          notas_cliente,
          fecha_creacion,
          clientes!inner(
            id,
            nombre,
            apellido,
            email,
            telefono,
            vip_status
          ),
          mesas(
            id,
            numero_mesa,
            capacidad
          )
        `)
        .order('fecha_reserva', { ascending: false })
        .order('hora_reserva', { ascending: true });

      // Aplicar filtros
      if (filters?.fecha_inicio) {
        query = query.gte('fecha_reserva', filters.fecha_inicio);
      }
      
      if (filters?.fecha_fin) {
        query = query.lte('fecha_reserva', filters.fecha_fin);
      }
      
      if (filters?.estado) {
        query = query.eq('estado_reserva', filters.estado);
      }

      // Implementar paginación
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50); // Límite por defecto
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Reserva[];
    },
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Mantener en cache por 5 minutos
    refetchOnWindowFocus: false,
  });
}

// Hook optimizado para el dashboard con menos datos
export function useTodayReservations() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['today-reservations', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          hora_reserva,
          numero_comensales,
          estado_reserva,
          clientes!inner(
            nombre,
            apellido,
            vip_status
          ),
          mesas(
            numero_mesa
          )
        `)
        .eq('fecha_reserva', today)
        .order('hora_reserva')
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
    refetchInterval: 60000, // Refetch cada minuto para datos en tiempo real
  });
}

// Hook para estadísticas usando la vista materializada
export function useReservationStats(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['reservation-stats', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_stats_daily')
        .select('*')
        .eq('fecha_reserva', targetDate)
        .single();
      
      if (error) {
        // Si no existe en la vista materializada, calcular en tiempo real
        const { data: liveData, error: liveError } = await supabase
          .from('reservas')
          .select('estado_reserva, numero_comensales')
          .eq('fecha_reserva', targetDate);
        
        if (liveError) throw liveError;
        
        const stats = {
          fecha_reserva: targetDate,
          total_reservas: liveData.length,
          confirmadas: liveData.filter(r => r.estado_reserva === 'confirmada').length,
          pendientes: liveData.filter(r => r.estado_reserva === 'pendiente_confirmacion').length,
          completadas: liveData.filter(r => r.estado_reserva === 'completada').length,
          total_comensales: liveData.reduce((sum, r) => sum + r.numero_comensales, 0),
        };
        
        return stats;
      }
      
      return data;
    },
    staleTime: 300000, // Cache por 5 minutos
    gcTime: 900000, // Mantener por 15 minutos
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          clientes (*),
          mesas (*),
          personal (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Reserva;
    },
    enabled: !!id,
    staleTime: 120000, // Cache por 2 minutos
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationData: any) => {
      // Crear la reserva directamente con los campos del nuevo formulario
      const { data, error } = await supabase
        .from('reservas')
        .insert([{
          nombre: reservationData.nombre,
          email: reservationData.email,
          telefono: reservationData.telefono,
          fecha_reserva: reservationData.fecha_reserva,
          hora_reserva: reservationData.hora_reserva,
          personas: reservationData.personas,
          ocasion: reservationData.ocasion || null,
          preferencia_mesa: reservationData.preferencia_mesa,
          requisitos_dieteticos: reservationData.requisitos_dieteticos || null,
          notas: reservationData.notas || null,
          primera_visita: reservationData.primera_visita,
          estado: 'pendiente'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar múltiples queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-stats'] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reserva> & { id: string }) => {
      const { data, error } = await supabase
        .from('reservas')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          clientes (*),
          mesas (*),
          personal (*)
        `)
        .single();
      
      if (error) throw error;
      return data as Reserva;
    },
    onSuccess: (data) => {
      // Invalidación selectiva para mejor rendimiento
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-stats'] });
      queryClient.setQueryData(['reservation', data.id], data);
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-stats'] });
    },
  });
}

export function useAvailableTables(fecha: string, hora: string, comensales: number) {
  return useQuery({
    queryKey: ['available-tables', fecha, hora, comensales],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('verificar_disponibilidad_mesa', {
        p_fecha: fecha,
        p_hora_inicio: hora,
        p_num_comensales: comensales
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!(fecha && hora && comensales),
    staleTime: 60000, // Cache por 1 minuto
  });
}
