import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Settings, Grid3X3, Map, ZoomIn, ZoomOut, RotateCcw, Save,
  Eye, EyeOff, Maximize2, Minimize2, Users, Clock, CheckCircle,
  AlertCircle, Coffee, Timer, Trash2, Edit, Link, Unlink,
  MapPin, Activity, BarChart3, Filter, Search, Download, Calendar
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { useTablesWithStates, TableWithState, useUpdateTableState } from '@/hooks/useTableStates';
import { useZoneStats } from '@/hooks/useZoneStats';
import { useTableCombinations, useCreateTableCombination, useDeleteTableCombination } from '@/hooks/useTableCombinations';
import { useTodayReservations, useUpdateReservation } from '@/hooks/useReservations';
import type { EstadoMesa, Reserva } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ModernTableGrid from '@/components/tables/ModernTableGrid';

// Colores oficiales Enigma
const ENIGMA_COLORS = {
  primary: '#237584',
  secondary: '#9FB289', 
  accent: '#CB5910'
} as const;

// Estados de mesa con colores oficiales
const TABLE_STATES = {
  libre: {
    color: '#9FB289',
    bgColor: '#9FB28915',
    borderColor: '#9FB289',
    icon: CheckCircle,
    label: 'Disponible',
    textColor: '#9FB289'
  },
  ocupada: {
    color: '#237584',
    bgColor: '#23758415',
    borderColor: '#237584',
    icon: Coffee,
    label: 'Ocupada',
    textColor: '#237584'
  },
  reservada: {
    color: '#CB5910',
    bgColor: '#CB591015',
    borderColor: '#CB5910',
    icon: Clock,
    label: 'Reservada',
    textColor: '#CB5910'
  },
  limpieza: {
    color: '#8E8E93',
    bgColor: '#8E8E9315',
    borderColor: '#8E8E93',
    icon: Timer,
    label: 'Limpieza',
    textColor: '#8E8E93'
  },
  fuera_servicio: {
    color: '#FF3B30',
    bgColor: '#FF3B3015',
    borderColor: '#FF3B30',
    icon: AlertCircle,
    label: 'Fuera de Servicio',
    textColor: '#FF3B30'
  }
} as const;

// Configuración de zonas
const ZONE_CONFIG = {
  terraza: {
    id: 'terraza',
    name: 'Terraza',
    emoji: '🌿',
    color: '#9FB289',
    bgColor: '#9FB28910'
  },
  interior: {
    id: 'interior', 
    name: 'Sala Interior',
    emoji: '🏛️',
    color: '#237584',
    bgColor: '#23758410'
  },
  barra: {
    id: 'barra',
    name: 'Zona Barra',
    emoji: '🍸',
    color: '#CB5910',
    bgColor: '#CB591010'
  }
} as const;

interface TableModalProps {
  table: TableWithState | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableData: any) => void;
  isNew?: boolean;
}

