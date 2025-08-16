import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import apiClient from '@/api/client'
import { POSLayout } from '@/components/pos/POSLayout'
import type { User } from '@/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ALL HOOKS MUST BE AT THE TOP LEVEL - before any conditional returns
  const { isLoading: isServerVerifying, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      console.log('Verifying user with API URL:', import.meta.env.VITE_API_URL)
      return apiClient.getCurrentUser()
    },
    retry: 1,
    enabled: false, // Temporarily disable server verification
    onError: (error) => {
      console.error('getCurrentUser failed:', error)
      // Clear auth and redirect to login
      apiClient.clearAuth()
      window.location.href = '/login'
    }
  })

  useEffect(() => {
    console.log('Loading user from localStorage...')
    const storedUser = localStorage.getItem('pos_user')
    const token = localStorage.getItem('pos_token')
    
    console.log('Stored user:', storedUser)
    console.log('Stored token:', token ? 'exists' : 'missing')
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('Parsed user:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('pos_user')
        localStorage.removeItem('pos_token')
      }
    }
    setIsLoading(false)
  }, [])

  // Show loading while we check localStorage
  if (isLoading) {
    console.log('Still loading user data...')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS System...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  console.log('Checking auth - isAuthenticated:', apiClient.isAuthenticated(), 'user:', user)
  if (!apiClient.isAuthenticated() || !user) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" />
  }

  if (isServerVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS System...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Authentication error</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return <POSLayout user={user} />
}

