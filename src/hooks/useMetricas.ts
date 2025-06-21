import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ReservaMetricaDiaria, ReservaMetricaHoraria, ReservaMetricaCanal } from '@/types/database';

// Hook para obtener métricas diarias
export function useMetricasDiarias(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['metricas-diarias', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .eq('fecha', targetDate)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReservaMetricaDiaria | null;
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para obtener métricas de un rango de fechas
export function useMetricasRango(fechaInicio: string, fechaFin: string) {
  return useQuery({
    queryKey: ['metricas-rango', fechaInicio, fechaFin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      return data as ReservaMetricaDiaria[];
    },
    enabled: !!(fechaInicio && fechaFin),
    staleTime: 300000, // 5 minutos
  });
}

// Hook para obtener métricas horarias de un día
export function useMetricasHorarias(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['metricas-horarias', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_horarias')
        .select('*')
        .eq('fecha', targetDate)
        .order('hora', { ascending: true });
      
      if (error) throw error;
      return data as ReservaMetricaHoraria[];
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para obtener métricas por canal
export function useMetricasCanales(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['metricas-canales', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas_metricas_canales')
        .select('*')
        .eq('fecha', targetDate)
        .order('total_reservas', { ascending: false });
      
      if (error) throw error;
      return data as ReservaMetricaCanal[];
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para obtener resumen de métricas de la semana actual
export function useMetricasSemanales() {
  return useQuery({
    queryKey: ['metricas-semanales'],
    queryFn: async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const fechaInicio = startOfWeek.toISOString().split('T')[0];
      const fechaFin = endOfWeek.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reservas_metricas_diarias')
        .select('*')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      
      // Calcular totales de la semana
      const totales = data?.reduce((acc, day) => ({
        total_reservas: acc.total_reservas + (day.total_reservas || 0),
        reservas_confirmadas: acc.reservas_confirmadas + (day.reservas_confirmadas || 0),
        reservas_canceladas: acc.reservas_canceladas + (day.reservas_canceladas || 0),
        reservas_no_show: acc.reservas_no_show + (day.reservas_no_show || 0),
        total_comensales: acc.total_comensales + (day.total_comensales || 0),
        ingreso_promedio: acc.ingreso_promedio + (day.ingreso_promedio || 0),
        dias_con_datos: acc.dias_con_datos + 1
      }), {
        total_reservas: 0,
        reservas_confirmadas: 0,
        reservas_canceladas: 0,
        reservas_no_show: 0,
        total_comensales: 0,
        ingreso_promedio: 0,
        dias_con_datos: 0
      });
      
      if (totales && totales.dias_con_datos > 0) {
        totales.ingreso_promedio = totales.ingreso_promedio / totales.dias_con_datos;
      }
      
      return {
        datos_diarios: data,
        totales_semana: totales,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      };
    },
    staleTime: 300000, // 5 minutos
  });
}

// Hook para estadísticas en tiempo real (fallback cuando no hay métricas)
export function useEstadisticasRealTime(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['estadisticas-realtime', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('estado, personas, hora_reserva')
        .eq('fecha_reserva', targetDate);
      
      if (error) throw error;
      
      const reservas = data || [];
      
      // Calcular estadísticas básicas
      const stats = {
        fecha: targetDate,
        total_reservas: reservas.length,
        reservas_confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
        reservas_canceladas: reservas.filter(r => r.estado === 'cancelada').length,
        reservas_pendientes: reservas.filter(r => r.estado === 'pendiente').length,
        reservas_no_show: reservas.filter(r => r.estado === 'no_show').length,
        total_comensales: reservas.reduce((sum, r) => sum + (r.personas || 0), 0),
        tasa_ocupacion: 0 // Se calculará en el componente basado en capacidad
      };
      
      // Distribución por horas
      const distribucionHoraria = reservas.reduce((acc, reserva) => {
        const hora = reserva.hora_reserva;
        if (hora) {
          acc[hora] = (acc[hora] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      return {
        ...stats,
        distribucion_horaria: distribucionHoraria
      };
    },
    staleTime: 60000, // 1 minuto para datos en tiempo real
  });
}