import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Users, 
  Check,
  Clock,
  Table as TableIcon,
  Search
} from 'lucide-react'
import type { Product, Category, DiningTable, Order } from '@/types'

interface CartItem {
  product: Product
  quantity: number
  special_instructions?: string
}

interface CreateOrderRequest {
  table_id: string
  customer_name?: string
  items: Array<{
    product_id: string
    quantity: number
    special_instructions?: string
  }>
  notes?: string
}

export function ServerInterface() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories().then(res => res.data)
  })

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => {
      if (selectedCategory === 'all') {
        return apiClient.getProducts().then(res => res.data)
      } else {
        return apiClient.getProductsByCategory(selectedCategory).then(res => res.data)
      }
    }
  })

  // Fetch available tables (not occupied)
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => apiClient.getTables().then(res => res.data)
  })

  // Create order mutation (server endpoint - dine-in only)
  const createOrderMutation = useMutation({
    mutationFn: (orderData: CreateOrderRequest) => 
      apiClient.createServerOrder(orderData),
    onSuccess: () => {
      // Reset form
      setCart([])
      setSelectedTable(null)
      setCustomerName('')
      setOrderNotes('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    }
  })

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  // Available tables (not occupied)
  const availableTables = tables.filter(table => !table.is_occupied)

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item.product.id === productId)
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ))
    } else {
      setCart(cart.filter(item => item.product.id !== productId))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleCreateOrder = () => {
    if (!selectedTable || cart.length === 0) return

    const orderData: CreateOrderRequest = {
      table_id: selectedTable.id,
      customer_name: customerName || undefined,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        special_instructions: item.special_instructions
      })),
      notes: orderNotes || undefined
    }

    createOrderMutation.mutate(orderData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Categories and Products */}
      <div className="w-2/3 border-r border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Server Interface</h1>
              <p className="text-muted-foreground">Create dine-in orders for guests</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Users className="w-4 h-4 mr-1" />
              Dine-In Only
            </Badge>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Items
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const cartItem = cart.find(item => item.product.id === product.id)
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                        {product.description && (
                          <CardDescription className="text-sm mt-1">
                            {product.description.substring(0, 60)}
                            {product.description.length > 60 ? '...' : ''}
                          </CardDescription>
                        )}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.preparation_time > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {product.preparation_time}min
                          </Badge>
                        )}
                        {!product.is_available && (
                          <Badge variant="secondary" className="text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>

                      {product.is_available && (
                        <div className="flex items-center gap-2">
                          {cartItem ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(product.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {cartItem.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(product)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Cart and Order */}
      <div className="w-1/3 flex flex-col bg-card">
        {/* Table Selection */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3 flex items-center">
            <TableIcon className="w-4 h-4 mr-2" />
            Select Table
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {availableTables.slice(0, 9).map(table => (
              <Button
                key={table.id}
                variant={selectedTable?.id === table.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTable(table)}
                className="h-12"
              >
                {table.table_number}
                <span className="text-xs block">
                  {table.seating_capacity} seats
                </span>
              </Button>
            ))}
          </div>
          {availableTables.length > 9 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{availableTables.length - 9} more tables available
            </p>
          )}
        </div>

        {/* Customer Info */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <Input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        {/* Cart */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Items ({cart.length})
            </h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items in order</p>
                <p className="text-sm">Add items from the menu to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToCart(item.product)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Notes */}
            {cart.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Order Notes</label>
                <Input
                  placeholder="Special requests or notes..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Order Summary and Actions */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-card">
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(getTotalAmount())}</span>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateOrder}
                disabled={!selectedTable || cart.length === 0 || createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Dine-In Order
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
