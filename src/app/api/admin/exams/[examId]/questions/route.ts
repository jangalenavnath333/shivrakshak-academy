import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const questionSchema = z.object({
  id: z.string().uuid().optional(),
  question_text: z.string().trim().min(2).max(3000),
  options: z.array(z.string().trim().min(1).max(1000)).min(2).max(8),
  correct_option: z.number().int().min(0).max(7),
  marks: z.number().positive().max(1000),
  sort_order: z.number().int().min(0).max(10000),
}).refine((value) => value.correct_option < value.options.length, { path: ['correct_option'], message: 'Correct option is invalid' })

async function requireAdminApi() {
  if (!await getAdminUser()) return null
  return createSupabaseAdminClient()
}

export async function GET(_request: Request, { params }: { params: Promise<{ examId: string }> }) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const examId = z.string().uuid().safeParse((await params).examId)
  if (!examId.success) return NextResponse.json({ error: 'Invalid exam' }, { status: 400 })

  const { data: questions, error } = await admin
    .from('exam_questions')
    .select('id,exam_id,question_text,options,marks,sort_order')
    .eq('exam_id', examId.data)
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const questionIds = (questions || []).map((question) => question.id)
  const { data: keys, error: keyError } = questionIds.length
    ? await admin.from('exam_question_keys').select('question_id,correct_option').in('question_id', questionIds)
    : { data: [], error: null }
  if (keyError) return NextResponse.json({ error: keyError.message }, { status: 400 })
  const answerKeys = new Map((keys || []).map((key) => [key.question_id, Number(key.correct_option)]))
  return NextResponse.json({ data: (questions || []).map((question) => ({ ...question, correct_option: answerKeys.get(question.id) ?? 0 })) })
}

export async function POST(request: Request, { params }: { params: Promise<{ examId: string }> }) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const examId = z.string().uuid().safeParse((await params).examId)
  const parsed = questionSchema.safeParse(await request.json().catch(() => null))
  if (!examId.success || !parsed.success) return NextResponse.json({ error: 'प्रश्नाची माहिती चुकीची आहे.' }, { status: 400 })
  const { id, correct_option, question_text, options, marks, sort_order } = parsed.data
  const { data, error } = await admin.rpc('admin_upsert_exam_question', {
    p_exam_id: examId.data,
    p_question_id: id || null,
    p_question_text: question_text,
    p_options: options,
    p_marks: marks,
    p_sort_order: sort_order,
    p_correct_option: String(correct_option),
  })
  if (error || !data) {
    const status = error?.message?.includes('locked') ? 409 : error?.message?.includes('not found') ? 404 : 400
    return NextResponse.json({ error: status === 409 ? 'पहिला attempt सुरू झाल्यानंतर question paper बदलता येत नाही.' : error?.message || 'Question save झाला नाही.' }, { status })
  }
  return NextResponse.json({ data: { id: data } }, { status: id ? 200 : 201 })
}
