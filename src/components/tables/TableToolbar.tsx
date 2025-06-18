
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Trash, 
  Move, 
  Combine, 
  RotateCcw,
  Copy,
  CheckCircle2
} from 'lucide-react';
import type { TableMapMode } from './ProfessionalTableMap';

interface TableToolbarProps {
  mode: TableMapMode;
  selectedTables: Set<string>;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export function TableToolbar({ 
  mode, 
  selectedTables, 
  onClearSelection, 
  onBulkAction 
}: TableToolbarProps) {
  const hasSelection = selectedTables.size > 0;

  if (mode === 'view') {
    return null; // No toolbar needed in view mode
  }

  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-white border rounded-lg shadow-sm">
      {/* Selection info */}
      {hasSelection && (
        <>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {selectedTables.size} seleccionada{selectedTables.size > 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpiar selección
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Mode-specific actions */}
      {mode === 'edit' && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('move')}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <Move className="h-4 w-4" />
            Mover
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('duplicate')}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
        </div>
      )}

      {mode === 'combine' && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('combine')}
            disabled={selectedTables.size < 2}
            className="flex items-center gap-2"
          >
            <Combine className="h-4 w-4" />
            Combinar Seleccionadas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('separate')}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Separar
          </Button>
        </div>
      )}

      {/* Universal actions */}
      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('delete')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
        </>
      )}

      {/* Instructions */}
      <div className="ml-auto text-sm text-gray-500">
        {mode === 'edit' && 'Arrastra las mesas para moverlas'}
        {mode === 'combine' && 'Selecciona mesas para combinar'}
        {mode === 'assign' && 'Arrastra reservas desde el panel lateral'}
      </div>
    </div>
  );
}
