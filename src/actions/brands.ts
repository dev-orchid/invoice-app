'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  is_active: z.boolean().default(true),
})

export type BrandFormData = z.infer<typeof brandSchema>

export async function createBrand(formData: BrandFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = brandSchema.parse(formData)

  const { error } = await supabase
    .from('brands')
    .insert({
      ...validated,
      created_by: user.id,
    })

  if (error) throw error
  revalidatePath('/dashboard/brands')
}

export async function updateBrand(id: string, formData: BrandFormData) {
  const supabase = await createClient()

  const validated = brandSchema.parse(formData)

  const { error } = await supabase
    .from('brands')
    .update(validated)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/brands')
}

export async function deleteBrand(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('brands')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/brands')
}

export async function getBrands() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_deleted', false)
    .order('name')

  if (error) throw error
  return data
}

// Bulk import brands from CSV data
export async function bulkImportBrands(names: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can bulk import')
  }

  // Filter out empty names and duplicates
  const uniqueNames = [...new Set(names.filter(n => n.trim()))]

  if (uniqueNames.length === 0) {
    throw new Error('No valid brand names provided')
  }

  // Get existing brands to avoid duplicates
  const { data: existing } = await supabase
    .from('brands')
    .select('name')
    .eq('is_deleted', false)

  const existingNames = new Set(existing?.map(b => b.name.toLowerCase()) || [])
  const newNames = uniqueNames.filter(n => !existingNames.has(n.toLowerCase()))

  if (newNames.length === 0) {
    return { imported: 0, skipped: uniqueNames.length }
  }

  const { error } = await supabase
    .from('brands')
    .insert(newNames.map(name => ({
      name: name.trim(),
      is_active: true,
      created_by: user.id,
    })))

  if (error) throw error

  revalidatePath('/dashboard/brands')
  return { imported: newNames.length, skipped: uniqueNames.length - newNames.length }
}
