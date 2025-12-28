import { InvoiceForm } from '@/components/forms/invoice-form'

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
        <p className="text-muted-foreground">Create a new invoice for your client.</p>
      </div>

      <InvoiceForm />
    </div>
  )
}
