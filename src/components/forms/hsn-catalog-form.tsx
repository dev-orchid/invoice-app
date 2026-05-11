'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { createHsnEntry, updateHsnEntry } from '@/actions/hsn-catalog'
import { toast } from 'sonner'

const hsnCatalogSchema = z.object({
  hsn_code: z.string().min(1, 'HSN code is required'),
  product_name: z.string().min(1, 'Product name is required'),
  rate: z.number().positive('Rate must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  is_active: z.boolean(),
})

type HsnCatalogFormData = z.infer<typeof hsnCatalogSchema>

interface HsnCatalogFormProps {
  initialData?: {
    id: string
    hsn_code: string
    product_name: string
    rate: number
    unit: string
    is_active: boolean
  }
}

export function HsnCatalogForm({ initialData }: HsnCatalogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<HsnCatalogFormData>({
    resolver: zodResolver(hsnCatalogSchema),
    defaultValues: initialData || {
      hsn_code: '',
      product_name: '',
      rate: 0,
      unit: 'KGS',
      is_active: true,
    },
  })

  async function onSubmit(data: HsnCatalogFormData) {
    setIsSubmitting(true)
    try {
      if (initialData?.id) {
        await updateHsnEntry(initialData.id, data)
        toast.success('HSN entry updated')
      } else {
        await createHsnEntry(data)
        toast.success('HSN entry created')
      }
      router.push('/dashboard/hsn-codes')
    } catch {
      toast.error('Failed to save HSN entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>HSN Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code *</Label>
              <Input
                {...form.register('hsn_code')}
                placeholder="e.g., 73069090"
                autoComplete="off"
              />
              {form.formState.errors.hsn_code && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hsn_code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input {...form.register('unit')} placeholder="e.g., KGS" />
              {form.formState.errors.unit && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              {...form.register('product_name')}
              placeholder="e.g., SS PIPE & TUBE"
            />
            {form.formState.errors.product_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.product_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Rate (Rs.) *</Label>
            <Input
              type="number"
              step="0.01"
              inputMode="decimal"
              {...form.register('rate', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {form.formState.errors.rate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.rate.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => form.setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update Entry' : 'Create Entry'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
