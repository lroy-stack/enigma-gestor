
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Utensils,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableWithState } from '@/hooks/useTableStates';
import { toast } from 'sonner';

interface StreamlinedTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableWithState | null;
  onStateChange: (tableId: string, newState: string) => void;
  timer?: any;
}

export function StreamlinedTableModal({
  isOpen,
  onClose,
  table,
  onStateChange,
  timer
}: StreamlinedTableModalProps) {
  const [selectedState, setSelectedState] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [notes, setNotes] = useState('');

  if (!table) return null;

  const currentState = table.estado?.estado || 'libre';

  const stateOptions = [
    { value: 'libre', label: 'Libre', icon: CheckCircle, color: 'text-green-600' },
    { value: 'ocupada', label: 'Ocupada', icon: Users, color: 'text-blue-600' },
    { value: 'reservada', label: 'Reservada', icon: Clock, color: 'text-purple-600' },
    { value: 'limpieza', label: 'Limpieza', icon: Utensils, color: 'text-yellow-600' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio', icon: XCircle, color: 'text-gray-600' }
  ];

  const getCurrentStateConfig = () => {
    return stateOptions.find(opt => opt.value === currentState) || stateOptions[0];
  };

  const handleStateChange = () => {
    if (!selectedState) {
      toast.error('Selecciona un estado');
      return;
    }

    onStateChange(table.id, selectedState);
    onClose();
    
    // Reset form
    setSelectedState('');
    setEstimatedTime('');
    setNotes('');
  };

  const getTimerInfo = () => {
    if (!timer?.isActive) return null;
    
    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    
    return {
      timeLeft: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      status: timer.status,
      statusColor: timer.status === 'rojo' ? 'text-red-600' : 
                  timer.status === 'amarillo' ? 'text-yellow-600' : 'text-green-600'
    };
  };

  const timerInfo = getTimerInfo();
  const currentStateConfig = getCurrentStateConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-enigma-primary" />
            Mesa {table.numero_mesa}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información actual */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Estado Actual:</span>
              <Badge className={cn("px-3 py-1", {
                'bg-green-100 text-green-800': currentState === 'libre',
                'bg-blue-100 text-blue-800': currentState === 'ocupada',
                'bg-purple-100 text-purple-800': currentState === 'reservada',
                'bg-yellow-100 text-yellow-800': currentState === 'limpieza',
                'bg-gray-100 text-gray-800': currentState === 'fuera_servicio'
              })}>
                <currentStateConfig.icon className="h-3 w-3 mr-1" />
                {currentStateConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Capacidad:</span>
                <span className="ml-2 font-medium">{table.capacidad} personas</span>
              </div>
              <div>
                <span className="text-gray-600">Zona:</span>
                <span className="ml-2 font-medium capitalize">
                  {table.tipo_mesa.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Timer info */}
            {timerInfo && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tiempo restante:</span>
                <span className={cn("font-mono font-bold", timerInfo.statusColor)}>
                  {timerInfo.timeLeft}
                </span>
              </div>
            )}

            {/* Notas actuales */}
            {table.estado?.notas_estado && (
              <div className="pt-2 border-t">
                <span className="text-sm text-gray-600">Notas:</span>
                <p className="text-sm mt-1 text-gray-800">{table.estado.notas_estado}</p>
              </div>
            )}
          </div>

          {/* Cambio de estado */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-state">Nuevo Estado</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className={cn("h-4 w-4", option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tiempo estimado (solo para ocupada/limpieza) */}
            {(selectedState === 'ocupada' || selectedState === 'limpieza') && (
              <div>
                <Label htmlFor="estimated-time">Tiempo Estimado (minutos)</Label>
                <Input
                  id="estimated-time"
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="120"
                  min="1"
                  max="480"
                />
              </div>
            )}

            {/* Notas */}
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre el estado de la mesa..."
                rows={3}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleStateChange}
              disabled={!selectedState}
              className="flex-1"
            >
              Actualizar Estado
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
