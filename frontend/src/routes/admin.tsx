import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useUser } from '@/contexts/UserContext'
import apiClient from '@/api/client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { user, isLoading } = useUser()

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  if (!apiClient.isAuthenticated() || !user) {
    return <Navigate to="/login" />
  }

  // Check admin role
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Navigate to="/" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
