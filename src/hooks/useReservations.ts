import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Reserva, ReservaFormData } from '@/types/database';
import { getTodaySpain } from '@/utils/dateUtils';
import { format, addDays } from 'date-fns';

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
      console.log('🔍 useReservations - Starting query with filters:', filters);
      
      // Simplificar query similar a los hooks que funcionan
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error en useReservations:', error);
        throw error;
      }
      
      console.log(`✅ useReservations encontró ${data?.length || 0} reservas total`);
      return data || [];
    },
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Mantener en cache por 5 minutos
    refetchOnWindowFocus: false,
  });
}

// Hook optimizado para el dashboard con menos datos
export function useTodayReservations() {
  const today = getTodaySpain(); // Usar timezone de España
  
  return useQuery({
    queryKey: ['today-reservations', today],
    queryFn: async () => {
      console.log('🔍 useTodayReservations query para fecha:', today);
      
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          nombre,
          email,
          telefono,
          fecha_reserva,
          hora_reserva,
          personas,
          ocasion,
          preferencia_mesa,
          requisitos_dieteticos,
          notas,
          estado,
          primera_visita,
          created_at,
          updated_at
        `)
        .eq('fecha_reserva', today)
        .order('hora_reserva')
        .limit(20);
      
      if (error) {
        console.error('❌ Error en useTodayReservations:', error);
        throw error;
      }
      
      console.log(`✅ useTodayReservations encontró ${data?.length || 0} reservas para ${today}`);
      if (data && data.length > 0) {
        console.log('📋 Primeras reservas:', data.slice(0, 3).map(r => `${r.nombre} - ${r.hora_reserva}`));
      }
      
      return data || [];
    },
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
    refetchInterval: 60000, // Refetch cada minuto para datos en tiempo real
  });
}

// Hook para las próximas 24 horas (hoy + mañana si es necesario)
export function useNext24HoursReservations() {
  const today = getTodaySpain();
  const tomorrow = format(addDays(new Date(today), 1), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['next-24h-reservations', today, tomorrow],
    queryFn: async () => {
      console.log('🔍 useNext24HoursReservations query para fechas:', today, 'y', tomorrow);
      
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          nombre,
          email,
          telefono,
          fecha_reserva,
          hora_reserva,
          personas,
          ocasion,
          preferencia_mesa,
          requisitos_dieteticos,
          notas,
          estado,
          primera_visita,
          created_at,
          updated_at
        `)
        .in('fecha_reserva', [today, tomorrow])
        .order('fecha_reserva')
        .order('hora_reserva')
        .limit(50);
      
      if (error) {
        console.error('❌ Error en useNext24HoursReservations:', error);
        throw error;
      }
      
      console.log(`✅ useNext24HoursReservations encontró ${data?.length || 0} reservas para ${today} y ${tomorrow}`);
      if (data && data.length > 0) {
        console.log('📋 Primeras reservas:', data.slice(0, 3).map(r => `${r.nombre} - ${r.fecha_reserva} ${r.hora_reserva}`));
      }
      
      return data || [];
    },
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000,
    refetchInterval: 60000, // Refetch cada minuto para datos en tiempo real
  });
}

// Hook para estadísticas usando la vista materializada
export function useReservationStats(fecha?: string) {
  const targetDate = fecha || getTodaySpain(); // Usar timezone de España
  
  return useQuery({
    queryKey: ['reservation-stats', targetDate],
    queryFn: async () => {
      // Primero intentar con tabla de métricas diarias
      const { data: metricsData, error: metricsError } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .eq('fecha', targetDate)
        .maybeSingle();
      
      if (!metricsError && metricsData) {
        return metricsData;
      }
      
      // Si no hay métricas, calcular en tiempo real desde tabla reservas
      const { data: liveData, error: liveError } = await supabase
        .from('reservas')
        .select('estado, personas')
        .eq('fecha_reserva', targetDate);
      
      if (liveError) throw liveError;
      
      const stats = {
        fecha: targetDate,
        total_reservas: liveData?.length || 0,
        reservas_confirmadas: liveData?.filter(r => r.estado === 'confirmada').length || 0,
        reservas_canceladas: liveData?.filter(r => r.estado === 'cancelada').length || 0,
        reservas_pendientes: liveData?.filter(r => r.estado === 'pendiente').length || 0,
        total_comensales: liveData?.reduce((sum, r) => sum + (r.personas || 0), 0) || 0,
        tasa_ocupacion: 0 // Se calculará después
      };
      
      return stats;
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
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 120000, // Cache por 2 minutos
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationData: Record<string, any>) => {
      const { data, error } = await supabase
        .from('reservas')
        .insert([reservationData])
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
    mutationFn: async ({ id, ...updates }: Record<string, any> & { id: string }) => {
      const { data, error } = await supabase
        .from('reservas')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
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
      // Consultar tabla 'mesas' con los campos correctos
      const { data, error } = await supabase
        .from('mesas')
        .select('*')
        .gte('capacidad', comensales)
        .eq('activa', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!(fecha && hora && comensales),
    staleTime: 60000, // Cache por 1 minuto
  });
}