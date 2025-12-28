import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Package, DollarSign, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const [invoicesResult, productsResult, lowStockResult] = await Promise.all([
    supabase
      .from('invoices')
      .select('grand_total, paid_amount', { count: 'exact' })
      .eq('is_deleted', false),
    supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_deleted', false),
    supabase
      .from('products')
      .select('id, name, quantity', { count: 'exact' })
      .eq('is_deleted', false)
      .lte('quantity', 3),
  ])

  const totalInvoices = invoicesResult.count || 0
  const totalProducts = productsResult.count || 0
  const lowStockCount = lowStockResult.count || 0
  const lowStockProducts = lowStockResult.data || []

  const totalRevenue = invoicesResult.data?.reduce(
    (sum, inv) => sum + (inv.grand_total || 0),
    0
  ) || 0

  const stats = [
    {
      title: 'Total Invoices',
      value: totalInvoices.toString(),
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Dashboard</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 md:p-6 md:pb-2">
              <CardTitle className="text-xs font-medium md:text-sm">{stat.title}</CardTitle>
              <div className={`rounded-full p-1.5 md:p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg font-bold md:text-2xl">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Quantity: {product.quantity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
