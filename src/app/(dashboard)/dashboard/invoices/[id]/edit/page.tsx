import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/forms/invoice-form'

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Edit Invoice #{String(invoice.invoice_number).padStart(4, '0')}
        </h2>
        <p className="text-muted-foreground">Update the invoice details.</p>
      </div>

      <InvoiceForm initialData={invoice} />
    </div>
  )
}
