'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user']),
})

const updateUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['admin', 'user']),
})

export type UserFormData = z.infer<typeof userSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can manage users')
  }

  return user
}

export async function createUser(formData: UserFormData) {
  const supabase = await createClient()
  await checkAdmin(supabase)

  const validated = userSchema.parse(formData)

  // Create auth user using admin API (requires service role key)
  // For now, we'll use signUp which creates the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        username: validated.username,
        role: validated.role,
      },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create user')

  // Update the profile with the correct role (trigger creates with default 'user')
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: validated.username,
      role: validated.role
    })
    .eq('id', authData.user.id)

  if (profileError) throw profileError

  revalidatePath('/users')
  return { success: true }
}

export async function updateUser(userId: string, formData: UpdateUserFormData) {
  const supabase = await createClient()
  await checkAdmin(supabase)

  const validated = updateUserSchema.parse(formData)

  const { error } = await supabase
    .from('profiles')
    .update({
      username: validated.username,
      role: validated.role,
    })
    .eq('id', userId)

  if (error) throw error

  revalidatePath('/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const currentUser = await checkAdmin(supabase)

  // Prevent self-deletion
  if (currentUser.id === userId) {
    throw new Error('Cannot delete your own account')
  }

  // Soft delete by updating a flag or just remove from profiles
  // Note: Full deletion requires admin API with service role
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error

  revalidatePath('/users')
  return { success: true }
}

export async function getUsers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getUser(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
