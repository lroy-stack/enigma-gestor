
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MesaEstado, MESA_ESTADOS_CONFIG } from '@/types/mesa';

interface TableStatus {
  id: string;
  numero_mesa: string;
  capacidad: number;
  estado: MesaEstado;
  tiempo_estimado?: string;
  tipo_mesa: string;
}

interface TablesStatusWidgetProps {
  tables: TableStatus[];
}

export function TablesStatusWidget({ tables }: TablesStatusWidgetProps) {
  const navigate = useNavigate();

  const getStatusConfig = (estado: MesaEstado) => {
    return MESA_ESTADOS_CONFIG[estado];
  };

  const statusCounts = tables.reduce((acc, table) => {
    acc[table.estado] = (acc[table.estado] || 0) + 1;
    return acc;
  }, {} as Record<MesaEstado, number>);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-lg">
          <Grid3X3 className="h-5 w-5 mr-2 text-enigma-primary" />
          Estado de Mesas
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/mesas')}
        >
          Ver Plano
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de Estados */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.libre || 0}
            </div>
            <div className="text-sm text-gray-600">Libres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.ocupada || 0}
            </div>
            <div className="text-sm text-gray-600">Ocupadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.reservada || 0}
            </div>
            <div className="text-sm text-gray-600">Reservadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.limpieza || 0}
            </div>
            <div className="text-sm text-gray-600">Limpieza</div>
          </div>
        </div>

        {/* Lista de Mesas */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {tables.slice(0, 8).map((table) => {
            const statusConfig = getStatusConfig(table.estado);
            return (
              <div key={table.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-sm">Mesa {table.numero_mesa}</span>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{table.capacidad} pers.</span>
                  {table.tiempo_estimado && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{table.tiempo_estimado}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
