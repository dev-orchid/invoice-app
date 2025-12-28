'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type PasswordFormData = z.infer<typeof passwordSchema>

// Company settings schema
const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  gstin: z.string().min(1, 'GSTIN is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
})

export type CompanySettingsData = z.infer<typeof companySettingsSchema>

export async function changePassword(formData: PasswordFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const validated = passwordSchema.parse(formData)

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: validated.currentPassword,
  })

  if (signInError) {
    throw new Error('Current password is incorrect')
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: validated.newPassword,
  })

  if (updateError) throw updateError

  return { success: true }
}

export async function getCompanySettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') throw error

  // Return default values if no settings exist
  return data || {
    company_name: 'Sipahi Jee Metal Works',
    gstin: '10CEKPP9425G1ZG',
    address: 'NEW ATWARPUR KURTHAUL, Parsa Bazar, Patna, Bihar, 804453',
    phone: '',
    email: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
  }
}

export async function updateCompanySettings(formData: CompanySettingsData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can update company settings')
  }

  const validated = companySettingsSchema.parse(formData)

  // Check if settings exist
  const { data: existing } = await supabase
    .from('company_settings')
    .select('id')
    .single()

  if (existing) {
    const { error } = await supabase
      .from('company_settings')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('company_settings')
      .insert(validated)

    if (error) throw error
  }

  revalidatePath('/settings')
  return { success: true }
}
