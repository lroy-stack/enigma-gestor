
import React, { useState, useEffect } from 'react';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useRestaurantStats } from '@/hooks/useRestaurantStats';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TableData {
  id: string;
  numero_mesa: string;
  capacidad: number;
  tipo_mesa: string;
  ubicacion_descripcion?: string;
  activa: boolean;
  position_x: number;
  position_y: number;
  notas_mesa?: string;
  estado?: {
    estado: 'libre' | 'ocupada' | 'reservada' | 'limpieza' | 'fuera_servicio';
    tiempo_ocupacion?: string;
    tiempo_estimado_liberacion?: string;
    notas_estado?: string;
    reserva_id?: string;
  };
  // Datos de reserva si existe
  reserva?: {
    cliente_nombre?: string;
    telefono?: string;
    zona?: string;
    numero_comensales?: number;
    hora_reserva?: string;
    notas_cliente?: string;
  };
}

const PremiumRestaurantFloor = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState('interior');
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const { data: tablesData, isLoading: loadingTables } = useTablesWithStates();
  const { data: restaurantStats } = useRestaurantStats();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loadingTables) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F2F2F7'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  const allTables: TableData[] = tablesData?.map(table => ({
    ...table,
    reserva: undefined // Por ahora no tenemos datos de reserva vinculados
  })) || [];

  const notifications = [
    { id: 1, type: 'warning', message: 'Mesa necesita limpieza', time: '2min', urgent: true },
    { id: 2, type: 'info', message: 'Nueva reserva confirmada', time: '5min', urgent: false },
    { id: 3, type: 'success', message: 'Mesa liberada', time: '8min', urgent: false },
  ];

  const getCurrentTables = () => {
    let tables = allTables.filter(t => t.tipo_mesa === currentView);

    if (searchQuery) {
      tables = tables.filter(t => 
        t.numero_mesa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.reserva?.cliente_nombre && t.reserva.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      tables = tables.filter(t => t.estado?.estado === filterStatus);
    }

    return tables;
  };

  const getStats = () => {
    const currentTables = getCurrentTables();
    return {
      total: currentTables.length,
      occupied: currentTables.filter(t => t.estado?.estado === 'ocupada').length,
      reserved: currentTables.filter(t => t.estado?.estado === 'reservada').length,
      available: currentTables.filter(t => t.estado?.estado === 'libre').length,
      cleaning: currentTables.filter(t => t.estado?.estado === 'limpieza').length,
      capacity: currentTables.reduce((sum, t) => sum + t.capacidad, 0),
      occupiedCapacity: currentTables.filter(t => t.estado?.estado === 'ocupada' || t.estado?.estado === 'reservada').reduce((sum, t) => sum + t.capacidad, 0),
    };
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'libre': return '#9FB289';
      case 'ocupada': return '#237584';
      case 'reservada': return '#CB5910';
      case 'limpieza': return '#FF9500';
      case 'fuera_servicio': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTableStyle = (table: TableData) => {
    const isSelected = selectedTables.includes(table.id);
    const color = getStatusColor(table.estado?.estado);
    const isOccupied = table.estado?.estado === 'ocupada' || table.estado?.estado === 'reservada';
    const baseSize = table.capacidad === 2 ? 60 : 80;
    const size = baseSize * zoomLevel;
    
    return {
      position: 'absolute' as const,
      left: `calc(${table.position_x}% - ${size/2}px)`,
      top: `calc(${table.position_y}% - ${size/2}px)`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '12px',
      border: isSelected ? `3px solid #007AFF` : `3px solid ${color}`,
      backgroundColor: isSelected ? '#007AFF15' : isOccupied ? `${color}15` : '#FFFFFF',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: isSelected 
        ? '0 4px 20px rgba(0, 122, 255, 0.3)' 
        : '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      zIndex: isSelected ? 100 : table.estado?.estado === 'ocupada' ? 10 : 1,
      fontSize: `${Math.max(10, 12 * zoomLevel)}px`,
      fontWeight: '600',
    };
  };

  const zoneConfig = {
    interior: { 
      name: '🏠 Sala Interior', 
      color: '#237584',
      description: 'Ambiente íntimo y acogedor',
      tables: allTables.filter(t => t.tipo_mesa === 'interior').length
    },
    terraza_superior: { 
      name: '🌿 Terraza Superior', 
      color: '#9FB289',
      description: 'Vista panorámica a la ciudad',
      tables: allTables.filter(t => t.tipo_mesa === 'terraza_superior').length
    },
    terraza_inferior: { 
      name: '⚖️ Terraza Inferior', 
      color: '#CB5910',
      description: 'Espacio tranquilo y relajado',
      tables: allTables.filter(t => t.tipo_mesa === 'terraza_inferior').length
    }
  };

  const stats = getStats();

  const handleTableClick = (table: TableData, event: React.MouseEvent) => {
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      setSelectedTables(prev => 
        prev.includes(table.id)
          ? prev.filter(id => id !== table.id)
          : [...prev, table.id]
      );
    } else {
      setSelectedTable(table);
      setShowModal(true);
      setSelectedTables([]);
    }
  };

  const PremiumModal = () => {
    if (!showModal || !selectedTable) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '0',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${getStatusColor(selectedTable.estado?.estado)}15, ${getStatusColor(selectedTable.estado?.estado)}05)`,
            padding: '32px',
            borderBottom: '1px solid #F0F0F0',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#8E8E93',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              ✕
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '20px',
                backgroundColor: getStatusColor(selectedTable.estado?.estado),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '32px',
                fontWeight: '700',
              }}>
                {selectedTable.numero_mesa}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#000000',
                    margin: '0',
                  }}>
                    Mesa {selectedTable.numero_mesa}
                  </h2>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    backgroundColor: '#F2F2F7',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#000000',
                  }}>
                    👥 {selectedTable.capacidad} personas
                  </div>
                  <div style={{
                    backgroundColor: '#F2F2F7',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#000000',
                  }}>
                    📍 {selectedTable.tipo_mesa}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: '#000000' }}>
                    Estado: {selectedTable.estado?.estado || 'Desconocido'}
                  </div>
                  {selectedTable.estado?.notas_estado && (
                    <div style={{ fontSize: '14px', color: '#8E8E93' }}>
                      Notas: {selectedTable.estado.notas_estado}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ 
            flex: 1, 
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            overflowY: 'auto',
          }}>
            
            {/* Información de Mesa */}
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#000000',
                margin: '0 0 20px 0',
              }}>
                Información de Mesa
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  backgroundColor: '#F8F9FA',
                  borderRadius: '16px',
                  padding: '20px',
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0 0 12px 0',
                  }}>
                    Detalles
                  </h4>
                  <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                    <p>Capacidad: {selectedTable.capacidad} personas</p>
                    <p>Zona: {selectedTable.tipo_mesa}</p>
                    <p>Estado actual: {selectedTable.estado?.estado || 'Libre'}</p>
                    {selectedTable.notas_mesa && (
                      <p>Notas: {selectedTable.notas_mesa}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#000000',
                margin: '0 0 20px 0',
              }}>
                Acciones Rápidas
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: '✅ Liberar Mesa', color: '#9FB289' },
                  { label: '🍽️ Ocupar Mesa', color: '#237584' },
                  { label: '📅 Nueva Reserva', color: '#CB5910' },
                  { label: '🧽 Enviar a Limpieza', color: '#FF9500' },
                  { label: '🔧 Fuera de Servicio', color: '#6B7280' },
                ].map((action, index) => (
                  <button key={index} style={{
                    backgroundColor: action.color,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '24px 32px',
            backgroundColor: '#F8F9FA',
            borderTop: '1px solid #F0F0F0',
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: '2px solid #8E8E93',
                backgroundColor: 'transparent',
                color: '#8E8E93',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Cerrar
            </button>
            <button style={{
              backgroundColor: '#237584',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#F2F2F7',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E5EA',
        padding: '20px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#000000',
                margin: '0',
              }}>
                Sala Virtual Premium
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#8E8E93',
                margin: '4px 0 0 0',
              }}>
                Gestión en tiempo real • {currentTime.toLocaleTimeString('es-ES')}
              </p>
            </div>
            
            {/* Stats globales */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#237584' }}>
                  {allTables.filter(t => t.estado?.estado === 'ocupada').length}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Ocupadas
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#CB5910' }}>
                  {allTables.filter(t => t.estado?.estado === 'reservada').length}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Reservadas
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#9FB289' }}>
                  {allTables.filter(t => t.estado?.estado === 'libre').length}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Libres
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar mesa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '12px 16px 12px 40px',
                  borderRadius: '12px',
                  border: '2px solid #E5E5EA',
                  fontSize: '16px',
                  outline: 'none',
                  width: '250px',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8E8E93',
                fontSize: '16px',
              }}>
                🔍
              </div>
            </div>

            {/* Notificaciones */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                backgroundColor: notifications.some(n => n.urgent) ? '#FF3B30' : '#FFFFFF',
                border: '2px solid #E5E5EA',
                borderRadius: '12px',
                padding: '12px',
                color: notifications.some(n => n.urgent) ? '#FFFFFF' : '#000000',
                cursor: 'pointer',
                fontSize: '16px',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              🔔
              {notifications.some(n => n.urgent) && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#FF3B30',
                  borderRadius: '50%',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}>
                  {notifications.filter(n => n.urgent).length}
                </div>
              )}
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #237584',
                backgroundColor: sidebarCollapsed ? '#237584' : 'transparent',
                color: sidebarCollapsed ? '#FFFFFF' : '#237584',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              📋
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '2px solid #9FB289',
                backgroundColor: isFullscreen ? '#9FB289' : 'transparent',
                color: isFullscreen ? '#FFFFFF' : '#9FB289',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              {isFullscreen ? '📱 Ventana' : '📺 Pantalla Completa'}
            </button>
          </div>
        </div>
      </header>

      {/* Popup de notificaciones */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '120px',
          right: '24px',
          width: '400px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          zIndex: 300,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          border: '1px solid #E5E5EA',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#000000',
            margin: '0 0 20px 0',
          }}>
            Notificaciones
          </h3>
          {notifications.map(notification => (
            <div key={notification.id} style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '12px',
              backgroundColor: notification.urgent ? '#FF3B3015' : '#237584115',
              border: `1px solid ${notification.urgent ? '#FF3B30' : '#237584'}30`,
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '4px',
              }}>
                {notification.message}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
              }}>
                Hace {notification.time}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div style={{ 
        display: 'flex', 
        flex: 1,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'calc(100vh - 120px)',
        zIndex: isFullscreen ? 999 : 1,
      }}>
        
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <aside style={{
            width: '350px',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E5E5EA',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '24px' }}>
              
              {/* Stats por zona */}
              <div style={{
                backgroundColor: '#F8F9FA',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#000000',
                  margin: '0 0 20px 0',
                }}>
                  {zoneConfig[currentView as keyof typeof zoneConfig]?.name || 'Zona Actual'}
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#237584' }}>
                      {stats.occupied}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Ocupadas</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#CB5910' }}>
                      {stats.reserved}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Reservadas</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#9FB289' }}>
                      {stats.available}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Libres</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF9500' }}>
                      {stats.cleaning}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Limpieza</div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: zoneConfig[currentView as keyof typeof zoneConfig]?.color + '20' || '#237584' + '20',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: zoneConfig[currentView as keyof typeof zoneConfig]?.color || '#237584' }}>
                    {stats.capacity > 0 ? Math.round((stats.occupiedCapacity / stats.capacity) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '600' }}>
                    Ocupación actual
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div style={{
                backgroundColor: '#F8F9FA',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#000000',
                  margin: '0 0 16px 0',
                }}>
                  Controles
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', display: 'block' }}>
                      Zoom: {Math.round(zoomLevel * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        appearance: 'none',
                        height: '6px',
                        borderRadius: '3px',
                        background: '#E5E5EA',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: '2px solid #E5E5EA',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="all">Todas las mesas</option>
                    <option value="libre">Solo disponibles</option>
                    <option value="ocupada">Solo ocupadas</option>
                    <option value="reservada">Solo reservadas</option>
                    <option value="limpieza">En limpieza</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Área principal */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
        }}>
          
          {/* Navegación de zonas */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E5EA',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', backgroundColor: '#F2F2F7', borderRadius: '12px', padding: '4px' }}>
              {Object.entries(zoneConfig).map(([key, zone]) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: currentView === key ? zone.color : 'transparent',
                    color: currentView === key ? '#FFFFFF' : '#000000',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {zone.name}
                  <span style={{
                    backgroundColor: currentView === key ? 'rgba(255,255,255,0.3)' : `${zone.color}20`,
                    color: currentView === key ? '#FFFFFF' : zone.color,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>
                    {zone.tables}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: '16px', color: '#6B7280' }}>
              {zoneConfig[currentView as keyof typeof zoneConfig]?.description || ''}
            </div>
          </div>

          {/* Plano de la sala */}
          <div style={{ 
            flex: 1, 
            position: 'relative', 
            backgroundColor: '#F8F9FA',
            margin: '24px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
          onClick={() => setSelectedTables([])}
          >
            
            <div style={{ 
              position: 'absolute', 
              inset: '24px',
            }}>
              {getCurrentTables().map((table) => (
                <div
                  key={table.id}
                  style={getTableStyle(table)}
                  onClick={(e) => handleTableClick(table, e)}
                >
                  <div style={{
                    fontSize: `${Math.max(14, 16 * zoomLevel)}px`,
                    fontWeight: '700',
                    color: table.estado?.estado === 'libre' ? '#000000' : '#FFFFFF',
                    marginBottom: '4px',
                  }}>
                    {table.numero_mesa}
                  </div>
                  <div style={{
                    fontSize: `${Math.max(10, 12 * zoomLevel)}px`,
                    color: table.estado?.estado === 'libre' ? '#6B7280' : 'rgba(255,255,255,0.8)',
                    textAlign: 'center',
                  }}>
                    {table.capacidad}p
                  </div>
                </div>
              ))}
            </div>

            {/* Info de mesas seleccionadas */}
            {selectedTables.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                backgroundColor: '#007AFF',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
              }}>
                {selectedTables.length} mesas seleccionadas
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTables([]);
                  }}
                  style={{
                    marginLeft: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Leyenda */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E5EA',
        padding: '16px 24px',
        display: isFullscreen ? 'none' : 'flex',
        justifyContent: 'center',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        {[
          { status: 'libre', label: 'Disponible', icon: '✅' },
          { status: 'ocupada', label: 'Ocupada', icon: '🍽️' },
          { status: 'reservada', label: 'Reservada', icon: '📅' },
          { status: 'limpieza', label: 'Limpieza', icon: '🧽' },
        ].map(item => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: item.status === 'libre' ? '#FFFFFF' : `${getStatusColor(item.status)}15`,
              border: `3px solid ${getStatusColor(item.status)}`,
              borderRadius: '4px',
            }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#000000' }}>
              {item.icon} {item.label}
            </span>
          </div>
        ))}
        <div style={{ fontSize: '12px', color: '#6B7280' }}>
          💡 Ctrl/Cmd + Click para selección múltiple
        </div>
      </footer>

      <PremiumModal />
    </div>
  );
};

export default PremiumRestaurantFloor;
