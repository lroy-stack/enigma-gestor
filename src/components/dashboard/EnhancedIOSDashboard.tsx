import React, { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useTodayReservations, useRestaurantStats } from '@/hooks/useRestaurantStats';
import { useCustomers } from '@/hooks/useCustomers';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
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
  Activity
} from 'lucide-react';
import { format, isToday, addHours, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

type ActivityType = 'success' | 'info' | 'warning' | 'error';

export function EnhancedIOSDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data hooks
  const { data: rawReservasHoy = [] } = useTodayReservations();
  const { data: tables = [] } = useTablesWithStates();
  const { data: restaurantStats = [] } = useRestaurantStats();
  const { data: allReservations = [] } = useReservations();
  const { data: customers = [] } = useCustomers();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Procesar reservas de forma segura
  const reservasHoy = Array.isArray(rawReservasHoy) 
    ? rawReservasHoy.filter(reservation => 
        reservation && 
        typeof reservation === 'object' && 
        'estado_reserva' in reservation
      )
    : [];

  const todayReservations = reservasHoy.filter(reservation => 
    reservation.estado_reserva !== 'cancelada_usuario' && reservation.estado_reserva !== 'cancelada_restaurante'
  );

  const completedReservations = todayReservations.filter(reservation => reservation.estado_reserva === 'completada').length;
  const activeReservations = todayReservations.filter(reservation => 
    reservation.estado_reserva === 'confirmada' || reservation.estado_reserva === 'pendiente_confirmacion'
  ).length;
  const noShows = todayReservations.filter(reservation => reservation.estado_reserva === 'no_show').length;

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

  // Get upcoming reservations (next 3 hours) - solo si tenemos datos válidos
  const now = new Date();
  const nextThreeHours = addHours(now, 3);
  const upcomingReservations = todayReservations
    .filter(reservation => {
      if (!reservation.hora_reserva) return false;
      const reservaDateTime = new Date(`${new Date().toDateString()} ${reservation.hora_reserva}`);
      return isAfter(reservaDateTime, now) && isBefore(reservaDateTime, nextThreeHours);
    })
    .sort((a, b) => (a.hora_reserva || '').localeCompare(b.hora_reserva || ''))
    .slice(0, 6);

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
      case 'pendiente_confirmacion': return '#FF9500';
      case 'cancelada_usuario':
      case 'cancelada_restaurante': return '#FF3B30';
      case 'completada': return '#8E8E93';
      default: return '#237584';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente_confirmacion': return 'Pendiente';
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
          value={todayReservations.length}
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
              <IOSBadge variant="custom" className="bg-enigma-primary text-white px-3 py-1 text-xs font-semibold">
                {upcomingReservations.length} pendientes
              </IOSBadge>
            </IOSCardHeader>
            
            <IOSCardContent className="space-y-3 max-h-80 overflow-y-auto p-6">
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-8 text-enigma-neutral-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">No hay reservas próximas</p>
                </div>
              ) : (
                upcomingReservations.map((reservation) => (
                  <div key={reservation.id} 
                       className="bg-enigma-neutral-50 rounded-ios p-4 border border-enigma-neutral-200 ios-touch-feedback cursor-pointer transition-all hover:border-enigma-primary/50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-enigma-primary text-white px-2 py-1 rounded text-sm font-semibold">
                        {reservation.hora_reserva}
                      </div>
                      <div 
                        className="text-white px-2 py-1 rounded text-xs font-semibold uppercase"
                        style={{ backgroundColor: getStatusColor(reservation.estado_reserva || '') }}
                      >
                        {getStatusLabel(reservation.estado_reserva || '')}
                      </div>
                    </div>
                    
                    <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-1">
                      {reservation.cliente_nombre}
                    </h4>
                    
                    <div className="flex justify-between ios-text-caption1 text-enigma-neutral-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {reservation.numero_comensales} personas
                      </span>
                      {reservation.numero_mesa && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Mesa {reservation.numero_mesa}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </IOSCardContent>
          </IOSCard>


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
