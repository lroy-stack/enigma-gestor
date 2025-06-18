
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, Edit3, Combine, UserPlus } from 'lucide-react';
import type { TableMapMode } from './ProfessionalTableMap';

interface ModeSelectorProps {
  currentMode: TableMapMode;
  onModeChange: (mode: TableMapMode) => void;
}

const modes = [
  {
    id: 'view' as TableMapMode,
    label: 'Vista',
    icon: Eye,
    description: 'Ver y cambiar estados de mesas'
  },
  {
    id: 'edit' as TableMapMode,
    label: 'Editar',
    icon: Edit3,
    description: 'Mover y reorganizar mesas'
  },
  {
    id: 'combine' as TableMapMode,
    label: 'Combinar',
    icon: Combine,
    description: 'Unir mesas contiguas'
  },
  {
    id: 'assign' as TableMapMode,
    label: 'Asignar',
    icon: UserPlus,
    description: 'Asignar reservas a mesas'
  }
];

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <Button
            key={mode.id}
            variant="ghost"
            size="sm"
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 transition-all",
              isActive && "bg-white shadow-sm text-blue-600"
            )}
            title={mode.description}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{mode.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
