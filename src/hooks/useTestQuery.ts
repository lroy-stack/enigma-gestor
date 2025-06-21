import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTestReservas() {
  return useQuery({
    queryKey: ['test-reservas'],
    queryFn: async () => {
      console.log('🔍 TEST RESERVAS - Starting...');
      
      try {
        // Prueba 1: Verificar si la tabla existe
        const { data: schemaTest, error: schemaError } = await supabase
          .from('reservas')
          .select('*')
          .limit(1);

        console.log('📊 Schema test result:', { 
          data: schemaTest, 
          error: schemaError,
          errorCode: schemaError?.code,
          errorMessage: schemaError?.message,
          errorDetails: schemaError?.details
        });

        if (schemaError) {
          return { error: schemaError, step: 'schema_test' };
        }

        // Prueba 2: Contar registros
        const { count, error: countError } = await supabase
          .from('reservas')
          .select('*', { count: 'exact', head: true });

        console.log('📊 Count result:', { count, error: countError });

        if (countError) {
          return { error: countError, step: 'count_test' };
        }

        // Prueba 3: Obtener estructura de columnas
        const { data: sampleData, error: sampleError } = await supabase
          .from('reservas')
          .select('*')
          .limit(1);

        console.log('📊 Sample data:', { 
          sampleData, 
          error: sampleError,
          columns: sampleData?.[0] ? Object.keys(sampleData[0]) : 'No data'
        });

        return {
          success: true,
          count,
          sampleData,
          columns: sampleData?.[0] ? Object.keys(sampleData[0]) : []
        };

      } catch (exception) {
        console.error('💥 Exception in test:', exception);
        return { error: exception, step: 'exception' };
      }
    },
    retry: false,
    staleTime: 0,
  });
}

export function useTestContacts() {
  return useQuery({
    queryKey: ['test-contacts'],
    queryFn: async () => {
      console.log('🔍 TEST CONTACTS - Starting...');
      
      try {
        // Prueba 1: Verificar si la tabla existe
        const { data: schemaTest, error: schemaError } = await supabase
          .from('contacts')
          .select('*')
          .limit(1);

        console.log('📊 Contacts schema test result:', { 
          data: schemaTest, 
          error: schemaError,
          errorCode: schemaError?.code,
          errorMessage: schemaError?.message
        });

        if (schemaError) {
          return { error: schemaError, step: 'schema_test' };
        }

        // Prueba 2: Contar registros
        const { count, error: countError } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true });

        console.log('📊 Contacts count result:', { count, error: countError });

        return {
          success: true,
          count,
          sampleData: schemaTest,
          columns: schemaTest?.[0] ? Object.keys(schemaTest[0]) : []
        };

      } catch (exception) {
        console.error('💥 Exception in contacts test:', exception);
        return { error: exception, step: 'exception' };
      }
    },
    retry: false,
    staleTime: 0,
  });
}