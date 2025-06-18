import { useState } from 'react';
import { 
  Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, 
  AlertCircle, UserCheck, Coffee, Star, Plus, Search, Filter,
  Eye, Edit, Trash2, PhoneCall, MessageSquare,
  ChevronRight, Crown, AlertTriangle, CheckSquare, XCircle, User, FileText
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { SearchInput } from '@/components/forms/SearchInput';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModifyReservationModal } from '@/components/modals/ModifyReservationModal';
import { CancelReservationModal } from '@/components/modals/CancelReservationModal';
import { NewReservationForm } from '@/components/forms/NewReservationForm';
import { useReservations, useUpdateReservation } from '@/hooks/useReservations';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const StatCard = ({ title, value, subtitle, color, icon: Icon, trend }) => (
  <IOSCard variant="elevated" className="ios-touch-feedback transition-all duration-200 hover:scale-102">
    <IOSCardContent className="enigma-spacing-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="ios-text-title1 font-bold mb-1" style={{ color }}>
            {value}
          </p>
          <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
            {subtitle}
          </p>
        </div>
        <div 
          className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={28} color={color} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 pt-4 border-t border-enigma-neutral-200">
          <span 
            className={`ios-text-caption1 font-bold ${trend > 0 ? 'text-ios-green' : 'text-ios-red'}`}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="ios-text-caption1 text-enigma-neutral-500 ml-2">vs ayer</span>
        </div>
      )}
    </IOSCardContent>
  </IOSCard>
);

const QuickActionCard = ({ title, description, color, icon: Icon, count, action }) => (
  <IOSCard 
    variant="glass" 
    className="ios-touch-feedback cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-ios-lg"
    onClick={action}
  >
    <IOSCardContent className="enigma-spacing-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
            style={{ backgroundColor: color }}
          >
            <Icon size={22} color="#FFFFFF" />
          </div>
          <div className="flex-1">
            <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-1">
              {title}
            </h3>
            <p className="ios-text-footnote text-enigma-neutral-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {count !== undefined && (
            <IOSBadge 
              variant="custom"
              className="px-3 py-1 rounded-ios text-white font-bold ios-text-caption1"
              style={{ backgroundColor: color }}
            >
              {count}
            </IOSBadge>
          )}
          <ChevronRight size={18} className="text-enigma-neutral-400" />
        </div>
      </div>
    </IOSCardContent>
  </IOSCard>
);

