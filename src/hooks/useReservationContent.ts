import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReservationContentData {
  id: string;
  titulo_principal: string;
  descripcion_principal: string;
  mensaje_confirmacion: string;
  mensaje_whatsapp: string;
  horarios_comida: string[];
  horarios_cena: string[];
  ocasion_opciones: string[];
  created_at?: string;
  updated_at?: string;
}

export function useReservationContent() {
  const [reservationContent, setReservationContent] = useState<ReservationContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservationContent = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener configuración desde tabla 'contenido_reservas'
      const { data, error } = await supabase
        .from('contenido_reservas')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching reservation content:', error);
        toast({
          title: 'Error',
          description: 'Error al cargar la configuración de reservas',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setReservationContent(data);
      } else {
        console.log('No hay configuración de contenido de reservas existente');
        setReservationContent(null);
      }

    } catch (error) {
      console.error('Error fetching reservation content:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la configuración de reservas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createReservationContent = async (contentData: Omit<ReservationContentData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contenido_reservas')
        .insert([contentData])
        .select()
        .single();

      if (error) throw error;

      setReservationContent(data);

      toast({
        title: 'Configuración de reservas creada',
        description: 'Se ha creado la configuración del contenido de reservas'
      });

      return data;
    } catch (error) {
      console.error('Error creating reservation content:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la configuración de reservas',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateReservationContent = async (updates: Partial<ReservationContentData>) => {
    if (!reservationContent) return;

    try {
      // Incluir timestamp de actualización
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('contenido_reservas')
        .update(updateData)
        .eq('id', reservationContent.id);

      if (error) throw error;

      setReservationContent(prev => prev ? { ...prev, ...updateData } : null);
      
      toast({
        title: 'Éxito',
        description: 'Configuración de reservas actualizada correctamente'
      });
    } catch (error) {
      console.error('Error updating reservation content:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la configuración de reservas',
        variant: 'destructive'
      });
    }
  };

  const updateReservationContentWithValidation = async (updates: Partial<ReservationContentData>) => {
    // Validar campos requeridos si se están actualizando
    const requiredFields = ['titulo_principal', 'descripcion_principal', 'mensaje_confirmacion', 'mensaje_whatsapp'];
    const missingFields = requiredFields.filter(field => 
      updates[field as keyof ReservationContentData] === '' || 
      updates[field as keyof ReservationContentData] === undefined
    );

    if (missingFields.length > 0) {
      toast({
        title: 'Campos requeridos faltantes',
        description: `Por favor, completa: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return false;
    }

    await updateReservationContent(updates);
    return true;
  };

  // Funciones específicas para horarios
  const updateHorariosComida = async (horarios: string[]) => {
    await updateReservationContent({ horarios_comida: horarios });
  };

  const updateHorariosCena = async (horarios: string[]) => {
    await updateReservationContent({ horarios_cena: horarios });
  };

  const addHorarioComida = async (horario: string) => {
    if (!reservationContent) return;
    const nuevosHorarios = [...(reservationContent.horarios_comida || []), horario];
    await updateHorariosComida(nuevosHorarios);
  };

  const addHorarioCena = async (horario: string) => {
    if (!reservationContent) return;
    const nuevosHorarios = [...(reservationContent.horarios_cena || []), horario];
    await updateHorariosCena(nuevosHorarios);
  };

  const removeHorarioComida = async (index: number) => {
    if (!reservationContent) return;
    const nuevosHorarios = reservationContent.horarios_comida.filter((_, i) => i !== index);
    await updateHorariosComida(nuevosHorarios);
  };

  const removeHorarioCena = async (index: number) => {
    if (!reservationContent) return;
    const nuevosHorarios = reservationContent.horarios_cena.filter((_, i) => i !== index);
    await updateHorariosCena(nuevosHorarios);
  };

  useEffect(() => {
    fetchReservationContent();
  }, [fetchReservationContent]);

  return {
    reservationContent,
    loading,
    updateReservationContent: updateReservationContentWithValidation,
    createReservationContent,
    refetch: fetchReservationContent,
    // Funciones específicas para horarios
    updateHorariosComida,
    updateHorariosCena,
    addHorarioComida,
    addHorarioCena,
    removeHorarioComida,
    removeHorarioCena
  };
}