
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, User, Phone, Mail, Calendar, Heart, Shield } from 'lucide-react';

const customerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(9, 'Teléfono inválido'),
  fecha_nacimiento: z.string().optional(),
  idioma_preferido: z.string().default('es'),
  preferencias_comunicacion: z.array(z.string()).default([]),
  como_nos_conocio: z.string().optional(),
  consentimiento_gdpr: z.boolean().default(false),
  consentimiento_marketing: z.boolean().default(false),
  preferencias_dieteticas: z.array(z.string()).default([]),
  alergias: z.string().optional(),
  ocasion_primera_visita: z.string().optional(),
  notas_especiales: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface NewCustomerFormProps {
  onClose: () => void;
}

export function NewCustomerForm({ onClose }: NewCustomerFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPreferencias, setSelectedPreferencias] = useState<string[]>([]);
  const [selectedComunicacion, setSelectedComunicacion] = useState<string[]>([]);
  
  const createCustomer = useCreateCustomer();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      idioma_preferido: 'es',
      preferencias_comunicacion: [],
      preferencias_dieteticas: [],
      consentimiento_gdpr: false,
      consentimiento_marketing: false
    }
  });

  const watchedValues = watch();

  const preferenciasDieteticas = [
    'Vegetariano',
    'Vegano',
    'Sin Gluten',
    'Sin Lactosa',
    'Halal',
    'Kosher',
    'Diabético',
    'Bajo en Sodio',
    'Sin Frutos Secos',
    'Sin Mariscos'
  ];

  const opcionesComunicacion = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { value: 'sms', label: 'SMS', icon: Phone },
    { value: 'llamada', label: 'Llamada', icon: Phone }
  ];

  const comoNosConocio = [
    'Redes Sociales',
    'Google',
    'Recomendación de Amigo',
    'Recomendación de Familia',
    'Publicidad Online',
    'Revista/Periódico',
    'Radio/TV',
    'Pasando por aquí',
    'Evento/Feria',
    'Otro'
  ];

  const ocasionesPrimeraVisita = [
    'Cena Romántica',
    'Celebración Familiar',
    'Cumpleaños',
    'Aniversario',
    'Cena de Negocios',
    'Encuentro con Amigos',
    'Celebración Especial',
    'Solo Probar',
    'Otro'
  ];

  const handleNext = async () => {
    let fieldsToValidate: (keyof CustomerFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['nombre', 'apellido', 'email', 'telefono'];
        break;
      case 2:
        fieldsToValidate = ['idioma_preferido'];
        break;
      case 3:
        fieldsToValidate = ['consentimiento_gdpr'];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const togglePreferencia = (preferencia: string) => {
    const nuevas = selectedPreferencias.includes(preferencia)
      ? selectedPreferencias.filter(p => p !== preferencia)
      : [...selectedPreferencias, preferencia];
    
    setSelectedPreferencias(nuevas);
    setValue('preferencias_dieteticas', nuevas);
  };

  const toggleComunicacion = (canal: string) => {
    const nuevos = selectedComunicacion.includes(canal)
      ? selectedComunicacion.filter(c => c !== canal)
      : [...selectedComunicacion, canal];
    
    setSelectedComunicacion(nuevos);
    setValue('preferencias_comunicacion', nuevos);
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const customerData = {
        ...data,
        preferencias_dieteticas: selectedPreferencias,
        preferencias_comunicacion: selectedComunicacion,
        notas_privadas: data.notas_especiales || null,
        vip_status: false,
        historial_reservas_ids: []
      };

      await createCustomer.mutateAsync(customerData);
      
      toast({
        title: "Cliente registrado",
        description: `${data.nombre} ${data.apellido} ha sido registrado exitosamente.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el cliente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-enigma-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Información Básica</h3>
        <p className="text-sm text-gray-600">Datos esenciales del cliente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            {...register('nombre')}
            className={errors.nombre ? 'border-red-500' : ''}
            placeholder="Nombre del cliente"
          />
          {errors.nombre && (
            <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="apellido">Apellido *</Label>
          <Input
            id="apellido"
            {...register('apellido')}
            className={errors.apellido ? 'border-red-500' : ''}
            placeholder="Apellido del cliente"
          />
          {errors.apellido && (
            <p className="text-sm text-red-500 mt-1">{errors.apellido.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          placeholder="email@ejemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          {...register('telefono')}
          className={errors.telefono ? 'border-red-500' : ''}
          placeholder="+34 123 456 789"
        />
        {errors.telefono && (
          <p className="text-sm text-red-500 mt-1">{errors.telefono.message}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="h-12 w-12 text-enigma-secondary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Información Adicional</h3>
        <p className="text-sm text-gray-600">Datos opcionales para personalizar el servicio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            {...register('fecha_nacimiento')}
          />
          <p className="text-xs text-gray-500 mt-1">Para recordatorios de cumpleaños</p>
        </div>

        <div>
          <Label htmlFor="idioma_preferido">Idioma Preferido</Label>
          <Select 
            value={watchedValues.idioma_preferido} 
            onValueChange={(value) => setValue('idioma_preferido', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Preferencias de Comunicación</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {opcionesComunicacion.map((opcion) => (
            <div
              key={opcion.value}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedComunicacion.includes(opcion.value)
                  ? 'border-enigma-primary bg-enigma-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleComunicacion(opcion.value)}
            >
              <div className="flex flex-col items-center text-center">
                <opcion.icon className="h-5 w-5 mb-1" />
                <span className="text-sm">{opcion.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="como_nos_conocio">¿Cómo nos conoció?</Label>
        <Select onValueChange={(value) => setValue('como_nos_conocio', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {comoNosConocio.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 text-enigma-accent mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Preferencias y Restricciones</h3>
        <p className="text-sm text-gray-600">Para ofrecer la mejor experiencia gastronómica</p>
      </div>

      <div>
        <Label>Preferencias Dietéticas</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {preferenciasDieteticas.map((preferencia) => (
            <Badge
              key={preferencia}
              variant={selectedPreferencias.includes(preferencia) ? "default" : "outline"}
              className="cursor-pointer p-2 justify-center"
              onClick={() => togglePreferencia(preferencia)}
            >
              {preferencia}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="alergias">Alergias e Intolerancias</Label>
        <Textarea
          id="alergias"
          {...register('alergias')}
          placeholder="Describe cualquier alergia o intolerancia alimentaria..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="ocasion_primera_visita">Ocasión de la Primera Visita</Label>
        <Select onValueChange={(value) => setValue('ocasion_primera_visita', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar ocasión..." />
          </SelectTrigger>
          <SelectContent>
            {ocasionesPrimeraVisita.map((ocasion) => (
              <SelectItem key={ocasion} value={ocasion}>
                {ocasion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notas_especiales">Notas Especiales</Label>
        <Textarea
          id="notas_especiales"
          {...register('notas_especiales')}
          placeholder="Cualquier información adicional que pueda ser útil..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Consentimientos GDPR</h3>
        <p className="text-sm text-gray-600">Protección y privacidad de datos</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consentimiento_gdpr"
              {...register('consentimiento_gdpr')}
              required
            />
            <div className="flex-1">
              <Label htmlFor="consentimiento_gdpr" className="text-sm font-medium">
                Consentimiento para el tratamiento de datos personales *
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Acepto que Enigma Cocina con Alma trate mis datos personales para gestionar mi relación como cliente, 
                realizar reservas y proporcionar el servicio solicitado según nuestra Política de Privacidad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consentimiento_marketing"
              {...register('consentimiento_marketing')}
            />
            <div className="flex-1">
              <Label htmlFor="consentimiento_marketing" className="text-sm font-medium">
                Consentimiento para comunicaciones de marketing
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Acepto recibir comunicaciones comerciales sobre ofertas especiales, eventos y novedades 
                del restaurante. Puedo retirar este consentimiento en cualquier momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.consentimiento_gdpr && (
        <p className="text-sm text-red-500">
          Debe aceptar el consentimiento para el tratamiento de datos personales
        </p>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Resumen del Cliente</h4>
        <div className="text-sm space-y-1">
          <p><strong>Nombre:</strong> {watchedValues.nombre} {watchedValues.apellido}</p>
          <p><strong>Email:</strong> {watchedValues.email}</p>
          <p><strong>Teléfono:</strong> {watchedValues.telefono}</p>
          {watchedValues.fecha_nacimiento && (
            <p><strong>Fecha de Nacimiento:</strong> {watchedValues.fecha_nacimiento}</p>
          )}
          {selectedPreferencias.length > 0 && (
            <p><strong>Preferencias Dietéticas:</strong> {selectedPreferencias.join(', ')}</p>
          )}
          {selectedComunicacion.length > 0 && (
            <p><strong>Comunicación:</strong> {selectedComunicacion.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? 'bg-enigma-primary text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Contenido del paso actual */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onClose : handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        {currentStep < 4 ? (
          <Button type="button" onClick={handleNext}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar Cliente'}
          </Button>
        )}
      </div>
    </form>
  );
}
