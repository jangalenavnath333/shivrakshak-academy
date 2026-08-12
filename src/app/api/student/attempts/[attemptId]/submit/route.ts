import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStudentUser } from '@/lib/student-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(_request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const student = await getStudentUser()
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const attemptId = z.string().uuid().safeParse((await params).attemptId)
  if (!attemptId.success) return NextResponse.json({ error: 'Invalid attempt' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.rpc('submit_student_exam', { p_attempt_id: attemptId.data, p_auth_user_id: student.userId })
  const result = Array.isArray(data) ? data[0] : data
  if (error || !result) return NextResponse.json({ error: 'परीक्षा submit झाली नाही.' }, { status: 400 })
  return NextResponse.json({
    submittedAt: result.submitted_at,
    resultReleased: result.result_released,
    result: result.result_released ? {
      score: result.score,
      maxScore: result.max_score,
      percentage: result.percentage,
      correctCount: result.correct_count,
      wrongCount: result.wrong_count,
      unansweredCount: result.unanswered_count,
    } : null,
  })
}
