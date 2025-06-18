
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { toast } from '@/hooks/use-toast';

interface CustomerImportProps {
  onClose: () => void;
}

interface MappingField {
  csvColumn: string;
  dbField: string;
  required: boolean;
}

interface ImportResult {
  total: number;
  success: number;
  errors: Array<{ row: number; error: string; data: any }>;
}

export function CustomerImport({ onClose }: CustomerImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<MappingField[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'processing' | 'results'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCustomer = useCreateCustomer();

  const dbFields = [
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'apellido', label: 'Apellido', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'telefono', label: 'Teléfono', required: true },
    { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', required: false },
    { key: 'idioma_preferido', label: 'Idioma Preferido', required: false },
    { key: 'notas_privadas', label: 'Notas', required: false },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos CSV",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Error",
          description: "El archivo debe tener al menos una fila de encabezados y una fila de datos",
          variant: "destructive",
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(data);
      
      // Inicializar mapping
      const initialMapping = dbFields.map(field => ({
        csvColumn: '',
        dbField: field.key,
        required: field.required
      }));
      setMapping(initialMapping);
      
      setStep('mapping');
    };

    reader.readAsText(uploadedFile);
  };

  const updateMapping = (dbField: string, csvColumn: string) => {
    setMapping(prev => prev.map(m => 
      m.dbField === dbField ? { ...m, csvColumn } : m
    ));
  };

  const validateMapping = () => {
    const requiredMappings = mapping.filter(m => m.required);
    const missingRequired = requiredMappings.filter(m => !m.csvColumn);
    
    if (missingRequired.length > 0) {
      toast({
        title: "Error de mapeo",
        description: `Los siguientes campos son obligatorios: ${missingRequired.map(m => dbFields.find(f => f.key === m.dbField)?.label).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processImport = async () => {
    if (!validateMapping()) return;

    setStep('processing');
    setIsProcessing(true);
    setProgress(0);

    const results: ImportResult = {
      total: csvData.length,
      success: 0,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        const customerData: any = {
          vip_status: false,
          historial_reservas_ids: [],
          preferencias_dieteticas: []
        };

        // Mapear datos según la configuración
        mapping.forEach(m => {
          if (m.csvColumn && row[m.csvColumn]) {
            let value = row[m.csvColumn].trim();
            
            // Validaciones específicas por campo
            switch (m.dbField) {
              case 'email':
                if (!value.includes('@')) {
                  throw new Error('Email inválido');
                }
                break;
              case 'telefono':
                // Limpiar formato de teléfono
                value = value.replace(/[^\d+]/g, '');
                if (value.length < 9) {
                  throw new Error('Teléfono inválido');
                }
                break;
              case 'fecha_nacimiento':
                // Validar formato de fecha
                if (value && !Date.parse(value)) {
                  throw new Error('Fecha de nacimiento inválida');
                }
                break;
              case 'idioma_preferido':
                // Normalizar idioma
                value = value.toLowerCase();
                if (!['es', 'en', 'fr', 'de'].includes(value)) {
                  value = 'es';
                }
                break;
            }
            
            customerData[m.dbField] = value;
          }
        });

        // Verificar campos requeridos
        if (!customerData.nombre || !customerData.apellido || !customerData.email || !customerData.telefono) {
          throw new Error('Faltan campos obligatorios');
        }

        await createCustomer.mutateAsync(customerData);
        results.success++;
        
      } catch (error) {
        results.errors.push({
          row: i + 2, // +2 porque empezamos desde 0 y hay header
          error: error instanceof Error ? error.message : 'Error desconocido',
          data: row
        });
      }

      setProgress(Math.round(((i + 1) / csvData.length) * 100));
    }

    setImportResult(results);
    setStep('results');
    setIsProcessing(false);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importar Clientes desde CSV</h3>
        <p className="text-sm text-gray-600 mb-4">
          Sube un archivo CSV con los datos de tus clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Formato del Archivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">El archivo CSV debe incluir:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Primera fila con nombres de columnas</li>
            <li>Columnas para: nombre, apellido, email, teléfono (obligatorios)</li>
            <li>Columnas opcionales: fecha_nacimiento, idioma, notas</li>
            <li>Codificación UTF-8</li>
          </ul>
        </CardContent>
      </Card>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {!file ? (
          <div>
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-4">
              Arrastra tu archivo CSV aquí o haz clic para seleccionar
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Seleccionar Archivo
            </Button>
          </div>
        ) : (
          <div>
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">{file.name}</p>
            <p className="text-xs text-gray-500">
              {csvData.length} filas encontradas
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Mapear Columnas</h3>
        <p className="text-sm text-gray-600">
          Relaciona las columnas de tu CSV con los campos del sistema
        </p>
      </div>

      <div className="space-y-4">
        {mapping.map((field) => {
          const dbField = dbFields.find(f => f.key === field.dbField);
          return (
            <div key={field.dbField} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Label className="font-medium">
                    {dbField?.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                </div>
              </div>
              
              <div className="w-48">
                <Select
                  value={field.csvColumn}
                  onValueChange={(value) => updateMapping(field.dbField, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar columna..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No mapear</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Los campos marcados con * son obligatorios. Los datos duplicados serán ignorados.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('upload')}>
          Volver
        </Button>
        <Button onClick={processImport}>
          Iniciar Importación
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold mb-2">Procesando Importación</h3>
        <p className="text-sm text-gray-600">
          Importando {csvData.length} registros...
        </p>
      </div>
      
      <div className="space-y-4">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600">{progress}% completado</p>
      </div>
      
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-enigma-primary mx-auto" />
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Resultados de la Importación</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{importResult?.total}</div>
            <div className="text-sm text-gray-600">Total procesados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{importResult?.success}</div>
            <div className="text-sm text-gray-600">Importados exitosamente</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{importResult?.errors.length}</div>
            <div className="text-sm text-gray-600">Errores</div>
          </CardContent>
        </Card>
      </div>

      {importResult?.errors && importResult.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Errores de Importación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {importResult.errors.map((error, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <div className="font-medium text-red-800">Fila {error.row}</div>
                  <div className="text-red-600">{error.error}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center space-x-2">
        {['upload', 'mapping', 'processing', 'results'].map((stepName, index) => (
          <div
            key={stepName}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === stepName
                ? 'bg-enigma-primary text-white'
                : index < ['upload', 'mapping', 'processing', 'results'].indexOf(step)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Contenido del paso actual */}
      {step === 'upload' && renderUploadStep()}
      {step === 'mapping' && renderMappingStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'results' && renderResultsStep()}
    </div>
  );
}
