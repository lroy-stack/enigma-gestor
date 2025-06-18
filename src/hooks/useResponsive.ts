
import { useState, useEffect } from 'react';

interface BreakpointValues {
  isMobile: boolean;
  isMobileLarge: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
  isPortrait: boolean;
  // Utilidades específicas
  isTabletHorizontal: boolean;
  isMobileDevice: boolean;
}

export function useResponsive(): BreakpointValues {
  const [values, setValues] = useState<BreakpointValues>({
    isMobile: true,
    isMobileLarge: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    isLandscape: false,
    isPortrait: true,
    isTabletHorizontal: false,
    isMobileDevice: true,
  });

  useEffect(() => {
    const updateValues = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isPortrait = height > width;
      
      // Detección de dispositivos táctiles reales
      const isTouchDevice = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
      
      // Detección de dispositivos móviles por User Agent
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTabletUserAgent = /iPad|Android.*Tablet|PlayBook|Kindle|Silk|^.*Android.*(?!.*Mobile).*$/i.test(navigator.userAgent);
      
      // Lógica mejorada de detección de dispositivos
      const isMobile = width < 768;
      const isMobileLarge = width >= 480 && width < 768;
      
      // Una tablet es considerada como tal si:
      // 1. Tiene ancho entre 768-1366px Y es dispositivo táctil
      // 2. O es detectada como tablet por user agent
      // 3. O tiene ancho < 1024px Y es dispositivo táctil
      const isTablet = (
        (width >= 768 && width <= 1366 && isTouchDevice) ||
        isTabletUserAgent ||
        (width >= 768 && width < 1024)
      );
      
      // Desktop solo si NO es dispositivo táctil Y tiene ancho >= 1024px
      // O si es un dispositivo táctil muy grande (>1366px)
      const isDesktop = (!isTouchDevice && width >= 1024) || (width > 1366);
      const isLargeDesktop = (!isTouchDevice && width >= 1280) || (width > 1536);
      
      // Utilidades específicas
      const isTabletHorizontal = isTablet && isLandscape;
      const isMobileDevice = isMobile || isMobileLarge || (isTouchDevice && !isTablet);
      
      // Debug info para tablets
      if (isTablet || isDesktop) {
        console.log('🔍 Device Detection Debug:', {
          width,
          height,
          isTouchDevice,
          isMobileUserAgent,
          isTabletUserAgent,
          userAgent: navigator.userAgent,
          isMobile,
          isTablet,
          isDesktop,
          isLargeDesktop,
          maxTouchPoints: navigator.maxTouchPoints
        });
      }

      setValues({
        isMobile,
        isMobileLarge,
        isTablet,
        isDesktop,
        isLargeDesktop,
        screenWidth: width,
        screenHeight: height,
        isLandscape,
        isPortrait,
        isTabletHorizontal,
        isMobileDevice,
      });
    };

    // Initial call
    updateValues();

    // Event listener for resize
    window.addEventListener('resize', updateValues);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateValues);
  }, []);

  return values;
}

// Utility function for responsive class names
export function getResponsiveClasses(base: string, responsive: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  largeDesktop?: string;
}): string {
  const classes = [base];
  
  if (responsive.mobile) classes.push(`${responsive.mobile}`);
  if (responsive.tablet) classes.push(`md:${responsive.tablet}`);
  if (responsive.desktop) classes.push(`lg:${responsive.desktop}`);
  if (responsive.largeDesktop) classes.push(`xl:${responsive.largeDesktop}`);
  
  return classes.join(' ');
}

// Breakpoint detection utilities
export const BREAKPOINTS = {
  mobile: 0,
  mobileLarge: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
  extraLarge: 1536,
} as const;

// Nuevos breakpoints para detección táctil
export const TOUCH_BREAKPOINTS = {
  mobile: 768,      // < 768px = móvil
  tablet: 1366,     // 768px - 1366px + táctil = tablet
  desktop: 1367,    // > 1366px o sin táctil = desktop
} as const;

export function getCurrentBreakpoint(width: number): keyof typeof BREAKPOINTS {
  if (width >= BREAKPOINTS.extraLarge) return 'extraLarge';
  if (width >= BREAKPOINTS.largeDesktop) return 'largeDesktop';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}
