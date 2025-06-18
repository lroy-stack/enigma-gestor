
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Users, MapPin, Zap, CheckCircle } from 'lucide-react';
import { useTableSuggestions, useApplyTableCombination } from '@/hooks/useTableStates';
import { SugerenciaMesa } from '@/types/mesa';
import { toast } from 'sonner';

interface TableSuggestionsWidgetProps {
  onSuggestionApplied?: () => void;
}

export function TableSuggestionsWidget({ onSuggestionApplied }: TableSuggestionsWidgetProps) {
  const [numComensales, setNumComensales] = useState<number>(2);
  const [zonaPreferida, setZonaPreferida] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SugerenciaMesa[]>([]);
  
  const getSuggestions = useTableSuggestions();
  const applyCombination = useApplyTableCombination();

  const handleGetSuggestions = async () => {
    try {
      const result = await getSuggestions.mutateAsync({
        numComensales,
        zonaPreferida: zonaPreferida || undefined
      });
      setSuggestions(result || []);
      
      if (!result || result.length === 0) {
        toast.info('No se encontraron sugerencias para estos criterios');
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleApplySuggestion = async (suggestion: SugerenciaMesa, reservaId?: string) => {
    if (!reservaId) {
      toast.error('Necesitas una reserva específica para aplicar esta sugerencia');
      return;
    }

    try {
      const mesasIds = suggestion.mesas.map(mesa => mesa.id);
      const nombreCombinacion = suggestion.tipo === 'combinacion_2' 
        ? suggestion.descripcion 
        : undefined;

      await applyCombination.mutateAsync({
        mesasIds,
        reservaId,
        nombreCombinacion
      });

      setSuggestions([]);
      onSuggestionApplied?.();
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSuggestionIcon = (tipo: string) => {
    switch (tipo) {
      case 'individual': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'individual_mayor': return <Users className="h-4 w-4 text-blue-600" />;
      case 'combinacion_2': return <Zap className="h-4 w-4 text-purple-600" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-enigma-primary">
          <Brain className="h-5 w-5" />
          Sugerencias Inteligentes de Mesas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario de búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="comensales">Número de Comensales</Label>
            <Input
              type="number"
              id="comensales"
              min="1"
              max="20"
              value={numComensales}
              onChange={(e) => setNumComensales(parseInt(e.target.value) || 2)}
              className="border-enigma-primary/20 focus:border-enigma-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zona">Zona Preferida (opcional)</Label>
            <Select value={zonaPreferida} onValueChange={setZonaPreferida}>
              <SelectTrigger className="border-enigma-primary/20 focus:border-enigma-primary">
                <SelectValue placeholder="Cualquier zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Cualquier zona</SelectItem>
                <SelectItem value="interior">🏛️ Sala Interior</SelectItem>
                <SelectItem value="campanar">🌿 Terraza Campanar</SelectItem>
                <SelectItem value="justicia">⚖️ Terraza Justicia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleGetSuggestions}
              disabled={getSuggestions.isPending}
              className="w-full bg-enigma-primary hover:bg-enigma-primary/90"
            >
              {getSuggestions.isPending ? 'Buscando...' : 'Buscar Mesas'}
            </Button>
          </div>
        </div>

        {/* Resultados */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="h-4 w-4 text-enigma-primary" />
              Sugerencias Encontradas ({suggestions.length})
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-enigma-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSuggestionIcon(suggestion.tipo)}
                      <span className="font-medium text-gray-800">
                        {suggestion.descripcion}
                      </span>
                    </div>
                    <Badge className={`px-2 py-1 text-xs font-bold ${getScoreColor(suggestion.score)}`}>
                      {suggestion.score}% óptimo
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Total: {suggestion.capacidad_total} personas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Zona: {suggestion.zona}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {suggestion.mesas.map((mesa, mesaIndex) => (
                        <Badge key={mesaIndex} variant="outline" className="text-xs">
                          Mesa {mesa.numero} ({mesa.capacidad})
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-enigma-primary text-enigma-primary hover:bg-enigma-primary hover:text-white"
                      onClick={() => {
                        // En un caso real, aquí seleccionarías la reserva específica
                        toast.info('Para aplicar, selecciona una reserva específica primero');
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                  
                  {suggestion.distancia && (
                    <div className="mt-2 text-xs text-gray-500">
                      💡 Distancia entre mesas: {Math.round(suggestion.distancia)}px
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {suggestions.length === 0 && !getSuggestions.isPending && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Introduce el número de comensales para obtener sugerencias inteligentes</p>
            <p className="text-sm mt-1">El sistema encontrará las mejores opciones disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
