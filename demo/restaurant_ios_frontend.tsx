import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Package, 
  BarChart3, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronRight,
  Phone,
  Star,
  Utensils,
  ShoppingCart
} from 'lucide-react';

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Datos del día
  const todayStats = {
    reservations: 47,
    covers: 156,
    revenue: 12450,
    avgOrder: 79.80
  };

  const lowStockItems = [
    { name: 'Filetes de Salmón', stock: 3, unit: 'kg' },
    { name: 'Aceite de Trufa', stock: 0.5, unit: 'L' },
    { name: 'Albahaca Fresca', stock: 2, unit: 'manojos' }
  ];

  const upcomingReservations = [
    { id: 1, name: 'Familia García', time: '19:30', party: 4, table: 12, special: 'Aniversario' },
    { id: 2, name: 'Empresas López', time: '20:00', party: 8, table: 5, special: 'Cena de negocios' },
    { id: 3, name: 'Martínez', time: '20:15', party: 2, table: 8, special: '' }
  ];

  const staffOnDuty = [
    { name: 'Ana Morales', position: 'Jefa de Cocina', status: 'active', hours: 6.5 },
    { name: 'Carlos Ruiz', position: 'Camarero', status: 'active', hours: 4.2 },
    { name: 'Elena Vázquez', position: 'Anfitriona', status: 'break', hours: 3.8 },
    { name: 'David Kim', position: 'Barman', status: 'active', hours: 5.1 }
  ];

  // Componente de tarjeta con glassmorphismo
  const GlassCard = ({ children, className = '', onClick }) => (
    <div 
      className={`
        backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl
        shadow-2xl hover:bg-opacity-15 transition-all duration-300
        hover:shadow-3xl hover:scale-105 cursor-pointer
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }) => (
    <GlassCard className="p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 from-opacity-20 to-orange-500 to-opacity-20 group-hover:from-opacity-30 group-hover:to-opacity-30 transition-all duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-white text-opacity-70 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-white text-opacity-50 text-xs">{subtitle}</p>}
      </div>
    </GlassCard>
  );

  const TabButton = ({ icon: Icon, label, isActive, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center space-y-1 px-4 py-2 rounded-xl
        transition-all duration-200 min-w-[70px]
        ${isActive 
          ? 'bg-white bg-opacity-20 text-white shadow-lg' 
          : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
        }
      `}
    >
      <div className="relative">
        <Icon className="w-6 h-6" />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  // Isotipo ENIGMA simplificado
  const EnigmaIsotipo = () => (
    <div className="w-8 h-8 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white rounded-full relative">
        <div className="absolute inset-1 border border-white border-opacity-60 rounded-full"></div>
        <div className="absolute top-1/2 right-1 w-1 h-1 bg-white rounded-full"></div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Buenas Noches</h1>
          <p className="text-white text-opacity-70">Esto es lo que está pasando en tu restaurante hoy</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-white text-opacity-70 text-sm">
            {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Cuadrícula de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Calendar} 
          title="Reservas de Hoy" 
          value={todayStats.reservations}
          subtitle="12 no presentados"
          trend="+8%"
        />
        <StatCard 
          icon={Users} 
          title="Comensales Servidos" 
          value={todayStats.covers}
          subtitle="Promedio mesa: 3.2"
          trend="+15%"
        />
        <StatCard 
          icon={DollarSign} 
          title="Facturación" 
          value={`€${todayStats.revenue.toLocaleString()}`}
          subtitle="Objetivo: €15,000"
          trend="+22%"
        />
        <StatCard 
          icon={BarChart3} 
          title="Ticket Promedio" 
          value={`€${todayStats.avgOrder}`}
          subtitle="vs €75.20 ayer"
          trend="+6%"
        />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas reservas */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Próximas Reservas</h2>
              <button className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1">
                <span>Ver Todas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{reservation.time}</div>
                      <div className="text-xs text-white text-opacity-60">Mesa {reservation.table}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{reservation.name}</div>
                      <div className="text-sm text-white text-opacity-70">{reservation.party} comensales</div>
                      {reservation.special && (
                        <div className="text-xs text-orange-400 mt-1">{reservation.special}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-green-500 bg-opacity-20 text-green-400 rounded-lg hover:bg-opacity-30 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-blue-500 bg-opacity-20 text-blue-400 rounded-lg hover:bg-opacity-30 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Alertas y acciones */}
        <div className="space-y-6">
          {/* Alerta de stock bajo */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500 bg-opacity-20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-bold text-white">Alerta de Stock</h3>
            </div>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-white text-opacity-60 text-xs">{item.stock} {item.unit} restantes</div>
                  </div>
                  <button className="p-2 bg-orange-500 bg-opacity-20 text-orange-400 rounded-lg hover:bg-opacity-30 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Personal en turno */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Personal en Turno</h3>
            <div className="space-y-3">
              {staffOnDuty.map((staff, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      staff.status === 'active' ? 'bg-green-400' : 
                      staff.status === 'break' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-white text-sm font-medium">{staff.name}</div>
                      <div className="text-white text-opacity-60 text-xs">{staff.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{staff.hours}h</div>
                    <div className="text-white text-opacity-60 text-xs">hoy</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  const ReservationsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Reservas</h1>
        <button className="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-blue-400 px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Calendar} title="Reservas de Hoy" value="47" />
        <StatCard icon={Users} title="Total Comensales" value="156" />
        <StatCard icon={Clock} title="Duración Promedio" value="1h 45m" />
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Horario de Hoy</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar reservas..."
                className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="p-4 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">Mesa {Math.floor(Math.random() * 20) + 1}</div>
                  <div className="text-sm text-white text-opacity-70">{18 + i}:00 - {19 + i}:30</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{Math.floor(Math.random() * 6) + 2} comensales</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    Math.random() > 0.5 ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {Math.random() > 0.5 ? 'Confirmada' : 'Pendiente'}
                  </div>
                </div>
              </div>
              <div className="text-white font-medium mb-2">Cliente {i + 1}</div>
              <div className="flex items-center space-x-2 text-white text-opacity-60 text-sm">
                <Phone className="w-4 h-4" />
                <span>+34 123 456 789</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  const InventoryView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Inventario</h1>
        <button className="bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-400 px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Añadir Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} title="Total Productos" value="247" />
        <StatCard icon={AlertTriangle} title="Stock Bajo" value="12" />
        <StatCard icon={DollarSign} title="Valor Inventario" value="€28,450" />
        <StatCard icon={TrendingUp} title="Uso Mensual" value="85%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Productos de Inventario</h2>
            <div className="space-y-4">
              {[
                { name: 'Solomillo de Ternera Premium', category: 'Carnes', stock: 45, unit: 'kg', status: 'good' },
                { name: 'Salmón Atlántico Fresco', category: 'Pescados', stock: 8, unit: 'kg', status: 'low' },
                { name: 'Mix de Verduras Orgánicas', category: 'Vegetales', stock: 120, unit: 'kg', status: 'good' },
                { name: 'Aceite de Trufa', category: 'Aceites', stock: 2, unit: 'L', status: 'critical' },
                { name: 'Parmesano Curado', category: 'Lácteos', stock: 25, unit: 'kg', status: 'good' },
                { name: 'Hierbas Frescas Variadas', category: 'Vegetales', stock: 15, unit: 'manojos', status: 'low' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'good' ? 'bg-green-400' :
                      item.status === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-white text-opacity-70">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.stock} {item.unit}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'good' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                      item.status === 'low' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                      'bg-red-500 bg-opacity-20 text-red-400'
                    }`}>
                      {item.status === 'good' ? 'En Stock' :
                       item.status === 'low' ? 'Stock Bajo' : 'Crítico'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-500 bg-opacity-20 text-blue-400 rounded-xl hover:bg-opacity-30 transition-colors flex items-center space-x-3">
                <ShoppingCart className="w-5 h-5" />
                <span>Generar Pedidos</span>
              </button>
              <button className="w-full p-3 bg-purple-500 bg-opacity-20 text-purple-400 rounded-xl hover:bg-opacity-30 transition-colors flex items-center space-x-3">
                <BarChart3 className="w-5 h-5" />
                <span>Reporte de Uso</span>
              </button>
              <button className="w-full p-3 bg-orange-500 bg-opacity-20 text-orange-400 rounded-xl hover:bg-opacity-30 transition-colors flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5" />
                <span>Control de Mermas</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Pedidos Recientes</h3>
            <div className="space-y-3">
              {['Distribuciones Gourmet', 'Pescados del Mar', 'Carnes Premium'].map((supplier, index) => (
                <div key={index} className="p-3 bg-white bg-opacity-5 rounded-lg">
                  <div className="font-medium text-white text-sm">{supplier}</div>
                  <div className="text-white text-opacity-60 text-xs">Pedido #PED-{1000 + index}</div>
                  <div className="text-green-400 text-xs mt-1">Entregado</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Análisis</h1>
        <div className="flex items-center space-x-3">
          <select className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} title="Facturación" value="€45,230" trend="+12%" />
        <StatCard icon={Users} title="Clientes" value="1,247" trend="+8%" />
        <StatCard icon={Utensils} title="Pedidos" value="892" trend="+15%" />
        <StatCard icon={Star} title="Valoración Media" value="4.8" trend="+0.2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Tendencias de Facturación</h2>
          <div className="h-64 bg-white bg-opacity-5 rounded-xl flex items-center justify-center">
            <div className="text-white text-opacity-50">Componente de Gráfico</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Platos Más Populares</h2>
          <div className="space-y-4">
            {[
              { name: 'Salmón a la Plancha', orders: 89, revenue: '€1,245' },
              { name: 'Solomillo de Ternera', orders: 67, revenue: '€2,010' },
              { name: 'Pasta Carbonara', orders: 54, revenue: '€864' },
              { name: 'Ensalada César', orders: 42, revenue: '€378' },
              { name: 'Postre de Chocolate', orders: 38, revenue: '€342' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                <div>
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-sm text-white text-opacity-70">{item.orders} pedidos</div>
                </div>
                <div className="text-green-400 font-medium">{item.revenue}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Insights de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">94%</div>
            <div className="text-white text-opacity-70">Satisfacción del Cliente</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">1h 42m</div>
            <div className="text-white text-opacity-70">Rotación Promedio Mesa</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">18%</div>
            <div className="text-white text-opacity-70">Ratio Coste Alimentos</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-green-600 relative overflow-hidden">
      {/* Elementos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 bg-opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 bg-opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 bg-opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Encabezado */}
      <header className="relative z-10 backdrop-blur-xl bg-white bg-opacity-5 border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-teal-500 from-opacity-20 to-orange-500 to-opacity-20 rounded-xl">
                <EnigmaIsotipo />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ENIGMA</h1>
                <p className="text-white text-opacity-70 text-sm">COCINA • CON ALMA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-colors">
                <Bell className="w-6 h-6 text-white" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </button>
              <button className="p-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-colors">
                <Settings className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'reservations' && <ReservationsView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Navegación inferior */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-2 shadow-2xl">
          <div className="flex items-center space-x-2">
            <TabButton 
              icon={BarChart3} 
              label="Panel" 
              isActive={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <TabButton 
              icon={Calendar} 
              label="Reservas" 
              isActive={activeTab === 'reservations'}
              onClick={() => setActiveTab('reservations')}
              badge={5}
            />
            <TabButton 
              icon={Package} 
              label="Inventario" 
              isActive={activeTab === 'inventory'}
              onClick={() => setActiveTab('inventory')}
              badge={3}
            />
            <TabButton 
              icon={TrendingUp} 
              label="Análisis" 
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default RestaurantDashboard;