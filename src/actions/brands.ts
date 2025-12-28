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
