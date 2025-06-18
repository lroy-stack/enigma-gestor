import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Cliente } from '@/types/database';
import { useCustomerAdvancedData } from '@/hooks/useCustomerAdvanced';
import { CustomerTagsManager } from './CustomerTagsManager';
import { CustomerNotesManager } from './CustomerNotesManager';
import { CustomerAlertsManager } from './CustomerAlertsManager';
import { CustomerInteractionsHistory } from './CustomerInteractionsHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  User, 
  Calendar, 
  BarChart3, 
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  Utensils,
  Globe,
  Edit,
  X,
  Tags,
  StickyNote,
  Bell,
  Activity
} from 'lucide-react';

interface CustomerDetailModalProps {
  cliente: Cliente | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (cliente: Cliente) => void;
}

export function CustomerDetailModal({ 
  cliente, 
  isOpen, 
  onClose, 
  onEdit 
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  
  const { data: advancedData, isLoading } = useCustomerAdvancedData(cliente?.id || '');

  if (!cliente) return null;

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden ios-modal">
        <DialogHeader className="ios-modal-header border-b border-enigma-neutral-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="ios-text-title2">
              Perfil Completo del Cliente
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <IOSButton
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(cliente)}
                >
                  <Edit className="h-4 w-4" />
                </IOSButton>
              )}
              <IOSButton
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </IOSButton>
            </div>
          </div>
        </DialogHeader>

        <div className="ios-modal-content overflow-y-auto">
          {/* Header del cliente */}
          <div className="flex items-start space-x-4 p-6 border-b border-enigma-neutral-200">
            <Avatar className="h-16 w-16 ring-2 ring-enigma-primary/20">
              <AvatarFallback className="bg-enigma-primary text-white text-lg font-sf font-semibold">
                {getInitials(cliente.nombre, cliente.apellido)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="ios-text-title1">
                  {cliente.nombre} {cliente.apellido}
                </h2>
                {cliente.vip_status && (
                  <IOSBadge variant="primary">
                    <Star className="h-3 w-3 mr-1" />
                    VIP
                  </IOSBadge>
                )}
                {advancedData?.tags && advancedData.tags.length > 0 && (
                  <div className="flex gap-1">
                    {advancedData.tags.slice(0, 3).map((tag) => (
                      <IOSBadge 
                        key={tag.id}
                        variant="custom"
                        style={{ backgroundColor: tag.tag_color, color: 'white' }}
                        className="text-xs"
                      >
                        {tag.tag_nombre}
                      </IOSBadge>
                    ))}
                    {advancedData.tags.length > 3 && (
                      <IOSBadge variant="neutral" className="text-xs">
                        +{advancedData.tags.length - 3}
                      </IOSBadge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center ios-text-callout text-enigma-neutral-700">
                  <Mail className="h-4 w-4 mr-2" />
                  {cliente.email}
                </div>
                <div className="flex items-center ios-text-callout text-enigma-neutral-700">
                  <Phone className="h-4 w-4 mr-2" />
                  {cliente.telefono}
                </div>
                <div className="flex items-center ios-text-callout text-enigma-neutral-700">
                  <Globe className="h-4 w-4 mr-2" />
                  {cliente.idioma_preferido === 'es' ? 'Español' : 'Inglés'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="ios-text-caption1 text-enigma-neutral-500 mb-1">
                Cliente desde
              </div>
              <div className="ios-text-callout font-medium">
                {format(new Date(cliente.fecha_creacion), 'dd MMM yyyy', { locale: es })}
              </div>
              
              {/* Alertas activas */}
              {advancedData?.alertas && advancedData.alertas.filter(a => !a.completada).length > 0 && (
                <div className="mt-2">
                  <IOSBadge variant="occupied">
                    <Bell className="h-3 w-3 mr-1" />
                    {advancedData.alertas.filter(a => !a.completada).length} alertas
                  </IOSBadge>
                </div>
              )}
            </div>
          </div>

          {/* Tabs de contenido */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="info" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Info</span>
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center space-x-2">
                <Tags className="h-4 w-4" />
                <span>Tags</span>
              </TabsTrigger>
              <TabsTrigger value="notas" className="flex items-center space-x-2">
                <StickyNote className="h-4 w-4" />
                <span>Notas</span>
              </TabsTrigger>
              <TabsTrigger value="alertas" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Alertas</span>
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Historial</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              {/* Información personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IOSCard>
                  <IOSCardContent className="p-4">
                    <h3 className="ios-text-headline mb-4">Información Personal</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="ios-text-footnote text-enigma-neutral-500">
                          Nombre completo
                        </label>
                        <p className="ios-text-body">
                          {cliente.nombre} {cliente.apellido}
                        </p>
                      </div>
                      <div>
                        <label className="ios-text-footnote text-enigma-neutral-500">
                          Email
                        </label>
                        <p className="ios-text-body">{cliente.email}</p>
                      </div>
                      <div>
                        <label className="ios-text-footnote text-enigma-neutral-500">
                          Teléfono
                        </label>
                        <p className="ios-text-body">{cliente.telefono}</p>
                      </div>
                      <div>
                        <label className="ios-text-footnote text-enigma-neutral-500">
                          Idioma preferido
                        </label>
                        <p className="ios-text-body">
                          {cliente.idioma_preferido === 'es' ? 'Español' : 'Inglés'}
                        </p>
                      </div>
                    </div>
                  </IOSCardContent>
                </IOSCard>

                {/* Preferencias */}
                <IOSCard>
                  <IOSCardContent className="p-4">
                    <h3 className="ios-text-headline mb-4">Preferencias</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="ios-text-footnote text-enigma-neutral-500">
                          Estado VIP
                        </label>
                        <div className="mt-1">
                          {cliente.vip_status ? (
                            <IOSBadge variant="primary">
                              <Star className="h-3 w-3 mr-1" />
                              Cliente VIP
                            </IOSBadge>
                          ) : (
                            <IOSBadge variant="neutral">Cliente Regular</IOSBadge>
                          )}
                        </div>
                      </div>
                      
                      {cliente.preferencias_dieteticas && cliente.preferencias_dieteticas.length > 0 && (
                        <div>
                          <label className="ios-text-footnote text-enigma-neutral-500">
                            Preferencias dietéticas
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {cliente.preferencias_dieteticas.map((preferencia, index) => (
                              <IOSBadge key={index} variant="secondary">
                                <Utensils className="h-3 w-3 mr-1" />
                                {preferencia}
                              </IOSBadge>
                            ))}
                          </div>
                        </div>
                      )}

                      {cliente.ultima_visita && (
                        <div>
                          <label className="ios-text-footnote text-enigma-neutral-500">
                            Última visita
                          </label>
                          <p className="ios-text-body">
                            {format(new Date(cliente.ultima_visita), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </p>
                        </div>
                      )}
                    </div>
                  </IOSCardContent>
                </IOSCard>
              </div>

              {/* Notas privadas */}
              {cliente.notas_privadas && (
                <IOSCard>
                  <IOSCardContent className="p-4">
                    <h3 className="ios-text-headline mb-4">Notas Privadas</h3>
                    <p className="ios-text-body text-enigma-neutral-700">
                      {cliente.notas_privadas}
                    </p>
                  </IOSCardContent>
                </IOSCard>
              )}
            </TabsContent>

            <TabsContent value="tags">
              {advancedData ? (
                <CustomerTagsManager 
                  clienteId={cliente.id} 
                  tags={advancedData.tags} 
                />
              ) : (
                <div className="text-center py-8">Cargando tags...</div>
              )}
            </TabsContent>

            <TabsContent value="notas">
              {advancedData ? (
                <CustomerNotesManager 
                  clienteId={cliente.id} 
                  notes={advancedData.notas} 
                />
              ) : (
                <div className="text-center py-8">Cargando notas...</div>
              )}
            </TabsContent>

            <TabsContent value="alertas">
              {advancedData ? (
                <CustomerAlertsManager 
                  clienteId={cliente.id} 
                  alerts={advancedData.alertas} 
                />
              ) : (
                <div className="text-center py-8">Cargando alertas...</div>
              )}
            </TabsContent>

            <TabsContent value="historial">
              {advancedData ? (
                <CustomerInteractionsHistory 
                  interactions={advancedData.interacciones} 
                />
              ) : (
                <div className="text-center py-8">Cargando historial...</div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <IOSCard>
                <IOSCardContent className="p-4">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-enigma-neutral-400 mb-4" />
                    <h3 className="ios-text-headline text-enigma-neutral-600 mb-2">
                      Analytics del Cliente
                    </h3>
                    <p className="ios-text-callout text-enigma-neutral-500">
                      Métricas detalladas y análisis de comportamiento disponibles próximamente
                    </p>
                  </div>
                </IOSCardContent>
              </IOSCard>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
