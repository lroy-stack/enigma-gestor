import React, { useState, useEffect } from 'react';
import { useReservations, useNext24HoursReservations, useUpdateReservation } from '@/hooks/useReservations';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useTodayReservations, useRestaurantStats } from '@/hooks/useRestaurantStats';
import { useCustomers } from '@/hooks/useCustomers';
import { useHybridTodayStats } from '@/hooks/useAnalyticsSystem';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  BarChart3,
  Bell,
  User,
  ClipboardList,
  Activity,
  Star,
  Utensils,
  FileText,
  Tag,
  Check,
  Eye,
  X,
  Mail,
  MessageCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format, isToday, addHours, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSpainDate, getTodaySpain, formatSpainDate, isTodaySpain } from '@/utils/dateUtils';

type ActivityType = 'success' | 'info' | 'warning' | 'error';

export function EnhancedIOSDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data hooks - Priorizar sistema analítico
  const { data: hybridStats } = useHybridTodayStats();
  const { data: rawReservasHoy = [] } = useTodayReservations();
  const { data: next24HReservations = [] } = useNext24HoursReservations();
  const { data: tables = [] } = useTablesWithStates();
  const { data: restaurantStats = [] } = useRestaurantStats();
  const { data: allReservations = [] } = useReservations();
  const { data: customers = [] } = useCustomers();
  
  // Mutation hooks
  const updateReservationMutation = useUpdateReservation();

  // Update time every second using Spain timezone
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getSpainDate()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleReservationClick = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se abra el modal
    try {
      await updateReservationMutation.mutateAsync({
        id: reservationId,
        estado: newStatus,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, ''); // Remover caracteres no numéricos
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = (email: string) => {
    const emailUrl = `mailto:${email}`;
    window.open(emailUrl, '_blank');
  };

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar un toast de confirmación
      console.log(`${type} copiado al portapapeles: ${text}`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Procesar reservas de forma segura
  const reservasHoy = Array.isArray(rawReservasHoy) 
    ? rawReservasHoy.filter(reservation => 
        reservation && 
        typeof reservation === 'object' && 
        'estado' in reservation
      )
    : [];

  // Filtrar reservas válidas para hoy (excluir canceladas y no_show para el conteo principal)
  const todayReservations = reservasHoy.filter(reservation => 
    reservation.estado !== 'cancelada_usuario' && 
    reservation.estado !== 'cancelada_restaurante' &&
    reservation.estado !== 'no_show'
  );

  // Get upcoming reservations - desde ahora hasta las próximas 24 horas usando timezone de España
  const now = getSpainDate(); // Usar tiempo de España
  const next24Hours = addHours(now, 24);
  const upcomingReservations = next24HReservations
    .filter(reservation => {
      if (!reservation.hora_reserva || !reservation.fecha_reserva) return false;
      // Crear fecha usando timezone de España
      const reservaDateTime = new Date(`${reservation.fecha_reserva}T${reservation.hora_reserva}:00`);
      // Mostrar reservas desde ahora hasta las próximas 24 horas
      return isAfter(reservaDateTime, now) && isBefore(reservaDateTime, next24Hours);
    })
    .sort((a, b) => {
      // Ordenar por fecha y hora
      const dateA = `${a.fecha_reserva}T${a.hora_reserva}:00`;
      const dateB = `${b.fecha_reserva}T${b.hora_reserva}:00`;
      return dateA.localeCompare(dateB);
    })
    .slice(0, 8); // Mostrar hasta 8 reservas
  
  console.log(`📅 Dashboard - Fecha España: ${getTodaySpain()}`);
  console.log(`🕐 Dashboard - Hora España: ${format(getSpainDate(), 'yyyy-MM-dd HH:mm:ss')}`);
  console.log(`📊 Dashboard - Total reservas hoy SIN filtrar: ${rawReservasHoy.length}`);
  console.log(`📊 Dashboard - Total reservas hoy (filtradas): ${todayReservations.length}`);
  console.log(`📋 Dashboard - Estados SIN filtrar: ${rawReservasHoy.map(r => r.estado).join(', ')}`);
  console.log(`📋 Dashboard - Estados filtradas: ${todayReservations.map(r => r.estado).join(', ')}`);
  console.log(`🔍 Dashboard - Fechas reservas: ${todayReservations.map(r => `${r.fecha_reserva} ${r.hora_reserva}`).join(', ')}`);
  console.log(`🔍 Dashboard - Reservas 24h (total): ${next24HReservations.length}`);
  console.log(`⏰ Dashboard - Próximas reservas (filtradas): ${upcomingReservations.length}`);
  if (upcomingReservations.length > 0) {
    console.log(`📝 Dashboard - Lista próximas:`, upcomingReservations.map(r => `${r.nombre} - ${r.fecha_reserva} ${r.hora_reserva}`));
  }
  
  // Mostrar información del sistema híbrido
  if (hybridStats) {
    console.log(`🔎 Estadísticas híbridas (${hybridStats.source}):`, {
      total: hybridStats.total_reservas,
      confirmadas: hybridStats.confirmadas,
      pendientes: hybridStats.pendientes,
      comensales: hybridStats.total_comensales
    });
  }

  // Usar estadísticas híbridas si están disponibles, sino calcular desde reservas filtradas
  const completedReservations = hybridStats ? hybridStats.completadas : 
    todayReservations.filter(reservation => reservation.estado === 'completada').length;
  const activeReservations = hybridStats ? (hybridStats.confirmadas + hybridStats.pendientes) :
    todayReservations.filter(reservation => 
      reservation.estado === 'confirmada' || reservation.estado === 'pendiente'
    ).length;
  const noShows = hybridStats ? hybridStats.no_shows :
    reservasHoy.filter(reservation => reservation.estado === 'no_show').length;
  
  // Total de reservas válidas (excluyendo canceladas y no_shows para el conteo principal)
  const totalValidReservations = hybridStats ? 
    (hybridStats.total_reservas - hybridStats.canceladas - hybridStats.no_shows) :
    todayReservations.length;

  // Calculate occupancy by zone
  const zoneOccupancy = tables.reduce((acc, table) => {
    const zone = table.tipo_mesa || 'general';
    if (!acc[zone]) {
      acc[zone] = { total: 0, occupied: 0, available: 0, reserved: 0 };
    }
    acc[zone].total++;
    
    const estado = table.estado?.estado || 'libre';
    if (estado === 'ocupada') acc[zone].occupied++;
    else if (estado === 'reservada') acc[zone].reserved++;
    else if (estado === 'libre') acc[zone].available++;
    
    return acc;
  }, {} as Record<string, any>);

  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.estado?.estado === 'ocupada').length;
  const reservedTables = tables.filter(t => t.estado?.estado === 'reservada').length;
  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Recent activity (mock for now, but structure for real data)
  const recentActivity = [
    {
      id: '1',
      action: `Nueva reserva confirmada`,
      time: format(new Date(Date.now() - 300000), 'HH:mm'),
      type: 'success' as ActivityType
    },
    {
      id: '2',
      action: `Mesa liberada - Sala Principal`,
      time: format(new Date(Date.now() - 600000), 'HH:mm'),
      type: 'info' as ActivityType
    },
    {
      id: '3',
      action: `Cliente VIP registrado`,
      time: format(new Date(Date.now() - 900000), 'HH:mm'),
      type: 'success' as ActivityType
    }
  ];

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm:ss');
  };

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Función para obtener saludo dinámico basado en la hora
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 14) {
      return "¡Buenos días Equipo! 🌅";
    } else if (hour >= 14 && hour < 20) {
      return "¡Buenas tardes Equipo! ☀️";
    } else {
      return "¡Recta final Equipo! 🌙";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return '#34C759';
      case 'pendiente': return '#FF9500';
      case 'cancelada':
      case 'cancelada_usuario':
      case 'cancelada_restaurante': return '#FF3B30';
      case 'completada': return '#8E8E93';
      case 'no_show': return '#FF6B6B';
      default: return '#237584';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'cancelada_usuario': return 'Cancelada';
      case 'cancelada_restaurante': return 'Cancelada';
      case 'completada': return 'Completada';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'interior': return '#237584';
      case 'terraza_superior': return '#9FB289';
      case 'terraza_inferior': return '#CB5910';
      case 'barra': return '#64748B';
      default: return '#8B5CF6';
    }
  };

  const getZoneName = (zone: string) => {
    switch (zone) {
      case 'interior': return 'Sala Interior';
      case 'terraza_superior': return 'Terraza Superior';
      case 'terraza_inferior': return 'Terraza Inferior';
      case 'barra': return 'Área de Barra';
      default: return zone.charAt(0).toUpperCase() + zone.slice(1);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    color, 
    icon: Icon, 
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: any;
    trend?: number;
  }) => (
    <IOSCard 
      variant="elevated" 
      className="ios-touch-feedback transition-all duration-200 hover:scale-102 cursor-pointer"
    >
      <IOSCardContent className="enigma-spacing-md">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="ios-text-title1 font-bold text-enigma-neutral-900">
                {value}
              </span>
              {trend && (
                <span className={`ios-text-caption1 font-bold flex items-center ${
                  trend > 0 ? 'text-ios-green' : 'text-ios-red'
                }`}>
                  {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="ml-1">{Math.abs(trend)}%</span>
                </span>
              )}
            </div>
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
            <span className="ios-text-caption1 text-enigma-neutral-500">vs período anterior</span>
          </div>
        )}
      </IOSCardContent>
    </IOSCard>
  );

  const OccupancyCard = ({ 
    zone, 
    data, 
    color 
  }: {
    zone: string;
    data: any;
    color: string;
  }) => (
    <div className="bg-white rounded-ios p-5 shadow-ios border border-enigma-neutral-200">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }} />
        <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 m-0">
          {getZoneName(zone)}
        </h4>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="ios-text-footnote text-enigma-neutral-500">Ocupación</span>
          <span className="ios-text-callout font-semibold text-enigma-neutral-900">
            {data.occupied + data.reserved}/{data.total}
          </span>
        </div>
        
        <div className="w-full h-2 bg-enigma-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${((data.occupied + data.reserved) / data.total) * 100}%`,
              backgroundColor: color 
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between ios-text-caption1">
        <span className="text-ios-green">Disponibles: {data.available}</span>
        <span className="text-enigma-neutral-500">
          {Math.round(((data.occupied + data.reserved) / data.total) * 100)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="font-sf">
      {/* Encabezado responsive */}
      <IOSCard variant="default" className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 mb-6">
        <IOSCardContent className="enigma-spacing-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900 mb-1">
                {getTimeBasedGreeting()}
              </h1>
              <p className="text-enigma-neutral-500 ios-text-callout">
                {formatDate(currentTime)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-enigma-primary text-white px-4 py-2 rounded-ios ios-text-headline font-semibold min-w-[120px] text-center order-2 sm:order-1">
                {formatTime(currentTime)}
              </div>
              
              <IOSButton 
                variant="primary" 
                onClick={() => navigate('/reservas')}
                className="flex items-center gap-2 bg-enigma-primary hover:bg-enigma-primary/90 text-white order-1 sm:order-2 w-full sm:w-auto justify-center"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Reserva</span>
                <span className="sm:hidden">Nueva</span>
              </IOSButton>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Métricas principales */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        <StatCard
          title="Reservas Hoy"
          value={rawReservasHoy.length}
          subtitle={`${activeReservations} activas, ${completedReservations} completadas`}
          color="var(--enigma-primary)"
          icon={Calendar}
          trend={12}
        />
        <StatCard
          title="Ocupación Actual"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedTables + reservedTables} de ${totalTables} mesas ocupadas`}
          color="var(--enigma-secondary)"
          icon={MapPin}
          trend={5}
        />
        <StatCard
          title="Clientes Totales"
          value={customers.length}
          subtitle={`${customers.filter(c => c.vip_status).length} clientes VIP`}
          color="var(--enigma-accent)"
          icon={Users}
          trend={8}
        />
        <StatCard
          title="No Shows"
          value={noShows}
          subtitle="Reservas no presentadas hoy"
          color="var(--enigma-neutral-600)"
          icon={Clock}
          trend={noShows > 0 ? -15 : 0}
        />
      </section>

      {/* Navegación contextual */}
      <section className="mb-6">
        <IOSCard variant="default" className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
          <IOSCardHeader className="p-4 sm:p-6 border-b border-enigma-neutral-200">
            <IOSCardTitle className="ios-text-headline font-semibold text-enigma-neutral-900">
              Acciones Rápidas
            </IOSCardTitle>
          </IOSCardHeader>
          
          <IOSCardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Gestionar Mesas', icon: MapPin, color: '#237584', bgGradient: 'from-[#237584]/10 to-[#237584]/5', route: '/mesas' },
                { label: 'Nuevo Cliente', icon: User, color: '#9FB289', bgGradient: 'from-[#9FB289]/10 to-[#9FB289]/5', route: '/clientes' },
                { label: 'Reportes', icon: BarChart3, color: '#CB5910', bgGradient: 'from-[#CB5910]/10 to-[#CB5910]/5', route: '/analiticas' },
                { label: 'Configuración', icon: Settings, color: '#6B7280', bgGradient: 'from-gray-500/10 to-gray-500/5', route: '/configuracion' },
                { label: 'Historial', icon: ClipboardList, color: '#8B5CF6', bgGradient: 'from-purple-500/10 to-purple-500/5', route: '/historial' },
                { label: 'Notificaciones', icon: Bell, color: '#FF3B30', bgGradient: 'from-red-500/10 to-red-500/5', route: '/notificaciones' },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.route)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-3 p-4 h-24 
                    rounded-2xl transition-all duration-300 ease-out overflow-hidden
                    hover:scale-105 active:scale-95 
                    bg-gradient-to-br ${action.bgGradient}
                    border border-white/40 hover:border-white/60
                    shadow-lg hover:shadow-xl
                  `}
                  style={{
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  }}
                >
                  {/* Efecto de brillo superior */}
                  <div 
                    className="absolute top-0 left-4 right-4 h-px opacity-40"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
                    }}
                  />
                  
                  {/* Gradiente de hover sutil */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at center, ${action.color}15 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Contenedor del icono con glassmorphismo */}
                  <div 
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-90"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                      border: `1px solid ${action.color}30`,
                      boxShadow: `0 4px 12px ${action.color}20`
                    }}
                  >
                    {/* Brillo interno del contenedor del icono */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-40"
                      style={{ 
                        background: `linear-gradient(135deg, ${action.color}30 0%, transparent 60%)`
                      }}
                    />
                    
                    <action.icon 
                      size={18} 
                      className="relative z-10 transition-all duration-300"
                      style={{ 
                        color: action.color,
                        filter: `drop-shadow(0 1px 2px ${action.color}40)`
                      }}
                    />
                  </div>
                  
                  {/* Texto mejorado */}
                  <span 
                    className="text-xs font-semibold text-center leading-tight relative z-10 transition-all duration-300 group-hover:opacity-90"
                    style={{ color: action.color }}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </IOSCardContent>
        </IOSCard>
      </section>

      {/* Grid principal responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Panel principal - lg:col-span-8 para tablet horizontal */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Upcoming Reservations */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="flex flex-row items-center justify-between p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="flex items-center ios-text-headline font-semibold text-enigma-neutral-900">
                Próximas Reservas
              </IOSCardTitle>
              <div className="flex items-center space-x-2">
                <IOSBadge variant="custom" className="bg-enigma-primary text-white px-3 py-1 text-xs font-semibold">
                  {upcomingReservations.length} próximas
                </IOSBadge>
                <span className="text-xs text-enigma-neutral-500">
                  🕓 {format(getSpainDate(), 'HH:mm')}
                </span>
              </div>
            </IOSCardHeader>
            
            <IOSCardContent className="p-0">
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-8 px-6 text-enigma-neutral-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">No hay reservas en las próximas 24 horas</p>
                  <p className="ios-text-footnote mt-1">Próxima actualización: {format(addHours(getSpainDate(), 1), 'HH:mm')}</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {upcomingReservations.map((reservation, index) => (
                    <div key={reservation.id} 
                         onClick={() => handleReservationClick(reservation)}
                         className={`
                           group relative bg-white hover:bg-enigma-neutral-50 
                           border-b border-enigma-neutral-200 last:border-b-0
                           ios-touch-feedback cursor-pointer transition-all duration-200
                           hover:shadow-md active:bg-enigma-neutral-100
                           ${index === 0 ? 'rounded-t-ios-lg' : ''}
                           ${index === upcomingReservations.length - 1 ? 'rounded-b-ios-lg' : ''}
                         `}>
                      
                      {/* Layout vertical expandido para mostrar notas */}
                      <div className="p-4">
                        
                        {/* Primera fila: Hora, cliente y estado */}
                        <div className="flex items-start justify-between mb-3">
                          
                          {/* Lado izquierdo: Hora y cliente */}
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* Hora destacada */}
                            <div className="flex-shrink-0">
                              <div className="bg-enigma-primary text-white px-4 py-2 rounded-ios-lg shadow-ios-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-bold text-base">{reservation.hora_reserva}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Info del cliente */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <User className="h-4 w-4 text-enigma-neutral-600 flex-shrink-0" />
                                <h4 className="font-semibold text-enigma-neutral-900 truncate">
                                  {reservation.nombre}
                                </h4>
                                {reservation.primera_visita && (
                                  <div className="bg-enigma-accent text-white px-2 py-1 rounded-ios text-xs font-semibold flex items-center space-x-1">
                                    <Star className="h-3 w-3" />
                                    <span>Primera vez</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Lado derecho: Solo estado */}
                          <div className="flex-shrink-0">
                            <div 
                              className="text-white px-3 py-2 rounded-ios text-sm font-semibold uppercase shadow-ios-sm min-w-[90px] text-center"
                              style={{ backgroundColor: getStatusColor(reservation.estado || '') }}
                            >
                              {getStatusLabel(reservation.estado || '')}
                            </div>
                          </div>
                        </div>

                        {/* Segunda fila: Detalles de contacto y acciones */}
                        <div className="flex items-center justify-between">
                          
                          {/* Detalles de contacto en línea horizontal */}
                          <div className="flex items-center space-x-4 text-sm text-enigma-neutral-600 flex-1">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-enigma-primary" />
                              <span className="font-medium">{reservation.personas}p</span>
                            </div>
                            
                            {reservation.preferencia_mesa && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-enigma-secondary" />
                                <span className="truncate">{reservation.preferencia_mesa}</span>
                              </div>
                            )}
                            
                            {reservation.ocasion && (
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3 w-3 text-enigma-accent" />
                                <span className="truncate">{reservation.ocasion}</span>
                              </div>
                            )}
                            
                            {reservation.telefono && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-enigma-primary" />
                                <span className="truncate">{reservation.telefono}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Acciones rápidas */}
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            {reservation.estado === 'pendiente' && (
                              <IOSButton
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleStatusUpdate(reservation.id, 'confirmada', e)}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5"
                                disabled={updateReservationMutation.isPending}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span className="text-xs">Confirmar</span>
                              </IOSButton>
                            )}
                            
                            <IOSButton
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReservationClick(reservation);
                              }}
                              className="bg-enigma-primary/10 border-enigma-primary/20 text-enigma-primary hover:bg-enigma-primary/20 px-3 py-1.5"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              <span className="text-xs">Ver</span>
                            </IOSButton>
                          </div>
                        </div>
                        
                        {/* Notas visibles */}
                        {(reservation.requisitos_dieteticos || reservation.notas) && (
                          <div className="mt-3 p-3 bg-enigma-neutral-50 rounded-ios border border-enigma-neutral-200">
                            {reservation.requisitos_dieteticos && (
                              <div className="flex items-start space-x-2 mb-2 last:mb-0">
                                <Utensils className="h-4 w-4 text-enigma-accent flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-sm font-medium text-enigma-accent">Dietéticas:</span>
                                  <span className="text-sm text-enigma-neutral-700 ml-1">{reservation.requisitos_dieteticos}</span>
                                </div>
                              </div>
                            )}
                            {reservation.notas && (
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-enigma-neutral-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-sm font-medium text-enigma-neutral-600">Notas:</span>
                                  <span className="text-sm text-enigma-neutral-700 ml-1">{reservation.notas}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Barra de progreso sutil en la parte inferior */}
                      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-enigma-neutral-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </IOSCardContent>
          </IOSCard>

          {/* Modal para ficha completa de reserva con estilo iOS nativo */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
              {selectedReservation && (
                <div className="h-full flex flex-col">
                  
                  {/* Header fijo con estilo iOS */}
                  <div className="flex-shrink-0 bg-enigma-neutral-50 border-b border-enigma-neutral-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-ios bg-enigma-primary/10 border border-enigma-primary/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-enigma-primary" />
                        </div>
                        <h2 className="text-xl font-semibold text-enigma-neutral-900">
                          Detalles de Reserva
                        </h2>
                      </div>
                      
                      {/* Estado */}
                      <IOSBadge 
                        variant="custom" 
                        className="px-3 py-1 text-xs font-semibold uppercase"
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedReservation.estado || '')}20`,
                          color: getStatusColor(selectedReservation.estado || ''),
                          border: `1px solid ${getStatusColor(selectedReservation.estado || '')}40`
                        }}
                      >
                        {getStatusLabel(selectedReservation.estado || '')}
                      </IOSBadge>
                    </div>
                    
                    {/* Información principal */}
                    <div className="flex items-center space-x-4">
                      <div className="bg-enigma-primary text-white px-6 py-3 rounded-ios shadow-ios-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5" />
                          <span className="font-bold text-lg">{selectedReservation.hora_reserva}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-enigma-neutral-900">
                          {format(new Date(selectedReservation.fecha_reserva), "EEEE, d 'de' MMMM", { locale: es })}
                        </div>
                        <div className="text-sm text-enigma-neutral-600">
                          ID: {selectedReservation.id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido con scroll */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Columna izquierda: Información del cliente */}
                      <div className="space-y-6">
                        
                        {/* Información del cliente */}
                        <IOSCard variant="elevated" className="overflow-hidden">
                          <IOSCardContent className="p-5">
                            <div className="flex items-center space-x-3 mb-4">
                              <User className="h-5 w-5 text-enigma-primary" />
                              <h3 className="text-lg font-semibold text-enigma-neutral-900">{selectedReservation.nombre}</h3>
                              {selectedReservation.primera_visita && (
                                <IOSBadge variant="custom" className="bg-enigma-accent text-white px-2 py-1 text-xs font-semibold flex items-center space-x-1">
                                  <Star className="h-3 w-3" />
                                  <span>Primera vez</span>
                                </IOSBadge>
                              )}
                            </div>
                            
                            {/* Detalles de reserva */}
                            <div className="grid grid-cols-1 gap-4">
                              <div className="flex items-center space-x-3 p-3 bg-enigma-neutral-50 rounded-ios">
                                <Users className="h-4 w-4 text-enigma-primary" />
                                <div>
                                  <div className="text-sm text-enigma-neutral-600">Personas</div>
                                  <div className="font-semibold text-enigma-neutral-900">{selectedReservation.personas}</div>
                                </div>
                              </div>
                              
                              {selectedReservation.preferencia_mesa && (
                                <div className="flex items-center space-x-3 p-3 bg-enigma-neutral-50 rounded-ios">
                                  <MapPin className="h-4 w-4 text-enigma-secondary" />
                                  <div>
                                    <div className="text-sm text-enigma-neutral-600">Mesa Preferida</div>
                                    <div className="font-semibold text-enigma-neutral-900">{selectedReservation.preferencia_mesa}</div>
                                  </div>
                                </div>
                              )}
                              
                              {selectedReservation.ocasion && (
                                <div className="flex items-center space-x-3 p-3 bg-enigma-neutral-50 rounded-ios">
                                  <Tag className="h-4 w-4 text-enigma-accent" />
                                  <div>
                                    <div className="text-sm text-enigma-neutral-600">Ocasión</div>
                                    <div className="font-semibold text-enigma-neutral-900">{selectedReservation.ocasion}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </IOSCardContent>
                        </IOSCard>

                        {/* Notas especiales */}
                        {(selectedReservation.requisitos_dieteticos || selectedReservation.notas) && (
                          <IOSCard variant="elevated" className="overflow-hidden">
                            <IOSCardHeader className="pb-3 border-b border-enigma-neutral-200">
                              <IOSCardTitle className="text-base font-semibold text-enigma-neutral-900">
                                Notas Especiales
                              </IOSCardTitle>
                            </IOSCardHeader>
                            <IOSCardContent className="pt-4">
                              <div className="space-y-4">
                                {selectedReservation.requisitos_dieteticos && (
                                  <div className="flex items-start space-x-3 p-3 bg-enigma-accent/10 rounded-ios border border-enigma-accent/20">
                                    <Utensils className="h-4 w-4 text-enigma-accent mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="text-sm font-semibold text-enigma-accent mb-1">Requisitos Dietéticos</div>
                                      <div className="text-sm text-enigma-neutral-700">{selectedReservation.requisitos_dieteticos}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {selectedReservation.notas && (
                                  <div className="flex items-start space-x-3 p-3 bg-enigma-neutral-100 rounded-ios border border-enigma-neutral-200">
                                    <FileText className="h-4 w-4 text-enigma-neutral-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="text-sm font-semibold text-enigma-neutral-600 mb-1">Notas Adicionales</div>
                                      <div className="text-sm text-enigma-neutral-700">{selectedReservation.notas}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </IOSCardContent>
                          </IOSCard>
                        )}
                      </div>
                      
                      {/* Columna derecha: Acciones de contacto */}
                      <div className="space-y-6">
                        
                        {/* Email */}
                        <IOSCard variant="elevated" className="overflow-hidden ios-touch-feedback cursor-pointer hover:shadow-ios transition-shadow">
                          <IOSCardContent className="p-5">
                            <div className="flex items-start space-x-4 mb-4">
                              <div className="w-12 h-12 rounded-ios bg-enigma-primary/10 border border-enigma-primary/20 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-enigma-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-enigma-primary mb-1">Email</div>
                                <div className="text-sm text-enigma-neutral-900 break-all">
                                  {selectedReservation.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <IOSButton
                                variant="primary"
                                onClick={() => handleEmailClick(selectedReservation.email)}
                                className="flex-1 bg-enigma-primary hover:bg-enigma-primary/90 text-white"
                              >
                                Enviar Email
                              </IOSButton>
                              <IOSButton
                                variant="outline"
                                onClick={() => handleCopyToClipboard(selectedReservation.email, 'Email')}
                                className="border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-100"
                              >
                                <Copy className="h-4 w-4" />
                              </IOSButton>
                            </div>
                          </IOSCardContent>
                        </IOSCard>

                        {/* WhatsApp */}
                        <IOSCard variant="elevated" className="overflow-hidden ios-touch-feedback cursor-pointer hover:shadow-ios transition-shadow">
                          <IOSCardContent className="p-5">
                            <div className="flex items-start space-x-4 mb-4">
                              <div className="w-12 h-12 rounded-ios bg-enigma-secondary/10 border border-enigma-secondary/20 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="h-5 w-5 text-enigma-secondary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-enigma-secondary mb-1">WhatsApp</div>
                                <div className="text-sm text-enigma-neutral-900">
                                  {selectedReservation.telefono}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <IOSButton
                                variant="primary"
                                onClick={() => handleWhatsAppClick(selectedReservation.telefono)}
                                className="flex-1 bg-enigma-secondary hover:bg-enigma-secondary/90 text-white"
                              >
                                Abrir WhatsApp
                              </IOSButton>
                              <IOSButton
                                variant="outline"
                                onClick={() => handleCopyToClipboard(selectedReservation.telefono, 'Teléfono')}
                                className="border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-100"
                              >
                                <Copy className="h-4 w-4" />
                              </IOSButton>
                            </div>
                          </IOSCardContent>
                        </IOSCard>

                        {/* Información adicional */}
                        <IOSCard variant="elevated" className="overflow-hidden">
                          <IOSCardHeader className="pb-3 border-b border-enigma-neutral-200">
                            <IOSCardTitle className="text-base font-semibold text-enigma-neutral-900">
                              Información Adicional
                            </IOSCardTitle>
                          </IOSCardHeader>
                          <IOSCardContent className="pt-4">
                            <div className="text-sm text-enigma-neutral-600">
                              <div className="mb-2">
                                <span className="font-medium">Creada:</span> {format(new Date(selectedReservation.created_at), 'dd/MM/yyyy HH:mm')}
                              </div>
                              <div>
                                <span className="font-medium">Última actualización:</span> {format(new Date(selectedReservation.updated_at), 'dd/MM/yyyy HH:mm')}
                              </div>
                            </div>
                          </IOSCardContent>
                        </IOSCard>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer fijo con acciones */}
                  <div className="flex-shrink-0 bg-enigma-neutral-50 border-t border-enigma-neutral-200 p-6">
                    <div className="flex items-center justify-end space-x-3">
                      {selectedReservation.estado === 'pendiente' && (
                        <IOSButton
                          variant="primary"
                          onClick={() => handleStatusUpdate(selectedReservation.id, 'confirmada', {} as React.MouseEvent)}
                          disabled={updateReservationMutation.isPending}
                          className="bg-enigma-secondary hover:bg-enigma-secondary/90 text-white flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>Confirmar Reserva</span>
                        </IOSButton>
                      )}
                      
                      <IOSButton
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                        className="border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-100"
                      >
                        Cerrar
                      </IOSButton>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Recent Activity */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="ios-text-headline font-semibold text-enigma-neutral-900">Actividad Reciente</IOSCardTitle>
            </IOSCardHeader>
            
            <IOSCardContent className="space-y-3 p-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} 
                     className="flex items-center p-3 bg-enigma-neutral-50 rounded-ios transition-all border border-enigma-neutral-200">
                  <div 
                    className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                    style={{
                      backgroundColor: 
                        activity.type === 'success' ? '#34C759' :
                        activity.type === 'warning' ? '#FF9500' :
                        activity.type === 'error' ? '#FF3B30' : '#237584'
                    }}
                  />
                  <div className="flex-1">
                    <div className="ios-text-footnote text-enigma-neutral-900 font-medium mb-1">
                      {activity.action}
                    </div>
                    <div className="ios-text-caption1 text-enigma-neutral-500">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}

              <IOSButton 
                variant="outline" 
                className="w-full mt-4 border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-100"
                onClick={() => navigate('/historial')}
              >
                Ver Todo el Historial
              </IOSButton>
            </IOSCardContent>
          </IOSCard>
        </div>

        {/* Panel lateral - lg:col-span-4 */}
        <div className="lg:col-span-4 space-y-6">
          {/* Estado de mesas por zona */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="p-4 sm:p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="ios-text-headline font-semibold text-enigma-neutral-900 flex items-center">
                <MapPin className="mr-2" size={20} />
                Estado por Zona
              </IOSCardTitle>
            </IOSCardHeader>
            
            <IOSCardContent className="space-y-4 p-4 sm:p-6">
              {Object.entries(zoneOccupancy).length === 0 ? (
                <div className="text-center py-8 text-enigma-neutral-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">No hay datos de ocupación</p>
                </div>
              ) : (
                Object.entries(zoneOccupancy).map(([zone, data]) => (
                  <OccupancyCard
                    key={zone}
                    zone={zone}
                    data={data}
                    color={getZoneColor(zone)}
                  />
                ))
              )}

              <div className="mt-5 p-4 bg-enigma-neutral-50 rounded-ios text-center border border-enigma-neutral-200">
                <div className="ios-text-title2 font-bold text-enigma-neutral-900 mb-1">
                  {occupiedTables + reservedTables}/{totalTables}
                </div>
                <div className="ios-text-footnote text-enigma-neutral-500">
                  Mesas ocupadas en total
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>

          {/* Resumen de actividad */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="p-4 sm:p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="ios-text-headline font-semibold text-enigma-neutral-900 flex items-center">
                <Activity className="mr-2" size={20} />
                Resumen del Día
              </IOSCardTitle>
            </IOSCardHeader>
            
            <IOSCardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-enigma-primary/10 rounded-ios">
                  <div className="text-2xl font-bold text-enigma-primary">
                    {completedReservations}
                  </div>
                  <div className="text-xs text-enigma-neutral-600 font-medium">
                    Completadas
                  </div>
                </div>
                <div className="text-center p-3 bg-enigma-secondary/10 rounded-ios">
                  <div className="text-2xl font-bold text-enigma-secondary">
                    {activeReservations}
                  </div>
                  <div className="text-xs text-enigma-neutral-600 font-medium">
                    Activas
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-enigma-neutral-200">
                <IOSButton 
                  variant="outline" 
                  className="w-full border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-100"
                  onClick={() => navigate('/analiticas')}
                >
                  Ver Reportes Completos
                </IOSButton>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>
      </div>
    </div>
  );
}
