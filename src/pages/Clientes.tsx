import React, { useState } from 'react';
import { useCustomersEnhanced, useCustomerStats, useCustomerDetails } from '@/hooks/useCustomersEnhanced';
import { useNavigate } from 'react-router-dom';
import { Cliente } from '@/types/database';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Calendar, Phone, Mail, Star, Users, BarChart3, Search, Plus, X, Edit, Heart, Filter, Settings, Grid, List, Crown, Clock, AlertTriangle, CheckCircle, Sparkles, Zap, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NewCustomerForm } from '@/components/features/NewCustomerForm';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { RealCustomerAnalytics } from '@/components/customers/RealCustomerAnalytics';
import { AdvancedFilters } from '@/components/customers/AdvancedFilters';
import { EnhancedCustomerProfile } from '@/components/customers/EnhancedCustomerProfile';
import { MultipleViewModes } from '@/components/customers/MultipleViewModes';
import { TaggingSystem } from '@/components/customers/TaggingSystem';
import { CustomerTag, SavedFilter } from '@/types/customers';

interface CustomerFilters {
  searchTerm: string;
  segment: 'todos' | 'vip' | 'nuevos' | 'activos' | 'inactivos';
}

export default function Clientes() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showEnhancedProfile, setShowEnhancedProfile] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTagging, setShowTagging] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [filters, setFilters] = useState<CustomerFilters>({
    searchTerm: '',
    segment: 'todos'
  });
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, unknown>>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customerTags, setCustomerTags] = useState<CustomerTag[]>([]);

  // Data hooks
  const { data: customers = [], isLoading } = useCustomersEnhanced(filters);
  const { data: stats } = useCustomerStats();
  const { data: customerDetails } = useCustomerDetails(selectedCustomer?.id || '');

  // Handlers
  const handleCustomerClick = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setShowEnhancedProfile(true);
  };

  const handleApplyAdvancedFilters = (newFilters: Record<string, unknown>) => {
    setAdvancedFilters(newFilters);
    // Here you would typically update the query to the backend
  };

  const handleSaveFilter = (name: string, filterData: Record<string, unknown>) => {
    const newFilter = {
      id: Date.now().toString(),
      name,
      filters: filterData,
      count: customers.length,
      createdAt: new Date().toISOString()
    };
    setSavedFilters([...savedFilters, newFilter]);
  };

  const handleLoadFilter = (filter: { filters: Record<string, unknown> }) => {
    setAdvancedFilters(filter.filters);
    setShowAdvancedFilters(false);
  };

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleTagCreate = (tag: Omit<CustomerTag, 'id' | 'customerCount' | 'createdAt'>) => {
    const newTag = {
      ...tag,
      id: Date.now().toString(),
      customerCount: 0,
      createdAt: new Date().toISOString()
    };
    setCustomerTags([...customerTags, newTag]);
  };

  const handleTagUpdate = (tagId: string, updates: Partial<CustomerTag>) => {
    setCustomerTags(prev => 
      prev.map(tag => tag.id === tagId ? { ...tag, ...updates } : tag)
    );
  };

  const handleTagDelete = (tagId: string) => {
    setCustomerTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleUpdateCustomerTags = (tags: string[]) => {
    // Update customer tags logic
  };

  const handleEditCustomer = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setShowNewCustomerForm(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    // Delete customer logic
    console.log('Delete customer:', customerId);
  };

  const handleNewReservation = (customerId: string) => {
    navigate(`/reservas/nueva?cliente=${customerId}`);
    setShowEnhancedProfile(false);
  };

  const handleAddNote = (note: string) => {
    // Add note logic
    console.log('Add note:', note);
  };

  // Calculate churn risk based on real data
  const calculateChurnRisk = (customer: any): number => {
    if (!customer.ultima_visita) return 90; // High risk if never visited
    
    const lastVisit = new Date(customer.ultima_visita);
    const now = new Date();
    const daysSinceLastVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit > 180) return 85; // Very high risk
    if (daysSinceLastVisit > 90) return 65;  // High risk
    if (daysSinceLastVisit > 30) return 35;  // Medium risk
    return 15; // Low risk
  };

  // Transform database customer details to enhanced format
  const enhancedCustomer = customerDetails ? {
    ...customerDetails,
    tags: [], // Will be populated from tagging system
    reservations: customerDetails.reservas?.map(reserva => ({
      id: reserva.id,
      fecha: reserva.fecha_reserva,
      mesa: reserva.mesa_id || 'Sin asignar',
      comensales: reserva.numero_comensales,
      estado: reserva.estado_reserva === 'confirmada' ? 'confirmada' as const :
              reserva.estado_reserva === 'cancelada_usuario' || reserva.estado_reserva === 'cancelada_restaurante' ? 'cancelada' as const :
              'completada' as const,
      notas: reserva.notas_cliente
    })) || [],
    visitHistory: [], // Would need additional query to visit/transaction history table
    analytics: {
      totalVisits: customerDetails.reservas?.filter(r => r.estado_reserva === 'completada').length || 0,
      totalReservations: customerDetails.reservas?.length || 0,
      avgDuration: 90, // Would need visit duration data
      avgSatisfaction: 0, // Would need satisfaction ratings
      favoriteTable: 'Sin datos',
      preferredTimeSlot: 'Sin datos',
      churnRisk: calculateChurnRisk(customerDetails),
      lifetimeValue: 0, // Would need transaction data
      lastContactDate: customerDetails.ultima_visita
    }
  } : null;

  const getStatusColor = (status: 'vip' | 'regular' | 'nuevo' | 'inactivo'): string => {
    switch(status) {
      case 'vip': return 'var(--enigma-accent)';
      case 'regular': return 'var(--enigma-primary)';
      case 'nuevo': return 'var(--enigma-secondary)';
      case 'inactivo': return 'var(--enigma-neutral-500)';
      default: return 'var(--enigma-neutral-500)';
    }
  };

  const getStatusLabel = (customer: Cliente): string => {
    if (customer.vip_status) return 'VIP';
    
    const ahora = new Date();
    const registro = new Date(customer.fecha_creacion);
    const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
    
    if (registro > unMesAtras) return 'Nuevo';
    
    if (!customer.ultima_visita) return 'Inactivo';
    
    const ultimaVisita = new Date(customer.ultima_visita);
    const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
    
    if (ultimaVisita < tresMesesAtras) return 'Inactivo';
    return 'Regular';
  };

  const getStatusIcon = (customer: Cliente) => {
    if (customer.vip_status) return Crown;
    
    const ahora = new Date();
    const registro = new Date(customer.fecha_creacion);
    const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
    
    if (registro > unMesAtras) return Sparkles;
    
    if (!customer.ultima_visita) return AlertTriangle;
    
    const ultimaVisita = new Date(customer.ultima_visita);
    const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
    
    if (ultimaVisita < tresMesesAtras) return Clock;
    return CheckCircle;
  };

  const getCustomerStatus = (customer: Cliente): 'vip' | 'regular' | 'nuevo' | 'inactivo' => {
    if (customer.vip_status) return 'vip';
    
    const ahora = new Date();
    const registro = new Date(customer.fecha_creacion);
    const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
    
    if (registro > unMesAtras) return 'nuevo';
    
    if (!customer.ultima_visita) return 'inactivo';
    
    const ultimaVisita = new Date(customer.ultima_visita);
    const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
    
    if (ultimaVisita < tresMesesAtras) return 'inactivo';
    return 'regular';
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    color, 
    icon: Icon 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }) => (
    <div className="bg-white rounded-ios-lg p-6 shadow-ios border border-enigma-neutral-200 relative overflow-hidden ios-hover-lift transition-all duration-300">
      <div 
        className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-ios"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <h3 className="ios-text-footnote font-semibold uppercase tracking-wide text-enigma-neutral-500 mb-2">
        {title}
      </h3>
      <div className="ios-text-title1 font-bold text-enigma-neutral-900 mb-1">
        {value}
      </div>
      <p className="ios-text-footnote text-enigma-neutral-500 m-0">
        {subtitle}
      </p>
    </div>
  );

  const CustomerModal = () => {
    if (!showModal || !selectedCustomer) return null;

    const status = getCustomerStatus(selectedCustomer);
    const statusColor = getStatusColor(status);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5 backdrop-blur-sm">
        <div className="bg-white rounded-ios-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-ios-2xl flex flex-col animate-scale-in">
          {/* Modal Header */}
          <div 
            className="p-6 border-b border-enigma-neutral-200 relative"
            style={{ background: `linear-gradient(135deg, ${statusColor}15, ${statusColor}05)` }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-enigma-neutral-500 hover:bg-enigma-neutral-100 transition-colors ios-touch-feedback"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-ios"
                style={{ background: `linear-gradient(135deg, ${statusColor}, ${statusColor}80)` }}
              >
                {selectedCustomer.nombre.charAt(0)}{selectedCustomer.apellido.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="ios-text-title1 font-bold text-enigma-neutral-900 mb-1">
                  {selectedCustomer.nombre} {selectedCustomer.apellido}
                </h2>
                <IOSBadge 
                  variant="custom" 
                  className="mb-2 text-white text-xs px-3 py-1"
                  style={{ backgroundColor: statusColor }}
                >
                  {getStatusLabel(selectedCustomer)}
                </IOSBadge>
                <div className="flex gap-5 ios-text-footnote text-enigma-neutral-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedCustomer.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedCustomer.telefono}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-5">
              
              {/* Customer Stats */}
              <div className="bg-enigma-neutral-50 rounded-ios p-5">
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                  Estadísticas del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="ios-text-title2 font-bold text-enigma-primary mb-1">
                      0
                    </div>
                    <div className="ios-text-caption1 text-enigma-neutral-500">
                      Visitas totales
                    </div>
                  </div>
                  <div>
                    <div className="ios-text-title2 font-bold text-enigma-accent mb-1">
                      0
                    </div>
                    <div className="ios-text-caption1 text-enigma-neutral-500">
                      Reservas
                    </div>
                  </div>
                  <div>
                    <div className="ios-text-title2 font-bold text-enigma-secondary mb-1">
                      N/A
                    </div>
                    <div className="ios-text-caption1 text-enigma-neutral-500">
                      Estancia media
                    </div>
                  </div>
                  <div>
                    <div className="ios-text-title2 font-bold text-enigma-neutral-600 mb-1">
                      N/A
                    </div>
                    <div className="ios-text-caption1 text-enigma-neutral-500">
                      Mesa favorita
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-enigma-neutral-50 rounded-ios p-5">
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="ios-text-callout text-enigma-neutral-500 font-medium">
                      Cliente desde: 
                    </span>
                    <span className="ios-text-callout text-enigma-neutral-900 ml-2 flex items-center gap-1">
                      <Calendar size={14} className="text-enigma-neutral-500" />
                      {format(new Date(selectedCustomer.fecha_creacion), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  {selectedCustomer.ultima_visita && (
                    <div>
                      <span className="ios-text-callout text-enigma-neutral-500 font-medium">
                        Última visita: 
                      </span>
                      <span className="ios-text-callout text-enigma-neutral-900 ml-2 flex items-center gap-1">
                        <Calendar size={14} className="text-enigma-neutral-500" />
                        {format(new Date(selectedCustomer.ultima_visita), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="ios-text-callout text-enigma-neutral-500 font-medium">
                      Idioma preferido: 
                    </span>
                    <span className="ios-text-callout text-enigma-neutral-900 ml-2 flex items-center gap-1">
                      <Globe size={14} className="text-enigma-neutral-500" />
                      {selectedCustomer.idioma_preferido === 'es' ? 'Español' : selectedCustomer.idioma_preferido}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              {selectedCustomer.preferencias_dieteticas && selectedCustomer.preferencias_dieteticas.length > 0 && (
                <div className="bg-enigma-neutral-50 rounded-ios p-5">
                  <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                    Preferencias Dietéticas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.preferencias_dieteticas.map((pref, index) => (
                      <span 
                        key={index}
                        className="bg-enigma-secondary/20 text-enigma-secondary px-3 py-1 rounded-ios text-xs font-medium border border-enigma-secondary/30"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              
              {/* Recent Activity Placeholder */}
              <div className="bg-enigma-neutral-50 rounded-ios p-5 flex-1">
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                  Historial de Reservas
                </h3>
                <div className="text-center py-8 text-enigma-neutral-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">Sin historial de reservas disponible</p>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notas_privadas && (
                <div className="bg-enigma-neutral-50 rounded-ios p-5">
                  <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4">
                    Notas del Cliente
                  </h3>
                  <p className="ios-text-callout text-enigma-neutral-900 leading-relaxed bg-white p-3 rounded-ios border border-enigma-neutral-200">
                    {selectedCustomer.notas_privadas}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-5 border-t border-enigma-neutral-200 bg-enigma-neutral-50 flex gap-3 justify-end">
            <IOSButton 
              variant="outline" 
              onClick={() => setShowModal(false)}
              className="border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-100"
            >
              Cerrar
            </IOSButton>
            <IOSButton 
              variant="primary" 
              onClick={() => handleNewReservation(selectedCustomer.id)}
              className="flex items-center gap-2 bg-enigma-primary hover:bg-enigma-primary/90"
            >
              <Calendar className="h-4 w-4" />
              Nueva Reserva
            </IOSButton>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enigma-primary"></div>
      </div>
    );
  }

  // Show enhanced profile if selected
  if (showEnhancedProfile && enhancedCustomer) {
    return (
      <EnhancedCustomerProfile
        customer={enhancedCustomer}
        onBack={() => setShowEnhancedProfile(false)}
        onEdit={handleEditCustomer}
        onNewReservation={handleNewReservation}
        onAddNote={handleAddNote}
        onUpdateTags={handleUpdateCustomerTags}
      />
    );
  }

  return (
    <div className="bg-ios-background min-h-screen font-sf">
      {/* iOS Native Header */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
                Gestión de Clientes
              </h1>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Base de Datos • {new Date().toLocaleTimeString('es-ES')} • {customers.length} clientes registrados
              </p>
            </div>
            
            <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
              <DialogTrigger asChild>
                <IOSButton 
                  variant="outline"
                  className="border-2"
                  style={{ 
                    backgroundColor: '#237584',
                    borderColor: '#237584',
                    color: 'white'
                  }}
                >
                  <Plus size={20} />
                  <span className="ml-2">Nuevo Cliente</span>
                </IOSButton>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <NewCustomerForm onClose={() => setShowNewCustomerForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-6">
        {/* Control Panel */}
        <IOSCard variant="elevated" className="overflow-hidden">
          <IOSCardContent className="p-0">
            {/* Search and Actions Bar */}
            <div className="p-4 md:p-6 border-b border-enigma-neutral-200/50">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-enigma-neutral-100/50 border-0 ios-text-body outline-none transition-all focus:bg-white focus:shadow-ios placeholder-enigma-neutral-400"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <IOSButton
                    variant={showAdvancedFilters ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-4 py-3 ${showAdvancedFilters ? 'bg-enigma-primary text-white shadow-ios' : 'text-enigma-neutral-600 hover:bg-enigma-neutral-100'}`}
                  >
                    <Filter size={18} />
                  </IOSButton>
                  
                  <IOSButton
                    variant={showAnalytics ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`px-4 py-3 ${showAnalytics ? 'bg-enigma-primary text-white shadow-ios' : 'text-enigma-neutral-600 hover:bg-enigma-neutral-100'}`}
                  >
                    <BarChart3 size={18} />
                    <span className="hidden md:inline ml-2">Analytics</span>
                  </IOSButton>
                  
                  <IOSButton
                    variant={showTagging ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setShowTagging(!showTagging)}
                    className={`px-4 py-3 ${showTagging ? 'bg-enigma-secondary text-white shadow-ios' : 'text-enigma-neutral-600 hover:bg-enigma-neutral-100'}`}
                  >
                    <Settings size={18} />
                    <span className="hidden md:inline ml-2">Etiquetas</span>
                  </IOSButton>
                </div>
              </div>
            </div>

            {/* Segment Filters */}
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-enigma-primary" />
                <span className="ios-text-callout font-semibold text-enigma-neutral-900">Filtrar por estado</span>
              </div>
              
              <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
                {[
                  { key: 'todos', label: 'Todos', icon: Users, count: stats?.total || 0, color: '#8E8E93' },
                  { key: 'vip', label: 'VIP', icon: Crown, count: stats?.vip || 0, color: '#CB5910' },
                  { key: 'activos', label: 'Activos', icon: CheckCircle, count: stats?.activos || 0, color: '#237584' },
                  { key: 'nuevos', label: 'Nuevos', icon: Sparkles, count: stats?.nuevos || 0, color: '#9FB289' },
                ].map((filter) => {
                  const IconComponent = filter.icon;
                  const isActive = filters.segment === filter.key;
                  
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setFilters({ ...filters, segment: filter.key as CustomerFilters['segment'] })}
                      className={`flex items-center justify-center gap-2 px-3 md:px-4 py-3 rounded-2xl text-sm font-medium transition-all ios-touch-feedback whitespace-nowrap min-h-[48px] ${
                        isActive
                          ? 'text-white shadow-ios'
                          : 'text-enigma-neutral-700 bg-enigma-neutral-100/50 hover:bg-enigma-neutral-200/50'
                      }`}
                      style={isActive ? { backgroundColor: filter.color } : {}}
                    >
                      <IconComponent size={16} />
                      <span className="hidden md:inline">{filter.label}</span>
                      <IOSBadge
                        variant="custom"
                        size="sm"
                        className={isActive 
                          ? 'bg-white/25 text-white border-white/30' 
                          : 'text-enigma-neutral-600'
                        }
                        style={!isActive ? { backgroundColor: `${filter.color}20`, color: filter.color } : {}}
                      >
                        {filter.count}
                      </IOSBadge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Mode Selector */}
            <div className="p-4 md:p-6 border-t border-enigma-neutral-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid size={16} className="text-enigma-primary" />
                  <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                    {customers.length} Cliente{customers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 bg-enigma-neutral-100/50 rounded-2xl p-1">
                  {[
                    { key: 'grid', icon: Grid, label: 'Tarjetas' },
                    { key: 'list', icon: List, label: 'Lista' }
                  ].map(view => {
                    const IconComponent = view.icon;
                    return (
                      <IOSButton
                        key={view.key}
                        variant={currentView === view.key ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentView(view.key as any)}
                        className={`px-3 md:px-4 py-2 rounded-xl ${
                          currentView === view.key 
                            ? 'bg-enigma-primary text-white shadow-ios' 
                            : 'text-enigma-neutral-600 hover:bg-white/50'
                        }`}
                      >
                        <IconComponent size={16} />
                        <span className="hidden md:inline ml-2">{view.label}</span>
                      </IOSButton>
                    );
                  })}
                </div>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        {/* Quick Tag Filters */}
        {customerTags.length > 0 && (
          <TaggingSystem
            tags={customerTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onTagCreate={handleTagCreate}
            onTagUpdate={handleTagUpdate}
            onTagDelete={handleTagDelete}
            onBulkTagCustomers={() => {}}
            customerCount={customers.length}
            isCompact={true}
          />
        )}
      </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <RealCustomerAnalytics
            customers={customers}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}

        {/* Tagging System */}
        {showTagging && (
          <TaggingSystem
            tags={customerTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onTagCreate={handleTagCreate}
            onTagUpdate={handleTagUpdate}
            onTagDelete={handleTagDelete}
            onBulkTagCustomers={() => {}}
            customerCount={customers.length}
          />
        )}

        {/* Stats Overview */}
        {!showAnalytics && !showTagging && (
          <div className="space-y-8 mt-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
                <IOSCardContent className="enigma-spacing-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                        Total Clientes
                      </p>
                      <p className="ios-text-title1 font-bold mb-1" style={{ color: '#237584' }}>
                        {stats?.total || 0}
                      </p>
                      <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                        registrados
                      </p>
                    </div>
                    <div 
                      className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                      style={{ backgroundColor: '#23758415' }}
                    >
                      <Users size={28} color="#237584" />
                    </div>
                  </div>
                </IOSCardContent>
              </IOSCard>

              <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
                <IOSCardContent className="enigma-spacing-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                        Clientes VIP
                      </p>
                      <p className="ios-text-title1 font-bold mb-1" style={{ color: '#CB5910' }}>
                        {stats?.vip || 0}
                      </p>
                      <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                        premium
                      </p>
                    </div>
                    <div 
                      className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                      style={{ backgroundColor: '#CB591015' }}
                    >
                      <Crown size={28} color="#CB5910" />
                    </div>
                  </div>
                </IOSCardContent>
              </IOSCard>

              <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
                <IOSCardContent className="enigma-spacing-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                        Nuevos Este Mes
                      </p>
                      <p className="ios-text-title1 font-bold mb-1" style={{ color: '#9FB289' }}>
                        {stats?.nuevos || 0}
                      </p>
                      <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                        este período
                      </p>
                    </div>
                    <div 
                      className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                      style={{ backgroundColor: '#9FB28915' }}
                    >
                      <Sparkles size={28} color="#9FB289" />
                    </div>
                  </div>
                </IOSCardContent>
              </IOSCard>

              <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
                <IOSCardContent className="enigma-spacing-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                        Tasa Retención
                      </p>
                      <p className="ios-text-title1 font-bold mb-1" style={{ color: '#6B7280' }}>
                        {stats?.retencion || 0}%
                      </p>
                      <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                        promedio
                      </p>
                    </div>
                    <div 
                      className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
                      style={{ backgroundColor: '#6B728015' }}
                    >
                      <Zap size={28} color="#6B7280" />
                    </div>
                  </div>
                </IOSCardContent>
              </IOSCard>
            </div>

            {/* Customer List */}
            <IOSCard variant="elevated" className="overflow-hidden">
              <IOSCardContent className="p-0">
                <MultipleViewModes
                  customers={customers}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  onCustomerClick={handleCustomerClick}
                  onCustomerEdit={handleEditCustomer}
                  onCustomerDelete={handleDeleteCustomer}
                  isLoading={isLoading}
                />
              </IOSCardContent>
            </IOSCard>
          </div>
        )}

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        onSaveFilter={handleSaveFilter}
        savedFilters={savedFilters}
        onLoadFilter={handleLoadFilter}
        onDeleteFilter={handleDeleteFilter}
        activeFilters={advancedFilters}
      />

      <CustomerModal />
    </div>
  );
}
