# Test de Comportamiento Responsive Header-Sidebar

## Casos de Prueba

### 1. Desktop - Sidebar Expandido
- **Condición**: `isDesktop=true`, `sidebarCollapsed=false`
- **Header esperado**: `lg:ml-80` (320px margen izquierdo)
- **Sidebar esperado**: `w-80 translate-x-0` (320px ancho, visible)
- **MainContent esperado**: `lg:ml-80` (320px margen izquierdo)

### 2. Desktop - Sidebar Colapsado  
- **Condición**: `isDesktop=true`, `sidebarCollapsed=true`
- **Header esperado**: `lg:ml-20` (80px margen izquierdo)
- **Sidebar esperado**: `w-20 translate-x-0` (80px ancho, visible)
- **MainContent esperado**: `lg:ml-20` (80px margen izquierdo)

### 3. Móvil - Sidebar Cerrado
- **Condición**: `isMobile=true`, `sidebarOpen=false`
- **Header esperado**: Sin margen izquierdo
- **Sidebar esperado**: `-translate-x-full` (oculto)
- **MainContent esperado**: Sin margen izquierdo

### 4. Móvil - Sidebar Abierto
- **Condición**: `isMobile=true`, `sidebarOpen=true`
- **Header esperado**: Sin margen izquierdo
- **Sidebar esperado**: `translate-x-0` (visible con overlay)
- **MainContent esperado**: Sin margen izquierdo

## Variables de Estado Actuales

```typescript
// MainLayout.tsx
const [sidebarOpen, setSidebarOpen] = useState(false);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const isPersistentSidebar = isDesktop || isLargeDesktop;

// Header.tsx  
const shouldAdjustForSidebar = (isDesktop || isLargeDesktop);

// Sidebar.tsx
isPersistent ? "translate-x-0" : (isOpen ? "translate-x-0" : "-translate-x-full")
```

## Estado de las Props

- **Header**: recibe `sidebarCollapsed`, `shouldAdjustForSidebar`
- **Sidebar**: recibe `isOpen`, `isPersistent`, `isCollapsed` 
- **MainContent**: usa `isPersistentSidebar`, `sidebarCollapsed`

## Posibles Problemas

1. **Timing**: Los estados podrían no estar sincronizados
2. **CSS Conflicts**: Clases podrían estar en conflicto
3. **Z-index Issues**: Sidebar podría estar detrás del header
4. **Breakpoint Issues**: lg: podría no estar aplicándose correctamente