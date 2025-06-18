
import React from 'react';
import { Clock, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useReservations } from '@/hooks/useReservations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface UpcomingReservationsWidgetProps {
  onConfirm?: (id: string) => void;
  onModify?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function UpcomingReservationsWidget({ 
  onConfirm, 
  onModify, 
  onCancel 
}: UpcomingReservationsWidgetProps) {
  const { 
    data: reservationsData, 
    isLoading, 
    error 
  } = useReservations({
    filters: {
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      fecha_fin: format(new Date(), 'yyyy-MM-dd'),
      estado: 'pendiente_confirmacion'
    }
  });

  const reservations = reservationsData?.data || [];

  const getStateColor = (estado: string) => {
    const colors = {
      'pendiente_confirmacion': 'bg-ios-orange text-white',
      'confirmada': 'bg-ios-green text-white',
      'completada': 'bg-ios-blue text-white',
      'cancelada_usuario': 'bg-ios-red text-white',
      'cancelada_restaurante': 'bg-ios-red text-white',
      'no_show': 'bg-ios-gray text-white'
    };
    return colors[estado as keyof typeof colors] || 'bg-ios-gray text-white';
  };

  const getStateIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente_confirmacion':
        return Clock;
      case 'confirmada':
        return CheckCircle;
      case 'completada':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  if (isLoading) {
    return (
      <IOSCard variant="elevated" className="shadow-ios">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Reservas
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </IOSCardContent>
      </IOSCard>
    );
  }

  if (error) {
    return (
      <IOSCard variant="elevated" className="shadow-ios">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Reservas
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-ios-red mx-auto mb-4" />
            <p className="text-enigma-neutral-600">Error al cargar las reservas</p>
          </div>
        </IOSCardContent>
      </IOSCard>
    );
  }

  return (
    <IOSCard variant="elevated" className="shadow-ios">
      <IOSCardHeader>
        <IOSCardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Reservas
          <IOSBadge variant="default" className="ml-auto">
            {reservations.length}
          </IOSBadge>
        </IOSCardTitle>
      </IOSCardHeader>
      <IOSCardContent>
        {reservations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-ios-green mx-auto mb-4" />
            <p className="text-enigma-neutral-600 mb-2">
              No hay reservas pendientes
            </p>
            <p className="ios-text-caption1 text-enigma-neutral-500">
              Todas las reservas están confirmadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.slice(0, 5).map((reserva) => {
              const StateIcon = getStateIcon(reserva.estado_reserva);
              
              return (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-3 rounded-ios border border-enigma-neutral-200 hover:bg-enigma-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-enigma-primary/10">
                      <StateIcon className="h-5 w-5 text-enigma-primary" />
                    </div>
                    <div>
                      <p className="ios-text-callout font-semibold text-enigma-neutral-900">
                        {reserva.clientes?.nombre} {reserva.clientes?.apellido}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="ios-text-caption1 text-enigma-neutral-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reserva.hora_reserva}
                        </span>
                        <span className="ios-text-caption1 text-enigma-neutral-600 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {reserva.numero_comensales}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <IOSBadge 
                      variant="secondary" 
                      className={getStateColor(reserva.estado_reserva)}
                    >
                      {reserva.estado_reserva.replace('_', ' ')}
                    </IOSBadge>
                    
                    {reserva.estado_reserva === 'pendiente_confirmacion' && onConfirm && (
                      <IOSButton
                        size="small"
                        variant="primary"
                        onClick={() => onConfirm(reserva.id)}
                      >
                        Confirmar
                      </IOSButton>
                    )}
                  </div>
                </div>
              );
            })}
            
            {reservations.length > 5 && (
              <div className="text-center pt-3 border-t border-enigma-neutral-200">
                <p className="ios-text-caption1 text-enigma-neutral-500">
                  Y {reservations.length - 5} reservas más...
                </p>
              </div>
            )}
          </div>
        )}
      </IOSCardContent>
    </IOSCard>
  );
}
