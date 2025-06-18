# Enigma Cocina con Alma - Sistema de Gestión de Restaurante

## 📋 Descripción del Proyecto

Enigma Cocina con Alma es un sistema integral de gestión de restaurante desarrollado con tecnologías modernas. La aplicación proporciona una solución completa para la administración de reservas, mesas, clientes y análisis de negocio, diseñada específicamente para restaurantes que buscan optimizar sus operaciones y mejorar la experiencia del cliente.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Sistema de Diseño iOS Personalizado
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estado Global**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **UI Components**: Radix UI + Componentes iOS Personalizados
- **Iconografía**: Lucide React
- **Fechas**: date-fns
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod

### Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── analytics/       # Componentes de análisis y métricas
│   ├── auth/           # Componentes de autenticación
│   ├── calendar/       # Sistema de calendario
│   ├── common/         # Componentes comunes
│   ├── customers/      # Gestión de clientes
│   ├── dashboard/      # Panel principal
│   ├── forms/          # Formularios especializados
│   ├── layout/         # Componentes de layout
│   ├── modals/         # Modales del sistema
│   ├── notifications/  # Sistema de notificaciones
│   ├── reservas/       # Gestión de reservas
│   ├── tables/         # Gestión de mesas
│   └── ui/             # Componentes UI base
├── hooks/              # Custom hooks
├── integrations/       # Integraciones externas
├── lib/                # Utilidades y configuraciones
├── pages/              # Páginas principales
├── styles/             # Estilos globales
└── types/              # Definiciones de tipos TypeScript
```

## 🎨 Sistema de Diseño

### Paleta de Colores Enigma

El sistema utiliza una paleta de colores cuidadosamente seleccionada que refleja la identidad de "Enigma Cocina con Alma":

- **Primary**: `#237584` - Azul corporativo principal
- **Secondary**: `#9FB289` - Verde natural que evoca frescura
- **Accent**: `#CB5910` - Naranja cálido para elementos destacados
- **Neutrals**: Escala de grises desde `#F8FAFB` hasta `#0F172A`

### Componentes iOS Personalizados

El sistema implementa un conjunto de componentes que siguen las directrices de diseño de iOS, adaptados para la web:

- **IOSCard**: Tarjetas con bordes redondeados y sombras sutiles
- **IOSButton**: Botones con estados táctiles y animaciones
- **IOSBadge**: Indicadores de estado y notificaciones
- **StatusBadge**: Badges específicos para estados del sistema

### Responsive Design

El sistema está completamente optimizado para:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

## 📱 Funcionalidades Principales

### 1. Dashboard Principal

**Ubicación**: `/src/pages/Dashboard.tsx`

El dashboard proporciona una vista general del restaurante en tiempo real:

- **Métricas en Tiempo Real**: Reservas del día, ocupación de mesas, ingresos
- **Actividad Reciente**: Log de actividades importantes
- **Alertas y Notificaciones**: Sistema de alertas inteligente
- **Accesos Rápidos**: Navegación rápida a funciones principales

### 2. Gestión de Reservas

**Ubicación**: `/src/pages/Reservas.tsx`

Sistema completo de gestión de reservas:

- **Vista de Lista**: Listado detallado con filtros avanzados
- **Vista de Calendario**: Visualización mensual, semanal y diaria
- **Estados de Reserva**: 
  - Pendiente confirmación
  - Confirmada
  - Cancelada (usuario/restaurante)
  - Completada
  - No show
- **Funcionalidades**:
  - Crear nuevas reservas
  - Modificar reservas existentes
  - Asignación automática de mesas
  - Notificaciones automáticas
  - Historial completo

### 3. Gestión de Mesas

**Ubicación**: `/src/pages/Mesas.tsx`

Sistema visual e interactivo para la gestión de mesas:

- **Vista de Plano**: Representación visual del restaurante
- **Estados de Mesa**:
  - Libre (verde)
  - Ocupada (rojo)
  - Reservada (azul)
  - Limpieza (naranja)
  - Mantenimiento (gris)
- **Funcionalidades**:
  - Cambio de estado en tiempo real
  - Combinación de mesas
  - Temporizadores automáticos
  - Estadísticas por zona
  - Gestión de capacidad

### 4. Gestión de Clientes

**Ubicación**: `/src/pages/Clientes.tsx`

Sistema CRM completo para clientes:

- **Perfiles Detallados**: Información completa del cliente
- **Historial de Reservas**: Tracking completo de visitas
- **Segmentación**:
  - Clientes VIP
  - Nuevos clientes
  - Clientes activos/inactivos
- **Análisis Avanzado**: Métricas de comportamiento y preferencias
- **Sistema de Etiquetas**: Categorización personalizada

### 5. Analytics y Reportes

**Ubicación**: `/src/pages/Analytics.tsx`

Sistema de análisis de negocio:

