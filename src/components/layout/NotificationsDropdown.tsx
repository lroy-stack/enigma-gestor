import React, { useState } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Users, Calendar } from 'lucide-react';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'reservation' | 'customer' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent?: boolean;
}

// Datos de ejemplo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reservation',
    title: 'Nueva Reserva',
    message: 'Mesa para 4 personas hoy a las 20:30',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // hace 5 minutos
    read: false,
    urgent: true
  },
  {
    id: '2',
    type: 'customer',
    title: 'Cliente VIP',
    message: 'María García ha llegado - Mesa 12',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // hace 15 minutos
    read: false
  },
  {
    id: '3',
    type: 'alert',
    title: 'Mesa Libre',
    message: 'Mesa 8 disponible tras cancelación',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // hace 30 minutos
    read: true
  },
  {
    id: '4',
    type: 'system',
    title: 'Respaldo Completado',
    message: 'Copia de seguridad realizada correctamente',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    read: true
  }
];

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reservation':
        return Calendar;
      case 'customer':
        return Users;
      case 'alert':
        return AlertCircle;
      case 'system':
        return Clock;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type'], urgent?: boolean) => {
    if (urgent) return '#CB5910'; // Naranja de acento para urgentes
    
    switch (type) {
      case 'reservation':
        return '#237584'; // Azul principal
      case 'customer':
        return '#9FB289'; // Verde secundario
      case 'alert':
        return '#CB5910'; // Naranja de acento
      case 'system':
        return '#8E8E93'; // Gris iOS
      default:
        return '#237584';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
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
          {notifications.length === 0 ? (
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
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type, notification.urgent);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-ios-lg mb-2 transition-all duration-200 ios-touch-feedback ${
                      !notification.read 
                        ? 'bg-enigma-primary/5 border border-enigma-primary/20' 
                        : 'bg-enigma-neutral-50 hover:bg-enigma-neutral-100'
                    }`}
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
                              {notification.urgent && (
                                <IOSBadge variant="custom" size="lg" style={{ backgroundColor: '#CB5910', color: 'white' }}>
                                  Urgente
                                </IOSBadge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-enigma-primary rounded-full" />
                              )}
                            </div>
                            <p className="ios-text-footnote text-enigma-neutral-700 leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <p className="ios-text-caption2 text-enigma-neutral-500">
                              {format(notification.timestamp, 'HH:mm', { locale: es })}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            {!notification.read && (
                              <IOSButton
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="w-8 h-8 p-0"
                              >
                                <Check size={14} className="text-enigma-primary" />
                              </IOSButton>
                            )}
                            <IOSButton
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="w-8 h-8 p-0"
                            >
                              <X size={14} className="text-enigma-neutral-400" />
                            </IOSButton>
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
        {notifications.length > 0 && (
          <div className="p-4 border-t border-enigma-neutral-200 bg-enigma-neutral-50">
            <IOSButton
              variant="ghost"
              className="w-full justify-center ios-text-footnote text-enigma-primary"
            >
              Ver todas las notificaciones
            </IOSButton>
          </div>
        )}
      </div>
    </>
  );
}