import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// Timezone de España
export const SPAIN_TIMEZONE = 'Europe/Madrid';

/**
 * Obtiene la fecha actual en el timezone de España
 */
export function getSpainDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: SPAIN_TIMEZONE }));
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD en timezone de España
 */
export function getTodaySpain(): string {
  const spainDate = getSpainDate();
  return format(spainDate, 'yyyy-MM-dd');
}

/**
 * Convierte una fecha a timezone de España
 */
export function toSpainTime(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? parseISO(date) : date;
  return new Date(inputDate.toLocaleString("en-US", { timeZone: SPAIN_TIMEZONE }));
}

/**
 * Formatea una fecha para mostrar en timezone de España
 */
export function formatSpainDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const spainDate = toSpainTime(date);
  return format(spainDate, formatStr, { locale: es });
}

/**
 * Verifica si una fecha es hoy en timezone de España
 */
export function isTodaySpain(date: Date | string): boolean {
  const spainDate = toSpainTime(date);
  const today = getSpainDate();
  return isToday(spainDate) && spainDate.toDateString() === today.toDateString();
}

/**
 * Verifica si una fecha es mañana en timezone de España
 */
export function isTomorrowSpain(date: Date | string): boolean {
  const spainDate = toSpainTime(date);
  const tomorrow = new Date(getSpainDate());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return spainDate.toDateString() === tomorrow.toDateString();
}

/**
 * Verifica si una fecha está en esta semana en timezone de España
 */
export function isThisWeekSpain(date: Date | string): boolean {
  const spainDate = toSpainTime(date);
  return isThisWeek(spainDate, { locale: es });
}

/**
 * Obtiene la fecha y hora actual de España en formato legible
 */
export function getSpainDateTime(): { date: string; time: string; full: string } {
  const now = getSpainDate();
  return {
    date: format(now, 'dd/MM/yyyy', { locale: es }),
    time: format(now, 'HH:mm:ss', { locale: es }),
    full: format(now, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  };
}

/**
 * Debug: Muestra información de timezone
 */
export function debugTimezone() {
  const local = new Date();
  const spain = getSpainDate();
  
  console.log('=== DEBUG TIMEZONE ===');
  console.log('Local time:', local.toString());
  console.log('Spain time:', spain.toString());
  console.log('Local date string:', format(local, 'yyyy-MM-dd HH:mm:ss'));
  console.log('Spain date string:', format(spain, 'yyyy-MM-dd HH:mm:ss'));
  console.log('Today Spain:', getTodaySpain());
  console.log('=====================');
}