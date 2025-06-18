
import React, { memo } from 'react';
import { 
  CheckCircle, AlertCircle, UserCheck, Coffee, Star, 
  Eye, Edit, Trash2, PhoneCall, MessageSquare,
  ChevronRight, Crown, AlertTriangle, CheckSquare, XCircle, User
} from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Reserva } from '@/types/database';

interface OptimizedReservationsListProps {
  reservations: Reserva[];
  isLoading: boolean;
  onReservationClick: (reserva: Reserva) => void;
  onCallClient: (reserva: Reserva) => void;
  onSendWhatsApp: (reserva: Reserva) => void;
}

const ReservationItem = memo(({ 
  reserva, 
  onReservationClick, 
  onCallClient, 
  onSendWhatsApp 
}: {
  reserva: Reserva;
  onReservationClick: (reserva: Reserva) => void;
  onCallClient: (reserva: Reserva) => void;
  onSendWhatsApp: (reserva: Reserva) => void;
}) => {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmada': return CheckCircle;
      case 'pendiente_confirmacion': return AlertCircle;
      case 'completada': return CheckSquare;
      case 'cancelada_usuario': return XCircle;
      case 'cancelada_restaurante': return XCircle;
      case 'no_show': return AlertTriangle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmada': return '#9FB289';
      case 'pendiente_confirmacion': return '#FF9500';
      case 'completada': return '#34C759';
      case 'cancelada_usuario': return '#6B7280';
      case 'cancelada_restaurante': return '#6B7280';
      case 'no_show': return '#FF3B30';
      default: return '#6B7280';
    }
  };

  const StatusIcon = getStatusIcon(reserva.estado_reserva);

  return (
    <div
      onClick={() => onReservationClick(reserva)}
      className="p-5 hover:bg-enigma-neutral-50 transition-all duration-200 cursor-pointer ios-touch-feedback border-b border-enigma-neutral-200/50 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-ios bg-enigma-primary/10 flex items-center justify-center shadow-ios-sm">
            <StatusIcon size={20} color={getStatusColor(reserva.estado_reserva)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
                {reserva.clientes?.nombre} {reserva.clientes?.apellido}
              </h3>
              {reserva.clientes?.vip_status && (
                <Crown size={14} className="text-enigma-accent" />
              )}
            </div>
            <div className="flex items-center space-x-4 ios-text-footnote text-enigma-neutral-600">
              <span className="font-medium">
                {format(parseISO(reserva.fecha_reserva), "d MMM", { locale: es })}
              </span>
              <span className="font-medium">{reserva.hora_reserva}</span>
              <span>{reserva.numero_comensales} personas</span>
              {reserva.mesas && (
                <span className="text-enigma-primary font-medium">
                  Mesa {reserva.mesas.numero_mesa}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={reserva.estado_reserva} />
          <ChevronRight size={16} className="text-enigma-neutral-400" />
        </div>
      </div>
    </div>
  );
});

ReservationItem.displayName = 'ReservationItem';

export const OptimizedReservationsList = memo(({ 
  reservations, 
  isLoading, 
  onReservationClick,
  onCallClient,
  onSendWhatsApp
}: OptimizedReservationsListProps) => {
  if (isLoading) {
    return (
      <IOSCard variant="elevated" className="shadow-ios-lg">
        <IOSCardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </IOSCardContent>
      </IOSCard>
    );
  }

  if (reservations.length === 0) {
    return (
      <IOSCard variant="elevated" className="shadow-ios-lg">
        <IOSCardContent className="text-center py-12">
          <User size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
          <p className="ios-text-callout text-enigma-neutral-500">No se encontraron reservas</p>
          <p className="ios-text-footnote text-enigma-neutral-400 mt-2">
            Ajusta los filtros para ver más resultados
          </p>
        </IOSCardContent>
      </IOSCard>
    );
  }

  return (
    <IOSCard variant="elevated" className="shadow-ios-lg">
      <IOSCardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {reservations.map((reserva) => (
            <ReservationItem
              key={reserva.id}
              reserva={reserva}
              onReservationClick={onReservationClick}
              onCallClient={onCallClient}
              onSendWhatsApp={onSendWhatsApp}
            />
          ))}
        </div>
      </IOSCardContent>
    </IOSCard>
  );
});

OptimizedReservationsList.displayName = 'OptimizedReservationsList';
