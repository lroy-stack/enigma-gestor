
import React from 'react';
import {
  Calendar,
  UserCheck,
  XCircle,
  UserX,
  Edit,
  Crown,
  Clock,
  AlertTriangle,
  BarChart3,
  Bell,
  Settings
} from 'lucide-react';

export const getNotificationIcon = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'calendar': Calendar,
    'user-check': UserCheck,
    'x-circle': XCircle,
    'user-x': UserX,
    'edit': Edit,
    'crown': Crown,
    'clock': Clock,
    'alert-triangle': AlertTriangle,
    'bar-chart-3': BarChart3,
    'bell': Bell,
    'settings': Settings
  };

  return iconMap[iconName] || Bell;
};
