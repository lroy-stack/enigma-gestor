
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Clock, 
  Users, 
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface ReservationsSidebarProps {
  onClose: () => void;
  onAssignReservation: (reservationId: string, tableId: string) => void;
}

export function ReservationsSidebar({ onClose, onAssignReservation }: ReservationsSidebarProps) {
  // Mock data - replace with real data from hooks
  const pendingReservations = [
    {
      id: '1',
      customerName: 'Juan Pérez',
      time: '20:00',
      date: '2024-06-16',
      guests: 4,
      phone: '+34 600 123 456',
      email: 'juan@email.com',
      notes: 'Mesa cerca de la ventana si es posible'
    },
    {
      id: '2',
      customerName: 'María García',
      time: '19:30',
      date: '2024-06-16',
      guests: 2,
      phone: '+34 600 789 012',
      email: 'maria@email.com',
      notes: 'Aniversario de boda'
    },
    {
      id: '3',
      customerName: 'Carlos Rodríguez',
      time: '21:00',
      date: '2024-06-16',
      guests: 6,
      phone: '+34 600 345 678',
      email: 'carlos@email.com',
      notes: 'Cena de empresa'
    }
  ];

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reservas Pendientes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-blue-100 text-blue-800">
            {pendingReservations.length} reservas
          </Badge>
          <Button size="sm" variant="outline">
            Actualizar
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {pendingReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('reservation-id', reservation.id);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {reservation.customerName}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reservation.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {reservation.guests}p
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Pendiente
                  </Badge>
                </div>

                {/* Contact info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    {reservation.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    {reservation.email}
                  </div>
                </div>

                {/* Notes */}
                {reservation.notes && (
                  <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                    {reservation.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => console.log('View details:', reservation.id)}
                  >
                    Detalles
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => console.log('Auto assign:', reservation.id)}
                  >
                    Auto-asignar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Instructions */}
        <div className="mt-4 p-3 border-t bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">💡 Instrucciones:</p>
            <ul className="space-y-1">
              <li>• Arrastra reservas hacia las mesas</li>
              <li>• Las mesas deben tener capacidad suficiente</li>
              <li>• Solo mesas libres pueden recibir reservas</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
