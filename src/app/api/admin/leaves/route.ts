import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { sendLeaveConfirmationEmail } from '@/lib/email'
import { sendLeaveConfirmationWhatsapp } from '@/lib/whatsapp'

const leaveFields = z.object({
  student_id: z.string().uuid(),
  departure_date: z.string().date(),
  return_date: z.string().date(),
  reason: z.string().trim().min(2).max(1000),
  notification_email: z.string().trim().email().max(320).optional().or(z.literal('')),
  notification_phone: z.string().trim().max(20).optional().or(z.literal('')),
  notify_email: z.boolean(),
  notify_whatsapp: z.boolean(),
}).superRefine((value, context) => {
  if (value.return_date < value.departure_date) {
    context.addIssue({ code: 'custom', path: ['return_date'], message: 'Return date must be on or after departure date' })
  }
  if (value.notify_email && !value.notification_email) {
    context.addIssue({ code: 'custom', path: ['notification_email'], message: 'Email address is required' })
  }
  if (value.notify_whatsapp && (value.notification_phone?.replace(/\D/g, '').length ?? 0) < 10) {
    context.addIssue({ code: 'custom', path: ['notification_phone'], message: 'Valid WhatsApp number is required' })
  }
})

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'on_leave', 'returned', 'cancelled']),
  leave: leaveFields.optional(),
})

function indiaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function displayDate(value: string) {
  return new Date(`${value}T00:00:00+05:30`).toLocaleDateString('mr-IN', {
    dateStyle: 'long', timeZone: 'Asia/Kolkata',
  })
}

