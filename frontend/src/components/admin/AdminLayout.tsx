import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Removed - not used in simplified layout
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ChefHat,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  Menu,
  BarChart3,
  UserCog,
  Store
} from 'lucide-react'
import type { User as UserType } from '@/types'
import apiClient from '@/api/client'

// Import components for different sections
import { AdminDashboard } from './AdminDashboard'
import { POSLayout } from '@/components/pos/POSLayout'
import { ServerInterface } from '@/components/server/ServerInterface'
import { CounterInterface } from '@/components/counter/CounterInterface'
import { KitchenLayout } from '@/components/kitchen/KitchenLayout'

interface AdminLayoutProps {
  user: UserType
}

const adminSections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: 'Overview and statistics'
  },
  {
    id: 'pos',
    label: 'General POS',
    icon: <Store className="w-5 h-5" />,
    description: 'Full POS interface'
  },
  {
    id: 'server',
    label: 'Server Interface',
    icon: <Users className="w-5 h-5" />,
    description: 'Server order interface'
  },
  {
    id: 'counter',
    label: 'Counter/Checkout',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Payment processing'
  },
  {
    id: 'kitchen',
    label: 'Kitchen Display',
    icon: <ChefHat className="w-5 h-5" />,
    description: 'Kitchen order display'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'System configuration'
  },
  {
    id: 'staff',
    label: 'Manage Staff',
    icon: <UserCog className="w-5 h-5" />,
    description: 'User and role management'
  },
  {
    id: 'menu',
    label: 'Manage Menu',
    icon: <Menu className="w-5 h-5" />,
    description: 'Categories and products'
  },
  {
    id: 'reports',
    label: 'View Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Sales and analytics'
  }
]

export function AdminLayout({ user }: AdminLayoutProps) {
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    apiClient.clearAuth()
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_token')
    window.location.href = '/login'
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard />
      case 'pos':
        return <POSLayout user={user} />
      case 'server':
        return <ServerInterface />
      case 'counter':
        return <CounterInterface />
      case 'kitchen':
        return <KitchenLayout user={user} />
      case 'settings':
        return <div className="p-6"><h2 className="text-2xl font-bold">Settings</h2><p className="text-muted-foreground">Settings panel coming soon...</p></div>
      case 'staff':
        return <div className="p-6"><h2 className="text-2xl font-bold">Staff Management</h2><p className="text-muted-foreground">Staff management coming soon...</p></div>
      case 'menu':
        return <div className="p-6"><h2 className="text-2xl font-bold">Menu Management</h2><p className="text-muted-foreground">Menu management coming soon...</p></div>
      case 'reports':
        return <div className="p-6"><h2 className="text-2xl font-bold">Reports</h2><p className="text-muted-foreground">Reports panel coming soon...</p></div>
      default:
        return <AdminDashboard />
    }
  }

  // const currentSectionInfo = adminSections.find(s => s.id === currentSection) // Removed with top header

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="text-xl font-bold">POS Admin</span>
                  <p className="text-xs text-muted-foreground">Restaurant Management</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 h-8 w-8"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 px-4 pb-4">
            <div className="space-y-2">
              {adminSections.map((section) => (
                <Button
                  key={section.id}
                  variant={currentSection === section.id ? 'default' : 'ghost'}
                  className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                  onClick={() => setCurrentSection(section.id)}
                  title={sidebarCollapsed ? section.label : undefined}
                >
                  {section.icon}
                  {!sidebarCollapsed && (
                    <span className="ml-3">{section.label}</span>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Spacer to push logout to bottom */}
            <div className="flex-1"></div>
            
            {/* User Info - Compact */}
            {!sidebarCollapsed && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Logout Button - Part of navigation */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && (
                <span className="ml-3">Logout</span>
              )}
            </Button>
            
            {/* Collapsed user avatar */}
            {sidebarCollapsed && (
              <div className="flex justify-center mt-2">
                <div 
                  className="w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer"
                  title={`${user.first_name} ${user.last_name} (${user.role.toUpperCase()})`}
                >
                  <User className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            )}
          </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderCurrentSection()}
      </div>
    </div>
  )
}
