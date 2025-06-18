
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyMetrics {
  fecha: string;
  total_reservas: number;
  total_comensales: number;
  reservas_completadas: number;
  reservas_canceladas: number;
  reservas_no_show: number;
  reservas_vip: number;
  duracion_promedio_minutos: number;
  ingresos_estimados: number;
}

export interface HourlyMetrics {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  total_reservas: number;
  total_comensales: number;
  zona: string;
}

export interface ChannelMetrics {
  fecha: string;
  canal: string;
  total_reservas: number;
  total_comensales: number;
}

export interface ZoneStats {
  zona: string;
  total_mesas: number;
  mesas_ocupadas: number;
  mesas_reservadas: number;
  mesas_libres: number;
  porcentaje_ocupacion: number;
  total_reservas_hoy: number;
}

export function useDailyMetrics(days: number = 30) {
  return useQuery({
    queryKey: ['daily-metrics', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .gte('fecha', startDate.toISOString().split('T')[0])
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      return data as DailyMetrics[];
    },
  });
}

export function useHourlyMetrics(fecha?: string) {
  return useQuery({
    queryKey: ['hourly-metrics', fecha],
    queryFn: async () => {
      const targetDate = fecha || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reservas_metricas_horarias')
        .select('*')
        .eq('fecha', targetDate)
        .order('hora_inicio', { ascending: true });
      
      if (error) throw error;
      return data as HourlyMetrics[];
    },
  });
}

export function useChannelMetrics(days: number = 7) {
  return useQuery({
    queryKey: ['channel-metrics', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('reservas_metricas_canales')
        .select('*')
        .gte('fecha', startDate.toISOString().split('T')[0])
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      return data as ChannelMetrics[];
    },
  });
}

export function useZoneStats() {
  return useQuery({
    queryKey: ['zone-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vista_estadisticas_zonas')
        .select('*');
      
      if (error) throw error;
      return data as ZoneStats[];
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
}

export function useTopCustomers(days: number = 30) {
  return useQuery({
    queryKey: ['top-customers', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          cliente_id,
          clientes!inner(nombre, apellido, vip_status),
          numero_comensales
        `)
        .gte('fecha_reserva', startDate.toISOString().split('T')[0])
        .eq('estado_reserva', 'completada');
      
      if (error) throw error;
      
      // Agrupar por cliente y contar visitas
      const customerCounts = data.reduce((acc: any, reservation: any) => {
        const clientId = reservation.cliente_id;
        if (!acc[clientId]) {
          acc[clientId] = {
            nombre: reservation.clientes.nombre,
            apellido: reservation.clientes.apellido,
            vip_status: reservation.clientes.vip_status,
            visitas: 0,
            total_comensales: 0
          };
        }
        acc[clientId].visitas += 1;
        acc[clientId].total_comensales += reservation.numero_comensales;
        return acc;
      }, {});
      
      return Object.values(customerCounts)
        .sort((a: any, b: any) => b.visitas - a.visitas)
        .slice(0, 5);
    },
  });
}

export function usePopularTables(days: number = 30) {
  return useQuery({
    queryKey: ['popular-tables', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          mesa_id,
          mesas!inner(numero_mesa, tipo_mesa)
        `)
        .gte('fecha_reserva', startDate.toISOString().split('T')[0])
        .eq('estado_reserva', 'completada')
        .not('mesa_id', 'is', null);
      
      if (error) throw error;
      
      // Contar reservas por mesa
      const tableCounts = data.reduce((acc: any, reservation: any) => {
        const tableId = reservation.mesa_id;
        if (!acc[tableId]) {
          acc[tableId] = {
            numero_mesa: reservation.mesas.numero_mesa,
            tipo_mesa: reservation.mesas.tipo_mesa,
            reservas: 0
          };
        }
        acc[tableId].reservas += 1;
        return acc;
      }, {});
      
      return Object.values(tableCounts)
        .sort((a: any, b: any) => b.reservas - a.reservas)
        .slice(0, 5);
    },
  });
}
