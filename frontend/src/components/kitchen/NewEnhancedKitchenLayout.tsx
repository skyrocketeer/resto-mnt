import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  AlertCircle,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/api/client';
import type { User as UserType, Order } from '@/types';

interface NewEnhancedKitchenLayoutProps {
  user: UserType;
}

export function NewEnhancedKitchenLayout({ user }: NewEnhancedKitchenLayoutProps) {
  const [selectedTab, setSelectedTab] = useState('active-orders');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);

  // Fetch kitchen orders
  const { data: ordersResponse, isLoading, refetch, error } = useQuery({
    queryKey: ['newEnhancedKitchenOrders'],
    queryFn: () => apiClient.getKitchenOrders('all'),
    refetchInterval: autoRefresh ? 3000 : false,
    select: (data) => data.data || [],
  });

  const orders = ordersResponse || [];

  // Group orders by status
  const ordersByStatus = {
    confirmed: orders.filter((order: Order) => order.status === 'confirmed'),
    preparing: orders.filter((order: Order) => order.status === 'preparing'),
    ready: orders.filter((order: Order) => order.status === 'ready'),
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    newOrders: ordersByStatus.confirmed.length,
    preparing: ordersByStatus.preparing.length,
    ready: ordersByStatus.ready.length,
    urgent: orders.filter((order: Order) => {
      const created = new Date(order.created_at);
      const now = new Date();
      const minutesWaiting = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
      return minutesWaiting > 15;
    }).length,
  };

  // Handle logout
  const handleLogout = () => {
    apiClient.clearAuth();
    window.location.href = '/login';
  };

  // Handle order status update
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      refetch();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Handle item status update
  const handleItemStatusUpdate = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      await apiClient.updateOrderItemStatus(orderId, itemId, newStatus);
      refetch();
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  };

  // Enhanced Order Card Component
  const EnhancedOrderCard = ({ order }: { order: Order }) => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    
    const toggleItem = (itemId: string) => {
      const newChecked = new Set(checkedItems);
      if (newChecked.has(itemId)) {
        newChecked.delete(itemId);
      } else {
        newChecked.add(itemId);
      }
      setCheckedItems(newChecked);
      
      // Update item status
      const newStatus = newChecked.has(itemId) ? 'ready' : 'preparing';
      handleItemStatusUpdate(order.id, itemId, newStatus);
      
      // Auto-complete order if all items are checked
      if (order.items && newChecked.size === order.items.length) {
        setTimeout(() => {
          handleOrderStatusUpdate(order.id, 'ready');
        }, 500);
      }
    };

    const getUrgencyColor = () => {
      const created = new Date(order.created_at);
      const now = new Date();
      const minutesWaiting = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
      
      if (minutesWaiting > 20) return 'border-red-500 bg-red-50';
      if (minutesWaiting > 10) return 'border-orange-500 bg-orange-50';
      return 'border-blue-500 bg-blue-50';
    };

    const progress = order.items ? (checkedItems.size / order.items.length) * 100 : 0;
    const waitTime = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 1000 / 60);

    // Mock items if none exist (for demo purposes)
    const displayItems = order.items && order.items.length > 0 ? order.items : [
      {
        id: '1',
        order_id: order.id,
        product_id: '1',
        quantity: 2,
        unit_price: 12.99,
        total_price: 25.98,
        special_instructions: 'No onions',
        status: 'preparing' as const,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product: { id: '1', name: 'Cheeseburger', price: 12.99, description: 'Beef patty with cheese', category_id: '1', is_available: true, created_at: '', updated_at: '' }
      },
      {
        id: '2',
        order_id: order.id,
        product_id: '2',
        quantity: 1,
        unit_price: 4.99,
        total_price: 4.99,
        special_instructions: 'Extra crispy',
        status: 'preparing' as const,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product: { id: '2', name: 'French Fries', price: 4.99, description: 'Crispy golden fries', category_id: '2', is_available: true, created_at: '', updated_at: '' }
      },
      {
        id: '3',
        order_id: order.id,
        product_id: '3',
        quantity: 1,
        unit_price: 2.99,
        total_price: 2.99,
        special_instructions: null,
        status: 'preparing' as const,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product: { id: '3', name: 'Coca Cola', price: 2.99, description: 'Refreshing cola drink', category_id: '3', is_available: true, created_at: '', updated_at: '' }
      }
    ];

    return (
      <Card className={cn("w-full max-w-lg mx-auto min-h-[500px]", getUrgencyColor())}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold">
              #{order.order_number}
            </CardTitle>
            <Badge 
              variant={order.status === 'confirmed' ? 'secondary' : order.status === 'preparing' ? 'default' : 'outline'}
              className="text-sm px-3 py-1"
            >
              {order.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span className="font-medium">
              {order.order_type.replace('_', ' ').toUpperCase()} • {order.customer_name || 'Guest'}
            </span>
            <span className="font-medium">
              {waitTime}m ago
            </span>
          </div>
          
          {order.table && (
            <div className="text-sm text-muted-foreground mb-3">
              📍 Table {order.table.table_number}
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground mt-2 font-medium">
            {checkedItems.size} of {displayItems.length} items completed ({Math.round(progress)}%)
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Order Items with Checkboxes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Food Items:
            </h4>
            
            {displayItems.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border-2 hover:border-blue-200 transition-colors">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all mt-1 flex-shrink-0",
                    checkedItems.has(item.id)
                      ? "bg-green-500 border-green-500 text-white shadow-lg"
                      : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                  )}
                >
                  {checkedItems.has(item.id) && <CheckCircle className="w-5 h-5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-semibold text-lg mb-2",
                    checkedItems.has(item.id) && "line-through text-muted-foreground"
                  )}>
                    {item.quantity}x {item.product?.name || `Item ${index + 1}`}
                  </div>
                  
                  {item.special_instructions && (
                    <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-800">
                      <strong>Special:</strong> {item.special_instructions}
                    </div>
                  )}
                  
                  <div className={cn(
                    "text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block",
                    checkedItems.has(item.id) 
                      ? "bg-green-100 text-green-800" 
                      : "bg-orange-100 text-orange-800"
                  )}>
                    {checkedItems.has(item.id) ? '✅ Ready' : '🍳 Cooking'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Notes */}
          {order.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-semibold text-blue-900 mb-1">Order Notes:</h5>
              <p className="text-blue-800 text-sm">{order.notes}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {order.status === 'confirmed' && (
              <Button 
                onClick={() => handleOrderStatusUpdate(order.id, 'preparing')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                size="lg"
              >
                <ChefHat className="w-5 h-5 mr-2" />
                Start Cooking
              </Button>
            )}
            
            {order.status === 'preparing' && (
              <Button 
                onClick={() => handleOrderStatusUpdate(order.id, 'ready')}
                className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg"
                size="lg"
                disabled={checkedItems.size === 0}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark All Ready
              </Button>
            )}
            
            {order.status === 'ready' && (
              <div className="flex-1 bg-green-100 border-2 border-green-500 rounded-lg p-3 text-center">
                <div className="text-green-800 font-bold text-lg">
                  🎉 Order Complete!
                </div>
                <div className="text-green-600 text-sm">
                  Ready for pickup/serving
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Takeaway Board Component
  const TakeawayBoard = () => {
    const takeawayOrders = orders.filter(order => 
      order.order_type === 'takeout' && order.status === 'ready'
    );

    if (takeawayOrders.length === 0) {
      return (
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No takeaway orders ready</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {takeawayOrders.map((order) => {
          const waitTime = Math.floor((new Date().getTime() - new Date(order.updated_at).getTime()) / 1000 / 60);
          
          return (
            <Card key={order.id} className="border-green-500 bg-green-50">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-green-800">
                  #{order.order_number}
                </CardTitle>
                <div className="text-lg font-semibold">{order.customer_name || 'Guest'}</div>
                <Badge variant="outline" className="text-green-700 border-green-700">
                  Ready for pickup
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-muted-foreground">
                  Ready for {waitTime} minutes
                </div>
                <div className="mt-2">
                  {order.items?.map((item, index) => (
                    <div key={item.id} className="text-sm">
                      {item.quantity}x {item.product?.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Sound Settings Panel
  const SoundSettingsPanel = () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Sound Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable Sounds</label>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              soundEnabled ? "bg-blue-600" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform",
              soundEnabled ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              // Play a simple beep sound for new order
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
              gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.5);
            }}
          >
            Test New Order
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              // Play a different beep sound for ready order
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
              gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.3);
            }}
          >
            Test Ready
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
                <p className="text-sm text-gray-500">
                  Chef {user.first_name} • {stats.total} active orders
                </p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {stats.newOrders} New
              </Badge>
              <Badge variant="default" className="text-sm">
                {stats.preparing} Preparing
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.ready} Ready
              </Badge>
              {stats.urgent > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {stats.urgent} Urgent
                </Badge>
              )}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-4">
            {/* Auto-refresh indicator */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-300"
              )} />
              <span className="text-sm text-gray-600">
                {autoRefresh ? 'Live updates' : 'Manual refresh'}
              </span>
            </div>

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>

            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Clock className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSoundSettings(!showSoundSettings)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sound Settings Overlay */}
      {showSoundSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <SoundSettingsPanel />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSoundSettings(false)}
              className="absolute -top-2 -right-2"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active-orders" className="text-lg py-3">
              <ChefHat className="w-5 h-5 mr-2" />
              Kitchen Orders ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="takeaway-ready" className="text-lg py-3">
              <Package className="w-5 h-5 mr-2" />
              Takeaway Ready ({orders.filter(o => o.order_type === 'takeout' && o.status === 'ready').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-orders" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-500">Loading kitchen orders...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                  <p className="text-red-600">Failed to load orders</p>
                  <Button onClick={() => refetch()} className="mt-2">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
                  <p className="text-gray-500">Kitchen is all caught up!</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orders.map((order) => (
                  <EnhancedOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="takeaway-ready">
            <TakeawayBoard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
