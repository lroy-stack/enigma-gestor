
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Reserva } from '@/types/database';

export function useUnassignedReservations(fecha?: string) {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['unassigned-reservations', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          clientes (*)
        `)
        .eq('fecha_reserva', targetDate)
        .is('mesa_id', null)
        .in('estado_reserva', ['pendiente_confirmacion', 'confirmada'])
        .order('hora_reserva', { ascending: true });
      
      if (error) throw error;
      return data as Reserva[];
    },
  });
}

export function useAssignTableToReservation() {
  return async (reservaId: string, mesaId: string) => {
    const { error } = await supabase
      .from('reservas')
      .update({
        mesa_id: mesaId,
        estado_reserva: 'confirmada'
      })
      .eq('id', reservaId);
    
    if (error) throw error;
  };
}