function TableModal({ table, isOpen, onClose, onSave, isNew = false }: TableModalProps) {
  const [formData, setFormData] = useState({
    numero_mesa: '',
    capacidad: 2,
    tipo_mesa: 'regular',
    zona: 'terraza',
    activa: true,
    posicion_x: 0,
    posicion_y: 0,
    es_combinable: true
  });

  useEffect(() => {
    if (table && !isNew) {
      setFormData({
        numero_mesa: table.numero_mesa || '',
        capacidad: table.capacidad || 2,
        tipo_mesa: table.tipo_mesa || 'regular',
        zona: table.zona || 'terraza',
        activa: table.activa ?? true,
        posicion_x: table.posicion_x || 0,
        posicion_y: table.posicion_y || 0,
        es_combinable: table.es_combinable ?? true
      });
    } else if (isNew) {
      setFormData({
        numero_mesa: '',
        capacidad: 2,
        tipo_mesa: 'regular',
        zona: 'terraza',
        activa: true,
        posicion_x: Math.random() * 300,
        posicion_y: Math.random() * 200,
        es_combinable: true
      });
    }
  }, [table, isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <IOSCard variant="elevated" className="w-full max-w-lg animate-scale-in">
          <IOSCardHeader className="border-b border-enigma-neutral-200">
            <IOSCardTitle className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-ios flex items-center justify-center"
                style={{ backgroundColor: `${ENIGMA_COLORS.primary}20`, color: ENIGMA_COLORS.primary }}
              >
                {isNew ? <Plus size={20} /> : <Edit size={20} />}
              </div>
              <div>
                <h2 className="ios-text-headline font-bold text-enigma-neutral-900">
                  {isNew ? 'Nueva Mesa' : 'Editar Mesa'}
                </h2>
                <p className="ios-text-caption1 text-enigma-neutral-600 mt-0.5">
                  {isNew ? 'Agregar mesa al plano' : 'Modificar propiedades de la mesa'}
                </p>
              </div>
            </IOSCardTitle>
          </IOSCardHeader>
          
          <IOSCardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Número de mesa */}
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Número de Mesa
                </label>
                <input
                  type="text"
                  value={formData.numero_mesa}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero_mesa: e.target.value }))}
                  className="w-full px-4 py-3 rounded-ios border border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors"
                  placeholder="Ej: A1, Mesa 5, etc."
                  required
                />
              </div>

              {/* Capacidad */}
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Capacidad
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidad: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-ios border border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Tipo y Zona */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo_mesa}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_mesa: e.target.value }))}
                    className="w-full px-4 py-3 rounded-ios border border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors"
                  >
                    <option value="regular">Regular</option>
                    <option value="alta">Alta</option>
                    <option value="vip">VIP</option>
                    <option value="exterior">Exterior</option>
                  </select>
                </div>

                <div>
                  <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                    Zona
                  </label>
                  <select
                    value={formData.zona}
                    onChange={(e) => setFormData(prev => ({ ...prev, zona: e.target.value }))}
                    className="w-full px-4 py-3 rounded-ios border border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors"
                  >
                    <option value="terraza">🌿 Terraza</option>
                    <option value="interior">🏛️ Sala Interior</option>
                    <option value="barra">🍸 Zona Barra</option>
                  </select>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={(e) => setFormData(prev => ({ ...prev, activa: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-enigma-neutral-300 text-enigma-primary focus:ring-enigma-primary focus:ring-2"
                  />
                  <div>
                    <span className="ios-text-callout font-medium text-enigma-neutral-900">Mesa Activa</span>
                    <p className="ios-text-caption1 text-enigma-neutral-600">Disponible para reservas</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.es_combinable}
                    onChange={(e) => setFormData(prev => ({ ...prev, es_combinable: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-enigma-neutral-300 text-enigma-primary focus:ring-enigma-primary focus:ring-2"
                  />
                  <div>
                    <span className="ios-text-callout font-medium text-enigma-neutral-900">Combinable</span>
                    <p className="ios-text-caption1 text-enigma-neutral-600">Se puede juntar con otras mesas</p>
                  </div>
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-enigma-neutral-200">
                <IOSButton 
                  type="button"
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </IOSButton>
                <IOSButton 
                  type="submit"
                  variant="primary"
                  className="flex-1 text-white"
                  style={{ backgroundColor: ENIGMA_COLORS.primary }}
                >
                  {isNew ? 'Crear Mesa' : 'Guardar Cambios'}
                </IOSButton>
              </div>
            </form>
          </IOSCardContent>
        </IOSCard>
      </div>
    </>
  );
}

interface ReservationAssignmentModalProps {
  table: TableWithState | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (reservationId: string) => void;
}

function ReservationAssignmentModal({ table, isOpen, onClose, onAssign }: ReservationAssignmentModalProps) {
  const { data: todayReservations = [] } = useTodayReservations();
  const [selectedReservation, setSelectedReservation] = useState<string>('');

  // Filtrar reservas sin mesa asignada o pendientes de confirmación
  const availableReservations = todayReservations.filter(
    (reservation: any) => 
      !reservation.mesa_id && 
      ['pendiente_confirmacion', 'confirmada'].includes(reservation.estado_reserva)
  );

  const handleAssign = () => {
    if (selectedReservation) {
      onAssign(selectedReservation);
      setSelectedReservation('');
      onClose();
    }
  };

  if (!isOpen || !table) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <IOSCard variant="elevated" className="w-full max-w-lg animate-scale-in">
          <IOSCardHeader className="border-b border-enigma-neutral-200">
            <IOSCardTitle className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-ios flex items-center justify-center"
                style={{ backgroundColor: `${ENIGMA_COLORS.primary}20`, color: ENIGMA_COLORS.primary }}
              >
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="ios-text-headline font-bold text-enigma-neutral-900">
                  Asignar Reserva
                </h2>
                <p className="ios-text-caption1 text-enigma-neutral-600 mt-0.5">
                  Mesa {table.numero_mesa} • {table.capacidad} personas
                </p>
              </div>
            </IOSCardTitle>
          </IOSCardHeader>
          
          <IOSCardContent className="p-6">
            {availableReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
                <p className="ios-text-body text-enigma-neutral-500 mb-2">
                  No hay reservas disponibles
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-400">
                  Todas las reservas de hoy ya tienen mesa asignada
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="ios-text-callout font-medium text-enigma-neutral-900">
                  Selecciona una reserva para asignar a esta mesa:
                </p>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {availableReservations.map((reservation: any) => (
                    <label 
                      key={reservation.id}
                      className={`flex items-center gap-3 p-3 rounded-ios border-2 cursor-pointer transition-all ${
                        selectedReservation === reservation.id
                          ? 'border-enigma-primary bg-enigma-primary/5'
                          : 'border-enigma-neutral-200 hover:border-enigma-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reservation"
                        value={reservation.id}
                        checked={selectedReservation === reservation.id}
                        onChange={(e) => setSelectedReservation(e.target.value)}
                        className="w-4 h-4 text-enigma-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="ios-text-callout font-bold text-enigma-neutral-900">
                            {reservation.clientes?.nombre} {reservation.clientes?.apellido}
                          </span>
                          {reservation.clientes?.vip_status && (
                            <IOSBadge variant="custom" style={{ backgroundColor: ENIGMA_COLORS.accent, color: 'white' }}>
                              VIP
                            </IOSBadge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 ios-text-caption1 text-enigma-neutral-600">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{reservation.hora_reserva}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{reservation.numero_comensales} personas</span>
                          </div>
                          <IOSBadge 
                            variant={reservation.estado_reserva === 'confirmada' ? 'success' : 'warning'}
                          >
                            {reservation.estado_reserva === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                          </IOSBadge>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-6 border-t border-enigma-neutral-200">
              <IOSButton 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </IOSButton>
              {availableReservations.length > 0 && (
                <IOSButton 
                  onClick={handleAssign}
                  variant="primary"
                  className="flex-1 text-white"
                  style={{ backgroundColor: ENIGMA_COLORS.primary }}
                  disabled={!selectedReservation}
                >
                  Asignar Reserva
                </IOSButton>
              )}
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>
    </>
  );
}

export default function Mesas() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estados para combinaciones
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [combineMode, setCombineMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'floor-plan'>('grid');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTable, setSelectedTable] = useState<TableWithState | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [isNewTable, setIsNewTable] = useState(false);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [showInactiveTables, setShowInactiveTables] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para asignación de reservas
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [tableForReservation, setTableForReservation] = useState<TableWithState | null>(null);

  const { data: tables = [], refetch, isLoading } = useTablesWithStates();
  const updateTableState = useUpdateTableState();
  const { data: zoneStats = [] } = useZoneStats();
  const { data: tableCombinations = [] } = useTableCombinations();
  const createCombination = useCreateTableCombination();
  const deleteCombination = useDeleteTableCombination();
  const updateReservation = useUpdateReservation();

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('mesas-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'mesas' 
      }, () => {
        refetch();
      })
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

  // Filtrar mesas
  const filteredTables = tables.filter(table => {
    const matchesZone = selectedZone === 'all' || table.zona === selectedZone;
    const matchesActive = showInactiveTables || table.activa;
    const matchesSearch = !searchQuery || 
      table.numero_mesa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.tipo_mesa?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesZone && matchesActive && matchesSearch;
  });

  // Estadísticas
  const totalTables = tables.length;
  const activeTables = tables.filter(t => t.activa).length;
  const occupiedTables = tables.filter(t => t.estado_actual === 'ocupada').length;
  const availableTables = tables.filter(t => t.estado_actual === 'libre' && t.activa).length;

  const handleCreateTable = () => {
    setSelectedTable(null);
    setIsNewTable(true);
    setShowTableModal(true);
  };

  const handleEditTable = (table: TableWithState) => {
    setSelectedTable(table);
    setIsNewTable(false);
    setShowTableModal(true);
  };

  const handleSaveTable = async (tableData: any) => {
    try {
      if (isNewTable) {
        const { data, error } = await supabase
          .from('mesas')
          .insert([tableData])
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Mesa creada correctamente');
      } else if (selectedTable) {
        const { error } = await supabase
          .from('mesas')
          .update(tableData)
          .eq('id', selectedTable.id);

        if (error) throw error;
        
        toast.success('Mesa actualizada correctamente');
      }
      
      refetch();
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      toast.error('Error al guardar la mesa');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return;
    
    try {
      const { error } = await supabase
        .from('mesas')
        .delete()
        .eq('id', tableId);

      if (error) throw error;
      
      toast.success('Mesa eliminada correctamente');
      refetch();
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      toast.error('Error al eliminar la mesa');
    }
  };

  const handleStateChange = async (tableId: string, newState: string) => {
    try {
      await updateTableState.mutateAsync({
        mesaId: tableId,
        estado: newState as any,
        notas: `Estado cambiado a ${newState}`
      });
      
      toast.success(`Mesa marcada como ${TABLE_STATES[newState as keyof typeof TABLE_STATES]?.label}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado de la mesa');
    }
  };

  // Handlers para combinaciones de mesas
  const handleToggleCombineMode = () => {
    setCombineMode(!combineMode);
    setSelectedTables([]);
  };

  const handleTableSelect = (tableId: string) => {
    if (!combineMode) return;
    
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleCombineTables = async () => {
    if (selectedTables.length < 2) {
      toast.error('Selecciona al menos 2 mesas para combinar');
      return;
    }

    try {
      const selectedTablesData = tables.filter(t => selectedTables.includes(t.id));
      const totalCapacity = selectedTablesData.reduce((sum, table) => sum + table.capacidad, 0);
      
      // Por ahora, simplemente simulamos la combinación mostrando un mensaje
      toast.success(`Mesas ${selectedTablesData.map(t => t.numero_mesa).join(', ')} marcadas para combinar (Capacidad total: ${totalCapacity} personas)`);
      setSelectedTables([]);
      setCombineMode(false);
      
      // TODO: Implementar la lógica real de combinación cuando las tablas de BD estén listas
      console.log('Tables to combine:', selectedTablesData);
    } catch (error) {
      console.error('Error al combinar mesas:', error);
      toast.error('Error al combinar las mesas');
    }
  };

  const handleSplitCombination = async (combinationId: string) => {
    if (!confirm('¿Estás seguro de separar esta combinación?')) return;

    try {
      // Por ahora, simplemente simulamos la separación
      toast.success('Combinación separada correctamente');
      // TODO: Implementar la lógica real cuando las tablas de BD estén listas
    } catch (error) {
      console.error('Error al separar combinación:', error);
      toast.error('Error al separar la combinación');
    }
  };

  // Verificar si una mesa está en una combinación activa
  const getTableCombination = (tableId: string) => {
    // Por ahora retorna null hasta que implementemos la funcionalidad completa
    return null;
  };

  const isTableCombined = (tableId: string) => {
    return false; // Temporalmente deshabilitado
  };

  // Handlers para asignación de reservas
  const handleAssignReservation = (table: TableWithState) => {
    setTableForReservation(table);
    setShowReservationModal(true);
  };

  const handleReservationAssign = async (reservationId: string) => {
    if (!tableForReservation) return;

    try {
      await updateReservation.mutateAsync({
        id: reservationId,
        mesa_id: tableForReservation.id,
        estado_reserva: 'confirmada'
      });

      // Cambiar estado de la mesa a reservada
      await updateTableState.mutateAsync({
        mesaId: tableForReservation.id,
        estado: 'reservada',
        reservaId: reservationId,
        notas: `Reserva asignada`
      });

      toast.success('Reserva asignada correctamente');
      setTableForReservation(null);
    } catch (error) {
      console.error('Error al asignar reserva:', error);
      toast.error('Error al asignar la reserva');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-enigma-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="ios-text-body text-enigma-neutral-600">Cargando plano del restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sf">
      {/* Header estático */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
                Gestión de Mesas
              </h1>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Plano Virtual • {currentTime.toLocaleTimeString('es-ES')} • {totalTables} mesas
              </p>
            </div>
            <div className="flex gap-3">
              <IOSButton 
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'floor-plan' : 'grid')}
                className="border-2"
                style={{ 
                  backgroundColor: viewMode === 'floor-plan' ? '#9FB289' : 'transparent',
                  borderColor: '#9FB289',
                  color: viewMode === 'floor-plan' ? 'white' : '#9FB289'
                }}
              >
                {viewMode === 'grid' ? <Map size={20} /> : <Grid3X3 size={20} />}
                <span className="ml-2">{viewMode === 'grid' ? 'Vista Plano' : 'Vista Grid'}</span>
              </IOSButton>
              
              <IOSButton 
                variant="outline"
                onClick={handleToggleCombineMode}
                className="border-2"
                style={{ 
                  backgroundColor: combineMode ? '#CB5910' : 'transparent',
                  borderColor: '#CB5910',
                  color: combineMode ? 'white' : '#CB5910'
                }}
              >
                {combineMode ? <Unlink size={20} /> : <Link size={20} />}
                <span className="ml-2">{combineMode ? 'Cancelar' : 'Combinar'}</span>
              </IOSButton>

              {combineMode && selectedTables.length >= 2 && (
                <IOSButton 
                  variant="primary"
                  onClick={handleCombineTables}
                  className="text-white"
                  style={{ 
                    backgroundColor: ENIGMA_COLORS.accent,
                    borderColor: ENIGMA_COLORS.accent
                  }}
                >
                  <Link size={20} className="mr-2" />
                  Juntar ({selectedTables.length})
                </IOSButton>
              )}
              
              <IOSButton 
                variant="primary"
                onClick={handleCreateTable}
                className="text-white shadow-ios"
                style={{ 
                  backgroundColor: ENIGMA_COLORS.primary,
                  borderColor: ENIGMA_COLORS.primary
                }}
              >
                <Plus size={20} className="mr-2" />
                Nueva Mesa
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Total Mesas
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: ENIGMA_COLORS.primary }}>
                  {totalTables}
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  {activeTables} activas
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: `${ENIGMA_COLORS.primary}15` }}
              >
                <Grid3X3 size={24} color={ENIGMA_COLORS.primary} />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Disponibles
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: ENIGMA_COLORS.secondary }}>
                  {availableTables}
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  Listas para usar
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: `${ENIGMA_COLORS.secondary}15` }}
              >
                <CheckCircle size={24} color={ENIGMA_COLORS.secondary} />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Ocupadas
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: ENIGMA_COLORS.accent }}>
                  {occupiedTables}
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  En servicio
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: `${ENIGMA_COLORS.accent}15` }}
              >
                <Coffee size={24} color={ENIGMA_COLORS.accent} />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>

        <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
          <IOSCardContent className="enigma-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
                  Ocupación
                </p>
                <p className="ios-text-title1 font-bold mb-1" style={{ color: ENIGMA_COLORS.primary }}>
                  {activeTables > 0 ? Math.round((occupiedTables / activeTables) * 100) : 0}%
                </p>
                <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
                  Del total activo
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
                style={{ backgroundColor: `${ENIGMA_COLORS.primary}15` }}
              >
                <BarChart3 size={24} color={ENIGMA_COLORS.primary} />
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>

      {/* Controles y filtros */}
      <IOSCard variant="glass" className="mb-6">
        <IOSCardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Búsqueda */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400" 
                />
                <input
                  type="text"
                  placeholder="Buscar mesa por número o tipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-ios border border-enigma-neutral-200 bg-white ios-text-callout focus:border-enigma-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-2 rounded-ios border border-enigma-neutral-200 bg-white ios-text-footnote focus:border-enigma-primary focus:outline-none"
              >
                <option value="all">Todas las Zonas</option>
                <option value="terraza">🌿 Terraza</option>
                <option value="interior">🏛️ Sala Interior</option>
                <option value="barra">🍸 Zona Barra</option>
              </select>

              <IOSButton
                variant={showInactiveTables ? "primary" : "outline"}
                onClick={() => setShowInactiveTables(!showInactiveTables)}
                className="ios-text-footnote"
                style={showInactiveTables ? { 
                  backgroundColor: ENIGMA_COLORS.secondary,
                  borderColor: ENIGMA_COLORS.secondary,
                  color: 'white'
                } : {
                  borderColor: ENIGMA_COLORS.secondary,
                  color: ENIGMA_COLORS.secondary
                }}
              >
                {showInactiveTables ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="ml-1">Inactivas</span>
              </IOSButton>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Instrucciones para modo combinar */}
      {combineMode && (
        <IOSCard variant="elevated" className="mb-6">
          <IOSCardContent className="p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-ios flex items-center justify-center"
                style={{ backgroundColor: `${ENIGMA_COLORS.accent}20`, color: ENIGMA_COLORS.accent }}
              >
                <Link size={20} />
              </div>
              <div>
                <h3 className="ios-text-callout font-bold text-enigma-neutral-900">
                  Modo Combinación Activado
                </h3>
                <p className="ios-text-caption1 text-enigma-neutral-600">
                  Selecciona 2 o más mesas para combinarlas. 
                  {selectedTables.length > 0 && ` ${selectedTables.length} mesa${selectedTables.length === 1 ? '' : 's'} seleccionada${selectedTables.length === 1 ? '' : 's'}.`}
                </p>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      {/* Vista de mesas */}
      {viewMode === 'grid' ? (
        // Vista Grid Moderna
        <ModernTableGrid
          tables={filteredTables}
          selectedTables={selectedTables}
          onTableSelect={handleTableSelect}
          onStateChange={handleStateChange}
          combineMode={combineMode}
          groupByZone={true}
        />
      ) : (
        // Vista Floor Plan
        <IOSCard variant="elevated" className="min-h-[600px]">
          <IOSCardHeader className="border-b border-enigma-neutral-200">
            <IOSCardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Map size={24} color={ENIGMA_COLORS.primary} />
                <span>Plano del Restaurante</span>
              </div>
              <div className="flex gap-2">
                <IOSButton size="sm" variant="ghost" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
                  <ZoomOut size={16} />
                </IOSButton>
                <span className="ios-text-caption1 text-enigma-neutral-600 px-2 py-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <IOSButton size="sm" variant="ghost" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}>
                  <ZoomIn size={16} />
                </IOSButton>
                <IOSButton size="sm" variant="ghost" onClick={() => setZoomLevel(1)}>
                  <RotateCcw size={16} />
                </IOSButton>
              </div>
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="p-6 overflow-auto">
            <div 
              className="relative min-h-[500px] border-2 border-dashed border-enigma-neutral-200 rounded-ios-lg"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                width: `${100 / zoomLevel}%`,
                height: `${100 / zoomLevel}%`
              }}
            >
              {/* Zonas del restaurante */}
              <div className="absolute inset-4">
                {/* Terraza */}
                <div 
                  className="absolute top-0 left-0 w-1/3 h-full rounded-ios-lg border-2 border-dashed opacity-20"
                  style={{ backgroundColor: ZONE_CONFIG.terraza.bgColor, borderColor: ZONE_CONFIG.terraza.color }}
                >
                  <div className="p-4">
                    <span className="ios-text-caption1 font-bold" style={{ color: ZONE_CONFIG.terraza.color }}>
                      🌿 Terraza
                    </span>
                  </div>
                </div>

                {/* Interior */}
                <div 
                  className="absolute top-0 left-1/3 w-1/3 h-full rounded-ios-lg border-2 border-dashed opacity-20"
                  style={{ backgroundColor: ZONE_CONFIG.interior.bgColor, borderColor: ZONE_CONFIG.interior.color }}
                >
                  <div className="p-4">
                    <span className="ios-text-caption1 font-bold" style={{ color: ZONE_CONFIG.interior.color }}>
                      🏛️ Sala Interior
                    </span>
                  </div>
                </div>

                {/* Barra */}
                <div 
                  className="absolute top-0 right-0 w-1/3 h-full rounded-ios-lg border-2 border-dashed opacity-20"
                  style={{ backgroundColor: ZONE_CONFIG.barra.bgColor, borderColor: ZONE_CONFIG.barra.color }}
                >
                  <div className="p-4">
                    <span className="ios-text-caption1 font-bold" style={{ color: ZONE_CONFIG.barra.color }}>
                      🍸 Zona Barra
                    </span>
                  </div>
                </div>

                {/* Mesas en el plano */}
                {filteredTables.map((table) => {
                  // Obtener el estado actual de la mesa
                  const currentState = table.estado?.estado || 'libre';
                  const stateConfig = TABLE_STATES[currentState as keyof typeof TABLE_STATES] || TABLE_STATES.libre;
                  const StateIcon = stateConfig.icon;
                  const isSelected = selectedTables.includes(table.id);
                  const tableCombination = getTableCombination(table.id);
                  const isCombined = !!tableCombination;

                  return (
                    <div
                      key={table.id}
                      className={`absolute w-16 h-16 rounded-ios-lg border-2 bg-white shadow-ios transition-all duration-200 hover:scale-110 ${
                        combineMode ? 'cursor-pointer' : 'cursor-move'
                      } ${isSelected ? 'ring-4 ring-enigma-accent/50' : ''} ${
                        isCombined ? 'border-dashed border-4' : ''
                      }`}
                      style={{
                        left: `${table.posicion_x || 0}px`,
                        top: `${table.posicion_y || 0}px`,
                        borderColor: isSelected ? ENIGMA_COLORS.accent : (isCombined ? ENIGMA_COLORS.accent : stateConfig.color),
                        backgroundColor: isSelected ? `${ENIGMA_COLORS.accent}20` : stateConfig.bgColor
                      }}
                      onClick={() => combineMode ? handleTableSelect(table.id) : handleEditTable(table)}
                      title={
                        isCombined 
                          ? `Combinada: ${tableCombination?.nombre_combinacion} (${tableCombination?.capacidad_total} personas)`
                          : `Mesa ${table.numero_mesa} - ${table.capacidad} personas`
                      }
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 relative">
                        {/* Icono de combinación */}
                        {isCombined && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-enigma-accent flex items-center justify-center">
                            <Link size={8} color="white" />
                          </div>
                        )}
                        
                        {/* Icono de selección */}
                        {isSelected && (
                          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-enigma-accent flex items-center justify-center">
                            <CheckCircle size={8} color="white" />
                          </div>
                        )}
                        
                        <StateIcon size={16} color={stateConfig.color} />
                        <span 
                          className="ios-text-caption2 font-bold truncate w-full text-center"
                          style={{ color: stateConfig.color }}
                        >
                          {table.numero_mesa}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mensaje si no hay mesas */}
              {filteredTables.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Grid3X3 size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
                    <p className="ios-text-body text-enigma-neutral-500 mb-2">
                      No hay mesas en esta vista
                    </p>
                    <p className="ios-text-caption1 text-enigma-neutral-400">
                      Ajusta los filtros o crea una nueva mesa
                    </p>
                  </div>
                </div>
              )}
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      {/* Modal de mesa */}
      <TableModal
        table={selectedTable}
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSave={handleSaveTable}
        isNew={isNewTable}
      />

      {/* Modal de asignación de reservas */}
      <ReservationAssignmentModal 
        table={tableForReservation}
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onAssign={handleReservationAssign}
      />
    </div>
  );
}