'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { createInvoice, updateInvoice } from '@/actions/invoices'
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice'
import { toast } from 'sonner'

const GST_RATE = 0.18 // 18% GST

interface InvoiceFormProps {
  initialData?: {
    id: string
    gstin: string | null
    invoice_date: string
    client_name: string
    client_contact: string | null
    ship_address: string | null
    discount: number
    paid_amount: number
    payment_type: 'cash' | 'cheque' | 'credit_card' | 'phone_pe' | 'google_pay' | 'amazon_pay'
    payment_status: 'full' | 'advance' | 'unpaid'
    payment_place: 'india' | 'outside_india'
    invoice_items: Array<{
      product_name: string
      hsn_code: string | null
      rate: number
      quantity: number
      unit: string
    }>
  }
}

export function InvoiceForm({ initialData }: InvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData
      ? {
          gstin: initialData.gstin || '',
          invoice_date: initialData.invoice_date,
          client_name: initialData.client_name,
          client_contact: initialData.client_contact || '',
          ship_address: initialData.ship_address || '',
          sub_total: 0,
          discount: initialData.discount,
          paid_amount: initialData.paid_amount,
          payment_type: initialData.payment_type,
          payment_status: initialData.payment_status,
          payment_place: initialData.payment_place,
          items: initialData.invoice_items.map((item) => ({
            product_name: item.product_name,
            hsn_code: item.hsn_code || '',
            rate: item.rate,
            quantity: item.quantity,
            unit: item.unit,
          })),
        }
      : {
          gstin: '',
          invoice_date: new Date().toISOString().split('T')[0],
          client_name: '',
          client_contact: '',
          ship_address: '',
          sub_total: 0,
          discount: 0,
          paid_amount: 0,
          payment_type: 'cash',
          payment_status: 'unpaid',
          payment_place: 'india',
          items: [{ product_name: '', hsn_code: '', rate: 0, quantity: 1, unit: 'KGS' }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchItems = form.watch('items')
  const watchDiscount = form.watch('discount') || 0
  const watchPaidAmount = form.watch('paid_amount') || 0

  // Calculate totals
  const subTotal = watchItems.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 0),
    0
  )
  const discountedTotal = subTotal - watchDiscount
  const gstAmount = discountedTotal * GST_RATE
  const cgstAmount = gstAmount / 2
  const sgstAmount = gstAmount / 2
  const grandTotal = discountedTotal + gstAmount
  const dueAmount = grandTotal - watchPaidAmount

  async function onSubmit(data: InvoiceFormData) {
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        sub_total: subTotal,
      }

      if (initialData?.id) {
        await updateInvoice(initialData.id, formattedData)
        toast.success('Invoice updated successfully')
      } else {
        await createInvoice(formattedData)
        toast.success('Invoice created successfully')
      }
      router.push('/dashboard/invoices')
    } catch (error) {
      toast.error('Failed to save invoice')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      {/* Client Details */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Client Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN/UN</Label>
            <Input {...form.register('gstin')} placeholder="Enter GSTIN" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice Date</Label>
            <Input type="date" {...form.register('invoice_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name *</Label>
            <Input {...form.register('client_name')} placeholder="Enter client name" />
            {form.formState.errors.client_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.client_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_contact">Contact Number</Label>
            <Input {...form.register('client_contact')} placeholder="Enter contact number" />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="ship_address">Shipping Address</Label>
            <Textarea
              {...form.register('ship_address')}
              placeholder="Enter shipping address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Product Name</Label>
                  <Input
                    {...form.register(`items.${index}.product_name`)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">HSN/SAC Code</Label>
                  <Input
                    {...form.register(`items.${index}.hsn_code`)}
                    placeholder="Enter HSN code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unit</Label>
                  <Input
                    {...form.register(`items.${index}.unit`)}
                    placeholder="KGS"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-semibold text-lg">
                  Rs. {((watchItems[index]?.rate || 0) * (watchItems[index]?.quantity || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({ product_name: '', hsn_code: '', rate: 0, quantity: 1, unit: 'KGS' })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Payment and Summary */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Discount (Rs.)</Label>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                {...form.register('discount', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Paid Amount (Rs.)</Label>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                {...form.register('paid_amount', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select
                value={form.watch('payment_type')}
                onValueChange={(value) =>
                  form.setValue('payment_type', value as InvoiceFormData['payment_type'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="phone_pe">Phone Pe</SelectItem>
                  <SelectItem value="google_pay">Google Pay</SelectItem>
                  <SelectItem value="amazon_pay">Amazon Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={form.watch('payment_status')}
                onValueChange={(value) =>
                  form.setValue('payment_status', value as InvoiceFormData['payment_status'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="advance">Advance Payment</SelectItem>
                  <SelectItem value="unpaid">No Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Place</Label>
              <Select
                value={form.watch('payment_place')}
                onValueChange={(value) =>
                  form.setValue('payment_place', value as InvoiceFormData['payment_place'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">In India</SelectItem>
                  <SelectItem value="outside_india">Outside India</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sub Total:</span>
              <span className="font-medium">Rs. {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-medium text-destructive">- Rs. {watchDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGST (9%):</span>
              <span className="font-medium">Rs. {cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SGST (9%):</span>
              <span className="font-medium">Rs. {sgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">Grand Total:</span>
              <span className="text-lg font-bold">Rs. {grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid:</span>
              <span className="font-medium">Rs. {watchPaidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span className="font-semibold">Due:</span>
              <span className="font-bold">Rs. {dueAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Invoice' : 'Create Invoice'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  )
}
