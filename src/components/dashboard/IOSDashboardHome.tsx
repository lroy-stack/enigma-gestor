
import { StatsWidget } from '@/components/features/StatsWidget';
import { UpcomingReservationsWidget } from '@/components/features/UpcomingReservationsWidget';
import { TablesStatusWidget } from '@/components/features/TablesStatusWidget';
import { QuickActionsWidget } from '@/components/features/QuickActionsWidget';
import { RestaurantStatsWidget } from './RestaurantStatsWidget';
import { TodayReservationsWidget } from './TodayReservationsWidget';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useTodayReservations } from '@/hooks/useRestaurantStats';
import { Calendar, Users, Grid3X3, DollarSign } from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';

export function IOSDashboardHome() {
  const { data: tables = [] } = useTablesWithStates();
  const { data: todayReservations = [] } = useTodayReservations();

  // Calcular métricas básicas
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.estado?.estado === 'ocupada').length;
  const reservedTables = tables.filter(t => t.estado?.estado === 'reservada').length;
  const availableTables = tables.filter(t => t.estado?.estado === 'libre').length;

  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  const mockStats = [
    {
      title: 'Reservas Hoy',
      value: todayReservations.length,
      change: 12,
      changeType: 'increase' as const,
      icon: Calendar,
      color: 'var(--enigma-primary)',
    },
    {
      title: 'Clientes Atendidos',
      value: 156,
      change: 8,
      changeType: 'increase' as const,
      icon: Users,
      color: 'var(--enigma-secondary)',
    },
    {
      title: 'Ocupación',
      value: `${occupancyRate}%`,
      change: 5,
      changeType: 'increase' as const,
      icon: Grid3X3,
      color: 'var(--enigma-accent)',
    },
    {
      title: 'Ingresos Est.',
      value: '€2,340',
      change: 15,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'var(--enigma-neutral-600)',
    },
  ];

  // Preparar datos para UpcomingReservationsWidget
  const upcomingReservations = todayReservations
    .filter(r => r.estado_reserva !== 'completada' && r.estado_reserva !== 'cancelada_usuario')
    .slice(0, 5)
    .map(r => ({
      id: r.id || '',
      hora_reserva: r.hora_reserva || '',
      cliente_nombre: r.cliente_nombre?.split(' ')[0] || 'Cliente',
      cliente_apellido: r.cliente_nombre?.split(' ').slice(1).join(' ') || '',
      numero_comensales: r.numero_comensales || 1,
      mesa_numero: r.numero_mesa || undefined,
      estado_reserva: r.estado_reserva as 'pendiente_confirmacion' | 'confirmada' | 'cancelada_usuario' | 'cancelada_restaurante' | 'completada' | 'no_show'
    }));

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Header iOS style */}
      <div className="bg-white/95 backdrop-blur-ios border-b border-enigma-neutral-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
            Enigma Cocina con Alma
          </h1>
          <p className="ios-text-subhead text-enigma-neutral-500">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Main Content con padding iOS */}
      <div className="p-6 space-y-6">
        {/* Métricas principales con iOS Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockStats.map((metric, index) => (
            <IOSCard key={index} variant="elevated" className="ios-touch-feedback bg-white">
              <IOSCardContent className="text-center p-4">
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-ios-lg mb-3"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                </div>
                <div className="ios-text-title2 font-bold text-enigma-neutral-900 mb-1">
                  {metric.value}
                </div>
                <div className="ios-text-footnote text-enigma-neutral-500 mb-2">
                  {metric.title}
                </div>
                <div className="flex items-center justify-center text-xs">
                  <span className={`${metric.changeType === 'increase' ? 'text-ios-green' : 'text-ios-red'}`}>
                    {metric.changeType === 'increase' ? '+' : '-'}{Math.abs(metric.change)}%
                  </span>
                  <span className="text-enigma-neutral-500 ml-1">vs. ayer</span>
                </div>
              </IOSCardContent>
            </IOSCard>
          ))}
        </div>

        {/* Primera fila de widgets con estilo iOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IOSCard variant="glass" className="overflow-hidden bg-white">
            <RestaurantStatsWidget />
          </IOSCard>
          <IOSCard variant="glass" className="overflow-hidden bg-white">
            <TodayReservationsWidget />
          </IOSCard>
        </div>

        {/* Segunda fila de widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <IOSCard variant="default" className="overflow-hidden bg-white">
            <TablesStatusWidget tables={tables.map(table => ({
              id: table.id,
              numero_mesa: table.numero_mesa,
              capacidad: table.capacidad,
              estado: table.estado?.estado || 'libre',
              tiempo_estimado: table.estado?.tiempo_estimado_liberacion ? 
                new Date(table.estado.tiempo_estimado_liberacion).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : undefined,
              tipo_mesa: table.tipo_mesa
            }))} />
          </IOSCard>
          
          <IOSCard variant="default" className="overflow-hidden bg-white">
            <UpcomingReservationsWidget 
              reservations={upcomingReservations}
              onConfirm={(id) => console.log('Confirmar:', id)}
              onEdit={(id) => console.log('Editar:', id)}
            />
          </IOSCard>
          
          <IOSCard variant="default" className="overflow-hidden bg-white">
            <QuickActionsWidget />
          </IOSCard>
        </div>
      </div>
    </div>
  );
}