async function loadStudent(admin: ReturnType<typeof createSupabaseAdminClient>, studentId: string) {
  const { data, error } = await admin
    .from('students')
    .select('id,name,roll_number,phone,parent_phone,admission_details')
    .eq('id', studentId)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function ensureNoOverlappingLeave(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  input: z.infer<typeof leaveFields>,
  exceptId?: string,
) {
  let query = admin
    .from('student_leaves')
    .select('id')
    .eq('student_id', input.student_id)
    .in('status', ['scheduled', 'on_leave'])
    .lte('departure_date', input.return_date)
    .gte('return_date', input.departure_date)
    .limit(1)
  if (exceptId) query = query.neq('id', exceptId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return Boolean(data?.length)
}

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createSupabaseAdminClient()
  const [leaveResult, studentResult] = await Promise.all([
    admin.from('student_leaves')
      .select('*,students(id,name,roll_number,phone,parent_phone,admission_details)')
      .order('return_date', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(500),
    admin.from('students')
      .select('id,name,roll_number,phone,parent_phone,admission_details')
      .eq('is_active', true)
      .order('roll_number', { ascending: true })
      .limit(1000),
  ])
  if (leaveResult.error || studentResult.error) {
    return NextResponse.json({ error: leaveResult.error?.message || studentResult.error?.message }, { status: 500 })
  }
  return NextResponse.json({ data: { leaves: leaveResult.data || [], students: studentResult.data || [] } })
}

export async function POST(request: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = leaveFields.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid leave details' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const student = await loadStudent(admin, parsed.data.student_id)
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  if (await ensureNoOverlappingLeave(admin, parsed.data)) {
    return NextResponse.json({ error: 'या विद्यार्थ्याची या तारखांमध्ये सुट्टी आधीच नोंदलेली आहे.' }, { status: 409 })
  }

  const today = indiaDate()
  const status = parsed.data.departure_date > today ? 'scheduled' : 'on_leave'
  const { data: leave, error } = await admin.from('student_leaves').insert({
    ...parsed.data,
    notification_email: parsed.data.notification_email || null,
    notification_phone: parsed.data.notification_phone || null,
    status,
    reminder_email_status: parsed.data.notify_email ? 'pending' : 'skipped',
    reminder_whatsapp_status: parsed.data.notify_whatsapp ? 'pending' : 'skipped',
    created_by: adminUser.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const departureDate = displayDate(parsed.data.departure_date)
  const returnDate = displayDate(parsed.data.return_date)
  const [emailResult, whatsappResult] = await Promise.all([
    parsed.data.notify_email && parsed.data.notification_email
      ? sendLeaveConfirmationEmail({
          leaveId: leave.id, to: parsed.data.notification_email, studentName: student.name,
          rollNumber: student.roll_number, departureDate, returnDate, reason: parsed.data.reason,
        })
      : Promise.resolve({ sent: false, reason: 'disabled' as const }),
    parsed.data.notify_whatsapp && parsed.data.notification_phone
      ? sendLeaveConfirmationWhatsapp({
          to: parsed.data.notification_phone, studentName: student.name, rollNumber: student.roll_number,
          departureDate, returnDate,
        })
      : Promise.resolve({ sent: false, reason: 'disabled' as const }),
  ])

  const sentAt = new Date().toISOString()
  const confirmationUpdate: Record<string, string> = {}
  if (emailResult.sent) confirmationUpdate.confirmation_email_sent_at = sentAt
  if (whatsappResult.sent) confirmationUpdate.confirmation_whatsapp_sent_at = sentAt
  if (Object.keys(confirmationUpdate).length > 0) {
    await admin.from('student_leaves').update(confirmationUpdate).eq('id', leave.id)
  }

  return NextResponse.json({
    data: leave,
    delivery: {
      email: emailResult.sent ? 'sent' : emailResult.reason,
      whatsapp: whatsappResult.sent ? 'sent' : whatsappResult.reason,
    },
  }, { status: 201 })
}

export async function PATCH(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid leave update' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: existing, error: existingError } = await admin.from('student_leaves')
    .select('id,return_date,notification_email,notification_phone,notify_email,notify_whatsapp,reminder_email_status,reminder_whatsapp_status')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 400 })
  if (!existing) return NextResponse.json({ error: 'Leave record not found' }, { status: 404 })

  const update: Record<string, unknown> = { status: parsed.data.status, updated_at: new Date().toISOString() }
  if (parsed.data.leave) {
    const student = await loadStudent(admin, parsed.data.leave.student_id)
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    if (await ensureNoOverlappingLeave(admin, parsed.data.leave, parsed.data.id)) {
      return NextResponse.json({ error: 'या विद्यार्थ्याची या तारखांमध्ये दुसरी सुट्टी आधीच नोंदलेली आहे.' }, { status: 409 })
    }
    const reminderChanged = existing.return_date !== parsed.data.leave.return_date
      || (existing.notification_email || '') !== (parsed.data.leave.notification_email || '')
      || (existing.notification_phone || '') !== (parsed.data.leave.notification_phone || '')
      || existing.notify_email !== parsed.data.leave.notify_email
      || existing.notify_whatsapp !== parsed.data.leave.notify_whatsapp
    Object.assign(update, parsed.data.leave, {
      notification_email: parsed.data.leave.notification_email || null,
      notification_phone: parsed.data.leave.notification_phone || null,
    })
    if (reminderChanged) Object.assign(update, {
      reminder_email_status: parsed.data.leave.notify_email ? 'pending' : 'skipped',
      reminder_whatsapp_status: parsed.data.leave.notify_whatsapp ? 'pending' : 'skipped',
      reminder_email_sent_at: null,
      reminder_whatsapp_sent_at: null,
      reminder_claimed_at: null,
      reminder_processed_at: null,
      last_notification_error: null,
    })
  }
  if (parsed.data.status === 'returned' || parsed.data.status === 'cancelled') {
    Object.assign(update, {
      reminder_email_status: existing.reminder_email_status === 'sent' ? 'sent' : 'skipped',
      reminder_whatsapp_status: existing.reminder_whatsapp_status === 'sent' ? 'sent' : 'skipped',
      reminder_claimed_at: null,
      reminder_processed_at: new Date().toISOString(),
      last_notification_error: null,
    })
  }

  const { data, error } = await admin.from('student_leaves').update(update).eq('id', parsed.data.id).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Leave record not found' }, { status: 404 })
  return NextResponse.json({ data })
}
