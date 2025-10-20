import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ServerInterface } from '@/components/server/ServerInterface'
import { CounterInterface } from '@/components/counter/CounterInterface'
import { POSLayout } from '@/components/pos/POSLayout'
import { NewEnhancedKitchenLayout } from '@/components/kitchen/NewEnhancedKitchenLayout'
import { 
  Users, 
  CreditCard, 
  ChefHat,
  ShoppingCart,
  LogOut,
} from 'lucide-react'
import type { UserInfo } from '@/types'
import apiClient from '@/api/client'
import { useScreenSizeWithSidebar } from '@/hooks/useScreenSize'
import { UserMenu } from './ui/user-menu'

interface RoleBasedLayoutProps {
  user: UserInfo
}

export function RoleBasedLayout({ user }: RoleBasedLayoutProps) {
  const [currentView, setCurrentView] = useState<string>(getDefaultView(user.role))
  const { isMobile, isTablet } = useScreenSizeWithSidebar()

  function getDefaultView(role: string): string {
    switch (role) {
      case 'admin':
      case 'manager':
        return 'dashboard'
      case 'server':
        return 'server'
      case 'counter':
        return 'counter'
      case 'kitchen':
        return 'kitchen'
      default:
        return 'pos' // fallback to general POS interface
    }
  }

  const handleLogout = () => {
    apiClient.clearAuth()
    window.location.href = '/login'
  }

  // Get available views based on user role
  const getAvailableViews = (role: string) => {
    const views = []

    // Admin and managers get all views
    // if (role === 'admin' || role === 'manager') {
    //   views.push(
    //     { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    //     { id: 'pos', label: 'General POS', icon: <ShoppingCart className="w-4 h-4" /> },
    //     { id: 'server', label: 'Server Interface', icon: <Users className="w-4 h-4" /> },
    //     { id: 'counter', label: 'Counter/Checkout', icon: <CreditCard className="w-4 h-4" /> },
    //     { id: 'kitchen', label: 'Kitchen Display', icon: <ChefHat className="w-4 h-4" /> }
    //   )
    // }
    if (role === 'server') {
      views.push(
        { id: 'server', label: 'Server Interface', icon: <Users className="w-4 h-4" /> },
        { id: 'pos', label: 'General POS', icon: <ShoppingCart className="w-4 h-4" /> }
      )
    }
    else if (role === 'counter') {
      views.push(
        { id: 'counter', label: 'Counter/Checkout', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'pos', label: 'General POS', icon: <ShoppingCart className="w-4 h-4" /> }
      )
    }
    else if (role === 'kitchen') {
      views.push(
        { id: 'kitchen', label: 'Kitchen Display', icon: <ChefHat className="w-4 h-4" /> }
      )
    }
    // Default fallback
    else {
      views.push(
        { id: 'pos', label: 'POS System', icon: <ShoppingCart className="w-4 h-4" /> }
      )
    }

    return views
  }

  const availableViews = getAvailableViews(user.role)

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminLayout user={user} />
      case 'server':
        return <ServerInterface />
      case 'counter':
        return <CounterInterface />
      case 'kitchen':
        return <NewEnhancedKitchenLayout user={user} />
      case 'pos':
        return <POSLayout user={user} />
      default:
        return <POSLayout user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xl font-bold">POS System</div>
                <div className={`text-muted-foreground ${(isMobile || isTablet) ? 'text-sm' : 'text-xs'
                  }`}>Restaurant Management</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            {availableViews.length > 1 && (
              <div className="flex items-center gap-2">
                {availableViews.map(view => (
                  <Button
                    key={view.id}
                    variant={currentView === view.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView(view.id)}
                    className="flex items-center gap-2"
                  >
                    {view.icon}
                    {view.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <UserMenu
                user={user}
                size={isTablet ? 'lg' : 'md'}
              />
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {renderCurrentView()}
      </div>
    </div>
  )
}

