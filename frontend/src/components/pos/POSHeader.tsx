import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  User as UserIcon, 
  LogOut, 
  Settings,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  MapPin,
  ChefHat
} from 'lucide-react'
import apiClient from '@/api/client'
import type { User, DiningTable } from '@/types'

interface POSHeaderProps {
  user: User
  selectedTable: DiningTable | null
  orderType: 'dine_in' | 'takeout' | 'delivery'
  onOrderTypeChange: (type: 'dine_in' | 'takeout' | 'delivery') => void
  onTableSelect: () => void
  customerName: string
  onCustomerNameChange: (name: string) => void
}

export function POSHeader({ 
  user, 
  selectedTable, 
  orderType, 
  onOrderTypeChange, 
  onTableSelect,
  customerName,
  onCustomerNameChange
}: POSHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      // Even if logout fails, clear local auth
    } finally {
      apiClient.clearAuth()
      window.location.href = '/login'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700'
      case 'manager': return 'bg-blue-100 text-blue-700'
      case 'cashier': return 'bg-green-100 text-green-700'
      case 'kitchen': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const orderTypeConfigs = [
    { type: 'dine_in' as const, label: 'Dine In', icon: UtensilsCrossed, color: 'bg-blue-100 text-blue-700' },
    { type: 'takeout' as const, label: 'Takeout', icon: ShoppingBag, color: 'bg-green-100 text-green-700' },
    { type: 'delivery' as const, label: 'Delivery', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">POS System</h1>
              <p className="text-sm text-gray-500">Point of Sale</p>
            </div>
          </div>
        </div>

        {/* Center: Order Type & Table Selection */}
        <div className="flex items-center gap-6">
          {/* Order Type Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {orderTypeConfigs.map((config) => {
              const Icon = config.icon
              return (
                <button
                  key={config.type}
                  onClick={() => onOrderTypeChange(config.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    orderType === config.type
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              )
            })}
          </div>

          {/* Table Selection (Dine In only) */}
          {orderType === 'dine_in' && (
            <Button
              variant={selectedTable ? "default" : "outline"}
              onClick={onTableSelect}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {selectedTable ? `Table ${selectedTable.table_number}` : 'Select Table'}
            </Button>
          )}

          {/* Customer Name (Takeout/Delivery) */}
          {orderType !== 'dine_in' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Customer:
              </label>
              <Input
                type="text"
                placeholder={orderType === 'takeout' ? 'Customer name' : 'Delivery address'}
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                className="w-48"
              />
            </div>
          )}
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </span>
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Kitchen Display Access */}
            {(user.role === 'kitchen' || user.role === 'admin' || user.role === 'manager') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/kitchen'}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Kitchen Display"
              >
                <ChefHat className="w-4 h-4" />
                <span className="text-sm font-medium">Kitchen</span>
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

