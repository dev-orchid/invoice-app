'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice'
import { getFinancialYearRange } from '@/lib/utils'

// Returns the next sequential invoice number within the Indian financial
// year (Apr 1 – Mar 31) containing `forDate` (defaults to today). Resets to
// 1 at the start of each new FY.
export async function getNextInvoiceNumber(forDate?: string) {
  const supabase = await createClient()
  const { start, end } = getFinancialYearRange(forDate || new Date())

  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .gte('invoice_date', start)
    .lte('invoice_date', end)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data?.invoice_number || 0) + 1
}

export async function createInvoice(formData: InvoiceFormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = invoiceSchema.parse(formData)
  const { items, ...invoiceData } = validated

  // Create invoice (GST calculations happen via database trigger)
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      created_by: user.id,
    })
    .select()
    .single()

  if (invoiceError) throw invoiceError

  // Create line items
  const lineItems = items.map((item, index) => ({
    ...item,
    invoice_id: invoice.id,
    total: item.rate * item.quantity,
    sort_order: index,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(lineItems)

  if (itemsError) throw itemsError

  revalidatePath('/dashboard/invoices')
  return invoice
}

export async function updateInvoice(id: string, formData: InvoiceFormData) {
  const supabase = await createClient()

  const validated = invoiceSchema.parse(formData)
  const { items, ...invoiceData } = validated

  // Update invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)

  if (invoiceError) throw invoiceError

  // Delete existing items and re-insert
  await supabase.from('invoice_items').delete().eq('invoice_id', id)

  const lineItems = items.map((item, index) => ({
    ...item,
    invoice_id: id,
    total: item.rate * item.quantity,
    sort_order: index,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(lineItems)

  if (itemsError) throw itemsError

  revalidatePath('/dashboard/invoices')
  revalidatePath(`/dashboard/invoices/${id}`)
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()

  // Soft delete
  const { error } = await supabase
    .from('invoices')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/invoices')
}

export async function getInvoices(options?: { startDate?: string; endDate?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('invoices')
    .select(
      `
      *,
      invoice_items (*),
      profiles:created_by (username)
    `
    )
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (options?.startDate) {
    query = query.gte('invoice_date', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('invoice_date', options.endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getInvoice(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
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

  if (error) throw error
  return data
}
