
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedTableTimer {
  id: string;
  startTime: Date;
  duration: number;
  isActive: boolean;
  timeLeft: number;
  status: 'verde' | 'amarillo' | 'rojo';
}

export function useEnhancedTableTimer() {
  const [timers, setTimers] = useState<Map<string, EnhancedTableTimer>>(new Map());

  // Cargar timers desde la base de datos al inicializar
  useEffect(() => {
    const loadTimersFromDB = async () => {
      try {
        const { data, error } = await supabase
          .from('mesa_estados')
          .select('mesa_id, tiempo_ocupacion')
          .not('tiempo_ocupacion', 'is', null);

        if (error) throw error;

        const loadedTimers = new Map<string, EnhancedTableTimer>();
        
        data?.forEach((mesa) => {
          if (mesa.tiempo_ocupacion) {
            const startTime = new Date(mesa.tiempo_ocupacion);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            const totalSeconds = 120 * 60; // 120 minutos en segundos
            const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);
            
            if (timeLeft > 0) {
              const timer: EnhancedTableTimer = {
                id: mesa.mesa_id,
                startTime,
                duration: 120,
                isActive: true,
                timeLeft,
                status: getTimerStatus(elapsedSeconds, totalSeconds)
              };
              loadedTimers.set(mesa.mesa_id, timer);
            }
          }
        });

        setTimers(loadedTimers);
      } catch (error) {
        console.error('Error loading timers:', error);
      }
    };

    loadTimersFromDB();
  }, []);

  const getTimerStatus = useCallback((elapsedSeconds: number, totalSeconds: number) => {
    const elapsedMinutes = elapsedSeconds / 60;
    
    if (elapsedMinutes >= 120) return 'rojo';
    if (elapsedMinutes >= 90) return 'amarillo';
    return 'verde';
  }, []);

  const startTimer = useCallback(async (tableId: string, durationMinutes: number = 120) => {
    const startTime = new Date();
    
    try {
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('mesa_estados')
        .update({ 
          tiempo_ocupacion: startTime.toISOString(),
          estado: 'ocupada'
        })
        .eq('mesa_id', tableId);

      if (error) throw error;

      // Crear timer local
      const newTimer: EnhancedTableTimer = {
        id: tableId,
        startTime,
        duration: durationMinutes,
        isActive: true,
        timeLeft: durationMinutes * 60,
        status: 'verde'
      };

      setTimers(prev => new Map(prev.set(tableId, newTimer)));
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }, []);

  const stopTimer = useCallback(async (tableId: string) => {
    try {
      // Limpiar tiempo_ocupacion en la base de datos
      const { error } = await supabase
        .from('mesa_estados')
        .update({ tiempo_ocupacion: null })
        .eq('mesa_id', tableId);

      if (error) throw error;

      // Desactivar timer local
      setTimers(prev => {
        const newTimers = new Map(prev);
        const timer = newTimers.get(tableId);
        if (timer) {
          newTimers.set(tableId, { ...timer, isActive: false });
        }
        return newTimers;
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
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

  // Actualizar timers cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = new Map();
        
        prev.forEach((timer, tableId) => {
          if (timer.isActive) {
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
            const totalSeconds = timer.duration * 60;
            const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);
            const status = getTimerStatus(elapsedSeconds, totalSeconds);
            
            if (timeLeft > 0) {
              newTimers.set(tableId, {
                ...timer,
                timeLeft,
                status
              });
            } else {
              // Timer expirado, mantener pero marcar como rojo
              newTimers.set(tableId, {
                ...timer,
                timeLeft: 0,
                status: 'rojo'
              });
            }
          } else {
            newTimers.set(tableId, timer);
          }
        });
        
        return newTimers;
      });
    }, 1000);

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
