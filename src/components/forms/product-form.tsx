'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { Loader2 } from 'lucide-react'
import { createProduct, updateProduct } from '@/actions/products'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  image_url: z.string().nullable().optional(),
  brand_id: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  quantity: z.number().int().min(0),
  rate: z.number().positive('Rate must be positive'),
  hsn_code: z.string().optional(),
  unit: z.string(),
  is_active: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  brands: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
  initialData?: {
    id: string
    name: string
    image_url: string | null
    brand_id: string | null
    category_id: string | null
    quantity: number
    rate: number
    hsn_code: string | null
    unit: string
    is_active: boolean
  }
}

export function ProductForm({ brands, categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          image_url: initialData.image_url,
          brand_id: initialData.brand_id,
          category_id: initialData.category_id,
          quantity: initialData.quantity,
          rate: initialData.rate,
          hsn_code: initialData.hsn_code || '',
          unit: initialData.unit,
          is_active: initialData.is_active,
        }
      : {
          name: '',
          image_url: null,
          brand_id: null,
          category_id: null,
          quantity: 0,
          rate: 0,
          hsn_code: '',
          unit: 'KGS',
          is_active: true,
        },
  })

  async function onSubmit(data: ProductFormData) {
    setIsSubmitting(true)
    try {
      if (initialData?.id) {
        await updateProduct(initialData.id, data)
        toast.success('Product updated successfully')
      } else {
        await createProduct(data)
        toast.success('Product created successfully')
      }
      router.push('/dashboard/products')
    } catch {
      toast.error('Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input {...form.register('name')} placeholder="Enter product name" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input {...form.register('hsn_code')} placeholder="Enter HSN code" />
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Select
                value={form.watch('brand_id') || ''}
                onValueChange={(value) => form.setValue('brand_id', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch('category_id') || ''}
                onValueChange={(value) => form.setValue('category_id', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (Rs.) *</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register('rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.rate && (
                <p className="text-sm text-destructive">{form.formState.errors.rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                {...form.register('quantity', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={form.watch('unit')}
                onValueChange={(value) => form.setValue('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KGS">KGS</SelectItem>
                  <SelectItem value="PCS">PCS</SelectItem>
                  <SelectItem value="MTR">MTR</SelectItem>
                  <SelectItem value="NOS">NOS</SelectItem>
                  <SelectItem value="BOX">BOX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label>Product Image</Label>
            <ImageUpload
              value={form.watch('image_url')}
              onChange={(url) => form.setValue('image_url', url)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update Product' : 'Create Product'}
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
