'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  is_active: z.boolean().default(true),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export async function createCategory(formData: CategoryFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = categorySchema.parse(formData)

  const { error } = await supabase
    .from('categories')
    .insert({
      ...validated,
      created_by: user.id,
    })

  if (error) throw error
  revalidatePath('/dashboard/categories')
}

export async function updateCategory(id: string, formData: CategoryFormData) {
  const supabase = await createClient()

  const validated = categorySchema.parse(formData)

  const { error } = await supabase
    .from('categories')
    .update(validated)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/categories')
}

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', false)
    .order('name')

  if (error) throw error
  return data
}

// Bulk import categories from CSV data
export async function bulkImportCategories(names: string[]) {
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
    throw new Error('No valid category names provided')
  }

  // Get existing categories to avoid duplicates
  const { data: existing } = await supabase
    .from('categories')
    .select('name')
    .eq('is_deleted', false)

  const existingNames = new Set(existing?.map(c => c.name.toLowerCase()) || [])
  const newNames = uniqueNames.filter(n => !existingNames.has(n.toLowerCase()))

  if (newNames.length === 0) {
    return { imported: 0, skipped: uniqueNames.length }
  }

  const { error } = await supabase
    .from('categories')
    .insert(newNames.map(name => ({
      name: name.trim(),
      is_active: true,
      created_by: user.id,
    })))

  if (error) throw error

  revalidatePath('/dashboard/categories')
  return { imported: newNames.length, skipped: uniqueNames.length - newNames.length }
}
