import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Eye, Pencil, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { DeleteInvoiceButton } from '@/components/invoice/delete-invoice-button'

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <Badge className="bg-green-500">Paid</Badge>
      case 'advance':
        return <Badge className="bg-yellow-500">Advance</Badge>
      default:
        return <Badge variant="destructive">Unpaid</Badge>
    }
  }

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
        <CardContent className="p-0 md:p-6 md:pt-0">
          {invoices && invoices.length > 0 ? (
            <>
              {/* Mobile card view */}
              <div className="block md:hidden divide-y">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          INV-{String(invoice.invoice_number).padStart(4, '0')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      {getStatusBadge(invoice.payment_status)}
                    </div>
                    <div>
                      <p className="font-medium">{invoice.client_name}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">Rs. {invoice.grand_total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due:</span>
                      <span className="text-destructive font-medium">Rs. {invoice.due_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/invoice/${invoice.id}`} target="_blank">
                          <Printer className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          INV-{String(invoice.invoice_number).padStart(4, '0')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{invoice.client_name}</TableCell>
                        <TableCell>Rs. {invoice.grand_total.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-green-600">
                          Rs. {invoice.paid_amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-destructive">
                          Rs. {invoice.due_amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.payment_status)}</TableCell>
                        <TableCell>{invoice.profiles?.username || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/invoice/${invoice.id}`} target="_blank">
                                <Printer className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DeleteInvoiceButton invoiceId={invoice.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
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
