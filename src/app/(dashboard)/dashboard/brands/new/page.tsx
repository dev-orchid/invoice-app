import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BrandForm } from '@/components/forms/brand-form'

export default async function NewBrandPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Brand</h2>
        <p className="text-muted-foreground">Add a new brand for products.</p>
      </div>

      <BrandForm />
    </div>
  )
}
