
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Personal {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  personal: Personal | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función separada para obtener datos del personal
  const obtenerDatosPersonal = useCallback(async (userId: string) => {
    console.log('AuthProvider - Fetching personal data for user:', userId);
    try {
      const { data, error } = await supabase
        .from('personal')
        .select('*')
        .eq('user_id', userId)
        .eq('activo', true)
        .single();
      
      if (error) {
        console.error('AuthProvider - Error fetching personal data:', error);
        if (error.code === 'PGRST116') {
          console.log('AuthProvider - No personal record found for user');
        }
        return null;
      }
      
      console.log('AuthProvider - Personal data retrieved:', data);
      return data;
    } catch (error) {
      console.error('AuthProvider - Exception fetching personal data:', error);
      return null;
    }
  }, []);

  // Effect para cargar datos del personal cuando cambia el usuario
  useEffect(() => {
    if (!user || !isInitialized) return;
    
    let isMounted = true;
    
    const loadPersonalData = async () => {
      const personalData = await obtenerDatosPersonal(user.id);
      if (isMounted) {
        setPersonal(personalData);
      }
    };
    
    loadPersonalData();
    
    return () => {
      isMounted = false;
    };
  }, [user, obtenerDatosPersonal, isInitialized]);

  useEffect(() => {
    console.log('AuthProvider - Initializing...');
    
    let isMounted = true;

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider - Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('AuthProvider - Error getting session:', error);
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        console.log('AuthProvider - Initial session:', session?.user?.id || 'No session');
        setUser(session?.user ?? null);
        setLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('AuthProvider - Exception getting initial session:', error);
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('AuthProvider - Auth state change:', event, session?.user?.id || 'No user');
        
        setUser(session?.user ?? null);
        if (!session?.user) {
          setPersonal(null);
        }
        
        if (isInitialized) {
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthProvider - Cleaning up subscription');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider - Attempting sign in for:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthProvider - Sign in error:', error);
      } else {
        console.log('AuthProvider - Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('AuthProvider - Sign in exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('AuthProvider - Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthProvider - Sign out error:', error);
      throw error;
    }
    // Limpiar estado inmediatamente
    setUser(null);
    setPersonal(null);
    console.log('AuthProvider - Sign out successful');
  };

  const value = {
    user,
    personal,
    loading,
    signIn,
    signOut,
  };

  console.log('AuthProvider - Current state:', {
    hasUser: !!user,
    hasPersonal: !!personal,
    loading,
    isInitialized,
    userId: user?.id
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
