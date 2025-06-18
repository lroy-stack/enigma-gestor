
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTablesWithStates, useUpdateTableState } from '@/hooks/useTableStates';
import { validateMesaEstado } from '@/types/mesa';
import { toast } from 'sonner';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export function SVGTableMap() {
  const [zoom, setZoom] = useState(1);
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
      toast.success('Estado de mesa actualizado');
    } catch (error) {
      toast.error('Error al actualizar mesa');
    }
  };

  const getTableColor = (estado: string | undefined) => {
    switch (estado) {
      case 'libre': return '#10B981'; // Verde
      case 'ocupada': return '#EF4444'; // Rojo
      case 'reservada': return '#3B82F6'; // Azul
      case 'limpieza': return '#F59E0B'; // Amarillo
      case 'fuera_servicio': return '#6B7280'; // Gris
      default: return '#10B981';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mapa del Restaurante</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(1)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
          <svg
            width={800 * zoom}
            height={600 * zoom}
            viewBox="0 0 800 600"
            className="border bg-white"
          >
            {/* Fondo del restaurante */}
            <rect width="800" height="600" fill="#f8f9fa" />
            
            {/* Zonas del restaurante */}
            <rect x="50" y="50" width="300" height="200" fill="#e3f2fd" stroke="#1976d2" strokeWidth="2" />
            <text x="200" y="40" textAnchor="middle" className="text-sm font-medium fill-blue-700">
              Sala Interior
            </text>
            
            <rect x="400" y="50" width="300" height="200" fill="#f3e5f5" stroke="#7b1fa2" strokeWidth="2" />
            <text x="550" y="40" textAnchor="middle" className="text-sm font-medium fill-purple-700">
              Terraza Campanar
            </text>
            
            <rect x="50" y="300" width="650" height="250" fill="#e8f5e8" stroke="#388e3c" strokeWidth="2" />
            <text x="375" y="290" textAnchor="middle" className="text-sm font-medium fill-green-700">
              Terraza Justicia
            </text>

            {/* Mesas */}
            {tables.map((table) => {
              const isSelected = selectedTable === table.id;
              const estado = table.estado?.estado || 'libre';
              
              return (
                <g key={table.id}>
                  <circle
                    cx={table.position_x}
                    cy={table.position_y}
                    r={table.capacidad <= 2 ? 20 : table.capacidad <= 4 ? 25 : 30}
                    fill={getTableColor(estado)}
                    stroke={isSelected ? '#000' : '#fff'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => handleTableClick(table.id)}
                  />
                  <text
                    x={table.position_x}
                    y={table.position_y}
                    textAnchor="middle"
                    dy="0.3em"
                    className="text-xs font-bold fill-white pointer-events-none"
                  >
                    {table.numero_mesa}
                  </text>
                  <text
                    x={table.position_x}
                    y={table.position_y + 15}
                    textAnchor="middle"
                    className="text-xs fill-white pointer-events-none"
                  >
                    {table.capacidad}p
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Panel de control para mesa seleccionada */}
        {selectedTable && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            {(() => {
              const table = tables.find(t => t.id === selectedTable);
              if (!table) return null;
              
              return (
                <div>
                  <h4 className="font-medium mb-3">
                    Mesa {table.numero_mesa} - {table.capacidad} personas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['libre', 'ocupada', 'reservada', 'limpieza', 'fuera_servicio'].map(estado => (
                      <Button
                        key={estado}
                        variant={table.estado?.estado === estado ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStateChange(table.id, estado)}
                      >
                        {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Limpieza</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span>Fuera de servicio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
