import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, 
  AlertCircle, UserCheck, Coffee, Star, Plus, Search, Filter,
  Eye, Edit, Trash2, PhoneCall, MessageSquare, ArrowRight, ArrowLeft,
  ChevronRight, Crown, AlertTriangle, CheckSquare, XCircle, User, FileText,
  ChevronDown, RefreshCw, TrendingUp, Activity, BarChart3,
  Timer, Bell, Settings, Zap, Target, PlayCircle, PauseCircle,
  CalendarDays, StickyNote, ChevronUp
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { SearchInput } from '@/components/forms/SearchInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTodaySpain, isTodaySpain, isTomorrowSpain, isThisWeekSpain } from '@/utils/dateUtils';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, subDays, format as formatDate, startOfDay, endOfDay, eachDayOfInterval, isSameDay, getWeek, addMonths, subMonths } from 'date-fns';
import { Reserva } from '@/types/database';

// Funciones helper para estado y colores
const getStatusColor = (status: string) => {
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

const getStatusLabel = (status: string) => {
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

const getStatusIcon = (status: string) => {
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

// Componente StatusBadge simple
const StatusBadge = ({ status }: { status: string }) => {
  const color = {
    'confirmada': 'bg-green-100 text-green-800',
    'pendiente_confirmacion': 'bg-yellow-100 text-yellow-800',
    'completada': 'bg-blue-100 text-blue-800',
    'cancelada_usuario': 'bg-gray-100 text-gray-800',
    'cancelada_restaurante': 'bg-gray-100 text-gray-800',
    'no_show': 'bg-red-100 text-red-800'
  }[status] || 'bg-gray-100 text-gray-800';

  const label = {
    'confirmada': 'Confirmada',
    'pendiente_confirmacion': 'Pendiente',
    'completada': 'Completada',
    'cancelada_usuario': 'Cancelada',
    'cancelada_restaurante': 'Cancelada',
    'no_show': 'No Show'
  }[status] || status;

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Componente para estadísticas
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

export default function Reservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [ocasionFilter, setOcasionFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Función para filtrar por rangos de fechas
  const getDateFilterFunction = (filterType: string) => {
    const today = new Date();
    
    switch(filterType) {
      case 'today':
        return (date: Date) => isTodaySpain(date);
      case 'yesterday':
        return (date: Date) => {
          const yesterday = subDays(today, 1);
          return formatDate(date, 'yyyy-MM-dd') === formatDate(yesterday, 'yyyy-MM-dd');
        };
      case 'tomorrow':
        return (date: Date) => isTomorrowSpain(date);
      case 'this_week':
        return (date: Date) => isThisWeekSpain(date);
      case 'last_week':
        return (date: Date) => {
          const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
          const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
          return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
        };
      case 'this_month':
        return (date: Date) => {
          const monthStart = startOfMonth(today);
          const monthEnd = endOfMonth(today);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        };
      case 'last_month':
        return (date: Date) => {
          const lastMonth = subDays(startOfMonth(today), 1);
          const lastMonthStart = startOfMonth(lastMonth);
          const lastMonthEnd = endOfMonth(lastMonth);
          return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
        };
      case 'next_7_days':
        return (date: Date) => {
          const nextWeek = addDays(today, 7);
          return isWithinInterval(date, { start: today, end: nextWeek });
        };
      case 'next_30_days':
        return (date: Date) => {
          const nextMonth = addDays(today, 30);
          return isWithinInterval(date, { start: today, end: nextMonth });
        };
      default:
        return () => true;
    }
  };


  useEffect(() => {
    const fetchReservas = async () => {
      try {
        console.log('🔍 Fetching reservas...');
        
        // Obtener todas las reservas sin límite para no perder datos
        const { data, error } = await supabase
          .from('reservas')
          .select('*')
          .order('fecha_reserva', { ascending: false })
          .order('hora_reserva', { ascending: true });

        if (error) {
          throw error;
        }

        console.log('✅ Reservas cargadas:', data?.length);
        if (data && data.length > 0) {
          console.log('📊 Distribución por mes:');
          const monthCounts = data.reduce((acc, reserva) => {
            const month = reserva.fecha_reserva.substring(0, 7);
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {});
          console.table(monthCounts);
        }
        setReservas(data || []);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error cargando reservas:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  // Filtrar reservas
  const reservasFiltradas = reservas?.filter(reserva => {
    if (!searchTerm && statusFilter === 'all' && dateFilter === 'all' && capacityFilter === 'all' && ocasionFilter === 'all') return true;
    
    let matchesSearch = true;
    let matchesStatus = true;
    let matchesDate = true;
    let matchesCapacity = true;
    let matchesOcasion = true;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = (
        reserva.nombre?.toLowerCase().includes(searchLower) ||
        reserva.email?.toLowerCase().includes(searchLower) ||
        reserva.telefono?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      matchesStatus = reserva.estado === statusFilter;
    }

    if (dateFilter !== 'all') {
      const reservaDate = parseISO(reserva.fecha_reserva);
      const dateFilterFn = getDateFilterFunction(dateFilter);
      matchesDate = dateFilterFn(reservaDate);
    }

    if (capacityFilter !== 'all') {
      const personas = reserva.personas || 0;
      switch(capacityFilter) {
        case '1-2':
          matchesCapacity = personas >= 1 && personas <= 2;
          break;
        case '3-4':
          matchesCapacity = personas >= 3 && personas <= 4;
          break;
        case '5-6':
          matchesCapacity = personas >= 5 && personas <= 6;
          break;
        case '7+':
          matchesCapacity = personas >= 7;
          break;
        default:
          matchesCapacity = true;
      }
    }

    if (ocasionFilter !== 'all') {
      matchesOcasion = reserva.ocasion === ocasionFilter;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesCapacity && matchesOcasion;
  }) || [];

  // Ordenar las reservas filtradas
  const reservasOrdenadas = [...reservasFiltradas].sort((a, b) => {
    // Primero por fecha (más recientes primero)
    const fechaComparison = new Date(b.fecha_reserva).getTime() - new Date(a.fecha_reserva).getTime();
    if (fechaComparison !== 0) return fechaComparison;
    
    // Luego por hora (más tempranas primero)
    return a.hora_reserva?.localeCompare(b.hora_reserva || '') || 0;
  });

  // Calcular estadísticas
  const getStats = () => {
    const today = getTodaySpain();
    const todayReservations = reservas?.filter(r => r.fecha_reserva === today) || [];
    
    return {
      total: todayReservations.length,
      confirmed: todayReservations.filter(r => r.estado === 'confirmada').length,
      pending: todayReservations.filter(r => r.estado === 'pendiente_confirmacion').length,
      completed: todayReservations.filter(r => r.estado === 'completada').length,
      cancelled: todayReservations.filter(r => ['cancelada_usuario', 'cancelada_restaurante', 'no_show'].includes(r.estado)).length,
      totalGuests: todayReservations.reduce((sum, r) => sum + (r.personas || 0), 0),
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-ios-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enigma-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Reservas</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sf px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 max-w-7xl mx-auto">
      {/* Header responsivo */}
      <IOSCard variant="default" className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 mb-4 md:mb-6">
        <IOSCardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="ios-text-title1 sm:ios-text-large-title font-bold text-enigma-neutral-900 truncate">Reservas</h1>
              <p className="ios-text-footnote sm:ios-text-callout text-enigma-neutral-600 mt-0.5 sm:mt-1">
                Gestión completa de reservas del restaurante
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <IOSButton 
                variant="secondary" 
                size="default"
                onClick={() => setShowCalendarModal(true)}
                className="bg-enigma-secondary/10 text-enigma-secondary hover:bg-enigma-secondary/20 border-enigma-secondary/20 min-h-[44px] flex-1 sm:flex-none"
              >
                <CalendarDays size={18} className="mr-2" />
                Vista Calendario
              </IOSButton>
              <IOSButton 
                variant="primary" 
                size="default"
                onClick={() => navigate('/reservas-nueva')}
                className="bg-enigma-primary hover:bg-enigma-primary/90 min-h-[44px] text-base font-medium flex-1 sm:flex-none"
              >
                <Plus size={18} className="mr-2" />
                Nueva Reserva
              </IOSButton>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>


      {/* Enhanced Stats Overview & Control Panel */}
      <section className="mb-6 md:mb-8">
        <div className="mb-4 md:mb-6 px-1">
          <h2 className="ios-text-headline sm:ios-text-title2 font-semibold text-enigma-neutral-900">
            Panel de Control
          </h2>
          <p className="ios-text-caption1 sm:ios-text-footnote text-enigma-neutral-600 mt-0.5">
            {format(new Date(), "d MMMM yyyy", { locale: es })} • Métricas en tiempo real
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 md:mb-6">
          <div 
            onClick={() => {
              setDateFilter('today');
              setStatusFilter('all');
            }}
            className="cursor-pointer ios-touch-feedback transition-all duration-200 hover:scale-[1.02]"
          >
            <StatCard
              title="Reservas Hoy"
              value={stats.total}
              subtitle={`${stats.totalGuests} comensales totales`}
              color="#237584"
              icon={Calendar}
              trend={12}
            />
          </div>
          <div 
            onClick={() => {
              setDateFilter('today');
              setStatusFilter('confirmada');
            }}
            className="cursor-pointer ios-touch-feedback transition-all duration-200 hover:scale-[1.02]"
          >
            <StatCard
              title="Confirmadas"
              value={stats.confirmed}
              subtitle="Listas para el servicio"
              color="#9FB289"
              icon={CheckCircle}
              trend={5}
            />
          </div>
          <div 
            onClick={() => {
              setDateFilter('today');
              setStatusFilter('pendiente_confirmacion');
            }}
            className="cursor-pointer ios-touch-feedback transition-all duration-200 hover:scale-[1.02]"
          >
            <StatCard
              title="Pendientes"
              value={stats.pending}
              subtitle="Requieren confirmación"
              color="#FF9500"
              icon={Clock}
              trend={-2}
            />
          </div>
          <div 
            onClick={() => {
              setDateFilter('today');
              setStatusFilter('completada');
            }}
            className="cursor-pointer ios-touch-feedback transition-all duration-200 hover:scale-[1.02]"
          >
            <StatCard
              title="Completadas"
              value={stats.completed}
              subtitle="Servicio finalizado"
              color="#34C759"
              icon={CheckSquare}
              trend={8}
            />
          </div>
        </div>

      </section>

      {/* Date Navigation - iOS Native Style - Optimizado para tablet */}
      <div className="flex items-center justify-center mb-4 md:mb-6 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-ios-xl border border-enigma-neutral-200/50 p-1 shadow-ios w-full max-w-md">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-3 sm:px-4 sm:py-2 rounded-ios-lg transition-all duration-200 ios-touch-feedback min-h-[44px] ${
                dateFilter === 'today' 
                  ? 'bg-enigma-primary text-white shadow-ios-sm' 
                  : 'text-enigma-neutral-700 hover:bg-enigma-neutral-50'
              }`}
            >
              <span className="ios-text-callout sm:ios-text-subhead font-medium">Hoy</span>
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-3 py-3 sm:px-4 sm:py-2 rounded-ios-lg transition-all duration-200 ios-touch-feedback min-h-[44px] ${
                dateFilter === 'tomorrow' 
                  ? 'bg-enigma-primary text-white shadow-ios-sm' 
                  : 'text-enigma-neutral-700 hover:bg-enigma-neutral-50'
              }`}
            >
              <span className="ios-text-callout sm:ios-text-subhead font-medium">Mañana</span>
            </button>
            <button
              onClick={() => setDateFilter('this_week')}
              className={`px-3 py-3 sm:px-4 sm:py-2 rounded-ios-lg transition-all duration-200 ios-touch-feedback min-h-[44px] ${
                dateFilter === 'this_week' 
                  ? 'bg-enigma-primary text-white shadow-ios-sm' 
                  : 'text-enigma-neutral-700 hover:bg-enigma-neutral-50'
              }`}
            >
              <span className="ios-text-callout sm:ios-text-subhead font-medium text-center">Esta Semana</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Reservations Management */}
      <section>
        <IOSCard variant="elevated" className="shadow-ios-lg">
          <IOSCardHeader className="border-b border-enigma-neutral-200/50 bg-enigma-neutral-25">
            <IOSCardTitle className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-enigma-primary/10 rounded-ios flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-enigma-primary" size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="ios-text-callout sm:ios-text-headline font-semibold text-enigma-neutral-900 block truncate">
                    Reservas Activas
                  </span>
                  <p className="ios-text-caption2 text-enigma-neutral-600 mt-0.5 truncate">
                    {reservasOrdenadas.length} reservas encontradas
                  </p>
                </div>
              </div>
            </IOSCardTitle>
          </IOSCardHeader>
          
          <IOSCardContent className="p-0">
            {reservasOrdenadas.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-enigma-neutral-100 rounded-ios-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar size={24} className="text-enigma-neutral-400 sm:size-8" />
                </div>
                <h3 className="ios-text-callout sm:ios-text-headline font-semibold text-enigma-neutral-900 mb-2">
                  No se encontraron reservas
                </h3>
                <p className="ios-text-footnote sm:ios-text-callout text-enigma-neutral-500 mb-4">
                  Ajusta los filtros para ver más resultados
                </p>
                <IOSButton 
                  variant="primary" 
                  size="default" 
                  onClick={() => navigate('/reservas-nueva')}
                  className="bg-enigma-primary min-h-[44px] w-full sm:w-auto"
                >
                  <Plus size={16} className="mr-2" />
                  Crear Nueva Reserva
                </IOSButton>
              </div>
            ) : (
              <div className="divide-y divide-enigma-neutral-200/30">
                {reservasOrdenadas.map((reserva, index) => {
                  const StatusIcon = getStatusIcon(reserva.estado);
                  const isUrgent = reserva.estado === 'pendiente_confirmacion';
                  const isToday = isTodaySpain(parseISO(reserva.fecha_reserva));
                  
                  return (
                    <div
                      key={reserva.id}
                      onClick={() => setSelectedReservation(reserva)}
                      className={`group relative p-4 sm:p-5 lg:p-6 hover:bg-enigma-neutral-25 transition-all duration-300 cursor-pointer ios-touch-feedback min-h-[80px]
                        ${isUrgent ? 'bg-orange-50/50 border-l-4 border-orange-400' : ''}
                        ${isToday ? 'bg-blue-50/30' : ''}
                      `}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 lg:gap-5">
                        {/* Status Indicator */}
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-ios-lg flex items-center justify-center shadow-ios-sm transition-all duration-200 group-hover:scale-105 flex-shrink-0
                          ${isUrgent ? 'bg-orange-100 border-2 border-orange-200' : 'bg-enigma-primary/10'}
                        `}>
                          <StatusIcon size={18} className="sm:size-[22px]" color={getStatusColor(reserva.estado)} />
                          {isUrgent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                              <AlertTriangle size={8} className="text-white sm:size-[10px]" />
                            </div>
                          )}
                        </div>
                        
                        {/* Reservation Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <h3 className="ios-text-callout sm:ios-text-body font-semibold text-enigma-neutral-900 truncate">
                                  {reserva.nombre}
                                </h3>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  {reserva.primera_visita && (
                                    <IOSBadge variant="secondary" className="bg-enigma-accent/10 text-enigma-accent text-xs">
                                      <Star size={10} className="mr-1" />
                                      Primera
                                    </IOSBadge>
                                  )}
                                  {isToday && (
                                    <IOSBadge variant="secondary" className="bg-blue-500/10 text-blue-600 text-xs">
                                      <Clock size={10} className="mr-1" />
                                      Hoy
                                    </IOSBadge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 ios-text-footnote sm:ios-text-subhead text-enigma-neutral-600">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="sm:size-[14px]" />
                                  <span className="font-medium">
                                    {format(parseISO(reserva.fecha_reserva), "d MMM", { locale: es })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={12} className="sm:size-[14px]" />
                                  <span className="font-medium">{reserva.hora_reserva}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users size={12} className="sm:size-[14px]" />
                                  <span>{reserva.personas}p</span>
                                </div>
                                {reserva.telefono && (
                                  <div className="flex items-center gap-1">
                                    <Phone size={12} className="sm:size-[14px]" />
                                    <span className="font-mono text-xs sm:text-sm">{reserva.telefono}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {reserva.ocasion && (
                                  <IOSBadge variant="secondary" className="bg-enigma-secondary/10 text-enigma-secondary text-xs">
                                    <Coffee size={10} className="mr-1" />
                                    {reserva.ocasion}
                                  </IOSBadge>
                                )}
                                
                                {(reserva.notas || reserva.requisitos_dieteticos) && (
                                  <IOSBadge variant="secondary" className="bg-enigma-accent/10 text-enigma-accent text-xs">
                                    <StickyNote size={10} className="mr-1" />
                                    Notas
                                  </IOSBadge>
                                )}
                              </div>
                              
                              {/* Notas expandibles */}
                              {(reserva.notas || reserva.requisitos_dieteticos) && (
                                <div className="mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newExpanded = new Set(expandedNotes);
                                      if (expandedNotes.has(reserva.id)) {
                                        newExpanded.delete(reserva.id);
                                      } else {
                                        newExpanded.add(reserva.id);
                                      }
                                      setExpandedNotes(newExpanded);
                                    }}
                                    className="flex items-center gap-2 text-enigma-neutral-600 hover:text-enigma-primary transition-colors"
                                  >
                                    <StickyNote size={12} />
                                    <span className="ios-text-caption1 font-medium">
                                      {expandedNotes.has(reserva.id) ? 'Ocultar notas' : 'Ver notas'}
                                    </span>
                                    {expandedNotes.has(reserva.id) ? (
                                      <ChevronUp size={12} />
                                    ) : (
                                      <ChevronDown size={12} />
                                    )}
                                  </button>
                                  
                                  {expandedNotes.has(reserva.id) && (
                                    <div className="mt-2 p-3 bg-enigma-neutral-25 rounded-ios-lg border border-enigma-neutral-200/50">
                                      {reserva.notas && (
                                        <div className="mb-2">
                                          <p className="ios-text-caption2 font-semibold text-enigma-neutral-700 mb-1">Notas:</p>
                                          <p className="ios-text-caption1 text-enigma-neutral-600 leading-relaxed">{reserva.notas}</p>
                                        </div>
                                      )}
                                      {reserva.requisitos_dieteticos && (
                                        <div>
                                          <p className="ios-text-caption2 font-semibold text-enigma-neutral-700 mb-1">Requisitos dietéticos:</p>
                                          <p className="ios-text-caption1 text-enigma-neutral-600 leading-relaxed">{reserva.requisitos_dieteticos}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Action Area */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <StatusBadge status={reserva.estado} />
                              
                              {/* Quick Actions - Solo en hover para desktop */}
                              <div className="hidden lg:group-hover:flex items-center gap-2">
                                <IOSButton variant="secondary" size="sm" className="p-2 min-h-[36px] min-w-[36px]">
                                  <Phone size={14} />
                                </IOSButton>
                                <IOSButton variant="secondary" size="sm" className="p-2 min-h-[36px] min-w-[36px]">
                                  <MessageSquare size={14} />
                                </IOSButton>
                                <IOSButton variant="secondary" size="sm" className="p-2 min-h-[36px] min-w-[36px]">
                                  <Edit size={14} />
                                </IOSButton>
                              </div>
                              
                              <ChevronRight size={16} className="text-enigma-neutral-400 group-hover:text-enigma-primary transition-colors sm:size-[18px]" />
                            </div>
                          </div>
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

      {/* Modal del Calendario - Responsive y Centrado */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="w-[95vw] max-w-5xl h-[90vh] max-h-[800px] bg-white/95 backdrop-blur-lg rounded-ios-lg border border-enigma-neutral-200/50 shadow-ios-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <DialogHeader className="border-b border-enigma-neutral-200/50 pb-4 px-4 sm:px-6 flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-enigma-primary/10 rounded-ios flex items-center justify-center">
                  <CalendarDays size={18} className="text-enigma-primary" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-enigma-primary">Calendario de Reservas</span>
              </div>
              <IOSButton 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-enigma-neutral-100 rounded-ios flex-shrink-0"
              >
                <XCircle size={18} className="text-enigma-neutral-500" />
              </IOSButton>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <SimpleCalendarView reservas={reservas} onClose={() => setShowCalendarModal(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Calendario simple y funcional - VERSION LIMPIA
const SimpleCalendarView = ({ reservas, onClose }: { reservas: any[], onClose: () => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getReservationsForDay = (day: Date) => {
    return reservas.filter(reserva => {
      const reservaDate = parseISO(reserva.fecha_reserva);
      return isSameDay(reservaDate, day);
    });
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Header con navegación */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 flex-shrink-0">
        <IOSButton 
          variant="ghost"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-enigma-neutral-100 rounded-ios"
        >
          <ArrowLeft size={16} className="text-enigma-primary" />
        </IOSButton>
        
        <h3 className="text-lg font-bold text-enigma-primary capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        
        <IOSButton 
          variant="ghost"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-enigma-neutral-100 rounded-ios"
        >
          <ArrowRight size={16} className="text-enigma-primary" />
        </IOSButton>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-slate-200 flex-shrink-0">
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid del calendario - Responsive y centrado */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 h-full">
          {calendarDays.map((day) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());
            const totalReservations = dayReservations.length;
            const totalGuests = dayReservations.reduce((sum, r) => sum + (r.personas || r.numero_comensales || 0), 0);

            // Mapa de calor basado en TOTAL DE PERSONAS (comensales)
            let bgColor = 'bg-white';
            let textColor = 'text-enigma-neutral-600';

            if (!isCurrentMonth) {
              bgColor = 'bg-slate-100';
              textColor = 'text-slate-400';
            } else if (isToday) {
              bgColor = 'bg-enigma-accent';
              textColor = 'text-white';
            } else if (totalGuests === 0) {
              bgColor = 'bg-white';
              textColor = 'text-slate-600';
            } else if (totalGuests <= 5) {
              bgColor = 'bg-enigma-secondary/20';
              textColor = 'text-enigma-secondary';
            } else if (totalGuests <= 10) {
              bgColor = 'bg-enigma-secondary/40';
              textColor = 'text-white';
            } else if (totalGuests <= 15) {
              bgColor = 'bg-enigma-primary/40';
              textColor = 'text-white';
            } else if (totalGuests <= 25) {
              bgColor = 'bg-enigma-primary/70';
              textColor = 'text-white';
            } else if (totalGuests <= 35) {
              bgColor = 'bg-enigma-accent/70';
              textColor = 'text-white';
            } else {
              bgColor = 'bg-enigma-accent';
              textColor = 'text-white';
            }

            return (
              <button
                key={day.toISOString()}
                className={`
                  relative p-1 sm:p-2 flex flex-col justify-between
                  border border-slate-200 transition-all duration-200
                  ${bgColor} hover:opacity-80 rounded-md
                  aspect-square min-h-0
                  ${totalGuests > 0 && isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`ios-text-callout font-bold ${textColor}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {totalReservations > 0 && isCurrentMonth && (
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className={`${textColor} font-bold text-sm sm:text-lg leading-none`}>
                      {totalReservations}
                    </div>
                    <div className={`${textColor} text-xs opacity-90`}>
                      res
                    </div>
                    <div className={`${textColor} font-semibold text-xs sm:text-sm leading-none mt-1`}>
                      {totalGuests}
                    </div>
                    <div className={`${textColor} text-xs opacity-80`}>
                      per
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leyenda del Mapa de Calor basado en COMENSALES */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
        <div className="text-center mb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mapa de Calor por Comensales</h4>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white border border-slate-200 rounded"></div>
            <span className="text-slate-600 font-medium">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-enigma-secondary/20 border border-enigma-secondary/30 rounded"></div>
            <span className="text-slate-600 font-medium">1-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-enigma-secondary/40 border border-enigma-secondary/50 rounded"></div>
            <span className="text-slate-600 font-medium">6-10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-enigma-primary/40 border border-enigma-primary/50 rounded"></div>
            <span className="text-slate-600 font-medium">11-15</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-enigma-primary/70 border border-enigma-primary/80 rounded"></div>
            <span className="text-slate-600 font-medium">16-25</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-enigma-accent/70 border border-enigma-accent/80 rounded"></div>
            <span className="text-slate-600 font-medium">26-35</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-enigma-accent border border-enigma-accent rounded"></div>
            <span className="text-slate-600 font-medium">36+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
