
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTablesWithStates, useUpdateTableState } from '@/hooks/useTableStates';

interface TableStatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTableId?: string;
}

export function TableStatePanel({ isOpen, onClose, selectedTableId }: TableStatePanelProps) {
  const { data: tables } = useTablesWithStates();
  const updateTableState = useUpdateTableState();
  
  const [estado, setEstado] = useState<string>('');
  const [tiempoEstimado, setTiempoEstimado] = useState<Date>();
  const [notas, setNotas] = useState('');

  const selectedTable = tables?.find(t => t.id === selectedTableId);

  React.useEffect(() => {
    if (selectedTable?.estado) {
      setEstado(selectedTable.estado.estado);
      setNotas(selectedTable.estado.notas_estado || '');
      if (selectedTable.estado.tiempo_estimado_liberacion) {
        setTiempoEstimado(new Date(selectedTable.estado.tiempo_estimado_liberacion));
      }
    }
  }, [selectedTable]);

  const handleSave = async () => {
    if (!selectedTable) return;

    try {
      const validatedState = validateMesaEstado(estado);
      await updateTableState.mutateAsync({
        mesaId: selectedTable.id,
        estado: validatedState,
        tiempoEstimado: tiempoEstimado?.toISOString(),
        notas,
      });
      onClose();
    } catch (error) {
      console.error('Error updating table state:', error);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'libre': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-red-100 text-red-800';
      case 'reservada': return 'bg-blue-100 text-blue-800';
      case 'limpieza': return 'bg-yellow-100 text-yellow-800';
      case 'fuera_servicio': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'libre': return 'Libre';
      case 'ocupada': return 'Ocupada';
      case 'reservada': return 'Reservada';
      case 'limpieza': return 'En Limpieza';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  if (!selectedTable) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mesa {selectedTable.numero_mesa}
          </SheetTitle>
          <SheetDescription>
            Gestiona el estado y configuración de la mesa
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Información de la mesa */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacidad</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{selectedTable.capacidad} personas</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ubicación</Label>
                <div className="text-sm text-gray-600">
                  {selectedTable.ubicacion_descripcion}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado Actual</Label>
              <Badge className={getEstadoColor(selectedTable.estado?.estado || 'libre')}>
                {getEstadoLabel(selectedTable.estado?.estado || 'libre')}
              </Badge>
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Nuevo Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="libre">🟢 Libre</SelectItem>
                  <SelectItem value="ocupada">🔴 Ocupada</SelectItem>
                  <SelectItem value="reservada">🔵 Reservada</SelectItem>
                  <SelectItem value="limpieza">🟡 En Limpieza</SelectItem>
                  <SelectItem value="fuera_servicio">⚫ Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(estado === 'ocupada' || estado === 'limpieza') && (
              <div className="space-y-2">
                <Label>Tiempo Estimado de Liberación</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !tiempoEstimado && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tiempoEstimado ? (
                        <div className="flex items-center gap-2">
                          <span>{format(tiempoEstimado, 'PPP', { locale: es })}</span>
                          <Clock className="h-3 w-3" />
                          <span>{format(tiempoEstimado, 'HH:mm')}</span>
                        </div>
                      ) : (
                        <span>Seleccionar fecha y hora</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tiempoEstimado}
                      onSelect={setTiempoEstimado}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                placeholder="Notas adicionales sobre el estado de la mesa..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateTableState.isPending}
            >
              {updateTableState.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
