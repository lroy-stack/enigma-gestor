
import React from 'react';
import { 
  Calendar, CheckCircle, Clock, Crown
} from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { useReservationStats } from '@/hooks/useReservations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { ReservationStats } from '@/types/database';

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

export function ReservationStatsCards() {
  const { data: stats, isLoading } = useReservationStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <IOSCard key={i} variant="elevated" className="animate-pulse">
            <IOSCardContent className="enigma-spacing-md">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-enigma-neutral-200 rounded w-16"></div>
                  <div className="h-8 bg-enigma-neutral-200 rounded w-12"></div>
                  <div className="h-3 bg-enigma-neutral-200 rounded w-24"></div>
                </div>
                <div className="w-14 h-14 bg-enigma-neutral-200 rounded-ios-lg"></div>
              </div>
            </IOSCardContent>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Type guard para asegurar que stats es ReservationStats
  const reservationStats = stats as ReservationStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Reservas Hoy"
        value={reservationStats.total_reservas || 0}
        subtitle={`${reservationStats.total_comensales || 0} comensales totales`}
        color="#237584"
        icon={Calendar}
        trend={12}
      />
      <StatCard
        title="Confirmadas"
        value={reservationStats.confirmadas || 0}
        subtitle="Listas para el servicio"
        color="#9FB289"
        icon={CheckCircle}
        trend={5}
      />
      <StatCard
        title="Pendientes"
        value={reservationStats.pendientes || 0}
        subtitle="Requieren confirmación"
        color="#FF9500"
        icon={Clock}
        trend={-2}
      />
      <StatCard
        title="Completadas"
        value={reservationStats.completadas || 0}
        subtitle="Servicios finalizados"
        color="#CB5910"
        icon={Crown}
        trend={8}
      />
    </div>
  );
}
