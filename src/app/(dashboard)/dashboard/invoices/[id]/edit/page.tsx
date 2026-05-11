import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditInvoicePage({
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
      invoice_items (*)
    `
    )
    .eq('id', id)
    .single()

  if (!invoice) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/invoices/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Invoice #{String(invoice.invoice_number).padStart(4, '0')}
          </h2>
          <p className="text-muted-foreground">Update the invoice details.</p>
        </div>
      </div>

      <InvoiceForm initialData={invoice} />
    </div>
  )
}
