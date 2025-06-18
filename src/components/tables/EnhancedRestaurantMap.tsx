
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Settings,
  Filter,
  RefreshCw,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTablesWithStates, TableWithState, useUpdateTableState } from '@/hooks/useTableStates';
import { validateMesaEstado } from '@/types/mesa';
import { TableComponent } from './TableComponent';
import { TableStatePanel } from './TableStatePanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function EnhancedRestaurantMap() {
  const [selectedTable, setSelectedTable] = useState<TableWithState | null>(null);
  const [showStatePanel, setShowStatePanel] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  
  const { data: tables = [], refetch, isLoading } = useTablesWithStates();
  const updateTableState = useUpdateTableState();

  const handleTableClick = (table: TableWithState) => {
    setSelectedTable(table);
    setShowStatePanel(true);
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
      console.error('Error updating table state:', error);
    }
  };

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('enhanced-map-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'estados_mesa' 
      }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filter tables
  const filteredTables = tables.filter(table => {
    const stateMatch = stateFilter === 'all' || table.estado?.estado === stateFilter;
    const zoneMatch = zoneFilter === 'all' || table.zona === zoneFilter;
    return stateMatch && zoneMatch;
  });

  // Group by zones
  const tablesByZone = filteredTables.reduce((acc, table) => {
    const zone = table.zona;
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, TableWithState[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enigma-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-enigma-primary" />
              Mapa Avanzado del Restaurante
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="libre">Libres</SelectItem>
                    <SelectItem value="ocupada">Ocupadas</SelectItem>
                    <SelectItem value="reservada">Reservadas</SelectItem>
                    <SelectItem value="limpieza">Limpieza</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="campanar">Campanar</SelectItem>
                    <SelectItem value="justicia">Justicia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tables by Zone */}
      <div className="grid gap-6">
        {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
          <Card key={zone}>
            <CardHeader>
              <CardTitle className="capitalize">
                {zone === 'interior' && '🏛️ Sala Interior'}
                {zone === 'campanar' && '🌿 Terraza Campanar'}
                {zone === 'justicia' && '⚖️ Terraza Justicia'}
                <Badge variant="outline" className="ml-2">
                  {zoneTables.length} mesas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {zoneTables
                  .sort((a, b) => a.numero_mesa.localeCompare(b.numero_mesa, undefined, { numeric: true }))
                  .map((table) => (
                    <TableComponent
                      key={table.id}
                      table={table}
                      onClick={() => handleTableClick(table)}
                    />
                  ))
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* State Panel */}
      <TableStatePanel
        isOpen={showStatePanel}
        onClose={() => setShowStatePanel(false)}
        selectedTableId={selectedTable?.id}
      />
    </div>
  );
}
