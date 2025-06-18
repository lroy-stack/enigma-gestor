
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveCanvasMap } from './InteractiveCanvasMap';
import { useTablesWithStates, TableWithState } from '@/hooks/useTableStates';
import { useTableCombinations, useCreateTableCombination } from '@/hooks/useTableCombinations';
import { toast } from 'sonner';
import { Link, Unlink, Users, MapPin } from 'lucide-react';

interface InteractiveTableMapProps {
  onTableSelect?: (tableId: string) => void;
  showCombinationTools?: boolean;
}

export function InteractiveTableMap({ 
  onTableSelect, 
  showCombinationTools = true 
}: InteractiveTableMapProps) {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showCombinations, setShowCombinations] = useState(false);
  const [combinationName, setCombinationName] = useState('');

  const { data: tables = [], refetch } = useTablesWithStates();
  const { data: combinations = [] } = useTableCombinations();
  const createCombination = useCreateTableCombination();

  const handleTableSelect = (tableId: string) => {
    if (selectedTables.includes(tableId)) {
      setSelectedTables(prev => prev.filter(id => id !== tableId));
    } else {
      setSelectedTables(prev => [...prev, tableId]);
    }
    
    if (onTableSelect) {
      onTableSelect(tableId);
    }
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  const handleCreateCombination = async () => {
    if (selectedTables.length < 2) {
      toast.error('Selecciona al menos 2 mesas para crear una combinación');
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
        activa: true
      });

      toast.success('Combinación creada exitosamente');
      setSelectedTables([]);
      setCombinationName('');
      refetch();
    } catch (error) {
      console.error('Error creating combination:', error);
      toast.error('Error al crear la combinación');
    }
  };

  const selectedTablesData = tables.filter(table => selectedTables.includes(table.id));
  const totalCapacity = selectedTablesData.reduce((sum, table) => sum + table.capacidad, 0);

  const tablesByZone = tables.reduce((acc, table) => {
    const zone = table.zona || 'interior';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, TableWithState[]>);

  // Get active combinations for display
  const activeCombinationsForDisplay = combinations.filter(combo => combo.activa);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mapa interactivo */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa Interactivo de Mesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 border rounded-lg overflow-hidden">
              <InteractiveCanvasMap
                tables={tables}
                onTableSelect={handleTableSelect}
                selectedTables={selectedTables}
                showCombinations={showCombinations}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button
                variant={showCombinations ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCombinations(!showCombinations)}
              >
                <Link className="h-4 w-4 mr-2" />
                {showCombinations ? 'Ocultar' : 'Mostrar'} Combinaciones
              </Button>
              
              {selectedTables.length > 0 && (
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Limpiar Selección
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel lateral */}
      <div className="space-y-6">
        {/* Mesas seleccionadas */}
        {selectedTables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mesas Seleccionadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedTablesData.map(table => (
                  <Badge key={table.id} variant="secondary" className="flex items-center gap-1">
                    Mesa {table.numero_mesa}
                    <Users className="h-3 w-3" />
                    {table.capacidad}
                  </Badge>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <strong>Capacidad total:</strong> {totalCapacity} personas
              </div>

              {showCombinationTools && selectedTables.length >= 2 && (
                <div className="space-y-3 pt-3 border-t">
                  <input
                    type="text"
                    placeholder="Nombre de la combinación (opcional)"
                    value={combinationName}
                    onChange={(e) => setCombinationName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <Button 
                    onClick={handleCreateCombination}
                    disabled={createCombination.isPending}
                    className="w-full"
                    size="sm"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Crear Combinación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Combinaciones activas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Combinaciones Activas</CardTitle>
          </CardHeader>
          <CardContent>
            {activeCombinationsForDisplay.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay combinaciones activas
              </p>
            ) : (
              <div className="space-y-3">
                {activeCombinationsForDisplay.map(combination => {
                  const combinationTables = tables.filter(t => 
                    [combination.mesa_principal_id, ...(combination.mesas_secundarias || [])].includes(t.id)
                  );
                  
                  return (
                    <div key={combination.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-2">
                        {combination.nombre_combinacion}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {combinationTables.map(table => (
                          <Badge key={table.id} variant="outline" className="text-xs">
                            {table.numero_mesa}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Capacidad: {combination.capacidad_total} personas
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas por zona */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mesas por Zona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                <div key={zone} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{zone}</span>
                  <Badge variant="outline">
                    {zoneTables.length} mesas
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
