import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const leaveRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  mobile: z.string().trim().regex(/^\d{10}$/),
  rollNumber: z.string().trim().toUpperCase().regex(/^S-\d{1,8}$/),
  days: z.coerce.number().int().min(1).max(30),
  website: z.string().max(0).optional().default(''),
})

type AdmissionDetails = {
  email?: unknown
  studentPhone?: unknown
  studentWhatsapp?: unknown
  parentWhatsapp?: unknown
}

function indiaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function normalizeName(value: string) {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('mr-IN')
}

function digits(value: unknown) {
  return typeof value === 'string' ? value.replace(/\D/g, '').slice(-10) : ''
}

function genericStudentError() {
  return NextResponse.json({
    error: 'नाव, मोबाईल नंबर किंवा विद्यार्थी ID जुळत नाही. प्रवेश अर्जातील माहिती तपासून पुन्हा प्रयत्न करा.',
  }, { status: 400 })
}

export async function POST(request: Request) {
  const parsed = leaveRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.path[0] === 'days'
        ? 'सुट्टीचे दिवस 1 ते 30 दरम्यान लिहा.'
        : 'कृपया सर्व माहिती योग्य पद्धतीने भरा.',
    }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const clientIp = forwardedFor || request.headers.get('x-real-ip') || 'unknown'
  const [ipLimit, rollLimit] = await Promise.all([
    admin.rpc('consume_leave_request_rate_limit', { p_key: `ip:${clientIp}` }),
    admin.rpc('consume_leave_request_rate_limit', { p_key: `roll:${parsed.data.rollNumber}` }),
  ])

  if (ipLimit.error || rollLimit.error) {
    console.error('Leave request rate-limit failed', {
      ipCode: ipLimit.error?.code,
      rollCode: rollLimit.error?.code,
    })
    return NextResponse.json({ error: 'सुट्टी अर्ज सेवा सध्या उपलब्ध नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.' }, { status: 503 })
  }
  if (!ipLimit.data || !rollLimit.data) {
    return NextResponse.json({ error: 'खूप अर्ज प्रयत्न झाले. कृपया एका तासाने पुन्हा प्रयत्न करा.' }, { status: 429 })
  }

  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id,name,roll_number,phone,parent_phone,admission_details')
    .eq('roll_number', parsed.data.rollNumber)
    .eq('is_active', true)
    .maybeSingle()

  if (studentError) {
    console.error('Leave request student lookup failed', { code: studentError.code })
    return NextResponse.json({ error: 'सुट्टी अर्ज save झाला नाही. कृपया पुन्हा प्रयत्न करा.' }, { status: 500 })
  }
  if (!student || normalizeName(student.name) !== normalizeName(parsed.data.name)) return genericStudentError()

  const details = (student.admission_details || {}) as AdmissionDetails
  const allowedPhones = new Set([
    digits(student.phone), digits(student.parent_phone), digits(details.studentPhone),
    digits(details.studentWhatsapp), digits(details.parentWhatsapp),
  ].filter(Boolean))
  if (!allowedPhones.has(parsed.data.mobile)) return genericStudentError()

  const departureDate = indiaDate()
  const returnDate = addDays(departureDate, parsed.data.days)
  const { data: overlap, error: overlapError } = await admin
    .from('student_leaves')
    .select('id')
    .eq('student_id', student.id)
    .in('status', ['pending', 'scheduled', 'on_leave'])
    .lte('departure_date', returnDate)
    .gte('return_date', departureDate)
    .limit(1)

  if (overlapError) {
    console.error('Leave request overlap check failed', { code: overlapError.code })
    return NextResponse.json({ error: 'सुट्टी अर्ज save झाला नाही. कृपया पुन्हा प्रयत्न करा.' }, { status: 500 })
  }
  if (overlap?.length) {
    return NextResponse.json({ error: 'या कालावधीसाठी तुमचा सुट्टी अर्ज आधीच नोंदलेला आहे.' }, { status: 409 })
  }

  const email = typeof details.email === 'string' && details.email ? details.email : null
  const { data: leave, error } = await admin.from('student_leaves').insert({
    student_id: student.id,
    departure_date: departureDate,
    return_date: returnDate,
    reason: `विद्यार्थ्याने वेबसाइटवरून ${parsed.data.days} दिवसांची सुट्टी मागितली.`,
    status: 'pending',
    request_source: 'public',
    requested_name: parsed.data.name,
    requested_phone: parsed.data.mobile,
    requested_days: parsed.data.days,
    notification_email: email,
    notification_phone: parsed.data.mobile,
    notify_email: Boolean(email),
    notify_whatsapp: true,
    reminder_email_status: email ? 'pending' : 'skipped',
    reminder_whatsapp_status: 'pending',
  }).select('id,return_date').single()

  if (error || !leave) {
    console.error('Leave request insert failed', { code: error?.code })
    return NextResponse.json({ error: 'सुट्टी अर्ज save झाला नाही. कृपया पुन्हा प्रयत्न करा.' }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      requestId: leave.id,
      returnDate: leave.return_date,
      message: 'तुमचा अर्ज Admin approval साठी पाठवला आहे.',
    },
  }, { status: 201 })
}
