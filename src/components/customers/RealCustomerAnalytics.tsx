import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Star, Calendar, 
  Activity, AlertTriangle, Target, BarChart3, PieChart,
  ArrowUp, ArrowDown, Minus, Clock, MapPin, User
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { useCustomerStats } from '@/hooks/useCustomersEnhanced';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RealCustomerAnalyticsProps {
  customers: Array<{
    id: string;
    nombre: string;
    apellido: string;
    fecha_creacion: string;
    ultima_visita?: string;
    vip_status: boolean;
  }>;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

export function RealCustomerAnalytics({ 
  customers, 
  timeRange, 
  onTimeRangeChange 
}: RealCustomerAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { data: stats } = useCustomerStats();

  // Calculate real analytics from actual customer data
  const calculateAnalytics = () => {
    const now = new Date();
    const startOfPeriod = new Date();
    
    switch (timeRange) {
      case 'week':
        startOfPeriod.setDate(now.getDate() - 7);
        break;
      case 'month':
        startOfPeriod.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startOfPeriod.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startOfPeriod.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filter customers by time period
    const customersInPeriod = customers.filter(customer => 
      new Date(customer.fecha_creacion) >= startOfPeriod
    );

    // Calculate trends (comparing with previous period)
    const previousPeriodStart = new Date(startOfPeriod);
    const periodLength = now.getTime() - startOfPeriod.getTime();
    previousPeriodStart.setTime(startOfPeriod.getTime() - periodLength);
    
    const customersPrevPeriod = customers.filter(customer => 
      new Date(customer.fecha_creacion) >= previousPeriodStart && 
      new Date(customer.fecha_creacion) < startOfPeriod
    );

    const customerTrend = customersPrevPeriod.length > 0 
      ? Math.round(((customersInPeriod.length - customersPrevPeriod.length) / customersPrevPeriod.length) * 100)
      : 0;

    // Risk customers (no visit in 3+ months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    const riskCustomers = customers.filter(customer => 
      !customer.ultima_visita || new Date(customer.ultima_visita) < threeMonthsAgo
    );

    // Segmentation
    const segments = [
      { 
        name: 'VIP', 
        count: stats?.vip || 0, 
        percentage: Math.round(((stats?.vip || 0) / (stats?.total || 1)) * 100), 
        color: '#CB5910' 
      },
      { 
        name: 'Activos', 
        count: stats?.activos || 0, 
        percentage: Math.round(((stats?.activos || 0) / (stats?.total || 1)) * 100), 
        color: '#237584' 
      },
      { 
        name: 'Nuevos', 
        count: stats?.nuevos || 0, 
        percentage: Math.round(((stats?.nuevos || 0) / (stats?.total || 1)) * 100), 
        color: '#9FB289' 
      },
      { 
        name: 'Inactivos', 
        count: stats?.inactivos || 0, 
        percentage: Math.round(((stats?.inactivos || 0) / (stats?.total || 1)) * 100), 
        color: '#6B7280' 
      }
    ];

    return {
      totalCustomers: stats?.total || 0,
      newCustomers: customersInPeriod.length,
      customerTrend,
      retentionRate: stats?.retencion || 0,
      segments,
      riskCustomers: riskCustomers.slice(0, 10).map(customer => ({
        id: customer.id,
        name: `${customer.nombre} ${customer.apellido}`,
        lastVisit: customer.ultima_visita || 'Nunca',
        riskScore: !customer.ultima_visita ? 95 : 
                  new Date(customer.ultima_visita) < threeMonthsAgo ? 85 : 45
      }))
    };
  };

  const analytics = calculateAnalytics();

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    subtitle, 
    color, 
    icon: Icon,
    onClick,
    isSelected = false
  }: {
    title: string;
    value: string | number;
    trend?: number;
    subtitle: string;
    color: string;
    icon: any;
    onClick?: () => void;
    isSelected?: boolean;
  }) => {
    const TrendIcon = trend && trend > 0 ? ArrowUp : trend && trend < 0 ? ArrowDown : Minus;
    const trendColor = trend && trend > 0 ? '#34C759' : trend && trend < 0 ? '#FF3B30' : '#8E8E93';

    return (
      <IOSCard 
        variant="elevated" 
        className={`cursor-pointer transition-all duration-300 hover:scale-102 ios-touch-feedback ${
          isSelected ? 'ring-2 ring-enigma-primary/30 shadow-ios-lg' : ''
        }`}
        onClick={onClick}
      >
        <IOSCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-ios flex items-center justify-center shadow-ios"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={24} style={{ color }} />
            </div>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                <TrendIcon size={16} style={{ color: trendColor }} />
                <span 
                  className="ios-text-caption1 font-bold"
                  style={{ color: trendColor }}
                >
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="ios-text-footnote text-enigma-neutral-600 font-semibold uppercase tracking-wide">
              {title}
            </p>
            <p 
              className="ios-text-title1 font-bold"
              style={{ color }}
            >
              {value}
            </p>
            <p className="ios-text-caption1 text-enigma-neutral-500">
              {subtitle}
            </p>
          </div>
        </IOSCardContent>
      </IOSCard>
    );
  };

  const SegmentChart = () => (
    <IOSCard variant="elevated" className="col-span-1">
      <IOSCardHeader>
        <IOSCardTitle className="flex items-center gap-2">
          <PieChart size={20} className="text-enigma-primary" />
          Segmentación Real de Clientes
        </IOSCardTitle>
      </IOSCardHeader>
      <IOSCardContent className="p-6">
        <div className="space-y-4">
          {analytics.segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-ios"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="ios-text-callout text-enigma-neutral-900 font-medium">
                  {segment.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="ios-text-callout font-bold text-enigma-neutral-900">
                  {segment.count}
                </span>
                <IOSBadge 
                  variant="custom" 
                  size="sm"
                  style={{ backgroundColor: `${segment.color}20`, color: segment.color }}
                >
                  {segment.percentage}%
                </IOSBadge>
              </div>
            </div>
          ))}
        </div>
      </IOSCardContent>
    </IOSCard>
  );

  const RiskCustomersAlert = () => (
    <IOSCard variant="elevated" className="col-span-full">
      <IOSCardHeader>
        <IOSCardTitle className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-enigma-accent" />
          Clientes en Riesgo (Datos Reales)
          <IOSBadge variant="custom" className="bg-enigma-accent/20 text-enigma-accent">
            {analytics.riskCustomers.length}
          </IOSBadge>
        </IOSCardTitle>
      </IOSCardHeader>
      <IOSCardContent className="p-6">
        {analytics.riskCustomers.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
            <p className="ios-text-callout text-enigma-neutral-500">
              ¡Excelente! No hay clientes en riesgo de abandono
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.riskCustomers.map((customer) => (
              <div 
                key={customer.id}
                className="p-4 rounded-ios border border-enigma-accent/30 bg-enigma-accent/5 hover:bg-enigma-accent/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="ios-text-callout font-semibold text-enigma-neutral-900">
                    {customer.name}
                  </h4>
                  <IOSBadge 
                    variant="custom" 
                    size="sm"
                    className="bg-enigma-accent text-white"
                  >
                    {customer.riskScore}%
                  </IOSBadge>
                </div>
                <div className="flex items-center gap-1 text-enigma-neutral-600">
                  <Clock size={12} />
                  <span className="ios-text-caption1">
                    Última visita: {customer.lastVisit === 'Nunca' ? 'Nunca' : 
                      formatDistanceToNow(new Date(customer.lastVisit), { locale: es, addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </IOSCardContent>
    </IOSCard>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ios-text-title2 font-bold text-enigma-neutral-900">
            Analytics de Clientes (Datos Reales)
          </h2>
          <p className="ios-text-callout text-enigma-neutral-600 mt-1">
            Insights basados en datos reales de la base de datos
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-enigma-neutral-100/50 rounded-ios p-1">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <IOSButton
              key={range}
              variant={timeRange === range ? "primary" : "ghost"}
              size="sm"
              onClick={() => onTimeRangeChange(range)}
              className={`px-4 py-2 ${
                timeRange === range 
                  ? 'bg-enigma-primary text-white shadow-ios' 
                  : 'text-enigma-neutral-600 hover:text-enigma-primary hover:bg-white/50'
              }`}
            >
              {range === 'week' ? 'Semana' :
               range === 'month' ? 'Mes' :
               range === 'quarter' ? 'Trimestre' : 'Año'}
            </IOSButton>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Clientes"
          value={analytics.totalCustomers.toLocaleString()}
          trend={analytics.customerTrend}
          subtitle={`+${analytics.newCustomers} este ${timeRange === 'week' ? 'semana' : 'período'}`}
          color="#237584"
          icon={Users}
          onClick={() => setSelectedMetric(selectedMetric === 'total' ? null : 'total')}
          isSelected={selectedMetric === 'total'}
        />
        
        <MetricCard
          title="Clientes VIP"
          value={analytics.segments.find(s => s.name === 'VIP')?.count || 0}
          subtitle="Clientes premium activos"
          color="#CB5910"
          icon={Star}
          onClick={() => setSelectedMetric(selectedMetric === 'vip' ? null : 'vip')}
          isSelected={selectedMetric === 'vip'}
        />
        
        <MetricCard
          title="Tasa Retención"
          value={`${analytics.retentionRate}%`}
          subtitle="Clientes que regresan"
          color="#9FB289"
          icon={Target}
          onClick={() => setSelectedMetric(selectedMetric === 'retention' ? null : 'retention')}
          isSelected={selectedMetric === 'retention'}
        />
        
        <MetricCard
          title="En Riesgo"
          value={analytics.riskCustomers.length}
          subtitle="Requieren atención"
          color="#FF3B30"
          icon={AlertTriangle}
          onClick={() => setSelectedMetric(selectedMetric === 'risk' ? null : 'risk')}
          isSelected={selectedMetric === 'risk'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SegmentChart />
        
        <IOSCard variant="elevated" className="col-span-1">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-enigma-primary" />
              Resumen por Período
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-enigma-neutral-50 rounded-ios">
                <span className="ios-text-callout font-medium text-enigma-neutral-900">
                  Nuevos clientes ({timeRange})
                </span>
                <span className="ios-text-callout font-bold text-enigma-primary">
                  {analytics.newCustomers}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-enigma-neutral-50 rounded-ios">
                <span className="ios-text-callout font-medium text-enigma-neutral-900">
                  Tendencia de crecimiento
                </span>
                <span 
                  className="ios-text-callout font-bold"
                  style={{ 
                    color: analytics.customerTrend >= 0 ? '#34C759' : '#FF3B30' 
                  }}
                >
                  {analytics.customerTrend >= 0 ? '+' : ''}{analytics.customerTrend}%
                </span>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>

      {/* Risk Customers Alert */}
      <RiskCustomersAlert />
    </div>
  );
}