import React, { useEffect, useRef } from 'react';
import { User, Settings, LogOut, Shield, HelpCircle, Moon, Bell } from 'lucide-react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Colores Enigma
const ENIGMA_COLORS = {
  primary: '#237584',
  secondary: '#9FB289',
  accent: '#CB5910',
  analytics: '#007AFF'
} as const;

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Cerrar con tecla Escape
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Pequeño delay para evitar cerrar inmediatamente al abrir
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      console.log('ProfileDropdown - Iniciando logout...');
      await signOut();
      console.log('ProfileDropdown - Logout exitoso');
      onClose(); // Cerrar el dropdown después del logout exitoso
      // MainLayout se encarga de la redirección automáticamente
    } catch (error) {
      console.error('ProfileDropdown - Error al cerrar sesión:', error);
      onClose(); // Cerrar dropdown incluso si hay error
    }
  };

  const handleNavigation = (path: string) => {
    onClose();
    // Usar window.location para navegación simple
    window.location.href = path;
  };

  const userEmail = user?.email || 'usuario@enigma.com';
  const userName = userEmail.split('@')[0];
  const userRole = 'Administrador'; // Esto vendría del usuario real

  const menuItems = [
    {
      icon: Settings,
      label: 'Configuración',
      description: 'Ajustes del sistema',
      action: () => handleNavigation('/configuracion'),
      color: ENIGMA_COLORS.primary
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      description: 'Preferencias de alertas',
      action: () => handleNavigation('/notificaciones'),
      color: ENIGMA_COLORS.secondary
    },
    {
      icon: Shield,
      label: 'Seguridad',
      description: 'Contraseña y acceso',
      action: () => handleNavigation('/seguridad'),
      color: ENIGMA_COLORS.accent
    },
    {
      icon: HelpCircle,
      label: 'Ayuda',
      description: 'Soporte y documentación',
      action: () => handleNavigation('/ayuda'),
      color: '#AF52DE'
    }
  ];

  return (
    <>
      {/* Overlay modernizado */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Dropdown ultra moderno */}
      <div 
        ref={dropdownRef}
        className="fixed top-20 right-4 z-50 w-80 max-w-[90vw] rounded-3xl overflow-hidden transition-all duration-300 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(40px) saturate(180%) brightness(110%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(110%)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: `
            0 25px 50px rgba(0,0,0,0.3),
            0 10px 20px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.7)
          `
        }}
      >
        {/* Efecto de brillo superior */}
        <div 
          className="absolute top-0 left-4 right-4 h-px opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
          }}
        />
        
        {/* Gradiente de fondo dinámico */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, ${ENIGMA_COLORS.primary}40 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${ENIGMA_COLORS.secondary}40 0%, transparent 50%)
            `
          }}
        />
        {/* User Info Header modernizado */}
        <div 
          className="p-6 relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${ENIGMA_COLORS.primary}, ${ENIGMA_COLORS.secondary})`
          }}
        >
          {/* Efectos de fondo */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
            }}
          />
          
          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              {/* Brillo interno */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <User size={28} className="text-white relative z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {userName}
              </h3>
              <p className="text-sm text-white/80 truncate">
                {userEmail}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  {userRole}
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #34C759, #30D158)',
                      boxShadow: '0 0 8px rgba(52, 199, 89, 0.6)'
                    }}
                  />
                  <span className="text-xs text-white/80 font-medium">En línea</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items modernizados */}
        <div className="p-3 relative">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={cn(
                "w-full p-3 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                "active:scale-95 hover:scale-102 mb-1"
              )}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${item.color}15, ${item.color}10)`;
                e.currentTarget.style.borderColor = `${item.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden group-active:scale-90 shadow-sm"
                  style={{ 
                    backgroundColor: `${item.color}20`,
                    border: `1px solid ${item.color}30`
                  }}
                >
                  {/* Brillo interno sutil */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-20"
                    style={{ 
                      background: `radial-gradient(circle at center, ${item.color}40, transparent 70%)`
                    }}
                  />
                  <item.icon 
                    size={20} 
                    className="relative z-10 transition-all duration-200"
                    style={{ color: item.color }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800 group-hover:opacity-90 transition-all duration-200">
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5 group-hover:opacity-80 transition-all duration-200">
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Divider modernizado */}
        <div 
          className="h-px mx-4 mb-2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
          }}
        />

        {/* Logout Section modernizado */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full p-3 rounded-2xl transition-all duration-200 group relative overflow-hidden",
              "active:scale-95 hover:scale-102"
            )}
            style={{
              background: 'linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,59,48,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,59,48,0.15) 0%, rgba(255,59,48,0.1) 100%)';
              e.currentTarget.style.borderColor = 'rgba(255,59,48,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.05) 100%)';
              e.currentTarget.style.borderColor = 'rgba(255,59,48,0.2)';
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden group-active:scale-90 shadow-sm"
                style={{ 
                  backgroundColor: 'rgba(255,59,48,0.2)',
                  border: '1px solid rgba(255,59,48,0.3)'
                }}
              >
                {/* Brillo interno */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-20"
                  style={{ 
                    background: 'radial-gradient(circle at center, rgba(255,59,48,0.4), transparent 70%)'
                  }}
                />
                <LogOut 
                  size={20} 
                  className="text-red-600 relative z-10 transition-all duration-200"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-red-600 group-hover:opacity-90 transition-all duration-200">
                  Cerrar Sesión
                </div>
                <div className="text-sm text-red-500 mt-0.5 group-hover:opacity-80 transition-all duration-200">
                  Salir del sistema de gestión
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Info modernizado */}
        <div 
          className="p-4 relative"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div 
            className="text-center p-3 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          >
            {/* Brillo superior */}
            <div 
              className="absolute top-0 left-4 right-4 h-px opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
              }}
            />
            
            <div className="relative z-10">
              <div className="text-xs text-gray-600 font-medium">
                Enigma Cocina con Alma
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Versión 2.0.0 • Glassmorphismo iOS • {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}