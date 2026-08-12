import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStudentUser } from '@/lib/student-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const answerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOption: z.string().regex(/^\d+$/),
})

export async function PUT(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const student = await getStudentUser()
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const attemptId = z.string().uuid().safeParse((await params).attemptId)
  const answer = answerSchema.safeParse(await request.json().catch(() => null))
  if (!attemptId.success || !answer.success) return NextResponse.json({ error: 'Invalid answer' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { error } = await admin.rpc('save_student_exam_answer', {
    p_attempt_id: attemptId.data,
    p_question_id: answer.data.questionId,
    p_selected_option: answer.data.selectedOption,
    p_auth_user_id: student.userId,
  })
  if (error) {
    return NextResponse.json({ error: error.message.includes('not active') ? 'परीक्षेची वेळ संपली आहे.' : 'उत्तर save झाले नाही.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
