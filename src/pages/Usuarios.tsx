
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit, Trash2, Search, Filter, Shield, Lock,
  Settings, Mail, Phone, Calendar, Clock, CheckCircle, AlertCircle,
  Crown, User, UserCheck, UserX, Eye, EyeOff, Key, Award,
  Activity, Bell, Smartphone, Monitor, Globe, Download, Upload,
  ChevronRight, ChevronDown, ToggleLeft, ToggleRight, Star,
  Home, Building, Coffee, Utensils, BarChart3, FileText, Save,
  AlertTriangle, Info, Plus, Minus, RotateCcw, Zap, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserManagement, PersonalData } from '@/hooks/useUserManagement';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Usuarios() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    roleDefinitions,
    stats,
    updateUserStatus,
    updateUserRole,
    createUser,
    deleteUser
  } = useUserManagement();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('cards');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    const view = searchParams.get('view');
    
    if (action === 'new') {
      setShowNewUserModal(true);
    }
    
    if (view === 'roles') {
      // Focus on roles section
    }
  }, [searchParams]);

  const getRoleColor = (role: string) => {
    const roleConfig = roleDefinitions.find(r => r.id === role);
    return roleConfig?.color || '#6B7280';
  };

  const getRoleLabel = (role: string) => {
    const roleConfig = roleDefinitions.find(r => r.id === role);
    return roleConfig?.name || role;
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return Crown;
      case 'manager': return Shield;
      case 'staff': return User;
      case 'host': return Eye;
      default: return User;
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.rol === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => 
        selectedStatus === 'active' ? user.activo : !user.activo
      );
    }

    return filtered;
  };

  const handleUserClick = (user: PersonalData) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const StatCard = ({ title, value, subtitle, color, icon: IconComponent, trend }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: React.ComponentType<any>;
    trend?: number;
  }) => (
    <Card className="relative overflow-hidden bg-white/90 backdrop-blur-ios border-enigma-neutral-200/50">
      <CardContent className="p-5">
        <div 
          className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center opacity-20"
          style={{ backgroundColor: color }}
        >
          <IconComponent size={20} />
        </div>
        <h3 className="text-ios-caption1 font-semibold text-enigma-neutral-600 uppercase tracking-wide mb-2">
          {title}
        </h3>
        <div className="text-ios-title1 font-bold text-enigma-neutral-900 mb-1">
          {value}
        </div>
        <p className="text-ios-caption2 text-enigma-neutral-500">
          {subtitle}
        </p>
        {trend !== undefined && (
          <div className={`mt-2 text-ios-caption2 font-semibold ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}% vs ayer
          </div>
        )}
      </CardContent>
    </Card>
  );

  const UserCardsView = () => {
    const filteredUsers = getFilteredUsers();

    return (
      <Card className="bg-white/90 backdrop-blur-ios border-enigma-neutral-200/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-ios-title2 font-bold text-enigma-neutral-900">
              Equipo de Trabajo
            </CardTitle>
            <span className="text-enigma-neutral-600 text-ios-callout">
              {filteredUsers.length} usuarios mostrados
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.rol);
              const initials = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`;
              
              return (
                <Card
                  key={user.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-enigma-primary/30"
                  onClick={() => handleUserClick(user)}
                >
                  <CardContent className="p-6 relative">
                    {/* Status indicator */}
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                      user.activo ? 'bg-green-500' : 'bg-gray-400'
                    }`} />

                    {/* 2FA indicator */}
                    {user.two_factor_enabled && (
                      <div className="absolute top-4 right-8 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield size={10} className="text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-16 h-16 rounded-ios flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: getRoleColor(user.rol) }}
                      >
                        {initials}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-ios-headline font-semibold text-enigma-neutral-900 mb-1">
                          {user.nombre} {user.apellido}
                        </h3>
                        <Badge 
                          className="text-white text-xs"
                          style={{ backgroundColor: getRoleColor(user.rol) }}
                        >
                          <RoleIcon size={12} className="mr-1" />
                          {getRoleLabel(user.rol)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-enigma-neutral-50 rounded-ios">
                      <div className="text-center">
                        <div className="text-ios-callout font-bold" style={{ color: getRoleColor(user.rol) }}>
                          {user.activity_today || 0}
                        </div>
                        <div className="text-ios-caption2 text-enigma-neutral-600">Actividad hoy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-ios-callout font-bold" style={{ color: getRoleColor(user.rol) }}>
                          {user.sessions_today || 0}
                        </div>
                        <div className="text-ios-caption2 text-enigma-neutral-600">Sesiones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-ios-callout font-bold" style={{ color: getRoleColor(user.rol) }}>
                          {user.avg_session_time || 0}m
                        </div>
                        <div className="text-ios-caption2 text-enigma-neutral-600">Tiempo medio</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-ios-caption1 text-enigma-neutral-600">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity size={12} />
                        <span>{user.total_sessions || 0} total</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserModal = () => {
    if (!selectedUser || !showModal) return null;

    const RoleIcon = getRoleIcon(selectedUser.rol);
    const initials = `${selectedUser.nombre.charAt(0)}${selectedUser.apellido.charAt(0)}`;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader className="relative bg-gradient-to-r from-enigma-primary/10 to-enigma-secondary/10 border-b">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowModal(false)}
            >
              ✕
            </Button>
            
            <div className="flex items-center gap-6">
              <div 
                className="w-24 h-24 rounded-ios-large flex items-center justify-center text-white text-2xl font-bold relative"
                style={{ backgroundColor: getRoleColor(selectedUser.rol) }}
              >
                {initials}
                {selectedUser.two_factor_enabled && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Shield size={12} className="text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-ios-large-title font-bold text-enigma-neutral-900 mb-2">
                  {selectedUser.nombre} {selectedUser.apellido}
                </h2>
                <Badge 
                  className="text-white mb-4"
                  style={{ backgroundColor: getRoleColor(selectedUser.rol) }}
                >
                  <RoleIcon size={16} className="mr-2" />
                  {getRoleLabel(selectedUser.rol)}
                </Badge>
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Mail size={12} />
                    {selectedUser.email}
                  </Badge>
                  <Badge 
                    variant={selectedUser.activo ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {selectedUser.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                    {selectedUser.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Activity size={12} />
                    {selectedUser.total_sessions || 0} sesiones
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Información Personal */}
              <div>
                <h3 className="text-ios-title3 font-semibold text-enigma-neutral-900 mb-4">
                  Información Personal
                </h3>
                
                <Card className="bg-enigma-neutral-50 mb-6">
                  <CardContent className="p-4">
                    <h4 className="text-ios-callout font-semibold text-enigma-neutral-900 mb-3">
                      Contacto
                    </h4>
                    <div className="space-y-2 text-ios-callout">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        {selectedUser.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Creado: {new Date(selectedUser.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-enigma-neutral-50 mb-6">
                  <CardContent className="p-4">
                    <h4 className="text-ios-callout font-semibold text-enigma-neutral-900 mb-3">
                      Actividad Reciente
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-ios-callout">
                      <div>
                        <span className="text-enigma-neutral-600">Hoy:</span>
                        <span className="ml-2 font-semibold">{selectedUser.activity_today || 0} acciones</span>
                      </div>
                      <div>
                        <span className="text-enigma-neutral-600">Sesiones:</span>
                        <span className="ml-2 font-semibold">{selectedUser.sessions_today || 0}</span>
                      </div>
                      <div>
                        <span className="text-enigma-neutral-600">Tiempo medio:</span>
                        <span className="ml-2 font-semibold">{selectedUser.avg_session_time || 0}min</span>
                      </div>
                      <div>
                        <span className="text-enigma-neutral-600">Total:</span>
                        <span className="ml-2 font-semibold">{selectedUser.total_sessions || 0} sesiones</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-enigma-neutral-50">
                  <CardContent className="p-4">
                    <h4 className="text-ios-callout font-semibold text-enigma-neutral-900 mb-3">
                      Configuración
                    </h4>
                    <div className="space-y-2 text-ios-callout">
                      <div className="flex items-center gap-2">
                        <Globe size={16} />
                        Idioma: {selectedUser.preferred_language === 'es' ? 'Español' : 'English'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Zona horaria: {selectedUser.timezone || 'Europe/Madrid'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield size={16} />
                        2FA: {selectedUser.two_factor_enabled ? 'Activado' : 'Desactivado'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones */}
              <div>
                <h3 className="text-ios-title3 font-semibold text-enigma-neutral-900 mb-4">
                  Acciones de Usuario
                </h3>
                
                <div className="space-y-3">
                  <Button 
                    className={`w-full justify-start h-12 ${
                      selectedUser.activo 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                    onClick={() => {
                      updateUserStatus(selectedUser.id, !selectedUser.activo);
                      setShowModal(false);
                    }}
                  >
                    {selectedUser.activo ? <UserX size={16} className="mr-3" /> : <UserCheck size={16} className="mr-3" />}
                    {selectedUser.activo ? 'Desactivar Usuario' : 'Activar Usuario'}
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Edit size={16} className="mr-3" />
                    Editar Información
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Shield size={16} className="mr-3" />
                    Gestionar Permisos
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Key size={16} className="mr-3" />
                    Resetear Contraseña
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Activity size={16} className="mr-3" />
                    Ver Historial
                  </Button>
                  
                  {!selectedUser.two_factor_enabled && (
                    <Button variant="outline" className="w-full justify-start h-12">
                      <Shield size={16} className="mr-3" />
                      Configurar 2FA
                    </Button>
                  )}

                  <div className="pt-4 border-t">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start h-12"
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                          deleteUser(selectedUser.id);
                          setShowModal(false);
                        }
                      }}
                    >
                      <Trash2 size={16} className="mr-3" />
                      Eliminar Usuario
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const NewUserModal = () => {
    const [formData, setFormData] = useState({
      nombre: '',
      apellido: '',
      email: '',
      rol: 'staff' as PersonalData['rol'],
      password: ''
    });

    if (!showNewUserModal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await createUser(formData);
      if (success) {
        setShowNewUserModal(false);
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          rol: 'staff',
          password: ''
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-ios-title2 font-bold">Crear Nuevo Usuario</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewUserModal(false)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-ios-callout font-medium text-enigma-neutral-900">Nombre</label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-ios-callout font-medium text-enigma-neutral-900">Apellido</label>
                <Input
                  value={formData.apellido}
                  onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-ios-callout font-medium text-enigma-neutral-900">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-ios-callout font-medium text-enigma-neutral-900">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value as PersonalData['rol'] }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  {roleDefinitions.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-ios-callout font-medium text-enigma-neutral-900">Contraseña</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="mt-1"
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowNewUserModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-enigma-primary">
                  Crear Usuario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-enigma-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ios-body text-enigma-neutral-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-ios-background font-sf">
      {/* Header estático con estilo iOS */}
      <div className="bg-white/95 backdrop-blur-ios border-b border-enigma-neutral-200/50 p-6 mb-6 rounded-ios-large mx-6 mt-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/configuracion')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Volver
            </Button>
            <div>
              <h1 className="text-ios-large-title font-bold text-enigma-neutral-900">
                Gestión de Usuarios
              </h1>
              <p className="text-ios-body text-enigma-neutral-600 mt-1">
                Administración del equipo • {currentTime.toLocaleTimeString('es-ES')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="ios-button-outline">
              <Download size={20} className="mr-2" />
              Exportar
            </Button>
            <Button 
              className="ios-button-primary bg-enigma-primary"
              onClick={() => setShowNewUserModal(true)}
            >
              <UserPlus size={20} className="mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 pb-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            subtitle={`${stats.activeUsers} activos`}
            color="#237584"
            icon={Users}
            trend={0}
          />
          <StatCard
            title="Conectados Hoy"
            value={stats.onlineUsers}
            subtitle={`${stats.totalSessions} sesiones`}
            color="#34C759"
            icon={Activity}
            trend={15}
          />
          <StatCard
            title="Administradores"
            value={stats.admins}
            subtitle="Control total"
            color="#FF3B30"
            icon={Crown}
            trend={0}
          />
          <StatCard
            title="Personal"
            value={stats.staff}
            subtitle="Operativo diario"
            color="#9FB289"
            icon={User}
            trend={8}
          />
          <StatCard
            title="Actividad Media"
            value={stats.avgActivity}
            subtitle="Acciones por usuario"
            color="#CB5910"
            icon={Zap}
            trend={-5}
          />
          <StatCard
            title="2FA Activado"
            value={stats.twoFactorEnabled}
            subtitle={`${Math.round((stats.twoFactorEnabled/stats.totalUsers)*100)}% del equipo`}
            color="#007AFF"
            icon={Shield}
            trend={12}
          />
        </div>

        {/* Role Overview */}
        <section className="mb-8">
          <h2 className="text-ios-title2 font-semibold text-enigma-neutral-900 mb-4">
            Roles y Permisos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleDefinitions.map((role) => {
              const RoleIcon = getRoleIcon(role.id);
              return (
                <Card key={role.id} className="bg-white/90 backdrop-blur-ios border-enigma-neutral-200/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <div 
                        className="w-12 h-12 rounded-ios flex items-center justify-center text-white"
                        style={{ backgroundColor: role.color }}
                      >
                        <RoleIcon size={24} />
                      </div>
                      <div>
                        <h3 className="text-ios-callout font-semibold text-enigma-neutral-900">
                          {role.name}
                        </h3>
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: `${role.color}20`, color: role.color }}
                        >
                          {role.userCount || 0} usuarios
                        </Badge>
                      </div>
                    </div>
                    <p className="text-ios-caption1 text-enigma-neutral-600 mb-2">
                      {role.description}
                    </p>
                    <div className="text-ios-caption2 text-enigma-neutral-500 bg-enigma-neutral-50 p-2 rounded-ios">
                      {role.permissions}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <Card className="mb-6 bg-white/90 backdrop-blur-ios border-enigma-neutral-200/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los roles</option>
                {roleDefinitions.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <UserCardsView />
      </main>

      {/* Modals */}
      <UserModal />
      <NewUserModal />
    </div>
  );
}
