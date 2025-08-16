import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  Search,
  Filter,
  FileBarChart,
  Users,
  Clock
} from 'lucide-react'
import { PaginationControlsComponent } from '@/components/ui/pagination-controls'
import { usePagination } from '@/hooks/usePagination'
import { StatsCardSkeleton, SearchingSkeleton } from '@/components/ui/skeletons'
import { InlineLoading } from '@/components/ui/loading-spinner'
// import apiClient from '@/api/client' // Commented out as it's not used yet

// Interfaces defined for future use when connecting to real API
// interface SalesReport {
//   id: string
//   order_number: string
//   table_number?: string
//   customer_name?: string
//   items: { name: string; quantity: number; price: number }[]
//   total_amount: number
//   order_type: 'dine-in' | 'take-away' | 'delivery'
//   status: string
//   created_at: string
// }

// interface RevenueReport {
//   date: string
//   total_orders: number
//   total_revenue: number
//   average_order_value: number
// }

export function AdminReports() {
  const [activeTab, setActiveTab] = useState<'sales' | 'revenue' | 'analytics'>('sales')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateRange] = useState({ from: '', to: '' }) // setDateRange will be used later
  const [isSearching, setIsSearching] = useState(false)

  // Pagination hooks for different reports
  const salesPagination = usePagination({ 
    initialPage: 1, 
    initialPageSize: 15,
    total: 0 
  })

  const revenuePagination = usePagination({ 
    initialPage: 1, 
    initialPageSize: 10,
    total: 0 
  })

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setIsSearching(true)
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      salesPagination.goToFirstPage()
      setIsSearching(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearch])

  // Fetch sales reports with pagination
  const { data: salesData, isLoading: isLoadingSales, isFetching: isFetchingSales } = useQuery({
    queryKey: ['sales-reports', salesPagination.page, salesPagination.pageSize, debouncedSearch, dateRange],
    queryFn: async () => {
      // Simulate API call - replace with actual endpoint
      const mockData = {
        data: Array.from({ length: salesPagination.pageSize }, (_, i) => ({
          id: `order-${salesPagination.page}-${i + 1}`,
          order_number: `ORD-${String((salesPagination.page - 1) * salesPagination.pageSize + i + 1).padStart(6, '0')}`,
          table_number: Math.random() > 0.3 ? `Table ${Math.floor(Math.random() * 20) + 1}` : undefined,
          customer_name: Math.random() > 0.5 ? `Customer ${i + 1}` : undefined,
          items: [
            { name: 'Burger Deluxe', quantity: 2, price: 12.99 },
            { name: 'Fries', quantity: 1, price: 4.99 }
          ],
          total_amount: Math.floor(Math.random() * 50) + 15,
          order_type: ['dine-in', 'take-away', 'delivery'][Math.floor(Math.random() * 3)] as any,
          status: ['completed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })),
        pagination: {
          total: 127, // Mock total
          page: salesPagination.page,
          totalPages: Math.ceil(127 / salesPagination.pageSize),
          hasNextPage: salesPagination.page < Math.ceil(127 / salesPagination.pageSize),
          hasPreviousPage: salesPagination.page > 1
        }
      }
      return mockData
    },
    placeholderData: (previousData: any) => previousData,
  })

  // Fetch revenue reports with pagination
  const { data: revenueData, isLoading: isLoadingRevenue, isFetching: isFetchingRevenue } = useQuery({
    queryKey: ['revenue-reports', revenuePagination.page, revenuePagination.pageSize, dateRange],
    queryFn: async () => {
      // Simulate API call - replace with actual endpoint
      const mockData = {
        data: Array.from({ length: revenuePagination.pageSize }, (_, i) => ({
          date: new Date(Date.now() - (i + (revenuePagination.page - 1) * revenuePagination.pageSize) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_orders: Math.floor(Math.random() * 50) + 20,
          total_revenue: Math.floor(Math.random() * 2000) + 500,
          average_order_value: Math.floor(Math.random() * 30) + 15
        })),
        pagination: {
          total: 60, // Mock total (2 months of data)
          page: revenuePagination.page,
          totalPages: Math.ceil(60 / revenuePagination.pageSize),
          hasNextPage: revenuePagination.page < Math.ceil(60 / revenuePagination.pageSize),
          hasPreviousPage: revenuePagination.page > 1
        }
      }
      return mockData
    },
    placeholderData: (previousData: any) => previousData,
  })

  // Extract data with proper typing
  const salesReports: any[] = (salesData as any)?.data || []
  const salesPaginationInfo: any = (salesData as any)?.pagination || { total: 0 }
  
  const revenueReports: any[] = (revenueData as any)?.data || []
  const revenuePaginationInfo: any = (revenueData as any)?.pagination || { total: 0 }

  // Calculate summary stats
  const summaryStats = {
    totalRevenue: revenueReports.reduce((sum: number, report: any) => sum + report.total_revenue, 0),
    totalOrders: revenueReports.reduce((sum: number, report: any) => sum + report.total_orders, 0),
    averageOrderValue: revenueReports.length > 0 
      ? revenueReports.reduce((sum: number, report: any) => sum + report.average_order_value, 0) / revenueReports.length
      : 0
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderTypeBadge = (type: string) => {
    switch (type) {
      case 'dine-in':
        return 'bg-blue-100 text-blue-800'
      case 'take-away':
        return 'bg-purple-100 text-purple-800'
      case 'delivery':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Track sales performance and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoadingSales || isLoadingRevenue ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${summaryStats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{summaryStats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold">${summaryStats.averageOrderValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                    <p className="text-2xl font-bold">+12.3%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Sales Reports ({salesPaginationInfo.total || salesReports.length})
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue Reports ({revenuePaginationInfo.total || revenueReports.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Search Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {isSearching && (
                <div className="absolute right-2 top-2.5">
                  <InlineLoading size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Sales Reports List */}
          {isLoadingSales ? (
            <div className="space-y-4">
              {Array.from({ length: salesPagination.pageSize }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-6 w-16 bg-muted rounded-full" />
                          <div className="h-6 w-20 bg-muted rounded-full" />
                        </div>
                        <div className="h-3 w-64 bg-muted rounded" />
                        <div className="h-3 w-96 bg-muted rounded" />
                      </div>
                      <div className="h-6 w-20 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isSearching && searchTerm ? (
            <SearchingSkeleton />
          ) : (
            <div className="space-y-4">
              {salesReports.map((report: any) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{report.order_number}</span>
                          <Badge className={getStatusBadge(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge className={getOrderTypeBadge(report.order_type)}>
                            {report.order_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {report.table_number && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {report.table_number}
                            </span>
                          )}
                          {report.customer_name && (
                            <span>{report.customer_name}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {report.items.length} item(s): {report.items.map((item: any) => `${item.name} x${item.quantity}`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ${report.total_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination for Sales */}
          {salesReports.length > 0 && (
            <div className="mt-6 space-y-4">
              {isFetchingSales && !isLoadingSales && (
                <div className="flex justify-center">
                  <InlineLoading text="Updating sales reports..." />
                </div>
              )}
              <PaginationControlsComponent
                pagination={salesPagination}
                total={salesPaginationInfo.total || salesReports.length}
                pageSizeOptions={[10, 15, 25, 50]}
              />
            </div>
          )}
        </TabsContent>

        {/* Revenue Reports Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Reports List */}
          {isLoadingRevenue ? (
            <div className="space-y-4">
              {Array.from({ length: revenuePagination.pageSize }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-48 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                      <div className="h-8 w-24 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {revenueReports.map((report: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {report.total_orders} orders • Avg: ${report.average_order_value.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ${report.total_revenue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination for Revenue */}
          {revenueReports.length > 0 && (
            <div className="mt-6 space-y-4">
              {isFetchingRevenue && !isLoadingRevenue && (
                <div className="flex justify-center">
                  <InlineLoading text="Updating revenue reports..." />
                </div>
              )}
              <PaginationControlsComponent
                pagination={revenuePagination}
                total={revenuePaginationInfo.total || revenueReports.length}
              />
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced charts and analytics features will be available here.
                </p>
                <div className="mt-6">
                  <Button variant="outline">
                    View Sample Charts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}