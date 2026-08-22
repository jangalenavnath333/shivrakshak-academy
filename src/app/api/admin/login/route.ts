import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
})

const invalidLogin = () => NextResponse.json({
  error: 'ईमेल, पासवर्ड किंवा Admin परवानगी योग्य नाही. कृपया पुन्हा तपासा.',
}, { status: 401 })

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return invalidLogin()

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error || data.user?.app_metadata?.role !== 'admin') {
    console.error(
      `Admin login rejected: code=${error?.code ?? 'none'} status=${error?.status ?? 'none'} user=${Boolean(data.user)} role=${String(data.user?.app_metadata?.role ?? 'none')}`,
    )
    if (data.session) await supabase.auth.signOut()
    return invalidLogin()
  }

  return NextResponse.json({ ok: true })
}