- **Métricas de Rendimiento**: KPIs del restaurante
- **Análisis de Tendencias**: Patrones de reservas y ocupación
- **Reportes Financieros**: Ingresos y proyecciones
- **Análisis de Clientes**: Comportamiento y segmentación

### 6. Gestión de Usuarios

**Ubicación**: `/src/pages/Usuarios.tsx`

Sistema de administración de personal:

- **Roles y Permisos**: Sistema granular de accesos
- **Gestión de Personal**: CRUD completo de empleados
- **Auditoría**: Log de acciones por usuario

## 🔧 Configuración y Desarrollo

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd Enigma-GESTOR
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
# Crear archivo .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Configurar base de datos**:
```bash
# Las migraciones están en /supabase/migrations/
# Aplicar usando Supabase CLI
supabase db push
```

### Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Estructura de la Base de Datos

#### Tablas Principales

1. **clientes**: Información de clientes
2. **reservas**: Gestión de reservas
3. **mesas**: Configuración de mesas
4. **personal**: Gestión de empleados
5. **estados_mesa**: Estados en tiempo real
6. **combinaciones_mesa**: Mesas combinadas

#### Relaciones Clave

- `reservas.cliente_id` → `clientes.id`
- `reservas.mesa_id` → `mesas.id`
- `estados_mesa.mesa_id` → `mesas.id`
- `reservas.asignada_por` → `personal.id`

## 🎯 Hooks Personalizados

El sistema utiliza hooks personalizados para la gestión de estado:

### Hooks de Datos
- `useReservations`: Gestión de reservas
- `useCustomers`: Gestión de clientes
- `useTables`: Gestión de mesas
- `useTableStates`: Estados de mesa en tiempo real
- `useRestaurantStats`: Estadísticas del restaurante

### Hooks de UI
- `useResponsive`: Detección de breakpoints
- `useAuth`: Gestión de autenticación
- `useToast`: Sistema de notificaciones

## 🔐 Sistema de Autenticación

El sistema implementa autenticación robusta con:

- **Login/Logout**: Autenticación por email/password
- **Roles de Usuario**: Admin, Manager, Staff
- **Protección de Rutas**: Middleware de autenticación
- **Sesiones Persistentes**: Manejo automático de tokens

## 📊 Gestión de Estado

### TanStack Query

Utilizado para:
- Cache inteligente de datos
- Sincronización en tiempo real
- Optimistic updates
- Background refetching

### Estado Local

Manejado con React hooks para:
- UI state (modales, formularios)
- Filtros y búsquedas
- Preferencias de usuario

## 🚀 Despliegue

### Build de Producción

```bash
npm run build
```

### Variables de Entorno de Producción

```env
VITE_SUPABASE_URL=production_url
VITE_SUPABASE_ANON_KEY=production_key
```

### Consideraciones de Despliegue

1. **CDN**: Configurar para assets estáticos
2. **HTTPS**: Obligatorio para Supabase
3. **Dominio**: Configurar en Supabase dashboard
4. **Monitoring**: Implementar logging de errores

## 🧪 Testing

### Estructura de Tests

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📈 Performance

### Optimizaciones Implementadas

1. **Lazy Loading**: Páginas cargadas bajo demanda
2. **Code Splitting**: Bundles optimizados
3. **Image Optimization**: Formatos modernos
4. **Caching**: Estrategias de cache inteligente
5. **Bundle Analysis**: Análisis de tamaño de bundles

## 🔧 Mantenimiento

### Actualizaciones

```bash
# Actualizar dependencias
npm update

# Auditoría de seguridad
npm audit

# Fix automático de vulnerabilidades
npm audit fix
```

### Monitoreo

- **Logs de Error**: Implementar Sentry o similar
- **Performance**: Monitoring de Core Web Vitals
- **Uptime**: Monitoring de disponibilidad

## 📚 Documentación Adicional

### Guías de Desarrollo

1. **Convenciones de Código**: ESLint + Prettier
2. **Git Workflow**: Feature branches + PR reviews
3. **Versionado**: Semantic versioning
4. **Changelog**: Documentación de cambios

### APIs y Integraciones

- **Supabase**: Documentación completa en `/docs/supabase.md`
- **Componentes**: Storybook para componentes UI
- **Hooks**: Documentación de hooks personalizados

## 🤝 Contribución

### Workflow de Desarrollo

1. Fork del repositorio
2. Crear feature branch
3. Desarrollar y testear
4. Crear Pull Request
5. Code review
6. Merge a main

### Estándares de Código

- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo consistente
- **Conventional Commits**: Mensajes de commit estandarizados

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:

- **Issues**: Crear issue en GitHub
- **Documentación**: Consultar `/docs/`
- **Wiki**: Información adicional en el wiki del proyecto

---

**Enigma Cocina con Alma** - Sistema de gestión de restaurante moderno, eficiente y escalable.

*Desarrollado con ❤️ para la industria gastronómica*
