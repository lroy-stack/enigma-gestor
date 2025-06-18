import React, { useState } from 'react';
import { 
  ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, Star, 
  Clock, Users, Gift, MessageSquare, Camera, Settings,
  Heart, AlertTriangle, CheckCircle, XCircle, Tag,
  BarChart3, TrendingUp, Activity, User, Crown, Sparkles
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { CustomerTimeline } from './CustomerTimeline';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_creacion: string;
  ultima_visita?: string;
  vip_status: boolean;
  idioma_preferido: string;
  preferencias_dieteticas?: string[];
  notas_privadas?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  tags?: string[];
  reservations: Array<{
    id: string;
    fecha: string;
    mesa: string;
    comensales: number;
    estado: 'confirmada' | 'cancelada' | 'completada';
    notas?: string;
  }>;
  visitHistory: Array<{
    id: string;
    fecha: string;
    mesa: string;
    duracion: number;
    satisfaccion?: number;
    gasto?: number;
  }>;
  analytics: {
    totalVisits: number;
    totalReservations: number;
    avgDuration: number;
    avgSatisfaction: number;
    favoriteTable: string;
    preferredTimeSlot: string;
    churnRisk: number;
    lifetimeValue: number;
    lastContactDate?: string;
  };
}

interface EnhancedCustomerProfileProps {
  customer: CustomerProfile;
  onBack: () => void;
  onEdit: (customer: CustomerProfile) => void;
  onNewReservation: (customerId: string) => void;
  onAddNote: (note: string) => void;
  onUpdateTags: (tags: string[]) => void;
  isLoading?: boolean;
}

