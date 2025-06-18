
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTablesWithStates, useUpdateTableState } from '@/hooks/useTableStates';
import { validateMesaEstado } from '@/types/mesa';
import { toast } from 'sonner';
import { Users, MapPin } from 'lucide-react';

export function SimplifiedSVGTableMap() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  const { data: tables = [], refetch } = useTablesWithStates();
  const updateTableState = useUpdateTableState();

  const handleTableClick = (tableId: string) => {
    setSelectedTable(selectedTable === tableId ? null : tableId);
  };

  const handleStateChange = async (tableId: string, newState: string) => {
    try {
      const validatedState = validateMesaEstado(newState);
      await updateTableState.mutateAsync({
        mesaId: tableId,
        estado: validatedState,
      });
      refetch();
      setSelectedTable(null);
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const getTableColor = (estado: string | undefined) => {
    const colors = {
      libre: '#10B981',
      ocupada: '#EF4444',
      reservada: '#3B82F6',
      limpieza: '#F59E0B',
      fuera_servicio: '#6B7280'
    };
    return colors[estado as keyof typeof colors] || colors.libre;
  };

  const tablesByZone = tables.reduce((acc, table) => {
    const zone = table.zona || 'interior';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, typeof tables>);

  return (
    <div className="space-y-6">
      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
          <div key={zone} className="text-center p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 mx-auto mb-1 text-gray-600" />
            <div className="text-sm font-medium capitalize">{zone}</div>
            <div className="text-xs text-gray-500">{zoneTables.length} mesas</div>
          </div>
        ))}
      </div>

      {/* Mapa simplificado por zonas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
          <div key={zone} className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-4 capitalize flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {zone}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {zoneTables.map(table => {
                const isSelected = selectedTable === table.id;
                const estado = table.estado?.estado || 'libre';
                
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table.id)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      isSelected ? 'border-black shadow-lg' : 'border-gray-200'
                    }`}
                    style={{ 
                      backgroundColor: getTableColor(estado) + '20',
                      borderColor: isSelected ? '#000' : getTableColor(estado) + '40'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getTableColor(estado) }}
                    >
                      {table.numero_mesa}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacidad}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs mt-1"
                      style={{ borderColor: getTableColor(estado), color: getTableColor(estado) }}
                    >
                      {estado}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Panel de control */}
      {selectedTable && (
        <div className="fixed bottom-4 right-4 p-4 bg-white border rounded-lg shadow-lg max-w-sm">
          {(() => {
            const table = tables.find(t => t.id === selectedTable);
            if (!table) return null;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Mesa {table.numero_mesa}</h4>
                  <button 
                    onClick={() => setSelectedTable(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {table.capacidad} personas • {table.zona}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['libre', 'ocupada', 'reservada', 'limpieza'].map(estado => (
                    <Button
                      key={estado}
                      variant={table.estado?.estado === estado ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStateChange(table.id, estado)}
                      className="text-xs"
                    >
                      {estado}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
