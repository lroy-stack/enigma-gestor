
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { MainLayout } from "./components/layout/MainLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { lazy, Suspense } from "react";

// Lazy load páginas para reducir el bundle inicial
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reservas = lazy(() => import("./pages/Reservas"));
const Mesas = lazy(() => import("./pages/Mesas"));
const Clientes = lazy(() => import("./pages/Clientes"));
const ClientesEnhanced = lazy(() => import("./pages/ClientesEnhanced"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Notificaciones = lazy(() => import("./pages/Notificaciones"));
const Configuracion = lazy(() => import("./pages/Configuracion"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Ayuda = lazy(() => import("./pages/Ayuda"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componente de loading para las páginas
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-enigma-neutral-50">
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-r from-enigma-primary to-enigma-secondary rounded-ios mx-auto mb-4 animate-pulse" />
      <p className="text-enigma-neutral-600">Cargando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="reservas" element={<Suspense fallback={<PageLoader />}><Reservas /></Suspense>} />
              <Route path="mesas" element={<Suspense fallback={<PageLoader />}><Mesas /></Suspense>} />
              <Route path="clientes" element={<Suspense fallback={<PageLoader />}><Clientes /></Suspense>} />
              <Route path="clientes-enhanced" element={<Suspense fallback={<PageLoader />}><ClientesEnhanced /></Suspense>} />
              <Route path="analiticas" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
              <Route path="notificaciones" element={<Suspense fallback={<PageLoader />}><Notificaciones /></Suspense>} />
              <Route path="configuracion" element={<Suspense fallback={<PageLoader />}><Configuracion /></Suspense>} />
              <Route path="usuarios" element={<Suspense fallback={<PageLoader />}><Usuarios /></Suspense>} />
              <Route path="ayuda" element={<Suspense fallback={<PageLoader />}><Ayuda /></Suspense>} />
              <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
