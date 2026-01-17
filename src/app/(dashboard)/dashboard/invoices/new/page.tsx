import { InvoiceForm } from '@/components/forms/invoice-form'
import { getNextInvoiceNumber } from '@/actions/invoices'

export default async function NewInvoicePage() {
  const nextInvoiceNumber = await getNextInvoiceNumber()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
        <p className="text-muted-foreground">Create a new invoice for your client.</p>
      </div>

      <InvoiceForm nextInvoiceNumber={nextInvoiceNumber} />
    </div>
  )
}
