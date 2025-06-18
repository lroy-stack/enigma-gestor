
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  reservas: 'Reservas',
  clientes: 'Clientes',
  mesas: 'Mesas',
  analiticas: 'Analíticas',
  configuracion: 'Configuración',
  nueva: 'Nueva',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-enigma-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[pathname] || pathname;

        return (
          <div key={pathname} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{displayName}</span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-enigma-primary transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
