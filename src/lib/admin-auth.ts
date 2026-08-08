import 'server-only'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === 'admin'
}

export async function getAdminUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !isAdminUser(user)) return null
  return user
}

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}
