import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function GET(_request: Request, { params }: { params: Promise<{ examId: string }> }) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const examId = z.string().uuid().safeParse((await params).examId)
  if (!examId.success) return NextResponse.json({ error: 'Invalid exam' }, { status: 400 })
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('exam_attempts')
    .select('id,attempt_no,started_at,submitted_at,status,score,max_score,percentage,correct_count,wrong_count,unanswered_count,students!inner(roll_number,name)')
    .eq('exam_id', examId.data)
    .order('started_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: data || [] })
}
