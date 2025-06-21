import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  User, 
  MessageSquare, 
  Utensils,
  MapPin,
  PartyPopper,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateReservation } from '@/hooks/useReservations';
import { useNotificationEmitter } from '@/hooks/useNotificationEmitter';
import { toast } from 'sonner';
import type { ReservaFormData } from '@/types/database';

// Schema de validación con Zod
const reservationSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z
    .string()
    .email('Ingrese un email válido')
    .min(1, 'El email es requerido'),
  
  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Formato de teléfono inválido'),
  
  fecha_reserva: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = startOfDay(new Date());
      return !isBefore(selectedDate, today);
    }, 'No puede seleccionar una fecha pasada'),
  
  hora_reserva: z
    .string()
    .min(1, 'La hora es requerida')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  
  personas: z
    .number()
    .min(1, 'Debe ser al menos 1 persona')
    .max(20, 'Máximo 20 personas por reserva'),
  
  ocasion: z.string().optional(),
  preferencia_mesa: z.string().optional(),
  requisitos_dieteticos: z.string().optional(),
  notas: z.string().optional(),
  primera_visita: z.boolean().optional()
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  onSuccess?: (reservation: any) => void;
  onCancel?: () => void;
  initialData?: Partial<ReservationFormValues>;
  className?: string;
}

