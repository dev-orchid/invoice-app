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
