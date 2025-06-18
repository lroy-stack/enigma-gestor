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
  Eye,
  Filter,
  Zap,
  Activity,
  Star,
  Coffee,
  ChevronRight,
  Grid3X3,
  Timer,
  CheckCircle2
} from 'lucide-react';
import { format, isToday, addHours, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

type ActivityType = 'success' | 'info' | 'warning' | 'error';

// Componente para métricas principales con glassmorphism avanzado
const GlassMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon: Icon, 
  trend,
  size = 'normal'
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: any;
  trend?: number;
  size?: 'normal' | 'large';
}) => (
  <div 
    className={`
      relative overflow-hidden rounded-3xl border border-white/20 backdrop-blur-3xl
      transition-all duration-500 hover:scale-105 active:scale-95
      ios-touch-feedback group cursor-pointer
      ${size === 'large' ? 'col-span-2 h-32' : 'h-28'}
    `}
    style={{
      background: `linear-gradient(135deg, 
        rgba(255,255,255,0.25) 0%, 
        rgba(255,255,255,0.15) 50%,
        rgba(255,255,255,0.05) 100%)`,
      backdropFilter: 'blur(40px) saturate(180%) brightness(110%)',
      boxShadow: `
        0 8px 32px rgba(0,0,0,0.12),
        0 4px 16px rgba(0,0,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.5),
        inset 0 -1px 0 rgba(0,0,0,0.05)
      `
    }}
  >
    {/* Efectos de fondo dinámicos */}
    <div 
      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}40 0%, transparent 50%)`
      }}
    />
    
    {/* Líneas de brillo */}
    <div 
      className="absolute top-0 left-4 right-4 h-px opacity-60"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
      }}
    />
    
    {/* Contenido */}
    <div className="relative p-6 h-full flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
          {title}
        </p>
        <div className="flex items-baseline space-x-2 mb-1">
          <span 
            className={`font-bold text-white ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}
            style={{ textShadow: `0 2px 8px ${color}40` }}
          >
            {value}
          </span>
          {trend && (
            <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          {subtitle}
        </p>
      </div>
      
      {/* Icono con efecto glassmorphism */}
      <div 
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 20px ${color}20`
        }}
      >
        <Icon size={28} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
      </div>
    </div>
  </div>
);

// Widget de navegación rápida optimizado para tablet
const QuickNavigationWidget = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const quickActions = [
    { 
      label: 'Nueva Reserva', 
      icon: Calendar, 
      color: '#237584', 
      route: '/reservas',
      description: 'Crear reserva'
    },
    { 
      label: 'Gestionar Mesas', 
      icon: Grid3X3, 
      color: '#9FB289', 
      route: '/mesas',
      description: 'Ver estado'
    },
    { 
      label: 'Clientes', 
      icon: Users, 
      color: '#CB5910', 
      route: '/clientes',
      description: 'Gestionar CRM'
    },
    { 
      label: 'Analytics', 
      icon: BarChart3, 
      color: '#007AFF', 
      route: '/analiticas',
      description: 'Ver reportes'
    },
    { 
      label: 'Configuración', 
      icon: Settings, 
      color: '#8E8E93', 
      route: '/configuracion',
      description: 'Ajustes'
    },
    { 
      label: 'Notificaciones', 
      icon: Bell, 
      color: '#FF3B30', 
      route: '/notificaciones',
      description: 'Alertas'
    }
  ];

  return (
    <div 
      className="rounded-3xl border border-white/20 backdrop-blur-3xl p-6"
      style={{
        background: `linear-gradient(135deg, 
          rgba(255,255,255,0.2) 0%, 
          rgba(255,255,255,0.1) 100%)`,
        backdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Zap className="mr-2" size={20} />
        Acciones Rápidas
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onNavigate(action.route)}
            className="
              group relative overflow-hidden rounded-2xl p-4 
              transition-all duration-300 hover:scale-105 active:scale-95
              ios-touch-feedback
            "
            style={{
              background: `linear-gradient(135deg, ${action.color}25, ${action.color}10)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${action.color}30`
            }}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${action.color}40` }}
              >
                <action.icon size={24} color="#ffffff" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {action.label}
                </p>
                <p className="text-xs text-white/60">
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Efecto de hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${action.color}20, transparent)`
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Widget de reservas próximas optimizado
const UpcomingReservationsWidget = ({ reservations }: { reservations: any[] }) => (
  <div 
    className="rounded-3xl border border-white/20 backdrop-blur-3xl p-6 h-full"
    style={{
      background: `linear-gradient(135deg, 
        rgba(255,255,255,0.2) 0%, 
        rgba(255,255,255,0.1) 100%)`,
      backdropFilter: 'blur(40px) saturate(180%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-white flex items-center">
        <Clock className="mr-2" size={20} />
        Próximas Reservas
      </h3>
      <IOSBadge 
        variant="custom"
        className="px-3 py-1 text-xs font-bold"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff',
          backdropFilter: 'blur(10px)'
        }}
      >
        {reservations.length}
      </IOSBadge>
    </div>

    <div className="space-y-3 max-h-64 overflow-y-auto">
      {reservations.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay reservas próximas</p>
        </div>
      ) : (
        reservations.map((reservation, index) => (
          <div 
            key={reservation.id || index}
            className="
              rounded-2xl p-4 backdrop-blur-2xl border border-white/10
              hover:border-white/20 transition-all duration-300
              ios-touch-feedback cursor-pointer
            "
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))'
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#237584' }}
              >
                {reservation.hora_reserva}
              </div>
              <div className="text-xs text-white/60">
                Mesa {reservation.numero_mesa || 'TBD'}
              </div>
            </div>
            
            <h4 className="font-semibold text-white mb-1">
              {reservation.cliente_nombre}
            </h4>
            
            <div className="flex justify-between text-xs text-white/60">
              <span className="flex items-center">
                <Users size={12} className="mr-1" />
                {reservation.numero_comensales} personas
              </span>
              <span className="capitalize">
                {reservation.estado_reserva?.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Widget de estado de mesas mejorado
const TableStatusWidget = ({ tables }: { tables: any[] }) => {
  const zoneStats = tables.reduce((acc, table) => {
    const zone = table.tipo_mesa || 'general';
    if (!acc[zone]) {
      acc[zone] = { total: 0, libre: 0, ocupada: 0, reservada: 0 };
    }
    acc[zone].total++;
    const estado = table.estado?.estado || 'libre';
    acc[zone][estado]++;
    return acc;
  }, {} as Record<string, any>);

  const getZoneColor = (zone: string) => {
    const colors = {
      'estandar': '#237584',
      'ventana': '#9FB289',
      'terraza_superior': '#CB5910',
      'terraza_inferior': '#FF9500',
      'barra': '#8E8E93'
    };
    return colors[zone] || '#007AFF';
  };

  return (
    <div 
      className="rounded-3xl border border-white/20 backdrop-blur-3xl p-6 h-full"
      style={{
        background: `linear-gradient(135deg, 
          rgba(255,255,255,0.2) 0%, 
          rgba(255,255,255,0.1) 100%)`,
        backdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <MapPin className="mr-2" size={20} />
        Estado de Mesas
      </h3>

      <div className="space-y-4">
        {Object.entries(zoneStats).map(([zone, stats]) => {
          const occupancyRate = Math.round(((stats.ocupada + stats.reservada) / stats.total) * 100);
          const color = getZoneColor(zone);
          
          return (
            <div key={zone} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-white capitalize">
                  {zone.replace('_', ' ')}
                </span>
                <span className="text-xs text-white/60">
                  {stats.total} mesas
                </span>
              </div>
              
              <div className="flex space-x-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-white/70">{stats.libre}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-white/70">{stats.ocupada}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-white/70">{stats.reservada}</span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${occupancyRate}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}40`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function TabletOptimizedDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data hooks
  const { data: rawReservasHoy = [] } = useTodayReservations();
  const { data: tables = [] } = useTablesWithStates();
  const { data: restaurantStats = [] } = useRestaurantStats();
  const { data: allReservations = [] } = useReservations();
  const { data: customers = [] } = useCustomers();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Procesar datos
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

  const completedReservations = todayReservations.filter(r => r.estado_reserva === 'completada').length;
  const activeReservations = todayReservations.filter(r => 
    r.estado_reserva === 'confirmada' || r.estado_reserva === 'pendiente_confirmacion'
  ).length;
  const noShows = todayReservations.filter(r => r.estado_reserva === 'no_show').length;

  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.estado?.estado === 'ocupada').length;
  const reservedTables = tables.filter(t => t.estado?.estado === 'reservada').length;
  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Próximas reservas
  const now = new Date();
  const nextThreeHours = addHours(now, 3);
  const upcomingReservations = todayReservations
    .filter(reservation => {
      if (!reservation.hora_reserva) return false;
      const reservaDateTime = new Date(`${new Date().toDateString()} ${reservation.hora_reserva}`);
      return isAfter(reservaDateTime, now) && isBefore(reservaDateTime, nextThreeHours);
    })
    .sort((a, b) => (a.hora_reserva || '').localeCompare(b.hora_reserva || ''))
    .slice(0, 8);

  const formatTime = (date: Date) => format(date, 'HH:mm', { locale: es });
  const formatDate = (date: Date) => format(date, "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: `
          linear-gradient(135deg, 
            #1a365d 0%, 
            #237584 25%, 
            #2a5a6b 50%, 
            #1e3a52 75%, 
            #162838 100%
          )
        `
      }}
    >
      {/* Header flotante con glassmorphism */}
      <div 
        className="mb-8 rounded-3xl border border-white/20 backdrop-blur-3xl p-6"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255,255,255,0.25) 0%, 
            rgba(255,255,255,0.15) 100%)`,
          backdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Dashboard - Enigma Cocina con Alma
            </h1>
            <p className="text-white/70">
              {formatDate(currentTime)}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div 
              className="px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))'
              }}
            >
              <span className="text-2xl font-mono font-bold text-white">
                {formatTime(currentTime)}
              </span>
            </div>
            
            <IOSButton 
              variant="primary" 
              onClick={() => navigate('/reservas')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-2xl rounded-2xl font-semibold"
            >
              <Plus size={20} />
              Nueva Reserva
            </IOSButton>
          </div>
        </div>
      </div>

      {/* Grid principal optimizado para tablet horizontal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Métricas principales - 8 columnas */}
        <div className="col-span-8 space-y-6">
          {/* Métricas en grid */}
          <div className="grid grid-cols-4 gap-4">
            <GlassMetricCard
              title="Reservas Hoy"
              value={todayReservations.length}
              subtitle={`${activeReservations} activas, ${completedReservations} completadas`}
              color="#237584"
              icon={Calendar}
              trend={12}
            />
            <GlassMetricCard
              title="Ocupación"
              value={`${occupancyRate}%`}
              subtitle={`${occupiedTables + reservedTables} de ${totalTables} mesas`}
              color="#9FB289"
              icon={MapPin}
              trend={5}
            />
            <GlassMetricCard
              title="Clientes"
              value={customers.length}
              subtitle={`${customers.filter(c => c.vip_status).length} VIP registrados`}
              color="#CB5910"
              icon={Users}
              trend={8}
            />
            <GlassMetricCard
              title="No Shows"
              value={noShows}
              subtitle="Reservas perdidas hoy"
              color="#FF3B30"
              icon={Clock}
              trend={noShows > 0 ? -15 : 0}
            />
          </div>

          {/* Acciones rápidas */}
          <QuickNavigationWidget onNavigate={navigate} />
        </div>

        {/* Panel lateral - 4 columnas */}
        <div className="col-span-4 space-y-6">
          {/* Próximas reservas */}
          <UpcomingReservationsWidget reservations={upcomingReservations} />
          
          {/* Estado de mesas */}
          <TableStatusWidget tables={tables} />
        </div>
      </div>
    </div>
  );
}