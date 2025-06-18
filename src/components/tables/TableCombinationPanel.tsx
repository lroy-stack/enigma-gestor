
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Combine, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TableCombinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTableIds: string[];
}

export function TableCombinationPanel({ 
  isOpen, 
  onClose, 
  selectedTableIds 
}: TableCombinationPanelProps) {
  const { data: tables } = useTablesWithStates();
  const [nombreCombinacion, setNombreCombinacion] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedTables = tables?.filter(t => selectedTableIds.includes(t.id)) || [];
  const totalCapacity = selectedTables.reduce((sum, table) => sum + table.capacidad, 0);

  const validateCombination = () => {
    const errors = [];
    
    // Verificar que todas las mesas estén libres
    const ocupadas = selectedTables.filter(t => t.estado?.estado !== 'libre');
    if (ocupadas.length > 0) {
      errors.push(`Las siguientes mesas no están libres: ${ocupadas.map(t => t.numero_mesa).join(', ')}`);
    }

    // Verificar que las mesas sean del mismo tipo
    const tipos = [...new Set(selectedTables.map(t => t.tipo_mesa))];
    if (tipos.length > 1) {
      errors.push('Solo se pueden combinar mesas del mismo tipo (terraza/interior)');
    }

    // Verificar proximidad (distancia máxima de 100px)
    for (let i = 0; i < selectedTables.length; i++) {
      for (let j = i + 1; j < selectedTables.length; j++) {
        const table1 = selectedTables[i];
        const table2 = selectedTables[j];
        const distance = Math.sqrt(
          Math.pow(table1.position_x - table2.position_x, 2) + 
          Math.pow(table1.position_y - table2.position_y, 2)
        );
        if (distance > 100) {
          errors.push(`Las mesas ${table1.numero_mesa} y ${table2.numero_mesa} están demasiado lejos para combinar`);
        }
      }
    }

    return errors;
  };

  const validationErrors = validateCombination();
  const canCombine = validationErrors.length === 0 && selectedTables.length >= 2;

  const handleCreateCombination = async () => {
    if (!canCombine || !nombreCombinacion.trim()) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('mesa_combinaciones')
        .insert([{
          nombre_combinacion: nombreCombinacion.trim(),
          mesa_principal_id: selectedTables[0].id,
          mesas_combinadas: selectedTableIds,
          capacidad_total: totalCapacity,
          activa: true
        }]);

      if (error) throw error;

      toast.success('Combinación de mesas creada exitosamente');
      onClose();
      setNombreCombinacion('');
    } catch (error) {
      console.error('Error creating combination:', error);
      toast.error('Error al crear la combinación de mesas');
    } finally {
      setIsCreating(false);
    }
  };

  React.useEffect(() => {
    if (selectedTables.length > 0) {
      const mesasNombres = selectedTables.map(t => t.numero_mesa).join(' + ');
      setNombreCombinacion(`Combinación ${mesasNombres}`);
    }
  }, [selectedTables]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Combine className="h-5 w-5" />
            Combinar Mesas
          </SheetTitle>
          <SheetDescription>
            Crea una combinación de mesas para grupos grandes
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Mesas seleccionadas */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Mesas Seleccionadas</Label>
            <div className="grid grid-cols-1 gap-3">
              {selectedTables.map(table => (
                <Card key={table.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold">
                          {table.numero_mesa}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {table.capacidad}
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            table.estado?.estado === 'libre' 
                              ? 'border-green-500 text-green-700' 
                              : 'border-red-500 text-red-700'
                          }
                        >
                          {table.estado?.estado === 'libre' ? 'Libre' : table.estado?.estado}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {table.ubicacion_descripcion}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Capacidad Total: {totalCapacity} personas
              </span>
            </div>
          </div>

          {/* Validación */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Validación</Label>
            {validationErrors.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">
                  Las mesas se pueden combinar correctamente
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuración de la combinación */}
          {canCombine && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Combinación</Label>
                <Input
                  id="nombre"
                  value={nombreCombinacion}
                  onChange={(e) => setNombreCombinacion(e.target.value)}
                  placeholder="Ej: Mesa Grande Terraza"
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCombination}
              disabled={!canCombine || !nombreCombinacion.trim() || isCreating}
            >
              {isCreating ? 'Creando...' : 'Crear Combinación'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
