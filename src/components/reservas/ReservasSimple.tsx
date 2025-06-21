import React from 'react';
import { useReservas, useReservasHoy, useEstadisticasReservas } from '@/hooks/useReservasSimple';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ReservasSimple() {
  const { data: reservas, isLoading, error } = useReservas();
  const { data: reservasHoy } = useReservasHoy();
  const { data: estadisticas } = useEstadisticasReservas();

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Reservas</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Reservas</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar reservas</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Verifica que la tabla 'reservas' existe y tiene los campos correctos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Reservas</h2>
      
      {/* Estadísticas del día */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Total Hoy</h3>
            <p className="text-2xl font-bold text-blue-900">{estadisticas.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600">Pendientes</h3>
            <p className="text-2xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Confirmadas</h3>
            <p className="text-2xl font-bold text-green-900">{estadisticas.confirmadas}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Total Personas</h3>
            <p className="text-2xl font-bold text-purple-900">{estadisticas.total_personas}</p>
          </div>
        </div>
      )}

      {/* Reservas de hoy */}
      {reservasHoy && reservasHoy.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Reservas de Hoy</h3>
          <div className="grid gap-3">
            {reservasHoy.map((reserva) => (
              <div key={reserva.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{reserva.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      {reserva.hora_reserva} • {reserva.personas} personas
                    </p>
                    <p className="text-sm text-gray-500">{reserva.telefono}</p>
                    {reserva.ocasion && (
                      <p className="text-sm text-gray-500">Ocasión: {reserva.ocasion}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reserva.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todas las reservas */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Todas las Reservas ({reservas?.length || 0})</h3>
        {reservas && reservas.length > 0 ? (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservas.slice(0, 20).map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reserva.nombre}</div>
                          {reserva.ocasion && (
                            <div className="text-sm text-gray-500">{reserva.ocasion}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(reserva.fecha_reserva), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="text-sm text-gray-500">{reserva.hora_reserva}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.personas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                          reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{reserva.telefono}</div>
                        <div>{reserva.email}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay reservas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}