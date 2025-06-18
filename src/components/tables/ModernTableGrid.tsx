import React from 'react';
import { 
  Users, MapPin, Clock, Crown, Wifi, AirVent, 
  Trees, Building2, Coffee, Circle, Square, Octagon,
  CheckCircle, AlertCircle, Timer, XCircle
} from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import type { TableWithState } from '@/hooks/useTableStates';

// Configuración de estados de mesa
const TABLE_STATES = {
  libre: {
    color: '#9FB289',
    bgColor: '#9FB28915',
    borderColor: '#9FB289',
    label: 'Disponible',
    textColor: '#9FB289',
    gradient: 'from-green-100 to-green-50'
  },
  ocupada: {
    color: '#237584',
    bgColor: '#23758415',
    borderColor: '#237584',
    label: 'Ocupada',
    textColor: '#237584',
    gradient: 'from-blue-100 to-blue-50'
  },
  reservada: {
    color: '#CB5910',
    bgColor: '#CB591015',
    borderColor: '#CB5910',
    label: 'Reservada',
    textColor: '#CB5910',
    gradient: 'from-orange-100 to-orange-50'
  },
  fuera_servicio: {
    color: '#FF3B30',
    bgColor: '#FF3B3015',
    borderColor: '#FF3B30',
    label: 'Fuera de Servicio',
    textColor: '#FF3B30',
    gradient: 'from-red-100 to-red-50'
  }
} as const;

// Configuración de zonas reales del restaurante
const ZONE_CONFIG = {
  campanar: {
    id: 'campanar',
    name: 'Terraza Calle Campaneri',
    icon: Trees,
    color: '#9FB289',
    bgColor: '#9FB28915',
    borderColor: '#9FB289',
    description: 'Mesas T1-T14'
  },
  justicia: {
    id: 'justicia',
    name: 'Terraza Calle Justicia', 
    icon: Trees,
    color: '#34C759',
    bgColor: '#34C75915',
    borderColor: '#34C759',
    description: 'Mesas T20-T28'
  },
  interior: {
    id: 'interior',
    name: 'Sala Interior Superior',
    icon: Building2,
    color: '#237584',
    bgColor: '#23758415',
    borderColor: '#237584',
    description: 'Mesas M1-M10'
  },
  barra: {
    id: 'barra',
    name: 'Zona Barra',
    icon: Coffee,
    color: '#CB5910',
    bgColor: '#CB591015',
    borderColor: '#CB5910',
    description: 'Zona de bar'
  }
} as const;

interface ModernTableCardProps {
  table: TableWithState;
  isSelected?: boolean;
  onSelect?: (tableId: string) => void;
  onStateChange?: (tableId: string, newState: string) => void;
  combineMode?: boolean;
}

