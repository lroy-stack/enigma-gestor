
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClienteTag, ClienteNota, ClienteAlerta, ClienteInteraccion } from '@/types/customer-advanced';

// Hook para obtener todos los datos avanzados de un cliente
export function useCustomerAdvancedData(clienteId: string) {
  return useQuery({
    queryKey: ['customer-advanced', clienteId],
    queryFn: async () => {
      const [tagsResult, notasResult, alertasResult, interaccionesResult] = await Promise.all([
        supabase
          .from('cliente_tags')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('fecha_creacion', { ascending: false }),
        
        supabase
          .from('cliente_notas')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('fecha_creacion', { ascending: false }),
        
        supabase
          .from('cliente_alertas')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('fecha_alerta', { ascending: true }),
        
        supabase
          .from('cliente_interacciones')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('fecha_interaccion', { ascending: false })
          .limit(50)
      ]);

      if (tagsResult.error) throw tagsResult.error;
      if (notasResult.error) throw notasResult.error;
      if (alertasResult.error) throw alertasResult.error;
      if (interaccionesResult.error) throw interaccionesResult.error;

      return {
        tags: tagsResult.data as ClienteTag[],
        notas: notasResult.data as ClienteNota[],
        alertas: alertasResult.data as ClienteAlerta[],
        interacciones: interaccionesResult.data as ClienteInteraccion[]
      };
    },
    enabled: !!clienteId,
  });
}

// Hook para tags
export function useCustomerTags(clienteId: string) {
  const queryClient = useQueryClient();

  const addTag = useMutation({
    mutationFn: async ({ tagNombre, tagColor }: { tagNombre: string; tagColor: string }) => {
      const { data, error } = await supabase
        .from('cliente_tags')
        .insert({
          cliente_id: clienteId,
          tag_nombre: tagNombre,
          tag_color: tagColor
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('cliente_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
      return tagId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  return { addTag, removeTag };
}

// Hook para notas
export function useCustomerNotes(clienteId: string) {
  const queryClient = useQueryClient();

  const addNote = useMutation({
    mutationFn: async ({ contenido, tipoNota, esPrivada }: { 
      contenido: string; 
      tipoNota: ClienteNota['tipo_nota']; 
      esPrivada: boolean 
    }) => {
      const { data, error } = await supabase
        .from('cliente_notas')
        .insert({
          cliente_id: clienteId,
          contenido,
          tipo_nota: tipoNota,
          es_privada: esPrivada
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ noteId, contenido }: { noteId: string; contenido: string }) => {
      const { data, error } = await supabase
        .from('cliente_notas')
        .update({ contenido })
        .eq('id', noteId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('cliente_notas')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  return { addNote, updateNote, deleteNote };
}

// Hook para alertas
export function useCustomerAlerts(clienteId: string) {
  const queryClient = useQueryClient();

  const addAlert = useMutation({
    mutationFn: async ({ 
      tipoAlerta, 
      titulo, 
      descripcion, 
      fechaAlerta, 
      horaAlerta 
    }: { 
      tipoAlerta: ClienteAlerta['tipo_alerta'];
      titulo: string;
      descripcion?: string;
      fechaAlerta: string;
      horaAlerta?: string;
    }) => {
      const { data, error } = await supabase
        .from('cliente_alertas')
        .insert({
          cliente_id: clienteId,
          tipo_alerta: tipoAlerta,
          titulo,
          descripcion,
          fecha_alerta: fechaAlerta,
          hora_alerta: horaAlerta
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  const completeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('cliente_alertas')
        .update({ completada: true })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  return { addAlert, completeAlert };
}

// Hook para interacciones manuales
export function useCustomerInteractions(clienteId: string) {
  const queryClient = useQueryClient();

  const addInteraction = useMutation({
    mutationFn: async ({ 
      tipoInteraccion, 
      descripcion, 
      metadata 
    }: { 
      tipoInteraccion: ClienteInteraccion['tipo_interaccion'];
      descripcion?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('cliente_interacciones')
        .insert({
          cliente_id: clienteId,
          tipo_interaccion: tipoInteraccion,
          descripcion,
          metadata
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-advanced', clienteId] });
    },
  });

  return { addInteraction };
}
