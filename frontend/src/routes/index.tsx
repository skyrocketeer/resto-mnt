import { createFileRoute, Navigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/RoleBasedLayout'
import apiClient from '@/api/client'
import { useUser } from '@/contexts/UserContext'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { user, isLoading } = useUser()

  // Show loading while we check localStorage
  if (isLoading) {
    console.log('Still loading user data from localStorage...')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS System...</p>
        </div>
      </div>
    )
  }

  // Check authentication - ONLY after localStorage is loaded
  console.log('Checking auth - isAuthenticated:', apiClient.isAuthenticated(), 'user:', user)
  if (!apiClient.isAuthenticated() || !user) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" />
  }

  // Redirect admin users to admin panel
  // if (user.role === 'admin') {
  //   console.log('Admin user detected, redirecting to admin panel')
  //   return <Navigate to="/admin/dashboard" />
  // }

  console.log('User authenticated, rendering role-based layout for user:', user)
  return <RoleBasedLayout />
}

