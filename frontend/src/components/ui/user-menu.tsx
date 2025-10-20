import { User, Settings, Bell, LogOut, CreditCard, Users, ChefHat, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import apiClient from "@/api/client"
import type { UserInfo } from "@/types"

interface UserMenuProps {
  user: UserInfo
  collapsed?: boolean
  size?: "sm" | "md" | "lg"
}

export function UserMenu({ user, collapsed = false, size = "md" }: UserMenuProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrator',
          color: 'bg-red-100 text-red-800',
          icon: <Settings className="w-4 h-4" />,
          description: 'Full system access and management'
        }
      case 'manager':
        return {
          title: 'Manager',
          color: 'bg-purple-100 text-purple-800',
          icon: <LayoutDashboard className="w-4 h-4" />,
          description: 'Operations management and reporting'
        }
      case 'server':
        return {
          title: 'Server',
          color: 'bg-blue-100 text-blue-800',
          icon: <Users className="w-4 h-4" />,
          description: 'Dine-in order creation'
        }
      case 'counter':
        return {
          title: 'Counter/Checkout',
          color: 'bg-green-100 text-green-800',
          icon: <CreditCard className="w-4 h-4" />,
          description: 'Order creation and payment processing'
        }
      case 'kitchen':
        return {
          title: 'Kitchen Staff',
          color: 'bg-orange-100 text-orange-800',
          icon: <ChefHat className="w-4 h-4" />,
          description: 'Order preparation and status updates'
        }
      default:
        return {
          title: 'Staff',
          color: 'bg-gray-100 text-gray-800',
          icon: <User className="w-4 h-4" />,
          description: 'General access'
        }
    }
  }

  const roleConfig = getRoleConfig(user.role)

  const handleLogout = () => {
    apiClient.clearAuth()
    window.location.href = '/login'
  }

  const sizeClasses = {
    sm: {
      avatar: "w-6 h-6",
      icon: "w-3 h-3",
      text: "text-xs",
      name: "text-xs",
      email: "text-xs"
    },
    md: {
      avatar: "w-8 h-8", 
      icon: "w-4 h-4",
      text: "text-sm",
      name: "text-sm",
      email: "text-xs"
    },
    lg: {
      avatar: "w-10 h-10",
      icon: "w-5 h-5", 
      text: "text-base",
      name: "text-base",
      email: "text-sm"
    }
  }

  const currentSize = sizeClasses[size]

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-1.5 rounded-full">
            <div className={`bg-primary rounded-full flex items-center justify-center ${currentSize.avatar}`}>
              <User className={`text-primary-foreground ${currentSize.icon}`} />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="right" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-full justify-start p-3 h-auto rounded-lg">
          <div className="flex items-center gap-3 w-full">
            <div className={`bg-primary rounded-full flex items-center justify-center ${currentSize.avatar}`}>
              <User className={`text-primary-foreground ${currentSize.icon}`} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`font-medium truncate ${currentSize.name}`}>
                {user.first_name} {user.last_name}
              </p>
              <p className={`text-muted-foreground truncate ${currentSize.email}`}>
                {user.email}
              </p>
            </div>
            <Badge
              className={`${roleConfig.color} font-medium hover:text-white`}
              onClick={() => { }}
            >
              {roleConfig.icon}
              <span className="ml-1">{roleConfig.title}</span>
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
