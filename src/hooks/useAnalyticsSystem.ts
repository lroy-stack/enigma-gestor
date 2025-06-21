import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTodaySpain } from '@/utils/dateUtils';

// Hook para métricas diarias
export function useReservasMetricasDiarias(fecha?: string) {
  const targetDate = fecha || getTodaySpain();
  
  return useQuery({
    queryKey: ['reservas-metricas-diarias', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .eq('fecha', targetDate)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para métricas horarias
export function useReservasMetricasHorarias(fecha?: string) {
  const targetDate = fecha || getTodaySpain();
  
  return useQuery({
    queryKey: ['reservas-metricas-horarias', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_horarias')
        .select('*')
        .eq('fecha', targetDate)
        .order('hora');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para métricas por canal
export function useReservasMetricasCanales(fecha?: string) {
  const targetDate = fecha || getTodaySpain();
  
  return useQuery({
    queryKey: ['reservas-metricas-canales', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_canales')
        .select('*')
        .eq('fecha', targetDate)
        .order('total_reservas', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para analytics de clientes
export function useClienteAnalytics(clienteId?: string) {
  return useQuery({
    queryKey: ['cliente-analytics', clienteId],
    queryFn: async () => {
      let query = supabase.from('cliente_analytics').select('*');
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: true, // Siempre habilitado, incluso sin clienteId (para obtener todos)
    staleTime: 300000, // 5 minutos
  });
}

// Hook para interacciones de clientes
export function useClienteInteracciones(clienteId?: string) {
  return useQuery({
    queryKey: ['cliente-interacciones', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('cliente_interacciones')
        .select(`
          *,
          contacts:cliente_id (
            name,
            last_name,
            email
          )
        `);
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }
      
      const { data, error } = await query
        .order('fecha_interaccion', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: true,
    staleTime: 60000, // 1 minuto para interacciones
  });
}

// Hook híbrido: usa métricas si están disponibles, sino calcula desde reservas legacy
export function useHybridTodayStats() {
  const today = getTodaySpain();
  
  return useQuery({
    queryKey: ['hybrid-today-stats', today],
    queryFn: async () => {
      // Primero intentar obtener métricas precalculadas
      const { data: metricas } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .eq('fecha', today)
        .maybeSingle();
      
      if (metricas) {
        console.log('✅ Usando métricas precalculadas para', today);
        return {
          source: 'metricas',
          fecha: today,
          total_reservas: metricas.total_reservas || 0,
          confirmadas: metricas.confirmadas || 0,
          pendientes: metricas.pendientes || 0,
          completadas: metricas.completadas || 0,
          canceladas: metricas.canceladas || 0,
          no_shows: metricas.no_shows || 0,
          total_comensales: metricas.total_comensales || 0,
        };
      }
      
      // Si no hay métricas, calcular desde reservas legacy
      console.log('⚠️ Calculando desde reservas legacy para', today);
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('estado, personas')
        .eq('fecha_reserva', today);
      
      if (error) throw error;
      
      const stats = (reservas || []).reduce((acc, r) => {
        acc.total_reservas++;
        acc.total_comensales += r.personas || 0;
        
        switch (r.estado) {
          case 'confirmada':
            acc.confirmadas++;
            break;
          case 'pendiente':
            acc.pendientes++;
            break;
          case 'completada':
            acc.completadas++;
            break;
          case 'cancelada':
          case 'cancelada_usuario':
          case 'cancelada_restaurante':
            acc.canceladas++;
            break;
          case 'no_show':
            acc.no_shows++;
            break;
        }
        
        return acc;
      }, {
        source: 'legacy',
        fecha: today,
        total_reservas: 0,
        confirmadas: 0,
        pendientes: 0,
        completadas: 0,
        canceladas: 0,
        no_shows: 0,
        total_comensales: 0,
      });
      
      return stats;
    },
    staleTime: 60000, // 1 minuto
    gcTime: 300000,
  });
}