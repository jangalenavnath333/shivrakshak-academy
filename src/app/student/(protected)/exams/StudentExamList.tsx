'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Award, CalendarClock, CheckCircle2, Clock3, LoaderCircle, PlayCircle, RotateCcw } from 'lucide-react'

type Exam = {
  id: string
  title: string
  description: string | null
  instructions: string
  course: string
  duration_minutes: number
  total_marks: number
  pass_marks: number
  max_attempts: number
  starts_at: string | null
  ends_at: string | null
  result_release_at: string | null
  is_live: boolean
}

type Attempt = {
  id: string
  exam_id: string
  attempt_no: number
  started_at: string
  expires_at: string | null
  submitted_at: string | null
  status: string
  score: number | null
  max_score: number | null
  percentage: number | null
  correct_count: number
  wrong_count: number
  unanswered_count: number
}

const formatDate = (value: string | null) => value
  ? new Date(value).toLocaleString('mr-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
  : 'कधीही'

export default function StudentExamList({ exams, attempts, serverNow }: { exams: Exam[]; attempts: Attempt[]; serverNow: string }) {
  const router = useRouter()
  const [starting, setStarting] = useState('')
  const [confirming, setConfirming] = useState('')
  const [error, setError] = useState('')
  
  // Use a ticking local timer synced with the server time offset
  const [now, setNow] = useState(new Date(serverNow).getTime())

  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now()
    const timer = setInterval(() => setNow(Date.now() + offset), 1000)
    
    // Poll the server for exam state changes every 10 seconds
    const refresher = setInterval(() => router.refresh(), 10000)
    
    return () => {
      clearInterval(timer)
      clearInterval(refresher)
    }
  }, [serverNow, router])

  async function startExam(examId: string) {
    if (confirming !== examId) {
      setConfirming(examId)
      return
    }
    setConfirming('')
    setStarting(examId)
    setError('')
    try {
      const response = await fetch(`/api/student/exams/${examId}/start`, { method: 'POST' })
      const result = await response.json().catch(() => ({})) as { attemptId?: string; error?: string }
      if (!response.ok || !result.attemptId) throw new Error(result.error || 'परीक्षा सुरू झाली नाही.')
      router.push(`/student/exams/${examId}/take?attempt=${encodeURIComponent(result.attemptId)}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'परीक्षा सुरू झाली नाही.')
    } finally {
      setStarting('')
    }
  }

  if (exams.length === 0) return <div className="student-empty-exams"><CalendarClock /><h2>सध्या परीक्षा उपलब्ध नाही</h2><p>Admin परीक्षा publish केल्यानंतर ती येथे दिसेल.</p></div>

  return (
    <>
      {error && <div className="student-exam-error" role="alert">{error}</div>}
      <div className="student-exam-grid">
        {exams.map((exam) => {
          const examAttempts = attempts.filter((attempt) => attempt.exam_id === exam.id)
          const inProgress = examAttempts.find((attempt) => attempt.status === 'in_progress')
          const active = inProgress?.expires_at && new Date(inProgress.expires_at).getTime() > now ? inProgress : undefined
          const expiredAttempt = inProgress && !active ? inProgress : undefined
          const completedAttempts = examAttempts.filter((attempt) => attempt.status !== 'in_progress')
          const latestCompleted = completedAttempts[0]
          const hasStarted = !exam.starts_at || new Date(exam.starts_at).getTime() <= now
          const hasEnded = !!exam.ends_at && new Date(exam.ends_at).getTime() <= now
          const attemptsUsed = examAttempts.length
          const canStart = !!expiredAttempt || (hasStarted && !hasEnded && (!!active || attemptsUsed < exam.max_attempts))
          const resultReleased = completedAttempts.length > 0 && (!exam.result_release_at || new Date(exam.result_release_at).getTime() <= now)

          return (
            <article className="student-exam-card" key={exam.id}>
              <div className="student-exam-card-top"><span className={exam.is_live ? 'exam-live-badge' : 'exam-scheduled-badge'}>{exam.is_live ? '● LIVE' : 'SCHEDULED'}</span><span>Attempt {Math.min(attemptsUsed + (active ? 0 : 1), exam.max_attempts)} / {exam.max_attempts}</span></div>
              <h2>{exam.title}</h2>
              <p>{exam.description || 'Online सराव व मूल्यमापन परीक्षा'}</p>
              <div className="student-exam-meta"><span><Clock3 /> {exam.duration_minutes} मिनिटे</span><span><Award /> {exam.total_marks} गुण</span></div>
              <div className="student-exam-schedule"><b>सुरू:</b> {formatDate(exam.starts_at)}<br /><b>समाप्त:</b> {formatDate(exam.ends_at)}</div>

              {resultReleased ? (
                <div className="student-result-box">
                  <CheckCircle2 />
                  <div className="student-result-list">
                    <span>तुमचा निकाल ({completedAttempts.length} प्रयत्न)</span>
                    {completedAttempts.map((attempt) => (
                      <div className="student-result-row" key={attempt.id}>
                        <strong>{attempt.score} / {attempt.max_score} ({attempt.percentage}%)</strong>
                        <small>{formatDate(attempt.submitted_at)} · बरोबर {attempt.correct_count} · चूक {attempt.wrong_count} · न सोडवलेले {attempt.unanswered_count}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ) : latestCompleted ? <div className="student-result-pending"><CalendarClock /> निकाल {exam.result_release_at ? formatDate(exam.result_release_at) : 'लवकरच'} जाहीर होईल</div> : null}

              <button onClick={() => expiredAttempt ? router.push(`/student/exams/${exam.id}/take?attempt=${encodeURIComponent(expiredAttempt.id)}`) : startExam(exam.id)} disabled={!canStart || starting === exam.id} className={confirming === exam.id ? 'confirm-btn' : ''}>
                {starting === exam.id ? <><LoaderCircle className="spin" /> सुरू होत आहे…</> 
                  : confirming === exam.id ? 'हो, तयार आहे (सुरू करा)' 
                  : expiredAttempt ? <><CheckCircle2 /> पूर्ण झालेली परीक्षा उघडा</> 
                  : active ? <><RotateCcw /> परीक्षा पुढे सुरू ठेवा</> 
                  : !hasStarted ? <><CalendarClock /> अजून सुरू नाही</> 
                  : hasEnded ? 'परीक्षा संपली' 
                  : attemptsUsed >= exam.max_attempts ? 'Attempts पूर्ण' 
                  : <><PlayCircle /> परीक्षा सुरू करा</>}
              </button>
              {confirming === exam.id && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button onClick={() => setConfirming('')} style={{ background: 'transparent', color: 'var(--sra-text-muted)', border: 'none', textDecoration: 'underline', padding: '4px' }}>रद्द करा</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
