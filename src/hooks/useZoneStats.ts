
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ZoneStats } from '@/types/database';

export function useZoneStats() {
  return useQuery({
    queryKey: ['zone-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vista_estadisticas_zonas')
        .select('*')
        .order('zona');
      
      if (error) throw error;
      return data as ZoneStats[];
    },
    staleTime: 30000, // Cache por 30 segundos
    refetchInterval: 60000, // Refetch cada minuto
  });
}
