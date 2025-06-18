
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PersonalData {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'manager' | 'staff' | 'host';
  activo: boolean;
  avatar_url?: string;
  created_at: string;
  // Auth user data
  auth_user?: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
    email_confirmed_at?: string;
  };
  // Calculated fields
  sessions_today?: number;
  activity_today?: number;
  total_sessions?: number;
  avg_session_time?: number;
  two_factor_enabled?: boolean;
  preferred_language?: string;
  timezone?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  onlineUsers: number;
  admins: number;
  managers: number;
  staff: number;
  hosts: number;
  totalSessions: number;
  avgActivity: number;
  twoFactorEnabled: number;
}

export interface RoleDefinition {
  id: string;
  name: string;
  color: string;
  description: string;
  permissions: string;
  userCount?: number;
}

export function useUserManagement() {
  const [users, setUsers] = useState<PersonalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PersonalData | null>(null);
  const { toast } = useToast();

  const roleDefinitions: RoleDefinition[] = [
    {
      id: 'admin',
      name: 'Administrador',
      color: '#FF3B30',
      description: 'Control total del sistema',
      permissions: 'Todos los permisos'
    },
    {
      id: 'manager',
      name: 'Manager',
      color: '#FF9500',
      description: 'Gestión de operaciones',
      permissions: 'Reservas, mesas, reportes'
    },
    {
      id: 'staff',
      name: 'Personal',
      color: '#34C759',
      description: 'Operaciones básicas',
      permissions: 'Reservas básicas'
    },
    {
      id: 'host',
      name: 'Anfitrión',
      color: '#8E8E93',
      description: 'Recepción y atención',
      permissions: 'Solo reservas y mesas'
    }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from personal table with auth user data
      const { data: personalData, error: personalError } = await supabase
        .from('personal')
        .select('*')
        .order('created_at', { ascending: false });

      if (personalError) throw personalError;

      // For each personal record, try to get auth user data
      const usersWithAuthData = await Promise.all(
        personalData.map(async (person) => {
          try {
            // Get auth user data (this may not work with RLS, but we'll try)
            const { data: authUser } = await supabase.auth.admin.getUserById(person.user_id);
            
            return {
              ...person,
              rol: person.rol as PersonalData['rol'], // Type assertion to fix the role type
              auth_user: authUser.user ? {
                id: authUser.user.id,
                email: authUser.user.email || '',
                created_at: authUser.user.created_at,
                last_sign_in_at: authUser.user.last_sign_in_at,
                email_confirmed_at: authUser.user.email_confirmed_at,
              } : undefined,
              // Mock data for now - in real implementation these would come from actual tracking
              sessions_today: Math.floor(Math.random() * 5) + 1,
              activity_today: Math.floor(Math.random() * 50) + 10,
              total_sessions: Math.floor(Math.random() * 200) + 50,
              avg_session_time: Math.floor(Math.random() * 60) + 30,
              two_factor_enabled: Math.random() > 0.5,
              preferred_language: 'es',
              timezone: 'Europe/Madrid'
            } as PersonalData;
          } catch (error) {
            console.warn('Could not fetch auth data for user:', person.user_id);
            return {
              ...person,
              rol: person.rol as PersonalData['rol'], // Type assertion to fix the role type
              sessions_today: Math.floor(Math.random() * 5) + 1,
              activity_today: Math.floor(Math.random() * 50) + 10,
              total_sessions: Math.floor(Math.random() * 200) + 50,
              avg_session_time: Math.floor(Math.random() * 60) + 30,
              two_factor_enabled: Math.random() > 0.5,
              preferred_language: 'es',
              timezone: 'Europe/Madrid'
            } as PersonalData;
          }
        })
      );

      setUsers(usersWithAuthData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los usuarios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, activo: boolean) => {
    try {
      const { error } = await supabase
        .from('personal')
        .update({ activo })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, activo } : user
      ));

      toast({
        title: 'Éxito',
        description: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el estado del usuario',
        variant: 'destructive'
      });
    }
  };

  const updateUserRole = async (userId: string, rol: PersonalData['rol']) => {
    try {
      const { error } = await supabase
        .from('personal')
        .update({ rol })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, rol } : user
      ));

      toast({
        title: 'Éxito',
        description: 'Rol actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el rol del usuario',
        variant: 'destructive'
      });
    }
  };

  const createUser = async (userData: {
    nombre: string;
    apellido: string;
    email: string;
    rol: PersonalData['rol'];
    password: string;
  }) => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Then create personal record
      const { error: personalError } = await supabase
        .from('personal')
        .insert([{
          user_id: authData.user.id,
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          rol: userData.rol,
          activo: true
        }]);

      if (personalError) throw personalError;

      await fetchUsers(); // Refresh users list

      toast({
        title: 'Éxito',
        description: 'Usuario creado correctamente'
      });

      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Error al crear el usuario',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return false;

      // Delete from personal table (auth user will be handled separately if needed)
      const { error } = await supabase
        .from('personal')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: 'Éxito',
        description: 'Usuario eliminado correctamente'
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el usuario',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getStats = (): UserStats => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.activo).length;
    const inactiveUsers = users.filter(u => !u.activo).length;
    const onlineUsers = users.filter(u => u.activo && (u.sessions_today || 0) > 0).length;
    const admins = users.filter(u => u.rol === 'admin').length;
    const managers = users.filter(u => u.rol === 'manager').length;
    const staff = users.filter(u => u.rol === 'staff').length;
    const hosts = users.filter(u => u.rol === 'host').length;
    const totalSessions = users.reduce((sum, u) => sum + (u.sessions_today || 0), 0);
    const avgActivity = Math.round(
      users.filter(u => (u.activity_today || 0) > 0)
        .reduce((sum, u) => sum + (u.activity_today || 0), 0) / 
      users.filter(u => (u.activity_today || 0) > 0).length
    ) || 0;
    const twoFactorEnabled = users.filter(u => u.two_factor_enabled).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      onlineUsers,
      admins,
      managers,
      staff,
      hosts,
      totalSessions,
      avgActivity,
      twoFactorEnabled
    };
  };

  const getRolesWithCounts = (): RoleDefinition[] => {
    return roleDefinitions.map(role => ({
      ...role,
      userCount: users.filter(u => u.rol === role.id).length
    }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    roleDefinitions: getRolesWithCounts(),
    stats: getStats(),
    updateUserStatus,
    updateUserRole,
    createUser,
    deleteUser,
    refetch: fetchUsers
  };
}
