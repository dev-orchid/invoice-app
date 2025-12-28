import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pencil, Printer, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default async function ViewInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select(
      `
      *,
      invoice_items (*),
      profiles:created_by (username)
    `
    )
    .eq('id', id)
    .single()

  if (!invoice) {
    notFound()
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Invoice #{String(invoice.invoice_number).padStart(4, '0')}
            </h2>
            <p className="text-muted-foreground">
              Created on {format(new Date(invoice.created_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/invoice/${id}`} target="_blank">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/invoices/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{invoice.client_name}</span>
            </div>
            {invoice.client_contact && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span>{invoice.client_contact}</span>
              </div>
            )}
            {invoice.gstin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">GSTIN:</span>
                <span>{invoice.gstin}</span>
              </div>
            )}
            {invoice.ship_address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="text-right max-w-xs">{invoice.ship_address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Date:</span>
              <span>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Type:</span>
              <span className="capitalize">{invoice.payment_type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(invoice.payment_status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By:</span>
              <span>{invoice.profiles?.username || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                <th className="p-3">#</th>
                <th className="p-3">Description</th>
                <th className="p-3">HSN/SAC</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3">Unit</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items
                .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
                .map((item: { id: string; product_name: string; hsn_code: string | null; rate: number; quantity: number; unit: string; total: number }, index: number) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{item.product_name}</td>
                    <td className="p-3">{item.hsn_code || '-'}</td>
                    <td className="p-3 text-right">Rs. {item.rate.toFixed(2)}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3 text-right font-medium">
                      Rs. {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md ml-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sub Total:</span>
            <span>Rs. {invoice.sub_total.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Discount:</span>
              <span>- Rs. {invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">CGST (9%):</span>
            <span>Rs. {invoice.cgst_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SGST (9%):</span>
            <span>Rs. {invoice.sgst_amount.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total:</span>
            <span>Rs. {invoice.grand_total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Paid Amount:</span>
            <span>Rs. {invoice.paid_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-destructive font-bold">
            <span>Due Amount:</span>
            <span>Rs. {invoice.due_amount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
