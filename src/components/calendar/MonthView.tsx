import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
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

interface MonthViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onDateClick: (date: Date) => void;
  onReservationClick: (reservation: Reservation) => void;
  onReservationCreate?: () => void;
}

export function MonthView({ currentDate, reservations, onDateClick, onReservationClick, onReservationCreate }: MonthViewProps) {
  const [showQuickReservation, setShowQuickReservation] = useState(false);
  const [selectedDateForReservation, setSelectedDateForReservation] = useState<Date | null>(null);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Empezar en lunes
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(reservation => 
      reservation.fecha_reserva === dateStr
    );
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

  return (
    <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 shadow-ios">
      {/* Header con días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center py-3">
            <span className="ios-text-caption1 font-semibold text-enigma-neutral-500 uppercase tracking-wide">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayReservations = getReservationsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={`
                min-h-[100px] p-2 rounded-ios border transition-all duration-200 cursor-pointer group
                ${isCurrentMonth 
                  ? 'bg-white hover:bg-enigma-neutral-50 border-enigma-neutral-200' 
                  : 'bg-enigma-neutral-50 border-enigma-neutral-100 text-enigma-neutral-400'
                }
                ${isDayToday ? 'ring-2 ring-enigma-primary/30 bg-enigma-primary/5' : ''}
                hover:shadow-ios-sm ios-touch-feedback
              `}
            >
              {/* Número del día */}
              <div className="flex items-center justify-between mb-2">
                <span 
                  className={`
                    ios-text-footnote font-semibold cursor-pointer
                    ${isDayToday 
                      ? 'text-enigma-primary' 
                      : isCurrentMonth 
                        ? 'text-enigma-neutral-900' 
                        : 'text-enigma-neutral-400'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick(day);
                  }}
                >
                  {format(day, 'd')}
                </span>
                
                <div className="flex items-center gap-1">
                  {dayReservations.length > 0 && (
                    <IOSBadge 
                      variant="custom" 
                      size="sm"
                      className="bg-enigma-primary/10 text-enigma-primary border-enigma-primary/20"
                    >
                      {dayReservations.length}
                    </IOSBadge>
                  )}
                  
                  {isCurrentMonth && (
                    <IOSButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateForReservation(day);
                        setShowQuickReservation(true);
                      }}
                      className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-enigma-primary/10"
                    >
                      <Plus size={12} className="text-enigma-primary" />
                    </IOSButton>
                  )}
                </div>
              </div>

              {/* Reservas del día */}
              <div className="space-y-1">
                {dayReservations.slice(0, 3).map((reservation, index) => (
                  <div
                    key={reservation.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReservationClick(reservation);
                    }}
                    className="p-1.5 rounded-ios text-xs transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{ 
                      backgroundColor: `${getStatusColor(reservation.estado_reserva)}20`,
                      borderLeft: `3px solid ${getStatusColor(reservation.estado_reserva)}`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <Clock size={10} style={{ color: getStatusColor(reservation.estado_reserva) }} />
                        <span 
                          className="font-medium truncate"
                          style={{ color: getStatusColor(reservation.estado_reserva) }}
                        >
                          {reservation.hora_reserva}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={10} className="text-enigma-neutral-500" />
                        <span className="text-enigma-neutral-600">{reservation.numero_comensales}</span>
                      </div>
                    </div>
                    <div className="truncate text-enigma-neutral-700 mt-0.5">
                      {reservation.clientes?.nombre} {reservation.clientes?.apellido}
                      {reservation.clientes?.vip_status && (
                        <span className="text-enigma-accent ml-1">★</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {dayReservations.length > 3 && (
                  <div className="text-center">
                    <span className="ios-text-caption2 text-enigma-neutral-500">
                      +{dayReservations.length - 3} más
                    </span>
                  </div>
                )}
              </div>

              {/* Placeholder para días sin reservas */}
              {dayReservations.length === 0 && isCurrentMonth && (
                <div 
                  className="flex items-center justify-center h-12 text-enigma-neutral-300 hover:text-enigma-primary transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDateForReservation(day);
                    setShowQuickReservation(true);
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Calendar size={16} />
                    <span className="ios-text-caption2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Agregar
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda de estados */}
      <div className="mt-6 pt-4 border-t border-enigma-neutral-200">
        <h4 className="ios-text-footnote font-semibold text-enigma-neutral-600 mb-3 uppercase tracking-wide">
          Estados de Reserva
        </h4>
        <div className="flex flex-wrap gap-3">
          {[
            { status: 'confirmada', label: 'Confirmada' },
            { status: 'pendiente_confirmacion', label: 'Pendiente' },
            { status: 'completada', label: 'Completada' },
            { status: 'cancelada_usuario', label: 'Cancelada' },
            { status: 'no_show', label: 'No Show' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-ios"
                style={{ backgroundColor: getStatusColor(status) }}
              />
              <span className="ios-text-caption1 text-enigma-neutral-600">{label}</span>
            </div>
          ))}
        </div>
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