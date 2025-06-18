
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTablesWithStates, TableWithState, useUpdateTableState } from '@/hooks/useTableStates';
import { useEnhancedTableTimer } from '@/hooks/useEnhancedTableTimer';
import { IOSTableModal } from './IOSTableModal';
import { TableComponent } from './TableComponent';
import { TableSuggestionsWidget } from './TableSuggestionsWidget';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateMesaEstado } from '@/types/mesa';

export function StreamlinedFloorPlan() {
  const [selectedTable, setSelectedTable] = useState<TableWithState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: tables = [], refetch, isLoading } = useTablesWithStates();
  const { timers, startTimer, stopTimer, removeTimer, getTimer } = useEnhancedTableTimer();
  const updateTableState = useUpdateTableState();

  // Agrupar mesas por zona con nueva estructura
  const tablesByZone = tables.reduce((acc, table) => {
    const zone = table.zona;
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, TableWithState[]>);

  // Configuración de zonas actualizada
  const zoneConfig = {
    'interior': { 
      name: '🏛️ Sala Interior', 
      color: 'border-enigma-primary',
      gridCols: 'grid-cols-3'
    },
    'campanar': { 
      name: '🌿 Terraza Campanar', 
      color: 'border-green-500',
      gridCols: 'grid-cols-4 lg:grid-cols-6'
    },
    'justicia': { 
      name: '⚖️ Terraza Justicia', 
      color: 'border-orange-500',
      gridCols: 'grid-cols-3 lg:grid-cols-4'
    }
  };

  const handleTableClick = (table: TableWithState) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleStateChange = async (tableId: string, newState: string) => {
    try {
      const validatedState = validateMesaEstado(newState);
      await updateTableState.mutateAsync({
        mesaId: tableId,
        estado: validatedState,
      });
      refetch();
    } catch (error) {
      toast.error('Error al actualizar mesa');
      console.error('Error updating table state:', error);
    }
  };

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('enhanced-table-updates')
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

  // Estadísticas mejoradas
  const stats = tables.reduce((acc, table) => {
    const estado = table.estado?.estado || 'libre';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLibres = stats.libre || 0;
  const totalOcupadas = stats.ocupada || 0;
  const totalMesas = tables.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enigma-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ios-safe-area">
      {/* Header con estadísticas y sugerencias */}
      <Card className="ios-card-elevated">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-enigma-primary ios-text-title2">
              <Calendar className="h-6 w-6" />
              Control de Mesas en Tiempo Real
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Estadísticas básicas */}
              <div className="flex items-center gap-3">
                <Badge className="ios-badge-available px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Libres: {totalLibres}
                </Badge>
                <Badge className="ios-badge-occupied px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  Ocupadas: {totalOcupadas}
                </Badge>
                <Badge className="ios-badge-reserved px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Reservadas: {stats.reservada || 0}
                </Badge>
                {(stats.limpieza || 0) > 0 && (
                  <Badge className="ios-badge-cleaning px-4 py-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Limpieza: {stats.limpieza}
                  </Badge>
                )}
              </div>

              {/* Botón de sugerencias inteligentes */}
              <Button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="bg-enigma-primary hover:bg-enigma-primary/90 text-white flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                {showSuggestions ? 'Ocultar' : 'Sugerencias IA'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Widget de sugerencias inteligentes */}
      {showSuggestions && (
        <TableSuggestionsWidget
          onSuggestionApplied={() => {
            refetch();
            setShowSuggestions(false);
          }}
        />
      )}

      {/* Plano por zonas con diseño mejorado */}
      <div className="space-y-6">
        {Object.entries(tablesByZone).map(([zoneType, zoneTables]) => {
          const config = zoneConfig[zoneType as keyof typeof zoneConfig];
          if (!config) return null;

          return (
            <Card key={zoneType} className={cn("ios-card border-l-4", config.color)}>
              <CardHeader className="pb-4">
                <CardTitle className="ios-text-title3 font-semibold text-gray-800">
                  {config.name}
                  <span className="ml-3 ios-text-callout font-normal text-gray-500">
                    ({zoneTables.length} mesas)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "grid gap-4",
                  config.gridCols
                )}>
                  {zoneTables
                    .sort((a, b) => a.numero_mesa.localeCompare(b.numero_mesa, undefined, { numeric: true }))
                    .map((table) => (
                      <TableComponent
                        key={table.id}
                        table={table}
                        timer={getTimer(table.id)}
                        onClick={() => handleTableClick(table)}
                      />
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal iOS mejorado */}
      <IOSTableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        table={selectedTable}
        onStateChange={handleStateChange}
        timer={selectedTable ? getTimer(selectedTable.id) : undefined}
        onStartTimer={startTimer}
        onStopTimer={stopTimer}
      />
    </div>
  );
}
