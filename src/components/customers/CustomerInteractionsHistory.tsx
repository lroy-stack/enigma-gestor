
import React from 'react';
import { IOSBadge } from '@/components/ui/ios-badge';
import { ClienteInteraccion } from '@/types/customer-advanced';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  StickyNote, 
  User,
  Clock
} from 'lucide-react';

interface CustomerInteractionsHistoryProps {
  interactions: ClienteInteraccion[];
}

export function CustomerInteractionsHistory({ interactions }: CustomerInteractionsHistoryProps) {
  const getInteractionIcon = (type: ClienteInteraccion['tipo_interaccion']) => {
    const icons = {
      reserva: Calendar,
      visita: User,
      llamada: Phone,
      email: Mail,
      whatsapp: MessageSquare,
      nota: StickyNote
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getInteractionLabel = (type: ClienteInteraccion['tipo_interaccion']) => {
    const labels = {
      reserva: 'Reserva',
      visita: 'Visita',
      llamada: 'Llamada',
      email: 'Email',
      whatsapp: 'WhatsApp',
      nota: 'Nota'
    };
    return labels[type];
  };

  const getInteractionVariant = (type: ClienteInteraccion['tipo_interaccion']) => {
    const variants = {
      reserva: 'primary' as const,
      visita: 'available' as const,
      llamada: 'secondary' as const,
      email: 'neutral' as const,
      whatsapp: 'secondary' as const,
      nota: 'neutral' as const
    };
    return variants[type];
  };

  const formatInteractionDetails = (interaction: ClienteInteraccion) => {
    if (interaction.metadata) {
      switch (interaction.tipo_interaccion) {
        case 'reserva':
          const reservaData = interaction.metadata;
          return `${reservaData.numero_comensales || 'N/A'} comensales - ${reservaData.fecha_reserva} ${reservaData.hora_reserva}`;
        default:
          return null;
      }
    }
    return null;
  };

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-enigma-neutral-500">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="ios-text-callout">No hay historial de interacciones registrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="ios-text-headline">Historial de Interacciones ({interactions.length})</h4>
      
      <div className="space-y-3">
        {interactions.map((interaction) => (
          <div key={interaction.id} className="p-4 bg-white border border-enigma-neutral-200 rounded-ios">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <IOSBadge variant={getInteractionVariant(interaction.tipo_interaccion)}>
                  {getInteractionIcon(interaction.tipo_interaccion)}
                  <span className="ml-1">{getInteractionLabel(interaction.tipo_interaccion)}</span>
                </IOSBadge>
              </div>
              
              <div className="ios-text-caption1 text-enigma-neutral-500">
                {format(new Date(interaction.fecha_interaccion), 'dd/MM/yyyy HH:mm', { locale: es })}
              </div>
            </div>
            
            {interaction.descripcion && (
              <p className="ios-text-callout text-enigma-neutral-700 mb-2">
                {interaction.descripcion}
              </p>
            )}
            
            {formatInteractionDetails(interaction) && (
              <div className="ios-text-caption1 text-enigma-neutral-600 bg-enigma-neutral-50 p-2 rounded">
                {formatInteractionDetails(interaction)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
