import React, { useState } from 'react';
import { 
  Calendar, Clock, Phone, Mail, MessageSquare, Star, 
  User, MapPin, Edit, Camera, Gift, AlertCircle,
  CheckCircle, XCircle, Users, Heart, Flag, FileText
} from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  type: 'reservation' | 'visit' | 'call' | 'email' | 'whatsapp' | 'note' | 'birthday' | 'anniversary' | 'promotion' | 'feedback';
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, any>;
  important?: boolean;
}

interface CustomerTimelineProps {
  customerId: string;
  events: TimelineEvent[];
  onAddNote: (note: string) => void;
  onEditEvent: (eventId: string, data: Partial<TimelineEvent>) => void;
  isLoading?: boolean;
}

export function CustomerTimeline({ 
  customerId, 
  events, 
  onAddNote, 
  onEditEvent,
  isLoading = false 
}: CustomerTimelineProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'reservation': return Calendar;
      case 'visit': return CheckCircle;
      case 'call': return Phone;
      case 'email': return Mail;
      case 'whatsapp': return MessageSquare;
      case 'note': return FileText;
      case 'birthday': return Gift;
      case 'anniversary': return Heart;
      case 'promotion': return Star;
      case 'feedback': return MessageSquare;
      default: return AlertCircle;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'reservation': return '#237584';
      case 'visit': return '#9FB289';
      case 'call': return '#007AFF';
      case 'email': return '#FF9500';
      case 'whatsapp': return '#25D366';
      case 'note': return '#8E8E93';
      case 'birthday': return '#FF3B30';
      case 'anniversary': return '#CB5910';
      case 'promotion': return '#FFD700';
      case 'feedback': return '#32D74B';
      default: return '#8E8E93';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'reservation': return 'Reserva';
      case 'visit': return 'Visita';
      case 'call': return 'Llamada';
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'note': return 'Nota';
      case 'birthday': return 'Cumpleaños';
      case 'anniversary': return 'Aniversario';
      case 'promotion': return 'Promoción';
      case 'feedback': return 'Feedback';
      default: return 'Evento';
    }
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(event => event.type === filterType);

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
      setShowAddNote(false);
    }
  };

  const eventTypes = Array.from(new Set(events.map(e => e.type)));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-enigma-neutral-200 rounded-ios" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-enigma-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-enigma-neutral-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex items-center justify-between">
        <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
          Historial del Cliente
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Filtros */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout bg-white"
          >
            <option value="all">Todos los eventos</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {getEventLabel(type)}
              </option>
            ))}
          </select>
          
          <IOSButton
            variant="primary"
            size="sm"
            onClick={() => setShowAddNote(true)}
            className="bg-enigma-primary"
          >
            <FileText size={16} className="mr-2" />
            Agregar Nota
          </IOSButton>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <IOSCard variant="elevated" className="border-enigma-primary/30">
          <IOSCardContent className="p-4">
            <div className="space-y-3">
              <h4 className="ios-text-callout font-semibold text-enigma-neutral-900">
                Nueva Nota
              </h4>
              
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe una nota sobre este cliente..."
                className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout resize-none"
                rows={3}
                autoFocus
              />
              
              <div className="flex justify-end gap-2">
                <IOSButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNote('');
                  }}
                  className="border-enigma-neutral-300 text-enigma-neutral-600"
                >
                  Cancelar
                </IOSButton>
                
                <IOSButton
                  variant="primary"
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="bg-enigma-primary"
                >
                  Guardar Nota
                </IOSButton>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-enigma-neutral-200" />
        
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
              <p className="ios-text-callout text-enigma-neutral-500">
                {filterType === 'all' ? 'No hay eventos en el historial' : `No hay eventos de tipo "${getEventLabel(filterType)}"`}
              </p>
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const IconComponent = getEventIcon(event.type);
              const color = getEventColor(event.type);
              
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline Icon */}
                  <div 
                    className={`
                      relative z-10 w-10 h-10 rounded-ios flex items-center justify-center shadow-ios
                      ${event.important ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{ 
                      backgroundColor: `${color}20`,
                      color: color,
                      ringColor: event.important ? color : undefined
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <IOSCard 
                      variant="default" 
                      className={`
                        transition-all duration-200 hover:shadow-ios-lg
                        ${event.important ? 'border-l-4' : ''}
                      `}
                      style={{
                        borderLeftColor: event.important ? color : undefined
                      }}
                    >
                      <IOSCardContent className="p-4">
                        {/* Event Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="ios-text-callout font-semibold text-enigma-neutral-900">
                                {event.title}
                              </h4>
                              
                              <IOSBadge 
                                variant="custom" 
                                size="sm"
                                style={{ backgroundColor: `${color}20`, color }}
                              >
                                {getEventLabel(event.type)}
                              </IOSBadge>
                              
                              {event.important && (
                                <IOSBadge 
                                  variant="custom" 
                                  size="sm"
                                  className="bg-enigma-accent/20 text-enigma-accent"
                                >
                                  Importante
                                </IOSBadge>
                              )}
                            </div>
                            
                            <p className="ios-text-footnote text-enigma-neutral-600">
                              {event.description}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="ios-text-caption1 text-enigma-neutral-500">
                              {format(new Date(event.date), 'dd/MM/yyyy')}
                            </div>
                            <div className="ios-text-caption2 text-enigma-neutral-400">
                              {formatDistanceToNow(new Date(event.date), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Event Metadata */}
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-enigma-neutral-200">
                            {event.type === 'reservation' && event.metadata.guests && (
                              <div className="flex items-center gap-2 text-enigma-neutral-600">
                                <Users size={14} />
                                <span className="ios-text-caption1">
                                  {event.metadata.guests} comensales
                                </span>
                              </div>
                            )}
                            
                            {event.type === 'visit' && event.metadata.table && (
                              <div className="flex items-center gap-2 text-enigma-neutral-600">
                                <MapPin size={14} />
                                <span className="ios-text-caption1">
                                  Mesa {event.metadata.table}
                                </span>
                              </div>
                            )}
                            
                            {event.metadata.duration && (
                              <div className="flex items-center gap-2 text-enigma-neutral-600">
                                <Clock size={14} />
                                <span className="ios-text-caption1">
                                  Duración: {event.metadata.duration}
                                </span>
                              </div>
                            )}
                            
                            {event.metadata.rating && (
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                      key={star}
                                      size={14} 
                                      className={
                                        star <= event.metadata!.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-enigma-neutral-300'
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="ios-text-caption1 text-enigma-neutral-600">
                                  {event.metadata.rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        {event.type === 'note' && (
                          <div className="flex justify-end pt-3 border-t border-enigma-neutral-200">
                            <IOSButton
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditEvent(event.id, {})}
                              className="text-enigma-primary"
                            >
                              <Edit size={14} className="mr-1" />
                              Editar
                            </IOSButton>
                          </div>
                        )}
                      </IOSCardContent>
                    </IOSCard>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Summary Stats */}
      {filteredEvents.length > 0 && (
        <IOSCard variant="default" className="bg-enigma-neutral-50">
          <IOSCardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="ios-text-title3 font-bold text-enigma-primary">
                  {events.filter(e => e.type === 'visit').length}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  Visitas totales
                </div>
              </div>
              
              <div>
                <div className="ios-text-title3 font-bold text-enigma-secondary">
                  {events.filter(e => e.type === 'reservation').length}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  Reservas realizadas
                </div>
              </div>
              
              <div>
                <div className="ios-text-title3 font-bold text-enigma-accent">
                  {events.filter(e => ['call', 'email', 'whatsapp'].includes(e.type)).length}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  Comunicaciones
                </div>
              </div>
              
              <div>
                <div className="ios-text-title3 font-bold text-enigma-neutral-600">
                  {events.filter(e => e.type === 'note').length}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  Notas privadas
                </div>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      )}
    </div>
  );
}