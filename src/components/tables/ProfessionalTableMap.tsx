
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableToolbar } from './TableToolbar';
import { ReservationsSidebar } from './ReservationsSidebar';
import { TableCombinationManager } from './TableCombinationManager';
import { ModeSelector } from './ModeSelector';
import { RestaurantLayoutMap } from './RestaurantLayoutMap';
import { useTablesWithStates, TableWithState, useUpdateTableState } from '@/hooks/useTableStates';
import { useUpdateTablePosition } from '@/hooks/useTableCombinations';
import { validateMesaEstado } from '@/types/mesa';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type TableMapMode = 'view' | 'edit' | 'combine' | 'assign';

export function ProfessionalTableMap() {
  const [mode, setMode] = useState<TableMapMode>('view');
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [showReservations, setShowReservations] = useState(false);
  const [showCombinations, setShowCombinations] = useState(false);
  
  const { data: tables = [], refetch } = useTablesWithStates();
  const updateTableState = useUpdateTableState();
  const updateTablePosition = useUpdateTablePosition();

  // Handle table selection
  const handleTableSelect = useCallback((tableId: string, multiSelect = false) => {
    setSelectedTables(prev => {
      const newSelection = new Set(prev);
      if (multiSelect) {
        if (newSelection.has(tableId)) {
          newSelection.delete(tableId);
        } else {
          newSelection.add(tableId);
        }
      } else {
        newSelection.clear();
        newSelection.add(tableId);
      }
      return newSelection;
    });
  }, []);

  // Handle state changes
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
    }
  };

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('professional-table-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesa_estados' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Statistics
  const stats = tables.reduce((acc, table) => {
    const estado = table.estado?.estado || 'libre';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col">
      {/* Header with mode selector and stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <ModeSelector currentMode={mode} onModeChange={setMode} />
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Libres: {stats.libre || 0}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Ocupadas: {stats.ocupada || 0}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Reservadas: {stats.reservada || 0}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReservations(!showReservations)}
          >
            Reservas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCombinations(!showCombinations)}
          >
            Combinaciones
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <TableToolbar
        mode={mode}
        selectedTables={selectedTables}
        onClearSelection={() => setSelectedTables(new Set())}
        onBulkAction={(action) => {
          console.log('Bulk action:', action, selectedTables);
        }}
      />

      <div className="flex-1 flex relative">
        {/* Main layout area */}
        <div className="flex-1 mr-4">
          <RestaurantLayoutMap
            mode={mode}
            selectedTables={selectedTables}
            onTableSelect={handleTableSelect}
            onStateChange={handleStateChange}
            tables={tables}
          />
        </div>

        {/* Side panels */}
        {showReservations && (
          <ReservationsSidebar
            onClose={() => setShowReservations(false)}
            onAssignReservation={(reservationId, tableId) => {
              console.log('Assign reservation:', reservationId, 'to table:', tableId);
            }}
          />
        )}

        {showCombinations && (
          <TableCombinationManager
            selectedTables={selectedTables}
            onClose={() => setShowCombinations(false)}
            onCombinationChange={() => refetch()}
          />
        )}
      </div>
    </div>
  );
}
