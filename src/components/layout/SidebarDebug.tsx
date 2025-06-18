import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  Grid3X3, 
  LayoutDashboard,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarDebugProps {
  isOpen: boolean;
  onClose: () => void;
  isPersistent?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Reservas',
    href: '/reservas',
    icon: Calendar,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    name: 'Mesas',
    href: '/mesas',
    icon: Grid3X3,
  },
];

export function SidebarDebug({ isOpen, onClose, isPersistent = false, isCollapsed = false, onToggleCollapse }: SidebarDebugProps) {
  const location = useLocation();

  console.log('🔍 SidebarDebug render:', { 
    isOpen, 
    isPersistent, 
    isCollapsed, 
    hasOnClose: !!onClose,
    hasOnToggleCollapse: !!onToggleCollapse,
    pathname: location.pathname
  });

  // Función de toggle con logging extensivo
  const handleToggle = () => {
    try {
      console.log('🔄 handleToggle called');
      console.log('🔄 onToggleCollapse exists:', !!onToggleCollapse);
      console.log('🔄 typeof onToggleCollapse:', typeof onToggleCollapse);
      
      if (onToggleCollapse) {
        console.log('🔄 Calling onToggleCollapse...');
        onToggleCollapse();
        console.log('🔄 onToggleCollapse completed successfully');
      } else {
        console.error('❌ onToggleCollapse is not defined');
      }
    } catch (error) {
      console.error('💥 Error in handleToggle:', error);
    }
  };

  const handleClose = () => {
    try {
      console.log('🚪 handleClose called');
      if (onClose) {
        console.log('🚪 Calling onClose...');
        onClose();
        console.log('🚪 onClose completed successfully');
      } else {
        console.error('❌ onClose is not defined');
      }
    } catch (error) {
      console.error('💥 Error in handleClose:', error);
    }
  };

  // Only render when explicitly opened or persistent
  if (!isOpen && !isPersistent) {
    console.log('🚫 SidebarDebug not rendering (not open and not persistent)');
    return null;
  }

  console.log('✅ SidebarDebug rendering...');

  return (
    <>
      {/* Overlay solo para modo no persistente */}
      {!isPersistent && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md transition-all duration-300"
          onClick={handleClose}
        />
      )}

      {/* Sidebar simplificado */}
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 bg-white shadow-lg transition-all duration-300 ease-out",
          isPersistent && isCollapsed ? "w-20" : "w-80",
          !isPersistent && "max-w-[85vw]",
          isPersistent ? "translate-x-0" : (isOpen ? "translate-x-0" : "-translate-x-full")
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header simple */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-gray-900">Menú</h2>
            )}
            
            {isPersistent && onToggleCollapse ? (
              <button
                onClick={handleToggle}
                className={cn(
                  "p-2 rounded-lg hover:bg-gray-100 transition-colors",
                  isCollapsed && "mx-auto"
                )}
                title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                )}
              </button>
            ) : !isPersistent && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation simple */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors",
                    isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100",
                    isCollapsed ? "justify-center" : "space-x-3"
                  )}
                  onClick={handleClose}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}