import React, { useState } from 'react';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { Clock, Users, Crown, Plus } from 'lucide-react';
import { QuickReservationModal } from './QuickReservationModal';

interface Reservation {
  id: string;
  fecha_reserva: string;
  hora_reserva: string;
  numero_comensales: number;
  estado_reserva: string;
  clientes?: {
    nombre: string;
    apellido: string;
    vip_status?: boolean;
  };
}

interface WeekViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onDateClick: (date: Date) => void;
  onReservationClick: (reservation: Reservation) => void;
  onReservationCreate?: () => void;
}

export function WeekView({ currentDate, reservations, onDateClick, onReservationClick, onReservationCreate }: WeekViewProps) {
  const [showQuickReservation, setShowQuickReservation] = useState(false);
  const [selectedDateForReservation, setSelectedDateForReservation] = useState<Date | null>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Empezar en lunes
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(reservation => 
      reservation.fecha_reserva === dateStr
    ).sort((a, b) => a.hora_reserva.localeCompare(b.hora_reserva));
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

  const getTimeSlot = (hora: string) => {
    const hour = parseInt(hora.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const groupReservationsByTime = (reservations: Reservation[]) => {
    return reservations.reduce((groups, reservation) => {
      const slot = getTimeSlot(reservation.hora_reserva);
      if (!groups[slot]) groups[slot] = [];
      groups[slot].push(reservation);
      return groups;
    }, {} as Record<string, Reservation[]>);
  };

  const timeSlotLabels = {
    morning: 'Mañana (hasta 12:00)',
    afternoon: 'Tarde (12:00 - 17:00)',
    evening: 'Noche (17:00+)'
  };

  return (
    <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 shadow-ios">
      {/* Header con días de la semana */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {weekDays.map((day) => {
          const dayReservations = getReservationsForDate(day);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={`
                text-center p-4 rounded-ios border cursor-pointer transition-all duration-200 group
                ${isDayToday 
                  ? 'bg-enigma-primary/10 border-enigma-primary/30 ring-2 ring-enigma-primary/20' 
                  : 'bg-white border-enigma-neutral-200 hover:bg-enigma-neutral-50'
                }
                hover:shadow-ios-sm ios-touch-feedback
              `}
            >
              <div className="mb-2">
                <div className={`ios-text-caption1 font-semibold uppercase tracking-wide mb-1 ${
                  isDayToday ? 'text-enigma-primary' : 'text-enigma-neutral-500'
                }`}>
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={`ios-text-title2 font-bold ${
                  isDayToday ? 'text-enigma-primary' : 'text-enigma-neutral-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                {dayReservations.length > 0 ? (
                  <IOSBadge 
                    variant="custom" 
                    className="bg-enigma-primary/10 text-enigma-primary border-enigma-primary/20"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDateClick(day);
                    }}
                  >
                    {dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''}
                  </IOSBadge>
                ) : (
                  <span className="ios-text-caption1 text-enigma-neutral-400">Sin reservas</span>
                )}
                
                <IOSButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDateForReservation(day);
                    setShowQuickReservation(true);
                  }}
                  className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-enigma-primary/10"
                >
                  <Plus size={14} className="text-enigma-primary" />
                </IOSButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid detallado de reservas por día */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayReservations = getReservationsForDate(day);
          const groupedReservations = groupReservationsByTime(dayReservations);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={`
                min-h-[400px] p-4 rounded-ios border
                ${isDayToday 
                  ? 'bg-enigma-primary/5 border-enigma-primary/20' 
                  : 'bg-white border-enigma-neutral-200'
                }
              `}
            >
              {/* Cabecera del día */}
              <div className="text-center mb-4 pb-3 border-b border-enigma-neutral-200">
                <div className={`ios-text-callout font-semibold ${
                  isDayToday ? 'text-enigma-primary' : 'text-enigma-neutral-900'
                }`}>
                  {format(day, 'EEEE d', { locale: es })}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-500 mt-1">
                  {dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Reservas agrupadas por momento del día */}
              <div className="space-y-4">
                {Object.entries(timeSlotLabels).map(([slot, label]) => {
                  const slotReservations = groupedReservations[slot] || [];
                  
                  if (slotReservations.length === 0) return null;
                  
                  return (
                    <div key={slot} className="mb-4">
                      <h4 className="ios-text-caption1 font-semibold text-enigma-neutral-600 mb-2 uppercase tracking-wide">
                        {label}
                      </h4>
                      <div className="space-y-2">
                        {slotReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            onClick={() => onReservationClick(reservation)}
                            className="p-3 rounded-ios border cursor-pointer transition-all duration-200 hover:shadow-ios-sm ios-touch-feedback"
                            style={{ 
                              backgroundColor: `${getStatusColor(reservation.estado_reserva)}10`,
                              borderColor: `${getStatusColor(reservation.estado_reserva)}30`
                            }}
                          >
                            {/* Hora y comensales */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                <Clock size={12} style={{ color: getStatusColor(reservation.estado_reserva) }} />
                                <span 
                                  className="ios-text-footnote font-semibold"
                                  style={{ color: getStatusColor(reservation.estado_reserva) }}
                                >
                                  {reservation.hora_reserva}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users size={12} className="text-enigma-neutral-500" />
                                <span className="ios-text-footnote text-enigma-neutral-600">
                                  {reservation.numero_comensales}
                                </span>
                              </div>
                            </div>

                            {/* Nombre del cliente */}
                            <div className="flex items-center gap-1">
                              <span className="ios-text-footnote text-enigma-neutral-900 truncate">
                                {reservation.clientes?.nombre} {reservation.clientes?.apellido}
                              </span>
                              {reservation.clientes?.vip_status && (
                                <Crown size={10} className="text-enigma-accent flex-shrink-0" />
                              )}
                            </div>

                            {/* Estado */}
                            <div className="mt-1">
                              <IOSBadge 
                                variant="custom" 
                                size="sm"
                                style={{ 
                                  backgroundColor: getStatusColor(reservation.estado_reserva),
                                  color: 'white'
                                }}
                              >
                                {reservation.estado_reserva === 'confirmada' ? 'Confirmada' :
                                 reservation.estado_reserva === 'pendiente_confirmacion' ? 'Pendiente' :
                                 reservation.estado_reserva === 'completada' ? 'Completada' :
                                 reservation.estado_reserva === 'cancelada_usuario' ? 'Cancelada' :
                                 reservation.estado_reserva === 'no_show' ? 'No Show' : 
                                 reservation.estado_reserva}
                              </IOSBadge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Mensaje para días sin reservas */}
                {dayReservations.length === 0 && (
                  <div 
                    className="text-center py-8 cursor-pointer hover:bg-enigma-primary/5 transition-colors rounded-ios"
                    onClick={() => {
                      setSelectedDateForReservation(day);
                      setShowQuickReservation(true);
                    }}
                  >
                    <Clock size={24} className="text-enigma-neutral-300 mx-auto mb-2" />
                    <p className="ios-text-caption1 text-enigma-neutral-500 mb-1">Sin reservas</p>
                    <p className="ios-text-caption2 text-enigma-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Click para agregar
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Modal de creación rápida */}
      <QuickReservationModal
        isOpen={showQuickReservation}
        onClose={() => {
          setShowQuickReservation(false);
          setSelectedDateForReservation(null);
        }}
        selectedDate={selectedDateForReservation || new Date()}
        onSuccess={() => {
          onReservationCreate?.();
          setShowQuickReservation(false);
          setSelectedDateForReservation(null);
        }}
      />
    </div>
  );
}