import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { Clock, Users, Crown, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { TimeSlotGrid } from './TimeSlotGrid';
import { QuickReservationModal } from './QuickReservationModal';

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

interface EnhancedDayViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onReservationClick: (reservation: Reservation) => void;
  onReservationCreate?: () => void;
}

export function EnhancedDayView({ 
  currentDate, 
  reservations, 
  onReservationClick, 
  onReservationCreate 
}: EnhancedDayViewProps) {
  const [showQuickReservation, setShowQuickReservation] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  
  const isDayToday = isToday(currentDate);
  
  // Filtrar y ordenar reservas del día
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayReservations = reservations
    .filter(reservation => reservation.fecha_reserva === dateStr)
    .sort((a, b) => a.hora_reserva.localeCompare(b.hora_reserva));

  // Generar slots de tiempo con reservas
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotReservations = dayReservations.filter(res => {
          const resTime = res.hora_reserva;
          const resHour = parseInt(resTime.split(':')[0]);
          const resMinute = parseInt(resTime.split(':')[1]);
          const slotHour = parseInt(timeStr.split(':')[0]);
          const slotMinute = parseInt(timeStr.split(':')[1]);
          
          // Verificar si la reserva coincide con este slot de tiempo
          return resHour === slotHour && Math.abs(resMinute - slotMinute) < 30;
        });
        
        slots.push({
          time: timeStr,
          available: true, // Siempre disponible para nuevas reservas
          reservations: slotReservations.map(res => ({
            id: res.id,
            clientName: `${res.clientes?.nombre} ${res.clientes?.apellido}`,
            guests: res.numero_comensales,
            duration: 120, // Por defecto 2 horas
            status: res.estado_reserva
          }))
        });
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();

  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
    setShowQuickReservation(true);
  };
  
  const handleReservationCreated = () => {
    onReservationCreate?.();
    setShowQuickReservation(false);
    setSelectedTimeSlot(undefined);
  };
  
  const handleQuickReservationClose = () => {
    setShowQuickReservation(false);
    setSelectedTimeSlot(undefined);
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

      {/* Timeline de reservas interactivo */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 shadow-ios">
        <div className="flex items-center justify-between mb-6">
          <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
            Timeline del Día
          </h3>
          <IOSButton
            variant="primary"
            size="sm"
            onClick={() => setShowQuickReservation(true)}
            className="bg-enigma-primary hover:bg-enigma-primary/90"
          >
            <Plus size={16} className="mr-2" />
            Nueva Reserva
          </IOSButton>
        </div>

        <TimeSlotGrid
          date={currentDate}
          timeSlots={timeSlots}
          onSlotClick={handleTimeSlotClick}
          onReservationClick={(reservationId) => {
            const reservation = dayReservations.find(r => r.id === reservationId);
            if (reservation) onReservationClick(reservation);
          }}
        />
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
      
      {/* Modal de creación rápida */}
      <QuickReservationModal
        isOpen={showQuickReservation}
        onClose={handleQuickReservationClose}
        selectedDate={currentDate}
        selectedTime={selectedTimeSlot}
        onSuccess={handleReservationCreated}
      />
    </div>
  );
}