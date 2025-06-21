import React, { useState } from 'react';
import { 
  Settings, Users, Clock, MapPin, Bell, Shield, Database,
  Store, Utensils, Phone, Mail, Save, Edit, Plus,
  ChevronRight, ChevronDown, ToggleLeft, ToggleRight,
  AlertCircle, CheckCircle, Volume2, Languages,
  Download, RotateCcw, Globe, Smartphone, Calendar,
  Wifi, Activity, RefreshCw, Info, MessageSquare,
  Instagram, ExternalLink, Navigation, X, Coffee, Moon
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRestaurantConfig } from '@/hooks/useRestaurantConfig';
import { useFooterConfig } from '@/hooks/useFooterConfig';
import { useReservationContent } from '@/hooks/useReservationContent';
import { useTables } from '@/hooks/useTables';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ConfigurationExport } from '@/components/features/ConfigurationExport';

// Componente para mostrar una métrica con estilo iOS
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: React.ComponentType<any>;
  trend?: number;
}) => (
  <IOSCard variant="elevated" className="ios-touch-feedback hover:scale-102 transition-all duration-200">
    <IOSCardContent className="enigma-spacing-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="ios-text-title1 font-bold mb-1" style={{ color }}>
            {value}
          </p>
          {subtitle && (
            <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div 
          className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={28} color={color} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center mt-4 pt-4 border-t border-enigma-neutral-200">
          <span 
            className={`ios-text-caption1 font-bold ${trend > 0 ? 'text-ios-available' : 'text-ios-occupied'}`}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="ios-text-caption1 text-enigma-neutral-500 ml-2">vs ayer</span>
        </div>
      )}
    </IOSCardContent>
  </IOSCard>
);

