
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Users, Grid3X3, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'client' | 'reservation' | 'table';
  title: string;
  subtitle: string;
  badge?: string;
}

interface QuickSearchWidgetProps {
  onSearch?: (query: string) => Promise<SearchResult[]>;
}

export function QuickSearchWidget({ onSearch }: QuickSearchWidgetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      if (onSearch) {
        const searchResults = await onSearch(searchQuery);
        setResults(searchResults);
        setIsOpen(true);
      } else {
        // Mock results for demo
        const mockResults: SearchResult[] = [
          {
            id: '1',
            type: 'client',
            title: 'Juan Pérez',
            subtitle: 'juan@email.com • 666 123 456',
            badge: 'VIP'
          },
          {
            id: '2',
            type: 'reservation',
            title: 'Reserva #1234',
            subtitle: 'Hoy 20:00 • 4 personas',
            badge: 'Confirmada'
          }
        ];
        setResults(mockResults.filter(r => 
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    const icons = {
      client: Users,
      reservation: Calendar,
      table: Grid3X3
    };
    return icons[type as keyof typeof icons] || Search;
  };

  const handleResultClick = (result: SearchResult) => {
    const routes = {
      client: `/clientes/${result.id}`,
      reservation: `/reservas/${result.id}`,
      table: `/mesas`
    };
    navigate(routes[result.type]);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes, reservas, mesas..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Dropdown de Resultados */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-enigma-primary mx-auto"></div>
                  <p className="mt-2 text-sm">Buscando...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron resultados</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((result) => {
                    const Icon = getResultIcon(result.type);
                    return (
                      <button
                        key={result.id}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                        onClick={() => handleResultClick(result)}
                      >
                        <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {result.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {result.subtitle}
                          </div>
                        </div>
                        {result.badge && (
                          <Badge variant="outline" className="text-xs">
                            {result.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
