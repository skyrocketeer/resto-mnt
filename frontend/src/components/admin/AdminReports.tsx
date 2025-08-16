import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import apiClient from '@/api/client'

interface ReportPeriod {
  value: 'today' | 'week' | 'month' | 'quarter' | 'year'
  label: string
}

const REPORT_PERIODS: ReportPeriod[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
]

interface SalesData {
  period: string
  revenue: number
  orders: number
  avg_order_value: number
  growth_rate: number
}

interface ProductPerformance {
  product_name: string
  category: string
  quantity_sold: number
  revenue: number
  profit_margin: number
}

interface StaffPerformance {
  staff_name: string
  role: string
  orders_processed: number
  total_sales: number
  avg_order_time: number
}

export function AdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [activeReport, setActiveReport] = useState<'overview' | 'products' | 'staff' | 'detailed'>('overview')

  // Fetch sales data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['salesReport', selectedPeriod],
    queryFn: () => apiClient.getSalesReport(selectedPeriod).then(res => res.data)
  })

  // Fetch income report
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['incomeReport', selectedPeriod],
    queryFn: () => apiClient.getIncomeReport(selectedPeriod).then(res => res.data)
  })

  // Mock data for additional reports (would come from API)
  const mockProductPerformance: ProductPerformance[] = [
    { product_name: 'Classic Burger', category: 'Main Course', quantity_sold: 156, revenue: 2340.00, profit_margin: 65.2 },
    { product_name: 'Caesar Salad', category: 'Salads', quantity_sold: 89, revenue: 1068.00, profit_margin: 72.1 },
    { product_name: 'Margherita Pizza', category: 'Main Course', quantity_sold: 134, revenue: 2144.00, profit_margin: 58.9 },
    { product_name: 'Chocolate Cake', category: 'Desserts', quantity_sold: 67, revenue: 469.00, profit_margin: 80.3 },
  ]

  const mockStaffPerformance: StaffPerformance[] = [
    { staff_name: 'Sarah Smith', role: 'Server', orders_processed: 234, total_sales: 4680.00, avg_order_time: 12.5 },
    { staff_name: 'Mike Johnson', role: 'Server', orders_processed: 198, total_sales: 3960.00, avg_order_time: 14.2 },
    { staff_name: 'Lisa Davis', role: 'Counter', orders_processed: 445, total_sales: 8900.00, avg_order_time: 8.7 },
    { staff_name: 'Tom Wilson', role: 'Counter', orders_processed: 389, total_sales: 7780.00, avg_order_time: 9.1 },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const exportReport = () => {
    // TODO: Implement report export
    alert('Report export feature coming soon!')
  }

  const isLoading = salesLoading || incomeLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Custom Filter
          </Button>
        </div>
      </div>

      {/* Period Selector & Report Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {REPORT_PERIODS.map(period => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeReport === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveReport('overview')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeReport === 'products' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveReport('products')}
          >
            <PieChart className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Button
            variant={activeReport === 'staff' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveReport('staff')}
          >
            <Users className="w-4 h-4 mr-2" />
            Staff
          </Button>
        </div>
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(incomeData?.summary?.gross || 0)}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {incomeData?.summary?.total_orders || 0}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.1% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    incomeData?.summary?.total_orders ? 
                    (incomeData.summary.gross / incomeData.summary.total_orders) : 0
                  )}
                </div>
                <div className="flex items-center text-xs text-red-600 mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2.1% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(incomeData?.summary?.net || 0)}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.3% from last period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Breakdown</CardTitle>
              <CardDescription>
                Revenue breakdown for {REPORT_PERIODS.find(p => p.value === selectedPeriod)?.label.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Gross Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(incomeData?.summary?.gross || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tax Collected</p>
                  <p className="text-2xl font-bold">{formatCurrency(incomeData?.summary?.tax || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Service Charges</p>
                  <p className="text-2xl font-bold">$245.60</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Net Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(incomeData?.summary?.net || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          {incomeData?.daily_breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>
                  Day-by-day breakdown of sales performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incomeData.daily_breakdown.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{day.date}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Orders</p>
                          <p className="font-semibold">{day.orders}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-semibold">{formatCurrency(day.revenue)}</p>
                        </div>
                        <Badge variant={day.orders > 10 ? 'default' : 'secondary'}>
                          {day.orders > 10 ? 'Good' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Product Performance Report */}
      {activeReport === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>
              Best performing products for {REPORT_PERIODS.find(p => p.value === selectedPeriod)?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProductPerformance.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Sold</p>
                      <p className="font-semibold">{product.quantity_sold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Margin</p>
                      <p className="font-semibold text-green-600">{product.profit_margin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Performance Report */}
      {activeReport === 'staff' && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
            <CardDescription>
              Employee performance metrics for {REPORT_PERIODS.find(p => p.value === selectedPeriod)?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStaffPerformance.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {staff.staff_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{staff.staff_name}</p>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="font-semibold">{staff.orders_processed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Sales</p>
                      <p className="font-semibold">{formatCurrency(staff.total_sales)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Avg Time</p>
                      <p className="font-semibold">{staff.avg_order_time}min</p>
                    </div>
                    <Badge variant={staff.orders_processed > 300 ? 'default' : 'secondary'}>
                      {staff.orders_processed > 300 ? 'Excellent' : 'Good'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
