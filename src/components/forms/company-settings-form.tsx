'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { updateCompanySettings, type CompanySettingsData } from '@/actions/settings'
import { toast } from 'sonner'

const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  gstin: z.string().min(1, 'GSTIN is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
})

interface CompanySettingsFormProps {
  initialData: CompanySettingsData
  isAdmin: boolean
}

export function CompanySettingsForm({ initialData, isAdmin }: CompanySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CompanySettingsData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      company_name: initialData.company_name || '',
      gstin: initialData.gstin || '',
      address: initialData.address || '',
      phone: initialData.phone || '',
      email: initialData.email || '',
      bank_name: initialData.bank_name || '',
      account_number: initialData.account_number || '',
      ifsc_code: initialData.ifsc_code || '',
    },
  })

  async function onSubmit(data: CompanySettingsData) {
    setIsSubmitting(true)
    try {
      await updateCompanySettings(data)
      toast.success('Company settings updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            {...form.register('company_name')}
            placeholder="Enter company name"
            disabled={!isAdmin}
          />
          {form.formState.errors.company_name && (
            <p className="text-sm text-destructive">{form.formState.errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gstin">GSTIN *</Label>
          <Input
            id="gstin"
            {...form.register('gstin')}
            placeholder="Enter GSTIN"
            disabled={!isAdmin}
          />
          {form.formState.errors.gstin && (
            <p className="text-sm text-destructive">{form.formState.errors.gstin.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...form.register('phone')}
            placeholder="Enter phone number"
            disabled={!isAdmin}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="Enter email"
            disabled={!isAdmin}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          {...form.register('address')}
          placeholder="Enter company address"
          rows={3}
          disabled={!isAdmin}
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-4">Bank Details (for invoices)</h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              {...form.register('bank_name')}
              placeholder="Enter bank name"
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              {...form.register('account_number')}
              placeholder="Enter account number"
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc_code">IFSC Code</Label>
            <Input
              id="ifsc_code"
              {...form.register('ifsc_code')}
              placeholder="Enter IFSC code"
              disabled={!isAdmin}
            />
          </div>
        </div>
      </div>

      {isAdmin && (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">Only admins can edit company settings.</p>
      )}
    </form>
  )
}
