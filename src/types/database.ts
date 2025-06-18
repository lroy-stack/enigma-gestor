// Definiciones de tipos TypeScript para las entidades principales de Enigma Cocina con Alma

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  idioma_preferido: string;
  historial_reservas_ids?: string[];
  preferencias_dieteticas?: string[];
  notas_privadas?: string;
  vip_status: boolean;
  fecha_creacion: string;
  ultima_visita?: string;
}

export interface Reserva {
  id: string;
  cliente_id: string;
  fecha_reserva: string;
  hora_reserva: string;
  numero_comensales: number;
  mesa_id?: string;
  estado_reserva: 'pendiente_confirmacion' | 'confirmada' | 'cancelada_usuario' | 'cancelada_restaurante' | 'completada' | 'no_show';
  origen_reserva: 'web' | 'chatbot' | 'whatsapp' | 'telefono' | 'en_persona';
  notas_cliente?: string;
  notas_restaurante?: string;
  enigmito_log_id?: string;
  fecha_creacion: string;
  fecha_modificacion?: string;
  asignada_por?: string;
  // Relations
  clientes?: Cliente;
  mesas?: Mesa;
  personal?: Personal;
}

export interface Mesa {
  id: string;
  numero_mesa: string;
  capacidad: number;
  tipo_mesa: 'estandar' | 'ventana' | 'terraza_superior' | 'terraza_inferior' | 'barra';
  ubicacion_descripcion?: string;
  activa: boolean;
  es_combinable_con?: string[];
  notas_mesa?: string;
  position_x: number;
  position_y: number;
}

export interface Personal {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'manager' | 'staff' | 'host';
  activo: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface RestauranteConfig {
  id: string;
  nombre_restaurante: string;
  direccion: string;
  telefono: string;
  email_reservas: string;
  capacidad_maxima: number;
  duracion_reserva_default_minutos: number;
  auto_aceptar_reservas: boolean;
  politica_cancelacion?: string;
  mensaje_bienvenida_email?: string;
  mensaje_confirmacion_whatsapp?: string;
  horarios_operacion?: Record<string, any>;
}

export interface DisponibilidadMesa {
  id: string;
  fecha: string;
  mesa_id: string;
  franja_horaria_inicio: string;
  franja_horaria_fin: string;
  estado: 'disponible' | 'reservada' | 'bloqueada';
  reserva_id?: string;
}

export interface EnigmitoLog {
  id: string;
  reserva_id_procesada?: string;
  timestamp: string;
  prompt_entrada: string;
  respuesta_ia: string;
  confianza_ia?: number;
  accion_tomada: string;
  errores_detectados?: string;
}

export interface NotificacionPlantilla {
  id: string;
  nombre_plantilla: string;
  canal: 'email' | 'whatsapp' | 'sms';
  idioma: string;
  asunto?: string;
  cuerpo: string;
  variables_disponibles?: string[];
}

// Tipos para formularios y UI
export interface ReservaFormData {
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_email: string;
  cliente_telefono: string;
  fecha_reserva: string;
  hora_reserva: string;
  numero_comensales: number;
  notas_cliente?: string;
  origen_reserva: Reserva['origen_reserva'];
}

export interface FiltrosReserva {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: Reserva['estado_reserva'];
  origen?: Reserva['origen_reserva'];
  cliente_nombre?: string;
}

export interface EstadisticasDashboard {
  reservas_hoy: number;
  reservas_manana: number;
  ocupacion_actual: number;
  clientes_vip: number;
  ingresos_mes: number;
}

// Nuevas interfaces para funcionalidades avanzadas
export interface ClienteTag {
  id: string;
  cliente_id: string;
  tag_nombre: string;
  tag_color: string;
  creado_por?: string;
  fecha_creacion: string;
}

export interface ClienteNota {
  id: string;
  cliente_id: string;
  contenido: string;
  tipo_nota: 'general' | 'preferencia' | 'alerta' | 'seguimiento';
  es_privada: boolean;
  creado_por?: string;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface ClienteAlerta {
  id: string;
  cliente_id: string;
  tipo_alerta: 'seguimiento' | 'cumpleanos' | 'inactividad' | 'personalizada';
  titulo: string;
  descripcion?: string;
  fecha_alerta: string;
  hora_alerta?: string;
  completada: boolean;
  creado_por?: string;
  fecha_creacion: string;
}

export interface ClienteInteraccion {
  id: string;
  cliente_id: string;
  tipo_interaccion: 'reserva' | 'visita' | 'llamada' | 'email' | 'whatsapp' | 'nota';
  descripcion?: string;
  fecha_interaccion: string;
  metadata?: Record<string, any>;
  creado_por?: string;
}

export interface ReservationStats {
  fecha_reserva: string;
  total_reservas: number;
  confirmadas: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
  no_shows: number;
  total_comensales: number;
  promedio_comensales: number;
}

export interface ZoneStats {
  zona: string;
  total_mesas: number;
  mesas_libres: number;
  mesas_ocupadas: number;
  mesas_reservadas: number;
  mesas_limpieza: number;
  mesas_fuera_servicio: number;
  capacidad_total: number;
  capacidad_ocupada: number;
  porcentaje_ocupacion: number;
}

export interface TableCombination {
  id: string;
  nombre_combinacion: string;
  mesa_principal_id: string;
  mesas_secundarias: string[];
  mesas_combinadas: string[]; // Alias para compatibilidad
  capacidad_total: number;
  reserva_id?: string;
  estado_combinacion: EstadoMesa;
  activa: boolean;
  creado_por?: string;
  created_at: string;
  updated_at: string;
}

export type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'limpieza' | 'fuera_servicio';

export function validateMesaEstado(estado: string): estado is EstadoMesa {
  return ['libre', 'ocupada', 'reservada', 'limpieza', 'fuera_servicio'].includes(estado);
}
