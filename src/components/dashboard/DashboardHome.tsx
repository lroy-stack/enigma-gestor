
import { StatsWidget } from '@/components/features/StatsWidget';
import { UpcomingReservationsWidget } from '@/components/features/UpcomingReservationsWidget';
import { TablesStatusWidget } from '@/components/features/TablesStatusWidget';
import { QuickActionsWidget } from '@/components/features/QuickActionsWidget';
import { RestaurantStatsWidget } from './RestaurantStatsWidget';
import { TodayReservationsWidget } from './TodayReservationsWidget';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useTodayReservations } from '@/hooks/useRestaurantStats';
import { Calendar, Users, Grid3X3, DollarSign } from 'lucide-react';

export function DashboardHome() {
  const { data: tables = [] } = useTablesWithStates();
  const { data: rawTodayReservations = [] } = useTodayReservations();

  // Calcular métricas básicas de mesas
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.estado?.estado === 'ocupada').length;
  const reservedTables = tables.filter(t => t.estado?.estado === 'reservada').length;
  const availableTables = tables.filter(t => t.estado?.estado === 'libre').length;

  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Procesar reservas válidas de forma segura
  const todayReservations = Array.isArray(rawTodayReservations) 
    ? rawTodayReservations.filter(reservation => 
        reservation && 
        typeof reservation === 'object' && 
        'estado_reserva' in reservation &&
        reservation.estado_reserva !== 'cancelada_usuario' && 
        reservation.estado_reserva !== 'cancelada_restaurante'
      )
    : [];

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

  // Preparar datos para UpcomingReservationsWidget - solo reservas válidas
  const upcomingReservations = todayReservations
    .filter(reservation => 
      reservation.estado_reserva !== 'completada' && 
      reservation.estado_reserva !== 'cancelada_usuario' &&
      reservation.hora_reserva &&
      reservation.cliente_nombre
    )
    .slice(0, 5)
    .map(reservation => ({
      id: reservation.id || '',
      hora_reserva: reservation.hora_reserva || '',
      cliente_nombre: reservation.cliente_nombre?.split(' ')[0] || 'Cliente',
      cliente_apellido: reservation.cliente_nombre?.split(' ').slice(1).join(' ') || '',
      numero_comensales: reservation.numero_comensales || 1,
      mesa_numero: reservation.numero_mesa || undefined,
      estado_reserva: reservation.estado_reserva as 'pendiente_confirmacion' | 'confirmada' | 'cancelada_usuario' | 'cancelada_restaurante'| 'completada' | 'no_show'
    }));

  return (
    <div className="space-y-6 bg-ios-background min-h-screen p-6">
      {/* Encabezado */}
      <div className="bg-white rounded-ios-lg p-6 shadow-ios border border-enigma-neutral-200">
        <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
          Dashboard - Enigma Cocina con Alma
        </h1>
        <p className="text-enigma-neutral-500 mt-2 ios-text-callout">
          Resumen de operaciones del {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Métricas principales */}
      <StatsWidget metrics={mockStats} />

      {/* Primera fila de widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 overflow-hidden">
          <RestaurantStatsWidget />
        </div>
        <div className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 overflow-hidden">
          <TodayReservationsWidget />
        </div>
      </div>

      {/* Segunda fila de widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 overflow-hidden">
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
        </div>
        
        <div className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 overflow-hidden">
          <UpcomingReservationsWidget 
            reservations={upcomingReservations}
            onConfirm={(id) => console.log('Confirmar:', id)}
            onEdit={(id) => console.log('Editar:', id)}
          />
        </div>
        
        <div className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 overflow-hidden">
          <QuickActionsWidget />
        </div>
      </div>
    </div>
  );
}
