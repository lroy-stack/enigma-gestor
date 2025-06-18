
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor ingresa email y contraseña",
        variant: "destructive",
      });
      return;
    }

    console.log('LoginForm - Attempting login for:', email);
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('LoginForm - Login error:', error);
        let errorMessage = "No se pudo iniciar sesión";
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Email o contraseña incorrectos";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Por favor confirma tu email antes de iniciar sesión";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Error de autenticación",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('LoginForm - Login successful, redirecting to dashboard');
        toast({
          title: "Éxito",
          description: "Has iniciado sesión correctamente",
        });
        // Redirect to dashboard after successful login
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('LoginForm - Login exception:', error);
      toast({
        title: "Error inesperado",
        description: error?.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-enigma-neutral-50 p-4">
      <div className="w-full max-w-sm">
        <IOSCard variant="elevated" className="bg-white shadow-lg">
          <IOSCardHeader className="text-center space-y-3 p-6">
            <div className="mx-auto w-16 h-16 bg-enigma-primary/10 rounded-full flex items-center justify-center">
              <img 
                src="/logo512.png" 
                alt="Enigma Logo" 
                className="w-14 h-14 rounded-full object-contain"
              />
            </div>
            
            <div className="space-y-1">
              <IOSCardTitle className="text-2xl font-bold text-enigma-neutral-800">
                Enigma
              </IOSCardTitle>
              <p className="text-sm text-enigma-neutral-600">
                Sistema de Gestión
              </p>
            </div>
          </IOSCardHeader>
          
          <IOSCardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-enigma-neutral-700 text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enigma-neutral-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                    className="h-11 pl-10 pr-4 bg-enigma-neutral-50 border-enigma-neutral-300 text-enigma-neutral-800 placeholder:text-enigma-neutral-500 rounded-lg focus:bg-white focus:border-enigma-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-enigma-neutral-700 text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enigma-neutral-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="h-11 pl-10 pr-10 bg-enigma-neutral-50 border-enigma-neutral-300 text-enigma-neutral-800 placeholder:text-enigma-neutral-500 rounded-lg focus:bg-white focus:border-enigma-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-enigma-neutral-500 hover:text-enigma-neutral-700" />
                    ) : (
                      <Eye className="h-4 w-4 text-enigma-neutral-500 hover:text-enigma-neutral-700" />
                    )}
                  </button>
                </div>
              </div>
              
              <IOSButton 
                type="submit" 
                variant="primary"
                className="w-full h-11 text-sm font-semibold bg-enigma-primary hover:bg-enigma-primary/90 text-white mt-6" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </IOSButton>
            </form>
            
            <div className="mt-6 p-3 bg-enigma-neutral-100 rounded-lg border border-enigma-neutral-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-enigma-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-enigma-neutral-700 space-y-1">
                  <p className="font-medium text-enigma-neutral-800">Datos de prueba:</p>
                  <p className="break-all">Email: l.roy.lwe@gmail.com</p>
                  <p>Contraseña: Tu contraseña configurada</p>
                </div>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>
    </div>
  );
}
