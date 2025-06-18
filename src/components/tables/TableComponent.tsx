
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { TableWithState } from '@/hooks/useTableStates';

interface TableComponentProps {
  table: TableWithState;
  timer?: {
    isActive: boolean;
    timeLeft: number;
    status: 'verde' | 'amarillo' | 'rojo';
  };
  onClick: () => void;
  onDoubleClick?: () => void;
  className?: string;
  isSelected?: boolean;
  isCombinable?: boolean;
}

export function TableComponent({ 
  table, 
  timer,
  onClick, 
  onDoubleClick,
  className,
  isSelected = false,
  isCombinable = false
}: TableComponentProps) {
  const getStateColors = (estado?: string) => {
    switch (estado) {
      case 'libre':
        return {
          bg: 'bg-green-500 hover:bg-green-600',
          border: 'border-green-400',
          text: 'text-white',
          shadow: 'shadow-green-200'
        };
      case 'ocupada':
        // Color basado en timer si está activo
        if (timer?.isActive) {
          switch (timer.status) {
            case 'rojo':
              return {
                bg: 'bg-red-600 hover:bg-red-700',
                border: 'border-red-500',
                text: 'text-white',
                shadow: 'shadow-red-300'
              };
            case 'amarillo':
              return {
                bg: 'bg-yellow-500 hover:bg-yellow-600',
                border: 'border-yellow-400',
                text: 'text-white',
                shadow: 'shadow-yellow-200'
              };
            default:
              return {
                bg: 'bg-blue-500 hover:bg-blue-600',
                border: 'border-blue-400',
                text: 'text-white',
                shadow: 'shadow-blue-200'
              };
          }
        }
        return {
          bg: 'bg-blue-500 hover:bg-blue-600',
          border: 'border-blue-400',
          text: 'text-white',
          shadow: 'shadow-blue-200'
        };
      case 'reservada':
        return {
          bg: 'bg-purple-500 hover:bg-purple-600',
          border: 'border-purple-400',
          text: 'text-white',
          shadow: 'shadow-purple-200'
        };
      case 'limpieza':
        return {
          bg: 'bg-yellow-500 hover:bg-yellow-600',
          border: 'border-yellow-400',
          text: 'text-white',
          shadow: 'shadow-yellow-200'
        };
      case 'fuera_servicio':
        return {
          bg: 'bg-gray-500 hover:bg-gray-600',
          border: 'border-gray-400',
          text: 'text-white',
          shadow: 'shadow-gray-200'
        };
      default:
        return {
          bg: 'bg-gray-300 hover:bg-gray-400',
          border: 'border-gray-300',
          text: 'text-gray-700',
          shadow: 'shadow-gray-100'
        };
    }
  };

  const getStateIcon = (estado?: string) => {
    switch (estado) {
      case 'libre':
        return <CheckCircle className="w-4 h-4" />;
      case 'ocupada':
        return <Users className="w-4 h-4" />;
      case 'reservada':
        return <Clock className="w-4 h-4" />;
      case 'limpieza':
        return <AlertCircle className="w-4 h-4" />;
      case 'fuera_servicio':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const estado = table.estado?.estado || 'libre';
  const colors = getStateColors(estado);

  return (
    <div
      className={cn(
        "relative rounded-ios border-2 cursor-pointer transition-all duration-300 transform hover:scale-105",
        "flex flex-col items-center justify-center p-4 min-h-[90px] min-w-[120px]",
        "ios-touch-feedback shadow-lg",
        colors.bg,
        colors.border,
        colors.text,
        colors.shadow,
        isSelected && "ring-4 ring-enigma-primary ring-opacity-50",
        className
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Número de Mesa */}
      <div className="text-xl font-bold mb-1">
        {table.numero_mesa}
      </div>
      
      {/* Estado e Icono */}
      <div className="flex items-center gap-2 mb-2">
        {getStateIcon(estado)}
        <span className="text-sm font-medium capitalize">
          {estado.replace('_', ' ')}
        </span>
      </div>
      
      {/* Capacidad */}
      <div className="flex items-center gap-1 text-sm opacity-90">
        <Users className="w-3 h-3" />
        <span>{table.capacidad} pers.</span>
      </div>
      
      {/* Timer indicator */}
      {timer?.isActive && (
        <div className="absolute -top-2 -right-2">
          <Badge 
            className={cn(
              "text-xs px-2 py-1 font-mono",
              timer.status === 'rojo' ? 'bg-red-100 text-red-800 border-red-300' :
              timer.status === 'amarillo' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
              'bg-green-100 text-green-800 border-green-300'
            )}
          >
            {Math.floor(timer.timeLeft / 60)}:{(timer.timeLeft % 60).toString().padStart(2, '0')}
          </Badge>
        </div>
      )}

      {/* Indicador de reserva */}
      {table.estado?.reserva_id && (
        <div className="absolute -top-1 -left-1">
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse border-2 border-white"></div>
        </div>
      )}

      {/* Indicador de selección */}
      {isSelected && (
        <div className="absolute inset-0 border-4 border-enigma-primary rounded-ios pointer-events-none"></div>
      )}
    </div>
  );
}
