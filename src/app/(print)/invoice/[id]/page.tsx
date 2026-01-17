import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PrintView } from '@/components/invoice/print-view'
import { getCompanySettings } from '@/actions/settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('client_name')
    .eq('id', id)
    .single()

  return {
    title: invoice?.client_name || 'Invoice',
  }
}

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [invoiceResult, companySettings] = await Promise.all([
    supabase
      .from('invoices')
      .select(`*, invoice_items (*)`)
      .eq('id', id)
      .single(),
    getCompanySettings(),
  ])

  if (!invoiceResult.data) {
    notFound()
  }

  return <PrintView invoice={invoiceResult.data} companySettings={companySettings} />
}
