
import React, { useState, useMemo } from 'react';
import { useCustomersEnhanced, useCustomerStats, useUpdateCustomer, useToggleVIPStatus } from '@/hooks/useCustomersEnhanced';
import { useNavigate } from 'react-router-dom';
import { Cliente } from '@/types/database';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Calendar, Phone, Mail, MapPin, Star, Users, BarChart3, Search, Plus, X, Edit, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NewCustomerForm } from '@/components/features/NewCustomerForm';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';

interface CustomerFilters {
  searchTerm: string;
  segment: 'todos' | 'vip' | 'nuevos' | 'activos' | 'inactivos';
}

export function EnhancedCustomerManagement() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [filters, setFilters] = useState<CustomerFilters>({
    searchTerm: '',
    segment: 'todos'
  });

  // Data hooks
  const { data: customers = [], isLoading } = useCustomersEnhanced(filters);
  const { data: stats } = useCustomerStats();
  const updateCustomer = useUpdateCustomer();
  const toggleVIP = useToggleVIPStatus();

  const getStatusColor = (status: 'vip' | 'regular' | 'nuevo' | 'inactivo'): string => {
    switch(status) {
      case 'vip': return '#CB5910';
      case 'regular': return '#237584';
      case 'nuevo': return '#9FB289';
      case 'inactivo': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (customer: Cliente): string => {
    if (customer.vip_status) return '👑 VIP';
    
    const ahora = new Date();
    const registro = new Date(customer.fecha_creacion);
    const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
    
    if (registro > unMesAtras) return '🆕 Nuevo';
    
    if (!customer.ultima_visita) return '💤 Inactivo';
    
    const ultimaVisita = new Date(customer.ultima_visita);
    const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
    
    if (ultimaVisita < tresMesesAtras) return '💤 Inactivo';
    return '⭐ Regular';
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

  const handleCustomerClick = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleNewReservation = (customer: Cliente) => {
    navigate(`/reservas/nueva?cliente=${customer.id}`);
    setShowModal(false);
  };

  const handleToggleVIP = async (customer: Cliente) => {
    try {
      await toggleVIP.mutateAsync({ 
        id: customer.id, 
        vipStatus: !customer.vip_status 
      });
    } catch (error) {
      console.error('Error al cambiar estado VIP:', error);
    }
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
    icon: any;
  }) => (
    <div className="bg-white rounded-ios-lg p-6 shadow-ios border border-enigma-neutral-200 relative overflow-hidden">
      <div 
        className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <h3 className="ios-text-footnote font-semibold uppercase tracking-wide text-enigma-neutral-500 mb-2">
        {title}
      </h3>
      <div className="ios-text-title1 font-bold text-black mb-1">
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
        <div className="bg-white rounded-ios-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-ios-xl flex flex-col">
          {/* Modal Header */}
          <div 
            className="p-6 border-b border-enigma-neutral-200 relative"
            style={{ background: `linear-gradient(135deg, ${statusColor}15, ${statusColor}05)` }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-enigma-neutral-500 hover:bg-enigma-neutral-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: `linear-gradient(135deg, ${statusColor}, ${statusColor}80)` }}
              >
                {selectedCustomer.nombre.charAt(0)}{selectedCustomer.apellido.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="ios-text-title1 font-bold text-black mb-1">
                  {selectedCustomer.nombre} {selectedCustomer.apellido}
                </h2>
                <IOSBadge 
                  variant="custom" 
                  className="mb-2"
                  style={{ backgroundColor: statusColor, color: 'white' }}
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
                <h3 className="ios-text-headline font-semibold text-black mb-4">
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
                <h3 className="ios-text-headline font-semibold text-black mb-4">
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="ios-text-callout text-enigma-neutral-500 font-medium">
                      Cliente desde: 
                    </span>
                    <span className="ios-text-callout text-black ml-2">
                      📅 {format(new Date(selectedCustomer.fecha_creacion), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  {selectedCustomer.ultima_visita && (
                    <div>
                      <span className="ios-text-callout text-enigma-neutral-500 font-medium">
                        Última visita: 
                      </span>
                      <span className="ios-text-callout text-black ml-2">
                        📅 {format(new Date(selectedCustomer.ultima_visita), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="ios-text-callout text-enigma-neutral-500 font-medium">
                      Idioma preferido: 
                    </span>
                    <span className="ios-text-callout text-black ml-2">
                      🌐 {selectedCustomer.idioma_preferido === 'es' ? 'Español' : selectedCustomer.idioma_preferido}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              {selectedCustomer.preferencias_dieteticas && selectedCustomer.preferencias_dieteticas.length > 0 && (
                <div className="bg-enigma-neutral-50 rounded-ios p-5">
                  <h3 className="ios-text-headline font-semibold text-black mb-4">
                    Preferencias Dietéticas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.preferencias_dieteticas.map((pref, index) => (
                      <span 
                        key={index}
                        className="bg-enigma-secondary/20 text-enigma-secondary px-3 py-1 rounded-ios text-xs font-medium"
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
                <h3 className="ios-text-headline font-semibold text-black mb-4">
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
                  <h3 className="ios-text-headline font-semibold text-black mb-4">
                    Notas del Cliente
                  </h3>
                  <p className="ios-text-callout text-black leading-relaxed bg-white p-3 rounded-ios border border-enigma-neutral-200">
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
            >
              Cerrar
            </IOSButton>
            <IOSButton 
              variant="primary" 
              onClick={() => handleNewReservation(selectedCustomer)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Nueva Reserva
            </IOSButton>
            <IOSButton 
              variant={selectedCustomer.vip_status ? "accent" : "secondary"}
              onClick={() => handleToggleVIP(selectedCustomer)}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              {selectedCustomer.vip_status ? 'Quitar VIP' : 'Hacer VIP'}
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

  return (
    <div className="bg-ios-background min-h-screen font-sf">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-ios border-b border-enigma-neutral-200 px-6 py-5 sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="ios-text-large-title font-bold text-black m-0">
              Gestión de Clientes
            </h1>
            <p className="ios-text-callout text-enigma-neutral-500 mt-1 m-0">
              Base de datos de clientes y preferencias
            </p>
          </div>
          
          <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
            <DialogTrigger asChild>
              <IOSButton variant="primary" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nuevo Cliente
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

        {/* Search and Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-ios-lg border-2 border-enigma-neutral-200 ios-text-body outline-none transition-all focus:border-enigma-primary"
            />
          </div>
          
          <div className="flex bg-enigma-neutral-100 rounded-ios-lg p-1">
            {[
              { key: 'todos', label: 'Todos', count: stats?.total || 0 },
              { key: 'vip', label: '👑 VIP', count: stats?.vip || 0 },
              { key: 'activos', label: '⭐ Activos', count: stats?.activos || 0 },
              { key: 'nuevos', label: '🆕 Nuevos', count: stats?.nuevos || 0 },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilters({ ...filters, segment: filter.key as any })}
                className={`px-4 py-2 rounded-ios text-sm font-semibold transition-all flex items-center gap-2 ${
                  filters.segment === filter.key
                    ? 'bg-enigma-primary text-white'
                    : 'text-black hover:bg-enigma-neutral-200'
                }`}
              >
                {filter.label}
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  filters.segment === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-enigma-primary/20 text-enigma-primary'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Clientes"
            value={stats?.total || 0}
            subtitle="En base de datos"
            color="#237584"
            icon={Users}
          />
          <StatCard
            title="Clientes VIP"
            value={stats?.vip || 0}
            subtitle="Clientes premium"
            color="#CB5910"
            icon={Star}
          />
          <StatCard
            title="Nuevos (Este Mes)"
            value={stats?.nuevos || 0}
            subtitle="Registros recientes"
            color="#9FB289"
            icon={User}
          />
          <StatCard
            title="Tasa Retención"
            value={`${stats?.retencion || 0}%`}
            subtitle="Clientes activos"
            color="#6B7280"
            icon={BarChart3}
          />
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-ios-xl p-6 shadow-ios border border-enigma-neutral-200">
          <div className="flex justify-between items-center mb-5">
            <h2 className="ios-text-title2 font-semibold text-black m-0">
              Lista de Clientes
            </h2>
            <span className="ios-text-callout text-enigma-neutral-500">
              {customers.length} clientes mostrados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => {
              const status = getCustomerStatus(customer);
              const statusColor = getStatusColor(status);
              
              return (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  className="bg-enigma-neutral-50 rounded-ios-lg p-5 border-2 border-transparent cursor-pointer transition-all ios-touch-feedback hover:shadow-ios-lg"
                  style={{
                    '--hover-border-color': statusColor
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = statusColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: `linear-gradient(135deg, ${statusColor}, ${statusColor}80)` }}
                    >
                      {customer.nombre.charAt(0)}{customer.apellido.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="ios-text-callout font-semibold text-black mb-1">
                        {customer.nombre} {customer.apellido}
                      </h3>
                      <IOSBadge 
                        variant="custom"
                        style={{ backgroundColor: statusColor, color: 'white', fontSize: '10px' }}
                      >
                        {getStatusLabel(customer)}
                      </IOSBadge>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    <div className="ios-text-caption1 text-enigma-neutral-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                    <div className="ios-text-caption1 text-enigma-neutral-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.telefono}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="ios-text-callout font-bold" style={{ color: statusColor }}>
                        {format(new Date(customer.fecha_creacion), 'MMM yyyy', { locale: es })}
                      </div>
                      <div className="ios-text-caption2 text-enigma-neutral-500">
                        Registro
                      </div>
                    </div>
                    <div>
                      <div className="ios-text-callout font-bold" style={{ color: statusColor }}>
                        {customer.ultima_visita ? 
                          formatDistanceToNow(new Date(customer.ultima_visita), { locale: es }) : 
                          'Nunca'
                        }
                      </div>
                      <div className="ios-text-caption2 text-enigma-neutral-500">
                        Última visita
                      </div>
                    </div>
                    <div>
                      <div className="ios-text-callout font-bold" style={{ color: statusColor }}>
                        {customer.idioma_preferido?.toUpperCase() || 'ES'}
                      </div>
                      <div className="ios-text-caption2 text-enigma-neutral-500">
                        Idioma
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {customers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-enigma-neutral-300" />
              <h3 className="ios-text-headline font-medium text-enigma-neutral-600 mb-2">
                No se encontraron clientes
              </h3>
              <p className="ios-text-callout text-enigma-neutral-500">
                {filters.searchTerm ? 
                  `No hay clientes que coincidan con "${filters.searchTerm}"` :
                  'Aún no hay clientes registrados'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      <CustomerModal />
    </div>
  );
}
