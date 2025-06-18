
import React, { useState } from 'react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomerNotes } from '@/hooks/useCustomerAdvanced';
import { ClienteNota } from '@/types/customer-advanced';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerNotesManagerProps {
  clienteId: string;
  notes: ClienteNota[];
}

export function CustomerNotesManager({ clienteId, notes }: CustomerNotesManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<ClienteNota['tipo_nota']>('general');
  const [newNotePrivate, setNewNotePrivate] = useState(false);
  
  const { addNote, updateNote, deleteNote } = useCustomerNotes(clienteId);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    
    try {
      await addNote.mutateAsync({
        contenido: newNoteContent,
        tipoNota: newNoteType,
        esPrivada: newNotePrivate
      });
      
      setNewNoteContent('');
      setNewNoteType('general');
      setNewNotePrivate(false);
      setShowAddForm(false);
      toast.success('Nota añadida correctamente');
    } catch (error) {
      toast.error('Error al añadir nota');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      await updateNote.mutateAsync({ noteId, contenido: content });
      setEditingNoteId(null);
      toast.success('Nota actualizada');
    } catch (error) {
      toast.error('Error al actualizar nota');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;
    
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success('Nota eliminada');
    } catch (error) {
      toast.error('Error al eliminar nota');
    }
  };

  const getNoteTypeLabel = (type: ClienteNota['tipo_nota']) => {
    const labels = {
      general: 'General',
      preferencia: 'Preferencia',
      alerta: 'Alerta',
      seguimiento: 'Seguimiento'
    };
    return labels[type];
  };

  const getNoteTypeVariant = (type: ClienteNota['tipo_nota']) => {
    const variants = {
      general: 'neutral' as const,
      preferencia: 'secondary' as const,
      alerta: 'occupied' as const,
      seguimiento: 'primary' as const
    };
    return variants[type];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="ios-text-headline">Notas ({notes.length})</h4>
        <IOSButton
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4" />
        </IOSButton>
      </div>

      {/* Formulario para añadir nota */}
      {showAddForm && (
        <div className="p-4 bg-enigma-neutral-50 rounded-ios space-y-3">
          <Textarea
            placeholder="Contenido de la nota..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="ios-input min-h-[80px]"
          />
          
          <div className="flex gap-4">
            <Select value={newNoteType} onValueChange={(value) => setNewNoteType(value as ClienteNota['tipo_nota'])}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="preferencia">Preferencia</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="seguimiento">Seguimiento</SelectItem>
              </SelectContent>
            </Select>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newNotePrivate}
                onChange={(e) => setNewNotePrivate(e.target.checked)}
                className="rounded"
              />
              <span className="ios-text-callout">Nota privada</span>
            </label>
          </div>
          
          <div className="flex gap-2">
            <IOSButton
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || addNote.isPending}
            >
              Añadir Nota
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

      {/* Lista de notas */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="p-4 bg-white rounded-ios border border-enigma-neutral-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <IOSBadge variant={getNoteTypeVariant(note.tipo_nota)}>
                  {getNoteTypeLabel(note.tipo_nota)}
                </IOSBadge>
                {note.es_privada && (
                  <IOSBadge variant="neutral">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Privada
                  </IOSBadge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <IOSButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingNoteId(editingNoteId === note.id ? null : note.id)}
                >
                  <Edit className="h-4 w-4" />
                </IOSButton>
                <IOSButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </IOSButton>
              </div>
            </div>
            
            {editingNoteId === note.id ? (
              <div className="space-y-2">
                <Textarea
                  defaultValue={note.contenido}
                  onBlur={(e) => {
                    if (e.target.value !== note.contenido) {
                      handleUpdateNote(note.id, e.target.value);
                    } else {
                      setEditingNoteId(null);
                    }
                  }}
                  className="ios-input"
                />
              </div>
            ) : (
              <p className="ios-text-body text-enigma-neutral-700 mb-2">
                {note.contenido}
              </p>
            )}
            
            <div className="ios-text-caption1 text-enigma-neutral-500">
              {format(new Date(note.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })}
              {note.fecha_modificacion !== note.fecha_creacion && (
                <span> • Editado {format(new Date(note.fecha_modificacion), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
              )}
            </div>
          </div>
        ))}
        
        {notes.length === 0 && (
          <div className="text-center py-6 text-enigma-neutral-500">
            <p className="ios-text-callout">No hay notas para este cliente</p>
          </div>
        )}
      </div>
    </div>
  );
}
