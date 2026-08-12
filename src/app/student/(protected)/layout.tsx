import { requireStudent } from '@/lib/student-auth'
import StudentShell from './StudentShell'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent()
  return <StudentShell student={student}>{children}</StudentShell>
}
