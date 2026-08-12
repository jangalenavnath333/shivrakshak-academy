import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { sendLeaveReturnReminderEmail } from '@/lib/email'
import { sendLeaveReturnWhatsapp } from '@/lib/whatsapp'

export const maxDuration = 60

type ClaimedLeave = {
  id: string
  student_id: string
  return_date: string
  notification_email: string | null
  notification_phone: string | null
  notify_email: boolean
  notify_whatsapp: boolean
  reminder_email_status: 'pending' | 'sent' | 'skipped' | 'failed'
  reminder_whatsapp_status: 'pending' | 'sent' | 'skipped' | 'failed'
}

type StudentContact = { id: string; name: string; roll_number: string }

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

function deliveryError(channel: string, reason?: string) {
  if (reason === 'not_configured') return `${channel} provider configured नाही`
  if (reason === 'invalid_recipient') return `${channel} recipient चुकीचा आहे`
  return `${channel} delivery failed`
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createSupabaseAdminClient()
  const today = indiaDate()
  await admin.from('student_leaves')
    .update({ status: 'on_leave', updated_at: new Date().toISOString() })
    .eq('status', 'scheduled')
    .lte('departure_date', today)

  const { data: claimed, error: claimError } = await admin.rpc('claim_due_student_leave_reminders', {
    p_today: today,
    p_limit: 100,
  })
  if (claimError) return Response.json({ error: claimError.message }, { status: 500 })

  const leaves = (claimed || []) as ClaimedLeave[]
  if (leaves.length === 0) return Response.json({ ok: true, claimed: 0, completed: 0, failed: 0 })

  const studentIds = [...new Set(leaves.map((leave) => leave.student_id))]
  const { data: students, error: studentError } = await admin
    .from('students')
    .select('id,name,roll_number')
    .in('id', studentIds)
  if (studentError) return Response.json({ error: studentError.message }, { status: 500 })
  const contacts = new Map((students as StudentContact[] || []).map((student) => [student.id, student]))

  let completed = 0
  let failed = 0
  for (const leave of leaves) {
    const { data: currentLeave } = await admin.from('student_leaves').select('status').eq('id', leave.id).maybeSingle()
    if (!currentLeave || !['scheduled', 'on_leave'].includes(currentLeave.status)) {
      await admin.from('student_leaves').update({ reminder_claimed_at: null }).eq('id', leave.id)
      continue
    }
    const student = contacts.get(leave.student_id)
    const errors: string[] = []
    let emailStatus = leave.reminder_email_status
    let whatsappStatus = leave.reminder_whatsapp_status
    let emailSentAt: string | null = null
    let whatsappSentAt: string | null = null
    const sentAt = new Date().toISOString()

    if (!student) {
      errors.push('Student record सापडला नाही')
      emailStatus = leave.notify_email ? 'failed' : 'skipped'
      whatsappStatus = leave.notify_whatsapp ? 'failed' : 'skipped'
    } else {
      if (emailStatus !== 'sent' && emailStatus !== 'skipped') {
        if (!leave.notify_email) {
          emailStatus = 'skipped'
        } else if (!leave.notification_email) {
          emailStatus = 'failed'
          errors.push('Email address उपलब्ध नाही')
        } else {
          const result = await sendLeaveReturnReminderEmail({
            leaveId: leave.id,
            to: leave.notification_email,
            studentName: student.name,
            rollNumber: student.roll_number,
            returnDate: displayDate(leave.return_date),
            returnDateKey: leave.return_date,
          })
          if (result.sent) {
            emailStatus = 'sent'
            emailSentAt = sentAt
          } else {
            emailStatus = 'failed'
            errors.push(deliveryError('Email', result.reason))
          }
        }
      }

      if (whatsappStatus !== 'sent' && whatsappStatus !== 'skipped') {
        if (!leave.notify_whatsapp) {
          whatsappStatus = 'skipped'
        } else if (!leave.notification_phone) {
          whatsappStatus = 'failed'
          errors.push('WhatsApp number उपलब्ध नाही')
        } else {
          const result = await sendLeaveReturnWhatsapp({
            to: leave.notification_phone,
            studentName: student.name,
            rollNumber: student.roll_number,
            returnDate: displayDate(leave.return_date),
          })
          if (result.sent) {
            whatsappStatus = 'sent'
            whatsappSentAt = sentAt
          } else {
            whatsappStatus = 'failed'
            errors.push(deliveryError('WhatsApp', result.reason))
          }
        }
      }
    }

    const isProcessed = ['sent', 'skipped'].includes(emailStatus) && ['sent', 'skipped'].includes(whatsappStatus)
    const update: Record<string, unknown> = {
      status: leave.return_date <= today ? 'on_leave' : undefined,
      reminder_email_status: emailStatus,
      reminder_whatsapp_status: whatsappStatus,
      reminder_claimed_at: null,
      reminder_processed_at: isProcessed ? sentAt : null,
      last_notification_error: errors.length ? errors.join('; ').slice(0, 1000) : null,
      updated_at: sentAt,
    }
    if (emailSentAt) update.reminder_email_sent_at = emailSentAt
    if (whatsappSentAt) update.reminder_whatsapp_sent_at = whatsappSentAt
    if (update.status === undefined) delete update.status

    const { error: updateError } = await admin.from('student_leaves').update(update).eq('id', leave.id)
    if (updateError || !isProcessed) failed += 1
    else completed += 1
  }

  return Response.json({ ok: failed === 0, claimed: leaves.length, completed, failed })
}
