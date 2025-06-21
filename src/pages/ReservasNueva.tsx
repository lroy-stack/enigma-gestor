import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Calendar } from 'lucide-react';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { IOSButton } from '@/components/ui/ios-button';

export default function ReservasNueva() {
  const navigate = useNavigate();
  const [reservationCreated, setReservationCreated] = useState(false);

  const handleReservationSuccess = (reservation: any) => {
    console.log('✅ Reserva creada exitosamente:', reservation);
    setReservationCreated(true);
    
    // Redirigir a la lista de reservas después de 2 segundos
    setTimeout(() => {
      navigate('/reservas');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/reservas');
  };

  if (reservationCreated) {
    return (
      <div className="font-sf min-h-screen bg-enigma-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div 
            className="w-20 h-20 rounded-ios-xl flex items-center justify-center mx-auto mb-6 shadow-ios"
            style={{ backgroundColor: '#9FB289' }}
          >
            <Check size={32} className="text-white" />
          </div>
          <h2 className="ios-text-title1 font-bold text-enigma-neutral-900 mb-3">
            ¡Reserva Confirmada!
          </h2>
          <p className="ios-text-body text-enigma-neutral-700 mb-6">
            La reserva ha sido confirmada automáticamente. Redirigiendo a la lista de reservas...
          </p>
          <div className="w-8 h-8 border-2 border-enigma-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sf">
      {/* Header de la página */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <IOSButton
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="w-10 h-10 p-0 rounded-ios-lg border-enigma-neutral-300"
            >
              <ArrowLeft size={18} />
            </IOSButton>
            <div className="flex-1">
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
                Nueva Reserva
              </h1>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Crear una nueva reserva en el sistema
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 ios-text-caption1 text-enigma-neutral-500">
            <span>Reservas</span>
            <span>/</span>
            <span className="text-enigma-primary">Nueva Reserva</span>
          </div>
        </div>
      </div>

      {/* Formulario de reserva */}
      <ReservationForm 
        onSuccess={handleReservationSuccess}
        onCancel={handleCancel}
        className="max-w-4xl mx-auto"
      />

    </div>
  );
}