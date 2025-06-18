
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TableComponent } from './TableComponent';
import { TableCombinationVisualization } from './TableCombinationVisualization';
import { TableWithState } from '@/hooks/useTableStates';

interface TableCombination {
  id: string;
  nombre_combinacion: string;
  mesa_principal_id: string;
  mesas_combinadas: string[];
  capacidad_total: number;
  activa: boolean;
}

interface TableZoneViewProps {
  title: string;
  tables: TableWithState[];
  combinations: TableCombination[];
  selectedTables: string[];
  onTableClick: (tableId: string) => void;
  onTableDoubleClick: (tableId: string) => void;
  className?: string;
  titleClassName?: string;
  isDetailedView?: boolean;
}

export function TableZoneView({
  title,
  tables,
  combinations,
  selectedTables,
  onTableClick,
  onTableDoubleClick,
  className,
  titleClassName,
  isDetailedView = false
}: TableZoneViewProps) {
  const getStateStats = (tables: TableWithState[]) => {
    const stats = {
      libre: 0,
      ocupada: 0,
      reservada: 0,
      limpieza: 0,
      fuera_servicio: 0
    };

    tables.forEach(table => {
      const estado = table.estado?.estado || 'libre';
      if (estado in stats) {
        stats[estado as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const stats = getStateStats(tables);
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacidad, 0);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-sm', titleClassName)}>
            {title} ({tables.length} mesas)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Capacidad: {totalCapacity}
            </Badge>
            {combinations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {combinations.length} combinaciones
              </Badge>
            )}
          </div>
        </div>
        
        {/* Mini estadísticas */}
        <div className="flex items-center gap-1 text-xs">
          {stats.libre > 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-700 text-xs py-0">
              L:{stats.libre}
            </Badge>
          )}
          {stats.ocupada > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs py-0">
              O:{stats.ocupada}
            </Badge>
          )}
          {stats.reservada > 0 && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs py-0">
              R:{stats.reservada}
            </Badge>
          )}
          {stats.limpieza > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs py-0">
              L:{stats.limpieza}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative" style={{ minHeight: isDetailedView ? '500px' : '300px' }}>
        {/* Visualización de combinaciones */}
        {combinations.map(combination => (
          <TableCombinationVisualization
            key={combination.id}
            combination={combination}
            tables={tables}
            isDetailedView={isDetailedView}
          />
        ))}

        {/* Mesas individuales */}
        {tables.map(table => {
          const isInCombination = combinations.some(combo => 
            combo.mesas_combinadas.includes(table.id)
          );
          
          return (
            <TableComponent
              key={table.id}
              table={table}
              isSelected={selectedTables.includes(table.id)}
              isCombinable={false}
              onClick={() => onTableClick(table.id)}
              onDoubleClick={() => onTableDoubleClick(table.id)}
              className={isInCombination ? 'ring-2 ring-purple-300' : ''}
            />
          );
        })}

        {/* Mensaje si no hay mesas */}
        {tables.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No hay mesas en esta zona con los filtros aplicados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
