
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
          *,
          clientes (
            id,
            nombre,
            apellido,
            email,
            telefono,
            vip_status
          ),
          mesas (
            id,
            numero_mesa,
            capacidad,
            zona
          )
        `)
        .eq('fecha_reserva', today)
        .order('hora_reserva', { ascending: true });

      if (error) {
        console.error('Error fetching today reservations:', error);
        throw error;
      }

      // Transformar los datos para incluir información del cliente
      const transformedData = data?.map(reservation => ({
        ...reservation,
        cliente_nombre: reservation.clientes ? 
          `${reservation.clientes.nombre} ${reservation.clientes.apellido}` : 
          'Cliente',
        numero_mesa: reservation.mesas?.numero_mesa || null,
        telefono: reservation.clientes?.telefono || null,
      })) || [];

      return transformedData;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // 1 minuto
  });
}

export function useRestaurantStats() {
  return useQuery({
    queryKey: ['restaurant-stats'],
    queryFn: async () => {
      // Get table states grouped by zone
      const { data: tableStates, error } = await supabase
        .from('mesas')
        .select(`
          id,
          numero_mesa,
          capacidad,
          zona,
          estados_mesa (
            estado
          )
        `)
        .eq('activa', true);

      if (error) {
        console.error('Error fetching restaurant stats:', error);
        throw error;
      }

      // Group by zone and calculate stats
      const statsByZone = (tableStates || []).reduce((acc, table) => {
        const zona = table.zona;
        const estado = table.estados_mesa?.[0]?.estado || 'libre';
        
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
        switch (estado) {
          case 'libre':
            acc[zona].mesas_libres++;
            break;
          case 'ocupada':
            acc[zona].mesas_ocupadas++;
            break;
          case 'reservada':
            acc[zona].mesas_reservadas++;
            break;
          case 'limpieza':
            acc[zona].mesas_limpieza++;
            break;
        }

        // Calculate occupation percentage
        const occupied = acc[zona].mesas_ocupadas + acc[zona].mesas_reservadas;
        acc[zona].porcentaje_ocupacion = Math.round((occupied / acc[zona].total_mesas) * 100);

        return acc;
      }, {} as Record<string, any>);

      return Object.values(statsByZone);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
