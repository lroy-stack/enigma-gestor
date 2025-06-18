# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enigma GESTOR is a comprehensive restaurant management system for "Enigma Cocina con Alma" restaurant. It handles reservations, table management, customer relationships, analytics, and staff operations through a modern web interface.

## Tech Stack

- **Frontend**: React 18.3, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Tanstack Query, React Context
- **Routing**: React Router DOM
- **Key Libraries**: date-fns, Recharts, Fabric.js, React Hook Form, Framer Motion

## Development Commands

```bash
# Development
npm run dev          # Start development server (Vite)

# Build & Preview
npm run build        # Build for production
npm run build:dev    # Build for development mode
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Run TypeScript type checking (no dedicated script)

# Supabase (requires Supabase CLI installed)
supabase start       # Start local Supabase
supabase stop        # Stop local Supabase
supabase status      # Check Supabase status
supabase db reset    # Reset local database
supabase db push     # Push schema changes
supabase db pull     # Pull remote schema
supabase migration new <name>  # Create new migration
supabase gen types typescript --local > src/integrations/supabase/types.ts  # Generate types
```

## Project Structure

```
src/
├── components/          # Feature-based component organization
│   ├── analytics/      # Analytics dashboards and charts
│   ├── auth/          # Authentication components
│   ├── customers/     # Customer management features
│   ├── dashboard/     # Main dashboard components
│   ├── layout/        # App layout (header, sidebar, navigation)
│   ├── notifications/ # Notification system
│   ├── reservas/      # Reservation management
│   ├── tables/        # Table management and floor plans
│   └── ui/            # Reusable UI components (shadcn/ui)
├── hooks/             # Custom React hooks for business logic
├── integrations/      # External service integrations (Supabase)
├── pages/             # Route-level page components
├── styles/            # Global CSS and custom styles
└── types/             # TypeScript type definitions
```

## Key Features & Architecture

### 1. Authentication & User Management
- Supabase Auth integration with role-based access control
- User profiles linked to `personal` table
- Roles: admin, manager, staff, host
- Protected routes based on authentication status

### 2. Table Management System
- **Interactive Floor Plans**: Two implementations
  - Canvas-based (Fabric.js) - `components/tables/canvas/`
  - SVG-based - `components/tables/svg/`
- **Table Features**:
  - Drag-and-drop positioning
  - Table combinations (joining/splitting)
  - Zone management (terrace, window, bar, etc.)
  - Real-time availability tracking
- **Key Hooks**: `useTableManagement`, `useTableMapInteractions`

### 3. Reservation System
- States: pending, confirmed, seated, completed, cancelled, no_show
- Origins: web, phone, whatsapp, in_person, external
- Features:
  - Time slot management
  - Table assignment
  - Customer linking
  - Special requests handling
- **Key Components**: `ReservationDialog`, `ReservationList`, `ReservationCalendar`

### 4. Customer Management (CRM)
- Customer profiles with contact info and preferences
- VIP status and loyalty tracking
- Features:
  - Tags and alerts system
  - Dietary restrictions
  - Interaction history
  - Notes management
- **Key Hooks**: `useCustomers`, `useCustomerInteractions`

### 5. Analytics Dashboard
- Reservation statistics and trends
- Occupancy rates by zone
- Revenue tracking
- Customer analytics
- **Components**: `AnalyticsDashboard`, various chart components using Recharts

### 6. Notification System
- Real-time notifications using Supabase subscriptions
- Types: reservation updates, table status changes, customer alerts
- **Key Hook**: `useNotifications`

### 7. Configuration & Settings
- Restaurant configuration management
- Operating hours
- Table settings
- User preferences
- **Component**: `SettingsPage`

## Database Schema (Supabase)

Key tables:
- `clientes` - Customer information and preferences
- `reservas` - Reservation records
- `mesas` - Table definitions and configurations
- `personal` - Staff members and roles
- `configuracion_restaurante` - Restaurant settings
- `disponibilidad_mesas` - Table availability tracking
- `interacciones_clientes` - Customer interaction history
- `notas_clientes`, `alertas_clientes`, `tags_clientes` - CRM features

## Architecture Patterns

### Data Fetching
- Tanstack Query for server state management
- Custom hooks wrapping Supabase queries
- Real-time subscriptions for live updates

### Component Organization
- Feature-based folder structure
- Shared UI components in `components/ui/`
- Page components in `pages/` directory
- Business logic extracted to custom hooks

### State Management
- Server state: Tanstack Query
- Local UI state: React useState/useReducer
- Global state: React Context (auth, theme)

## Important Configurations

### TypeScript
- Strict mode enabled
- Path aliases configured (@/ for src/)
- Supabase types auto-generated

### ESLint
- React hooks rules
- TypeScript integration
- Import order enforcement

### Vite
- React plugin with SWC
- Path resolution for @ alias
- Optimized dependencies

## Design System

### Custom Styles
- `styles/enigma.css` - Restaurant-specific styles
- `styles/ios-design-system.css` - iOS-styled components for mobile experience
- Tailwind CSS for utility classes
- shadcn/ui for consistent component design

## Key Hooks

- `useSupabase` - Supabase client access
- `useAuth` - Authentication state and methods
- `useReservations` - Reservation CRUD operations
- `useTableAvailability` - Real-time table status
- `useCustomerNotes/Alerts/Tags` - CRM features
- `useAnalytics` - Analytics data fetching

## Development Notes

- Project uses Lovable.dev/GPT Engineer for deployment
- Supabase project required for backend functionality
- Environment variables needed for Supabase configuration
- Real-time features require WebSocket support
- Table map uses both Canvas and SVG implementations

## Common Operations

### Adding a New Feature
1. Create component in appropriate feature folder
2. Add route in App.tsx if needed
3. Create custom hook for data operations
4. Add Supabase query/mutation functions
5. Update types in types/ directory

### Working with Tables
- Table positions stored as x,y coordinates
- Zones defined in table configuration
- Combinations tracked in separate table
- Real-time updates via Supabase subscriptions

### Managing Reservations
- Always validate time slots before creation
- Check table availability
- Link to customer record when possible
- Handle state transitions properly

## Testing & Quality

Run these commands before committing:
```bash
npm run lint
npx tsc --noEmit
```

## Deployment

- Deployable via Lovable.dev
- Requires Supabase project setup
- Environment variables for API keys
- Database migrations must be run

## Security Considerations

- Row Level Security (RLS) enabled on Supabase tables
- Authentication required for all operations
- Role-based access control implemented
- Sensitive data filtered based on user permissions