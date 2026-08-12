import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { requireStudent } from '@/lib/student-auth'
import StudentExamList from './StudentExamList'

export default async function StudentExamsPage() {
  const student = await requireStudent()
  const admin = createSupabaseAdminClient()
  const [{ data: exams, error: examError }, { data: attempts, error: attemptError }] = await Promise.all([
    admin.from('exams').select('id,title,description,instructions,course,duration_minutes,total_marks,pass_marks,max_attempts,starts_at,ends_at,result_release_at,is_live').eq('is_published', true).order('starts_at', { ascending: true, nullsFirst: false }),
    admin.from('exam_attempts').select('id,exam_id,attempt_no,started_at,expires_at,submitted_at,status,score,max_score,percentage,correct_count,wrong_count,unanswered_count').eq('student_id', student.studentId).order('attempt_no', { ascending: false }),
  ])

  if (examError || attemptError) {
    console.error('Student exam dashboard load failed', { examCode: examError?.code, attemptCode: attemptError?.code })
  }

  const eligibleExams = (exams || []).filter((exam) => exam.course === 'all' || exam.course === student.course)
  return (
    <main className="student-portal-page">
      <div className="student-portal-welcome"><span>नमस्कार, {student.name}</span><h1>तुमच्या Online परीक्षा</h1><p>Schedule तपासा, उपलब्ध परीक्षा सुरू करा आणि जाहीर झालेले निकाल पहा.</p></div>
      <StudentExamList exams={eligibleExams} attempts={attempts || []} serverNow={new Date().toISOString()} />
    </main>
  )
}
