
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableWithState } from '@/hooks/useTableStates';

interface TableCombination {
  id: string;
  nombre_combinacion: string;
  mesa_principal_id: string;
  mesas_combinadas: string[];
  capacidad_total: number;
  activa: boolean;
}

interface TableCombinationVisualizationProps {
  combination: TableCombination;
  tables: TableWithState[];
  isDetailedView?: boolean;
}

export function TableCombinationVisualization({
  combination,
  tables,
  isDetailedView = false
}: TableCombinationVisualizationProps) {
  const combinedTables = tables.filter(table => 
    combination.mesas_combinadas.includes(table.id)
  );

  if (combinedTables.length < 2) return null;

  // Calcular posición central para mostrar la información de la combinación
  const centerX = combinedTables.reduce((sum, table) => sum + table.position_x, 0) / combinedTables.length;
  const centerY = combinedTables.reduce((sum, table) => sum + table.position_y, 0) / combinedTables.length;

  // Generar líneas conectoras entre las mesas
  const connectionLines = [];
  const mainTable = combinedTables.find(t => t.id === combination.mesa_principal_id);
  
  if (mainTable) {
    combinedTables.forEach(table => {
      if (table.id !== combination.mesa_principal_id) {
        connectionLines.push({
          from: { x: mainTable.position_x + 40, y: mainTable.position_y + 30 }, // Centro de la mesa principal
          to: { x: table.position_x + 40, y: table.position_y + 30 } // Centro de la mesa secundaria
        });
      }
    });
  }

  return (
    <>
      {/* Líneas conectoras */}
      <svg 
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: '100%', height: '100%' }}
      >
        {connectionLines.map((line, index) => (
          <line
            key={index}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke="#9333ea"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        ))}
      </svg>

      {/* Información de la combinación */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: `${centerX - 60}px`,
          top: `${centerY - 40}px`,
        }}
      >
        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-1 text-xs">
            <Link className="w-3 h-3 text-purple-600" />
            <span className="font-medium text-purple-800 truncate max-w-20">
              {combination.nombre_combinacion}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-700">
            <Users className="w-3 h-3" />
            <span>{combination.capacidad_total}</span>
          </div>
        </div>
      </div>

      {/* Área de fondo para la combinación */}
      {isDetailedView && (
        <div
          className="absolute bg-purple-50 border-2 border-purple-200 rounded-lg opacity-30 z-0"
          style={{
            left: `${Math.min(...combinedTables.map(t => t.position_x)) - 10}px`,
            top: `${Math.min(...combinedTables.map(t => t.position_y)) - 10}px`,
            width: `${Math.max(...combinedTables.map(t => t.position_x + 80)) - Math.min(...combinedTables.map(t => t.position_x)) + 20}px`,
            height: `${Math.max(...combinedTables.map(t => t.position_y + 64)) - Math.min(...combinedTables.map(t => t.position_y)) + 20}px`,
          }}
        />
      )}
    </>
  );
}
