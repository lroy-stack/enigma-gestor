
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/database';

// Interfaces para filtros avanzados
export interface CustomerFilters {
  searchTerm?: string;
  segment?: 'todos' | 'vip' | 'nuevos' | 'activos' | 'inactivos';
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasPreferences?: boolean;
  sortBy?: 'nombre' | 'fecha_creacion' | 'ultima_visita';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CustomerStats {
  total: number;
  nuevos: number;
  vip: number;
  activos: number;
  inactivos: number;
  retencion: number;
}

// Hook principal mejorado
export function useCustomersEnhanced(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers-enhanced', filters],
    queryFn: async () => {
      let query = supabase
        .from('clientes')
        .select('*');

      // Aplicar filtros
      if (filters?.searchTerm) {
        const term = `%${filters.searchTerm.toLowerCase()}%`;
        query = query.or(
          `nombre.ilike.${term},apellido.ilike.${term},email.ilike.${term},telefono.ilike.${term}`
        );
      }

      // Filtro por segmento
      if (filters?.segment && filters.segment !== 'todos') {
        const ahora = new Date();
        
        switch (filters.segment) {
          case 'vip':
            query = query.eq('vip_status', true);
            break;
          case 'nuevos':
            const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
            query = query.gte('fecha_creacion', mesAnterior.toISOString());
            break;
          case 'activos':
            const tresMesesAntes = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
            query = query.gte('ultima_visita', tresMesesAntes.toISOString());
            break;
          case 'inactivos':
            const seisMesesAntes = new Date(ahora.getFullYear(), ahora.getMonth() - 6, ahora.getDate());
            query = query.or(`ultima_visita.is.null,ultima_visita.lt.${seisMesesAntes.toISOString()}`);
            break;
        }
      }

      // Filtro por preferencias dietéticas
      if (filters?.hasPreferences) {
        query = query.not('preferencias_dieteticas', 'is', null);
      }

      // Rango de fechas
      if (filters?.dateRange) {
        query = query
          .gte('fecha_creacion', filters.dateRange.start.toISOString())
          .lte('fecha_creacion', filters.dateRange.end.toISOString());
      }

      // Ordenamiento
      const sortBy = filters?.sortBy || 'fecha_creacion';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Paginación
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Cliente[];
    },
  });
}

// Hook para estadísticas de clientes
export function useCustomerStats() {
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*');
      
      if (error) throw error;
      
      const ahora = new Date();
      const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
      const tresMesesAntes = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
      
      const stats: CustomerStats = {
        total: clientes.length,
        nuevos: clientes.filter(c => new Date(c.fecha_creacion) > mesAnterior).length,
        vip: clientes.filter(c => c.vip_status).length,
        activos: clientes.filter(c => c.ultima_visita && new Date(c.ultima_visita) > tresMesesAntes).length,
        inactivos: clientes.filter(c => !c.ultima_visita || new Date(c.ultima_visita) < tresMesesAntes).length,
        retencion: clientes.length > 0 ? Math.round((clientes.filter(c => c.ultima_visita).length / clientes.length) * 100) : 0
      };
      
      return stats;
    },
  });
}

// Hook para cliente individual con detalles completos
export function useCustomerDetails(id: string) {
  return useQuery({
    queryKey: ['customer-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          reservas (
            id,
            fecha_reserva,
            hora_reserva,
            numero_comensales,
            estado_reserva,
            origen_reserva
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Hook para actualizar cliente
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}

// Hook para alternar estado VIP
export function useToggleVIPStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, vipStatus }: { id: string; vipStatus: boolean }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update({ vip_status: vipStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}

// Hook para eliminar cliente
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}

// Hook para acciones masivas
export function useBulkCustomerActions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      customerIds, 
      action, 
      value 
    }: { 
      customerIds: string[]; 
      action: 'toggleVIP' | 'delete' | 'updateSegment';
      value?: any;
    }) => {
      switch (action) {
        case 'toggleVIP':
          const { error: vipError } = await supabase
            .from('clientes')
            .update({ vip_status: value })
            .in('id', customerIds);
          if (vipError) throw vipError;
          break;
          
        case 'delete':
          const { error: deleteError } = await supabase
            .from('clientes')
            .delete()
            .in('id', customerIds);
          if (deleteError) throw deleteError;
          break;
          
        default:
          throw new Error('Acción no soportada');
      }
      
      return { customerIds, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}
