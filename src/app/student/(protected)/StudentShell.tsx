'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpenCheck, Home, LogOut, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { StudentSession } from '@/lib/student-auth'

export default function StudentShell({ student, children }: { student: StudentSession; children: React.ReactNode }) {
  const router = useRouter()
  async function logout() {
    await supabase.auth.signOut()
    router.replace('/student/login')
    router.refresh()
  }

  return (
    <div className="student-portal-shell">
      <header className="student-portal-header">
        <Link href="/student/exams"><BookOpenCheck /><span><strong>Exam Portal</strong><small>शिवरक्षक अकॅडमी</small></span></Link>
        <div><span className="student-identity"><UserRound /><b>{student.name}</b><small>{student.rollNumber}</small></span><button onClick={logout}><LogOut /> Logout</button></div>
      </header>
      <nav className="student-portal-nav"><Link href="/student/exams"><Home /> परीक्षा व निकाल</Link></nav>
      {children}
    </div>
  )
}
