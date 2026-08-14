export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const admin = createSupabaseAdminClient()
  const { data: q } = await admin.from('exam_questions').select('*').limit(1)
  return NextResponse.json({ question_schema: q })
}
