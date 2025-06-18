import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, parseISO, isBefore, startOfToday, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, Clock, Users, Phone, Mail, MessageSquare, 
  CheckCircle, AlertCircle, Loader2, User, X, MapPin, Heart,
  Utensils, PartyPopper, Briefcase, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateReservation, useAvailableTables } from '@/hooks/useReservations';
import { toast } from '@/hooks/use-toast';

const reservationSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
  email: z.string().email('Email inválido'),
  fecha_reserva: z.string().min(1, 'Selecciona una fecha'),
  hora_reserva: z.string().min(1, 'Selecciona una hora'),
  personas: z.number().min(1, 'Mínimo 1 persona').max(20, 'Máximo 20 personas'),
  ocasion: z.string().optional(),
  requisitos_dieteticos: z.string().optional(),
  mesa_id: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface NewReservationFormProps {
  onClose: () => void;
  initialData?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
}

// Prefijos telefónicos comunes
const PHONE_PREFIXES = [
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
];

// Horarios de almuerzo y cena
const generateTimeSlots = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
  const times = [];
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    times.push(timeString);
    
    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  
  return times;
};

const TIME_SLOTS = {
  lunch: {
    label: 'Almuerzo',
    icon: '☀️',
    times: generateTimeSlots(13, 0, 15, 45) // 13:00 a 15:45 cada 15 min
  },
  dinner: {
    label: 'Cena',
    icon: '🌙',
    times: generateTimeSlots(18, 0, 22, 45) // 18:00 a 22:45 cada 15 min
  }
};

// Opciones de ocasión
const OCCASION_OPTIONS = [
  { value: 'cumpleanos', label: 'Cumpleaños', icon: PartyPopper, color: '#9FB289' },
  { value: 'aniversario', label: 'Aniversario', icon: Heart, color: '#CB5910' },
  { value: 'negocios', label: 'Reunión de negocios', icon: Briefcase, color: '#237584' },
  { value: 'romantica', label: 'Cita romántica', icon: Heart, color: '#FF6B9D' },
  { value: 'otra', label: 'Otra', icon: Utensils, color: '#6B7280' },
];

