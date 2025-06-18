
import { useState, useMemo } from 'react';
import { useReservations } from './useReservations';

export function useReservationsPaginated(
  filters: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    searchTerm?: string;
  } = {},
  pageSize: number = 25
) {
  const [currentPage, setCurrentPage] = useState(0);
  
  const { data: reservations = [], isLoading, error } = useReservations({
    ...filters,
    limit: pageSize * 3, // Cargar 3 páginas por adelantado
    offset: Math.max(0, currentPage - 1) * pageSize,
  });

  // Filtrado local para búsqueda (más rápido que consulta DB)
  const filteredReservations = useMemo(() => {
    if (!filters.searchTerm) return reservations;
    
    const searchLower = filters.searchTerm.toLowerCase();
    return reservations.filter(reserva => {
      return (
        reserva.clientes?.nombre?.toLowerCase().includes(searchLower) ||
        reserva.clientes?.apellido?.toLowerCase().includes(searchLower) ||
        reserva.clientes?.email?.toLowerCase().includes(searchLower) ||
        reserva.clientes?.telefono?.includes(filters.searchTerm)
      );
    });
  }, [reservations, filters.searchTerm]);

  // Paginación local
  const paginatedReservations = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredReservations.slice(startIndex, startIndex + pageSize);
  }, [filteredReservations, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReservations.length / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  return {
    reservations: paginatedReservations,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setCurrentPage,
    isLoading,
    error,
    totalCount: filteredReservations.length,
  };
}
