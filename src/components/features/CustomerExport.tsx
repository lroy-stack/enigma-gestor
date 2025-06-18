
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cliente } from '@/types/database';
import { Download, FileSpreadsheet, FileText, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerExportProps {
  clientes: Cliente[];
  onClose: () => void;
}

export function CustomerExport({ clientes, onClose }: CustomerExportProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'nombre', 'apellido', 'email', 'telefono'
  ]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [anonymizeData, setAnonymizeData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const availableFields = [
    { key: 'nombre', label: 'Nombre', sensitive: false },
    { key: 'apellido', label: 'Apellido', sensitive: false },
    { key: 'email', label: 'Email', sensitive: true },
    { key: 'telefono', label: 'Teléfono', sensitive: true },
    { key: 'fecha_creacion', label: 'Fecha de Registro', sensitive: false },
    { key: 'ultima_visita', label: 'Última Visita', sensitive: false },
    { key: 'idioma_preferido', label: 'Idioma Preferido', sensitive: false },
    { key: 'vip_status', label: 'Estado VIP', sensitive: false },
    { key: 'preferencias_dieteticas', label: 'Preferencias Dietéticas', sensitive: false },
    { key: 'notas_privadas', label: 'Notas Privadas', sensitive: true }
  ];

  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(availableFields.map(f => f.key));
  };

  const selectBasicFields = () => {
    setSelectedFields(['nombre', 'apellido', 'email', 'telefono']);
  };

  const anonymizeValue = (value: string, fieldKey: string): string => {
    if (!anonymizeData) return value;

    switch (fieldKey) {
      case 'email':
        const emailParts = value.split('@');
        if (emailParts.length === 2) {
          const username = emailParts[0];
          const domain = emailParts[1];
          const maskedUsername = username.length > 2 
            ? username.substring(0, 2) + '*'.repeat(username.length - 2)
            : '*'.repeat(username.length);
          return `${maskedUsername}@${domain}`;
        }
        return value;
      case 'telefono':
        return value.length > 4 
          ? value.substring(0, 4) + '*'.repeat(value.length - 4)
          : '*'.repeat(value.length);
      case 'notas_privadas':
        return '[DATOS ANONIMIZADOS]';
      default:
        return value;
    }
  };

  const formatValue = (cliente: Cliente, fieldKey: string): string => {
    let value = '';

    switch (fieldKey) {
      case 'nombre':
        value = cliente.nombre;
        break;
      case 'apellido':
        value = cliente.apellido;
        break;
      case 'email':
        value = cliente.email;
        break;
      case 'telefono':
        value = cliente.telefono;
        break;
      case 'fecha_creacion':
        value = format(new Date(cliente.fecha_creacion), 'dd/MM/yyyy');
        break;
      case 'ultima_visita':
        value = cliente.ultima_visita 
          ? format(new Date(cliente.ultima_visita), 'dd/MM/yyyy')
          : 'No registrada';
        break;
      case 'idioma_preferido':
        value = cliente.idioma_preferido || 'es';
        break;
      case 'vip_status':
        value = cliente.vip_status ? 'Sí' : 'No';
        break;
      case 'preferencias_dieteticas':
        value = cliente.preferencias_dieteticas?.join(', ') || 'Ninguna';
        break;
      case 'notas_privadas':
        value = cliente.notas_privadas || '';
        break;
      default:
        value = '';
    }

    return anonymizeValue(value, fieldKey);
  };

  const generateCSV = () => {
    const headers = selectedFields.map(fieldKey => 
      availableFields.find(f => f.key === fieldKey)?.label || fieldKey
    );

    const rows = clientes.map(cliente =>
      selectedFields.map(fieldKey => {
        const value = formatValue(cliente, fieldKey);
        // Escapar comillas y comas para CSV
        return value.includes(',') || value.includes('"') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      })
    );

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
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
    if (selectedFields.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const anonymizedSuffix = anonymizeData ? '_anonimizado' : '';
      
      if (exportFormat === 'csv') {
        const csvContent = generateCSV();
        downloadFile(
          csvContent,
          `clientes_enigma_${timestamp}${anonymizedSuffix}.csv`,
          'text/csv;charset=utf-8;'
        );
      }

      // Simulamos un pequeño delay para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Download className="h-12 w-12 text-enigma-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold mb-2">Exportar Datos de Clientes</h3>
        <p className="text-sm text-gray-600">
          Selecciona los campos y formato para la exportación
        </p>
      </div>

      {/* Información del dataset */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Clientes a exportar:</span>
            <span className="text-lg font-bold text-enigma-primary">
              {clientes.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Selección de campos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Campos a Exportar</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={selectBasicFields}>
              Básicos
            </Button>
            <Button variant="outline" size="sm" onClick={selectAllFields}>
              Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableFields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields.includes(field.key)}
                  onCheckedChange={() => toggleField(field.key)}
                />
                <Label htmlFor={field.key} className="text-sm flex items-center">
                  {field.label}
                  {field.sensitive && (
                    <Shield className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 flex items-center">
            <Shield className="h-3 w-3 mr-1 text-amber-500" />
            Campos con datos sensibles
          </div>
        </CardContent>
      </Card>

      {/* Formato de exportación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Formato de Exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel') => setExportFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV (Comma Separated Values)
                </div>
              </SelectItem>
              <SelectItem value="excel" disabled>
                <div className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (Próximamente)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Opciones de privacidad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Privacidad y Cumplimiento GDPR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="anonymize"
              checked={anonymizeData}
              onCheckedChange={(checked) => setAnonymizeData(checked === true)}
            />
            <div className="flex-1">
              <Label htmlFor="anonymize" className="text-sm font-medium">
                Anonimizar datos sensibles
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Los emails, teléfonos y notas privadas serán parcialmente enmascarados 
                para proteger la privacidad de los clientes.
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
          disabled={selectedFields.length === 0 || isExporting}
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

      {/* Aviso legal */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <strong>Aviso:</strong> Al exportar datos de clientes, asegúrate de cumplir con las 
        regulaciones de protección de datos (GDPR). Solo utiliza estos datos para fines 
        legítimos y protege adecuadamente la información exportada.
      </div>
    </div>
  );
}
