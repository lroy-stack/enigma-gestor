import React, { useState } from 'react';
import { 
  Tag, Plus, X, Edit, Trash2, Filter, Search,
  Star, Heart, AlertTriangle, CheckCircle, Clock,
  Users, Gift, Flag, Bookmark, Hash
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';

interface CustomerTag {
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

interface TagCategory {
  id: string;
  name: string;
  color: string;
  icon: any;
  description: string;
}

interface TaggingSystemProps {
  tags: CustomerTag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagCreate: (tag: Omit<CustomerTag, 'id' | 'customerCount' | 'createdAt'>) => void;
  onTagUpdate: (tagId: string, updates: Partial<CustomerTag>) => void;
  onTagDelete: (tagId: string) => void;
  onBulkTagCustomers: (customerIds: string[], tagIds: string[]) => void;
  customerCount: number;
  isCompact?: boolean;
}

export function TaggingSystem({
  tags,
  selectedTags,
  onTagSelect,
  onTagCreate,
  onTagUpdate,
  onTagDelete,
  onBulkTagCustomers,
  customerCount,
  isCompact = false
}: TaggingSystemProps) {
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [editingTag, setEditingTag] = useState<CustomerTag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#237584',
    description: '',
    category: 'custom' as const,
    icon: '',
    isSystem: false
  });

  const tagCategories: TagCategory[] = [
    {
      id: 'behavior',
      name: 'Comportamiento',
      color: '#007AFF',
      icon: Users,
      description: 'Patrones de comportamiento y frecuencia'
    },
    {
      id: 'preference',
      name: 'Preferencias',
      color: '#9FB289',
      icon: Heart,
      description: 'Preferencias gastronómicas y de servicio'
    },
    {
      id: 'status',
      name: 'Estado',
      color: '#CB5910',
      icon: Star,
      description: 'Nivel y estado del cliente'
    },
    {
      id: 'location',
      name: 'Ubicación',
      color: '#32D74B',
      icon: Flag,
      description: 'Ubicación geográfica y zona'
    },
    {
      id: 'custom',
      name: 'Personalizado',
      color: '#8E8E93',
      icon: Tag,
      description: 'Etiquetas personalizadas'
    }
  ];

  const systemTags: Omit<CustomerTag, 'id' | 'customerCount' | 'createdAt'>[] = [
    {
      name: 'Frecuente',
      color: '#007AFF',
      category: 'behavior',
      icon: '🔄',
      description: 'Visita más de 2 veces por mes',
      isSystem: true
    },
    {
      name: 'Esporádico',
      color: '#FF9500',
      category: 'behavior',
      icon: '📅',
      description: 'Visita menos de 1 vez por mes',
      isSystem: true
    },
    {
      name: 'Vegetariano',
      color: '#32D74B',
      category: 'preference',
      icon: '🥬',
      description: 'Prefiere opciones vegetarianas',
      isSystem: true
    },
    {
      name: 'Sin Gluten',
      color: '#FFD700',
      category: 'preference',
      icon: '🌾',
      description: 'Requiere opciones sin gluten',
      isSystem: true
    },
    {
      name: 'Mesa Terraza',
      color: '#32D74B',
      category: 'preference',
      icon: '🌿',
      description: 'Prefiere mesas en terraza',
      isSystem: true
    },
    {
      name: 'Cumpleañero',
      color: '#FF3B30',
      category: 'status',
      icon: '🎂',
      description: 'Cumpleaños este mes',
      isSystem: true
    },
    {
      name: 'Embajador',
      color: '#CB5910',
      category: 'status',
      icon: '👑',
      description: 'Trae nuevos clientes',
      isSystem: true
    }
  ];

  const predefinedColors = [
    '#237584', '#9FB289', '#CB5910', '#007AFF', '#32D74B',
    '#FF3B30', '#FF9500', '#FFD700', '#8E8E93', '#AF52DE'
  ];

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTag = () => {
    if (newTag.name.trim()) {
      onTagCreate(newTag);
      setNewTag({
        name: '',
        color: '#237584',
        description: '',
        category: 'custom',
        icon: '',
        isSystem: false
      });
      setShowCreateTag(false);
    }
  };

  const handleUpdateTag = () => {
    if (editingTag) {
      onTagUpdate(editingTag.id, editingTag);
      setEditingTag(null);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return tagCategories.find(cat => cat.id === categoryId) || tagCategories[4];
  };

  const TagBadge = ({ tag, isSelected = false, onClick, showCount = true }: {
    tag: CustomerTag;
    isSelected?: boolean;
    onClick?: () => void;
    showCount?: boolean;
  }) => {
    const categoryInfo = getCategoryInfo(tag.category);
    
    return (
      <div 
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-ios cursor-pointer transition-all
          ${isSelected 
            ? 'bg-enigma-primary text-white shadow-ios ring-2 ring-enigma-primary/30' 
            : 'hover:shadow-ios-sm'
          }
        `}
        style={{
          backgroundColor: isSelected ? tag.color : `${tag.color}20`,
          color: isSelected ? 'white' : tag.color,
          border: `1px solid ${tag.color}30`
        }}
        onClick={onClick}
      >
        {tag.icon && <span className="text-sm">{tag.icon}</span>}
        <span className="ios-text-callout font-medium">{tag.name}</span>
        {showCount && (
          <IOSBadge
            variant="custom"
            size="sm"
            style={{
              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${tag.color}40`,
              color: isSelected ? 'white' : tag.color
            }}
          >
            {tag.customerCount}
          </IOSBadge>
        )}
      </div>
    );
  };

  if (isCompact) {
    return (
      <div className="space-y-4">
        {/* Quick Tag Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 mr-4">
            <Tag size={16} className="text-enigma-primary" />
            <span className="ios-text-callout font-medium text-enigma-neutral-900">
              Filtrar por etiquetas:
            </span>
          </div>
          
          {tags.slice(0, 8).map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              isSelected={selectedTags.includes(tag.id)}
              onClick={() => onTagSelect(tag.id)}
              showCount={false}
            />
          ))}
          
          {tags.length > 8 && (
            <IOSButton
              variant="outline"
              size="sm"
              className="border-enigma-neutral-300 text-enigma-neutral-600"
            >
              +{tags.length - 8} más
            </IOSButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ios-text-title2 font-bold text-enigma-neutral-900">
            Sistema de Etiquetas
          </h2>
          <p className="ios-text-callout text-enigma-neutral-600">
            {tags.length} etiquetas disponibles • {customerCount} clientes
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <IOSButton
            variant="outline"
            onClick={() => {
              systemTags.forEach(tag => onTagCreate(tag));
            }}
            className="border-enigma-secondary text-enigma-secondary"
          >
            <Plus size={16} className="mr-2" />
            Agregar Predefinidas
          </IOSButton>
          
          <IOSButton
            variant="primary"
            onClick={() => setShowCreateTag(true)}
            className="bg-enigma-primary"
          >
            <Plus size={16} className="mr-2" />
            Nueva Etiqueta
          </IOSButton>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar etiquetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout bg-white"
        >
          <option value="all">Todas las categorías</option>
          {tagCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tagCategories.map(category => {
          const categoryTags = tags.filter(tag => tag.category === category.id);
          const IconComponent = category.icon;
          
          return (
            <IOSCard 
              key={category.id}
              variant="default"
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id ? 'ring-2 ring-enigma-primary/30' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            >
              <IOSCardContent className="p-4 text-center">
                <div 
                  className="w-10 h-10 rounded-ios mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <IconComponent size={20} style={{ color: category.color }} />
                </div>
                <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-1">
                  {category.name}
                </h3>
                <p className="ios-text-caption1 text-enigma-neutral-600 mb-2">
                  {categoryTags.length} etiquetas
                </p>
                <IOSBadge
                  variant="custom"
                  size="sm"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {categoryTags.reduce((sum, tag) => sum + tag.customerCount, 0)} clientes
                </IOSBadge>
              </IOSCardContent>
            </IOSCard>
          );
        })}
      </div>

      {/* Tags Grid */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center justify-between">
            <span>Etiquetas Disponibles</span>
            <span className="ios-text-callout text-enigma-neutral-500">
              {filteredTags.length} de {tags.length}
            </span>
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {filteredTags.map(tag => (
              <div key={tag.id} className="relative group">
                <TagBadge
                  tag={tag}
                  isSelected={selectedTags.includes(tag.id)}
                  onClick={() => onTagSelect(tag.id)}
                />
                
                {/* Edit/Delete buttons */}
                {!tag.isSystem && (
                  <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={() => setEditingTag(tag)}
                      className="w-6 h-6 bg-enigma-primary rounded-full flex items-center justify-center text-white shadow-ios"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => onTagDelete(tag.id)}
                      className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-ios"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {filteredTags.length === 0 && (
              <div className="text-center py-8 w-full">
                <Tag size={48} className="text-enigma-neutral-300 mx-auto mb-4" />
                <p className="ios-text-callout text-enigma-neutral-500">
                  {searchQuery ? 'No se encontraron etiquetas' : 'No hay etiquetas en esta categoría'}
                </p>
              </div>
            )}
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Create Tag Modal */}
      {showCreateTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <IOSCard variant="elevated" className="w-full max-w-md">
            <IOSCardHeader>
              <IOSCardTitle className="flex items-center justify-between">
                Nueva Etiqueta
                <button
                  onClick={() => setShowCreateTag(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-enigma-neutral-100"
                >
                  <X size={16} />
                </button>
              </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="p-6 space-y-4">
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  placeholder="Nombre de la etiqueta..."
                  className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
                />
              </div>
              
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  placeholder="Descripción opcional..."
                  className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Categoría
                </label>
                <select
                  value={newTag.category}
                  onChange={(e) => setNewTag({ ...newTag, category: e.target.value as any })}
                  className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout bg-white"
                >
                  {tagCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTag({ ...newTag, color })}
                      className={`w-8 h-8 rounded-ios shadow-ios ${
                        newTag.color === color ? 'ring-2 ring-offset-2 ring-enigma-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Emoji (opcional)
                </label>
                <input
                  type="text"
                  value={newTag.icon}
                  onChange={(e) => setNewTag({ ...newTag, icon: e.target.value })}
                  placeholder="🏷️"
                  className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
                  maxLength={2}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <IOSButton
                  variant="outline"
                  onClick={() => setShowCreateTag(false)}
                  className="border-enigma-neutral-300 text-enigma-neutral-600"
                >
                  Cancelar
                </IOSButton>
                <IOSButton
                  variant="primary"
                  onClick={handleCreateTag}
                  disabled={!newTag.name.trim()}
                  className="bg-enigma-primary"
                >
                  Crear Etiqueta
                </IOSButton>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>
      )}

      {/* Edit Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <IOSCard variant="elevated" className="w-full max-w-md">
            <IOSCardHeader>
              <IOSCardTitle className="flex items-center justify-between">
                Editar Etiqueta
                <button
                  onClick={() => setEditingTag(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-enigma-neutral-100"
                >
                  <X size={16} />
                </button>
              </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="p-6 space-y-4">
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout"
                />
              </div>
              
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingTag.description || ''}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                  className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary ios-text-callout resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block ios-text-callout font-medium text-enigma-neutral-900 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingTag({ ...editingTag, color })}
                      className={`w-8 h-8 rounded-ios shadow-ios ${
                        editingTag.color === color ? 'ring-2 ring-offset-2 ring-enigma-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <IOSButton
                  variant="outline"
                  onClick={() => setEditingTag(null)}
                  className="border-enigma-neutral-300 text-enigma-neutral-600"
                >
                  Cancelar
                </IOSButton>
                <IOSButton
                  variant="primary"
                  onClick={handleUpdateTag}
                  className="bg-enigma-primary"
                >
                  Guardar Cambios
                </IOSButton>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>
      )}
    </div>
  );
}