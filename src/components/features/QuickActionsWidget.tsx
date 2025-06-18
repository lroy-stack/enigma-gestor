
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Calendar, 
  Grid3X3, 
  MessageSquare, 
  Users,
  BarChart3 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsWidgetProps {
  onNewReservation?: () => void;
  onQuickSearch?: () => void;
  onEnigmitoChat?: () => void;
}

export function QuickActionsWidget({ 
  onNewReservation, 
  onQuickSearch, 
  onEnigmitoChat 
}: QuickActionsWidgetProps) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: 'Nueva Reserva',
      description: 'Crear nueva reserva',
      color: 'bg-enigma-primary text-white',
      onClick: onNewReservation || (() => navigate('/reservas/nueva'))
    },
    {
      icon: Search,
      label: 'Buscar Cliente',
      description: 'Búsqueda rápida',
      color: 'bg-enigma-secondary text-white',
      onClick: onQuickSearch || (() => navigate('/clientes'))
    },
    {
      icon: Calendar,
      label: 'Ver Reservas',
      description: 'Lista completa',
      color: 'bg-enigma-accent text-white',
      onClick: () => navigate('/reservas')
    },
    {
      icon: Grid3X3,
      label: 'Gestionar Mesas',
      description: 'Plano interactivo',
      color: 'bg-blue-600 text-white',
      onClick: () => navigate('/mesas')
    },
    {
      icon: Users,
      label: 'Clientes',
      description: 'Base de datos',
      color: 'bg-green-600 text-white',
      onClick: () => navigate('/clientes')
    },
    {
      icon: MessageSquare,
      label: 'Enigmito',
      description: 'Consultar IA',
      color: 'bg-purple-600 text-white',
      onClick: onEnigmitoChat || (() => console.log('Abrir chat Enigmito'))
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:scale-105 transition-transform ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
