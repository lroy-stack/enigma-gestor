
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Cliente } from '@/types/database';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  AlertTriangle,
  Utensils,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomersListProps {
  clientes: Cliente[];
  searchTerm: string;
  onClienteSelect: (cliente: Cliente) => void;
}

export function CustomersList({ clientes, searchTerm, onClienteSelect }: CustomersListProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getClienteStatus = (cliente: Cliente) => {
    if (cliente.vip_status) return { label: 'VIP', color: 'bg-yellow-100 text-yellow-800' };
    
    const ahora = new Date();
    const registro = new Date(cliente.fecha_creacion);
    const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
    
    if (registro > unMesAtras) {
      return { label: 'Nuevo', color: 'bg-green-100 text-green-800' };
    }
    
    if (!cliente.ultima_visita) {
      return { label: 'Sin visitas', color: 'bg-gray-100 text-gray-800' };
    }
    
    const ultimaVisita = new Date(cliente.ultima_visita);
    const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
    
    if (ultimaVisita < tresMesesAtras) {
      return { label: 'Inactivo', color: 'bg-red-100 text-red-800' };
    }
    
    return { label: 'Regular', color: 'bg-blue-100 text-blue-800' };
  };

  const handleViewProfile = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}`);
  };

  const handleNewReservation = (cliente: Cliente) => {
    navigate(`/reservas/nueva?cliente=${cliente.id}`);
  };

  if (clientes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron clientes
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 
              `No hay clientes que coincidan con "${searchTerm}"` :
              'Aún no hay clientes registrados'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente) => {
          const status = getClienteStatus(cliente);
          
          return (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-enigma-primary text-white">
                        {getInitials(cliente.nombre, cliente.apellido)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">
                        {cliente.nombre} {cliente.apellido}
                      </h3>
                      <p className="text-sm text-gray-500">{cliente.email}</p>
                    </div>
                  </div>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {cliente.telefono}
                  </div>
                  
                  {cliente.ultima_visita && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Última visita: {formatDistanceToNow(new Date(cliente.ultima_visita), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                  )}
                  
                  {cliente.preferencias_dieteticas && cliente.preferencias_dieteticas.length > 0 && (
                    <div className="flex items-center">
                      <Utensils className="h-4 w-4 mr-2" />
                      {cliente.preferencias_dieteticas.length} preferencias
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Cliente desde {format(new Date(cliente.fecha_creacion), 'MMM yyyy', { locale: es })}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProfile(cliente)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNewReservation(cliente)}
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Preferencias</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => {
                const status = getClienteStatus(cliente);
                
                return (
                  <TableRow key={cliente.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-enigma-primary text-white text-xs">
                            {getInitials(cliente.nombre, cliente.apellido)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {cliente.nombre} {cliente.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            Cliente desde {format(new Date(cliente.fecha_creacion), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {cliente.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {cliente.telefono}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {cliente.ultima_visita ? (
                        <div className="text-sm">
                          <div>{format(new Date(cliente.ultima_visita), 'dd/MM/yyyy')}</div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(cliente.ultima_visita), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin visitas</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {cliente.preferencias_dieteticas && cliente.preferencias_dieteticas.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Utensils className="h-3 w-3 mr-1" />
                            {cliente.preferencias_dieteticas.length}
                          </Badge>
                        )}
                        {cliente.vip_status && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProfile(cliente)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleNewReservation(cliente)}
                          className="h-8 w-8 p-0"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
