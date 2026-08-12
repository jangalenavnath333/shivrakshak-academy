import 'server-only'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type StudentSession = {
  userId: string
  studentId: string
  rollNumber: string
  name: string
  course: string | null
}

export function getStudentLoginEmail(rollNumber: string) {
  return `${rollNumber.trim().toLowerCase()}@students.shivrakshakacademy.in`
}

export async function getStudentUser(): Promise<StudentSession | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || user.app_metadata?.role !== 'student') return null

  const admin = createSupabaseAdminClient()
  const { data: student } = await admin
    .from('students')
    .select('id, roll_number, name, course, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!student?.is_active || !student.roll_number) return null

  return {
    userId: user.id,
    studentId: student.id,
    rollNumber: student.roll_number,
    name: student.name,
    course: student.course,
  }
}

export async function requireStudent(): Promise<StudentSession> {
  const student = await getStudentUser()
  if (!student) redirect('/student/login')
  return student
}
