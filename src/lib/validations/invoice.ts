import { z } from 'zod'

export const invoiceItemSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  hsn_code: z.string().optional(),
  rate: z.number().positive('Rate must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string(),
})

export const invoiceSchema = z.object({
  gstin: z.string().optional(),
  invoice_date: z.string(),
  client_name: z.string().min(1, 'Client name is required'),
  client_contact: z.string().optional(),
  ship_address: z.string().optional(),
  sub_total: z.number(),
  discount: z.number(),
  paid_amount: z.number(),
  payment_type: z.enum(['cash', 'cheque', 'credit_card', 'phone_pe', 'google_pay', 'amazon_pay']),
  payment_status: z.enum(['full', 'advance', 'unpaid']),
  payment_place: z.enum(['india', 'outside_india']),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemData = z.infer<typeof invoiceItemSchema>
