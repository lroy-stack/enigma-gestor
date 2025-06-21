import React, { useState } from 'react';
import { Bell, Settings, Check, Filter, Search, Clock, Trash2 } from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationModal } from '@/components/notifications/NotificationModal';
import { NotificationDemo } from '@/components/notifications/NotificationDemo';
import { NotificationIntegrationDemo } from '@/components/notifications/NotificationIntegrationDemo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import type { Notification } from '@/hooks/useNotifications';

export default function Notificaciones() {
  const {
    notifications,
    notificationTypes,
    loading,
    error,
    unreadCount,
    markAllAsRead,
    cleanupDuplicates
  } = useNotifications();

  // Debug: Log del hook de notificaciones
  console.log('🔍 Notificaciones Debug:', {
    notifications,
    loading,
    error,
    unreadCount
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cleaningUp, setCleaningUp] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type_code === filterType);
    }

    if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.data?.cliente_nombre && n.data.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const handleCleanupDuplicates = async () => {
    setCleaningUp(true);
    try {
      const deletedCount = await cleanupDuplicates();
      toast.success(`Se han eliminado ${deletedCount} notificaciones duplicadas`, {
        duration: 4000
      });
    } catch (error) {
      toast.error('Error al limpiar notificaciones duplicadas', {
        duration: 4000
      });
    } finally {
      setCleaningUp(false);
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const totalNotifications = notifications.length;
  const readCount = notifications.filter(n => n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ios-background flex items-center justify-center">
        <IOSCard variant="elevated" className="max-w-md mx-4">
          <IOSCardContent className="p-8 text-center">
            <div 
              className="w-16 h-16 rounded-ios-lg flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#FF3B3020', color: '#FF3B30' }}
            >
              <Bell size={32} />
            </div>
            <h3 className="ios-text-headline font-bold text-red-600 mb-2">
              Error al cargar notificaciones
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <IOSButton variant="primary" style={{ backgroundColor: '#237584' }}>
              Intentar de nuevo
            </IOSButton>
          </IOSCardContent>
        </IOSCard>
      </div>
    );
  }

  return (
    <div className="font-sf">
      {/* Header estándar de página */}
      <div className="bg-white/95 backdrop-blur-ios border border-enigma-neutral-200/50 rounded-3xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="ios-text-large-title font-bold text-enigma-neutral-900">
                Notificaciones
              </h1>
              <p className="ios-text-footnote text-enigma-neutral-600 mt-1">
                {unreadCount} sin leer • {totalNotifications} total • {currentTime.toLocaleTimeString('es-ES')}
              </p>
            </div>
            
            <div className="flex gap-3">
              <IOSButton 
                variant="outline"
                onClick={handleCleanupDuplicates}
                disabled={cleaningUp || totalNotifications === 0}
                className="text-white"
                style={{ 
                  backgroundColor: '#CB5910',
                  borderColor: '#CB5910'
                }}
              >
                <Trash2 size={20} className="mr-2" />
                {cleaningUp ? 'Limpiando...' : 'Limpiar Duplicados'}
              </IOSButton>
              
              <IOSButton 
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`${unreadCount > 0 ? 'text-white' : 'border-enigma-neutral-300 text-enigma-neutral-400'}`}
                style={unreadCount > 0 ? { 
                  backgroundColor: '#9FB289',
                  borderColor: '#9FB289'
                } : {}}
              >
                <Check size={20} className="mr-2" />
                Marcar Leídas
              </IOSButton>
              <IOSButton 
                variant="primary"
                className="text-white shadow-ios"
                style={{ 
                  backgroundColor: '#237584',
                  borderColor: '#237584'
                }}
              >
                <Settings size={20} className="mr-2" />
                Configurar
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Demo de notificaciones */}
      <NotificationDemo />

      {/* Demo de integración de eventos */}
      <NotificationIntegrationDemo />

      {/* Lista de notificaciones */}
      <div className="mb-6">
        <NotificationList
          notifications={filteredNotifications}
          onNotificationClick={handleNotificationClick}
          loading={loading}
        />
      </div>

      {/* Modal de notificación */}
      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}