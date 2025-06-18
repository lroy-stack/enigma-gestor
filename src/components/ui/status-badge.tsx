
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'pendiente_confirmacion' | 'confirmada' | 'cancelada_usuario' | 'cancelada_restaurante' | 'completada' | 'no_show';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pendiente_confirmacion: {
      label: 'Pendiente',
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    },
    confirmada: {
      label: 'Confirmada',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100'
    },
    cancelada_usuario: {
      label: 'Cancelada',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-100'
    },
    cancelada_restaurante: {
      label: 'Cancelada',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-100'
    },
    completada: {
      label: 'Completada',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    },
    no_show: {
      label: 'No Show',
      variant: 'destructive' as const,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
