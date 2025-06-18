
import React, { useState } from 'react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomerAlerts } from '@/hooks/useCustomerAdvanced';
import { ClienteAlerta } from '@/types/customer-advanced';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerAlertsManagerProps {
  clienteId: string;
  alerts: ClienteAlerta[];
}

export function CustomerAlertsManager({ clienteId, alerts }: CustomerAlertsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    tipo: 'personalizada' as ClienteAlerta['tipo_alerta'],
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: ''
  });
  
  const { addAlert, completeAlert } = useCustomerAlerts(clienteId);

  const handleAddAlert = async () => {
    if (!newAlert.titulo.trim() || !newAlert.fecha) return;
    
    try {
      await addAlert.mutateAsync({
        tipoAlerta: newAlert.tipo,
        titulo: newAlert.titulo,
        descripcion: newAlert.descripcion || undefined,
        fechaAlerta: newAlert.fecha,
        horaAlerta: newAlert.hora || undefined
      });
      
      setNewAlert({
        tipo: 'personalizada',
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: ''
      });
      setShowAddForm(false);
      toast.success('Alerta creada correctamente');
    } catch (error) {
      toast.error('Error al crear alerta');
    }
  };

  const handleCompleteAlert = async (alertId: string) => {
    try {
      await completeAlert.mutateAsync(alertId);
      toast.success('Alerta marcada como completada');
    } catch (error) {
      toast.error('Error al completar alerta');
    }
  };

  const getAlertTypeLabel = (type: ClienteAlerta['tipo_alerta']) => {
    const labels = {
      seguimiento: 'Seguimiento',
      cumpleanos: 'Cumpleaños',
      inactividad: 'Inactividad',
      personalizada: 'Personalizada'
    };
    return labels[type];
  };

  const getAlertTypeVariant = (type: ClienteAlerta['tipo_alerta']) => {
    const variants = {
      seguimiento: 'primary' as const,
      cumpleanos: 'secondary' as const,
      inactividad: 'occupied' as const,
      personalizada: 'neutral' as const
    };
    return variants[type];
  };

  const activeAlerts = alerts.filter(alert => !alert.completada);
  const completedAlerts = alerts.filter(alert => alert.completada);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="ios-text-headline">
          Alertas ({activeAlerts.length} activas, {completedAlerts.length} completadas)
        </h4>
        <IOSButton
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4" />
        </IOSButton>
      </div>

      {/* Formulario para añadir alerta */}
      {showAddForm && (
        <div className="p-4 bg-enigma-neutral-50 rounded-ios space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select 
              value={newAlert.tipo} 
              onValueChange={(value) => setNewAlert({...newAlert, tipo: value as ClienteAlerta['tipo_alerta']})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seguimiento">Seguimiento</SelectItem>
                <SelectItem value="cumpleanos">Cumpleaños</SelectItem>
                <SelectItem value="inactividad">Inactividad</SelectItem>
                <SelectItem value="personalizada">Personalizada</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Título de la alerta"
              value={newAlert.titulo}
              onChange={(e) => setNewAlert({...newAlert, titulo: e.target.value})}
              className="ios-input"
            />
          </div>
          
          <Textarea
            placeholder="Descripción (opcional)"
            value={newAlert.descripcion}
            onChange={(e) => setNewAlert({...newAlert, descripcion: e.target.value})}
            className="ios-input"
            rows={2}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={newAlert.fecha}
              onChange={(e) => setNewAlert({...newAlert, fecha: e.target.value})}
              className="ios-input"
            />
            <Input
              type="time"
              value={newAlert.hora}
              onChange={(e) => setNewAlert({...newAlert, hora: e.target.value})}
              className="ios-input"
            />
          </div>
          
          <div className="flex gap-2">
            <IOSButton
              variant="primary"
              size="sm"
              onClick={handleAddAlert}
              disabled={!newAlert.titulo.trim() || !newAlert.fecha || addAlert.isPending}
            >
              Crear Alerta
            </IOSButton>
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </IOSButton>
          </div>
        </div>
      )}

      {/* Alertas activas */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h5 className="ios-text-callout font-medium text-enigma-neutral-700">Alertas Activas</h5>
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-ios">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IOSBadge variant={getAlertTypeVariant(alert.tipo_alerta)}>
                      {getAlertTypeLabel(alert.tipo_alerta)}
                    </IOSBadge>
                    <IOSBadge variant="neutral">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(alert.fecha_alerta), 'dd/MM/yyyy', { locale: es })}
                      {alert.hora_alerta && ` ${alert.hora_alerta}`}
                    </IOSBadge>
                  </div>
                  <h6 className="ios-text-callout font-medium">{alert.titulo}</h6>
                  {alert.descripcion && (
                    <p className="ios-text-caption1 text-enigma-neutral-600 mt-1">
                      {alert.descripcion}
                    </p>
                  )}
                </div>
                <IOSButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCompleteAlert(alert.id)}
                  className="text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </IOSButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alertas completadas */}
      {completedAlerts.length > 0 && (
        <div className="space-y-3">
          <h5 className="ios-text-callout font-medium text-enigma-neutral-700">Alertas Completadas</h5>
          {completedAlerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="p-3 bg-green-50 border border-green-200 rounded-ios opacity-75">
              <div className="flex items-center gap-2 mb-1">
                <IOSBadge variant={getAlertTypeVariant(alert.tipo_alerta)}>
                  {getAlertTypeLabel(alert.tipo_alerta)}
                </IOSBadge>
                <IOSBadge variant="available">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completada
                </IOSBadge>
              </div>
              <h6 className="ios-text-callout font-medium">{alert.titulo}</h6>
            </div>
          ))}
          {completedAlerts.length > 5 && (
            <p className="ios-text-caption1 text-enigma-neutral-500 text-center">
              ... y {completedAlerts.length - 5} alertas completadas más
            </p>
          )}
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-6 text-enigma-neutral-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="ios-text-callout">No hay alertas configuradas para este cliente</p>
        </div>
      )}
    </div>
  );
}
