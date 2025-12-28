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
import { createBrand, updateBrand } from '@/actions/brands'
import { toast } from 'sonner'

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  is_active: z.boolean(),
})

type BrandFormData = z.infer<typeof brandSchema>

interface BrandFormProps {
  initialData?: {
    id: string
    name: string
    is_active: boolean
  }
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData || {
      name: '',
      is_active: true,
    },
  })

  async function onSubmit(data: BrandFormData) {
    setIsSubmitting(true)
    try {
      if (initialData?.id) {
        await updateBrand(initialData.id, data)
        toast.success('Brand updated successfully')
      } else {
        await createBrand(data)
        toast.success('Brand created successfully')
      }
      router.push('/dashboard/brands')
    } catch {
      toast.error('Failed to save brand')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Brand Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name *</Label>
            <Input {...form.register('name')} placeholder="Enter brand name" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
              {initialData ? 'Update Brand' : 'Create Brand'}
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
