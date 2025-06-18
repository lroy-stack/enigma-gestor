
// Tipos centralizados para el sistema de mesas - Enigma Cocina con Alma

export type MesaEstado = 'libre' | 'ocupada' | 'reservada' | 'limpieza' | 'fuera_servicio';

export type TipoMesa = 'estandar' | 'terraza_superior' | 'terraza_inferior' | 'barra' | 'vip';

export type ZonaMesa = 'interior' | 'campanar' | 'justicia' | 'barra';

export interface MesaEstadoConfig {
  color: string;
  bgColor: string;
  label: string;
  icon: string;
}

export const MESA_ESTADOS_CONFIG: Record<MesaEstado, MesaEstadoConfig> = {
  libre: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Libre',
    icon: '🟢'
  },
  ocupada: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    label: 'Ocupada',
    icon: '🔴'
  },
  reservada: {
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Reservada',
    icon: '🔵'
  },
  limpieza: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Limpieza',
    icon: '🟡'
  },
  fuera_servicio: {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    label: 'Fuera de Servicio',
    icon: '⚫'
  }
};

export interface SugerenciaMesa {
  tipo: 'individual' | 'individual_mayor' | 'combinacion_2';
  score: number;
  mesas: {
    id: string;
    numero: string;
    capacidad: number;
    zona: string;
  }[];
  capacidad_total: number;
  descripcion: string;
  zona: string;
  distancia?: number;
}

export function isMesaEstado(value: string): value is MesaEstado {
  return ['libre', 'ocupada', 'reservada', 'limpieza', 'fuera_servicio'].includes(value);
}

export function validateMesaEstado(value: string | null | undefined): MesaEstado {
  if (value && typeof value === 'string' && isMesaEstado(value)) {
    return value;
  }
  console.warn(`Estado de mesa inválido: ${value}, usando 'libre' por defecto`);
  return 'libre';
}
