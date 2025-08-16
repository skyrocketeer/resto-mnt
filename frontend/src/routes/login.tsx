import { createFileRoute, Navigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import apiClient from '@/api/client'
import type { LoginRequest, LoginResponse, APIResponse } from '@/types'
import { Eye, EyeOff, Store, Users, CreditCard, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginRequest>({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Check if already authenticated
  if (apiClient.isAuthenticated()) {
    return <Navigate to="/" />
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response: APIResponse<LoginResponse> = await apiClient.login(credentials)
      return response
    },
    onSuccess: (data) => {
      console.log('Login success:', data)
      console.log('Current API URL:', import.meta.env.VITE_API_URL)
      if (data.success && data.data) {
        apiClient.setAuthToken(data.data.token)
        localStorage.setItem('pos_user', JSON.stringify(data.data.user))
        console.log('Auth token set, redirecting to home...')
        setTimeout(() => {
          router.navigate({ to: '/' })
        }, 100)
      } else {
        console.error('Login failed:', data)
        setError(data.message || 'Login failed')
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.username || !formData.password) {
      setError('Username and password are required')
      return
    }

    loginMutation.mutate(formData)
  }

  const fillDemoCredentials = (username: string, password: string) => {
    setFormData({ username, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold">POS System</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Modern Point of Sale
            <br />
            <span className="text-blue-200">for Your Business</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Streamline your operations with our complete POS solution. Manage orders, 
            track inventory, and grow your business with powerful analytics.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Users, title: 'Staff Management', desc: 'Role-based access control' },
              { icon: CreditCard, title: 'Payment Processing', desc: 'Multiple payment methods' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Business insights' },
              { icon: Store, title: 'Order Management', desc: 'Kitchen workflow' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-blue-200 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
               style={{
                 backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                 backgroundSize: '50px 50px'
               }} />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your POS system
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="h-11"
                    autoComplete="username"
                    disabled={loginMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-11 pr-10"
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Demo Accounts</h3>
                <div className="grid gap-3">
                  {[
                    { username: 'admin', role: 'Admin', bg: 'bg-red-100 text-red-700', desc: 'Full access', password: 'admin123' },
                    { username: 'manager1', role: 'Manager', bg: 'bg-blue-100 text-blue-700', desc: 'Management access', password: 'password123' },
                    { username: 'cashier1', role: 'Cashier', bg: 'bg-green-100 text-green-700', desc: 'Order & payment', password: 'password123' },
                    { username: 'kitchen1', role: 'Kitchen', bg: 'bg-yellow-100 text-yellow-700', desc: 'Kitchen orders', password: 'password123' },
                  ].map((account) => (
                    <button
                      key={account.username}
                      onClick={() => fillDemoCredentials(account.username, account.password)}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                      disabled={loginMutation.isPending}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={account.bg}>{account.role}</Badge>
                        <div>
                          <div className="font-medium text-sm">{account.username}</div>
                          <div className="text-xs text-gray-500">{account.desc}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{account.password}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
