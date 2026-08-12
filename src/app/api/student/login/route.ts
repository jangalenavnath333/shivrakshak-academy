import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStudentLoginEmail } from '@/lib/student-auth'

const loginSchema = z.object({
  rollNumber: z.string().trim().toUpperCase().regex(/^S-\d{1,8}$/),
  password: z.string().min(8).max(72),
})

const invalidLogin = () => NextResponse.json({
  error: 'विद्यार्थी ID किंवा Password चुकीचा आहे, किंवा Exam Login अजून activate केलेले नाही.',
}, { status: 401 })

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return invalidLogin()

  const admin = createSupabaseAdminClient()
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const clientIp = forwardedFor || request.headers.get('x-real-ip') || 'unknown'
  const rollNumber = parsed.data.rollNumber

  const [ipLimit, rollLimit] = await Promise.all([
    admin.rpc('consume_student_login_rate_limit', { p_key: `ip:${clientIp}` }),
    admin.rpc('consume_student_login_rate_limit', { p_key: `roll:${rollNumber}` }),
  ])

  if (ipLimit.error || rollLimit.error) {
    console.error('Student login rate-limit failed', { ipCode: ipLimit.error?.code, rollCode: rollLimit.error?.code })
    return NextResponse.json({ error: 'Login सेवा तात्पुरती उपलब्ध नाही.' }, { status: 503 })
  }
  if (!ipLimit.data || !rollLimit.data) {
    return NextResponse.json({ error: 'खूप login प्रयत्न झाले. 15 मिनिटांनी पुन्हा प्रयत्न करा.' }, { status: 429 })
  }

  const { data: student } = await admin
    .from('students')
    .select('auth_user_id, is_active')
    .eq('roll_number', rollNumber)
    .maybeSingle()

  if (!student?.auth_user_id || !student.is_active) return invalidLogin()

  const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(student.auth_user_id)
  if (authUserError || authUser.user?.app_metadata?.role !== 'student') return invalidLogin()

  let email = authUser.user.email
  if (!email) {
    const { data: migratedUser, error: migrationError } = await admin.auth.admin.updateUserById(student.auth_user_id, {
      email: getStudentLoginEmail(rollNumber),
      email_confirm: true,
    })
    if (migrationError || !migratedUser.user.email) return invalidLogin()
    email = migratedUser.user.email
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password })
  if (error || data.user?.id !== student.auth_user_id) return invalidLogin()

  return NextResponse.json({ ok: true })
}
