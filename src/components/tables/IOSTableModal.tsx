
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Utensils,
  Calendar,
  ArrowRight,
  X,
  Play,
  Square,
  UserCheck,
  UserX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableWithState } from '@/hooks/useTableStates';
import { useUnassignedReservations, useAssignTableToReservation } from '@/hooks/useUnassignedReservations';
import { ReservationSelector } from './ReservationSelector';
import { toast } from 'sonner';

interface IOSTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableWithState | null;
  onStateChange: (tableId: string, newState: string) => void;
  timer?: {
    isActive: boolean;
    timeLeft: number;
    status: 'verde' | 'amarillo' | 'rojo';
  };
  onStartTimer: (tableId: string, duration: number) => void;
  onStopTimer: (tableId: string) => void;
}

export function IOSTableModal({
  isOpen,
  onClose,
  table,
  onStateChange,
  timer,
  onStartTimer,
  onStopTimer
}: IOSTableModalProps) {
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [showReservations, setShowReservations] = useState(false);
  
  const { data: unassignedReservations = [], isLoading: loadingReservations, refetch } = useUnassignedReservations();
  const assignTableToReservation = useAssignTableToReservation();

  if (!table) return null;

  const currentState = table.estado?.estado || 'libre';

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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'cliente_sentado':
        onStateChange(table.id, 'ocupada');
        onStartTimer(table.id, 120);
        toast.success(`Mesa ${table.numero_mesa} - Cliente sentado`);
        break;
      case 'no_show':
        onStateChange(table.id, 'libre');
        toast.success(`Mesa ${table.numero_mesa} - Marcada como No Show`);
        break;
      case 'liberar':
        onStateChange(table.id, 'limpieza');
        onStopTimer(table.id);
        toast.success(`Mesa ${table.numero_mesa} liberada para limpieza`);
        break;
      case 'limpiar_completa':
        onStateChange(table.id, 'libre');
        toast.success(`Mesa ${table.numero_mesa} lista para nuevos clientes`);
        break;
    }
    onClose();
  };

  const getTimerDisplay = () => {
    if (!timer?.isActive) return null;
    
    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    
    return {
      time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      status: timer.status,
      color: timer.status === 'rojo' ? 'text-red-600 bg-red-50' : 
             timer.status === 'amarillo' ? 'text-yellow-600 bg-yellow-50' : 
             'text-green-600 bg-green-50'
    };
  };

  const timerDisplay = getTimerDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0 ios-card-glass">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div 
                className="w-20 h-20 rounded-ios-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ backgroundColor: zoneInfo.color }}
              >
                {table.numero_mesa}
              </div>
              <div>
                <h2 className="ios-text-title1 font-bold text-gray-900 mb-2">
                  Mesa {table.numero_mesa}
                </h2>
                <div className="flex items-center gap-4 ios-text-callout text-gray-600">
                  <span style={{ color: zoneInfo.color }}>{zoneInfo.icon}</span>
                  <span>{zoneInfo.name}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{table.capacidad} personas</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ios-button-ghost h-12 w-12"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Panel Izquierdo - Estado y Acciones */}
          <div className="flex-1 p-8 space-y-6">
            {/* Estado Actual */}
            <div className="ios-card p-6">
              <h3 className="ios-text-headline font-semibold mb-4 flex items-center gap-2">
                Estado Actual
              </h3>
              
              <div className={cn(
                "p-6 rounded-ios-lg border-2 mb-6",
                currentState === 'libre' && "bg-green-50 border-green-200",
                currentState === 'ocupada' && "bg-blue-50 border-blue-200",
                currentState === 'reservada' && "bg-purple-50 border-purple-200",
                currentState === 'limpieza' && "bg-yellow-50 border-yellow-200"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {currentState === 'libre' && <CheckCircle className="h-8 w-8 text-green-600" />}
                    {currentState === 'ocupada' && <Users className="h-8 w-8 text-blue-600" />}
                    {currentState === 'reservada' && <Clock className="h-8 w-8 text-purple-600" />}
                    {currentState === 'limpieza' && <Utensils className="h-8 w-8 text-yellow-600" />}
                    <span className="ios-text-title3 font-bold capitalize">
                      {currentState.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {timerDisplay && (
                    <div className={cn("px-4 py-2 rounded-ios font-mono font-bold", timerDisplay.color)}>
                      {timerDisplay.time}
                    </div>
                  )}
                </div>

                {table.estado?.notas_estado && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="ios-text-callout text-gray-700">
                      📝 {table.estado.notas_estado}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones Rápidas */}
              <div className="grid grid-cols-2 gap-4">
                {currentState === 'reservada' && (
                  <>
                    <Button
                      onClick={() => handleQuickAction('cliente_sentado')}
                      className="ios-button ios-button-primary h-16 text-ios-callout"
                    >
                      <UserCheck className="h-5 w-5 mr-2" />
                      Cliente Sentado
                    </Button>
                    <Button
                      onClick={() => handleQuickAction('no_show')}
                      className="ios-button ios-button-accent h-16 text-ios-callout"
                    >
                      <UserX className="h-5 w-5 mr-2" />
                      No Show
                    </Button>
                  </>
                )}
                
                {currentState === 'ocupada' && (
                  <Button
                    onClick={() => handleQuickAction('liberar')}
                    className="ios-button ios-button-secondary h-16 text-ios-callout col-span-2"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Liberar Mesa
                  </Button>
                )}
                
                {currentState === 'limpieza' && (
                  <Button
                    onClick={() => handleQuickAction('limpiar_completa')}
                    className="ios-button ios-button-primary h-16 text-ios-callout col-span-2"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Limpieza Completa
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Reservas */}
          <div className="w-96 border-l border-gray-200/50 p-8">
            <div className="ios-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="ios-text-headline font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-enigma-primary" />
                  Reservas Hoy
                </h3>
                <Badge variant="outline" className="ios-badge">
                  {unassignedReservations.length}
                </Badge>
              </div>

              {!showReservations ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="ios-text-body text-gray-600 mb-6">
                    Asigna una reserva sin mesa a esta mesa
                  </p>
                  <Button
                    onClick={() => setShowReservations(true)}
                    className="ios-button ios-button-primary"
                    disabled={currentState !== 'libre'}
                  >
                    Ver Reservas
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
                        className="flex-1 ios-button ios-button-primary h-12"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Asignar
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
      </DialogContent>
    </Dialog>
  );
}
