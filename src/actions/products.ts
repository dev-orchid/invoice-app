'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  image_url: z.string().nullable().optional(),
  brand_id: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  quantity: z.number().int().min(0),
  rate: z.number().positive('Rate must be positive'),
  hsn_code: z.string().optional(),
  unit: z.string().default('KGS'),
  is_active: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productSchema>

export async function createProduct(formData: ProductFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = productSchema.parse(formData)

  const { error } = await supabase
    .from('products')
    .insert({
      ...validated,
      created_by: user.id,
    })

  if (error) throw error
  revalidatePath('/dashboard/products')
}

export async function updateProduct(id: string, formData: ProductFormData) {
  const supabase = await createClient()

  const validated = productSchema.parse(formData)

  const { error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/products')
}

export async function getProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brands:brand_id (name),
      categories:category_id (name)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
