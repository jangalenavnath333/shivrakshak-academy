import { NextResponse } from 'next/server'
import { z } from 'zod'
import { appBaseUrl } from '@/lib/app-url'
import { decryptAdmissionPassword } from '@/lib/admission-credentials'
import { createAdmissionPrintToken, hashAdmissionPrintToken } from '@/lib/admission-print-token'
import { getAdminUser } from '@/lib/admin-auth'
import { sendAdmissionActivatedEmail } from '@/lib/email'
import { getStudentLoginEmail } from '@/lib/student-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { sendAdmissionActivatedWhatsapp } from '@/lib/whatsapp'

type AdminClient = ReturnType<typeof createSupabaseAdminClient>

const id = z.string().uuid()
const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve'), studentId: id }),
  z.object({
    action: z.literal('activate'),
    studentId: id,
    totalFee: z.number().positive().max(10_000_000),
    amountPaid: z.number().positive().max(10_000_000),
    paymentDate: z.string().date(),
    paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  }),
  // Retry for an admission whose fee is already recorded but whose exam login /
  // activation did not complete on the first attempt.
  z.object({ action: z.literal('resume'), studentId: id }),
  z.object({ action: z.literal('delete'), studentId: id }),
  // Edit a pending or approved admission.
  z.object({
    action: z.literal('edit'),
    studentId: id,
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().regex(/^\d{10}$/).optional().or(z.literal('')),
    course: z.enum(['police', 'navy', 'mpsc', 'staff_selection', 'saral_seva', 'army', 'railway', 'other']).optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
  z.object({ action: z.literal('resend_email'), studentId: id }),
])

/**
 * Creates the exam login (when missing), flips the admission to active and sends the
 * code + print link. Shared by `activate` and `resume` so a half-finished activation
 * can always be driven to completion without recording the fee twice.
 */
async function finalizeActivation(input: {
  admin: AdminClient
  studentId: string
  rollNumber: string
  authUserId: string | null
  studentName: string
  token: string
  origin: string
}) {
  const { admin, studentId, rollNumber, authUserId, studentName, token, origin } = input

  if (!authUserId) {
    const { data: credential, error: credentialError } = await admin
      .from('pending_student_credentials')
      .select('password_encrypted')
      .eq('student_id', studentId)
      .is('consumed_at', null)
      .maybeSingle()
    if (credentialError || !credential) {
      return NextResponse.json({ error: 'Student Exam Login password सापडला नाही. कृपया Admin profile मधून credentials तयार करा.' }, { status: 409 })
    }

    // A credential encrypted under a rotated ADMISSION_CREDENTIAL_SECRET cannot be read
    // back; fail with a clear message instead of a blank 500.
    let password: string
    try {
      password = decryptAdmissionPassword(credential.password_encrypted)
    } catch {
      console.error('Admission credential could not be decrypted', { studentId })
      return NextResponse.json({ error: 'Exam Login password वाचता आला नाही (encryption secret बदलला असावा). Admin profile मधून नवीन password सेट करा.' }, { status: 409 })
    }
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: getStudentLoginEmail(rollNumber),
      password,
      email_confirm: true,
      app_metadata: { role: 'student', student_id: studentId, roll_number: rollNumber },
      user_metadata: { name: studentName },
    })
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Fee नोंदली आहे, पण Exam Login तयार झाला नाही. "पुन्हा प्रयत्न करा" वापरा.' }, { status: 500 })
    }
    const { error: linkError } = await admin.from('students').update({ auth_user_id: authData.user.id }).eq('id', studentId)
    if (linkError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Fee नोंदली आहे, पण Exam Login link झाला नाही. "पुन्हा प्रयत्न करा" वापरा.' }, { status: 500 })
    }
    await admin.from('pending_student_credentials').update({ consumed_at: new Date().toISOString() }).eq('student_id', studentId)
  }

  const { data: student, error: studentError } = await admin
    .from('students')
    .update({ admission_status: 'active', is_active: true, print_enabled_at: new Date().toISOString() })
    .eq('id', studentId)
    .select('id, name, roll_number, phone, parent_phone, admission_details')
    .single()
  if (studentError || !student) return NextResponse.json({ error: 'Student activation पूर्ण झाली नाही.' }, { status: 500 })

  const printUrl = `${origin}/admission/print/${token}`
  const details = (student.admission_details || {}) as Record<string, unknown>
  const email = typeof details.email === 'string' ? details.email : ''
  const whatsapp = [details.studentWhatsapp, student.phone, details.parentWhatsapp, student.parent_phone]
    .find((value): value is string => typeof value === 'string' && value.trim().length >= 10) || ''

  // The admission is already active at this point — a messaging outage must never be
  // reported to the admin as a failed activation.
  const notify = async <T>(job: Promise<T>, fallback: T) => {
    try { return await job } catch { return fallback }
  }
  const [emailResult, whatsappResult] = await Promise.all([
    email
      ? notify(sendAdmissionActivatedEmail({ to: email, studentName: student.name, rollNumber, printUrl }), { sent: false as const, reason: 'provider_error' as const, detail: 'ई-मेल पाठवताना अनपेक्षित अडचण आली' })
      : Promise.resolve({ sent: false as const, reason: 'missing_email' as const, detail: 'अर्जात ई-मेल दिलेला नाही' }),
    whatsapp
      ? notify(sendAdmissionActivatedWhatsapp({ to: whatsapp, studentName: student.name, rollNumber, printUrl }), { sent: false as const, reason: 'provider_error' as const, detail: 'WhatsApp पाठवताना अनपेक्षित अडचण आली' })
      : Promise.resolve({ sent: false as const, reason: 'missing_whatsapp' as const, detail: 'वैध WhatsApp नंबर नाही' }),
  ])

  return NextResponse.json({
    ok: true,
    studentId: student.id,
    rollNumber,
    printUrl,
    delivery: { email: emailResult, whatsapp: whatsappResult },
  })
}

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('students')
    .select('id, name, parent_name, phone, parent_phone, course, gender, total_fee, admission_status, approved_at, created_at, admission_details, documents(id, doc_type, file_url, file_name)')
    .in('admission_status', ['pending', 'approved', 'payment_recorded'])
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ applications: data || [] })
}

