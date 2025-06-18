
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  LogIn, 
  LogOut,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'nueva_reserva' | 'confirmacion' | 'cancelacion' | 'llegada' | 'salida' | 'mesa_liberada' | 'enigmito_accion';
  description: string;
  timestamp: string;
  user?: string;
  details?: string;
}

interface ActivityFeedWidgetProps {
  activities: ActivityItem[];
}

export function ActivityFeedWidget({ activities }: ActivityFeedWidgetProps) {
  const getActivityIcon = (type: string) => {
    const icons = {
      nueva_reserva: Calendar,
      confirmacion: CheckCircle,
      cancelacion: XCircle,
      llegada: LogIn,
      salida: LogOut,
      mesa_liberada: Activity,
      enigmito_accion: Bot
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      nueva_reserva: 'text-blue-600 bg-blue-100',
      confirmacion: 'text-green-600 bg-green-100',
      cancelacion: 'text-red-600 bg-red-100',
      llegada: 'text-purple-600 bg-purple-100',
      salida: 'text-orange-600 bg-orange-100',
      mesa_liberada: 'text-gray-600 bg-gray-100',
      enigmito_accion: 'text-enigma-primary bg-enigma-primary/10'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Activity className="h-5 w-5 mr-2 text-enigma-primary" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.details}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'HH:mm', { locale: es })}
                      </span>
                      {activity.user && (
                        <Badge variant="outline" className="text-xs">
                          {activity.user}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
