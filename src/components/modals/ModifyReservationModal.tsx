
import React, { useState } from 'react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { SearchInput } from '@/components/forms/SearchInput';
import { StatusBadge } from '@/components/ui/status-badge';
import { useUpdateReservation, useAvailableTables } from '@/hooks/useReservations';
import { Reserva } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Save,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ModifyReservationModalProps {
  reservation: Reserva;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModifyReservationModal({ 
  reservation, 
  isOpen, 
  onClose, 
  onSuccess 
}: ModifyReservationModalProps) {
  const [formData, setFormData] = useState({
    fecha_reserva: reservation.fecha_reserva,
    hora_reserva: reservation.hora_reserva,
    numero_comensales: reservation.numero_comensales,
    mesa_id: reservation.mesa_id,
    notas_cliente: reservation.notas_cliente || '',
    notas_restaurante: reservation.notas_restaurante || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateReservation = useUpdateReservation();
  
  const { data: availableTables } = useAvailableTables(
    formData.fecha_reserva,
    formData.hora_reserva,
    formData.numero_comensales
  );

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fecha_reserva) {
      newErrors.fecha_reserva = 'La fecha es requerida';
    }
    
    if (!formData.hora_reserva) {
      newErrors.hora_reserva = 'La hora es requerida';
    }
    
    if (formData.numero_comensales < 1) {
      newErrors.numero_comensales = 'Debe ser al menos 1 comensal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await updateReservation.mutateAsync({
        id: reservation.id,
        ...formData
      });
      
      toast({
        title: "Reserva modificada",
        description: "Los cambios se han guardado correctamente",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo modificar la reserva",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5 backdrop-blur-ios">
      <IOSCard variant="elevated" className="max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-ios-2xl animate-scale-in">
        {/* Modal Header */}
        <IOSCardHeader className="bg-gradient-to-r from-enigma-primary/5 to-enigma-secondary/5 border-b border-enigma-neutral-200/50">
          <div className="flex justify-between items-center">
            <IOSCardTitle className="flex items-center space-x-3">
              <Calendar className="text-enigma-primary" size={20} />
              <span className="ios-text-headline font-semibold">Modificar Reserva</span>
            </IOSCardTitle>
            <IOSButton 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="hover:bg-enigma-neutral-100"
            >
              <X size={24} className="text-enigma-neutral-600" />
            </IOSButton>
          </div>
        </IOSCardHeader>

        {/* Modal Content */}
        <IOSCardContent className="p-8 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del Cliente */}
              <div>
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                  Cliente
                </h3>
                <IOSCard variant="default">
                  <IOSCardContent className="enigma-spacing-md">
                    <p className="ios-text-callout font-semibold text-enigma-neutral-900 mb-2">
                      {reservation.clientes?.nombre} {reservation.clientes?.apellido}
                    </p>
                    <p className="ios-text-footnote text-enigma-neutral-600">
                      {reservation.clientes?.email}
                    </p>
                    <p className="ios-text-footnote text-enigma-neutral-600">
                      {reservation.clientes?.telefono}
                    </p>
                  </IOSCardContent>
                </IOSCard>
              </div>

              {/* Estado Actual */}
              <div>
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                  Estado Actual
                </h3>
                <IOSCard variant="default">
                  <IOSCardContent className="enigma-spacing-md">
                    <StatusBadge status={reservation.estado_reserva} />
                    <p className="ios-text-footnote text-enigma-neutral-600 mt-2">
                      Creada: {format(parseISO(reservation.fecha_creacion), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </IOSCardContent>
                </IOSCard>
              </div>
            </div>

            {/* Formulario de Modificación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
                  Fecha de Reserva
                </label>
                <input
                  type="date"
                  value={formData.fecha_reserva}
                  onChange={(e) => handleInputChange('fecha_reserva', e.target.value)}
                  className={`input-base w-full ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary ${
                    errors.fecha_reserva ? 'border-red-500' : ''
                  }`}
                />
                {errors.fecha_reserva && (
                  <p className="text-red-500 ios-text-caption1 mt-1">{errors.fecha_reserva}</p>
                )}
              </div>

              {/* Hora */}
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
                  Hora de Reserva
                </label>
                <input
                  type="time"
                  value={formData.hora_reserva}
                  onChange={(e) => handleInputChange('hora_reserva', e.target.value)}
                  className={`input-base w-full ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary ${
                    errors.hora_reserva ? 'border-red-500' : ''
                  }`}
                />
                {errors.hora_reserva && (
                  <p className="text-red-500 ios-text-caption1 mt-1">{errors.hora_reserva}</p>
                )}
              </div>

              {/* Número de Comensales */}
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
                  Número de Comensales
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numero_comensales}
                  onChange={(e) => handleInputChange('numero_comensales', parseInt(e.target.value))}
                  className={`input-base w-full ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary ${
                    errors.numero_comensales ? 'border-red-500' : ''
                  }`}
                />
                {errors.numero_comensales && (
                  <p className="text-red-500 ios-text-caption1 mt-1">{errors.numero_comensales}</p>
                )}
              </div>

              {/* Mesa */}
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
                  Mesa
                </label>
                <select
                  value={formData.mesa_id || ''}
                  onChange={(e) => handleInputChange('mesa_id', e.target.value || null)}
                  className="input-base w-full ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary"
                >
                  <option value="">Asignar automáticamente</option>
                  {availableTables?.map((table) => (
                    <option key={table.id} value={table.id}>
                      Mesa {table.numero_mesa} (Capacidad: {table.capacidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
                  Notas del Cliente
                </label>
                <textarea
                  value={formData.notas_cliente}
                  onChange={(e) => handleInputChange('notas_cliente', e.target.value)}
                  rows={3}
                  className="input-base w-full ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary resize-none"
                  placeholder="Notas adicionales del cliente..."
                />
              </div>
              
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
                  Notas del Restaurante
                </label>
                <textarea
                  value={formData.notas_restaurante}
                  onChange={(e) => handleInputChange('notas_restaurante', e.target.value)}
                  rows={3}
                  className="input-base w-full ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary resize-none"
                  placeholder="Notas internas del restaurante..."
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-enigma-neutral-200/50">
              <IOSButton 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="border-enigma-neutral-300 text-enigma-neutral-600"
              >
                Cancelar
              </IOSButton>
              <IOSButton 
                type="submit"
                variant="primary" 
                className="bg-enigma-primary hover:bg-enigma-primary/90"
                disabled={updateReservation.isPending}
              >
                <Save size={16} className="mr-2" />
                {updateReservation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </IOSButton>
            </div>
          </form>
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}