export async function POST(request: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid admission operation' }, { status: 400 })
  const payload = parsed.data
  if (payload.action === 'activate' && payload.amountPaid > payload.totalFee) {
    return NextResponse.json({ error: 'भरलेली रक्कम एकूण फीपेक्षा जास्त असू शकत नाही.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  if (payload.action === 'approve') {
    const { data, error } = await admin
      .from('students')
      .update({ admission_status: 'approved', approved_at: new Date().toISOString(), approved_by: adminUser.id })
      .eq('id', payload.studentId)
      .eq('admission_status', 'pending')
      .select('id')
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Pending अर्ज सापडला नाही किंवा तो आधीच approve झाला आहे.' }, { status: 409 })
    return NextResponse.json({ ok: true })
  }

  if (payload.action === 'delete') {
    // Only allow deletion of pending admissions
    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, admission_status, documents(file_url)')
      .eq('id', payload.studentId)
      .maybeSingle()

    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 })
    if (!student) return NextResponse.json({ error: 'अर्ज सापडला नाही.' }, { status: 404 })

    if (student.admission_status === 'active' || student.admission_status === 'archived') {
      // Archive the student instead of hard deleting
      const { error: archiveError } = await admin.from('students').update({ admission_status: 'archived' }).eq('id', payload.studentId)
      if (archiveError) return NextResponse.json({ error: archiveError.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    // For pending/others, hard delete documents and the record
    const fileUrls = (student.documents || []).map(doc => doc.file_url).filter(Boolean)
    if (fileUrls.length > 0) {
      await admin.storage.from('student-documents').remove(fileUrls)
    }

    // Delete student (cascade will delete documents rows and pending_student_credentials)
    const { error: deleteError } = await admin.from('students').delete().eq('id', payload.studentId)
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  }

  if (payload.action === 'edit') {
    const updates: any = {}
    if (payload.name) updates.name = payload.name
    if (payload.phone !== undefined) updates.phone = payload.phone
    if (payload.course) updates.course = payload.course

    const { data: student } = await admin.from('students').select('admission_details').eq('id', payload.studentId).single()
    if (student && payload.email !== undefined) {
      updates.admission_details = { ...(student.admission_details as object), email: payload.email }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await admin
        .from('students')
        .update(updates)
        .eq('id', payload.studentId)
        .in('admission_status', ['pending', 'approved'])

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  let token: string
  try {
    token = createAdmissionPrintToken(payload.studentId)
  } catch {
    return NextResponse.json({ error: 'Admission print security is not configured.' }, { status: 503 })
  }
  const tokenHash = hashAdmissionPrintToken(token)
  // Must be this app's origin — the print form is a Next.js route, never a Supabase URL.
  const origin = appBaseUrl(request)

  if (payload.action === 'resume') {
    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, name, roll_number, auth_user_id, admission_status')
      .eq('id', payload.studentId)
      .eq('admission_status', 'payment_recorded')
      .maybeSingle()
    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 })
    if (!student?.roll_number) {
      return NextResponse.json({ error: 'अपूर्ण activation असलेला अर्ज सापडला नाही.' }, { status: 409 })
    }
    // Re-issue the (deterministic) print link so a previously revoked or missing row
    // cannot leave the student without a printable form.
    const { error: tokenError } = await admin
      .from('admission_print_tokens')
      .upsert({ student_id: student.id, token_hash: tokenHash, revoked_at: null }, { onConflict: 'token_hash' })
    if (tokenError) return NextResponse.json({ error: 'Print link तयार झाली नाही.' }, { status: 500 })

    return finalizeActivation({
      admin,
      studentId: student.id,
      rollNumber: student.roll_number,
      authUserId: student.auth_user_id,
      studentName: student.name,
      token,
      origin,
    })
  }

  if (payload.action === 'resend_email') {
    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, name, roll_number, auth_user_id, admission_status, admission_details')
      .eq('id', payload.studentId)
      .eq('admission_status', 'active')
      .maybeSingle()
      
    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 })
    if (!student?.roll_number) {
      return NextResponse.json({ error: 'हा विद्यार्थी Active नाही.' }, { status: 409 })
    }
    
    await admin.from('admission_print_tokens').upsert({ student_id: student.id, token_hash: tokenHash, revoked_at: null }, { onConflict: 'token_hash' })
    const printUrl = `${origin}/admission/print/${token}`
    
    const details = (student.admission_details || {}) as Record<string, unknown>
    const email = typeof details.email === 'string' ? details.email : ''
    
    if (!email) {
      return NextResponse.json({ error: 'या विद्यार्थ्याचा ई-मेल उपलब्ध नाही.' }, { status: 400 })
    }
    
    const notify = async <T>(job: Promise<T>, fallback: T) => {
      try { return await job } catch { return fallback }
    }
    
    const emailResult = await notify(sendAdmissionActivatedEmail({ to: email, studentName: student.name, rollNumber: student.roll_number, printUrl }), { sent: false as const, reason: 'provider_error' as const, detail: 'ई-मेल पाठवताना अनपेक्षित अडचण आली' })
    
    return NextResponse.json({ ok: true, delivery: { email: emailResult } })
  }

  const { data: activatedRows, error: activationError } = await admin.rpc('activate_paid_admission', {
    p_student_id: payload.studentId,
    p_total_fee: payload.totalFee,
    p_amount_paid: payload.amountPaid,
    p_payment_date: payload.paymentDate,
    p_payment_mode: payload.paymentMode,
    p_print_token_hash: tokenHash,
  })
  const activated = Array.isArray(activatedRows) ? activatedRows[0] : activatedRows
  if (activationError || !activated) {
    return NextResponse.json({ error: activationError?.message || 'Admission activate झाला नाही.' }, { status: 400 })
  }

  return finalizeActivation({
    admin,
    studentId: payload.studentId,
    rollNumber: activated.roll_number,
    authUserId: activated.auth_user_id,
    studentName: activated.student_name,
    token,
    origin,
  })
}
