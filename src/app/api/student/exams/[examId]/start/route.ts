import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStudentUser } from '@/lib/student-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(_request: Request, { params }: { params: Promise<{ examId: string }> }) {
  const student = await getStudentUser()
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const examId = z.string().uuid().safeParse((await params).examId)
  if (!examId.success) return NextResponse.json({ error: 'Invalid exam' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.rpc('start_student_exam', { p_exam_id: examId.data, p_auth_user_id: student.userId })
  const attempt = Array.isArray(data) ? data[0] : data
  if (error || !attempt?.attempt_id) {
    const message = error?.message?.includes('not started') ? 'परीक्षा अजून सुरू झालेली नाही.'
      : error?.message?.includes('ended') ? 'परीक्षेची वेळ संपली आहे.'
      : error?.message?.includes('Maximum attempts') ? 'या परीक्षेसाठी उपलब्ध सर्व attempts वापरले आहेत.'
      : error?.message?.includes('no questions') ? 'या परीक्षेत अजून प्रश्न जोडलेले नाहीत.'
      : `परीक्षा सुरू करता आली नाही. Error: ${error?.message || 'Unknown'}`
    console.error('Exam start failed:', { examId: examId.data, userId: student.userId, error })
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ attemptId: attempt.attempt_id, expiresAt: attempt.expires_at, resumed: attempt.resumed })
}