const ModernTableCard: React.FC<ModernTableCardProps> = ({
  table,
  isSelected = false,
  onSelect,
  onStateChange,
  combineMode = false
}) => {
  const currentState = table.estado?.estado || 'libre';
  const stateConfig = TABLE_STATES[currentState as keyof typeof TABLE_STATES] || TABLE_STATES.libre;
  const zoneConfig = ZONE_CONFIG[table.zona as keyof typeof ZONE_CONFIG] || ZONE_CONFIG.interior;
  
  // Determinar tamaño de la mesa basado en capacidad
  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return { width: 'w-full', height: 'h-36', shape: 'cuadrada' };
    if (capacity <= 4) return { width: 'w-full', height: 'h-40', shape: 'rectangular' };
    if (capacity <= 6) return { width: 'w-full', height: 'h-44', shape: 'rectangular' };
    return { width: 'w-full', height: 'h-48', shape: 'redonda' };
  };

  const tableSize = getTableSize(table.capacidad);
  
  const handleClick = () => {
    if (combineMode && onSelect) {
      onSelect(table.id);
    }
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'cuadrada': return Square;
      case 'rectangular': return Octagon;
      case 'redonda': return Circle;
      default: return Square;
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'libre': return CheckCircle;
      case 'ocupada': return Coffee;
      case 'reservada': return Clock;
      case 'limpieza': return Timer;
      case 'fuera_servicio': return XCircle;
      default: return AlertCircle;
    }
  };

  const StateIcon = getStateIcon(currentState);

  return (
    <div
      className={`
        relative cursor-pointer group
        transition-all duration-500 ease-out
        hover:scale-[1.03] hover:translate-y-[-2px]
        ${isSelected ? 'scale-[1.02] translate-y-[-1px]' : ''}
        ${tableSize.height}
      `}
      onClick={handleClick}
    >
      {/* Glassmorphismo container */}
      <div
        className={`
          relative h-full rounded-3xl overflow-hidden
          backdrop-blur-xl bg-white/80 
          border border-white/30
          shadow-[0_8px_32px_rgba(0,0,0,0.08)]
          group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]
          group-hover:bg-white/90
          transition-all duration-500
          ${isSelected ? 'bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.15)]' : ''}
        `}
        style={{
          background: isSelected 
            ? `linear-gradient(145deg, rgba(255,255,255,0.95), rgba(${parseInt(zoneConfig.color.slice(1,3), 16)}, ${parseInt(zoneConfig.color.slice(3,5), 16)}, ${parseInt(zoneConfig.color.slice(5,7), 16)}, 0.08))` 
            : `linear-gradient(145deg, rgba(255,255,255,0.85), rgba(${parseInt(stateConfig.color.slice(1,3), 16)}, ${parseInt(stateConfig.color.slice(3,5), 16)}, ${parseInt(stateConfig.color.slice(5,7), 16)}, 0.05))`,
          borderColor: isSelected ? `${zoneConfig.color}40` : `${stateConfig.color}20`
        }}
      >
        {/* Inner content with proper iOS spacing */}
        <div className="p-6 h-full flex flex-col relative">
          {/* Header con diseño iOS nativo */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Zone indicator con glassmorphismo */}
              <div 
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md"
                style={{ 
                  background: `linear-gradient(145deg, ${zoneConfig.color}, rgba(${parseInt(zoneConfig.color.slice(1,3), 16)}, ${parseInt(zoneConfig.color.slice(3,5), 16)}, ${parseInt(zoneConfig.color.slice(5,7), 16)}, 0.8))`,
                  boxShadow: `0 4px 20px ${zoneConfig.color}25`
                }}
              >
                <zoneConfig.icon size={20} color="white" />
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-white/10" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {table.numero_mesa}
                </h3>
                <p className="text-sm text-gray-600 font-medium mt-0.5">
                  {table.capacidad} personas
                </p>
              </div>
            </div>
            
            {/* Status badge con glassmorphismo */}
            <div 
              className="px-3 py-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2"
              style={{
                background: `linear-gradient(145deg, ${stateConfig.color}15, rgba(255,255,255,0.8))`,
                boxShadow: `0 4px 16px ${stateConfig.color}15`
              }}
            >
              <StateIcon size={14} color={stateConfig.color} />
              <span 
                className="text-sm font-semibold"
                style={{ color: stateConfig.color }}
              >
                {stateConfig.label}
              </span>
            </div>
          </div>

          {/* Mesa visual con glassmorphismo avanzado */}
          <div className="flex-1 flex items-center justify-center mb-6">
            <div className="relative">
              {/* Table representation con efectos iOS */}
              <div
                className={`
                  relative flex items-center justify-center font-bold transition-all duration-500
                  backdrop-blur-xl border border-white/40
                  ${table.capacidad <= 2 ? 'w-24 h-24 rounded-3xl text-2xl' : ''}
                  ${table.capacidad > 2 && table.capacidad <= 4 ? 'w-28 h-20 rounded-[2rem] text-3xl' : ''}
                  ${table.capacidad > 4 ? 'w-26 h-26 rounded-full text-2xl' : ''}
                  group-hover:scale-110 group-hover:translate-y-[-2px]
                  shadow-[0_8px_32px_rgba(0,0,0,0.1)]
                  group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)]
                `}
                style={{
                  background: `linear-gradient(145deg, 
                    rgba(255,255,255,0.9), 
                    rgba(${parseInt(stateConfig.color.slice(1,3), 16)}, ${parseInt(stateConfig.color.slice(3,5), 16)}, ${parseInt(stateConfig.color.slice(5,7), 16)}, 0.08)
                  )`,
                  color: stateConfig.color,
                  boxShadow: `
                    0 8px 32px rgba(${parseInt(stateConfig.color.slice(1,3), 16)}, ${parseInt(stateConfig.color.slice(3,5), 16)}, ${parseInt(stateConfig.color.slice(5,7), 16)}, 0.15),
                    inset 0 1px 0 rgba(255,255,255,0.3),
                    inset 0 -1px 0 rgba(0,0,0,0.05)
                  `
                }}
              >
                {table.numero_mesa}
                
                {/* Inner glow effect */}
                <div 
                  className={`
                    absolute inset-0 rounded-inherit opacity-50
                    ${table.capacidad <= 2 ? 'rounded-3xl' : ''}
                    ${table.capacidad > 2 && table.capacidad <= 4 ? 'rounded-[2rem]' : ''}
                    ${table.capacidad > 4 ? 'rounded-full' : ''}
                  `}
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${stateConfig.color}10, transparent 70%)`
                  }}
                />
              </div>
              
              {/* Shape indicator con glassmorphismo */}
              <div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg"
                style={{ 
                  background: `linear-gradient(145deg, ${zoneConfig.color}, rgba(${parseInt(zoneConfig.color.slice(1,3), 16)}, ${parseInt(zoneConfig.color.slice(3,5), 16)}, ${parseInt(zoneConfig.color.slice(5,7), 16)}, 0.8))`,
                  boxShadow: `0 4px 16px ${zoneConfig.color}20`
                }}
              >
                {React.createElement(getShapeIcon(tableSize.shape), { size: 16, color: 'white' })}
              </div>
            </div>
          </div>

          {/* Información con glassmorphismo sutil */}
          <div className="space-y-4">
            {/* Table info section */}
            <div 
              className="flex items-center justify-between p-3 rounded-2xl backdrop-blur-sm border border-white/20"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))'
              }}
            >
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <MapPin size={16} className="text-gray-500" />
                <span className="font-medium">{table.tipo_mesa}</span>
              </div>
              {table.capacidad > 4 && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wifi size={14} className="text-blue-600" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <AirVent size={14} className="text-green-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Estados rápidos con diseño iOS premium */}
            <div className="flex gap-3 justify-center">
              {Object.entries(TABLE_STATES).map(([state, config]) => {
                const StateButtonIcon = getStateIcon(state);
                const isActive = currentState === state;
                
                return (
                  <button
                    key={state}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStateChange?.(table.id, state);
                    }}
                    className={`
                      relative w-10 h-10 rounded-2xl transition-all duration-300 flex items-center justify-center
                      backdrop-blur-md border border-white/30
                      ${isActive 
                        ? 'scale-110 shadow-lg' 
                        : 'opacity-60 hover:opacity-90 hover:scale-105'
                      }
                    `}
                    style={{
                      background: isActive 
                        ? `linear-gradient(145deg, ${config.color}, rgba(${parseInt(config.color.slice(1,3), 16)}, ${parseInt(config.color.slice(3,5), 16)}, ${parseInt(config.color.slice(5,7), 16)}, 0.8))`
                        : `linear-gradient(145deg, rgba(255,255,255,0.8), rgba(${parseInt(config.color.slice(1,3), 16)}, ${parseInt(config.color.slice(3,5), 16)}, ${parseInt(config.color.slice(5,7), 16)}, 0.1))`,
                      boxShadow: isActive 
                        ? `0 4px 16px ${config.color}25` 
                        : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    title={config.label}
                  >
                    <StateButtonIcon 
                      size={18} 
                      color={isActive ? 'white' : config.color} 
                    />
                    {/* Inner glow for active state */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-white/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection overlay con efecto premium */}
          {isSelected && (
            <>
              {/* Outer glow */}
              <div 
                className="absolute -inset-1 rounded-[2rem] pointer-events-none opacity-60 blur-lg"
                style={{
                  background: `linear-gradient(135deg, ${zoneConfig.color}, transparent)`
                }}
              />
              {/* Inner shimmer */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-20"
                style={{
                  background: `linear-gradient(135deg, transparent, ${zoneConfig.color}15, transparent)`
                }}
              />
            </>
          )}

          {/* Combination mode indicator con glassmorphismo */}
          {combineMode && (
            <div className="absolute top-4 left-4">
              <div 
                className={`
                  w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold
                  backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-110' 
                    : 'bg-gradient-to-br from-white/80 to-white/60 text-gray-600'
                  }
                `}
                style={{
                  boxShadow: isSelected 
                    ? '0 4px 16px rgba(34, 197, 94, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {isSelected ? '✓' : '+'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModernTableGridProps {
  tables: TableWithState[];
  selectedTables?: string[];
  onTableSelect?: (tableId: string) => void;
  onStateChange?: (tableId: string, newState: string) => void;
  combineMode?: boolean;
  groupByZone?: boolean;
}

const ModernTableGrid: React.FC<ModernTableGridProps> = ({
  tables,
  selectedTables = [],
  onTableSelect,
  onStateChange,
  combineMode = false,
  groupByZone = true
}) => {
  if (!groupByZone) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {tables.map((table) => (
          <ModernTableCard
            key={table.id}
            table={table}
            isSelected={selectedTables.includes(table.id)}
            onSelect={onTableSelect}
            onStateChange={onStateChange}
            combineMode={combineMode}
          />
        ))}
      </div>
    );
  }

  // Agrupar mesas por zona
  const tablesByZone = tables.reduce((acc, table) => {
    const zone = table.zona || 'interior';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, TableWithState[]>);

  // Ordenar zonas por prioridad lógica del restaurante
  const zoneOrder = ['interior', 'campanar', 'justicia', 'barra'];
  const sortedZones = Object.keys(tablesByZone).sort((a, b) => {
    const aIndex = zoneOrder.indexOf(a);
    const bIndex = zoneOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return (
    <div className="space-y-8">
      {sortedZones.map((zone) => {
        const zoneConfig = ZONE_CONFIG[zone as keyof typeof ZONE_CONFIG] || ZONE_CONFIG.interior;
        const zoneTables = tablesByZone[zone];
        
        return (
          <div key={zone} className="space-y-4">
            {/* Header de zona mejorado */}
            <div className="relative mb-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-xl border-2"
                  style={{ 
                    backgroundColor: zoneConfig.color,
                    borderColor: zoneConfig.borderColor,
                    boxShadow: `0 8px 25px ${zoneConfig.color}30`
                  }}
                >
                  <zoneConfig.icon size={28} color="white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {zoneConfig.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {zoneTables.length} mesa{zoneTables.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {zoneTables.reduce((total, table) => total + table.capacidad, 0)} pax total
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ 
                      backgroundColor: zoneConfig.bgColor,
                      color: zoneConfig.color 
                    }}>
                      {zoneConfig.description}
                    </span>
                  </div>
                </div>
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
                style={{ marginTop: '16px' }}
              />
            </div>

            {/* Grid de mesas de la zona */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {zoneTables.map((table) => (
                <ModernTableCard
                  key={table.id}
                  table={table}
                  isSelected={selectedTables.includes(table.id)}
                  onSelect={onTableSelect}
                  onStateChange={onStateChange}
                  combineMode={combineMode}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModernTableGrid;