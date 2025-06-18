import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Clock } from 'lucide-react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  reservationCount?: number;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  reservationCount = 0
}: CalendarHeaderProps) {
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const navigateToday = () => {
    onDateChange(new Date());
  };

  const getTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, "MMMM yyyy", { locale: es });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
      case 'day':
        return format(currentDate, "d 'de' MMMM, yyyy", { locale: es });
      default:
        return '';
    }
  };

  const getViewIcon = (viewType: CalendarView) => {
    switch (viewType) {
      case 'month':
        return Calendar;
      case 'week':
        return CalendarDays;
      case 'day':
        return Clock;
    }
  };

  const getViewLabel = (viewType: CalendarView) => {
    switch (viewType) {
      case 'month':
        return 'Mes';
      case 'week':
        return 'Semana';
      case 'day':
        return 'Día';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl p-6 mb-6 shadow-ios">
      {/* Título y Navegación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={navigatePrevious}
              className="w-10 h-10 p-0 rounded-ios hover:bg-enigma-neutral-100"
            >
              <ChevronLeft size={20} className="text-enigma-neutral-600" />
            </IOSButton>
            
            <div className="text-center min-w-[200px]">
              <h2 className="ios-text-title2 font-bold text-enigma-neutral-900 capitalize">
                {getTitle()}
              </h2>
              {reservationCount > 0 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <IOSBadge 
                    variant="custom" 
                    className="bg-enigma-primary/10 text-enigma-primary border-enigma-primary/20"
                  >
                    {reservationCount} reserva{reservationCount !== 1 ? 's' : ''}
                  </IOSBadge>
                </div>
              )}
            </div>

            <IOSButton
              variant="ghost"
              size="sm"
              onClick={navigateNext}
              className="w-10 h-10 p-0 rounded-ios hover:bg-enigma-neutral-100"
            >
              <ChevronRight size={20} className="text-enigma-neutral-600" />
            </IOSButton>
          </div>

          <IOSButton
            variant="outline"
            size="sm"
            onClick={navigateToday}
            className="border-enigma-primary text-enigma-primary hover:bg-enigma-primary hover:text-white"
          >
            Hoy
          </IOSButton>
        </div>

        {/* Selector de Vista */}
        <div className="flex items-center gap-1 bg-enigma-neutral-100/50 rounded-ios p-1 shadow-ios-inner">
          {(['month', 'week', 'day'] as CalendarView[]).map((viewType) => {
            const ViewIcon = getViewIcon(viewType);
            const isActive = view === viewType;
            
            return (
              <IOSButton
                key={viewType}
                variant={isActive ? "primary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(viewType)}
                className={`flex items-center gap-2 px-4 py-2 ${
                  isActive 
                    ? 'bg-enigma-primary text-white shadow-ios' 
                    : 'text-enigma-neutral-600 hover:text-enigma-primary hover:bg-white/50'
                }`}
              >
                <ViewIcon size={16} />
                <span className="hidden sm:inline">{getViewLabel(viewType)}</span>
              </IOSButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}