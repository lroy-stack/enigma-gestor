
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RestaurantConfigData {
  id: string;
  nombre_restaurante: string;
  direccion: string;
  telefono: string;
  email_reservas: string;
  capacidad_maxima: number;
  duracion_reserva_default_minutos: number;
  auto_aceptar_reservas: boolean;
  politica_cancelacion?: string;
  mensaje_bienvenida_email?: string;
  mensaje_confirmacion_whatsapp?: string;
  horarios_operacion?: any;
}

export interface HorarioOperacion {
  id: string;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  tipo_servicio: string;
  activo: boolean;
  notas?: string;
}

export function useRestaurantConfig() {
  const [config, setConfig] = useState<RestaurantConfigData | null>(null);
  const [horarios, setHorarios] = useState<HorarioOperacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Obtener configuración del restaurante
      const { data: configData, error: configError } = await supabase
        .from('restaurante_config')
        .select('*')
        .single();

      if (configError) throw configError;
      setConfig(configData);

      // Obtener horarios de operación
      const { data: horariosData, error: horariosError } = await supabase
        .from('horarios_operacion_detalle')
        .select('*')
        .order('dia_semana', { ascending: true });

      if (horariosError) throw horariosError;
      setHorarios(horariosData || []);

    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la configuración',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<RestaurantConfigData>) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('restaurante_config')
        .update(updates)
        .eq('id', config.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Éxito',
        description: 'Configuración actualizada correctamente'
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la configuración',
        variant: 'destructive'
      });
    }
  };

  const updateHorario = async (id: string, updates: Partial<HorarioOperacion>) => {
    try {
      const { error } = await supabase
        .from('horarios_operacion_detalle')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setHorarios(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      
      toast({
        title: 'Éxito',
        description: 'Horario actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating horario:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el horario',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    horarios,
    loading,
    updateConfig,
    updateHorario,
    refetch: fetchConfig
  };
}
