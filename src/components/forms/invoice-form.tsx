'use client'

import { useState, useEffect } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, Loader2, ChevronDown, ChevronRight, Truck } from 'lucide-react'
import { createInvoice, updateInvoice, getNextInvoiceNumber } from '@/actions/invoices'
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice'
import { formatInvoiceNumber } from '@/lib/utils'
import { toast } from 'sonner'

const GST_RATE = 0.18 // 18% GST

interface InvoiceFormProps {
  initialData?: {
    id: string
    invoice_number: number
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
    eway_bill_no: string | null
    lr_no: string | null
    vehicle_no: string | null
    dispatched_through: string | null
    destination: string | null
    terms_of_delivery: string | null
    payment_terms: string | null
    invoice_items: Array<{
      product_name: string
      description: string | null
      hsn_code: string | null
      rate: number
      quantity: number
      unit: string
    }>
  }
  nextInvoiceNumber?: number
}

export function InvoiceForm({ initialData, nextInvoiceNumber }: InvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if there's any transport data to auto-expand
  const hasTransportData = initialData && (
    initialData.eway_bill_no ||
    initialData.lr_no ||
    initialData.vehicle_no ||
    initialData.dispatched_through ||
    initialData.destination ||
    initialData.terms_of_delivery ||
    initialData.payment_terms
  )
  const [showTransportDetails, setShowTransportDetails] = useState(!!hasTransportData)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData
      ? {
          invoice_number: initialData.invoice_number,
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
          eway_bill_no: initialData.eway_bill_no || '',
          lr_no: initialData.lr_no || '',
          vehicle_no: initialData.vehicle_no || '',
          dispatched_through: initialData.dispatched_through || '',
          destination: initialData.destination || '',
          terms_of_delivery: initialData.terms_of_delivery || '',
          payment_terms: initialData.payment_terms || '',
          items: initialData.invoice_items.map((item) => ({
            product_name: item.product_name,
            description: item.description || '',
            hsn_code: item.hsn_code || '',
            rate: item.rate,
            quantity: item.quantity,
            unit: item.unit,
          })),
        }
      : {
          invoice_number: nextInvoiceNumber || 1,
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
          eway_bill_no: '',
          lr_no: '',
          vehicle_no: '',
          dispatched_through: '',
          destination: '',
          terms_of_delivery: '',
          payment_terms: '',
          items: [{ product_name: '', description: '', hsn_code: '', rate: 0, quantity: 1, unit: 'KGS' }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchItems = form.watch('items')
  const watchDiscount = form.watch('discount') || 0
  const watchPaidAmount = form.watch('paid_amount') || 0
  const watchInvoiceNumber = form.watch('invoice_number') || 0
  const watchInvoiceDate = form.watch('invoice_date')

  // In create mode, recompute the next number when the user changes the date
  // to a different financial year (so April-onward dates start fresh at 1).
  useEffect(() => {
    if (initialData || !watchInvoiceDate) return
    if (form.formState.dirtyFields.invoice_number) return
    let cancelled = false
    getNextInvoiceNumber(watchInvoiceDate).then((next) => {
      if (cancelled) return
      if (form.formState.dirtyFields.invoice_number) return
      form.setValue('invoice_number', next, { shouldDirty: false })
    })
    return () => {
      cancelled = true
    }
  }, [watchInvoiceDate, initialData, form])

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
      {/* Invoice & Client Details */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Invoice & Client Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="invoice_number">Invoice Number *</Label>
            <Input
              type="number"
              {...form.register('invoice_number', { valueAsNumber: true })}
              placeholder="e.g., 1"
            />
            {watchInvoiceNumber > 0 && watchInvoiceDate && (
              <p className="text-xs text-muted-foreground">
                Will be saved as {formatInvoiceNumber(watchInvoiceNumber, watchInvoiceDate)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice Date</Label>
            <Input type="date" {...form.register('invoice_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN/UN</Label>
            <Input {...form.register('gstin')} placeholder="Enter GSTIN" />
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
          {/* Conditional rendering - only one view at a time to avoid duplicate form registrations */}
          {isMobile ? (
            /* Mobile view - stacked cards */
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-muted-foreground">Item {index + 1}</span>
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

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Product Name</Label>
                      <Input
                        {...form.register(`items.${index}.product_name`)}
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                      <Input
                        {...form.register(`items.${index}.description`)}
                        placeholder="Enter description (optional)"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">HSN/SAC Code</Label>
                      <Input
                        {...form.register(`items.${index}.hsn_code`)}
                        placeholder="Enter HSN code"
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Qty</Label>
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Unit</Label>
                        <Input
                          {...form.register(`items.${index}.unit`)}
                          placeholder="KGS"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t bg-muted/30 -mx-4 px-4 -mb-4 pb-3 rounded-b-lg">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-lg font-bold">
                        Rs. {((watchItems[index]?.rate || 0) * (watchItems[index]?.quantity || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop view - table */
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead className="min-w-[200px]">Product Name</TableHead>
                    <TableHead className="w-[120px]">HSN Code</TableHead>
                    <TableHead className="w-[100px]">Rate</TableHead>
                    <TableHead className="w-[100px]">Qty</TableHead>
                    <TableHead className="w-[80px]">Unit</TableHead>
                    <TableHead className="w-[120px] text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium text-muted-foreground align-top pt-4">
                        {index + 1}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <Input
                          {...form.register(`items.${index}.product_name`)}
                          placeholder="Product name"
                          className="h-9"
                        />
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Description (optional)"
                          className="h-7 mt-1 text-xs text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          {...form.register(`items.${index}.hsn_code`)}
                          placeholder="HSN"
                          className="h-9"
                          autoComplete="off"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                          placeholder="0"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          placeholder="1"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          {...form.register(`items.${index}.unit`)}
                          placeholder="KGS"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium align-top pt-4">
                        Rs. {((watchItems[index]?.rate || 0) * (watchItems[index]?.quantity || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell className="align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="text-destructive hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({ product_name: '', description: '', hsn_code: '', rate: 0, quantity: 1, unit: 'KGS' })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Transport Details - Collapsible */}
      <Card>
        <CardHeader
          className="pb-3 md:pb-6 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
          onClick={() => setShowTransportDetails(!showTransportDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg md:text-xl">Transport Details</CardTitle>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            {showTransportDetails ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {showTransportDetails && (
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 pt-0">
            <div className="space-y-2">
              <Label htmlFor="eway_bill_no">e-Way Bill No.</Label>
              <Input {...form.register('eway_bill_no')} placeholder="Enter e-Way Bill No." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr_no">LR No.</Label>
              <Input {...form.register('lr_no')} placeholder="Enter LR No." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_no">Vehicle No.</Label>
              <Input {...form.register('vehicle_no')} placeholder="Enter Vehicle No." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispatched_through">Dispatched Through</Label>
              <Input {...form.register('dispatched_through')} placeholder="e.g., Road, Rail, Air" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input {...form.register('destination')} placeholder="Enter Destination" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input {...form.register('payment_terms')} placeholder="e.g., 30 DAYS" />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="terms_of_delivery">Terms of Delivery</Label>
              <Input {...form.register('terms_of_delivery')} placeholder="Enter delivery terms" />
            </div>
          </CardContent>
        )}
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
