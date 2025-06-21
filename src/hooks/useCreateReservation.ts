import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Hook especializado para creación de reservas con mejor manejo de errores
export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationData: Record<string, any>) => {
      // Log detallado de los datos que se envían
      console.log('🔍 useCreateReservation - Datos enviados:', reservationData);
      
      try {
        // Asegurar que fecha_reserva está en el formato correcto (YYYY-MM-DD)
        let processedData = { ...reservationData };
        if (processedData.fecha_reserva && typeof processedData.fecha_reserva === 'string') {
          try {
            const dateObj = new Date(processedData.fecha_reserva);
            if (!isNaN(dateObj.getTime())) {
              // Solo formatear si es una fecha válida
              processedData.fecha_reserva = format(dateObj, 'yyyy-MM-dd');
            }
          } catch (dateError) {
            console.error('⚠️ Error al formatear fecha:', dateError);
            // Mantener el valor original si hay error
          }
        }
        
        console.log('🔄 useCreateReservation - Datos procesados:', processedData);
        
        // Hacer la petición a Supabase con información completa de respuesta
        const { data, error, status, statusText } = await supabase
          .from('reservas')
          .insert([processedData])
          .select()
          .single();
        
        // Log completo de la respuesta
        console.log('📊 Respuesta de Supabase:', { 
          data, 
          error, 
          status, 
          statusText,
          tipoError: error ? typeof error : 'ninguno',
          detallesError: error ? JSON.stringify(error) : 'ninguno'
        });
        
        if (error) {
          console.error('❌ Error de Supabase:', error);
          throw error;
        }
        
        if (!data) {
          console.error('⚠️ No se devolvieron datos de la operación de inserción');
          throw new Error('No se devolvieron datos de la operación de inserción');
        }
        
        console.log('✅ Reserva creada con éxito:', data);
        return data;
      } catch (error: any) {
        console.error('💥 Excepción en useCreateReservation:', error);
        
        // Mensajes de error más informativos
        let errorMessage = 'Error desconocido al crear la reserva';
        
        if (error.code === '23505') {
          errorMessage = 'Ya existe una reserva con estos datos';
        } else if (error.code === '23503') {
          errorMessage = 'Error de referencia: algún ID proporcionado no existe';
        } else if (error.code === '23502') {
          errorMessage = 'Faltan campos obligatorios en la reserva';
        } else if (error.code === '22P02') {
          errorMessage = 'Formato de datos inválido';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Mostrar toast de error
        toast.error('Error al crear reserva', {
          description: errorMessage
        });
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Hook: Reserva creada exitosamente:', data);
      // Invalidar múltiples queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['today-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-stats'] });
      
      // Mostrar toast de éxito
      toast.success('Reserva creada con éxito', {
        description: `${data.nombre} - ${data.fecha_reserva} a las ${data.hora_reserva}`
      });
    },
    onError: (error: any) => {
      console.error('❌ Error en onError de useCreateReservation:', error);
    }
  });
}

// Función para test directo con Supabase
export async function testDirectReservationCreation() {
  const testReservation = {
    nombre: "Test Directo",
    email: "test@example.com",
    telefono: "+34600000000",
    fecha_reserva: format(new Date(), 'yyyy-MM-dd'),
    hora_reserva: "20:00",
    personas: 2,
    estado: "pendiente"
  };
  
  console.log('🧪 Probando creación directa de reserva:', testReservation);
  
  try {
    const { data, error, status } = await supabase
      .from('reservas')
      .insert([testReservation])
      .select()
      .single();
      
    console.log('📊 Respuesta de test directo:', { data, error, status });
    
    if (error) {
      console.error('❌ Error en test directo:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('💥 Excepción en test directo:', error);
    return { success: false, error };
  }
}