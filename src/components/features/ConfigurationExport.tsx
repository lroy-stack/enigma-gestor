import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  FileText, 
  Settings, 
  Clock, 
  Users, 
  Utensils,
  Bell,
  Database,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRestaurantConfig } from '@/hooks/useRestaurantConfig';
import { useTables } from '@/hooks/useTables';
import { useToast } from '@/hooks/use-toast';

interface ConfigurationExportProps {
  onClose: () => void;
}

export function ConfigurationExport({ onClose }: ConfigurationExportProps) {
  const { config, horarios } = useRestaurantConfig();
  const { data: tables } = useTables();
  const { toast } = useToast();
  
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'restaurant', 'tables', 'schedule'
  ]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const availableSections = [
    { 
      key: 'restaurant', 
      label: 'Información del Restaurante', 
      icon: Settings,
      description: 'Nombre, dirección, contacto, capacidades' 
    },
    { 
      key: 'tables', 
      label: 'Configuración de Mesas', 
      icon: Utensils,
      description: 'Mesas, capacidades, posiciones, estados' 
    },
    { 
      key: 'schedule', 
      label: 'Horarios de Operación', 
      icon: Clock,
      description: 'Días, horas de apertura y cierre' 
    },
    { 
      key: 'notifications', 
      label: 'Configuración de Notificaciones', 
      icon: Bell,
      description: 'Preferencias de alertas y comunicaciones' 
    },
    { 
      key: 'security', 
      label: 'Configuración de Seguridad', 
      icon: Shield,
      description: 'Políticas y configuraciones de acceso' 
    }
  ];

  const toggleSection = (sectionKey: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(s => s !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const selectAllSections = () => {
    setSelectedSections(availableSections.map(s => s.key));
  };

  const selectBasicSections = () => {
    setSelectedSections(['restaurant', 'tables', 'schedule']);
  };

  const generateExportData = () => {
    const exportData: any = {};
    
    if (includeMetadata) {
      exportData.metadata = {
        exported_at: new Date().toISOString(),
        exported_by: 'Enigma Cocina con Alma',
        version: '1.0',
        format: exportFormat
      };
    }

    if (selectedSections.includes('restaurant') && config) {
      exportData.restaurant_config = {
        nombre_restaurante: config.nombre_restaurante,
        direccion: config.direccion,
        telefono: config.telefono,
        email_reservas: config.email_reservas,
        capacidad_maxima: config.capacidad_maxima,
        duracion_reserva_default_minutos: config.duracion_reserva_default_minutos,
        auto_aceptar_reservas: config.auto_aceptar_reservas,
        politica_cancelacion: config.politica_cancelacion,
        mensaje_bienvenida_email: config.mensaje_bienvenida_email,
        mensaje_confirmacion_whatsapp: config.mensaje_confirmacion_whatsapp
      };
    }

    if (selectedSections.includes('tables') && tables) {
      exportData.tables_config = tables.map(mesa => ({
        id: mesa.id,
        numero_mesa: mesa.numero_mesa,
        capacidad: mesa.capacidad,
        tipo_mesa: mesa.tipo_mesa,
        zona: mesa.zona,
        activa: mesa.activa,
        es_combinable: mesa.es_combinable,
        position_x: mesa.position_x,
        position_y: mesa.position_y,
        notas_mesa: mesa.notas_mesa
      }));
    }

    if (selectedSections.includes('schedule') && horarios) {
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      exportData.operating_hours = horarios.map(horario => ({
        dia_semana: diasSemana[horario.dia_semana],
        dia_numero: horario.dia_semana,
        hora_apertura: horario.hora_apertura,
        hora_cierre: horario.hora_cierre,
        tipo_servicio: horario.tipo_servicio,
        activo: horario.activo,
        notas: horario.notas
      }));
    }

    if (selectedSections.includes('notifications')) {
      exportData.notifications_config = {
        nuevas_reservas: true,
        cambios_reservas: true,
        no_shows: true,
        sonido_activo: true,
        canales_activos: ['email', 'whatsapp', 'sms']
      };
    }

    if (selectedSections.includes('security')) {
      exportData.security_config = {
        respaldo_automatico: true,
        frecuencia_respaldo: 'daily',
        sincronizacion_nube: true,
        ultimo_respaldo: new Date().toISOString()
      };
    }

    return exportData;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos una sección para exportar',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      const exportData = generateExportData();
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      
      if (exportFormat === 'json') {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(
          jsonContent,
          `enigma-config-${timestamp}.json`,
          'application/json'
        );
      }

      toast({
        title: 'Éxito',
        description: 'Configuración exportada correctamente',
      });

      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
      toast({
        title: 'Error',
        description: 'Error al exportar la configuración',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Download className="h-12 w-12 text-enigma-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold mb-2">Exportar Configuración</h3>
        <p className="text-sm text-gray-600">
          Selecciona las secciones que deseas exportar
        </p>
      </div>

      {/* Información del export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Secciones disponibles:</span>
            <span className="text-lg font-bold text-enigma-primary">
              {availableSections.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Selección de secciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Secciones a Exportar</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={selectBasicSections}>
              Básicas
            </Button>
            <Button variant="outline" size="sm" onClick={selectAllSections}>
              Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {availableSections.map((section) => (
              <div key={section.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={section.key}
                  checked={selectedSections.includes(section.key)}
                  onCheckedChange={() => toggleSection(section.key)}
                />
                <div className="flex-1">
                  <Label htmlFor={section.key} className="text-sm font-medium flex items-center">
                    <section.icon className="h-4 w-4 mr-2 text-enigma-primary" />
                    {section.label}
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formato de exportación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Formato de Exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={exportFormat} onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  JSON (JavaScript Object Notation)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Opciones adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Opciones de Exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
            />
            <div className="flex-1">
              <Label htmlFor="metadata" className="text-sm font-medium">
                Incluir metadatos
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Información sobre la fecha de exportación, versión y origen del archivo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        
        <Button 
          onClick={handleExport}
          disabled={selectedSections.length === 0 || isExporting}
          className="bg-enigma-primary hover:bg-enigma-primary/90"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar {exportFormat.toUpperCase()}
            </>
          )}
        </Button>
      </div>

      {/* Aviso informativo */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <strong>Nota:</strong> La configuración exportada incluye solo la información 
        visible en esta página. Los datos sensibles como contraseñas o claves API 
        no son incluidos por seguridad.
      </div>
    </div>
  );
}
