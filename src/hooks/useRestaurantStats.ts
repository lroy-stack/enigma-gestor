import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTodayReservations() {
  return useQuery({
    queryKey: ['today-reservations'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
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
          estado,
          created_at
        `)
        .eq('fecha_reserva', today)
        .order('hora_reserva', { ascending: true });

      if (error) {
        console.error('Error fetching today reservations:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // 1 minuto
  });
}

export function useRestaurantStats() {
  return useQuery({
    queryKey: ['restaurant-stats'],
    queryFn: async () => {
      // Get table states grouped by zone using correct table structure
      const { data: tableStates, error } = await supabase
        .from('mesas')
        .select(`
          id,
          numero_mesa,
          capacidad,
          zona,
          activa
        `)
        .eq('activa', true);

      if (error) {
        console.error('Error fetching restaurant stats:', error);
        throw error;
      }

      // Group by zone and calculate stats
      const statsByZone = (tableStates || []).reduce((acc, table) => {
        const zona = table.zona || 'Sin zona';
        
        if (!acc[zona]) {
          acc[zona] = {
            zona,
            total_mesas: 0,
            mesas_libres: 0,
            mesas_ocupadas: 0,
            mesas_reservadas: 0,
            mesas_limpieza: 0,
            porcentaje_ocupacion: 0
          };
        }

        acc[zona].total_mesas++;
        // Por ahora asumimos que todas las mesas están libres ya que no tenemos sistema de estados
        acc[zona].mesas_libres++;

        // Calculate occupation percentage (0% por ahora)
        acc[zona].porcentaje_ocupacion = 0;

        return acc;
      }, {} as Record<string, any>);

      return Object.values(statsByZone);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}