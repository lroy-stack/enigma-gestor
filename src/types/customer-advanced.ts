
import { Cliente } from './database';

// Interfaces para funcionalidades avanzadas de clientes
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

// Interface para datos completos del cliente con funcionalidades avanzadas
export interface ClienteAdvanced extends Cliente {
  tags: ClienteTag[];
  notas: ClienteNota[];
  alertas: ClienteAlerta[];
  interacciones: ClienteInteraccion[];
}
