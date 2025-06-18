
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cliente } from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, Euro, Star, AlertTriangle } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerAnalyticsDashboardProps {
  clientes: Cliente[];
}

const COLORS = ['#237584', '#9FB289', '#CB5910', '#8B5CF6', '#EF4444'];

export function CustomerAnalyticsDashboard({ clientes }: CustomerAnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const ahora = new Date();
    const hace30Dias = subDays(ahora, 30);
    const hace90Dias = subDays(ahora, 90);
    const hace6Meses = subMonths(ahora, 6);

    // Estadísticas básicas
    const totalClientes = clientes.length;
    const clientesNuevos30dias = clientes.filter(c => 
      new Date(c.fecha_creacion) > hace30Dias
    ).length;
    const clientesVIP = clientes.filter(c => c.vip_status).length;
    const clientesConVisitas = clientes.filter(c => c.ultima_visita).length;
    const tasaRetencion = totalClientes > 0 ? (clientesConVisitas / totalClientes) * 100 : 0;

    // Segmentación RFM (Recency, Frequency, Monetary)
    const segmentacion = {
      nuevos: clientes.filter(c => new Date(c.fecha_creacion) > hace30Dias).length,
      regulares: clientes.filter(c => {
        const registro = new Date(c.fecha_creacion);
        const ultimaVisita = c.ultima_visita ? new Date(c.ultima_visita) : null;
        return registro <= hace30Dias && ultimaVisita && ultimaVisita > hace90Dias && !c.vip_status;
      }).length,
      vip: clientesVIP,
      enRiesgo: clientes.filter(c => {
        const ultimaVisita = c.ultima_visita ? new Date(c.ultima_visita) : null;
        return ultimaVisita && ultimaVisita <= hace90Dias && ultimaVisita > hace6Meses;
      }).length,
      perdidos: clientes.filter(c => {
        const ultimaVisita = c.ultima_visita ? new Date(c.ultima_visita) : null;
        return !ultimaVisita || ultimaVisita <= hace6Meses;
      }).length
    };

    // Datos para gráfico de adquisición mensual
    const ultimosSeisM = eachMonthOfInterval({
      start: hace6Meses,
      end: ahora
    });

    const adquisicionMensual = ultimosSeisM.map(mes => {
      const inicioMes = startOfMonth(mes);
      const finMes = endOfMonth(mes);
      const clientesDelMes = clientes.filter(c => {
        const fechaCreacion = new Date(c.fecha_creacion);
        return fechaCreacion >= inicioMes && fechaCreacion <= finMes;
      }).length;

      return {
        mes: format(mes, 'MMM', { locale: es }),
        clientes: clientesDelMes
      };
    });

    // Distribución por idioma
    const distribucionIdioma = clientes.reduce((acc, cliente) => {
      const idioma = cliente.idioma_preferido || 'es';
      acc[idioma] = (acc[idioma] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const datosIdioma = Object.entries(distribucionIdioma).map(([idioma, count]) => ({
      idioma: idioma === 'es' ? 'Español' : idioma === 'en' ? 'English' : idioma.toUpperCase(),
      value: count
    }));

    // Análisis de preferencias dietéticas
    const preferenciasDieteticas = clientes.reduce((acc, cliente) => {
      if (cliente.preferencias_dieteticas) {
        cliente.preferencias_dieteticas.forEach(pref => {
          acc[pref] = (acc[pref] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const topPreferencias = Object.entries(preferenciasDieteticas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pref, count]) => ({ preferencia: pref, count }));

    return {
      totalClientes,
      clientesNuevos30dias,
      clientesVIP,
      tasaRetencion,
      segmentacion,
      adquisicionMensual,
      datosIdioma,
      topPreferencias
    };
  }, [clientes]);

  const datosSegmentacion = [
    { name: 'Nuevos', value: analytics.segmentacion.nuevos, color: COLORS[1] },
    { name: 'Regulares', value: analytics.segmentacion.regulares, color: COLORS[0] },
    { name: 'VIP', value: analytics.segmentacion.vip, color: COLORS[2] },
    { name: 'En Riesgo', value: analytics.segmentacion.enRiesgo, color: COLORS[3] },
    { name: 'Perdidos', value: analytics.segmentacion.perdidos, color: COLORS[4] }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-enigma-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold">{analytics.totalClientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nuevos (30 días)</p>
                <p className="text-2xl font-bold">{analytics.clientesNuevos30dias}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
                <p className="text-2xl font-bold">{analytics.clientesVIP}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa Retención</p>
                <p className="text-2xl font-bold">{Math.round(analytics.tasaRetencion)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adquisición mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Adquisición de Clientes (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.adquisicionMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clientes" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segmentación de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentación de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosSegmentacion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosSegmentacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {datosSegmentacion.map((entry, index) => (
                <Badge
                  key={entry.name}
                  variant="outline"
                  className="flex items-center"
                  style={{ borderColor: entry.color }}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}: {entry.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por idioma */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Idioma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.datosIdioma.map((item, index) => (
                <div key={item.idioma} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.idioma}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(item.value / analytics.totalClientes) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top preferencias dietéticas */}
        <Card>
          <CardHeader>
            <CardTitle>Preferencias Dietéticas Más Comunes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPreferencias.map((item, index) => (
                <div key={item.preferencia} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.preferencia}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalClientes) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
            {analytics.topPreferencias.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay preferencias dietéticas registradas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights y recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Insights y Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.segmentacion.enRiesgo > 0 && (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="font-medium text-yellow-800">Clientes en Riesgo</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  {analytics.segmentacion.enRiesgo} clientes no han visitado en más de 90 días. 
                  Considera enviar una campaña de reactivación.
                </p>
              </div>
            )}

            {analytics.clientesNuevos30dias > 0 && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-800">Crecimiento Positivo</h4>
                </div>
                <p className="text-sm text-green-700">
                  {analytics.clientesNuevos30dias} nuevos clientes en los últimos 30 días. 
                  ¡Mantén el buen trabajo en adquisición!
                </p>
              </div>
            )}

            {analytics.clientesVIP > 0 && (
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-purple-800">Programa VIP</h4>
                </div>
                <p className="text-sm text-purple-700">
                  {analytics.clientesVIP} clientes VIP ({Math.round((analytics.clientesVIP / analytics.totalClientes) * 100)}% del total). 
                  Considera ofertas exclusivas para ellos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
