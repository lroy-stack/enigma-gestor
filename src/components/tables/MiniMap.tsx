
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TableWithState } from '@/hooks/useTableStates';

interface MiniMapProps {
  tables: TableWithState[];
  currentZoom: number;
  onZoneClick: (zone: string) => void;
  className?: string;
}

export function MiniMap({ tables, currentZoom, onZoneClick, className }: MiniMapProps) {
  const zones = [
    { id: 'terraza_superior', name: 'T. Campanar', color: 'bg-green-500', tables: tables.filter(t => t.tipo_mesa === 'terraza_superior') },
    { id: 'estandar', name: 'Sala Interior', color: 'bg-blue-500', tables: tables.filter(t => t.tipo_mesa === 'estandar') },
    { id: 'terraza_inferior', name: 'T. Justicia', color: 'bg-orange-500', tables: tables.filter(t => t.tipo_mesa === 'terraza_inferior') },
  ];

  return (
    <Card className={cn('absolute top-4 right-4 w-48 bg-white/95 backdrop-blur-sm shadow-lg', className)}>
      <CardContent className="p-3">
        <div className="text-xs font-medium mb-2">Navegación Rápida</div>
        
        {/* Vista general */}
        <div className="relative w-full h-32 bg-gray-100 rounded border mb-3">
          {zones.map((zone, index) => (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className={cn(
                'absolute rounded transition-all hover:scale-105 hover:opacity-80',
                zone.color,
                'opacity-30 hover:opacity-50'
              )}
              style={{
                left: `${10 + index * 30}%`,
                top: `${10 + index * 20}%`,
                width: '25%',
                height: '30%',
              }}
              title={`Ir a ${zone.name}`}
            />
          ))}
          
          {/* Indicador de viewport actual */}
          <div 
            className="absolute border-2 border-blue-600 rounded opacity-60"
            style={{
              left: '20%',
              top: '20%',
              width: '60%',
              height: '60%',
            }}
          />
        </div>

        {/* Estadísticas por zona */}
        <div className="space-y-2">
          {zones.map(zone => {
            const stats = zone.tables.reduce((acc, table) => {
              const estado = table.estado?.estado || 'libre';
              acc[estado] = (acc[estado] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return (
              <Button
                key={zone.id}
                variant="ghost"
                size="sm"
                onClick={() => onZoneClick(zone.id)}
                className="w-full justify-between p-2 h-auto"
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded', zone.color)} />
                  <span className="text-xs font-medium">{zone.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-green-600">{stats.libre || 0}</span>
                  <span className="text-red-600">{stats.ocupada || 0}</span>
                  <span className="text-blue-600">{stats.reservada || 0}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Control de zoom */}
        <div className="mt-3 pt-2 border-t">
          <div className="text-xs text-gray-600 mb-1">
            Zoom: {Math.round(currentZoom * 100)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((currentZoom / 3) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
