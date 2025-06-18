
import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

// Lazy load los dropdowns para reducir el tamaño del bundle inicial
const NotificationsDropdown = lazy(() => import('./NotificationsDropdown').then(module => ({ default: module.NotificationsDropdown })));
const ProfileDropdown = lazy(() => import('./ProfileDropdown').then(module => ({ default: module.ProfileDropdown })));

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
}

export function Header({ onMenuClick, sidebarOpen = false, sidebarCollapsed = false }: HeaderProps) {
  const { user } = useAuth();
  const { screenWidth, isDesktop, isLargeDesktop } = useResponsive();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hook para el scroll y hide/show del header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Lógica para mostrar/ocultar header
      if (currentScrollY < 10) {
        // Siempre mostrar en la parte superior
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Ocultar al hacer scroll hacia abajo
        setIsVisible(false);
        closeDropdowns(); // Cerrar dropdowns al ocultar
      } else if (currentScrollY < lastScrollY) {
        // Mostrar al hacer scroll hacia arriba
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  const closeDropdowns = () => {
    setShowNotifications(false);
    setShowProfile(false);
  };

  // Calcular opacidad y blur basado en scroll
  const headerOpacity = Math.min(scrollY / 100, 0.95);
  const blurIntensity = Math.min(scrollY / 50, 20);

  // En desktop, siempre debemos dejar espacio para el sidebar
  const shouldAdjustForSidebar = (isDesktop || isLargeDesktop);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 transition-all duration-300 ease-out",
        // Responsive positioning con sidebar
        "left-0 right-0",
        // Margin left responsive para evitar solapamiento con sidebar
        shouldAdjustForSidebar ? 
          (sidebarCollapsed ? "lg:ml-20" : "lg:ml-80") : "",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
      style={{
        background: `linear-gradient(135deg, 
          rgba(255,255,255,${0.15 + headerOpacity * 0.8}) 0%, 
          rgba(255,255,255,${0.1 + headerOpacity * 0.85}) 100%)`,
        backdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
        borderBottom: `1px solid rgba(255,255,255,${0.2 + headerOpacity * 0.3})`,
        boxShadow: scrollY > 10 
          ? `0 8px 32px rgba(0,0,0,${0.02 + headerOpacity * 0.08})` 
          : 'none'
      }}
    >
      {/* Efecto de brillo superior */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
        }}
      />
      
      {/* Gradiente de fondo dinámico Enigma */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, #23758420 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, #9FB28920 0%, transparent 50%)
          `
        }}
      />

      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-screen-2xl mx-auto relative">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {/* Menu button - Solo en móvil/tablet */}
          {!shouldAdjustForSidebar && (
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-2xl hover:bg-white/20 active:scale-95 transition-all duration-200 backdrop-blur-sm"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          )}


          {/* Logo y título modernizados - Solo cuando sidebar no está visible o está colapsado */}
          {(!shouldAdjustForSidebar || sidebarCollapsed) && (
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden bg-white"
                style={{
                  boxShadow: '0 4px 12px rgba(35, 117, 132, 0.3)'
                }}
              >
                {/* Efecto de brillo interno */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                />
                <img 
                  src="/logo512.png" 
                  alt="Enigma Logo" 
                  className="w-7 h-7 relative z-10"
                />
              </div>
              
              {/* Título responsive */}
              <div className="hidden sm:block">
                <h1 className="text-gray-800 font-bold text-lg leading-none tracking-tight">
                  {screenWidth >= 1024 ? 'Enigma Cocina con Alma' : 'Enigma'}
                </h1>
                <p className="text-gray-500 text-xs leading-none mt-0.5 font-medium">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search button moderno */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex w-10 h-10 p-0 rounded-2xl hover:bg-white/20 active:scale-95 transition-all duration-200 backdrop-blur-sm"
          >
            <Search className="h-5 w-5 text-gray-700" />
          </Button>

          {/* Notificaciones modernizadas */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "relative w-10 h-10 p-0 rounded-2xl transition-all duration-200 backdrop-blur-sm",
              "hover:bg-white/20 active:scale-95",
              showNotifications && "bg-white/30"
            )}
            onClick={handleNotificationsClick}
          >
            <Bell className="h-5 w-5 text-gray-700" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <div 
                  className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #CB5910, #FF6B35)',
                    boxShadow: '0 2px 8px rgba(203, 89, 16, 0.4)'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              </div>
            )}
          </Button>

          {/* Perfil de usuario modernizado */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-10 px-3 rounded-2xl transition-all duration-200 backdrop-blur-sm",
              "hover:bg-white/20 active:scale-95",
              showProfile && "bg-white/30"
            )}
            onClick={handleProfileClick}
          >
            <div 
              className="w-7 h-7 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #237584, #2A7F8A)',
                boxShadow: '0 2px 8px rgba(35, 117, 132, 0.3)'
              }}
            >
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <User className="h-4 w-4 text-white relative z-10" />
            </div>
            {screenWidth >= 768 && (
              <span className="text-gray-700 text-sm font-medium">
                {user?.email?.split('@')[0] || 'Usuario'}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Dropdowns */}
      <Suspense fallback={<div className="fixed top-16 right-4 z-50 bg-white/95 backdrop-blur-ios rounded-ios-lg shadow-ios-2xl p-4">Cargando...</div>}>
        <NotificationsDropdown 
          isOpen={showNotifications} 
          onClose={closeDropdowns} 
        />
      </Suspense>
      <Suspense fallback={<div className="fixed top-16 right-4 z-50 bg-white/95 backdrop-blur-ios rounded-ios-lg shadow-ios-2xl p-4">Cargando...</div>}>
        <ProfileDropdown 
          isOpen={showProfile} 
          onClose={closeDropdowns} 
        />
      </Suspense>
    </header>
  );
}
