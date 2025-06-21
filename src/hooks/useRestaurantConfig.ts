
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RestaurantConfigData {
  id: number;
  direccion: string;
  telefono: string;
  email: string;
  horario: any; // JSONB field for operating hours
  mapa_url?: string;
  texto_adicional?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HorarioPublico {
  days: string;
  hours: string;
}

export interface HorarioInfo {
  dia: number; // 0-6 (Domingo a Sábado)
  nombre_dia: string;
  abierto: boolean;
  hora_apertura?: string;
  hora_cierre?: string;
  tipo_servicio?: string;
  notas?: string;
}

export function useRestaurantConfig() {
  const [config, setConfig] = useState<RestaurantConfigData | null>(null);
  const [horarios, setHorarios] = useState<HorarioInfo[]>([]);
  const [horariosPublicos, setHorariosPublicos] = useState<HorarioPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const defaultHorarios: HorarioInfo[] = [
    { dia: 0, nombre_dia: 'Domingo', abierto: false },
    { dia: 1, nombre_dia: 'Lunes', abierto: true, hora_apertura: '13:00', hora_cierre: '23:00', tipo_servicio: 'almuerzo_cena' },
    { dia: 2, nombre_dia: 'Martes', abierto: true, hora_apertura: '13:00', hora_cierre: '23:00', tipo_servicio: 'almuerzo_cena' },
    { dia: 3, nombre_dia: 'Miércoles', abierto: true, hora_apertura: '13:00', hora_cierre: '23:00', tipo_servicio: 'almuerzo_cena' },
    { dia: 4, nombre_dia: 'Jueves', abierto: true, hora_apertura: '13:00', hora_cierre: '23:00', tipo_servicio: 'almuerzo_cena' },
    { dia: 5, nombre_dia: 'Viernes', abierto: true, hora_apertura: '13:00', hora_cierre: '00:00', tipo_servicio: 'almuerzo_cena' },
    { dia: 6, nombre_dia: 'Sábado', abierto: true, hora_apertura: '13:00', hora_cierre: '00:00', tipo_servicio: 'almuerzo_cena' }
  ];

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Obtener configuración desde tabla 'contacto'
      const { data: configData, error: configError } = await supabase
        .from('contacto')
        .select('*')
        .single();

      if (configError) {
        // Si no existe configuración, crear una por defecto
        if (configError.code === 'PGRST116') {
          console.log('No hay configuración, creando configuración por defecto...');
          await createDefaultConfig();
          return;
        }
        throw configError;
      }

      setConfig(configData);

      // Procesar horarios públicos desde campo JSONB
      if (configData.horario && Array.isArray(configData.horario)) {
        // Si es el nuevo formato (array de objetos con days/hours)
        if (configData.horario.length > 0 && configData.horario[0].days !== undefined) {
          setHorariosPublicos(configData.horario);
        } else {
          // Si es el formato anterior, convertir a formato de horarios estructurados
          setHorarios(configData.horario);
        }
      } else {
        // Crear horarios públicos por defecto
        const defaultHorariosPublicos: HorarioPublico[] = [
          { days: "Lunes", hours: "Cerrado" },
          { days: "Martes", hours: "18:30 - 23:00" },
          { days: "Miércoles a Domingo", hours: "13:00 - 16:00 | 18:30 - 23:00" }
        ];
        setHorariosPublicos(defaultHorariosPublicos);
      }

    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la configuración',
        variant: 'destructive'
      });
      // En caso de error, usar horarios por defecto
      const defaultHorariosPublicos: HorarioPublico[] = [
        { days: "Lunes", hours: "Cerrado" },
        { days: "Martes", hours: "18:30 - 23:00" },
        { days: "Miércoles a Domingo", hours: "13:00 - 16:00 | 18:30 - 23:00" }
      ];
      setHorariosPublicos(defaultHorariosPublicos);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async () => {
    try {
      const defaultHorariosPublicos: HorarioPublico[] = [
        { days: "Lunes", hours: "Cerrado" },
        { days: "Martes", hours: "18:30 - 23:00" },
        { days: "Miércoles a Domingo", hours: "13:00 - 16:00 | 18:30 - 23:00" }
      ];

      const defaultConfig = {
        direccion: 'Calle Ejemplo 123, Valencia, España',
        telefono: '+34 963 000 000',
        email: 'reservas@enigmacocina.com',
        horario: defaultHorariosPublicos,
        mapa_url: null,
        texto_adicional: 'Enigma Cocina con Alma - Experiencia gastronómica única'
      };

      const { data, error } = await supabase
        .from('contacto')
        .insert([defaultConfig])
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      setHorariosPublicos(defaultHorariosPublicos);

      toast({
        title: 'Configuración creada',
        description: 'Se ha creado la configuración por defecto del restaurante'
      });
    } catch (error) {
      console.error('Error creating default config:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la configuración por defecto',
        variant: 'destructive'
      });
    }
  };

  const updateConfig = async (updates: Partial<RestaurantConfigData>) => {
    if (!config) return;

    try {
      // Incluir timestamp de actualización
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('contacto')
        .update(updateData)
        .eq('id', config.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, ...updateData } : null);
      
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

  const updateHorario = async (diaIndex: number, horarioUpdate: Partial<HorarioInfo>) => {
    if (!config) return;

    try {
      // Actualizar horarios localmente
      const nuevosHorarios = [...horarios];
      nuevosHorarios[diaIndex] = { ...nuevosHorarios[diaIndex], ...horarioUpdate };
      
      // Actualizar en base de datos
      const { error } = await supabase
        .from('contacto')
        .update({ 
          horario: nuevosHorarios,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setHorarios(nuevosHorarios);
      setConfig(prev => prev ? { ...prev, horario: nuevosHorarios } : null);
      
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

  const updateAllHorarios = async (nuevosHorarios: HorarioInfo[]) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('contacto')
        .update({ 
          horario: nuevosHorarios,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setHorarios(nuevosHorarios);
      setConfig(prev => prev ? { ...prev, horario: nuevosHorarios } : null);
      
      toast({
        title: 'Éxito',
        description: 'Horarios actualizados correctamente'
      });
    } catch (error) {
      console.error('Error updating horarios:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar los horarios',
        variant: 'destructive'
      });
    }
  };

  // Funciones para manejar horarios públicos
  const updateHorariosPublicos = async (nuevosHorarios: HorarioPublico[]) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('contacto')
        .update({ 
          horario: nuevosHorarios,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setHorariosPublicos(nuevosHorarios);
      setConfig(prev => prev ? { ...prev, horario: nuevosHorarios } : null);
      
      toast({
        title: 'Éxito',
        description: 'Horarios públicos actualizados correctamente'
      });
    } catch (error) {
      console.error('Error updating horarios públicos:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar los horarios públicos',
        variant: 'destructive'
      });
    }
  };

  const addHorarioPublico = async (days: string, hours: string) => {
    const nuevosHorarios = [...horariosPublicos, { days, hours }];
    await updateHorariosPublicos(nuevosHorarios);
  };

  const updateHorarioPublico = async (index: number, updates: Partial<HorarioPublico>) => {
    const nuevosHorarios = [...horariosPublicos];
    nuevosHorarios[index] = { ...nuevosHorarios[index], ...updates };
    await updateHorariosPublicos(nuevosHorarios);
  };

  const removeHorarioPublico = async (index: number) => {
    const nuevosHorarios = horariosPublicos.filter((_, i) => i !== index);
    await updateHorariosPublicos(nuevosHorarios);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    horarios,
    horariosPublicos,
    loading,
    updateConfig,
    updateHorario,
    updateAllHorarios,
    refetch: fetchConfig,
    createDefaultConfig,
    // Funciones para horarios públicos
    addHorarioPublico,
    updateHorarioPublico,
    removeHorarioPublico,
    updateHorariosPublicos
  };
}
