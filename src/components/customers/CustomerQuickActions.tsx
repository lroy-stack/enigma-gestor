
import React from 'react';
import { IOSButton } from '@/components/ui/ios-button';
import { Cliente } from '@/types/database';
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  Phone, 
  Star,
  UserMinus,
  Edit
} from 'lucide-react';

interface CustomerQuickActionsProps {
  cliente: Cliente;
  onNewReservation: (cliente: Cliente) => void;
  onSendEmail: (cliente: Cliente) => void;
  onSendWhatsApp: (cliente: Cliente) => void;
  onCall: (cliente: Cliente) => void;
  onToggleVIP: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

export function CustomerQuickActions({
  cliente,
  onNewReservation,
  onSendEmail,
  onSendWhatsApp,
  onCall,
  onToggleVIP,
  onEdit,
  onDelete
}: CustomerQuickActionsProps) {
  
  const handleCall = () => {
    window.open(`tel:${cliente.telefono}`, '_self');
    onCall(cliente);
  };

  const handleEmail = () => {
    window.open(`mailto:${cliente.email}`, '_self');
    onSendEmail(cliente);
  };

  const handleWhatsApp = () => {
    const cleanPhone = cliente.telefono.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
    onSendWhatsApp(cliente);
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-enigma-neutral-50 rounded-ios">
      {/* Acción principal - Nueva reserva */}
      <IOSButton
        variant="primary"
        size="sm"
        onClick={() => onNewReservation(cliente)}
        className="ios-touch"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Nueva Reserva
      </IOSButton>

      {/* Comunicación */}
      <IOSButton
        variant="ghost"
        size="icon"
        onClick={handleCall}
        className="ios-touch"
        title="Llamar"
      >
        <Phone className="h-4 w-4" />
      </IOSButton>

      <IOSButton
        variant="ghost"
        size="icon"
        onClick={handleEmail}
        className="ios-touch"
        title="Enviar email"
      >
        <Mail className="h-4 w-4" />
      </IOSButton>

      <IOSButton
        variant="ghost"
        size="icon"
        onClick={handleWhatsApp}
        className="ios-touch"
        title="WhatsApp"
      >
        <MessageSquare className="h-4 w-4" />
      </IOSButton>

      {/* Acciones de gestión */}
      <div className="h-6 w-px bg-enigma-neutral-300 mx-1" />

      <IOSButton
        variant="ghost"
        size="icon"
        onClick={() => onToggleVIP(cliente)}
        className={`ios-touch ${cliente.vip_status ? 'text-yellow-600' : 'text-enigma-neutral-500'}`}
        title={cliente.vip_status ? 'Quitar VIP' : 'Marcar como VIP'}
      >
        <Star className={`h-4 w-4 ${cliente.vip_status ? 'fill-current' : ''}`} />
      </IOSButton>

      <IOSButton
        variant="ghost"
        size="icon"
        onClick={() => onEdit(cliente)}
        className="ios-touch"
        title="Editar cliente"
      >
        <Edit className="h-4 w-4" />
      </IOSButton>

      <IOSButton
        variant="ghost"
        size="icon"
        onClick={() => onDelete(cliente)}
        className="ios-touch text-red-600 hover:bg-red-50"
        title="Eliminar cliente"
      >
        <UserMinus className="h-4 w-4" />
      </IOSButton>
    </div>
  );
}
