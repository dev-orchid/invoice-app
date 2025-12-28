import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { InvoicesList } from '@/components/invoice/invoices-list'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      `
      *,
      profiles:created_by (username)
    `
    )
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Invoices</h2>
          <p className="text-sm text-muted-foreground md:text-base">Manage your invoices here.</p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto md:size-default">
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <InvoicesList invoices={invoices} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-muted-foreground">No invoices found.</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/invoices/new">
                  <Plus className="mr-2 h-4 w-4" /> Create your first invoice
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
