
import React, { useState } from 'react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Input } from '@/components/ui/input';
import { useCustomerTags } from '@/hooks/useCustomerAdvanced';
import { ClienteTag } from '@/types/customer-advanced';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerTagsManagerProps {
  clienteId: string;
  tags: ClienteTag[];
}

const COLORES_PREDEFINIDOS = [
  '#237584', '#9FB289', '#CB5910', '#FF6B6B', '#4ECDC4', 
  '#45B7D1', '#F9CA24', '#F0932B', '#EB4D4B', '#6C5CE7'
];

export function CustomerTagsManager({ clienteId, tags }: CustomerTagsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORES_PREDEFINIDOS[0]);
  
  const { addTag, removeTag } = useCustomerTags(clienteId);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      await addTag.mutateAsync({
        tagNombre: newTagName,
        tagColor: selectedColor
      });
      
      setNewTagName('');
      setShowAddForm(false);
      toast.success('Tag añadido correctamente');
    } catch (error) {
      toast.error('Error al añadir tag');
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      await removeTag.mutateAsync(tagId);
      toast.success('Tag eliminado');
    } catch (error) {
      toast.error('Error al eliminar tag');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="ios-text-headline">Tags</h4>
        <IOSButton
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4" />
        </IOSButton>
      </div>

      {/* Tags existentes */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <IOSBadge 
            key={tag.id}
            variant="custom"
            className="relative group pr-6"
            style={{ backgroundColor: tag.tag_color, color: 'white' }}
          >
            {tag.tag_nombre}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-2 w-2 text-white" />
            </button>
          </IOSBadge>
        ))}
      </div>

      {/* Formulario para añadir tag */}
      {showAddForm && (
        <div className="p-4 bg-enigma-neutral-50 rounded-ios space-y-3">
          <Input
            placeholder="Nombre del tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="ios-input"
          />
          
          <div className="space-y-2">
            <label className="ios-text-caption1 text-enigma-neutral-600">Color:</label>
            <div className="flex gap-2">
              {COLORES_PREDEFINIDOS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-enigma-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <IOSButton
              variant="primary"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTagName.trim() || addTag.isPending}
            >
              Añadir
            </IOSButton>
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </IOSButton>
          </div>
        </div>
      )}
    </div>
  );
}
