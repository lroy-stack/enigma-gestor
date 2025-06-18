
import React, { useState } from 'react';
import { X, Users, Calendar, Clock, Phone, Mail, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableWithState } from '@/hooks/useTableStates';
import { useCreateReservation } from '@/hooks/useReservations';
import { toast } from 'sonner';

interface TableTimer {
  id: string;
  startTime: Date;
  duration: number;
  isActive: boolean;
  elapsedMinutes: number;
  status: 'verde' | 'amarillo' | 'rojo';
}

interface TableManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableWithState | null;
  onStateChange: (tableId: string, newState: string) => void;
  timer?: TableTimer;
}

export function TableManagementModal({ 
  isOpen, 
  onClose, 
  table, 
  onStateChange,
  timer 
}: TableManagementModalProps) {
  const [tableAction, setTableAction] = useState<'occupy' | 'clean' | 'maintenance' | 'reserve' | 'free' | ''>('');
  const [reservationForm, setReservationForm] = useState({
    customerName: '',
    customerLastName: '',
    phone: '',
    email: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    guests: table?.capacidad || 2,
    notes: '',
    duration: '120'
  });

  const createReservation = useCreateReservation();

  if (!isOpen || !table) return null;

  const currentState = table.estado?.estado || 'libre';
  const isAvailable = currentState === 'libre';

  const handleAction = async () => {
    if (!tableAction) return;

    try {
      if (tableAction === 'reserve' && isAvailable) {
        // Crear nueva reserva
        if (!reservationForm.customerName || !reservationForm.date || !reservationForm.time) {
          toast.error('Por favor completa todos los campos obligatorios');
          return;
        }

        await createReservation.mutateAsync({
          cliente_nombre: reservationForm.customerName,
          cliente_apellido: reservationForm.customerLastName,
          cliente_email: reservationForm.email,
          cliente_telefono: reservationForm.phone,
          fecha_reserva: reservationForm.date,
          hora_reserva: reservationForm.time,
          numero_comensales: reservationForm.guests,
          origen_reserva: 'en_persona',
          notas_cliente: reservationForm.notes
        });

        onStateChange(table.id, 'reservada');
        toast.success('Reserva creada exitosamente');
      } else {
        // Cambiar estado de mesa
        const stateMap = {
          occupy: 'ocupada',
          clean: 'limpieza',
          maintenance: 'fuera_servicio',
          free: 'libre'
        };
        
        onStateChange(table.id, stateMap[tableAction]);
        toast.success(`Mesa ${table.numero_mesa} actualizada`);
      }

      onClose();
      setTableAction('');
      setReservationForm({
        customerName: '',
        customerLastName: '',
        phone: '',
        email: '',
        time: '',
        date: new Date().toISOString().split('T')[0],
        guests: table?.capacidad || 2,
        notes: '',
        duration: '120'
      });
    } catch (error) {
      toast.error('Error al procesar la acción');
      console.error('Error:', error);
    }
  };

  const getZoneInfo = (tipoMesa: string) => {
    switch (tipoMesa) {
      case 'terraza_superior':
        return { name: 'Terraza Campanar', icon: '🏪', color: '#9FB289' };
      case 'terraza_inferior':
        return { name: 'Terraza Justicia', icon: '⚖️', color: '#CB5910' };
      case 'interior':
        return { name: 'Sala Interior', icon: '🏠', color: '#237584' };
      default:
        return { name: 'Zona General', icon: '📍', color: '#237584' };
    }
  };

  const zoneInfo = getZoneInfo(table.tipo_mesa);

  const getStateInfo = (estado: string) => {
    switch (estado) {
      case 'libre':
        return { label: 'Disponible', color: '#9FB289', icon: CheckCircle, bg: '#9FB289' };
      case 'ocupada':
        return { label: 'Ocupada', color: '#237584', icon: Users, bg: '#237584' };
      case 'reservada':
        return { label: 'Reservada', icon: Calendar, color: '#CB5910', bg: '#CB5910' };
      case 'limpieza':
        return { label: 'En Limpieza', color: '#FF9500', icon: AlertCircle, bg: '#FF9500' };
      case 'fuera_servicio':
        return { label: 'Fuera de Servicio', color: '#6B7280', icon: AlertCircle, bg: '#6B7280' };
      default:
        return { label: 'Disponible', color: '#9FB289', icon: CheckCircle, bg: '#9FB289' };
    }
  };

  const stateInfo = getStateInfo(currentState);
  const StateIcon = stateInfo.icon;

  // Optimización para tablets - Modal ocupa más espacio en pantallas grandes
  const isTabletOrDesktop = window.innerWidth >= 768;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className={`bg-white rounded-2xl w-full max-h-[95vh] overflow-auto shadow-2xl ${
        isTabletOrDesktop ? 'max-w-2xl' : 'max-w-md'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: zoneInfo.color }}
            >
              {table.numero_mesa}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Mesa {table.numero_mesa}</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <span style={{ color: zoneInfo.color }}>{zoneInfo.icon}</span>
                {zoneInfo.name}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Estado actual */}
        <div className="p-4 md:p-6 space-y-4">
          <div 
            className="p-4 rounded-lg border-2"
            style={{ 
              backgroundColor: `${stateInfo.bg}15`, 
              borderColor: stateInfo.bg 
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StateIcon className="h-6 w-6" style={{ color: stateInfo.bg }} />
                <span className="font-semibold text-lg" style={{ color: stateInfo.bg }}>
                  {stateInfo.label}
                </span>
              </div>
              <Badge variant="outline" className="text-base px-3 py-1">
                <Users className="h-4 w-4 mr-1" />
                {table.capacidad}p
              </Badge>
            </div>
            {table.estado?.notas_estado && (
              <p className="text-sm text-gray-600 mt-2">
                📝 {table.estado.notas_estado}
              </p>
            )}
            
            {/* Información del temporizador si está activo */}
            {timer?.isActive && (
              <div className="mt-2 flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: stateInfo.bg }} />
                <span className="text-sm font-medium">
                  Tiempo transcurrido: {timer.elapsedMinutes} min
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  timer.status === 'verde' ? 'bg-green-500' :
                  timer.status === 'amarillo' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              </div>
            )}
          </div>

          {/* Acciones rápidas - Optimizadas para táctil */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Acciones Rápidas</h3>
            <div className={`grid gap-3 ${isTabletOrDesktop ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <Button
                variant={tableAction === 'occupy' ? 'default' : 'outline'}
                onClick={() => setTableAction('occupy')}
                disabled={!isAvailable}
                className="justify-start h-auto p-4 text-left min-h-[60px]"
                style={{ 
                  backgroundColor: tableAction === 'occupy' ? '#9FB289' : 'transparent',
                  borderColor: '#9FB289',
                  color: tableAction === 'occupy' ? 'white' : '#9FB289'
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">🍽️</span>
                  <span className="font-medium">Ocupar Mesa</span>
                </div>
              </Button>
              
              <Button
                variant={tableAction === 'clean' ? 'default' : 'outline'}
                onClick={() => setTableAction('clean')}
                className="justify-start h-auto p-4 text-left min-h-[60px]"
                style={{ 
                  backgroundColor: tableAction === 'clean' ? '#CB5910' : 'transparent',
                  borderColor: '#CB5910',
                  color: tableAction === 'clean' ? 'white' : '#CB5910'
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">🧽</span>
                  <span className="font-medium">Limpiar Mesa</span>
                </div>
              </Button>

              <Button
                variant={tableAction === 'maintenance' ? 'default' : 'outline'}
                onClick={() => setTableAction('maintenance')}
                className="justify-start h-auto p-4 text-left min-h-[60px]"
                style={{ 
                  backgroundColor: tableAction === 'maintenance' ? '#6B7280' : 'transparent',
                  borderColor: '#6B7280',
                  color: tableAction === 'maintenance' ? 'white' : '#6B7280'
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">🔧</span>
                  <span className="font-medium">Mantenimiento</span>
                </div>
              </Button>

              <Button
                variant={tableAction === 'free' ? 'default' : 'outline'}
                onClick={() => setTableAction('free')}
                disabled={isAvailable}
                className="justify-start h-auto p-4 text-left min-h-[60px]"
                style={{ 
                  backgroundColor: tableAction === 'free' ? '#34C759' : 'transparent',
                  borderColor: '#34C759',
                  color: tableAction === 'free' ? 'white' : '#34C759'
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">✅</span>
                  <span className="font-medium">Liberar Mesa</span>
                </div>
              </Button>
              
              <Button
                variant={tableAction === 'reserve' ? 'default' : 'outline'}
                onClick={() => setTableAction('reserve')}
                disabled={!isAvailable}
                className={`justify-start h-auto p-4 text-left min-h-[60px] ${isTabletOrDesktop ? 'col-span-2' : 'col-span-full'}`}
                style={{ 
                  backgroundColor: tableAction === 'reserve' ? '#237584' : 'transparent',
                  borderColor: '#237584',
                  color: tableAction === 'reserve' ? 'white' : '#237584'
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">📅</span>
                  <span className="font-medium">Nueva Reserva</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Formulario de reserva */}
          {tableAction === 'reserve' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 text-lg">Crear Reserva</h3>
              
              {/* Datos del cliente */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <Input
                      placeholder="Nombre del cliente"
                      value={reservationForm.customerName}
                      onChange={(e) => setReservationForm({...reservationForm, customerName: e.target.value})}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <Input
                      placeholder="Apellido"
                      value={reservationForm.customerLastName}
                      onChange={(e) => setReservationForm({...reservationForm, customerLastName: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <Input
                      type="tel"
                      placeholder="Teléfono de contacto"
                      value={reservationForm.phone}
                      onChange={(e) => setReservationForm({...reservationForm, phone: e.target.value})}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="Email (opcional)"
                      value={reservationForm.email}
                      onChange={(e) => setReservationForm({...reservationForm, email: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Detalles de la reserva */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <Input
                      type="date"
                      value={reservationForm.date}
                      onChange={(e) => setReservationForm({...reservationForm, date: e.target.value})}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                    <Input
                      type="time"
                      value={reservationForm.time}
                      onChange={(e) => setReservationForm({...reservationForm, time: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comensales</label>
                    <Select 
                      value={reservationForm.guests.toString()} 
                      onValueChange={(value) => setReservationForm({...reservationForm, guests: parseInt(value)})}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} personas</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                    <Select 
                      value={reservationForm.duration} 
                      onValueChange={(value) => setReservationForm({...reservationForm, duration: value})}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1.5 horas</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="180">3 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notas especiales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Especiales</label>
                <Textarea
                  placeholder="Alergias, celebraciones, preferencias especiales..."
                  value={reservationForm.notes}
                  onChange={(e) => setReservationForm({...reservationForm, notes: e.target.value})}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12">
              Cancelar
            </Button>
            {tableAction && (
              <Button 
                onClick={handleAction}
                className="flex-1 h-12 text-white"
                style={{ backgroundColor: '#237584' }}
                disabled={createReservation.isPending}
              >
                {createReservation.isPending ? 'Procesando...' : 'Confirmar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
