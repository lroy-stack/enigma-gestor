import React from 'react';
import { Bell, X, Check, Clock, AlertCircle, Users, Calendar } from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  // Mostrar solo las últimas 5 notificaciones en el dropdown
  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (typeCode: string) => {
    // Mapear códigos de tipo a iconos
    switch (typeCode) {
      case 'reservation_new':
      case 'reservation_cancelled':
      case 'reservation_confirmed':
        return Calendar;
      case 'customer_arrived':
      case 'customer_vip':
        return Users;
      case 'table_available':
      case 'table_occupied':
      case 'alert':
        return AlertCircle;
      case 'system':
      case 'backup':
        return Clock;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (typeCode: string, priority: string) => {
    if (priority === 'high') return '#CB5910'; // Naranja para alta prioridad
    
    switch (typeCode) {
      case 'reservation_new':
      case 'reservation_confirmed':
        return '#237584'; // Azul principal
      case 'customer_arrived':
      case 'customer_vip':
        return '#9FB289'; // Verde secundario
      case 'reservation_cancelled':
      case 'table_available':
      case 'alert':
        return '#CB5910'; // Naranja de acento
      case 'system':
      case 'backup':
        return '#8E8E93'; // Gris iOS
      default:
        return '#237584';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    onClose();
  };

  const handleViewAll = () => {
    navigate('/notificaciones');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="fixed top-16 right-4 z-50 w-96 max-w-[90vw] max-h-[80vh] bg-white/95 backdrop-blur-ios rounded-ios-lg shadow-ios-2xl border border-enigma-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-enigma-neutral-200 bg-gradient-to-r from-enigma-neutral-50 to-white">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-ios-lg flex items-center justify-center shadow-ios"
              style={{ backgroundColor: '#23758420', color: '#237584' }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <p className="ios-text-caption1 text-enigma-neutral-600">
                  {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <IOSButton
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                className="ios-text-caption1 text-enigma-primary"
              >
                <Check size={14} className="mr-1" />
                Leer todo
              </IOSButton>
            )}
            <IOSButton
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </IOSButton>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-enigma-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="ios-text-body text-enigma-neutral-600">
                Cargando notificaciones...
              </p>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div 
                className="w-16 h-16 rounded-ios-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F2F2F7' }}
              >
                <Bell size={24} className="text-enigma-neutral-400" />
              </div>
              <p className="ios-text-body text-enigma-neutral-600 mb-2">
                No hay notificaciones
              </p>
              <p className="ios-text-caption1 text-enigma-neutral-400">
                Te notificaremos cuando lleguen nuevas actualizaciones
              </p>
            </div>
          ) : (
            <div className="p-2">
              {recentNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type_code);
                const color = getNotificationColor(notification.type_code, notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-ios-lg mb-2 transition-all duration-200 ios-touch-feedback cursor-pointer ${
                      !notification.is_read 
                        ? 'bg-enigma-primary/5 border border-enigma-primary/20' 
                        : 'bg-enigma-neutral-50 hover:bg-enigma-neutral-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-ios flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        <IconComponent size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 truncate">
                                {notification.title}
                              </h4>
                              {notification.priority === 'high' && (
                                <IOSBadge variant="custom" size="lg" style={{ backgroundColor: '#CB5910', color: 'white' }}>
                                  Urgente
                                </IOSBadge>
                              )}
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-enigma-primary rounded-full" />
                              )}
                            </div>
                            <p className="ios-text-footnote text-enigma-neutral-700 leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <p className="ios-text-caption2 text-enigma-neutral-500">
                              {format(new Date(notification.created_at), 'HH:mm', { locale: es })}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            {!notification.is_read && (
                              <IOSButton
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="w-8 h-8 p-0"
                              >
                                <Check size={14} className="text-enigma-primary" />
                              </IOSButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <div className="p-4 border-t border-enigma-neutral-200 bg-enigma-neutral-50">
            <IOSButton
              variant="ghost"
              className="w-full justify-center ios-text-footnote text-enigma-primary"
              onClick={handleViewAll}
            >
              Ver todas las notificaciones
            </IOSButton>
          </div>
        )}
      </div>
    </>
  );
}