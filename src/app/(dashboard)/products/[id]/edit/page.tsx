import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/forms/product-form'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const [productResult, brandsResult, categoriesResult] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('brands').select('id, name').eq('is_deleted', false).order('name'),
    supabase.from('categories').select('id, name').eq('is_deleted', false).order('name'),
  ])

  if (!productResult.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">Update product details.</p>
      </div>

      <ProductForm
        brands={brandsResult.data || []}
        categories={categoriesResult.data || []}
        initialData={productResult.data}
      />
    </div>
  )
}
