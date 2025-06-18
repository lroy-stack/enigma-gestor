export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  icon?: string;
  category: 'behavior' | 'preference' | 'status' | 'location' | 'custom';
  customerCount: number;
  createdAt: string;
  isSystem: boolean;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  count: number;
  createdAt: string;
}

export interface CustomerAnalytics {
  totalVisits: number;
  totalReservations: number;
  avgDuration: number;
  avgSatisfaction: number;
  favoriteTable: string;
  preferredTimeSlot: string;
  churnRisk: number;
  lifetimeValue: number;
  lastContactDate?: string;
}

export interface CustomerReservation {
  id: string;
  fecha: string;
  mesa: string;
  comensales: number;
  estado: 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
}

export interface CustomerVisit {
  id: string;
  fecha: string;
  mesa: string;
  duracion: number;
  satisfaccion?: number;
  gasto?: number;
}

export interface EnhancedCustomer {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_creacion: string;
  ultima_visita?: string;
  vip_status: boolean;
  idioma_preferido: string;
  preferencias_dieteticas?: string[];
  notas_privadas?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  tags?: string[];
  reservations: CustomerReservation[];
  visitHistory: CustomerVisit[];
  analytics: CustomerAnalytics;
}

export interface AnalyticsData {
  totalCustomers: number;
  newCustomers: number;
  vipCustomers: number;
  activeCustomers: number;
  churnRate: number;
  avgReservationsPerCustomer: number;
  avgVisitFrequency: number;
  retentionRate: number;
  satisfactionScore: number;
  trends: {
    customers: number;
    reservations: number;
    visits: number;
    satisfaction: number;
  };
  segments: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  visitPatterns: Array<{
    day: string;
    visits: number;
    reservations: number;
  }>;
  riskCustomers: Array<{
    id: string;
    name: string;
    lastVisit: string;
    riskScore: number;
  }>;
}

export interface TimelineEvent {
  id: string;
  type: 'reservation' | 'visit' | 'call' | 'email' | 'whatsapp' | 'note' | 'birthday' | 'anniversary' | 'promotion' | 'feedback';
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
  important?: boolean;
}