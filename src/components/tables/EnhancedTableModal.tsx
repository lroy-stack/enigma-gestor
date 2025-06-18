
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Utensils,
  Settings,
  Calendar,
  ArrowRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableWithState } from '@/hooks/useTableStates';
import { useUnassignedReservations, useAssignTableToReservation } from '@/hooks/useUnassignedReservations';
import { ReservationSelector } from './ReservationSelector';
import { toast } from 'sonner';

interface EnhancedTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableWithState | null;
  onStateChange: (tableId: string, newState: string) => void;
  timer?: any;
}

export function EnhancedTableModal({
  isOpen,
  onClose,
  table,
  onStateChange,
  timer
}: EnhancedTableModalProps) {
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [showReservations, setShowReservations] = useState(false);
  
  const { data: unassignedReservations = [], isLoading: loadingReservations, refetch } = useUnassignedReservations();
  const assignTableToReservation = useAssignTableToReservation();

  if (!table) return null;

  const currentState = table.estado?.estado || 'libre';

  const stateOptions = [
    { value: 'libre', label: 'Libre', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'ocupada', label: 'Ocupada', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'reservada', label: 'Reservada', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { value: 'limpieza', label: 'Limpieza', icon: Utensils, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' }
  ];

  const getCurrentStateConfig = () => {
    return stateOptions.find(opt => opt.value === currentState) || stateOptions[0];
  };

  const handleAssignReservation = async () => {
    if (!selectedReservation || !table) return;

    try {
      await assignTableToReservation(selectedReservation, table.id);
      onStateChange(table.id, 'reservada');
      await refetch();
      toast.success('Reserva asignada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al asignar la reserva');
      console.error('Error:', error);
    }
  };

  const handleStateChange = (newState: string) => {
    onStateChange(table.id, newState);
    onClose();
    toast.success(`Mesa ${table.numero_mesa} actualizada`);
  };

  const getZoneInfo = (tipoMesa: string) => {
    switch (tipoMesa) {
      case 'terraza_superior':
        return { name: 'Terraza Campanar', icon: '🌿', color: '#9FB289' };
      case 'terraza_inferior':
        return { name: 'Terraza Justicia', icon: '⚖️', color: '#CB5910' };
      default:
        return { name: 'Sala Interior', icon: '🏛️', color: '#237584' };
    }
  };

  const zoneInfo = getZoneInfo(table.tipo_mesa);
  const currentStateConfig = getCurrentStateConfig();
  const StateIcon = currentStateConfig.icon;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-ios flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: zoneInfo.color }}
              >
                {table.numero_mesa}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                  Mesa {table.numero_mesa}
                </DialogTitle>
                <p className="text-ios-callout text-gray-600 flex items-center gap-2">
                  <span style={{ color: zoneInfo.color }}>{zoneInfo.icon}</span>
                  {zoneInfo.name} • {table.capacidad} personas
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado Actual */}
          <div className="space-y-6">
            <div className="ios-card p-6">
              <h3 className="text-ios-headline font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-enigma-primary" />
                Estado Actual
              </h3>
              
              <div className={cn("p-4 rounded-ios border-2 mb-4", currentStateConfig.bg)}>
                <div className="flex items-center gap-3 mb-2">
                  <StateIcon className={cn("h-8 w-8", currentStateConfig.color)} />
                  <span className={cn("text-ios-title3 font-bold", currentStateConfig.color)}>
                    {currentStateConfig.label}
                  </span>
                </div>

                {timerInfo && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-ios-callout text-gray-600">Tiempo:</span>
                    <span className={cn("font-mono font-bold", timerInfo.statusColor)}>
                      {timerInfo.timeLeft}
                    </span>
                  </div>
                )}

                {table.estado?.notas_estado && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-ios-callout text-gray-700">
                      📝 {table.estado.notas_estado}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones Rápidas */}
              <div>
                <h4 className="text-ios-callout font-semibold text-gray-700 mb-3">
                  Cambiar Estado
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {stateOptions.filter(opt => opt.value !== currentState).map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      onClick={() => handleStateChange(option.value)}
                      className={cn(
                        "h-12 justify-start gap-3 ios-touch-feedback",
                        "hover:border-enigma-primary hover:bg-enigma-primary/5"
                      )}
                    >
                      <option.icon className={cn("h-4 w-4", option.color)} />
                      <span className="text-ios-callout">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Asignación de Reservas */}
          <div className="space-y-6">
            <div className="ios-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-ios-headline font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-enigma-primary" />
                  Reservas Disponibles
                </h3>
                <Badge variant="outline" className="text-ios-caption1">
                  {unassignedReservations.length} disponibles
                </Badge>
              </div>

              {!showReservations ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-ios-body text-gray-600 mb-4">
                    Asigna una reserva de hoy a esta mesa
                  </p>
                  <Button
                    onClick={() => setShowReservations(true)}
                    className="bg-enigma-primary hover:bg-enigma-primary/90 text-white"
                  >
                    Ver Reservas Disponibles
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ReservationSelector
                    reservations={unassignedReservations}
                    selectedReservation={selectedReservation}
                    onSelectReservation={setSelectedReservation}
                    isLoading={loadingReservations}
                  />

                  {selectedReservation && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleAssignReservation}
                        className="flex-1 bg-enigma-primary hover:bg-enigma-primary/90 text-white h-12"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Asignar a Mesa {table.numero_mesa}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedReservation(null);
                          setShowReservations(false);
                        }}
                        className="h-12"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-8 h-12"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
