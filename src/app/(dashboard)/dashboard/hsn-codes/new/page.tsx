import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HsnCatalogForm } from '@/components/forms/hsn-catalog-form'

export default async function NewHsnEntryPage() {
  const supabase = await createClient()

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
        <h2 className="text-2xl font-bold tracking-tight">Add HSN Entry</h2>
        <p className="text-muted-foreground">
          Map an HSN code to a product name and rate. Used to auto-fill invoice line items.
        </p>
      </div>

      <HsnCatalogForm />
    </div>
  )
}
