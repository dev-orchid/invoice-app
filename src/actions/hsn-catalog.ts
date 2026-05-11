'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const hsnCatalogSchema = z.object({
  hsn_code: z.string().min(1, 'HSN code is required'),
  product_name: z.string().min(1, 'Product name is required'),
  rate: z.number().positive('Rate must be positive'),
  unit: z.string().default('KGS'),
  is_active: z.boolean().default(true),
})

export type HsnCatalogFormData = z.infer<typeof hsnCatalogSchema>

export async function createHsnEntry(formData: HsnCatalogFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = hsnCatalogSchema.parse(formData)

  const { error } = await supabase
    .from('hsn_catalog')
    .insert({
      ...validated,
      created_by: user.id,
    })

  if (error) throw error
  revalidatePath('/dashboard/hsn-codes')
}

export async function updateHsnEntry(id: string, formData: HsnCatalogFormData) {
  const supabase = await createClient()

  const validated = hsnCatalogSchema.parse(formData)

  const { error } = await supabase
    .from('hsn_catalog')
    .update(validated)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/hsn-codes')
}

export async function deleteHsnEntry(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('hsn_catalog')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/hsn-codes')
}

export async function getHsnEntries() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hsn_catalog')
    .select('*')
    .eq('is_deleted', false)
    .order('hsn_code')

  if (error) throw error
  return data
}

// Look up active HSN entries by exact HSN code — used by the invoice form
// to auto-populate product name + rate + unit when the user enters a code.
export async function lookupByHsnCode(hsnCode: string) {
  const trimmed = hsnCode.trim()
  if (!trimmed) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hsn_catalog')
    .select('hsn_code, product_name, rate, unit')
    .eq('is_deleted', false)
    .eq('is_active', true)
    .eq('hsn_code', trimmed)
    .order('product_name')

  if (error) throw error
  return data || []
}
