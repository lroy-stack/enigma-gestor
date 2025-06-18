
import React, { useState } from 'react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { useUpdateReservation } from '@/hooks/useReservations';
import { Reserva } from '@/types/database';
import { 
  X, 
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CancelReservationModalProps {
  reservation: Reserva;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelReservationModal({ 
  reservation, 
  isOpen, 
  onClose, 
  onSuccess 
}: CancelReservationModalProps) {
  const [reason, setReason] = useState('');
  const [cancelType, setCancelType] = useState<'cancelada_restaurante' | 'cancelada_usuario'>('cancelada_restaurante');
  const updateReservation = useUpdateReservation();

  if (!isOpen) return null;

  const handleCancel = async () => {
    try {
      await updateReservation.mutateAsync({
        id: reservation.id,
        estado_reserva: cancelType,
        notas_restaurante: reason || 'Reserva cancelada'
      });
      
      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada correctamente",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5 backdrop-blur-ios">
      <IOSCard variant="elevated" className="max-w-md w-full shadow-ios-2xl animate-scale-in">
        {/* Modal Header */}
        <IOSCardHeader className="bg-red-50 border-b border-red-200">
          <div className="flex justify-between items-center">
            <IOSCardTitle className="flex items-center space-x-3">
              <AlertTriangle className="text-red-600" size={20} />
              <span className="ios-text-headline font-semibold text-red-700">Cancelar Reserva</span>
            </IOSCardTitle>
            <IOSButton 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="hover:bg-red-100"
            >
              <X size={24} className="text-red-600" />
            </IOSButton>
          </div>
        </IOSCardHeader>

        {/* Modal Content */}
        <IOSCardContent className="enigma-spacing-lg">
          <div className="text-center mb-6">
            <p className="ios-text-callout text-enigma-neutral-700 mb-2">
              ¿Estás seguro de que deseas cancelar la reserva de:
            </p>
            <p className="ios-text-callout font-semibold text-enigma-neutral-900">
              {reservation.clientes?.nombre} {reservation.clientes?.apellido}
            </p>
            <p className="ios-text-footnote text-enigma-neutral-600">
              {reservation.fecha_reserva} a las {reservation.hora_reserva}
            </p>
          </div>

          {/* Tipo de Cancelación */}
          <div className="mb-4">
            <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
              Tipo de cancelación
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="cancelada_restaurante"
                  checked={cancelType === 'cancelada_restaurante'}
                  onChange={(e) => setCancelType(e.target.value as 'cancelada_restaurante')}
                  className="text-enigma-primary focus:ring-enigma-primary"
                />
                <span className="ios-text-footnote">Cancelada por el restaurante</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="cancelada_usuario"
                  checked={cancelType === 'cancelada_usuario'}
                  onChange={(e) => setCancelType(e.target.value as 'cancelada_usuario')}
                  className="text-enigma-primary focus:ring-enigma-primary"
                />
                <span className="ios-text-footnote">Cancelada por el cliente</span>
              </label>
            </div>
          </div>

          {/* Motivo */}
          <div className="mb-6">
            <label className="ios-text-callout font-medium text-enigma-neutral-900 mb-2 block">
              Motivo de cancelación (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="input-base w-full ios-text-footnote rounded-ios border-enigma-neutral-300 focus:border-red-400 focus:ring-red-400 resize-none"
              placeholder="Describe el motivo de la cancelación..."
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex space-x-3">
            <IOSButton 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-enigma-neutral-300 text-enigma-neutral-600"
            >
              Mantener Reserva
            </IOSButton>
            <IOSButton 
              variant="primary"
              onClick={handleCancel}
              disabled={updateReservation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <XCircle size={16} className="mr-2" />
              {updateReservation.isPending ? 'Cancelando...' : 'Cancelar Reserva'}
            </IOSButton>
          </div>
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}
