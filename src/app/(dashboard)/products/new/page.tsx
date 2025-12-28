import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/forms/product-form'

export default async function NewProductPage() {
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

  const [brandsResult, categoriesResult] = await Promise.all([
    supabase.from('brands').select('id, name').eq('is_deleted', false).order('name'),
    supabase.from('categories').select('id, name').eq('is_deleted', false).order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Product</h2>
        <p className="text-muted-foreground">Add a new product to your inventory.</p>
      </div>

      <ProductForm
        brands={brandsResult.data || []}
        categories={categoriesResult.data || []}
      />
    </div>
  )
}
