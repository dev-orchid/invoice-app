import Link from 'next/link'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { getNextInvoiceNumber } from '@/actions/invoices'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewInvoicePage() {
  const nextInvoiceNumber = await getNextInvoiceNumber()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
          <p className="text-muted-foreground">Create a new invoice for your client.</p>
        </div>
      </div>

      <InvoiceForm nextInvoiceNumber={nextInvoiceNumber} />
    </div>
  )
}
