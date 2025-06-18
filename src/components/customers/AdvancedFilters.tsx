import React, { useState } from 'react';
import { 
  Search, Filter, X, Calendar, Users, Star, Clock, 
  MapPin, Phone, Mail, Tag, Save, Download, Upload,
  ChevronDown, Plus, Trash2
} from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';

interface FilterOption {
  id: string;
  label: string;
  value: any;
  type: 'select' | 'range' | 'date' | 'multiselect' | 'boolean';
  options?: Array<{ value: any; label: string; color?: string }>;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  count: number;
  createdAt: string;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, any>) => void;
  onSaveFilter: (name: string, filters: Record<string, any>) => void;
  savedFilters: SavedFilter[];
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  activeFilters: Record<string, any>;
}

export function AdvancedFilters({
  isOpen,
  onClose,
  onApplyFilters,
  onSaveFilter,
  savedFilters,
  onLoadFilter,
  onDeleteFilter,
  activeFilters
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<Record<string, any>>(activeFilters);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Estado del Cliente',
      value: filters.status || '',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'vip', label: 'VIP', color: '#FFD700' },
        { value: 'regular', label: 'Regular', color: '#237584' },
        { value: 'nuevo', label: 'Nuevo', color: '#9FB289' },
        { value: 'inactivo', label: 'Inactivo', color: '#6B7280' }
      ]
    },
    {
      id: 'lastVisitRange',
      label: 'Última Visita',
      value: filters.lastVisitRange || '',
      type: 'select',
      options: [
        { value: '', label: 'Cualquier momento' },
        { value: '7', label: 'Última semana' },
        { value: '30', label: 'Último mes' },
        { value: '90', label: 'Últimos 3 meses' },
        { value: '180', label: 'Últimos 6 meses' },
        { value: '365', label: 'Último año' }
      ]
    },
    {
      id: 'visitFrequency',
      label: 'Frecuencia de Visitas',
      value: filters.visitFrequency || [0, 20],
      type: 'range'
    },
    {
      id: 'registrationDate',
      label: 'Fecha de Registro',
      value: filters.registrationDate || { from: '', to: '' },
      type: 'date'
    },
    {
      id: 'dietaryPreferences',
      label: 'Preferencias Dietéticas',
      value: filters.dietaryPreferences || [],
      type: 'multiselect',
      options: [
        { value: 'vegetariano', label: 'Vegetariano' },
        { value: 'vegano', label: 'Vegano' },
        { value: 'sin_gluten', label: 'Sin Gluten' },
        { value: 'sin_lactosa', label: 'Sin Lactosa' },
        { value: 'kosher', label: 'Kosher' },
        { value: 'halal', label: 'Halal' }
      ]
    },
    {
      id: 'language',
      label: 'Idioma Preferido',
      value: filters.language || '',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'es', label: 'Español' },
        { value: 'en', label: 'Inglés' },
        { value: 'fr', label: 'Francés' },
        { value: 'de', label: 'Alemán' },
        { value: 'it', label: 'Italiano' }
      ]
    },
    {
      id: 'hasPhone',
      label: 'Tiene Teléfono',
      value: filters.hasPhone || false,
      type: 'boolean'
    },
    {
      id: 'hasEmail',
      label: 'Tiene Email',
      value: filters.hasEmail || false,
      type: 'boolean'
    }
  ];

  const handleFilterChange = (filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters({ ...filters, customTags });
    onClose();
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      onSaveFilter(filterName, { ...filters, customTags });
      setShowSaveDialog(false);
      setFilterName('');
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setCustomTags([]);
  };

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const renderFilterControl = (option: FilterOption) => {
    switch (option.type) {
      case 'select':
        return (
          <select
            value={option.value}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
            className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout bg-white"
          >
            {option.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {option.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(option.value as any[]).includes(opt.value)}
                  onChange={(e) => {
                    const currentValues = option.value as any[];
                    const newValues = e.target.checked
                      ? [...currentValues, opt.value]
                      : currentValues.filter(v => v !== opt.value);
                    handleFilterChange(option.id, newValues);
                  }}
                  className="w-4 h-4 text-enigma-primary rounded border-enigma-neutral-300 focus:ring-enigma-primary"
                />
                <span className="ios-text-callout text-enigma-neutral-900">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        const [min, max] = option.value as [number, number];
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="ios-text-caption1 text-enigma-neutral-600">Mínimo: {min}</span>
              <span className="ios-text-caption1 text-enigma-neutral-600">Máximo: {max}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={min}
              onChange={(e) => handleFilterChange(option.id, [parseInt(e.target.value), max])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="50"
              value={max}
              onChange={(e) => handleFilterChange(option.id, [min, parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        );

      case 'date':
        const dateValue = option.value as { from: string; to: string };
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block ios-text-caption1 text-enigma-neutral-600 mb-1">Desde</label>
              <input
                type="date"
                value={dateValue.from}
                onChange={(e) => handleFilterChange(option.id, { ...dateValue, from: e.target.value })}
                className="w-full p-2 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
              />
            </div>
            <div>
              <label className="block ios-text-caption1 text-enigma-neutral-600 mb-1">Hasta</label>
              <input
                type="date"
                value={dateValue.to}
                onChange={(e) => handleFilterChange(option.id, { ...dateValue, to: e.target.value })}
                className="w-full p-2 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
              />
            </div>
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={option.value}
              onChange={(e) => handleFilterChange(option.id, e.target.checked)}
              className="w-4 h-4 text-enigma-primary rounded border-enigma-neutral-300 focus:ring-enigma-primary"
            />
            <span className="ios-text-callout text-enigma-neutral-900">Sí</span>
          </label>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-ios">
      <IOSCard variant="elevated" className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-ios-2xl">
        {/* Header */}
        <div className="p-6 border-b border-enigma-neutral-200 bg-gradient-to-r from-enigma-primary/5 to-enigma-secondary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-enigma-primary rounded-ios flex items-center justify-center">
                <Filter size={20} className="text-white" />
              </div>
              <div>
                <h2 className="ios-text-headline font-bold text-enigma-neutral-900">
                  Filtros Avanzados
                </h2>
                <p className="ios-text-footnote text-enigma-neutral-600">
                  Personaliza tu búsqueda de clientes
                </p>
              </div>
            </div>
            
            <IOSButton 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={20} />
            </IOSButton>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Filtros Guardados */}
            <div className="space-y-4">
              <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 flex items-center gap-2">
                <Save size={16} />
                Filtros Guardados
              </h3>
              
              <div className="space-y-2">
                {savedFilters.map((savedFilter) => (
                  <div key={savedFilter.id} className="flex items-center justify-between p-3 bg-enigma-neutral-50 rounded-ios">
                    <div className="flex-1 cursor-pointer" onClick={() => onLoadFilter(savedFilter)}>
                      <div className="ios-text-callout font-medium text-enigma-neutral-900">
                        {savedFilter.name}
                      </div>
                      <div className="ios-text-caption1 text-enigma-neutral-600">
                        {savedFilter.count} resultados
                      </div>
                    </div>
                    <IOSButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteFilter(savedFilter.id)}
                      className="w-8 h-8 p-0 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </IOSButton>
                  </div>
                ))}
                
                {savedFilters.length === 0 && (
                  <p className="ios-text-caption1 text-enigma-neutral-500 text-center py-4">
                    No hay filtros guardados
                  </p>
                )}
              </div>
            </div>

            {/* Controles de Filtro */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <label className="block ios-text-callout font-semibold text-enigma-neutral-900">
                      {option.label}
                    </label>
                    {renderFilterControl(option)}
                  </div>
                ))}
              </div>

              {/* Tags Personalizados */}
              <div className="space-y-3">
                <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 flex items-center gap-2">
                  <Tag size={16} />
                  Etiquetas Personalizadas
                </h4>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    placeholder="Agregar etiqueta..."
                    className="flex-1 p-2 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
                  />
                  <IOSButton
                    variant="primary"
                    size="sm"
                    onClick={addCustomTag}
                    className="bg-enigma-primary"
                  >
                    <Plus size={16} />
                  </IOSButton>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <IOSBadge
                      key={tag}
                      variant="custom"
                      className="bg-enigma-secondary/20 text-enigma-secondary border border-enigma-secondary/30 cursor-pointer"
                      onClick={() => removeCustomTag(tag)}
                    >
                      {tag}
                      <X size={12} className="ml-1" />
                    </IOSBadge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-enigma-neutral-200 bg-enigma-neutral-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <IOSButton
                variant="outline"
                onClick={handleClearFilters}
                className="border-enigma-neutral-300 text-enigma-neutral-600"
              >
                Limpiar Todo
              </IOSButton>
              
              <IOSButton
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                className="border-enigma-primary text-enigma-primary"
              >
                <Save size={16} className="mr-2" />
                Guardar Filtro
              </IOSButton>
            </div>
            
            <div className="flex gap-2">
              <IOSButton
                variant="outline"
                onClick={onClose}
                className="border-enigma-neutral-300 text-enigma-neutral-600"
              >
                Cancelar
              </IOSButton>
              
              <IOSButton
                variant="primary"
                onClick={handleApplyFilters}
                className="bg-enigma-primary"
              >
                Aplicar Filtros
              </IOSButton>
            </div>
          </div>
        </div>
      </IOSCard>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <IOSCard variant="elevated" className="w-full max-w-md mx-4">
            <IOSCardContent className="p-6">
              <h3 className="ios-text-headline font-bold text-enigma-neutral-900 mb-4">
                Guardar Filtro
              </h3>
              
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nombre del filtro..."
                className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout mb-4"
                autoFocus
              />
              
              <div className="flex justify-end gap-2">
                <IOSButton
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="border-enigma-neutral-300 text-enigma-neutral-600"
                >
                  Cancelar
                </IOSButton>
                
                <IOSButton
                  variant="primary"
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                  className="bg-enigma-primary"
                >
                  Guardar
                </IOSButton>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>
      )}
    </div>
  );
}