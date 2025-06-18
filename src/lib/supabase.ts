import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://alkjwbrrdoluzvrzthfd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa2p3YnJyZG9sdXp2cnp0aGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjczNjksImV4cCI6MjA2MDU0MzM2OX0.nSUoYchfdgTOTtulUgA6SjzCKfoNbvipwwIyt_ZOls8";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Funciones de utilidad para interactuar con la base de datos
export const supabaseUtils = {
  // Verificar disponibilidad de mesa
  async verificarDisponibilidadMesa(
    fecha: string,
    horaInicio: string,
    numComensales: number,
    duracionMinutos: number = 120
  ) {
    const { data, error } = await supabase.rpc('verificar_disponibilidad_mesa', {
      p_fecha: fecha,
      p_hora_inicio: horaInicio,
      p_num_comensales: numComensales,
      p_duracion_minutos: duracionMinutos
    });
    
    if (error) throw error;
    return data;
  },

  // Registrar cliente si no existe
  async registrarClienteSiNoExiste(
    nombre: string,
    apellido: string,
    email: string,
    telefono: string
  ) {
    const { data, error } = await supabase.rpc('registrar_cliente_si_no_existe', {
      p_nombre: nombre,
      p_apellido: apellido,
      p_email: email,
      p_telefono: telefono
    });
    
    if (error) throw error;
    return data;
  },

  // Obtener configuración del restaurante
  async obtenerConfiguracionRestaurante() {
    const { data, error } = await supabase
      .from('restaurante_config')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nueva reserva
  async crearReserva(reserva: any) {
    const { data, error } = await supabase
      .from('reservas')
      .insert([reserva])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener reservas por fecha
  async obtenerReservasPorFecha(fecha: string) {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        clientes (*),
        mesas (*),
        personal (*)
      `)
      .eq('fecha_reserva', fecha)
      .order('hora_reserva');
    
    if (error) throw error;
    return data;
  }
};