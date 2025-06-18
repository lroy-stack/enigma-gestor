
import React from 'react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Cliente } from '@/types/database';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  Star,
  Utensils,
  MessageSquare
} from 'lucide-react';

interface IOSCustomerCardProps {
  cliente: Cliente;
  onViewProfile: (cliente: Cliente) => void;
  onNewReservation: (cliente: Cliente) => void;
  onSendMessage: (cliente: Cliente) => void;
}

export function IOSCustomerCard({ 
  cliente, 
  onViewProfile, 
  onNewReservation, 
  onSendMessage 
}: IOSCustomerCardProps) {
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getClienteStatus = (cliente: Cliente) => {
    if (cliente.vip_status) return { variant: 'primary' as const, label: 'VIP' };
    
    const ahora = new Date();
    const registro = new Date(cliente.fecha_creacion);
    const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
    
    if (registro > unMesAtras) {
      return { variant: 'available' as const, label: 'Nuevo' };
    }
    
    if (!cliente.ultima_visita) {
      return { variant: 'neutral' as const, label: 'Sin visitas' };
    }
    
    const ultimaVisita = new Date(cliente.ultima_visita);
    const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
    
    if (ultimaVisita < tresMesesAtras) {
      return { variant: 'occupied' as const, label: 'Inactivo' };
    }
    
    return { variant: 'reserved' as const, label: 'Regular' };
  };

  const status = getClienteStatus(cliente);

  return (
    <IOSCard variant="glass" className="ios-touch ios-hover-subtle">
      <IOSCardContent className="p-4 space-y-4">
        {/* Header con avatar y estado */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-enigma-primary/20">
              <AvatarFallback className="bg-enigma-primary text-white font-sf font-medium">
                {getInitials(cliente.nombre, cliente.apellido)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="ios-text-headline">
                {cliente.nombre} {cliente.apellido}
              </h3>
              <p className="ios-text-callout text-enigma-neutral-600">
                {cliente.email}
              </p>
            </div>
          </div>
          <IOSBadge variant={status.variant} size="lg">
            {cliente.vip_status && <Star className="h-3 w-3 mr-1" />}
            {status.label}
          </IOSBadge>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2">
          <div className="flex items-center ios-text-callout text-enigma-neutral-700">
            <Phone className="h-4 w-4 mr-2 text-enigma-primary" />
            {cliente.telefono}
          </div>
          
          {cliente.ultima_visita && (
            <div className="flex items-center ios-text-callout text-enigma-neutral-700">
              <Calendar className="h-4 w-4 mr-2 text-enigma-secondary" />
              Última visita: {formatDistanceToNow(new Date(cliente.ultima_visita), { 
                addSuffix: true, 
                locale: es 
              })}
            </div>
          )}
          
          {cliente.preferencias_dieteticas && cliente.preferencias_dieteticas.length > 0 && (
            <div className="flex items-center ios-text-callout text-enigma-neutral-700">
              <Utensils className="h-4 w-4 mr-2 text-enigma-accent" />
              {cliente.preferencias_dieteticas.length} preferencias dietéticas
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="flex items-center justify-between pt-3 border-t border-enigma-neutral-200">
          <div className="ios-text-caption1 text-enigma-neutral-500">
            Cliente desde {format(new Date(cliente.fecha_creacion), 'MMM yyyy', { locale: es })}
          </div>
          
          <div className="flex items-center space-x-2">
            <IOSButton 
              variant="ghost" 
              size="icon"
              onClick={() => onViewProfile(cliente)}
              className="ios-touch"
            >
              <Eye className="h-4 w-4" />
            </IOSButton>
            <IOSButton 
              variant="ghost" 
              size="icon" 
              onClick={() => onNewReservation(cliente)}
              className="ios-touch"
            >
              <Calendar className="h-4 w-4" />
            </IOSButton>
            <IOSButton 
              variant="ghost" 
              size="icon"
              onClick={() => onSendMessage(cliente)}
              className="ios-touch"
            >
              <MessageSquare className="h-4 w-4" />
            </IOSButton>
          </div>
        </div>
      </IOSCardContent>
    </IOSCard>
  );
}
