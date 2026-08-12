import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getStudentUser } from '@/lib/student-auth'

export async function GET(_request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const student = await getStudentUser()
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const attemptId = z.string().uuid().safeParse((await params).attemptId)
  if (!attemptId.success) return NextResponse.json({ error: 'Invalid attempt' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: loadedAttempt, error: attemptError } = await admin
    .from('exam_attempts')
    .select('id,exam_id,student_id,attempt_no,started_at,expires_at,submitted_at,status,score,max_score,percentage,correct_count,wrong_count,unanswered_count')
    .eq('id', attemptId.data)
    .eq('student_id', student.studentId)
    .maybeSingle()

  if (attemptError || !loadedAttempt) return NextResponse.json({ error: 'Attempt सापडला नाही.' }, { status: 404 })
  let attempt = loadedAttempt

  if (attempt.status === 'in_progress' && attempt.expires_at && new Date(attempt.expires_at).getTime() <= Date.now()) {
    await admin.rpc('submit_student_exam', { p_attempt_id: attempt.id, p_auth_user_id: student.userId })
    const refreshed = await admin.from('exam_attempts').select('id,exam_id,student_id,attempt_no,started_at,expires_at,submitted_at,status,score,max_score,percentage,correct_count,wrong_count,unanswered_count').eq('id', attempt.id).single()
    if (refreshed.data) attempt = refreshed.data
  }

  const { data: exam, error: examError } = await admin
    .from('exams')
    .select('id,title,description,instructions,duration_minutes,total_marks,pass_marks,result_release_at')
    .eq('id', attempt.exam_id)
    .single()

  if (examError || !exam) return NextResponse.json({ error: 'Exam सापडली नाही.' }, { status: 404 })
  const resultReleased = !exam.result_release_at || new Date(exam.result_release_at).getTime() <= Date.now()

  if (attempt.status !== 'in_progress') {
    return NextResponse.json({
      completed: true,
      exam: { id: exam.id, title: exam.title, resultReleaseAt: exam.result_release_at },
      result: resultReleased ? {
        score: attempt.score,
        maxScore: attempt.max_score,
        percentage: attempt.percentage,
        correctCount: attempt.correct_count,
        wrongCount: attempt.wrong_count,
        unansweredCount: attempt.unanswered_count,
      } : null,
    })
  }

  const [{ data: questions, error: questionError }, { data: answers, error: answerError }] = await Promise.all([
    admin.from('exam_questions').select('id,question_text,options,marks,sort_order').eq('exam_id', exam.id).order('sort_order'),
    admin.from('exam_answers').select('question_id,selected_option').eq('attempt_id', attempt.id),
  ])

  if (questionError || answerError) {
    console.error('Exam attempt content load failed', { questionCode: questionError?.code, answerCode: answerError?.code })
    return NextResponse.json({ error: 'Question paper load झाला नाही.' }, { status: 500 })
  }

  return NextResponse.json({
    completed: false,
    serverNow: new Date().toISOString(),
    attempt: { id: attempt.id, expiresAt: attempt.expires_at, attemptNo: attempt.attempt_no },
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      instructions: exam.instructions,
      durationMinutes: exam.duration_minutes,
      totalMarks: exam.total_marks,
    },
    questions: questions || [],
    answers: Object.fromEntries((answers || []).map((answer) => [answer.question_id, answer.selected_option])),
  })
}
