
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Users, CheckCircle, Clock, AlertCircle, Settings,
  Coffee, Timer, UserPlus, Crown, Sparkles, MapPin,
  TrendingUp, Activity, Wifi, Phone, Link, Unlink,
  RotateCcw, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { useTablesWithStates, TableWithState, useUpdateTableState } from '@/hooks/useTableStates';
import { validateMesaEstado, MesaEstado } from '@/types/mesa';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useZoneStats } from '@/hooks/useZoneStats';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';

// COLORES OFICIALES ENIGMA del manual de marca
const ENIGMA_COLORS = {
  primary: '#237584',      // Teal principal
  secondary: '#9FB289',    // Verde sage
  accent: '#CB5910',       // Naranja terracota
  // Colores adicionales para estados
  success: '#9FB289',      // Usa el verde sage de Enigma
  warning: '#CB5910',      // Usa el naranja de Enigma
  danger: '#DC2626',       // Rojo para urgencias
  gray: '#6B7280'          // Gris neutro
};

interface EnigmaFloorPlanProps {
  onTableSelect?: (tableId: string) => void;
  selectedTables?: string[];
  showCombinations?: boolean;
  viewMode?: 'floor-plan' | 'grid' | 'layout';
}

export function EnigmaFloorPlan({ 
  onTableSelect, 
  selectedTables = [], 
  showCombinations = false,
  viewMode: initialViewMode = 'floor-plan' 
}: EnigmaFloorPlanProps) {
  const [selectedTable, setSelectedTable] = useState<TableWithState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'layout'>('grid');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  const { data: tables = [], refetch, isLoading } = useTablesWithStates();
  const updateTableState = useUpdateTableState();
  const { data: zoneStats = [] } = useZoneStats();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('enigma-floor-plan-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'estados_mesa' 
      }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Configuración de estados con colores ENIGMA oficiales
  const stateConfig = {
    libre: {
      color: ENIGMA_COLORS.success,
      bgColor: '#F0F8F4',
      borderColor: '#C3E6CD',
      icon: CheckCircle,
      label: 'Disponible',
      textColor: '#166534'
    },
    ocupada: {
      color: ENIGMA_COLORS.primary,
      bgColor: '#EDF5F7',
      borderColor: '#B8D4DA',
      icon: Coffee,
      label: 'Ocupada',
      textColor: '#1A5A68'
    },
    reservada: {
      color: ENIGMA_COLORS.accent,
      bgColor: '#FDF2E9',
      borderColor: '#F0C5A3',
      icon: Clock,
      label: 'Reservada',
      textColor: '#A04A0E'
    },
    limpieza: {
      color: ENIGMA_COLORS.gray,
      bgColor: '#F9FAFB',
      borderColor: '#D1D5DB',
      icon: Timer,
      label: 'Limpieza',
      textColor: '#4B5563'
    },
    fuera_servicio: {
      color: ENIGMA_COLORS.danger,
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
      icon: AlertCircle,
      label: 'Fuera de Servicio',
      textColor: '#DC2626'
    }
  };

  // Configuración de zonas con colores ENIGMA
  const zoneConfig = {
    campanar: { 
      name: '🌿 Terraza Campanar', 
      color: ENIGMA_COLORS.secondary,
      bgColor: '#F0F8F4',
      borderColor: '#C3E6CD',
      description: 'Vista exterior'
    },
    justicia: { 
      name: '⚖️ Terraza Justicia', 
      color: ENIGMA_COLORS.accent,
      bgColor: '#FDF2E9',
      borderColor: '#F0C5A3',
      description: 'Zona tranquila'
    },
    interior: { 
      name: '🏛️ Sala Interior', 
      color: ENIGMA_COLORS.primary,
      bgColor: '#EDF5F7',
      borderColor: '#B8D4DA',
      description: 'Climatizada'
    }
  };

  // Estadísticas
  const stats = useMemo(() => {
    const filteredTables = selectedZone === 'all' ? tables : tables.filter(t => t.zona === selectedZone);
    
    const states = filteredTables.reduce((acc, table) => {
      const estado = table.estado?.estado || 'libre';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCapacidad = filteredTables.reduce((sum, table) => sum + table.capacidad, 0);
    const capacidadOcupada = filteredTables
      .filter(table => table.estado?.estado === 'ocupada')
      .reduce((sum, table) => sum + table.capacidad, 0);
    
    return {
      ...states,
      total: filteredTables.length,
      totalCapacidad,
      capacidadOcupada,
      porcentajeOcupacion: totalCapacidad > 0 ? Math.round((capacidadOcupada / totalCapacidad) * 100) : 0
    };
  }, [tables, selectedZone]);

  const getZoneStats = (zona: string) => {
    const statsData = zoneStats.find(s => s.zona === zona);
    return {
      total: statsData?.total_mesas || 0,
      totalCapacidad: statsData?.capacidad_total || 0,
      capacidadOcupada: statsData?.capacidad_ocupada || 0,
      porcentajeOcupacion: statsData?.porcentaje_ocupacion || 0,
      mesas_libres: statsData?.mesas_libres || 0,
      mesas_ocupadas: statsData?.mesas_ocupadas || 0,
      mesas_reservadas: statsData?.mesas_reservadas || 0
    };
  };

  const handleTableClick = (table: TableWithState) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleStateChange = async (tableId: string, newState: string) => {
    try {
      const validatedState = validateMesaEstado(newState);
      await updateTableState.mutateAsync({
        mesaId: tableId,
        estado: validatedState,
      });
      refetch();
      setShowModal(false);
      toast.success('Estado de mesa actualizado');
    } catch (error) {
      toast.error('Error al actualizar mesa');
      console.error('Error updating table state:', error);
    }
  };

  // Componente de mesa para vista grid
  const TableCardComponent = ({ table }: { table: TableWithState }) => {
    const estado = table.estado?.estado || 'libre';
    const config = stateConfig[estado as keyof typeof stateConfig] || stateConfig.libre;
    const IconComponent = config.icon;
    
    return (
      <div
        onClick={() => handleTableClick(table)}
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          color: config.textColor
        }}
        className={`
          relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
          hover:scale-105 hover:shadow-lg active:scale-95
          backdrop-blur-sm bg-opacity-90
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: config.color }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            >
              <IconComponent size={20} />
            </div>
            <div>
              <div className="font-bold text-xl leading-none">
                {table.numero_mesa}
              </div>
              <div className="text-sm opacity-75 flex items-center gap-1 mt-1">
                <Users size={12} />
                {table.capacidad} personas
              </div>
            </div>
          </div>
          
          {/* Indicadores especiales */}
          <div className="flex flex-col items-end gap-1">
            {table.es_combinable && (
              <div className="flex items-center gap-1 text-xs opacity-75">
                <Link size={12} />
                <span>Unible</span>
              </div>
            )}
            {estado === 'reservada' && (
              <Crown size={16} style={{ color: ENIGMA_COLORS.accent }} />
            )}
          </div>
        </div>

        {/* Estado y zona */}
        <div className="flex items-center justify-between">
          <div
            style={{ backgroundColor: config.color }}
            className="px-3 py-1.5 rounded-xl text-white text-sm font-semibold shadow-sm"
          >
            {config.label}
          </div>
          
          <div className="text-xs font-medium opacity-60">
            {zoneConfig[table.zona as keyof typeof zoneConfig]?.name.split(' ')[1] || table.zona}
          </div>
        </div>

        {/* Notas de mesa */}
        {table.notas_mesa && (
          <div className="mt-2 text-xs bg-white bg-opacity-50 rounded-lg px-2 py-1 text-center">
            {table.notas_mesa}
          </div>
        )}
      </div>
    );
  };

  // Componente de mesa para vista layout
  const TableLayoutComponent = ({ table, scale = 1 }: { table: TableWithState, scale?: number }) => {
    const estado = table.estado?.estado || 'libre';
    const config = stateConfig[estado as keyof typeof stateConfig] || stateConfig.libre;
    const IconComponent = config.icon;
    
    const size = table.capacidad <= 2 ? 40 : table.capacidad <= 4 ? 50 : 60;
    
    return (
      <div
        onClick={() => handleTableClick(table)}
        style={{
          position: 'absolute',
          left: `${table.position_x * scale}px`,
          top: `${table.position_y * scale}px`,
          width: `${size * scale}px`,
          height: `${size * scale}px`,
          backgroundColor: config.color,
          borderColor: '#ffffff',
          transform: `scale(${zoomLevel})`
        }}
        className={`
          rounded-xl border-2 cursor-pointer transition-all duration-300
          hover:scale-110 active:scale-95 shadow-lg
          flex flex-col items-center justify-center text-white
        `}
      >
        <IconComponent size={16 * scale} />
        <div className="font-bold text-xs mt-1" style={{ fontSize: `${10 * scale}px` }}>
          {table.numero_mesa}
        </div>
        <div className="text-xs opacity-90" style={{ fontSize: `${8 * scale}px` }}>
          {table.capacidad}p
        </div>
        
        {table.es_combinable && (
          <Link size={8 * scale} className="absolute top-1 right-1 opacity-75" />
        )}
      </div>
    );
  };

  // Filtrar mesas por zona
  const filteredTables = selectedZone === 'all' ? tables : tables.filter(t => t.zona === selectedZone);
  const tablesByZone = filteredTables.reduce((acc, table) => {
    const zone = table.zona || 'interior';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, TableWithState[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-enigma-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        
        {/* Header con branding ENIGMA */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header con gradiente ENIGMA */}
          <div 
            className="px-6 py-6"
            style={{ 
              background: `linear-gradient(135deg, ${ENIGMA_COLORS.primary}, ${ENIGMA_COLORS.secondary})` 
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-white">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Activity className="h-7 w-7" />
                  </div>
                  Enigma Restaurant
                </h1>
                <p className="mt-1 text-lg opacity-90">
                  {currentTime.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} • Cocina con alma
                </p>
              </div>
              
              {/* Controles */}
              <div className="flex items-center gap-3">
                {/* Selector de zona */}
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-4 py-2 border border-white border-opacity-30 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium"
                  style={{ color: 'white' }}
                >
                  <option value="all" style={{ color: ENIGMA_COLORS.primary }}>Todas las zonas</option>
                  <option value="campanar" style={{ color: ENIGMA_COLORS.primary }}>Terraza Campanar</option>
                  <option value="justicia" style={{ color: ENIGMA_COLORS.primary }}>Terraza Justicia</option>
                  <option value="interior" style={{ color: ENIGMA_COLORS.primary }}>Sala Interior</option>
                </select>
                
                {/* Toggle vista */}
                <div className="flex bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('layout')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'layout' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Layout
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estadísticas con colores ENIGMA */}
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div 
                className="rounded-2xl p-4 text-white text-center"
                style={{ 
                  background: `linear-gradient(135deg, ${ENIGMA_COLORS.primary}, ${ENIGMA_COLORS.secondary})` 
                }}
              >
                <div className="text-2xl font-bold">{stats.porcentajeOcupacion}%</div>
                <div className="text-sm opacity-90">Ocupación</div>
              </div>
              <div 
                className="rounded-2xl p-4 text-center border-2"
                style={{ 
                  backgroundColor: stateConfig.libre.bgColor,
                  borderColor: stateConfig.libre.borderColor
                }}
              >
                <div className="text-2xl font-bold" style={{ color: stateConfig.libre.color }}>
                  {stats.libre || 0}
                </div>
                <div className="text-sm" style={{ color: stateConfig.libre.textColor }}>
                  Disponibles
                </div>
              </div>
              <div 
                className="rounded-2xl p-4 text-center border-2"
                style={{ 
                  backgroundColor: stateConfig.ocupada.bgColor,
                  borderColor: stateConfig.ocupada.borderColor
                }}
              >
                <div className="text-2xl font-bold" style={{ color: stateConfig.ocupada.color }}>
                  {stats.ocupada || 0}
                </div>
                <div className="text-sm" style={{ color: stateConfig.ocupada.textColor }}>
                  Ocupadas
                </div>
              </div>
              <div 
                className="rounded-2xl p-4 text-center border-2"
                style={{ 
                  backgroundColor: stateConfig.reservada.bgColor,
                  borderColor: stateConfig.reservada.borderColor
                }}
              >
                <div className="text-2xl font-bold" style={{ color: stateConfig.reservada.color }}>
                  {stats.reservada || 0}
                </div>
                <div className="text-sm" style={{ color: stateConfig.reservada.textColor }}>
                  Reservadas
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                <div className="text-sm text-gray-700">Total mesas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Statistics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {['interior', 'campanar', 'justicia'].map((zona) => {
            const zoneStatsData = getZoneStats(zona);
            const zonaNames = {
              interior: 'Sala Interior',
              campanar: 'Terraza Campanar', 
              justicia: 'Terraza Justicia'
            };
            
            return (
              <IOSCard key={zona} variant="elevated" className="shadow-ios">
                <IOSCardContent className="enigma-spacing-md">
                  <div className="text-center">
                    <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-3">
                      {zonaNames[zona as keyof typeof zonaNames]}
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-ios-green/20 rounded-full flex items-center justify-center mx-auto">
                          <div className="w-3 h-3 bg-ios-green rounded-full"></div>
                        </div>
                        <p className="ios-text-caption2 text-enigma-neutral-600">Libres</p>
                        <p className="ios-text-callout font-bold text-ios-green">
                          {zoneStatsData.mesas_libres || 0}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-enigma-naranja/20 rounded-full flex items-center justify-center mx-auto">
                          <div className="w-3 h-3 bg-enigma-naranja rounded-full"></div>
                        </div>
                        <p className="ios-text-caption2 text-enigma-neutral-600">Ocupadas</p>
                        <p className="ios-text-callout font-bold text-enigma-naranja">
                          {zoneStatsData.mesas_ocupadas || 0}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-enigma-primary/20 rounded-full flex items-center justify-center mx-auto">
                          <div className="w-3 h-3 bg-enigma-primary rounded-full"></div>
                        </div>
                        <p className="ios-text-caption2 text-enigma-neutral-600">Reservadas</p>
                        <p className="ios-text-callout font-bold text-enigma-primary">
                          {zoneStatsData.mesas_reservadas || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-enigma-neutral-200">
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-1">Ocupación</p>
                      <p className="ios-text-headline font-bold text-enigma-neutral-900">
                        {zoneStatsData.porcentajeOcupacion.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </IOSCardContent>
              </IOSCard>
            );
          })}
        </div>

        {/* Contenido principal */}
        {viewMode === 'grid' ? (
          // Vista Grid por zonas
          <div className="space-y-6">
            {Object.entries(tablesByZone).map(([zoneName, zoneTables]) => {
              const config = zoneConfig[zoneName as keyof typeof zoneConfig];
              if (!config) return null;

              return (
                <div 
                  key={zoneName} 
                  className="bg-white rounded-3xl shadow-sm border-l-4 overflow-hidden"
                  style={{ borderLeftColor: config.color }}
                >
                  <div 
                    className="px-6 py-4 border-b border-gray-100"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: config.color }}>
                          {config.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: config.color }} />
                        <span className="text-sm font-medium text-gray-600">
                          {zoneTables.length} mesas
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {zoneTables
                        .sort((a, b) => a.numero_mesa.localeCompare(b.numero_mesa, undefined, { numeric: true }))
                        .map((table) => (
                          <TableCardComponent key={table.id} table={table} />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Vista Layout
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: ENIGMA_COLORS.primary }}>
                Layout del Restaurante
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{ backgroundColor: `${ENIGMA_COLORS.primary}10` }}
                >
                  <ZoomOut size={16} style={{ color: ENIGMA_COLORS.primary }} />
                </button>
                <span 
                  className="text-sm font-medium px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: `${ENIGMA_COLORS.primary}10`,
                    color: ENIGMA_COLORS.primary
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{ backgroundColor: `${ENIGMA_COLORS.primary}10` }}
                >
                  <ZoomIn size={16} style={{ color: ENIGMA_COLORS.primary }} />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{ backgroundColor: `${ENIGMA_COLORS.primary}10` }}
                >
                  <RotateCcw size={16} style={{ color: ENIGMA_COLORS.primary }} />
                </button>
              </div>
            </div>
            
            <div className="relative bg-gray-50 rounded-2xl p-8 min-h-96 overflow-auto">
              {filteredTables.map((table) => (
                <TableLayoutComponent key={table.id} table={table} scale={0.8} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
