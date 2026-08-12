import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { isWhatsappConfigured, normalizeIndianPhone, sendAdminBroadcastWhatsapp } from '@/lib/whatsapp'

// A 100-recipient batch at 5-way concurrency needs well over the default budget.
export const maxDuration = 60

const MAX_RECIPIENTS = 500
const CONCURRENCY = 5

const requestSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(MAX_RECIPIENTS),
  message: z.string().trim().min(1).max(1500),
  audience: z.enum(['parent', 'student']),
})

type Recipient = {
  studentId: string
  name: string
  rollNumber: string | null
  phone: string | null
}

type SendResult = Recipient & {
  status: 'sent' | 'invalid_number' | 'duplicate' | 'failed'
  reason?: string
  messageId?: string
}

const firstUsableNumber = (candidates: unknown[]) => {
  for (const value of candidates) {
    if (typeof value !== 'string') continue
    const normalized = normalizeIndianPhone(value)
    if (normalized) return normalized
  }
  return null
}

/** Runs jobs with a fixed worker pool so one large batch cannot flood Twilio. */
async function runPooled<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await worker(items[index])
    }
  }))
  return results
}

export async function POST(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid WhatsApp request' }, { status: 400 })
  }
  // Every send would fail identically, so say so once instead of 100 times.
  if (!isWhatsappConfigured()) {
    return NextResponse.json({ error: 'WhatsApp पाठवण्यासाठी Twilio credentials सेट केलेले नाहीत.' }, { status: 503 })
  }

  const { studentIds, message, audience } = parsed.data
  const admin = createSupabaseAdminClient()
  const { data: students, error } = await admin
    .from('students')
    .select('id, name, roll_number, phone, parent_phone, admission_details')
    .in('id', studentIds)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Prefer the audience the admin picked, then fall back to any reachable number for
  // that student — older records have no admission_details at all.
  const recipients: Recipient[] = (students || []).map((student) => {
    const details = (student.admission_details || {}) as Record<string, unknown>
    const order = audience === 'parent'
      ? [details.parentWhatsapp, student.parent_phone, details.studentWhatsapp, student.phone]
      : [details.studentWhatsapp, student.phone, details.parentWhatsapp, student.parent_phone]
    return {
      studentId: student.id,
      name: student.name,
      rollNumber: student.roll_number,
      phone: firstUsableNumber(order),
    }
  })

  const seenNumbers = new Set<string>()
  const sendable: Recipient[] = []
  const preflight: SendResult[] = []
  for (const recipient of recipients) {
    if (!recipient.phone) {
      preflight.push({ ...recipient, status: 'invalid_number', reason: 'WhatsApp नंबर नाही किंवा चुकीचा आहे' })
      continue
    }
    // Siblings often share a guardian number; one broadcast should reach it once.
    if (seenNumbers.has(recipient.phone)) {
      preflight.push({ ...recipient, status: 'duplicate', reason: 'याच नंबरवर आधीच पाठवले' })
      continue
    }
    seenNumbers.add(recipient.phone)
    sendable.push(recipient)
  }

  const sentResults = await runPooled(sendable, CONCURRENCY, async (recipient): Promise<SendResult> => {
    try {
      const result = await sendAdminBroadcastWhatsapp({
        to: recipient.phone as string,
        studentName: recipient.name,
        message,
      })
      if (result.sent) return { ...recipient, status: 'sent', messageId: result.id }
      return { ...recipient, status: 'failed', reason: result.reason }
    } catch (sendError) {
      // One bad recipient must never abort the rest of the batch.
      console.error('WhatsApp broadcast recipient failed', {
        studentId: recipient.studentId,
        message: sendError instanceof Error ? sendError.message : 'Unknown error',
      })
      return { ...recipient, status: 'failed', reason: 'provider_error' }
    }
  })

  const results = [...sentResults, ...preflight]
  const count = (status: SendResult['status']) => results.filter((item) => item.status === status).length
  return NextResponse.json({
    ok: true,
    summary: {
      totalSelected: studentIds.length,
      sent: count('sent'),
      failed: count('failed'),
      invalidNumber: count('invalid_number'),
      duplicate: count('duplicate'),
    },
    results,
  })
}
