import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getStudentLoginEmail } from '@/lib/student-auth'

const passwordSchema = z.object({
  password: z.string().min(8).max(72).regex(/[A-Za-z]/).regex(/\d/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string().min(8).max(72),
}).refine((value) => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

export async function PUT(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const studentId = z.string().uuid().safeParse((await params).studentId)
  const parsed = passwordSchema.safeParse(await request.json().catch(() => null))
  if (!studentId.success || !parsed.success) return NextResponse.json({ error: 'Password किमान 8 अक्षरांचा आणि त्यात अक्षर, अंक व विशेष चिन्ह असावे.' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: student, error: studentError } = await admin.from('students').select('id,name,phone,roll_number,auth_user_id').eq('id', studentId.data).maybeSingle()
  if (studentError || !student) return NextResponse.json({ error: 'विद्यार्थी सापडला नाही.' }, { status: 404 })
  if (!student.phone || !/^\d{10}$/.test(student.phone)) return NextResponse.json({ error: 'विद्यार्थ्याचा 10 अंकी mobile number आवश्यक आहे.' }, { status: 400 })

  if (!student.roll_number) return NextResponse.json({ error: 'Student ID उपलब्ध नाही.' }, { status: 400 })

  const metadata = { role: 'student', student_id: student.id, roll_number: student.roll_number }
  const loginEmail = getStudentLoginEmail(student.roll_number)
  if (student.auth_user_id) {
    const { error } = await admin.auth.admin.updateUserById(student.auth_user_id, {
      email: loginEmail,
      password: parsed.data.password,
      email_confirm: true,
      app_metadata: metadata,
    })
    if (error) return NextResponse.json({ error: 'Password reset झाला नाही.' }, { status: 400 })
    return NextResponse.json({ ok: true, created: false })
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: loginEmail,
    phone: `+91${student.phone}`,
    password: parsed.data.password,
    email_confirm: true,
    phone_confirm: true,
    app_metadata: metadata,
    user_metadata: { name: student.name },
  })
  if (authError || !authData.user) return NextResponse.json({ error: authError?.message || 'Exam Login तयार झाला नाही.' }, { status: 400 })
  const { error: linkError } = await admin.from('students').update({ auth_user_id: authData.user.id }).eq('id', student.id)
  if (linkError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'Exam Login विद्यार्थ्याशी जोडता आला नाही.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true, created: true })
}
