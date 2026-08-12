import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { sendExamScheduleEmails } from '@/lib/email'

const course = z.enum(['all', 'police', 'navy', 'mpsc', 'staff_selection', 'saral_seva', 'army', 'railway', 'other'])
const nullableDateTime = z.string().datetime().nullable()
const baseExamSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).default(''),
  instructions: z.string().trim().max(5000).default(''),
  course,
  duration_minutes: z.number().int().min(1).max(600),
  negative_marks: z.number().min(0).max(100),
  pass_marks: z.number().min(0).max(10000),
  max_attempts: z.number().int().min(1).max(10),
  starts_at: nullableDateTime,
  ends_at: nullableDateTime,
  result_release_at: nullableDateTime,
  is_live: z.boolean(),
  is_published: z.boolean(),
})
const validateSchedule = <T extends z.infer<typeof baseExamSchema>>(value: T) => !value.starts_at || !value.ends_at || value.ends_at > value.starts_at
const createExamSchema = baseExamSchema.omit({ id: true }).refine(validateSchedule, {
  path: ['ends_at'], message: 'End time must be after start time',
})
const updateExamSchema = baseExamSchema.required({ id: true }).refine(validateSchedule, {
  path: ['ends_at'], message: 'End time must be after start time',
})

async function requireAdminApi() {
  if (!await getAdminUser()) return null
  return createSupabaseAdminClient()
}

export async function GET() {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: exams, error }, { data: questions }, { data: attempts }] = await Promise.all([
    admin.from('exams').select('*').order('created_at', { ascending: false }),
    admin.from('exam_questions').select('exam_id,marks'),
    admin.from('exam_attempts').select('exam_id,status'),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const questionStats = new Map<string, { count: number; marks: number }>()
  for (const question of questions || []) {
    const current = questionStats.get(question.exam_id) || { count: 0, marks: 0 }
    current.count += 1
    current.marks += Number(question.marks)
    questionStats.set(question.exam_id, current)
  }
  const attemptStats = new Map<string, { count: number; completed: number }>()
  for (const attempt of attempts || []) {
    const current = attemptStats.get(attempt.exam_id) || { count: 0, completed: 0 }
    current.count += 1
    if (attempt.status !== 'in_progress') current.completed += 1
    attemptStats.set(attempt.exam_id, current)
  }

  return NextResponse.json({ data: (exams || []).map((exam) => {
    const questionSummary = questionStats.get(exam.id) || { count: 0, marks: 0 }
    const attemptSummary = attemptStats.get(exam.id) || { count: 0, completed: 0 }
    return {
      ...exam,
      question_count: questionSummary.count,
      calculated_marks: questionSummary.marks,
      attempt_count: attemptSummary.count,
      completed_count: attemptSummary.completed,
    }
  }) })
}

export async function POST(request: Request) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = createExamSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'परीक्षेची माहिती चुकीची आहे.', issues: parsed.error.flatten() }, { status: 400 })
  if (parsed.data.is_published) {
    return NextResponse.json({ error: 'परीक्षा आधी Draft म्हणून तयार करा, प्रश्न जोडा आणि नंतर Publish करा.' }, { status: 400 })
  }

  const { data, error } = await admin.from('exams').insert({ ...parsed.data, total_marks: 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (data.is_published) await notifyStudents(admin, data, false)
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = updateExamSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'परीक्षेची माहिती चुकीची आहे.', issues: parsed.error.flatten() }, { status: 400 })

  const { id, ...changes } = parsed.data
  const [{ data: previous, error: previousError }, { count: attemptCount, error: attemptError }, { data: questionRows, error: questionError }] = await Promise.all([
    admin.from('exams').select('course,duration_minutes,negative_marks,pass_marks,max_attempts,starts_at,ends_at,is_published').eq('id', id).maybeSingle(),
    admin.from('exam_attempts').select('id', { count: 'exact', head: true }).eq('exam_id', id),
    admin.from('exam_questions').select('marks').eq('exam_id', id),
  ])
  if (previousError || attemptError || questionError) return NextResponse.json({ error: 'परीक्षेची स्थिती तपासता आली नाही.' }, { status: 500 })
  if (!previous) return NextResponse.json({ error: 'Exam सापडली नाही.' }, { status: 404 })

  const totalMarks = (questionRows || []).reduce((sum, question) => sum + Number(question.marks), 0)
  if (changes.is_published && totalMarks <= 0) {
    return NextResponse.json({ error: 'Publish करण्यापूर्वी किमान एक question जोडा.' }, { status: 400 })
  }
  if (changes.is_published && changes.pass_marks > totalMarks) {
    return NextResponse.json({ error: `Pass Marks एकूण ${totalMarks} गुणांपेक्षा जास्त असू शकत नाहीत.` }, { status: 400 })
  }

  const lockedFields = ['course', 'duration_minutes', 'negative_marks', 'pass_marks', 'max_attempts', 'starts_at', 'ends_at'] as const
  const changesLockedExamData = lockedFields.some((field) => String(previous[field]) !== String(changes[field]))
  if ((attemptCount || 0) > 0 && changesLockedExamData) {
    return NextResponse.json({ error: 'पहिला attempt सुरू झाल्यानंतर course, वेळ, गुणपद्धती किंवा attempts बदलता येत नाहीत. निकालाची वेळ व मजकूर बदलता येतो.' }, { status: 409 })
  }

  const { data, error } = await admin.from('exams').update(changes).eq('id', id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Exam सापडली नाही.' }, { status: 404 })

  const scheduleChanged = !!data.is_published && (
    !previous?.is_published || previous.starts_at !== data.starts_at || previous.ends_at !== data.ends_at
  )
  if (scheduleChanged) await notifyStudents(admin, data, !!previous?.is_published)
  return NextResponse.json({ data })
}

async function notifyStudents(admin: ReturnType<typeof createSupabaseAdminClient>, exam: Record<string, unknown>, isRescheduled: boolean) {
  const { data: students } = await admin.from('students').select('course,admission_details').eq('is_active', true)
  const recipients = (students || []).flatMap((student) => {
    if (exam.course !== 'all' && student.course !== exam.course) return []
    const details = student.admission_details as { email?: unknown } | null
    return typeof details?.email === 'string' && details.email ? [details.email] : []
  })
  await sendExamScheduleEmails({
    recipients,
    examTitle: String(exam.title || ''),
    startsAt: typeof exam.starts_at === 'string' ? exam.starts_at : null,
    endsAt: typeof exam.ends_at === 'string' ? exam.ends_at : null,
    isRescheduled,
  })
}