export function EnhancedCustomerProfile({
  customer,
  onBack,
  onEdit,
  onNewReservation,
  onAddNote,
  onUpdateTags,
  isLoading = false
}: EnhancedCustomerProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analytics' | 'preferences'>('overview');
  const [showEditTags, setShowEditTags] = useState(false);
  const [newTag, setNewTag] = useState('');

  const getStatusInfo = (customer: CustomerProfile) => {
    if (customer.vip_status) {
      return { status: 'VIP', color: '#CB5910', icon: Crown, label: 'Cliente Premium' };
    }
    
    const now = new Date();
    const registration = new Date(customer.fecha_creacion);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    if (registration > oneMonthAgo) {
      return { status: 'Nuevo', color: '#9FB289', icon: Sparkles, label: 'Cliente Reciente' };
    }
    
    if (!customer.ultima_visita) {
      return { status: 'Inactivo', color: '#6B7280', icon: AlertTriangle, label: 'Sin Actividad' };
    }
    
    const lastVisit = new Date(customer.ultima_visita);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    if (lastVisit < threeMonthsAgo) {
      return { status: 'Inactivo', color: '#6B7280', icon: Clock, label: 'Requiere Atención' };
    }
    
    return { status: 'Regular', color: '#237584', icon: CheckCircle, label: 'Cliente Activo' };
  };

  const statusInfo = getStatusInfo(customer);

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 70) return { level: 'Alto', color: '#FF3B30', icon: AlertTriangle };
    if (riskScore >= 40) return { level: 'Medio', color: '#FF9500', icon: AlertTriangle };
    return { level: 'Bajo', color: '#32D74B', icon: CheckCircle };
  };

  const riskInfo = getRiskLevel(customer.analytics.churnRisk);

  const addTag = () => {
    if (newTag.trim() && !customer.tags?.includes(newTag.trim())) {
      const updatedTags = [...(customer.tags || []), newTag.trim()];
      onUpdateTags(updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = customer.tags?.filter(tag => tag !== tagToRemove) || [];
    onUpdateTags(updatedTags);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enigma-primary"></div>
      </div>
    );
  }

  const timelineEvents = [
    ...customer.reservations.map(res => ({
      id: res.id,
      type: 'reservation' as const,
      title: `Reserva para ${res.comensales} personas`,
      description: `Mesa ${res.mesa} - ${res.estado}`,
      date: res.fecha,
      metadata: { guests: res.comensales, table: res.mesa, status: res.estado },
      important: res.estado === 'cancelada'
    })),
    ...customer.visitHistory.map(visit => ({
      id: visit.id,
      type: 'visit' as const,
      title: 'Visita al restaurante',
      description: `Mesa ${visit.mesa} - ${visit.duracion} min`,
      date: visit.fecha,
      metadata: { 
        table: visit.mesa,
        duration: `${visit.duracion} minutos`,
        rating: visit.satisfaccion
      }
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-ios border-b border-enigma-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IOSButton
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="w-10 h-10 p-0 text-enigma-primary"
              >
                <ArrowLeft size={20} />
              </IOSButton>
              
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-ios flex items-center justify-center text-white text-xl font-bold shadow-ios"
                  style={{ background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}80)` }}
                >
                  {customer.nombre.charAt(0)}{customer.apellido.charAt(0)}
                </div>
                <div>
                  <h1 className="ios-text-title1 font-bold text-enigma-neutral-900">
                    {customer.nombre} {customer.apellido}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <IOSBadge 
                      variant="custom" 
                      style={{ backgroundColor: statusInfo.color, color: 'white' }}
                      className="flex items-center gap-1"
                    >
                      <statusInfo.icon size={12} />
                      {statusInfo.status}
                    </IOSBadge>
                    <span className="ios-text-footnote text-enigma-neutral-500">
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <IOSButton
                variant="outline"
                onClick={() => onEdit(customer)}
                className="border-enigma-primary text-enigma-primary"
              >
                <Edit size={16} className="mr-2" />
                Editar
              </IOSButton>
              
              <IOSButton
                variant="primary"
                onClick={() => onNewReservation(customer.id)}
                className="bg-enigma-primary"
              >
                <Calendar size={16} className="mr-2" />
                Nueva Reserva
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-enigma-neutral-200 bg-white">
        <div className="flex gap-1 bg-enigma-neutral-100/50 rounded-ios p-1">
          {[
            { key: 'overview', label: 'Vista General', icon: User },
            { key: 'timeline', label: 'Historial', icon: Clock },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            { key: 'preferences', label: 'Preferencias', icon: Settings }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-ios transition-all ${
                  activeTab === tab.key
                    ? 'bg-enigma-primary text-white shadow-ios'
                    : 'text-enigma-neutral-600 hover:text-enigma-primary'
                }`}
              >
                <IconComponent size={16} />
                <span className="ios-text-callout font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact & Basic Info */}
            <div className="space-y-6">
              <IOSCard variant="elevated">
                <IOSCardHeader>
                  <IOSCardTitle className="flex items-center gap-2">
                    <User size={20} className="text-enigma-primary" />
                    Información de Contacto
                  </IOSCardTitle>
                </IOSCardHeader>
                <IOSCardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-enigma-neutral-500" />
                    <span className="ios-text-callout text-enigma-neutral-900">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-enigma-neutral-500" />
                    <span className="ios-text-callout text-enigma-neutral-900">{customer.telefono}</span>
                  </div>
                  {customer.direccion && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-enigma-neutral-500" />
                      <span className="ios-text-callout text-enigma-neutral-900">{customer.direccion}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-enigma-neutral-500" />
                    <span className="ios-text-callout text-enigma-neutral-900">
                      Cliente desde {format(new Date(customer.fecha_creacion), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  {customer.fecha_nacimiento && (
                    <div className="flex items-center gap-3">
                      <Gift size={16} className="text-enigma-neutral-500" />
                      <span className="ios-text-callout text-enigma-neutral-900">
                        {format(new Date(customer.fecha_nacimiento), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  )}
                </IOSCardContent>
              </IOSCard>

              {/* Tags */}
              <IOSCard variant="elevated">
                <IOSCardHeader>
                  <IOSCardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={20} className="text-enigma-primary" />
                      Etiquetas
                    </div>
                    <IOSButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditTags(!showEditTags)}
                      className="text-enigma-primary"
                    >
                      <Edit size={14} />
                    </IOSButton>
                  </IOSCardTitle>
                </IOSCardHeader>
                <IOSCardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {customer.tags?.map(tag => (
                        <IOSBadge
                          key={tag}
                          variant="custom"
                          className="bg-enigma-secondary/20 text-enigma-secondary border border-enigma-secondary/30"
                        >
                          {tag}
                          {showEditTags && (
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-enigma-secondary/70 hover:text-red-500"
                            >
                              <XCircle size={12} />
                            </button>
                          )}
                        </IOSBadge>
                      ))}
                    </div>
                    
                    {showEditTags && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          placeholder="Nueva etiqueta..."
                          className="flex-1 p-2 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
                        />
                        <IOSButton
                          variant="primary"
                          size="sm"
                          onClick={addTag}
                          className="bg-enigma-primary"
                        >
                          +
                        </IOSButton>
                      </div>
                    )}
                  </div>
                </IOSCardContent>
              </IOSCard>

              {/* Risk Assessment */}
              <IOSCard variant="elevated" className={`border-l-4 border-l-${riskInfo.color}`}>
                <IOSCardHeader>
                  <IOSCardTitle className="flex items-center gap-2">
                    <riskInfo.icon size={20} style={{ color: riskInfo.color }} />
                    Evaluación de Riesgo
                  </IOSCardTitle>
                </IOSCardHeader>
                <IOSCardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="ios-text-callout text-enigma-neutral-600">Riesgo de Churn</span>
                      <IOSBadge
                        variant="custom"
                        style={{ backgroundColor: `${riskInfo.color}20`, color: riskInfo.color }}
                      >
                        {riskInfo.level} ({customer.analytics.churnRisk}%)
                      </IOSBadge>
                    </div>
                    
                    <div className="w-full h-2 bg-enigma-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${customer.analytics.churnRisk}%`,
                          backgroundColor: riskInfo.color 
                        }}
                      />
                    </div>
                    
                    {customer.analytics.lastContactDate && (
                      <p className="ios-text-caption1 text-enigma-neutral-500">
                        Último contacto: {formatDistanceToNow(new Date(customer.analytics.lastContactDate), { locale: es, addSuffix: true })}
                      </p>
                    )}
                  </div>
                </IOSCardContent>
              </IOSCard>
            </div>

            {/* Middle Column - Analytics */}
            <div className="space-y-6">
              <IOSCard variant="elevated">
                <IOSCardHeader>
                  <IOSCardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-enigma-primary" />
                    Métricas del Cliente
                  </IOSCardTitle>
                </IOSCardHeader>
                <IOSCardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="ios-text-title3 font-bold text-enigma-primary">
                        {customer.analytics.totalVisits}
                      </div>
                      <div className="ios-text-caption1 text-enigma-neutral-600">
                        Visitas Totales
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="ios-text-title3 font-bold text-enigma-secondary">
                        {customer.analytics.totalReservations}
                      </div>
                      <div className="ios-text-caption1 text-enigma-neutral-600">
                        Reservas
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="ios-text-title3 font-bold text-enigma-accent">
                        {customer.analytics.avgDuration > 0 ? `${customer.analytics.avgDuration}min` : 'N/A'}
                      </div>
                      <div className="ios-text-caption1 text-enigma-neutral-600">
                        Estancia Media
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="ios-text-title3 font-bold text-enigma-neutral-600">
                        {customer.analytics.avgSatisfaction > 0 ? `${customer.analytics.avgSatisfaction.toFixed(1)}/5` : 'N/A'}
                      </div>
                      <div className="ios-text-caption1 text-enigma-neutral-600">
                        Satisfacción
                      </div>
                    </div>
                  </div>
                </IOSCardContent>
              </IOSCard>

              <IOSCard variant="elevated">
                <IOSCardHeader>
                  <IOSCardTitle className="flex items-center gap-2">
                    <Heart size={20} className="text-enigma-primary" />
                    Preferencias
                  </IOSCardTitle>
                </IOSCardHeader>
                <IOSCardContent className="p-6 space-y-4">
                  <div>
                    <span className="ios-text-callout font-medium text-enigma-neutral-600">Mesa Favorita:</span>
                    <span className="ios-text-callout text-enigma-neutral-900 ml-2">
                      {customer.analytics.favoriteTable || 'Sin datos suficientes'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="ios-text-callout font-medium text-enigma-neutral-600">Horario Preferido:</span>
                    <span className="ios-text-callout text-enigma-neutral-900 ml-2">
                      {customer.analytics.preferredTimeSlot || 'Sin datos suficientes'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="ios-text-callout font-medium text-enigma-neutral-600">Idioma:</span>
                    <span className="ios-text-callout text-enigma-neutral-900 ml-2">
                      {customer.idioma_preferido === 'es' ? 'Español' : customer.idioma_preferido}
                    </span>
                  </div>
                  
                  {customer.preferencias_dieteticas && customer.preferencias_dieteticas.length > 0 && (
                    <div>
                      <span className="ios-text-callout font-medium text-enigma-neutral-600 block mb-2">
                        Preferencias Dietéticas:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {customer.preferencias_dieteticas.map((pref, index) => (
                          <IOSBadge
                            key={index}
                            variant="custom"
                            className="bg-enigma-secondary/20 text-enigma-secondary"
                          >
                            {pref}
                          </IOSBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </IOSCardContent>
              </IOSCard>
            </div>

            {/* Right Column - Recent Activity & Notes */}
            <div className="space-y-6">
              <IOSCard variant="elevated">
                <IOSCardHeader>
                  <IOSCardTitle className="flex items-center gap-2">
                    <Activity size={20} className="text-enigma-primary" />
                    Actividad Reciente
                  </IOSCardTitle>
                </IOSCardHeader>
                <IOSCardContent className="p-6">
                  <div className="space-y-3">
                    {timelineEvents.slice(0, 5).map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="w-2 h-2 bg-enigma-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="ios-text-callout font-medium text-enigma-neutral-900">
                            {event.title}
                          </p>
                          <p className="ios-text-caption1 text-enigma-neutral-600">
                            {event.description}
                          </p>
                          <p className="ios-text-caption2 text-enigma-neutral-500">
                            {formatDistanceToNow(new Date(event.date), { locale: es, addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {timelineEvents.length === 0 && (
                      <p className="ios-text-callout text-enigma-neutral-500 text-center py-4">
                        Sin actividad reciente
                      </p>
                    )}
                  </div>
                </IOSCardContent>
              </IOSCard>

              {customer.notas_privadas && (
                <IOSCard variant="elevated">
                  <IOSCardHeader>
                    <IOSCardTitle className="flex items-center gap-2">
                      <MessageSquare size={20} className="text-enigma-primary" />
                      Notas Privadas
                    </IOSCardTitle>
                  </IOSCardHeader>
                  <IOSCardContent className="p-6">
                    <p className="ios-text-callout text-enigma-neutral-900 leading-relaxed">
                      {customer.notas_privadas}
                    </p>
                  </IOSCardContent>
                </IOSCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <CustomerTimeline
            customerId={customer.id}
            events={timelineEvents}
            onAddNote={onAddNote}
            onEditEvent={() => {}}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IOSCard variant="elevated">
              <IOSCardHeader>
                <IOSCardTitle>Tendencias de Visitas</IOSCardTitle>
              </IOSCardHeader>
              <IOSCardContent className="p-6">
                <p className="ios-text-callout text-enigma-neutral-500 text-center py-8">
                  Gráfico de tendencias próximamente
                </p>
              </IOSCardContent>
            </IOSCard>
            
            <IOSCard variant="elevated">
              <IOSCardHeader>
                <IOSCardTitle>Patrones de Comportamiento</IOSCardTitle>
              </IOSCardHeader>
              <IOSCardContent className="p-6">
                <p className="ios-text-callout text-enigma-neutral-500 text-center py-8">
                  Analytics de comportamiento próximamente
                </p>
              </IOSCardContent>
            </IOSCard>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="max-w-2xl">
            <IOSCard variant="elevated">
              <IOSCardHeader>
                <IOSCardTitle>Gestión de Preferencias</IOSCardTitle>
              </IOSCardHeader>
              <IOSCardContent className="p-6">
                <p className="ios-text-callout text-enigma-neutral-500 text-center py-8">
                  Editor de preferencias próximamente
                </p>
              </IOSCardContent>
            </IOSCard>
          </div>
        )}
      </div>
    </div>
  );
}