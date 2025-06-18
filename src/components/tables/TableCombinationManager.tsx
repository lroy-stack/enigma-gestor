
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { 
  useTableCombinations, 
  useCreateTableCombination, 
  useDeleteTableCombination 
} from '@/hooks/useTableCombinations';
import { toast } from 'sonner';
import { Link, Unlink, Users, Trash2 } from 'lucide-react';

export function TableCombinationManager() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [combinationName, setCombinationName] = useState('');

  const { data: tables = [] } = useTablesWithStates();
  const { data: combinations = [] } = useTableCombinations();
  const createCombination = useCreateTableCombination();
  const deleteCombination = useDeleteTableCombination();

  const handleTableSelect = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleCreateCombination = async () => {
    if (selectedTables.length < 2) {
      toast.error('Selecciona al menos 2 mesas');
      return;
    }

    try {
      const [principal, ...secundarias] = selectedTables;
      const selectedTablesData = tables.filter(t => selectedTables.includes(t.id));
      const totalCapacity = selectedTablesData.reduce((sum, table) => sum + table.capacidad, 0);

      await createCombination.mutateAsync({
        nombre_combinacion: combinationName || `Combinación ${selectedTables.length} mesas`,
        mesa_principal_id: principal,
        mesas_secundarias: secundarias,
        capacidad_total: totalCapacity,
        activa: true,
        estado_combinacion: 'libre' as any
      });

      toast.success('Combinación creada exitosamente');
      setSelectedTables([]);
      setCombinationName('');
    } catch (error) {
      toast.error('Error al crear la combinación');
    }
  };

  const handleDeleteCombination = async (combinationId: string) => {
    try {
      await deleteCombination.mutateAsync(combinationId);
      toast.success('Combinación eliminada');
    } catch (error) {
      toast.error('Error al eliminar la combinación');
    }
  };

  const availableTables = tables.filter(table => 
    table.es_combinable && table.estado?.estado === 'libre'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crear nueva combinación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Crear Combinación de Mesas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nombre de la combinación
            </label>
            <input
              type="text"
              value={combinationName}
              onChange={(e) => setCombinationName(e.target.value)}
              placeholder="Ej: Zona VIP, Mesa familiar..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Seleccionar mesas ({selectedTables.length} seleccionadas)
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTables.includes(table.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">Mesa {table.numero_mesa}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    {table.capacidad}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedTables.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">Resumen:</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedTables.map(tableId => {
                  const table = tables.find(t => t.id === tableId);
                  return table ? (
                    <Badge key={tableId} variant="secondary">
                      Mesa {table.numero_mesa}
                    </Badge>
                  ) : null;
                })}
              </div>
              <div className="text-sm text-gray-600">
                Capacidad total: {tables
                  .filter(t => selectedTables.includes(t.id))
                  .reduce((sum, table) => sum + table.capacidad, 0)} personas
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleCreateCombination}
              disabled={selectedTables.length < 2 || createCombination.isPending}
              className="flex-1"
            >
              <Link className="h-4 w-4 mr-2" />
              Crear Combinación
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTables([]);
                setCombinationName('');
              }}
            >
              <Unlink className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Combinaciones existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Combinaciones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {combinations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay combinaciones creadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {combinations.map(combination => {
                const combinationTables = tables.filter(t => 
                  [combination.mesa_principal_id, ...(combination.mesas_secundarias || [])].includes(t.id)
                );
                
                return (
                  <div key={combination.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{combination.nombre_combinacion}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCombination(combination.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {combinationTables.map(table => (
                        <Badge key={table.id} variant="outline">
                          Mesa {table.numero_mesa} ({table.capacidad}p)
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div>Capacidad total: {combination.capacidad_total} personas</div>
                      <div>Estado: {combination.estado_combinacion}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
