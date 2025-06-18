
import React from 'react';
import { Users, Clock, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reserva } from '@/types/database';

interface ReservationSelectorProps {
  reservations: Reserva[];
  selectedReservation: string | null;
  onSelectReservation: (reservationId: string) => void;
  isLoading?: boolean;
}

export function ReservationSelector({
  reservations,
  selectedReservation,
  onSelectReservation,
  isLoading
}: ReservationSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ios-card p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="ios-card p-6 text-center">
        <div className="text-gray-500 text-ios-body">
          No hay reservas sin mesa asignada para hoy
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {reservations.map((reservation) => {
        const cliente = reservation.clientes;
        const isSelected = selectedReservation === reservation.id;
        
        return (
          <div
            key={reservation.id}
            onClick={() => onSelectReservation(reservation.id)}
            className={cn(
              "ios-card p-4 cursor-pointer transition-all duration-200 ios-touch-feedback",
              "min-h-[80px] hover:shadow-md",
              isSelected && "ring-2 ring-enigma-primary bg-enigma-primary/5"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-ios-headline font-semibold text-gray-900">
                    {cliente?.nombre} {cliente?.apellido}
                  </h4>
                  <div className="flex items-center gap-1 text-enigma-primary">
                    <Users className="h-4 w-4" />
                    <span className="text-ios-callout font-medium">
                      {reservation.numero_comensales}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-ios-callout text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{reservation.hora_reserva}</span>
                  </div>
                  {cliente?.telefono && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span className="truncate max-w-[120px]">
                        {cliente.telefono}
                      </span>
                    </div>
                  )}
                  {cliente?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="truncate max-w-[140px]">
                        {cliente.email}
                      </span>
                    </div>
                  )}
                </div>

                {reservation.notas_cliente && (
                  <div className="mt-2 text-ios-footnote text-gray-500 italic">
                    "{reservation.notas_cliente}"
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-ios-caption1 font-medium",
                  reservation.estado_reserva === 'confirmada' 
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}>
                  {reservation.estado_reserva === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                </div>

                {reservation.origen_reserva && (
                  <div className="text-ios-caption2 text-gray-400 uppercase">
                    {reservation.origen_reserva.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>

            {isSelected && (
              <div className="mt-3 pt-3 border-t border-enigma-primary/20">
                <div className="text-ios-caption1 text-enigma-primary font-medium text-center">
                  ✓ Seleccionada para asignar
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
