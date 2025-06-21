import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationType {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon_name: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  type_code: string;
  title: string;
  message: string;
  priority: 'high' | 'normal' | 'low';
  is_read: boolean;
  data?: any;
  actions?: string[];
  created_at: string;
  read_at?: string;
  expires_at?: string;
  reserva_id?: string;
  cliente_id?: string;
  mesa_id?: string;
  personal_id?: string;
  notification_types?: NotificationType;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificationTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setNotificationTypes(data || []);
    } catch (err) {
      console.error('Error fetching notification types:', err);
      setError('Error al cargar tipos de notificaciones');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching notifications...');
      
      // Primero verificar si la tabla existe
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Error accessing notifications table:', error);
        throw error;
      }

      console.log('✅ Notifications table accessible, fetching full data...');
      
      const { data: fullData, error: fullError } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_types (*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fullError) throw fullError;
      
      console.log('📊 Raw notification data:', fullData);
      
      // Transform the data to match our interface
      const transformedData: Notification[] = (fullData || []).map(item => ({
        id: item.id,
        type_code: item.type_code,
        title: item.title,
        message: item.message,
        priority: item.priority as 'high' | 'normal' | 'low',
        is_read: item.is_read,
        data: item.data,
        actions: Array.isArray(item.actions) ? (item.actions as string[]) : [],
        created_at: item.created_at,
        read_at: item.read_at,
        expires_at: item.expires_at,
        reserva_id: item.reserva_id,
        cliente_id: item.cliente_id,
        mesa_id: item.mesa_id,
        personal_id: item.personal_id,
        notification_types: item.notification_types
      }));
      
      console.log('✅ Transformed notifications:', transformedData);
      setNotifications(transformedData);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(`Error al cargar notificaciones: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_as_read', {
        notification_id: notificationId
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error al marcar notificación como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase.rpc('mark_all_notifications_as_read');

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Error al marcar todas las notificaciones como leídas');
    }
  };

  const cleanupDuplicates = async () => {
    try {
      console.log('🧹 Cleaning up duplicate notifications...');
      const { data, error } = await supabase.rpc('cleanup_duplicate_notifications');

      if (error) throw error;

      console.log(`✅ Cleaned up ${data} duplicate notifications.`);
      // Refetch notifications to update the UI immediately
      fetchNotifications();
      return data;
    } catch (err) {
      console.error('❌ Error cleaning up duplicates:', err);
      setError('Error al limpiar notificaciones duplicadas');
      throw err;
    }
  };

  const createNotification = async (notificationData: {
    type_code: string;
    title: string;
    message: string;
    priority?: 'high' | 'normal' | 'low';
    data?: any;
    actions?: string[];
    reserva_id?: string;
    cliente_id?: string;
    mesa_id?: string;
    personal_id?: string;
    expires_hours?: number;
  }) => {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_type_code: notificationData.type_code,
        p_title: notificationData.title,
        p_message: notificationData.message,
        p_priority: notificationData.priority || 'normal',
        p_data: notificationData.data || {},
        p_actions: notificationData.actions || [],
        p_reserva_id: notificationData.reserva_id,
        p_cliente_id: notificationData.cliente_id,
        p_mesa_id: notificationData.mesa_id,
        p_personal_id: notificationData.personal_id,
        p_expires_hours: notificationData.expires_hours
      });

      if (error) throw error;

      // Refrescar notificaciones
      fetchNotifications();
      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Error al crear notificación');
      throw err;
    }
  };

  useEffect(() => {
    fetchNotificationTypes();
    fetchNotifications();

    // TODO: Suscripción en tiempo real deshabilitada temporalmente
    // para evitar el error de múltiples suscripciones
    
    // Polling cada 30 segundos como alternativa
    const interval = setInterval(() => {
      if (!loading && !error) {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    notificationTypes,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    cleanupDuplicates,
    refetch: fetchNotifications
  };
};