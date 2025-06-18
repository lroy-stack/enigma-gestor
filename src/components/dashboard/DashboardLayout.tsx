
// This component is deprecated - now using MainLayout for consistency
// All pages should use the MainLayout component instead

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Simply render children - the MainLayout will handle the layout
  return <>{children}</>;
}