export function ReservationForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  className 
}: ReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createReservation = useCreateReservation();
  const { emitReservaEvent } = useNotificationEmitter();

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      email: initialData?.email || '',
      telefono: initialData?.telefono || '',
      fecha_reserva: initialData?.fecha_reserva || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      hora_reserva: initialData?.hora_reserva || '20:00',
      personas: initialData?.personas || 2,
      ocasion: initialData?.ocasion || '',
      preferencia_mesa: initialData?.preferencia_mesa || '',
      requisitos_dieteticos: initialData?.requisitos_dieteticos || '',
      notas: initialData?.notas || '',
      primera_visita: initialData?.primera_visita || false
    }
  });

  const onSubmit = async (values: ReservationFormValues) => {
    setIsSubmitting(true);
    try {
      // Preparar datos para la tabla reservas
      const reservationData = {
        nombre: values.nombre.trim(),
        email: values.email.trim().toLowerCase(),
        telefono: values.telefono.trim(),
        fecha_reserva: values.fecha_reserva,
        hora_reserva: values.hora_reserva,
        personas: values.personas,
        ocasion: values.ocasion?.trim() || null,
        preferencia_mesa: values.preferencia_mesa?.trim() || null,
        requisitos_dieteticos: values.requisitos_dieteticos?.trim() || null,
        notas: values.notas?.trim() || null,
        estado: 'confirmada', // Reservas del gestor se confirman automáticamente
        primera_visita: values.primera_visita || false
      };

      console.log('📝 Enviando reserva:', reservationData);

      // Crear la reserva
      const newReservation = await createReservation.mutateAsync(reservationData);
      
      console.log('✅ Reserva creada:', newReservation);

      // Emitir notificación de reserva confirmada (ya que se crea confirmada)
      await emitReservaEvent('reserva_confirmada', newReservation, {
        origen: 'gestor_interno',
        auto_confirmada: true,
        timestamp: new Date().toISOString()
      });

      // Mostrar mensaje de éxito
      toast.success('¡Reserva confirmada exitosamente!', {
        description: `Reserva confirmada para ${values.personas} personas el ${format(new Date(values.fecha_reserva), 'dd/MM/yyyy', { locale: es })} a las ${values.hora_reserva}`
      });

      // Callback de éxito
      onSuccess?.(newReservation);

      // Limpiar formulario
      form.reset();

    } catch (error: any) {
      console.error('❌ Error creando reserva:', error);
      
      const errorMessage = error?.message || 'Error desconocido al crear la reserva';
      toast.error('Error al crear la reserva', {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generar opciones de hora (cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Opciones predefinidas
  const ocasionOptions = [
    'Cumpleaños',
    'Aniversario',
    'Cena romántica',
    'Cena de negocios',
    'Celebración familiar',
    'Despedida',
    'Reunión de amigos',
    'Otra'
  ];

  const preferenciaOptions = [
    'Terraza superior',
    'Terraza inferior', 
    'Interior junto a ventana',
    'Interior centro',
    'Barra',
    'Mesa tranquila',
    'Mesa familiar grande'
  ];

  return (
    <IOSCard className={className}>
      <IOSCardHeader className="pb-4">
        <IOSCardTitle className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-ios-lg flex items-center justify-center"
            style={{ backgroundColor: '#23758420', color: '#237584' }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
              Nueva Reserva
            </h3>
            <p className="ios-text-caption1 text-enigma-neutral-600 font-normal">
              Complete la información para crear una nueva reserva
            </p>
          </div>
        </IOSCardTitle>
      </IOSCardHeader>

      <IOSCardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Información del Cliente */}
            <div className="space-y-4">
              <h4 className="ios-text-callout font-semibold text-enigma-neutral-700 border-b border-enigma-neutral-200 pb-2 flex items-center gap-2">
                <User size={16} />
                Información del Cliente
              </h4>
              
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium">Nombre completo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: María García López"
                          className="ios-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                          <Mail size={14} />
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="ejemplo@correo.com"
                            className="ios-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                          <Phone size={14} />
                          Teléfono *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="+34 600 123 456"
                            className="ios-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Detalles de la Reserva */}
            <div className="space-y-4">
              <h4 className="ios-text-callout font-semibold text-enigma-neutral-700 border-b border-enigma-neutral-200 pb-2 flex items-center gap-2">
                <Calendar size={16} />
                Detalles de la Reserva
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_reserva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium">Fecha *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="ios-input"
                          min={format(new Date(), 'yyyy-MM-dd')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hora_reserva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                        <Clock size={14} />
                        Hora *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="ios-select">
                            <SelectValue placeholder="Seleccionar hora" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                        <Users size={14} />
                        Comensales *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="20"
                          className="ios-input"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4">
              <h4 className="ios-text-callout font-semibold text-enigma-neutral-700 border-b border-enigma-neutral-200 pb-2 flex items-center gap-2">
                <MessageSquare size={16} />
                Información Adicional
              </h4>
              
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="ocasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                        <PartyPopper size={14} />
                        Ocasión especial
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="ios-select">
                            <SelectValue placeholder="Seleccionar ocasión (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ocasionOptions.map((ocasion) => (
                            <SelectItem key={ocasion} value={ocasion}>
                              {ocasion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferencia_mesa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                        <MapPin size={14} />
                        Preferencia de mesa
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="ios-select">
                            <SelectValue placeholder="Seleccionar preferencia (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {preferenciaOptions.map((preferencia) => (
                            <SelectItem key={preferencia} value={preferencia}>
                              {preferencia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requisitos_dieteticos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium flex items-center gap-2">
                        <Utensils size={14} />
                        Requisitos dietéticos
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ej: Sin gluten, vegetariano, alergias..."
                          className="ios-textarea resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ios-text-callout font-medium">Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Comentarios adicionales, solicitudes especiales..."
                          className="ios-textarea resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primera_visita"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-ios-lg border border-enigma-neutral-200 p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="ios-text-callout font-medium">
                          Primera visita
                        </FormLabel>
                        <p className="ios-text-caption1 text-enigma-neutral-600">
                          ¿Es la primera vez que visita el restaurante?
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <IOSButton
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </IOSButton>
              )}
              
              <IOSButton
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex-1 text-white"
                style={{ 
                  backgroundColor: '#237584',
                  borderColor: '#237584'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Confirmando reserva...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Confirmar Reserva
                  </>
                )}
              </IOSButton>
            </div>
          </form>
        </Form>
      </IOSCardContent>
    </IOSCard>
  );
}