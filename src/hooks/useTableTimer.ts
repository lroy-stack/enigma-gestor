
import { useState, useEffect, useCallback } from 'react';

export interface TableTimer {
  id: string;
  startTime: Date;
  duration: number; // en minutos
  isActive: boolean;
  elapsedMinutes: number;
  status: 'verde' | 'amarillo' | 'rojo';
}

export function useTableTimer() {
  const [timers, setTimers] = useState<Map<string, TableTimer>>(new Map());

  const startTimer = useCallback((tableId: string, durationMinutes: number = 120) => {
    const newTimer: TableTimer = {
      id: tableId,
      startTime: new Date(),
      duration: durationMinutes,
      isActive: true,
      elapsedMinutes: 0,
      status: 'verde'
    };

    setTimers(prev => new Map(prev.set(tableId, newTimer)));
  }, []);

  const stopTimer = useCallback((tableId: string) => {
    setTimers(prev => {
      const newTimers = new Map(prev);
      const timer = newTimers.get(tableId);
      if (timer) {
        newTimers.set(tableId, { ...timer, isActive: false });
      }
      return newTimers;
    });
  }, []);

  const removeTimer = useCallback((tableId: string) => {
    setTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.delete(tableId);
      return newTimers;
    });
  }, []);

  const getTimer = useCallback((tableId: string) => {
    return timers.get(tableId);
  }, [timers]);

  const getTimerStatus = useCallback((elapsedMinutes: number, duration: number) => {
    const percentage = (elapsedMinutes / duration) * 100;
    if (percentage >= 100) return 'rojo';
    if (percentage >= 75) return 'amarillo';
    return 'verde';
  }, []);

  // Actualizar timers cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = new Map();
        
        prev.forEach((timer, tableId) => {
          if (timer.isActive) {
            const now = new Date();
            const elapsedMinutes = Math.floor((now.getTime() - timer.startTime.getTime()) / (1000 * 60));
            const status = getTimerStatus(elapsedMinutes, timer.duration);
            
            newTimers.set(tableId, {
              ...timer,
              elapsedMinutes,
              status
            });
          } else {
            newTimers.set(tableId, timer);
          }
        });
        
        return newTimers;
      });
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [getTimerStatus]);

  return {
    timers: Array.from(timers.values()),
    startTimer,
    stopTimer,
    removeTimer,
    getTimer
  };
}
