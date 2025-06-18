
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Users, Grid3X3, BarChart3 } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';

// Colores oficiales de Enigma del proyecto
const ENIGMA_COLORS = {
  primary: '#237584',
  secondary: '#9FB289', 
  accent: '#CB5910',
  analytics: '#007AFF'
} as const;

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    label: 'Panel',
    color: ENIGMA_COLORS.primary
  },
  {
    name: 'Reservas',
    href: '/reservas',
    icon: Calendar,
    label: 'Reservas',
    color: ENIGMA_COLORS.secondary
  },
  {
    name: 'Mesas',
    href: '/mesas',
    icon: Grid3X3,
    label: 'Mesas',
    color: ENIGMA_COLORS.accent
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    label: 'Clientes',
    color: ENIGMA_COLORS.analytics
  },
];

const TabButton = ({ icon: Icon, label, isActive, onClick, badge, color }: {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
  color: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center rounded-2xl",
      "transition-all duration-200 group touch-manipulation",
      // Tamaños responsivos para mejor accesibilidad táctil
      "w-16 h-16 sm:w-18 sm:h-16", // Mínimo 44px para accesibilidad
      "active:scale-95 hover:scale-[1.02]"
    )}
    style={{
      background: isActive 
        ? `linear-gradient(135deg, ${color}20, ${color}12)`
        : 'rgba(255,255,255,0.08)',
      border: isActive 
        ? `1px solid ${color}25` 
        : '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      boxShadow: isActive 
        ? `0 4px 12px ${color}25, inset 0 1px 0 rgba(255,255,255,0.3)`
        : 'inset 0 1px 0 rgba(255,255,255,0.2)'
    }}
  >
    <div className="relative z-10 flex flex-col items-center gap-1">
      {/* Icono con mejor contraste */}
      <Icon 
        className={cn(
          "transition-all duration-200",
          isActive ? "w-6 h-6" : "w-5 h-5"
        )}
        strokeWidth={isActive ? 2.5 : 2.2}
        style={{
          color: isActive ? color : '#374151',
          filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.1))`
        }}
      />
      
      {/* Badge de notificaciones mejorado */}
      {badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 z-20">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ 
              background: `linear-gradient(135deg, ${ENIGMA_COLORS.accent}, #E85D20)`,
              boxShadow: `0 2px 6px ${ENIGMA_COLORS.accent}40`,
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            {badge > 9 ? '9+' : badge}
          </div>
        </div>
      )}
      
      {/* Etiqueta con mejor legibilidad */}
      <span 
        className={cn(
          "text-[10px] font-semibold transition-all duration-200 leading-none mt-0.5",
          isActive ? "opacity-100" : "opacity-85"
        )}
        style={{
          color: isActive ? color : '#374151',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}
      >
        {label}
      </span>
    </div>

  </button>
);

export function BottomNavigation() {
  const location = useLocation();
  const { isDesktop, isLargeDesktop } = useResponsive();
  
  // Solo ocultar en desktop real (no touch)
  const shouldHide = isDesktop || isLargeDesktop;
  
  // Debug temporal para tablets
  console.log('📱 BottomNavigation Debug:', {
    isDesktop,
    isLargeDesktop,
    shouldHide,
    pathname: location.pathname
  });
  
  if (shouldHide) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 sm:bottom-6">
      {/* Contenedor principal con glassmorphismo translúcido mejorado */}
      <div 
        className="backdrop-blur-2xl rounded-[28px] px-2 py-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.4)
          `
        }}
      >
        {/* Línea de brillo superior translúcida */}
        <div 
          className="absolute top-0 left-8 right-8 h-px opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
          }}
        />
        
        {/* Contenedor de navegación con mejor accesibilidad */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link key={item.name} to={item.href}>
                <TabButton
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                  onClick={() => {}}
                  color={item.color}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