export default function Reservas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNewReservationForm, setShowNewReservationForm] = useState(false);

  const { data: reservas, isLoading, refetch } = useReservations({
    fecha_inicio: dateFilter === 'today' ? new Date().toISOString().split('T')[0] : undefined,
    fecha_fin: dateFilter === 'today' ? new Date().toISOString().split('T')[0] : undefined,
    estado: statusFilter !== 'all' ? statusFilter : undefined
  });

  const updateReservation = useUpdateReservation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-ios-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmada': return '#9FB289';
      case 'pendiente_confirmacion': return '#FF9500';
      case 'completada': return '#34C759';
      case 'cancelada_usuario': return '#6B7280';
      case 'cancelada_restaurante': return '#6B7280';
      case 'no_show': return '#FF3B30';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente_confirmacion': return 'Pendiente';
      case 'completada': return 'Completada';
      case 'cancelada_usuario': return 'Cancelada';
      case 'cancelada_restaurante': return 'Cancelada';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmada': return CheckCircle;
      case 'pendiente_confirmacion': return Clock;
      case 'completada': return CheckSquare;
      case 'cancelada_usuario': return XCircle;
      case 'cancelada_restaurante': return XCircle;
      case 'no_show': return AlertTriangle;
      default: return AlertCircle;
    }
  };

  // Filtrar reservas
  const reservasFiltradas = reservas?.filter(reserva => {
    if (!searchTerm && statusFilter === 'all' && dateFilter === 'today') return true;
    
    let matchesSearch = true;
    let matchesStatus = true;
    let matchesDate = true;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = (
        reserva.clientes?.nombre.toLowerCase().includes(searchLower) ||
        reserva.clientes?.apellido.toLowerCase().includes(searchLower) ||
        reserva.clientes?.email.toLowerCase().includes(searchLower) ||
        reserva.clientes?.telefono.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      matchesStatus = reserva.estado_reserva === statusFilter;
    }

    if (dateFilter !== 'all') {
      const reservaDate = parseISO(reserva.fecha_reserva);
      switch(dateFilter) {
        case 'today':
          matchesDate = isToday(reservaDate);
          break;
        case 'tomorrow':
          matchesDate = isTomorrow(reservaDate);
          break;
        case 'week':
          matchesDate = isThisWeek(reservaDate);
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  // Calcular estadísticas
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservas?.filter(r => r.fecha_reserva === today) || [];
    
    return {
      total: todayReservations.length,
      confirmed: todayReservations.filter(r => r.estado_reserva === 'confirmada').length,
      pending: todayReservations.filter(r => r.estado_reserva === 'pendiente_confirmacion').length,
      completed: todayReservations.filter(r => r.estado_reserva === 'completada').length,
      cancelled: todayReservations.filter(r => ['cancelada_usuario', 'cancelada_restaurante', 'no_show'].includes(r.estado_reserva)).length,
      totalGuests: todayReservations.reduce((sum, r) => sum + r.numero_comensales, 0),
      vipCount: todayReservations.filter(r => r.clientes?.vip_status).length,
    };
  };

  const stats = getStats();

  const handleReservationClick = (reserva) => {
    setSelectedReservation(reserva);
    setShowModal(true);
  };

  const handleConfirmReservation = async (reserva) => {
    try {
      await updateReservation.mutateAsync({
        id: reserva.id,
        estado_reserva: 'confirmada'
      });
      
      toast({
        title: "Reserva confirmada",
        description: `La reserva de ${reserva.clientes?.nombre} ha sido confirmada`,
      });
      
      refetch();
      setShowModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo confirmar la reserva",
        variant: "destructive",
      });
    }
  };

  const handleCallClient = (reserva) => {
    const phoneNumber = reserva.clientes?.telefono;
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
      toast({
        title: "Llamando al cliente",
        description: `Iniciando llamada a ${reserva.clientes?.nombre}`,
      });
    } else {
      toast({
        title: "Error",
        description: "No hay número de teléfono disponible",
        variant: "destructive",
      });
    }
  };

  const handleSendWhatsApp = (reserva) => {
    const phoneNumber = reserva.clientes?.telefono;
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Hola ${reserva.clientes?.nombre}, te contactamos desde Enigma Cocina con Alma sobre tu reserva del ${reserva.fecha_reserva} a las ${reserva.hora_reserva}.`
      );
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "WhatsApp abierto",
        description: `Enviando mensaje a ${reserva.clientes?.nombre}`,
      });
    } else {
      toast({
        title: "Error",
        description: "No hay número de teléfono disponible",
        variant: "destructive",
      });
    }
  };

  const handleModifyReservation = (reserva) => {
    setSelectedReservation(reserva);
    setShowModal(false);
    setShowModifyModal(true);
  };

  const handleCancelReservation = (reserva) => {
    setSelectedReservation(reserva);
    setShowModal(false);
    setShowCancelModal(true);
  };

  const handleModalSuccess = () => {
    refetch();
    setSelectedReservation(null);
  };

  const handleNewReservation = () => {
    setShowNewReservationForm(true);
  };

  const handleNewReservationSuccess = () => {
    refetch();
    setShowNewReservationForm(false);
  };

  const ReservationModal = () => {
    if (!showModal || !selectedReservation) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5 backdrop-blur-ios">
        <IOSCard variant="elevated" className="max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-ios-2xl animate-scale-in">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-enigma-primary/5 to-enigma-secondary/5 p-8 border-b border-enigma-neutral-200/50">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-ios-lg bg-enigma-primary flex items-center justify-center shadow-ios">
                  <User size={28} color="#FFFFFF" />
                </div>
                <div>
                  <h2 className="ios-text-title1 font-bold text-enigma-neutral-900 mb-2">
                    {selectedReservation.clientes?.nombre} {selectedReservation.clientes?.apellido}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={selectedReservation.estado_reserva} />
                    {selectedReservation.clientes?.vip_status && (
                      <IOSBadge variant="custom" className="bg-enigma-accent/20 text-enigma-accent border-enigma-accent/30">
                        <Crown size={12} className="mr-1" />
                        <span className="ios-text-caption1 font-bold">VIP</span>
                      </IOSBadge>
                    )}
                  </div>
                </div>
              </div>
              <IOSButton 
                variant="ghost" 
                size="icon"
                onClick={() => setShowModal(false)}
                className="hover:bg-enigma-neutral-100"
              >
                <XCircle size={24} className="text-enigma-neutral-600" />
              </IOSButton>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-8 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información de Reserva */}
              <div>
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-5">
                  Detalles de Reserva
                </h3>
                
                <IOSCard variant="default" className="mb-5">
                  <IOSCardContent className="enigma-spacing-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="ios-text-footnote text-enigma-neutral-600 mb-1 font-medium">Fecha</p>
                        <p className="ios-text-callout font-semibold text-enigma-neutral-900">
                          {format(parseISO(selectedReservation.fecha_reserva), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="ios-text-footnote text-enigma-neutral-600 mb-1 font-medium">Hora</p>
                        <p className="ios-text-callout font-semibold text-enigma-neutral-900">
                          {selectedReservation.hora_reserva}
                        </p>
                      </div>
                      <div>
                        <p className="ios-text-footnote text-enigma-neutral-600 mb-1 font-medium">Comensales</p>
                        <p className="ios-text-callout font-semibold text-enigma-neutral-900">
                          {selectedReservation.numero_comensales} personas
                        </p>
                      </div>
                      <div>
                        <p className="ios-text-footnote text-enigma-neutral-600 mb-1 font-medium">Mesa</p>
                        <p className="ios-text-callout font-semibold text-enigma-neutral-900">
                          {selectedReservation.mesas?.numero_mesa || 'No asignada'}
                        </p>
                      </div>
                    </div>
                  </IOSCardContent>
                </IOSCard>

                <IOSCard variant="default">
                  <IOSCardContent className="enigma-spacing-md">
                    <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-3">Contacto</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail size={16} className="text-enigma-neutral-500" />
                        <span className="ios-text-footnote text-enigma-neutral-900">
                          {selectedReservation.clientes?.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone size={16} className="text-enigma-neutral-500" />
                        <span className="ios-text-footnote text-enigma-neutral-900">
                          {selectedReservation.clientes?.telefono}
                        </span>
                      </div>
                    </div>
                  </IOSCardContent>
                </IOSCard>
              </div>

              {/* Acciones Rápidas */}
              <div>
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-5">
                  Acciones Rápidas
                </h3>
                
                <div className="space-y-3">
                  {selectedReservation.estado_reserva === 'pendiente_confirmacion' && (
                    <IOSButton 
                      variant="primary" 
                      className="w-full justify-start bg-enigma-secondary hover:bg-enigma-secondary/90"
                      onClick={() => handleConfirmReservation(selectedReservation)}
                      disabled={updateReservation.isPending}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Confirmar Reserva
                    </IOSButton>
                  )}
                  
                  <IOSButton 
                    variant="outline" 
                    className="w-full justify-start border-enigma-primary text-enigma-primary hover:bg-enigma-primary hover:text-white"
                    onClick={() => handleCallClient(selectedReservation)}
                  >
                    <PhoneCall size={16} className="mr-2" />
                    Llamar Cliente
                  </IOSButton>
                  
                  <IOSButton 
                    variant="outline" 
                    className="w-full justify-start border-enigma-secondary text-enigma-secondary hover:bg-enigma-secondary hover:text-white"
                    onClick={() => handleSendWhatsApp(selectedReservation)}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Enviar WhatsApp
                  </IOSButton>
                  
                  <IOSButton 
                    variant="outline" 
                    className="w-full justify-start border-enigma-accent text-enigma-accent hover:bg-enigma-accent hover:text-white"
                    onClick={() => handleModifyReservation(selectedReservation)}
                  >
                    <Edit size={16} className="mr-2" />
                    Modificar Reserva
                  </IOSButton>
                  
                  {!['completada', 'cancelada_usuario', 'cancelada_restaurante'].includes(selectedReservation.estado_reserva) && (
                    <IOSButton 
                      variant="ghost" 
                      className="w-full justify-start text-ios-red hover:bg-ios-red/10"
                      onClick={() => handleCancelReservation(selectedReservation)}
                    >
                      <XCircle size={16} className="mr-2" />
                      Cancelar Reserva
                    </IOSButton>
                  )}
                </div>

                {selectedReservation.notas_cliente && (
                  <IOSCard variant="default" className="mt-6">
                    <IOSCardContent className="enigma-spacing-md">
                      <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-2 flex items-center">
                        <FileText size={16} className="mr-2 text-enigma-primary" />
                        Notas del Cliente
                      </h4>
                      <p className="ios-text-footnote text-enigma-neutral-700 leading-relaxed">
                        {selectedReservation.notas_cliente}
                      </p>
                    </IOSCardContent>
                  </IOSCard>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-ios-background border-t border-enigma-neutral-200/50 p-6 flex justify-end space-x-4">
            <IOSButton variant="outline" onClick={() => setShowModal(false)} className="border-enigma-neutral-300 text-enigma-neutral-600">
              Cerrar
            </IOSButton>
            <IOSButton variant="primary" className="bg-enigma-primary hover:bg-enigma-primary/90">
              Guardar Cambios
            </IOSButton>
          </div>
        </IOSCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-ios-background font-sf" style={{ padding: '24px' }}>
      {/* Static Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        border: '1px solid #E5E5EA',
        padding: '20px 24px',
        marginBottom: '24px',
        backdropFilter: 'blur(20px)',
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">Reservas</h1>
            <p className="ios-text-callout text-enigma-neutral-600 mt-1">
              Gestión completa de reservas del restaurante
            </p>
          </div>
          <IOSButton 
            variant="primary" 
            size="lg" 
            className="bg-enigma-primary hover:bg-enigma-primary/90"
            onClick={handleNewReservation}
          >
            <Plus size={20} className="mr-2" />
            Nueva Reserva
          </IOSButton>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Buscar por cliente, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              className="w-full"
            />
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-base ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary"
          >
            <option value="today">Hoy</option>
            <option value="tomorrow">Mañana</option>
            <option value="week">Esta semana</option>
            <option value="all">Todas las fechas</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base ios-text-callout rounded-ios border-enigma-neutral-300 focus:border-enigma-primary focus:ring-enigma-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente_confirmacion">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada_usuario">Canceladas</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-8">
        {/* Stats Overview */}
        <section>
          <h2 className="ios-text-title2 font-semibold text-enigma-neutral-900 mb-5">
            Resumen del Día
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Reservas Hoy"
              value={stats.total}
              subtitle={`${stats.totalGuests} comensales totales`}
              color="#237584"
              icon={Calendar}
              trend={12}
            />
            <StatCard
              title="Confirmadas"
              value={stats.confirmed}
              subtitle="Listas para el servicio"
              color="#9FB289"
              icon={CheckCircle}
              trend={5}
            />
            <StatCard
              title="Pendientes"
              value={stats.pending}
              subtitle="Requieren confirmación"
              color="#FF9500"
              icon={Clock}
              trend={-2}
            />
            <StatCard
              title="Clientes VIP"
              value={stats.vipCount}
              subtitle="Atención especial"
              color="#CB5910"
              icon={Crown}
              trend={25}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="ios-text-title2 font-semibold text-enigma-neutral-900 mb-5">
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QuickActionCard
              title="Pendientes de Confirmar"
              description="Reservas que necesitan confirmación"
              color="#FF9500"
              icon={Clock}
              count={stats.pending}
              action={() => setStatusFilter('pendiente_confirmacion')}
            />
            <QuickActionCard
              title="Próximas Llegadas"
              description="Clientes que llegan en los próximos 30 min"
              color="#007AFF"
              icon={UserCheck}
              count={3}
              action={() => {}}
            />
          </div>
        </section>

        {/* Lista de Reservas */}
        <section>
          <IOSCard variant="elevated" className="shadow-ios-lg">
            <IOSCardHeader className="border-b border-enigma-neutral-200/50">
              <IOSCardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-enigma-primary" size={20} />
                  <span className="ios-text-headline font-semibold">Lista de Reservas ({reservasFiltradas.length})</span>
                </div>
              </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="p-0">
              {reservasFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
                  <p className="ios-text-callout text-enigma-neutral-500">No se encontraron reservas</p>
                  <p className="ios-text-footnote text-enigma-neutral-400 mt-2">
                    Ajusta los filtros para ver más resultados
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-enigma-neutral-200/50">
                  {reservasFiltradas.map((reserva) => {
                    const StatusIcon = getStatusIcon(reserva.estado_reserva);
                    return (
                      <div
                        key={reserva.id}
                        onClick={() => handleReservationClick(reserva)}
                        className="p-5 hover:bg-enigma-neutral-50 transition-all duration-200 cursor-pointer ios-touch-feedback"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-ios bg-enigma-primary/10 flex items-center justify-center shadow-ios-sm">
                              <StatusIcon size={20} color={getStatusColor(reserva.estado_reserva)} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
                                  {reserva.clientes?.nombre} {reserva.clientes?.apellido}
                                </h3>
                                {reserva.clientes?.vip_status && (
                                  <Crown size={14} className="text-enigma-accent" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 ios-text-footnote text-enigma-neutral-600">
                                <span className="font-medium">
                                  {format(parseISO(reserva.fecha_reserva), "d MMM", { locale: es })}
                                </span>
                                <span className="font-medium">{reserva.hora_reserva}</span>
                                <span>{reserva.numero_comensales} personas</span>
                                {reserva.mesas && (
                                  <span className="text-enigma-primary font-medium">
                                    Mesa {reserva.mesas.numero_mesa}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <StatusBadge status={reserva.estado_reserva} />
                            <ChevronRight size={16} className="text-enigma-neutral-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </IOSCardContent>
          </IOSCard>
        </section>
      </main>

      <ReservationModal />
      
      {/* Modales de Modificación y Cancelación */}
      {selectedReservation && (
        <>
          <ModifyReservationModal
            reservation={selectedReservation}
            isOpen={showModifyModal}
            onClose={() => {
              setShowModifyModal(false);
              setSelectedReservation(null);
            }}
            onSuccess={handleModalSuccess}
          />
          
          <CancelReservationModal
            reservation={selectedReservation}
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
              setSelectedReservation(null);
            }}
            onSuccess={handleModalSuccess}
          />
        </>
      )}

      {/* New Reservation Form */}
      <NewReservationForm
        isOpen={showNewReservationForm}
        onClose={() => setShowNewReservationForm(false)}
        onSuccess={handleNewReservationSuccess}
      />
    </div>
  );
}
