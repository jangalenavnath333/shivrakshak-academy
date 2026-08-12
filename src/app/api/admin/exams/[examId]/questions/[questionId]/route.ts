import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function DELETE(_request: Request, { params }: { params: Promise<{ examId: string; questionId: string }> }) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const values = await params
  const examId = z.string().uuid().safeParse(values.examId)
  const questionId = z.string().uuid().safeParse(values.questionId)
  if (!examId.success || !questionId.success) return NextResponse.json({ error: 'Invalid question' }, { status: 400 })
  const admin = createSupabaseAdminClient()
  const { error } = await admin.rpc('admin_delete_exam_question', {
    p_exam_id: examId.data,
    p_question_id: questionId.data,
  })
  if (error) {
    const status = error.message.includes('locked') ? 409 : error.message.includes('not found') ? 404 : 400
    return NextResponse.json({ error: status === 409 ? 'पहिला attempt सुरू झाल्यानंतर question paper बदलता येत नाही.' : error.message }, { status })
  }
  return NextResponse.json({ ok: true })
}
