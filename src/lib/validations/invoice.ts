import { z } from 'zod'

export const invoiceItemSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  hsn_code: z.string().optional(),
  rate: z.number().positive('Rate must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string(),
})

export const invoiceSchema = z.object({
  invoice_number: z.number().optional(),
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
  // Transport details
  eway_bill_no: z.string().optional(),
  lr_no: z.string().optional(),
  vehicle_no: z.string().optional(),
  dispatched_through: z.string().optional(),
  destination: z.string().optional(),
  terms_of_delivery: z.string().optional(),
  payment_terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemData = z.infer<typeof invoiceItemSchema>
