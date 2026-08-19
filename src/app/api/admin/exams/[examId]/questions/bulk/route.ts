import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const rowSchema = z.object({
  question_text: z.string().trim().min(2).max(3000),
  options: z.array(z.string().trim().min(1).max(1000)).length(4),
  correct_option: z.number().int().min(0).max(3),
  marks: z.number().positive().max(1000),
})
const bulkSchema = z.object({ questions: z.array(rowSchema).min(1).max(200) })

async function requireAdminApi() {
  if (!await getAdminUser()) return null
  return createSupabaseAdminClient()
}

export async function POST(request: Request, { params }: { params: Promise<{ examId: string }> }) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const examId = z.string().uuid().safeParse((await params).examId)
  const parsed = bulkSchema.safeParse(await request.json().catch(() => null))
  if (!examId.success || !parsed.success) return NextResponse.json({ error: 'Upload केलेली फाईल चुकीची आहे.' }, { status: 400 })

  const { count: existingCount, error: countError } = await admin
    .from('exam_questions').select('id', { count: 'exact', head: true }).eq('exam_id', examId.data)
  if (countError) return NextResponse.json({ error: countError.message }, { status: 400 })

  let nextSortOrder = (existingCount || 0) + 1
  let created = 0
  const failures: { row: number; error: string }[] = []

  for (const [index, row] of parsed.data.questions.entries()) {
    const { data, error } = await admin.rpc('admin_upsert_exam_question', {
      p_exam_id: examId.data,
      p_question_id: null,
      p_question_text: row.question_text,
      p_options: row.options,
      p_marks: row.marks,
      p_sort_order: nextSortOrder,
      p_correct_option: String(row.correct_option),
    })
    if (error || !data) {
      failures.push({ row: index + 1, error: error?.message || 'Unknown error' })
      if (error?.message?.includes('locked')) break
    } else {
      created += 1
      nextSortOrder += 1
    }
  }

  return NextResponse.json({ created, failed: failures.length, failures })
}