// Componente para cada sección de configuración con estilo iOS
const ConfigurationSection = ({ 
  title, 
  description,
  icon: IconComponent, 
  children, 
  isExpanded,
  onToggle,
  badge 
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: string;
}) => (
  <IOSCard variant="elevated" className="mb-4">
    <button
      onClick={onToggle}
      className="w-full ios-touch-feedback"
    >
      <IOSCardHeader className={`${isExpanded ? 'border-b border-enigma-neutral-200' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
              style={{ 
                backgroundColor: '#23758420',
                color: '#237584'
              }}
            >
              <IconComponent size={24} />
            </div>
            <div className="text-left">
              <IOSCardTitle className="ios-text-headline mb-1">
                {title}
              </IOSCardTitle>
              {description && (
                <p className="ios-text-footnote text-enigma-neutral-600">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {badge && (
              <IOSBadge variant="primary" size="lg">
                {badge}
              </IOSBadge>
            )}
            {isExpanded ? (
              <ChevronDown size={20} className="text-enigma-neutral-500" />
            ) : (
              <ChevronRight size={20} className="text-enigma-neutral-500" />
            )}
          </div>
        </div>
      </IOSCardHeader>
    </button>
    
    {isExpanded && (
      <IOSCardContent className="pt-4">
        {children}
      </IOSCardContent>
    )}
  </IOSCard>
);

// Componente para cada item de configuración con estilo iOS
const SettingRow = ({ 
  label, 
  description, 
  value, 
  type = 'text', 
  options = [], 
  onChange,
  icon: IconComponent,
  color = 'var(--enigma-primary)'
}: {
  label: string;
  description?: string;
  value: any;
  type?: 'text' | 'toggle' | 'select' | 'number';
  options?: { value: string; label: string }[];
  onChange: (value: any) => void;
  icon?: React.ComponentType<any>;
  color?: string;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-enigma-neutral-200 last:border-0 ios-touch-feedback">
    <div className="flex items-center gap-3 flex-1">
      {IconComponent && (
        <div 
          className="w-9 h-9 rounded-ios flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <IconComponent size={18} />
        </div>
      )}
      <div className="flex-1">
        <div className="ios-text-body font-medium text-enigma-neutral-900">
          {label}
        </div>
        {description && (
          <div className="ios-text-caption1 text-enigma-neutral-600 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </div>
    
    <div className="min-w-[120px] flex justify-end">
      {type === 'toggle' && (
        <Switch
          checked={value}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-ios-available"
        />
      )}
      
      {type === 'text' && (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-48 text-right border-enigma-neutral-200 focus:border-ios-reserved rounded-ios"
        />
      )}
      
      {type === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-32 text-right border-enigma-neutral-200 focus:border-ios-reserved rounded-ios"
        />
      )}
      
      {type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 rounded-ios border border-enigma-neutral-200 bg-white ios-text-callout focus:border-ios-reserved"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  </div>
);

export default function Configuracion() {
  const { 
    config, 
    horarios, 
    horariosPublicos, 
    loading, 
    updateConfig, 
    updateHorario,
    addHorarioPublico,
    updateHorarioPublico,
    removeHorarioPublico
  } = useRestaurantConfig();
  const { footerInfo, loading: footerLoading, updateFooterInfo, createFooterInfo } = useFooterConfig();
  const { 
    reservationContent, 
    loading: reservationLoading, 
    updateReservationContent,
    createReservationContent,
    addHorarioComida,
    addHorarioCena,
    removeHorarioComida,
    removeHorarioCena
  } = useReservationContent();
  const { data: tables, isLoading: tablesLoading, error: tablesError } = useTables();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [newPublicSchedule, setNewPublicSchedule] = useState({ days: '', hours: '' });
  
  // Estados locales para edición (no se guardan hasta hacer click en "Guardar")
  const [localConfig, setLocalConfig] = useState(config);
  const [localHorariosPublicos, setLocalHorariosPublicos] = useState(horariosPublicos);
  const [localFooterInfo, setLocalFooterInfo] = useState(footerInfo);
  const [localReservationContent, setLocalReservationContent] = useState(reservationContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    restaurant: true,
    footer: false,
    tables: false,
    schedule: false,
    notifications: false,
    integrations: false,
    backup: false
  });

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sincronizar estados locales cuando se cargan los datos
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  React.useEffect(() => {
    setLocalHorariosPublicos(horariosPublicos);
  }, [horariosPublicos]);

  React.useEffect(() => {
    setLocalFooterInfo(footerInfo);
  }, [footerInfo]);

  React.useEffect(() => {
    setLocalReservationContent(reservationContent);
  }, [reservationContent]);

  const toggleExpanded = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Funciones para manejar cambios locales
  const handleLocalConfigChange = (updates: any) => {
    setLocalConfig(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  const handleLocalHorarioPublicoChange = (index: number, updates: any) => {
    setLocalHorariosPublicos(prev => {
      const newHorarios = [...prev];
      newHorarios[index] = { ...newHorarios[index], ...updates };
      return newHorarios;
    });
    setHasUnsavedChanges(true);
  };

  const handleLocalAddHorarioPublico = (days: string, hours: string) => {
    setLocalHorariosPublicos(prev => [...prev, { days, hours }]);
    setHasUnsavedChanges(true);
  };

  const handleLocalRemoveHorarioPublico = (index: number) => {
    setLocalHorariosPublicos(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleLocalFooterChange = (updates: any) => {
    setLocalFooterInfo(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  const handleLocalReservationContentChange = (updates: any) => {
    setLocalReservationContent(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  const handleLocalAddHorarioComida = (horario: string) => {
    if (!localReservationContent) return;
    const nuevosHorarios = [...(localReservationContent.horarios_comida || []), horario];
    setLocalReservationContent(prev => prev ? { ...prev, horarios_comida: nuevosHorarios } : null);
    setHasUnsavedChanges(true);
  };

  const handleLocalAddHorarioCena = (horario: string) => {
    if (!localReservationContent) return;
    const nuevosHorarios = [...(localReservationContent.horarios_cena || []), horario];
    setLocalReservationContent(prev => prev ? { ...prev, horarios_cena: nuevosHorarios } : null);
    setHasUnsavedChanges(true);
  };

  const handleLocalRemoveHorarioComida = (index: number) => {
    if (!localReservationContent) return;
    const nuevosHorarios = localReservationContent.horarios_comida.filter((_, i) => i !== index);
    setLocalReservationContent(prev => prev ? { ...prev, horarios_comida: nuevosHorarios } : null);
    setHasUnsavedChanges(true);
  };

  const handleLocalRemoveHorarioCena = (index: number) => {
    if (!localReservationContent) return;
    const nuevosHorarios = localReservationContent.horarios_cena.filter((_, i) => i !== index);
    setLocalReservationContent(prev => prev ? { ...prev, horarios_cena: nuevosHorarios } : null);
    setHasUnsavedChanges(true);
  };

  const diasSemana = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  const handleSaveAll = async () => {
    try {
      const promises = [];

      // Guardar configuración del restaurante si hay cambios
      if (localConfig && JSON.stringify(localConfig) !== JSON.stringify(config)) {
        promises.push(updateConfig(localConfig));
      }

      // Guardar horarios públicos si hay cambios
      if (JSON.stringify(localHorariosPublicos) !== JSON.stringify(horariosPublicos)) {
        promises.push(updateHorariosPublicos(localHorariosPublicos));
      }

      // Guardar footer si hay cambios
      if (localFooterInfo && JSON.stringify(localFooterInfo) !== JSON.stringify(footerInfo)) {
        promises.push(updateFooterInfo(localFooterInfo));
      }

      // Guardar contenido de reservas si hay cambios
      if (localReservationContent && JSON.stringify(localReservationContent) !== JSON.stringify(reservationContent)) {
        promises.push(updateReservationContent(localReservationContent));
      }

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(promises);

      setHasUnsavedChanges(false);
      
      toast({
        title: "Configuración guardada",
        description: "Todos los cambios han sido guardados correctamente.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ios-reserved border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="ios-text-body text-enigma-neutral-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Métricas para mostrar
  const mesasActivas = tables?.filter(t => t.activa).length || 0;
  const totalMesas = tables?.length || 0;


  return (
    <div className="font-sf">
      {/* Header estático */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900 flex items-center gap-2">
                Configuración
                {hasUnsavedChanges && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    Cambios sin guardar
                  </span>
                )}
              </h1>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                Sistema Enigma • {currentTime.toLocaleTimeString('es-ES')}
              </p>
            </div>
            <div className="flex gap-3">
              <IOSButton 
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="border-2 text-white shadow-ios"
                style={{ 
                  backgroundColor: '#9FB289',
                  borderColor: '#9FB289'
                }}
              >
                <Download size={20} className="mr-2" />
                Exportar
              </IOSButton>
              <IOSButton 
                variant="primary"
                onClick={handleSaveAll}
                className="text-white shadow-ios relative"
                style={{ 
                  backgroundColor: hasUnsavedChanges ? '#CB5910' : '#237584',
                  borderColor: hasUnsavedChanges ? '#CB5910' : '#237584'
                }}
              >
                {hasUnsavedChanges && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                <Save size={20} className="mr-2" />
                {hasUnsavedChanges ? 'Guardar Cambios' : 'Guardar'}
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Mesas Activas"
            value={`${mesasActivas}/${totalMesas}`}
            subtitle="En funcionamiento"
            color="#9FB289"
            icon={Utensils}
          />
          <MetricCard
            title="Capacidad Total"
            value={config?.capacidad_maxima || 0}
            subtitle="Comensales máx."
            color="#237584"
            icon={Users}
          />
          <MetricCard
            title="Duración Reserva"
            value={`${config?.duracion_reserva_default_minutos || 0}m`}
            subtitle="Tiempo estándar"
            color="#CB5910"
            icon={Clock}
          />
          <MetricCard
            title="Auto Aceptar"
            value={config?.auto_aceptar_reservas ? 'Activo' : 'Inactivo'}
            subtitle="Reservas automáticas"
            color="#237584"
            icon={CheckCircle}
          />
        </div>

        {/* Secciones de configuración */}
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Información del Restaurante */}
          <ConfigurationSection
            title="Información del Restaurante"
            description="Datos básicos del establecimiento"
            icon={Store}
            isExpanded={expandedSections.restaurant}
            onToggle={() => toggleExpanded('restaurant')}
          >
            {localConfig && (
              <div className="space-y-0">
                <SettingRow
                  label="Nombre del Restaurante"
                  description="Nombre que aparecerá en las reservas"
                  value={localConfig.nombre_restaurante}
                  icon={Store}
                  onChange={(value) => handleLocalConfigChange({ nombre_restaurante: value })}
                />
                <SettingRow
                  label="Dirección"
                  description="Dirección completa del establecimiento"
                  value={localConfig.direccion}
                  icon={MapPin}
                  onChange={(value) => handleLocalConfigChange({ direccion: value })}
                />
                <SettingRow
                  label="Teléfono"
                  description="Número de contacto principal"
                  value={localConfig.telefono}
                  icon={Phone}
                  onChange={(value) => handleLocalConfigChange({ telefono: value })}
                />
                <SettingRow
                  label="Email de Reservas"
                  description="Correo electrónico para notificaciones"
                  value={localConfig.email}
                  icon={Mail}
                  onChange={(value) => handleLocalConfigChange({ email: value })}
                />
                <SettingRow
                  label="URL del Mapa"
                  description="Enlace a Google Maps o ubicación"
                  value={localConfig.mapa_url || ''}
                  icon={MapPin}
                  onChange={(value) => handleLocalConfigChange({ mapa_url: value })}
                />
                <SettingRow
                  label="Texto Adicional"
                  description="Información extra del restaurante"
                  value={localConfig.texto_adicional || ''}
                  icon={MessageSquare}
                  onChange={(value) => handleLocalConfigChange({ texto_adicional: value })}
                />
              </div>
            )}
          </ConfigurationSection>

          {/* Configuración del Footer Web */}
          <ConfigurationSection
            title="Configuración del Footer Web"
            description="Gestiona la información que aparece en el footer de la página web"
            icon={Globe}
            isExpanded={expandedSections.footer}
            onToggle={() => toggleExpanded('footer')}
            color="#CB5910"
          >
            {footerLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-enigma-primary" />
                <span className="ml-2 text-enigma-neutral-600">Cargando configuración del footer...</span>
              </div>
            ) : localFooterInfo ? (
              <div className="space-y-4">
                <SettingRow
                  label="Descripción del Restaurante"
                  description="Descripción que aparece en el footer web"
                  value={localFooterInfo.descripcion_restaurante || ''}
                  icon={MessageSquare}
                  onChange={(value) => handleLocalFooterChange({ descripcion_restaurante: value })}
                />
                <SettingRow
                  label="Dirección"
                  description="Dirección física del restaurante"
                  value={localFooterInfo.direccion}
                  icon={MapPin}
                  onChange={(value) => handleLocalFooterChange({ direccion: value })}
                />
                <SettingRow
                  label="Teléfono"
                  description="Teléfono de contacto"
                  value={localFooterInfo.telefono}
                  icon={Phone}
                  onChange={(value) => handleLocalFooterChange({ telefono: value })}
                />
                <SettingRow
                  label="Email"
                  description="Email de contacto"
                  value={localFooterInfo.email}
                  icon={Mail}
                  onChange={(value) => handleLocalFooterChange({ email: value })}
                />
                <SettingRow
                  label="Instagram URL"
                  description="Enlace a perfil de Instagram"
                  value={localFooterInfo.instagram_url}
                  icon={Instagram}
                  color="#E4405F"
                  onChange={(value) => handleLocalFooterChange({ instagram_url: value })}
                />
                <SettingRow
                  label="TripAdvisor URL"
                  description="Enlace a página de TripAdvisor"
                  value={localFooterInfo.tripadvisor_url}
                  icon={ExternalLink}
                  color="#00AA6C"
                  onChange={(value) => handleLocalFooterChange({ tripadvisor_url: value })}
                />
                <SettingRow
                  label="Google Maps URL"
                  description="Enlace a ubicación en Google Maps"
                  value={localFooterInfo.google_maps_url}
                  icon={Navigation}
                  color="#4285F4"
                  onChange={(value) => handleLocalFooterChange({ google_maps_url: value })}
                />
                <SettingRow
                  label="WhatsApp URL"
                  description="Enlace directo de WhatsApp (opcional)"
                  value={localFooterInfo.whatsapp_url || ''}
                  icon={Smartphone}
                  color="#25D366"
                  onChange={(value) => handleLocalFooterChange({ whatsapp_url: value })}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Globe className="w-12 h-12 mx-auto text-enigma-neutral-400 mb-3" />
                  <h4 className="ios-text-headline font-semibold text-enigma-neutral-700 mb-2">
                    No hay configuración de footer
                  </h4>
                  <p className="ios-text-body text-enigma-neutral-600">
                    Configure la información que aparecerá en el footer de su página web
                  </p>
                </div>
                <IOSButton 
                  variant="primary"
                  onClick={() => createFooterInfo({
                    descripcion_restaurante: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    instagram_url: '',
                    tripadvisor_url: '',
                    google_maps_url: ''
                  })}
                  className="text-white shadow-ios"
                  style={{ 
                    backgroundColor: '#CB5910',
                    borderColor: '#CB5910'
                  }}
                >
                  <Plus size={20} className="mr-2" />
                  Crear Configuración del Footer
                </IOSButton>
              </div>
            )}
          </ConfigurationSection>

          {/* Gestión de Usuarios - Botón de acceso rápido */}
          <IOSCard variant="glass" className="ios-touch-feedback">
            <IOSCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-ios-lg flex items-center justify-center shadow-ios"
                    style={{ 
                      backgroundColor: '#9FB28920',
                      color: '#9FB289'
                    }}
                  >
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                      Gestión de Usuarios
                    </h3>
                    <p className="ios-text-footnote text-enigma-neutral-600 mt-0.5">
                      Administrar empleados y permisos del sistema
                    </p>
                  </div>
                </div>
                <IOSButton 
                  variant="secondary"
                  onClick={() => navigate('/usuarios')}
                >
                  Gestionar
                  <ChevronRight size={18} className="ml-2" />
                </IOSButton>
              </div>
            </IOSCardContent>
          </IOSCard>

          {/* Gestión de Mesas */}
          <ConfigurationSection
            title="Gestión de Mesas"
            description="Configuración de mesas y distribución"
            icon={Utensils}
            isExpanded={expandedSections.tables}
            onToggle={() => toggleExpanded('tables')}
            badge={`${tables?.length || 0} mesas`}
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="ios-text-headline font-semibold text-enigma-neutral-900">
                  Mesas Configuradas
                </h4>
                <IOSButton variant="primary" size="sm">
                  <Plus size={16} className="mr-2" />
                  Nueva Mesa
                </IOSButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tables?.slice(0, 6).map((table) => (
                  <IOSCard key={table.id} variant="glass">
                    <IOSCardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="ios-text-callout font-semibold text-enigma-neutral-900">
                            Mesa {table.numero_mesa}
                          </h5>
                          <p className="ios-text-caption1 text-enigma-neutral-600 mt-1">
                            {table.zona === 'interior' && '🏛️ Interior'} 
                            {table.zona === 'campanar' && '🌿 Terraza Campanar'}
                            {table.zona === 'justicia' && '🍸 Terraza Justicia'}
                            {!['interior', 'campanar', 'justicia'].includes(table.zona) && table.zona}
                            {' • '}Capacidad: {table.capacidad}
                          </p>
                        </div>
                        <IOSBadge 
                          variant={table.activa ? "available" : "maintenance"}
                          size="lg"
                        >
                          {table.activa ? 'Activa' : 'Inactiva'}
                        </IOSBadge>
                      </div>
                      <div className="flex gap-2">
                        <IOSButton size="sm" variant="ghost" className="flex-1">
                          <Edit size={14} className="mr-1" />
                          Editar
                        </IOSButton>
                      </div>
                    </IOSCardContent>
                  </IOSCard>
                ))}
              </div>
              
              {tables && tables.length > 6 && (
                <div className="mt-4 text-center">
                  <IOSButton variant="outline" onClick={() => navigate('/mesas')}>
                    Ver todas las mesas ({tables.length})
                  </IOSButton>
                </div>
              )}
            </div>
          </ConfigurationSection>

          {/* Horarios de Operación */}
          <ConfigurationSection
            title="Horarios de Operación"
            description="Gestión completa de horarios de atención y reservas"
            icon={Clock}
            isExpanded={expandedSections.schedule}
            onToggle={() => toggleExpanded('schedule')}
          >
            {reservationLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-enigma-primary" />
                <span className="ml-2 text-enigma-neutral-600">Cargando configuración de horarios...</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Horarios Públicos de Atención (tabla contacto) */}
                <div>
                  <h4 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4 flex items-center gap-2">
                    <Store size={20} className="text-enigma-primary" />
                    Horarios Públicos de Atención
                  </h4>
                  <p className="ios-text-footnote text-enigma-neutral-600 mb-4">
                    Horarios que se muestran al público en la información del restaurante
                  </p>
                  
                  <div className="bg-white rounded-ios-lg border border-enigma-neutral-200 p-4">
                    <div className="space-y-3 mb-4">
                      {localHorariosPublicos.map((horario, index) => (
                        <div 
                          key={`horario-publico-${index}`}
                          className="flex items-center gap-3 p-3 bg-enigma-neutral-50 rounded-ios"
                        >
                          <Store size={16} className="text-enigma-primary flex-shrink-0" />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              value={horario.days}
                              onChange={(e) => handleLocalHorarioPublicoChange(index, { days: e.target.value })}
                              placeholder="Ej: Lunes a Viernes"
                              className="text-sm font-medium"
                            />
                            <Input
                              value={horario.hours}
                              onChange={(e) => handleLocalHorarioPublicoChange(index, { hours: e.target.value })}
                              placeholder="Ej: 13:00 - 16:00 | 18:30 - 23:00"
                              className="text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleLocalRemoveHorarioPublico(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      {localHorariosPublicos.length === 0 && (
                        <div className="text-center py-4 text-enigma-neutral-500 ios-text-footnote">
                          No hay horarios públicos configurados
                        </div>
                      )}
                    </div>
                    
                    {/* Agregar nuevo horario público */}
                    <div className="border-t border-enigma-neutral-200 pt-4">
                      <div className="flex gap-3 mb-3">
                        <Input
                          value={newPublicSchedule.days}
                          onChange={(e) => setNewPublicSchedule(prev => ({ ...prev, days: e.target.value }))}
                          placeholder="Días (ej: Lunes a Viernes)"
                          className="flex-1"
                        />
                        <Input
                          value={newPublicSchedule.hours}
                          onChange={(e) => setNewPublicSchedule(prev => ({ ...prev, hours: e.target.value }))}
                          placeholder="Horarios (ej: 13:00 - 16:00 | 18:30 - 23:00)"
                          className="flex-1"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (newPublicSchedule.days && newPublicSchedule.hours) {
                            handleLocalAddHorarioPublico(newPublicSchedule.days, newPublicSchedule.hours);
                            setNewPublicSchedule({ days: '', hours: '' });
                          }
                        }}
                        disabled={!newPublicSchedule.days || !newPublicSchedule.hours}
                        className="w-full px-4 py-3 rounded-ios font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ios-touch-feedback disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: !newPublicSchedule.days || !newPublicSchedule.hours ? '#e2e8f0' : '#237584',
                          color: !newPublicSchedule.days || !newPublicSchedule.hours ? '#64748b' : 'white',
                          border: `1px solid ${!newPublicSchedule.days || !newPublicSchedule.hours ? '#e2e8f0' : '#237584'}`,
                          boxShadow: !newPublicSchedule.days || !newPublicSchedule.hours ? 'none' : '0 2px 8px rgba(35, 117, 132, 0.15)'
                        }}
                        onMouseEnter={(e) => {
                          if (!(!newPublicSchedule.days || !newPublicSchedule.hours)) {
                            e.currentTarget.style.backgroundColor = '#1e6a75';
                            e.currentTarget.style.borderColor = '#1e6a75';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(35, 117, 132, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(!newPublicSchedule.days || !newPublicSchedule.hours)) {
                            e.currentTarget.style.backgroundColor = '#237584';
                            e.currentTarget.style.borderColor = '#237584';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(35, 117, 132, 0.15)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <Plus size={16} />
                        Agregar Horario Público
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horarios de Reservas (tabla contenido_reservas) */}
                {localReservationContent ? (
                  <div className="space-y-6">
                    
                    {/* Horarios de Comida */}
                    <div>
                      <h4 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4 flex items-center gap-2">
                        <Coffee size={20} style={{ color: '#CB5910' }} />
                        Horarios Disponibles - Comida
                      </h4>
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-4">
                        Horarios que aparecen en el formulario de reservas para servicio de comida
                      </p>
                      
                      <div className="bg-white rounded-ios-lg border border-enigma-neutral-200 p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {localReservationContent.horarios_comida?.map((horario, index) => (
                            <div 
                              key={`comida-${index}`}
                              className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-ios text-sm font-medium"
                            >
                              <Coffee size={14} />
                              {horario}
                              <button
                                onClick={() => handleLocalRemoveHorarioComida(index)}
                                className="ml-1 text-orange-500 hover:text-orange-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {(!localReservationContent.horarios_comida || localReservationContent.horarios_comida.length === 0) && (
                            <span className="text-enigma-neutral-500 ios-text-footnote">No hay horarios configurados</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            id="horario-comida-input"
                            type="time"
                            placeholder="Nuevo horario"
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value) {
                                  handleLocalAddHorarioComida(target.value);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <IOSButton
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById('horario-comida-input') as HTMLInputElement;
                              if (input?.value) {
                                handleLocalAddHorarioComida(input.value);
                                input.value = '';
                              }
                            }}
                            style={{ borderColor: '#CB5910', color: '#CB5910' }}
                          >
                            <Plus size={16} />
                          </IOSButton>
                        </div>
                      </div>
                    </div>

                    {/* Horarios de Cena */}
                    <div>
                      <h4 className="ios-text-headline font-semibold text-enigma-neutral-900 mb-4 flex items-center gap-2">
                        <Moon size={20} style={{ color: '#237584' }} />
                        Horarios Disponibles - Cena
                      </h4>
                      <p className="ios-text-footnote text-enigma-neutral-600 mb-4">
                        Horarios que aparecen en el formulario de reservas para servicio de cena
                      </p>
                      
                      <div className="bg-white rounded-ios-lg border border-enigma-neutral-200 p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {localReservationContent.horarios_cena?.map((horario, index) => (
                            <div 
                              key={`cena-${index}`}
                              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-ios text-sm font-medium"
                            >
                              <Moon size={14} />
                              {horario}
                              <button
                                onClick={() => handleLocalRemoveHorarioCena(index)}
                                className="ml-1 text-blue-500 hover:text-blue-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {(!localReservationContent.horarios_cena || localReservationContent.horarios_cena.length === 0) && (
                            <span className="text-enigma-neutral-500 ios-text-footnote">No hay horarios configurados</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            id="horario-cena-input"
                            type="time"
                            placeholder="Nuevo horario"
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value) {
                                  handleLocalAddHorarioCena(target.value);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <IOSButton
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById('horario-cena-input') as HTMLInputElement;
                              if (input?.value) {
                                handleLocalAddHorarioCena(input.value);
                                input.value = '';
                              }
                            }}
                            style={{ borderColor: '#237584', color: '#237584' }}
                          >
                            <Plus size={16} />
                          </IOSButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Clock className="w-12 h-12 mx-auto text-enigma-neutral-400 mb-3" />
                      <h4 className="ios-text-headline font-semibold text-enigma-neutral-700 mb-2">
                        No hay configuración de horarios de reserva
                      </h4>
                      <p className="ios-text-body text-enigma-neutral-600">
                        Configure los horarios disponibles para el formulario de reservas
                      </p>
                    </div>
                    <IOSButton 
                      variant="primary"
                      onClick={() => createReservationContent({
                        titulo_principal: 'Reserva tu mesa',
                        descripcion_principal: 'Disfruta de nuestra experiencia gastronómica',
                        mensaje_confirmacion: 'Tu reserva ha sido confirmada',
                        mensaje_whatsapp: 'Hola, me gustaría hacer una reserva',
                        horarios_comida: [],
                        horarios_cena: [],
                        ocasion_opciones: []
                      })}
                      className="text-white shadow-ios"
                      style={{ 
                        backgroundColor: '#237584',
                        borderColor: '#237584'
                      }}
                    >
                      <Plus size={20} className="mr-2" />
                      Crear Configuración de Horarios
                    </IOSButton>
                  </div>
                )}
              </div>
            )}
          </ConfigurationSection>

          {/* Configuración de Notificaciones */}
          <ConfigurationSection
            title="Notificaciones"
            description="Alertas y notificaciones del sistema"
            icon={Bell}
            isExpanded={expandedSections.notifications}
            onToggle={() => toggleExpanded('notifications')}
          >
            <div className="space-y-0">
              <SettingRow
                label="Nuevas Reservas"
                description="Notificar cuando llegue una nueva reserva"
                value={true}
                type="toggle"
                icon={Bell}
                color="#237584"
                onChange={(value) => console.log('Nueva reserva:', value)}
              />
              <SettingRow
                label="Cambios en Reservas"
                description="Notificar modificaciones y cancelaciones"
                value={true}
                type="toggle"
                icon={Edit}
                color="#CB5910"
                onChange={(value) => console.log('Cambios reserva:', value)}
              />
              <SettingRow
                label="No Shows"
                description="Alertar cuando un cliente no se presente"
                value={true}
                type="toggle"
                icon={AlertCircle}
                color="#FF3B30"
                onChange={(value) => console.log('No shows:', value)}
              />
              <SettingRow
                label="Sonido"
                description="Reproducir sonido con las notificaciones"
                value={true}
                type="toggle"
                icon={Volume2}
                color="#9FB289"
                onChange={(value) => console.log('Sonido:', value)}
              />
            </div>
          </ConfigurationSection>

          {/* Integraciones */}
          <ConfigurationSection
            title="Integraciones"
            description="Conexiones con servicios externos"
            icon={Globe}
            isExpanded={expandedSections.integrations}
            onToggle={() => toggleExpanded('integrations')}
          >
            <div className="space-y-0">
              <SettingRow
                label="Google Calendar"
                description="Sincronizar reservas con Google Calendar"
                value={false}
                type="toggle"
                icon={Calendar}
                color="#4285F4"
                onChange={(value) => console.log('Google Calendar:', value)}
              />
              <SettingRow
                label="WhatsApp Business"
                description="Enviar confirmaciones por WhatsApp"
                value={false}
                type="toggle"
                icon={Smartphone}
                color="#25D366"
                onChange={(value) => console.log('WhatsApp:', value)}
              />
              <SettingRow
                label="Email Marketing"
                description="Integración con sistema de email marketing"
                value={true}
                type="toggle"
                icon={Mail}
                color="#CB5910"
                onChange={(value) => console.log('Email:', value)}
              />
              <SettingRow
                label="API REST"
                description="Acceso a API para integraciones personalizadas"
                value={true}
                type="toggle"
                icon={Wifi}
                color="#237584"
                onChange={(value) => console.log('API:', value)}
              />
            </div>
          </ConfigurationSection>

          {/* Respaldo y Seguridad */}
          <ConfigurationSection
            title="Respaldo y Seguridad"
            description="Copias de seguridad y protección de datos"
            icon={Shield}
            isExpanded={expandedSections.backup}
            onToggle={() => toggleExpanded('backup')}
          >
            <div className="space-y-0">
              <SettingRow
                label="Respaldo Automático"
                description="Crear respaldos automáticamente"
                value={true}
                type="toggle"
                icon={Database}
                color="#237584"
                onChange={(value) => console.log('Auto backup:', value)}
              />
              <SettingRow
                label="Frecuencia de Respaldo"
                description="Cada cuánto crear respaldos"
                value="daily"
                type="select"
                options={[
                  { value: 'hourly', label: 'Cada hora' },
                  { value: 'daily', label: 'Diario' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensual' }
                ]}
                icon={RefreshCw}
                color="#9FB289"
                onChange={(value) => console.log('Backup frequency:', value)}
              />
              <SettingRow
                label="Sincronización en la Nube"
                description="Guardar respaldos en la nube"
                value={true}
                type="toggle"
                icon={Globe}
                color="#237584"
                onChange={(value) => console.log('Cloud sync:', value)}
              />
              <SettingRow
                label="Autenticación de Dos Factores"
                description="Seguridad adicional para acceso al sistema"
                value={false}
                type="toggle"
                icon={Shield}
                color="#9FB289"
                onChange={(value) => console.log('2FA:', value)}
              />
            </div>
          </ConfigurationSection>

          {/* Información del Sistema */}
          <IOSCard variant="glass" className="mt-8">
            <IOSCardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-ios flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#F2F2F7',
                    color: '#8E8E93'
                  }}
                >
                  <Info size={20} />
                </div>
                <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                  Información del Sistema
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="ios-text-footnote text-enigma-neutral-600">Versión</span>
                    <span className="ios-text-footnote font-medium text-enigma-neutral-900">2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ios-text-footnote text-enigma-neutral-600">Última actualización</span>
                    <span className="ios-text-footnote font-medium text-enigma-neutral-900">06/01/2025</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="ios-text-footnote text-enigma-neutral-600">Base de datos</span>
                    <span className="ios-text-footnote font-medium text-enigma-neutral-900">PostgreSQL 15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ios-text-footnote text-enigma-neutral-600">Estado del sistema</span>
                    <span className="ios-text-footnote font-medium text-ios-available flex items-center gap-1">
                      <Activity size={12} />
                      Operativo
                    </span>
                  </div>
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>
      </div>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exportar Configuración</DialogTitle>
          </DialogHeader>
          <ConfigurationExport onClose={() => setShowExportModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}