export function NewReservationForm({ onClose, initialData }: NewReservationFormProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showPhonePrefixes, setShowPhonePrefixes] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'lunch' | 'dinner'>('lunch');
  const [phonePrefix, setPhonePrefix] = useState('+34');
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  const createReservation = useCreateReservation();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      nombre: initialData?.customerName?.split(' ')[0] || '',
      apellido: initialData?.customerName?.split(' ').slice(1).join(' ') || '',
      telefono: initialData?.customerPhone || '',
      email: initialData?.customerEmail || '',
      fecha_reserva: '',
      hora_reserva: '',
      personas: 2,
      ocasion: '',
      requisitos_dieteticos: '',
      mesa_id: '',
    }
  });

  const watchedDate = form.watch('fecha_reserva');
  const watchedTime = form.watch('hora_reserva');
  const watchedPersonas = form.watch('personas');
  
  const { data: availableTables } = useAvailableTables(
    watchedDate,
    watchedTime,
    watchedPersonas
  );

  const onSubmit = async (data: ReservationFormData) => {
    try {
      const fullPhoneNumber = phonePrefix + data.telefono;
      await createReservation.mutateAsync({
        ...data,
        telefono: fullPhoneNumber,
      });

      toast({
        title: "Reserva creada exitosamente",
        description: `Reserva para ${data.nombre} ${data.apellido} el ${format(parseISO(data.fecha_reserva), 'dd/MM/yyyy')} a las ${data.hora_reserva}`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const start = startOfMonth(calendarDate);
    const end = endOfMonth(calendarDate);
    const days = eachDayOfInterval({ start, end });
    
    // Agregar días del mes anterior para completar la primera semana
    const startDayOfWeek = start.getDay();
    const daysFromPrevMonth = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      daysFromPrevMonth.push(new Date(start.getTime() - (i + 1) * 24 * 60 * 60 * 1000));
    }
    
    // Agregar días del siguiente mes para completar la última semana
    const endDayOfWeek = end.getDay();
    const daysFromNextMonth = [];
    for (let i = 1; i <= 6 - endDayOfWeek; i++) {
      daysFromNextMonth.push(new Date(end.getTime() + i * 24 * 60 * 60 * 1000));
    }
    
    return [...daysFromPrevMonth, ...days, ...daysFromNextMonth];
  };

  const CalendarDropdown = () => {
    if (!showCalendar) return null;

    const calendarDays = generateCalendarDays();
    const today = new Date();

    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50">
        <IOSCard variant="elevated" className="p-4 shadow-ios-2xl max-w-md mx-auto">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
              className="w-10 h-10 p-0 touch-manipulation"
            >
              <ChevronLeft size={20} />
            </IOSButton>
            
            <h3 className="ios-text-callout font-bold text-enigma-neutral-900 text-center flex-1 mx-2">
              {format(calendarDate, 'MMMM yyyy', { locale: es })}
            </h3>
            
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
              className="w-10 h-10 p-0 touch-manipulation"
            >
              <ChevronRight size={20} />
            </IOSButton>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="text-center ios-text-caption1 font-medium text-enigma-neutral-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, calendarDate);
              const isToday = isSameDay(day, today);
              const isPast = isBefore(day, startOfToday());
              const isSelected = form.watch('fecha_reserva') === format(day, 'yyyy-MM-dd');

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    if (!isPast) {
                      form.setValue('fecha_reserva', format(day, 'yyyy-MM-dd'));
                      setShowCalendar(false);
                    }
                  }}
                  className={`
                    w-10 h-10 rounded-xl ios-text-footnote font-medium transition-all touch-manipulation
                    ${!isCurrentMonth ? 'text-enigma-neutral-300' : ''}
                    ${isPast ? 'text-enigma-neutral-200 cursor-not-allowed' : 'hover:bg-enigma-primary/10'}
                    ${isToday ? 'ring-2 ring-enigma-primary' : ''}
                    ${isSelected ? 'bg-enigma-primary text-white' : ''}
                    ${!isPast && !isSelected ? 'text-enigma-neutral-900' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </IOSCard>
      </div>
    );
  };

  const TimeSlotDropdown = () => {
    if (!showTimeSlots) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50">
        <IOSCard variant="elevated" className="p-4 shadow-ios-2xl max-w-3xl mx-auto">
          {/* Selector de turno */}
          <div className="flex gap-2 mb-4 bg-enigma-neutral-100 rounded-xl p-1">
            {Object.entries(TIME_SLOTS).map(([key, slot]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTimeSlot(key as 'lunch' | 'dinner')}
                className={`flex-1 py-2 px-3 rounded-lg ios-text-footnote font-medium transition-all touch-manipulation ${
                  selectedTimeSlot === key
                    ? 'bg-white text-enigma-primary shadow-ios-sm'
                    : 'text-enigma-neutral-600'
                }`}
              >
                <span className="mr-2">{slot.icon}</span>
                {slot.label}
              </button>
            ))}
          </div>

          {/* Horarios disponibles */}
          <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
            {TIME_SLOTS[selectedTimeSlot].times.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  form.setValue('hora_reserva', time);
                  setShowTimeSlots(false);
                }}
                className={`p-2 rounded-lg ios-text-footnote font-medium transition-all touch-manipulation min-h-[44px] ${
                  form.watch('hora_reserva') === time
                    ? 'bg-enigma-primary text-white'
                    : 'bg-enigma-neutral-50 text-enigma-neutral-900 hover:bg-enigma-primary/10'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </IOSCard>
      </div>
    );
  };

  const PhonePrefixDropdown = () => {
    if (!showPhonePrefixes) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50">
        <IOSCard variant="elevated" className="p-2 shadow-ios-2xl max-h-60 overflow-y-auto">
          {PHONE_PREFIXES.map((prefix) => (
            <button
              key={prefix.code}
              type="button"
              onClick={() => {
                setPhonePrefix(prefix.code);
                setShowPhonePrefixes(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ios-text-footnote text-left transition-all touch-manipulation ${
                phonePrefix === prefix.code
                  ? 'bg-enigma-primary/10 text-enigma-primary'
                  : 'hover:bg-enigma-neutral-50'
              }`}
            >
              <span className="text-lg flex-shrink-0">{prefix.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{prefix.country}</div>
                <div className="text-enigma-neutral-500 text-sm">{prefix.code}</div>
              </div>
              {phonePrefix === prefix.code && (
                <CheckCircle size={16} className="text-enigma-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </IOSCard>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-ios z-50 flex items-center justify-center p-4">
      <IOSCard variant="elevated" className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <IOSCardHeader className="bg-gradient-to-r from-enigma-primary/5 to-enigma-secondary/5 border-b border-enigma-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <IOSCardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-enigma-primary rounded-2xl flex items-center justify-center shadow-ios">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h2 className="ios-text-title2 font-bold text-enigma-neutral-900">
                  Nueva Reserva
                </h2>
                <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                  Completa todos los campos
                </p>
              </div>
            </IOSCardTitle>
            
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-10 h-10 p-0 text-enigma-neutral-500 hover:text-enigma-neutral-700"
            >
              <X size={20} />
            </IOSButton>
          </div>
        </IOSCardHeader>

        {/* Contenido con scroll interno */}
        <IOSCardContent className="flex-1 p-6 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Layout en dos columnas para tablet horizontal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Columna izquierda */}
                <div className="space-y-6">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                      Información Personal
                    </h3>
                    
                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                              Nombre *
                            </FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                type="text"
                                placeholder="Nombre"
                                className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors touch-manipulation"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                              Apellido *
                            </FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                type="text"
                                placeholder="Apellido"
                                className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors touch-manipulation"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Teléfono con prefijo */}
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                            Teléfono *
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-3">
                              <div className="relative flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setShowPhonePrefixes(!showPhonePrefixes)}
                                  className="flex items-center gap-2 p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body hover:border-enigma-primary transition-colors min-w-[120px] touch-manipulation"
                                >
                                  <span>{PHONE_PREFIXES.find(p => p.code === phonePrefix)?.flag}</span>
                                  <span className="font-medium">{phonePrefix}</span>
                                  <ChevronDown size={16} />
                                </button>
                                <PhonePrefixDropdown />
                              </div>
                              <input
                                {...field}
                                type="tel"
                                placeholder="123456789"
                                className="flex-1 p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors touch-manipulation"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                            Email para confirmación *
                          </FormLabel>
                          <FormControl>
                            <input
                              {...field}
                              type="email"
                              placeholder="email@ejemplo.com"
                              className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors touch-manipulation"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Información de la Reserva */}
                  <div className="space-y-4">
                    <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                      Detalles de la Reserva
                    </h3>
                    
                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fecha_reserva"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                              Fecha *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowCalendar(!showCalendar)}
                                  className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary transition-colors text-left flex items-center justify-between touch-manipulation"
                                >
                                  <span className={`${field.value ? 'text-enigma-neutral-900' : 'text-enigma-neutral-500'} truncate pr-2`}>
                                    {field.value 
                                      ? format(parseISO(field.value), 'dd/MM/yyyy', { locale: es })
                                      : 'Seleccionar fecha'
                                    }
                                  </span>
                                  <Calendar size={20} className="text-enigma-neutral-400 flex-shrink-0" />
                                </button>
                                <CalendarDropdown />
                              </div>
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
                            <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                              Hora *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowTimeSlots(!showTimeSlots)}
                                  className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary transition-colors text-left flex items-center justify-between touch-manipulation"
                                >
                                  <span className={`${field.value ? 'text-enigma-neutral-900' : 'text-enigma-neutral-500'} truncate pr-2`}>
                                    {field.value || 'Seleccionar hora'}
                                  </span>
                                  <Clock size={20} className="text-enigma-neutral-400 flex-shrink-0" />
                                </button>
                                <TimeSlotDropdown />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Número de personas */}
                    <FormField
                      control={form.control}
                      name="personas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                            Número de personas *
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <IOSButton
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(Math.max(1, field.value - 1))}
                                className="w-12 h-12 rounded-xl border-enigma-neutral-300 touch-manipulation flex-shrink-0"
                              >
                                -
                              </IOSButton>
                              <div className="flex-1 text-center min-w-0">
                                <span className="ios-text-title2 font-bold text-enigma-neutral-900 block">
                                  {field.value}
                                </span>
                                <p className="ios-text-caption1 text-enigma-neutral-600">
                                  {field.value === 1 ? 'persona' : 'personas'}
                                </p>
                              </div>
                              <IOSButton
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(Math.min(20, field.value + 1))}
                                className="w-12 h-12 rounded-xl border-enigma-neutral-300 touch-manipulation flex-shrink-0"
                              >
                                +
                              </IOSButton>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-6">
                  {/* Ocasión especial */}
                  <FormField
                    control={form.control}
                    name="ocasion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                          Tipo de ocasión (opcional)
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-3">
                            {OCCASION_OPTIONS.map((occasion) => {
                              const Icon = occasion.icon;
                              return (
                                <button
                                  key={occasion.value}
                                  type="button"
                                  onClick={() => field.onChange(occasion.value === field.value ? '' : occasion.value)}
                                  className={`p-4 rounded-2xl border-2 transition-all text-left touch-manipulation ${
                                    field.value === occasion.value
                                      ? 'border-enigma-primary bg-enigma-primary/10'
                                      : 'border-enigma-neutral-200 bg-white hover:border-enigma-primary/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                      style={{ backgroundColor: `${occasion.color}20` }}
                                    >
                                      <Icon size={20} style={{ color: occasion.color }} />
                                    </div>
                                    <span className="ios-text-callout font-medium text-enigma-neutral-900">
                                      {occasion.label}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Requerimientos dietéticos */}
                  <FormField
                    control={form.control}
                    name="requisitos_dieteticos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                          Requerimientos dietéticos (opcional)
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={4}
                            placeholder="Vegetariano, vegano, alergias, etc."
                            className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors resize-none touch-manipulation"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preferencia de mesa */}
                  {availableTables && availableTables.length > 0 && (
                    <FormField
                      control={form.control}
                      name="mesa_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ios-text-callout font-semibold text-enigma-neutral-900">
                            Mesa disponible (opcional)
                          </FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full p-4 rounded-2xl border-2 border-enigma-neutral-200 bg-white ios-text-body focus:border-enigma-primary focus:outline-none transition-colors touch-manipulation"
                            >
                              <option value="">Asignar automáticamente</option>
                              {availableTables?.map((table) => (
                                <option key={table.id} value={table.id}>
                                  Mesa {table.numero_mesa} (Capacidad: {table.capacidad})
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </form>
          </Form>
        </IOSCardContent>

        {/* Footer fijo con botones */}
        <div className="flex-shrink-0 border-t border-enigma-neutral-200 p-6 bg-ios-background">
          <div className="flex gap-4">
            <IOSButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-enigma-neutral-300 text-enigma-neutral-700 p-4 touch-manipulation"
            >
              Cancelar
            </IOSButton>
            
            <IOSButton
              onClick={form.handleSubmit(onSubmit)}
              variant="primary"
              disabled={createReservation.isPending}
              className="flex-1 bg-enigma-primary p-4 touch-manipulation"
            >
              {createReservation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creando reserva...
                </>
              ) : (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Confirmar Reserva
                </>
              )}
            </IOSButton>
          </div>
        </div>
      </IOSCard>
    </div>
  );
}