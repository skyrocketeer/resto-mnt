import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Trash2, 
  CreditCard,
  Receipt,
  MapPin
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import apiClient from '@/api/client'
import type { CartItem, DiningTable, CreateOrderRequest, CreateOrderItem } from '@/types'

interface OrderCartProps {
  items: CartItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  selectedTable: DiningTable | null
  orderType: 'dine_in' | 'takeout' | 'delivery'
  customerName: string
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
}

export function OrderCart({
  items,
  subtotal,
  taxAmount,
  totalAmount,
  selectedTable,
  orderType,
  customerName,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: OrderCartProps) {
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const response = await apiClient.createOrder(orderData)
      return response
    },
    onSuccess: () => {
      // Clear cart and refresh data
      onClearCart()
      setNotes('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      
      // Show success message (you might want to use a toast library)
      alert('Order created successfully!')
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to create order')
    }
  })

  const handleCreateOrder = async () => {
    if (items.length === 0) {
      alert('Please add items to the cart')
      return
    }

    if (orderType === 'dine_in' && !selectedTable) {
      alert('Please select a table for dine-in orders')
      return
    }

    if (orderType !== 'dine_in' && !customerName.trim()) {
      alert(`Please enter customer ${orderType === 'delivery' ? 'address' : 'name'}`)
      return
    }

    const orderItems: CreateOrderItem[] = items.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      special_instructions: undefined
    }))

    const orderData: CreateOrderRequest = {
      table_id: selectedTable?.id,
      customer_name: orderType !== 'dine_in' ? customerName.trim() : undefined,
      order_type: orderType,
      items: orderItems,
      notes: notes.trim() || undefined
    }

    createOrderMutation.mutate(orderData)
  }

  const canCheckout = items.length > 0 && 
    (orderType !== 'dine_in' || selectedTable) && 
    (orderType === 'dine_in' || customerName.trim())

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Current Order</h3>
          </div>
          {items.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearCart}
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Order Info */}
      {(selectedTable || customerName || orderType !== 'dine_in') && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="capitalize">{orderType.replace('_', ' ')}</Badge>
              {selectedTable && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Table {selectedTable.table_number}
                </Badge>
              )}
            </div>
            {customerName && (
              <p className="text-sm text-gray-600">
                {orderType === 'delivery' ? 'Address' : 'Customer'}: {customerName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cart is empty</h3>
              <p className="text-gray-500">
                Select products from the menu to start building an order.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <Card key={item.product.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(item.product.price)} each
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 h-6 w-6 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Order Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes (Optional)
              </label>
              <Input
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Order Summary & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          {/* Order Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Item Count */}
          <p className="text-sm text-gray-500 mb-4">
            {items.reduce((sum, item) => sum + item.quantity, 0)} items in cart
          </p>

          {/* Checkout Button */}
          <Button
            onClick={handleCreateOrder}
            disabled={!canCheckout || createOrderMutation.isPending}
            className="w-full"
            size="lg"
          >
            {createOrderMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Order...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 mr-2" />
                Create Order
              </>
            )}
          </Button>

          {!canCheckout && items.length > 0 && (
            <p className="text-xs text-red-600 mt-2 text-center">
              {orderType === 'dine_in' && !selectedTable && 'Please select a table'}
              {orderType !== 'dine_in' && !customerName.trim() && `Please enter customer ${orderType === 'delivery' ? 'address' : 'name'}`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

