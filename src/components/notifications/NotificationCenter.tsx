
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { NotificationModal } from './NotificationModal';
import { NotificationFilters } from './NotificationFilters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Check, Settings } from 'lucide-react';
import type { Notification } from '@/hooks/useNotifications';

const NotificationCenter = () => {
  const {
    notifications,
    notificationTypes,
    loading,
    error,
    unreadCount,
    markAllAsRead
  } = useNotifications();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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

  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F2F2F7'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F2F2F7',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ color: '#FF3B30', fontSize: '18px', fontWeight: '600' }}>
          Error al cargar notificaciones
        </div>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#F2F2F7',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid #E5E5EA',
        padding: '20px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#000000',
              margin: '0',
            }}>
              Centro de Notificaciones
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#8E8E93',
              margin: '4px 0 0 0',
            }}>
              Gestión de alertas y eventos • {unreadCount} sin leer • {currentTime.toLocaleTimeString('es-ES')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                backgroundColor: unreadCount > 0 ? '#9FB289' : '#E5E5EA',
                color: unreadCount > 0 ? '#FFFFFF' : '#8E8E93',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: unreadCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              Marcar Todo Leído
            </button>
            <button style={{
              backgroundColor: '#237584',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Settings size={16} />
              Configurar
            </button>
          </div>
        </div>

        <NotificationFilters
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationTypes={notificationTypes}
          notifications={notifications}
          unreadCount={unreadCount}
        />
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        <NotificationList
          notifications={filteredNotifications}
          onNotificationClick={handleNotificationClick}
        />
      </main>

      {/* Modal */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default NotificationCenter;
