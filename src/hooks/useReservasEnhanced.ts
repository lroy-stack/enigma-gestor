import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Reserva } from '@/types/database';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ReservasFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  searchTerm?: string;
  mes?: string; // Formato: YYYY-MM
  limit?: number;
  offset?: number;
}

export function useReservasEnhanced(filters?: ReservasFilters) {
  return useQuery({
    queryKey: ['reservations-enhanced', filters],
    queryFn: async () => {
      console.log('🔍 useReservasEnhanced - Starting query with filters:', filters);
      
      let query = supabase
        .from('reservas')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters?.mes) {
        // Si se especifica un mes, obtener todas las reservas de ese mes
        const [year, month] = filters.mes.split('-');
        const startDate = format(startOfMonth(new Date(parseInt(year), parseInt(month) - 1)), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date(parseInt(year), parseInt(month) - 1)), 'yyyy-MM-dd');
        
        query = query
          .gte('fecha_reserva', startDate)
          .lte('fecha_reserva', endDate);
      } else if (filters?.fecha_inicio && filters?.fecha_fin) {
        query = query
          .gte('fecha_reserva', filters.fecha_inicio)
          .lte('fecha_reserva', filters.fecha_fin);
      }

      if (filters?.estado && filters.estado !== 'all') {
        query = query.eq('estado', filters.estado);
      }

      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        query = query.or(`nombre.ilike.%${searchLower}%,email.ilike.%${searchLower}%,telefono.ilike.%${searchLower}%`);
      }

      // Orden y paginación
      query = query
        .order('fecha_reserva', { ascending: false })
        .order('hora_reserva', { ascending: true });

      // NO aplicar límite si se está pidiendo un mes específico
      if (!filters?.mes && filters?.limit) {
        query = query.limit(filters.limit);
        if (filters?.offset) {
          query = query.range(filters.offset, filters.offset + filters.limit - 1);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error en useReservasEnhanced:', error);
        throw error;
      }
      
      console.log(`✅ useReservasEnhanced encontró ${data?.length || 0} reservas de ${count} totales`);
      
      if (filters?.mes && data && data.length > 0) {
        console.log(`📅 Reservas del mes ${filters.mes}:`, data.length);
        
        // Agrupar por fecha para debugging
        const porFecha = data.reduce((acc, reserva) => {
          const fecha = reserva.fecha_reserva;
          acc[fecha] = (acc[fecha] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('📊 Distribución por fecha:', porFecha);
      }
      
      return { 
        data: data || [], 
        totalCount: count || 0 
      };
    },
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Mantener en cache por 5 minutos
    refetchOnWindowFocus: false,
  });
}

// Hook para obtener todas las reservas de un mes específico sin límites
export function useMonthReservations(year: number, month: number) {
  const monthString = `${year}-${String(month).padStart(2, '0')}`;
  
  return useQuery({
    queryKey: ['month-reservations', year, month],
    queryFn: async () => {
      console.log(`🔍 Obteniendo todas las reservas de ${monthString}`);
      
      const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      
      const { data, error, count } = await supabase
        .from('reservas')
        .select('*', { count: 'exact' })
        .gte('fecha_reserva', startDate)
        .lte('fecha_reserva', endDate)
        .order('fecha_reserva')
        .order('hora_reserva');
      
      if (error) {
        console.error(`❌ Error obteniendo reservas del mes ${monthString}:`, error);
        throw error;
      }
      
      console.log(`✅ Encontradas ${data?.length || 0} reservas para ${monthString}`);
      
      return {
        data: data || [],
        totalCount: count || 0,
        month: monthString
      };
    },
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 600000, // Mantener en cache por 10 minutos
  });
}

// Hook para estadísticas mensuales
export function useMonthStats(year: number, month: number) {
  return useQuery({
    queryKey: ['month-stats', year, month],
    queryFn: async () => {
      const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('reservas')
        .select('estado, personas, fecha_reserva')
        .gte('fecha_reserva', startDate)
        .lte('fecha_reserva', endDate);
      
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        confirmadas: data?.filter(r => r.estado === 'confirmada').length || 0,
        pendientes: data?.filter(r => r.estado === 'pendiente_confirmacion').length || 0,
        canceladas: data?.filter(r => ['cancelada_usuario', 'cancelada_restaurante'].includes(r.estado)).length || 0,
        completadas: data?.filter(r => r.estado === 'completada').length || 0,
        noShow: data?.filter(r => r.estado === 'no_show').length || 0,
        totalComensales: data?.reduce((sum, r) => sum + (r.personas || 0), 0) || 0,
        porDia: {} as Record<string, number>
      };
      
      // Calcular reservas por día
      data?.forEach(reserva => {
        const dia = reserva.fecha_reserva;
        stats.porDia[dia] = (stats.porDia[dia] || 0) + 1;
      });
      
      return stats;
    },
    staleTime: 300000, // Cache por 5 minutos
  });
}