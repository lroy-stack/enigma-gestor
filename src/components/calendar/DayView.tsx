import React from 'react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Clock, Users, Crown, Phone, Mail, MapPin } from 'lucide-react';

interface Reservation {
  id: string;
  fecha_reserva: string;
  hora_reserva: string;
  numero_comensales: number;
  estado_reserva: string;
  notas_cliente?: string;
  clientes?: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    vip_status?: boolean;
  };
  mesas?: {
    numero_mesa: number;
  };
}

interface DayViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onReservationClick: (reservation: Reservation) => void;
}

export function DayView({ currentDate, reservations, onReservationClick }: DayViewProps) {
  const isDayToday = isToday(currentDate);
  
  // Filtrar y ordenar reservas del día
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayReservations = reservations
    .filter(reservation => reservation.fecha_reserva === dateStr)
    .sort((a, b) => a.hora_reserva.localeCompare(b.hora_reserva));

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

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente_confirmacion': return 'Pendiente';
      case 'completada': return 'Completada';
      case 'cancelada_usuario': return 'Cancelada';
      case 'cancelada_restaurante': return 'Cancelada';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  // Generar timeline de horas (de 12:00 a 23:00)
  const timeSlots = Array.from({ length: 12 }, (_, index) => {
    const hour = index + 12;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getReservationsForTimeSlot = (timeSlot: string) => {
    const hour = timeSlot.split(':')[0];
    return dayReservations.filter(reservation => {
      const resHour = reservation.hora_reserva.split(':')[0];
      return resHour === hour;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header del día */}
      <div className={`
        bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 shadow-ios
        ${isDayToday ? 'ring-2 ring-enigma-primary/20' : ''}
      `}>
        <div className="text-center">
          <h2 className={`ios-text-title1 font-bold mb-2 ${
            isDayToday ? 'text-enigma-primary' : 'text-enigma-neutral-900'
          }`}>
            {format(currentDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </h2>
          {isDayToday && (
            <IOSBadge variant="custom" className="bg-enigma-primary/10 text-enigma-primary border-enigma-primary/20">
              Hoy
            </IOSBadge>
          )}
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="ios-text-title2 font-bold text-enigma-primary">
                {dayReservations.length}
              </div>
              <div className="ios-text-caption1 text-enigma-neutral-600">
                Reservas
              </div>
            </div>
            <div className="text-center">
              <div className="ios-text-title2 font-bold text-enigma-secondary">
                {dayReservations.reduce((sum, r) => sum + r.numero_comensales, 0)}
              </div>
              <div className="ios-text-caption1 text-enigma-neutral-600">
                Comensales
              </div>
            </div>
            <div className="text-center">
              <div className="ios-text-title2 font-bold text-enigma-accent">
                {dayReservations.filter(r => r.clientes?.vip_status).length}
              </div>
              <div className="ios-text-caption1 text-enigma-neutral-600">
                VIPs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de reservas */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 shadow-ios">
        <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-6">
          Timeline del Día
        </h3>

        {dayReservations.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
            <p className="ios-text-callout text-enigma-neutral-500 mb-2">
              No hay reservas para este día
            </p>
            <p className="ios-text-footnote text-enigma-neutral-400">
              Las reservas aparecerán aquí cuando se programen
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeSlots.map((timeSlot) => {
              const slotReservations = getReservationsForTimeSlot(timeSlot);
              
              return (
                <div key={timeSlot} className="flex items-start gap-4">
                  {/* Hora */}
                  <div className="w-16 flex-shrink-0 text-right pt-2">
                    <span className="ios-text-footnote font-semibold text-enigma-neutral-600">
                      {timeSlot}
                    </span>
                  </div>

                  {/* Línea de tiempo */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-2">
                    <div className={`
                      w-3 h-3 rounded-full border-2 
                      ${slotReservations.length > 0 
                        ? 'bg-enigma-primary border-enigma-primary' 
                        : 'bg-white border-enigma-neutral-300'
                      }
                    `} />
                    <div className="w-px h-12 bg-enigma-neutral-200 mt-1" />
                  </div>

                  {/* Reservas */}
                  <div className="flex-1 space-y-3">
                    {slotReservations.length > 0 ? (
                      slotReservations.map((reservation) => (
                        <IOSCard
                          key={reservation.id}
                          variant="default"
                          className="cursor-pointer transition-all duration-200 hover:shadow-ios-lg ios-touch-feedback"
                          onClick={() => onReservationClick(reservation)}
                        >
                          <IOSCardContent className="p-4">
                            {/* Header de la reserva */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-ios flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: `${getStatusColor(reservation.estado_reserva)}20`,
                                    color: getStatusColor(reservation.estado_reserva)
                                  }}
                                >
                                  <Clock size={18} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="ios-text-callout font-semibold text-enigma-neutral-900">
                                      {reservation.clientes?.nombre} {reservation.clientes?.apellido}
                                    </h4>
                                    {reservation.clientes?.vip_status && (
                                      <Crown size={14} className="text-enigma-accent" />
                                    )}
                                  </div>
                                  <p className="ios-text-footnote text-enigma-neutral-600">
                                    {reservation.hora_reserva} • {reservation.numero_comensales} personas
                                  </p>
                                </div>
                              </div>
                              
                              <IOSBadge 
                                variant="custom" 
                                style={{ 
                                  backgroundColor: getStatusColor(reservation.estado_reserva),
                                  color: 'white'
                                }}
                              >
                                {getStatusLabel(reservation.estado_reserva)}
                              </IOSBadge>
                            </div>

                            {/* Detalles de la reserva */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-enigma-neutral-600">
                              <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span className="ios-text-footnote truncate">
                                  {reservation.clientes?.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span className="ios-text-footnote">
                                  {reservation.clientes?.telefono}
                                </span>
                              </div>
                              {reservation.mesas && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  <span className="ios-text-footnote">
                                    Mesa {reservation.mesas.numero_mesa}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Notas del cliente */}
                            {reservation.notas_cliente && (
                              <div className="mt-3 p-3 bg-enigma-neutral-50 rounded-ios">
                                <p className="ios-text-footnote text-enigma-neutral-700">
                                  <strong>Notas:</strong> {reservation.notas_cliente}
                                </p>
                              </div>
                            )}
                          </IOSCardContent>
                        </IOSCard>
                      ))
                    ) : (
                      <div className="h-12 flex items-center">
                        <span className="ios-text-footnote text-enigma-neutral-400">
                          Sin reservas
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen de estadísticas */}
      {dayReservations.length > 0 && (
        <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 shadow-ios">
          <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
            Resumen del Día
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'Confirmadas', 
                value: dayReservations.filter(r => r.estado_reserva === 'confirmada').length,
                color: '#9FB289'
              },
              { 
                label: 'Pendientes', 
                value: dayReservations.filter(r => r.estado_reserva === 'pendiente_confirmacion').length,
                color: '#FF9500'
              },
              { 
                label: 'Completadas', 
                value: dayReservations.filter(r => r.estado_reserva === 'completada').length,
                color: '#34C759'
              },
              { 
                label: 'Canceladas', 
                value: dayReservations.filter(r => ['cancelada_usuario', 'cancelada_restaurante', 'no_show'].includes(r.estado_reserva)).length,
                color: '#FF3B30'
              }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div 
                  className="ios-text-title2 font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}