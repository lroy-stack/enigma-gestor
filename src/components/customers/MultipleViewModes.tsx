import React, { useState } from 'react';
import { 
  Grid, List, Filter, Search, 
  User, Phone, Mail, Star, Clock,
  Crown, Sparkles, CheckCircle, AlertTriangle
} from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Customer {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_creacion: string;
  ultima_visita?: string;
  vip_status: boolean;
  idioma_preferido: string;
  direccion?: string;
  fecha_nacimiento?: string;
  tags?: string[];
  analytics?: {
    totalVisits: number;
    totalReservations: number;
    avgSatisfaction: number;
    churnRisk: number;
  };
}

interface MultipleViewModesProps {
  customers: Customer[];
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onCustomerClick: (customer: Customer) => void;
  onCustomerEdit: (customer: Customer) => void;
  onCustomerDelete: (customerId: string) => void;
  isLoading?: boolean;
}

export function MultipleViewModes({
  customers,
  currentView,
  onViewChange,
  onCustomerClick,
  onCustomerEdit,
  onCustomerDelete,
  isLoading = false
}: MultipleViewModesProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const getStatusInfo = (customer: Customer) => {
    if (customer.vip_status) {
      return { status: 'VIP', color: '#CB5910', icon: Crown };
    }
    
    const now = new Date();
    const registration = new Date(customer.fecha_creacion);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    if (registration > oneMonthAgo) {
      return { status: 'Nuevo', color: '#9FB289', icon: Sparkles };
    }
    
    if (!customer.ultima_visita) {
      return { status: 'Inactivo', color: '#6B7280', icon: AlertTriangle };
    }
    
    const lastVisit = new Date(customer.ultima_visita);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    if (lastVisit < threeMonthsAgo) {
      return { status: 'Inactivo', color: '#6B7280', icon: Clock };
    }
    
    return { status: 'Regular', color: '#237584', icon: CheckCircle };
  };



  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {customers.map(customer => {
        const statusInfo = getStatusInfo(customer);
        const StatusIcon = statusInfo.icon;
        
        return (
          <IOSCard 
            key={customer.id}
            variant="elevated"
            className="cursor-pointer transition-all duration-300 hover:shadow-ios-lg hover:scale-102 ios-touch-feedback overflow-hidden group"
            onClick={() => onCustomerClick(customer)}
          >
            <IOSCardContent className="p-0">
              {/* Header with gradient */}
              <div 
                className="p-5 md:p-6 relative"
                style={{ background: `linear-gradient(135deg, ${statusInfo.color}15, ${statusInfo.color}05)` }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div 
                    className="w-16 h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-ios transition-transform group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}CC)` }}
                  >
                    {customer.nombre.charAt(0)}{customer.apellido.charAt(0)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <IOSBadge 
                    variant="custom"
                    className="flex items-center gap-1.5 text-white border-white/30 px-3 py-1.5"
                    style={{ backgroundColor: `${statusInfo.color}50`, backdropFilter: 'blur(12px)' }}
                  >
                    <StatusIcon size={14} />
                    <span className="font-medium ios-text-caption1">{statusInfo.status}</span>
                  </IOSBadge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6 space-y-4">
                <div>
                  <h3 className="ios-text-callout font-bold text-enigma-neutral-900 mb-2 leading-tight">
                    {customer.nombre} {customer.apellido}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ios-text-caption1 text-enigma-neutral-600">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 ios-text-caption1 text-enigma-neutral-600">
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{customer.telefono}</span>
                    </div>
                  </div>
                </div>
                
                {customer.analytics && (
                  <div className="flex justify-between items-center pt-4 border-t border-enigma-neutral-200/50">
                    <div className="text-center flex-1">
                      <div className="ios-text-callout font-bold text-enigma-primary">
                        {customer.analytics.totalVisits}
                      </div>
                      <div className="ios-text-caption2 text-enigma-neutral-500">
                        Visitas
                      </div>
                    </div>
                    <div className="w-px h-8 bg-enigma-neutral-200 mx-3"></div>
                    <div className="text-center flex-1">
                      <div className="ios-text-callout font-bold text-enigma-secondary">
                        {customer.analytics.totalReservations}
                      </div>
                      <div className="ios-text-caption2 text-enigma-neutral-500">
                        Reservas
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </IOSCardContent>
          </IOSCard>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {customers.map(customer => {
        const statusInfo = getStatusInfo(customer);
        const StatusIcon = statusInfo.icon;
        
        return (
          <IOSCard 
            key={customer.id}
            variant="elevated"
            className="cursor-pointer transition-all duration-300 hover:shadow-ios-lg ios-touch-feedback"
            onClick={() => onCustomerClick(customer)}
          >
            <IOSCardContent className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-ios flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}80)` }}
                >
                  {customer.nombre.charAt(0)}{customer.apellido.charAt(0)}
                </div>
                
                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <h3 className="ios-text-callout font-bold text-enigma-neutral-900 truncate">
                      {customer.nombre} {customer.apellido}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <IOSBadge 
                        variant="custom"
                        className="flex items-center gap-1"
                        style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                      >
                        <StatusIcon size={12} />
                        <span className="font-medium">{statusInfo.status}</span>
                      </IOSBadge>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 ios-text-caption1 text-enigma-neutral-600 min-w-0">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 ios-text-caption1 text-enigma-neutral-600">
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{customer.telefono}</span>
                    </div>
                  </div>
                  
                  {/* Stats and Last Visit */}
                  <div className="flex items-center justify-between pt-3 border-t border-enigma-neutral-200/50">
                    <div className="flex items-center gap-4">
                      {customer.analytics ? (
                        <>
                          <div className="text-center">
                            <div className="ios-text-caption1 font-bold text-enigma-primary">
                              {customer.analytics.totalVisits}
                            </div>
                            <div className="ios-text-caption2 text-enigma-neutral-500">
                              Visitas
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="ios-text-caption1 font-bold text-enigma-secondary">
                              {customer.analytics.totalReservations}
                            </div>
                            <div className="ios-text-caption2 text-enigma-neutral-500">
                              Reservas
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="ios-text-caption1 text-enigma-neutral-500">Sin datos</span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="ios-text-caption1 font-medium text-enigma-neutral-900">
                        {customer.ultima_visita ? 
                          format(new Date(customer.ultima_visita), 'dd/MM/yyyy', { locale: es }) :
                          'Nunca'
                        }
                      </div>
                      <div className="ios-text-caption2 text-enigma-neutral-500">
                        Última visita
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {customer.tags && customer.tags.length > 0 && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {customer.tags.slice(0, 3).map(tag => (
                        <IOSBadge
                          key={tag}
                          variant="custom"
                          size="sm"
                          className="bg-enigma-secondary/20 text-enigma-secondary"
                        >
                          {tag}
                        </IOSBadge>
                      ))}
                      {customer.tags.length > 3 && (
                        <IOSBadge
                          variant="custom"
                          size="sm"
                          className="bg-enigma-neutral-200 text-enigma-neutral-600"
                        >
                          +{customer.tags.length - 3}
                        </IOSBadge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>
        );
      })}
    </div>
  );


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-enigma-neutral-200 rounded w-32 animate-pulse" />
          <ViewSelector />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-ios-lg p-6 shadow-ios animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-enigma-neutral-200 rounded-ios" />
                <div className="w-6 h-6 bg-enigma-neutral-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-enigma-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-enigma-neutral-200 rounded w-1/2" />
                <div className="h-3 bg-enigma-neutral-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Content based on current view */}
      {currentView === 'grid' && <GridView />}
      {currentView === 'list' && <ListView />}

      {/* Empty state */}
      {customers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
          <h3 className="ios-text-headline font-semibold text-enigma-neutral-600 mb-2">
            No hay clientes
          </h3>
          <p className="ios-text-callout text-enigma-neutral-500">
            Comienza agregando tu primer cliente
          </p>
        </div>
      )}

    </div>
  );
}