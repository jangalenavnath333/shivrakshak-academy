'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, LoaderCircle, Send, ShieldAlert, Wifi, WifiOff } from 'lucide-react'

type Question = { id: string; question_text: string; options: string[]; marks: number; sort_order: number }
type ExamData = {
  completed: false
  serverNow: string
  attempt: { id: string; expiresAt: string; attemptNo: number }
  exam: { id: string; title: string; description: string | null; instructions: string; durationMinutes: number; totalMarks: number }
  questions: Question[]
  answers: Record<string, string | null>
}
type Result = { score: number; maxScore: number; percentage: number; correctCount: number; wrongCount: number; unansweredCount: number }

export default function ExamRunner({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<ExamData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const [online, setOnline] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState<{ released: boolean; result: Result | null } | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [rulesRead, setRulesRead] = useState(false)
  const submitExamRef = useRef<(automatic?: boolean) => Promise<void>>(async () => {})
  const autoSubmittedRef = useRef(false)

  const submitExam = useCallback(async (automatic = false) => {
    if (submitting || finished) return
    if (automatic && autoSubmittedRef.current) return
    if (!automatic && !window.confirm('परीक्षा final submit करायची आहे का? Submit केल्यानंतर उत्तरे बदलता येणार नाहीत.')) return
    if (automatic) autoSubmittedRef.current = true
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(`/api/student/attempts/${attemptId}/submit`, { method: 'POST' })
      const result = await response.json().catch(() => ({})) as { error?: string; resultReleased?: boolean; result?: Result | null }
      if (!response.ok) throw new Error(result.error || 'परीक्षा submit झाली नाही.')
      setFinished({ released: !!result.resultReleased, result: result.result || null })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'परीक्षा submit झाली नाही.')
    } finally {
      setSubmitting(false)
    }
  }, [attemptId, finished, submitting])

  useEffect(() => { submitExamRef.current = submitExam }, [submitExam])

  useEffect(() => {
    let active = true
    fetch(`/api/student/attempts/${attemptId}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Question paper load झाला नाही.')
        if (!active) return
        if (payload.completed) {
          setFinished({ released: !!payload.result, result: payload.result || null })
          return
        }
        const examData = payload as ExamData
        setData(examData)
        setAnswers(examData.answers)
        const serverOffset = new Date(examData.serverNow).getTime() - Date.now()
        setSeconds(Math.max(0, Math.ceil((new Date(examData.attempt.expiresAt).getTime() - (Date.now() + serverOffset)) / 1000)))
      })
      .catch((caught) => active && setError(caught instanceof Error ? caught.message : 'Question paper load झाला नाही.'))
    return () => { active = false }
  }, [attemptId])

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  // Leaving the tab/app mid-exam auto-submits immediately — students are warned about this on the rules screen before they start.
  useEffect(() => {
    if (!acknowledged || finished) return
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') void submitExamRef.current(true)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [acknowledged, finished])

  useEffect(() => {
    if (!data || finished) return
    const serverOffset = new Date(data.serverNow).getTime() - Date.now()
    const deadline = new Date(data.attempt.expiresAt).getTime()
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - (Date.now() + serverOffset)) / 1000))
      setSeconds(remaining)
      if (remaining === 0) {
        window.clearInterval(timer)
        void submitExamRef.current(true)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [data, finished])

  async function selectAnswer(questionId: string, selectedOption: string) {
    const previous = answers[questionId]
    setAnswers((current) => ({ ...current, [questionId]: selectedOption }))
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/student/attempts/${attemptId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedOption }),
      })
      const result = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'उत्तर save झाले नाही.')
    } catch (caught) {
      setAnswers((current) => ({ ...current, [questionId]: previous }))
      setError(caught instanceof Error ? caught.message : 'उत्तर save झाले नाही.')
    } finally {
      setSaving(false)
    }
  }

  const answeredCount = useMemo(() => Object.values(answers).filter((value) => value !== null && value !== undefined).length, [answers])
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  if (finished) return <main className="exam-finished"><div><CheckCircle2 /><h1>परीक्षा यशस्वीपणे Submit झाली</h1>{finished.released && finished.result ? <section><span>तुमचा Score</span><strong>{finished.result.score} / {finished.result.maxScore}</strong><b>{finished.result.percentage}%</b><p>बरोबर {finished.result.correctCount} · चूक {finished.result.wrongCount} · न सोडवलेले {finished.result.unansweredCount}</p></section> : <p>निकाल Adminने ठरवलेल्या वेळेला Exam Portalमध्ये दिसेल.</p>}<Link href="/student/exams">परीक्षा व निकाल पहा</Link></div></main>
  if (!data && !error) return <main className="exam-loading"><LoaderCircle className="spin" /><p>Question paper सुरक्षितपणे load होत आहे…</p></main>
  if (!data) return <main className="exam-loading"><AlertTriangle /><p>{error}</p><Link href="/student/exams">मागे जा</Link></main>

  if (!acknowledged) return (
    <main className="exam-rules">
      <div>
        <ShieldAlert />
        <h1>{data.exam.title}</h1>
        {data.exam.description && <p className="exam-rules-desc">{data.exam.description}</p>}
        <div className="exam-rules-meta"><span><Clock3 /> {data.exam.durationMinutes} मिनिटे</span><span>{data.exam.totalMarks} गुण</span><span>Attempt {data.attempt.attemptNo}</span></div>
        {data.exam.instructions && <div className="exam-rules-box"><b>परीक्षेच्या सूचना</b><p>{data.exam.instructions}</p></div>}
        <div className="exam-rules-box exam-rules-warning">
          <b>महत्त्वाचे नियम</b>
          <ul>
            <li>प्रश्न किंवा उत्तरांचा मजकूर copy करता येणार नाही.</li>
            <li>परीक्षा सुरू असताना दुसऱ्या tab/app वर गेल्यास परीक्षा लगेच आपोआप Submit होईल — परत सुरू करता येणार नाही.</li>
            <li>वेळ संपल्यास परीक्षा आपोआप Submit होईल.</li>
            <li>Submit केल्यानंतर उत्तरे बदलता येणार नाहीत.</li>
          </ul>
        </div>
        <label className="exam-rules-check"><input type="checkbox" checked={rulesRead} onChange={(event) => setRulesRead(event.target.checked)} /> मी वरील सर्व सूचना व नियम काळजीपूर्वक वाचले आहेत.</label>
        <button className="exam-submit" onClick={() => setAcknowledged(true)} disabled={!rulesRead}>परीक्षा सुरू करा</button>
      </div>
    </main>
  )

  const question = data.questions[index]
  return (
    <main className="exam-runner" onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()}>
      <header><div><small>Online परीक्षा · Attempt {data.attempt.attemptNo}</small><h1>{data.exam.title}</h1></div><div className={seconds < 300 ? 'exam-timer urgent' : 'exam-timer'}><Clock3 /><span>{time}</span></div></header>
      <div className="exam-connection">{online ? <><Wifi /> Online</> : <><WifiOff /> Internet बंद — उत्तर save होईपर्यंत page बंद करू नका</>}{saving && <span><LoaderCircle className="spin" /> उत्तर save होत आहे</span>}</div>
      {error && <div className="exam-runner-error"><AlertTriangle /> {error}</div>}
      <div className="exam-progress"><span>{answeredCount} / {data.questions.length} उत्तरे</span><div><i style={{ width: `${(answeredCount / Math.max(data.questions.length, 1)) * 100}%` }} /></div></div>
      <div className="exam-runner-layout">
        <aside><b>प्रश्न सूची</b><div>{data.questions.map((item, questionIndex) => <button key={item.id} className={`${questionIndex === index ? 'current' : ''} ${answers[item.id] != null ? 'answered' : ''}`} onClick={() => setIndex(questionIndex)} disabled={saving || submitting}>{questionIndex + 1}</button>)}</div></aside>
        <section className="exam-question-card">
          <div className="exam-question-number"><span>प्रश्न {index + 1}</span><b>{question.marks} गुण</b></div>
          <h2>{question.question_text}</h2>
          <div className="exam-options">{question.options.map((option, optionIndex) => <label key={`${question.id}-${optionIndex}`} className={answers[question.id] === String(optionIndex) ? 'selected' : ''}><input type="radio" name={question.id} checked={answers[question.id] === String(optionIndex)} onChange={() => selectAnswer(question.id, String(optionIndex))} disabled={saving || submitting} /><span>{String.fromCharCode(65 + optionIndex)}</span><b>{option}</b></label>)}</div>
          <footer><button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0 || saving || submitting}><ChevronLeft /> मागील</button>{index < data.questions.length - 1 ? <button onClick={() => setIndex((value) => Math.min(data.questions.length - 1, value + 1))} disabled={saving || submitting}>पुढील <ChevronRight /></button> : <button className="exam-submit" onClick={() => submitExam(false)} disabled={submitting || saving}>{submitting ? <LoaderCircle className="spin" /> : <Send />} Final Submit</button>}</footer>
        </section>
      </div>
    </main>
  )
}
