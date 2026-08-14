import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import EditStudentForm from './EditStudentForm'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: student } = await supabase.from('students').select('*').eq('id', id).maybeSingle()
  if (!student) notFound()

  return <EditStudentForm student={student} />
}
