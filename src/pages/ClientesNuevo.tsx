import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function ClientesNuevo() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        console.log('🔍 Fetching clientes...');
        
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        console.log('✅ Clientes cargados:', data?.length);
        setClientes(data || []);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error cargando clientes:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Clientes</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando clientes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Clientes</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      
      {/* Estadísticas básicas */}
      <div className="bg-green-50 p-4 rounded mb-6">
        <p className="text-green-800">
          <strong>Total de clientes:</strong> {clientes.length}
        </p>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No se encontraron clientes
          </div>
        ) : (
          clientes.map((cliente) => (
            <div 
              key={cliente.id} 
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {cliente.name} {cliente.last_name}
                </h3>
                
                {cliente.email && (
                  <p className="text-gray-600 text-sm">{cliente.email}</p>
                )}
                
                {cliente.phone && (
                  <p className="text-gray-600 text-sm">{cliente.phone}</p>
                )}
                
                {cliente.empresa && (
                  <p className="text-blue-600 text-sm font-medium">{cliente.empresa}</p>
                )}
                
                {cliente.vip_status && (
                  <span className="inline-block px-2 py-1 bg-gold-100 text-gold-800 rounded text-xs font-medium">
                    VIP
                  </span>
                )}
                
                {cliente.total_visitas && (
                  <p className="text-gray-500 text-xs">
                    {cliente.total_visitas} visitas
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}