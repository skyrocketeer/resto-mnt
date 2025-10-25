import { createFileRoute, Navigate } from '@tanstack/react-router'
import { NewEnhancedKitchenLayout } from '@/components/kitchen/NewEnhancedKitchenLayout'
import apiClient from '@/api/client'
import { useUser } from '@/contexts/UserContext'

export const Route = createFileRoute('/admin/kitchen')({
  component: AdminKitchenPage,
})

function AdminKitchenPage() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Kitchen Panel...</p>
        </div>
      </div>
    )
  }

  if (!apiClient.isAuthenticated() || !user) {
    return <Navigate to="/login" />
  }

  return <NewEnhancedKitchenLayout />
}