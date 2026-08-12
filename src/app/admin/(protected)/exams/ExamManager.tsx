'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, CalendarClock, CheckCircle2, Edit3, Eye, EyeOff, FileQuestion, LoaderCircle, PlusCircle, Radio, Save, Trash2, UsersRound } from 'lucide-react'

type Exam = {
  id: string
  title: string
  description: string
  instructions: string
  course: string
  duration_minutes: number
  total_marks: number
  negative_marks: number
  pass_marks: number
  max_attempts: number
  starts_at: string | null
  ends_at: string | null
  result_release_at: string | null
  is_live: boolean
  is_published: boolean
  question_count: number
  calculated_marks: number
  attempt_count: number
  completed_count: number
}
type Question = { id: string; question_text: string; options: string[]; correct_option: number; marks: number; sort_order: number }
type ResultRow = {
  id: string
  attempt_no: number
  started_at: string
  submitted_at: string | null
  status: string
  score: number | null
  max_score: number | null
  percentage: number | null
  correct_count: number
  wrong_count: number
  unanswered_count: number
  students: { roll_number: string; name: string } | { roll_number: string; name: string }[]
}

const blankExam = {
  id: '', title: '', description: '', instructions: 'सर्व प्रश्न काळजीपूर्वक वाचा. वेळ संपण्यापूर्वी Final Submit करा.', course: 'all',
  duration_minutes: 60, negative_marks: 0, pass_marks: 35, max_attempts: 1,
  starts_at: '', ends_at: '', result_release_at: '', is_live: false, is_published: false,
}
const blankQuestion = { id: '', question_text: '', options: ['', '', '', ''], correct_option: 0, marks: 1, sort_order: 1 }

const toLocalInput = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const toIso = (value: string) => value ? new Date(value).toISOString() : null
const formatDate = (value: string | null) => value ? new Date(value).toLocaleString('mr-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : '—'

export default function ExamManager() {
  const [exams, setExams] = useState<Exam[]>([])
  const [form, setForm] = useState(blankExam)
  const [selected, setSelected] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [results, setResults] = useState<ResultRow[]>([])
  const [question, setQuestion] = useState(blankQuestion)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questionSaving, setQuestionSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadExams = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/exams', { cache: 'no-store' })
      const payload = await response.json() as { data?: Exam[]; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Exams load झाल्या नाहीत.')
      setExams(payload.data || [])
      setSelected((current) => current ? (payload.data || []).find((item) => item.id === current.id) || null : null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Exams load झाल्या नाहीत.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/admin/exams', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json() as { data?: Exam[]; error?: string }
        if (!response.ok) throw new Error(payload.error || 'Exams load झाल्या नाहीत.')
        if (active) setExams(payload.data || [])
      })
      .catch((caught) => active && setError(caught instanceof Error ? caught.message : 'Exams load झाल्या नाहीत.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  async function loadWorkspace(exam: Exam) {
    setSelected(exam)
    setError('')
    try {
      const [questionResponse, resultResponse] = await Promise.all([
        fetch(`/api/admin/exams/${exam.id}/questions`, { cache: 'no-store' }),
        fetch(`/api/admin/exams/${exam.id}/results`, { cache: 'no-store' }),
      ])
      const questionPayload = await questionResponse.json() as { data?: Question[]; error?: string }
      const resultPayload = await resultResponse.json() as { data?: ResultRow[]; error?: string }
      if (!questionResponse.ok || !resultResponse.ok) {
        throw new Error(questionPayload.error || resultPayload.error || 'Exam details load झाले नाहीत.')
      }
      setQuestions(questionPayload.data || [])
      setResults(resultPayload.data || [])
      setQuestion({ ...blankQuestion, sort_order: (questionPayload.data?.length || 0) + 1 })
    } catch (caught) {
      setQuestions([])
      setResults([])
      setError(caught instanceof Error ? caught.message : 'Exam details load झाले नाहीत.')
    }
  }

  function editExam(exam: Exam) {
    setForm({
      id: exam.id, title: exam.title, description: exam.description || '', instructions: exam.instructions || '', course: exam.course,
      duration_minutes: exam.duration_minutes, negative_marks: Number(exam.negative_marks), pass_marks: Number(exam.pass_marks), max_attempts: exam.max_attempts,
      starts_at: toLocalInput(exam.starts_at), ends_at: toLocalInput(exam.ends_at), result_release_at: toLocalInput(exam.result_release_at),
      is_live: exam.is_live, is_published: exam.is_published,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveExam() {
    setSaving(true); setError(''); setMessage('')
    try {
      const body = { ...form, starts_at: toIso(form.starts_at), ends_at: toIso(form.ends_at), result_release_at: toIso(form.result_release_at) }
      const response = await fetch('/api/admin/exams', {
        method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const payload = await response.json() as { data?: Exam; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Exam save झाली नाही.')
      setMessage(form.id ? 'परीक्षा व वेळापत्रक update झाले.' : 'परीक्षा तयार झाली. आता प्रश्न जोडा.')
      setForm(blankExam)
      await loadExams()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Exam save झाली नाही.') }
    finally { setSaving(false) }
  }

  async function saveQuestion() {
    if (!selected) return
    setQuestionSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch(`/api/admin/exams/${selected.id}/questions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(question),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'Question save झाला नाही.')
      setMessage(question.id ? 'Question update झाला.' : 'Question जोडला.')
      const refreshed = await fetch(`/api/admin/exams/${selected.id}/questions`, { cache: 'no-store' })
      const refreshedPayload = await refreshed.json() as { data?: Question[]; error?: string }
      if (!refreshed.ok) throw new Error(refreshedPayload.error || 'Question paper refresh झाला नाही.')
      setQuestions(refreshedPayload.data || [])
      setQuestion({ ...blankQuestion, sort_order: (refreshedPayload.data?.length || 0) + 1 })
      await loadExams()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Question save झाला नाही.') }
    finally { setQuestionSaving(false) }
  }

  async function deleteQuestion(questionId: string) {
    if (!selected || !window.confirm('हा question delete करायचा आहे का?')) return
    setError('')
    try {
      const response = await fetch(`/api/admin/exams/${selected.id}/questions/${questionId}`, { method: 'DELETE' })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'Question delete झाला नाही.')
      setQuestions((current) => current.filter((item) => item.id !== questionId))
      await loadExams()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Question delete झाला नाही.')
    }
  }

  const totalQuestionMarks = useMemo(() => questions.reduce((sum, item) => sum + Number(item.marks), 0), [questions])

  return (
    <div className="admin-page exam-manager">
      <div className="page-header"><div><h1 className="page-title">Online परीक्षा व्यवस्थापन</h1><p className="page-subtitle">Exam schedule, प्रश्नपत्रिका, live attempts आणि निकाल एकाच ठिकाणी.</p></div><div className="exam-security-note"><CheckCircle2 /> Server timer & secure scoring</div></div>
      {error && <div className="admin-alert error">{error}</div>}{message && <div className="admin-alert success">{message}</div>}

      <section className="admin-card exam-editor">
        <div className="exam-editor-heading"><div><h2>{form.id ? 'परीक्षा Edit / Reschedule' : 'नवीन परीक्षा तयार करा'}</h2><p>Publish करण्यापूर्वी schedule आणि result release time तपासा.</p></div>{form.id && <button className="btn btn-secondary" onClick={() => setForm(blankExam)}>नवीन Form</button>}</div>
        <div className="admin-form-grid exam-form-grid">
          <label><span className="form-label">परीक्षेचे नाव *</span><input className="form-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label><span className="form-label">कोर्स</span><select className="form-input" value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}><option value="all">सर्व विद्यार्थी</option><option value="police">Police</option><option value="army">Army</option><option value="navy">Navy</option><option value="mpsc">MPSC</option><option value="railway">Railway</option><option value="staff_selection">Staff Selection</option><option value="saral_seva">Saral Seva</option><option value="other">Other</option></select></label>
          <label className="wide-field"><span className="form-label">वर्णन</span><textarea className="form-input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="wide-field"><span className="form-label">विद्यार्थ्यांसाठी सूचना</span><textarea className="form-input" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} /></label>
          <label><span className="form-label">सुरू होण्याची वेळ</span><input type="datetime-local" className="form-input" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} /></label>
          <label><span className="form-label">समाप्त होण्याची वेळ</span><input type="datetime-local" className="form-input" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} /></label>
          <label><span className="form-label">निकाल जाहीर करण्याची वेळ</span><input type="datetime-local" className="form-input" value={form.result_release_at} onChange={(event) => setForm({ ...form, result_release_at: event.target.value })} /></label>
          <label><span className="form-label">कालावधी (मिनिटे)</span><input type="number" className="form-input" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })} /></label>
          <label><span className="form-label">Pass Marks</span><input type="number" className="form-input" value={form.pass_marks} onChange={(event) => setForm({ ...form, pass_marks: Number(event.target.value) })} /></label>
          <label><span className="form-label">Wrong Answer Negative Marks</span><input type="number" step="0.25" className="form-input" value={form.negative_marks} onChange={(event) => setForm({ ...form, negative_marks: Number(event.target.value) })} /></label>
          <label><span className="form-label">Maximum Attempts</span><input type="number" min="1" max="10" className="form-input" value={form.max_attempts} onChange={(event) => setForm({ ...form, max_attempts: Number(event.target.value) })} /></label>
          <label className="check-control"><input type="checkbox" checked={form.is_live} onChange={(event) => setForm({ ...form, is_live: event.target.checked })} /><Radio /> LIVE badge दाखवा</label>
          <label className="check-control"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />{form.is_published ? <Eye /> : <EyeOff />} विद्यार्थ्यांना Publish करा</label>
        </div>
        <button className="btn btn-primary exam-save-button" onClick={saveExam} disabled={saving || !form.title}>{saving ? <LoaderCircle className="spin" /> : <Save />} {form.id ? 'बदल Save करा' : 'परीक्षा तयार करा'}</button>
      </section>

      <section className="exam-overview">
        <div className="exam-list-panel admin-card"><h2>सर्व परीक्षा <span>{exams.length}</span></h2>{loading ? <div className="admin-loading"><LoaderCircle className="spin" /></div> : exams.length === 0 ? <div className="admin-empty"><FileQuestion /><p>पहिली परीक्षा तयार करा.</p></div> : exams.map((exam) => <article key={exam.id} className={selected?.id === exam.id ? 'selected' : ''}><div className="exam-list-title"><span className={exam.is_published ? 'published' : 'draft'}>{exam.is_published ? 'PUBLISHED' : 'DRAFT'}</span><h3>{exam.title}</h3><p>{formatDate(exam.starts_at)}</p></div><div className="exam-list-stats"><span><FileQuestion /> {exam.question_count} प्रश्न</span><span><UsersRound /> {exam.attempt_count} attempts</span><span><BarChart3 /> {exam.completed_count} निकाल</span></div><div className="exam-list-actions"><button onClick={() => editExam(exam)}><Edit3 /> Edit / Reschedule</button><button onClick={() => loadWorkspace(exam)}><PlusCircle /> Questions & Results</button></div></article>)}</div>

        <div className="exam-workspace admin-card">
          {!selected ? <div className="admin-empty large"><FileQuestion /><h2>Question Paper तयार करा</h2><p>डावीकडून परीक्षा निवडा. येथे प्रश्न, correct answer आणि results दिसतील.</p></div> : <>
            <div className="workspace-heading"><div><small>SELECTED EXAM</small><h2>{selected.title}</h2><p>{questions.length} प्रश्न · {totalQuestionMarks} गुण · {results.length} attempts</p></div><button className="btn btn-secondary" onClick={() => editExam(selected)}><CalendarClock /> Reschedule</button></div>
            <div className="question-editor"><h3>{question.id ? 'Question Edit करा' : 'नवीन Question जोडा'}</h3><label><span className="form-label">Question *</span><textarea className="form-input" value={question.question_text} onChange={(event) => setQuestion({ ...question, question_text: event.target.value })} /></label><div className="question-options-editor">{question.options.map((option, optionIndex) => <label key={optionIndex} className={question.correct_option === optionIndex ? 'correct' : ''}><input type="radio" checked={question.correct_option === optionIndex} onChange={() => setQuestion({ ...question, correct_option: optionIndex })} /><span>{String.fromCharCode(65 + optionIndex)}</span><input className="form-input" value={option} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} onChange={(event) => setQuestion({ ...question, options: question.options.map((item, index) => index === optionIndex ? event.target.value : item) })} /></label>)}</div><div className="question-editor-footer"><label><span className="form-label">गुण</span><input type="number" className="form-input" value={question.marks} onChange={(event) => setQuestion({ ...question, marks: Number(event.target.value) })} /></label><label><span className="form-label">क्रमांक</span><input type="number" className="form-input" value={question.sort_order} onChange={(event) => setQuestion({ ...question, sort_order: Number(event.target.value) })} /></label><button className="btn btn-primary" onClick={saveQuestion} disabled={questionSaving || !question.question_text || question.options.some((option) => !option)}>{questionSaving ? <LoaderCircle className="spin" /> : <Save />} Question Save</button>{question.id && <button className="btn btn-secondary" onClick={() => setQuestion({ ...blankQuestion, sort_order: questions.length + 1 })}>Cancel</button>}</div></div>
            <div className="question-list"><h3>Question Paper</h3>{questions.length === 0 ? <p className="empty-inline">Publish करण्यापूर्वी questions जोडा.</p> : questions.map((item, itemIndex) => <article key={item.id}><span>{itemIndex + 1}</span><div><b>{item.question_text}</b><p>{item.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join(' · ')}</p><small>Correct: {String.fromCharCode(65 + item.correct_option)} · {item.marks} गुण</small></div><button onClick={() => setQuestion(item)} aria-label="Edit question"><Edit3 /></button><button className="danger" onClick={() => deleteQuestion(item.id)} aria-label="Delete question"><Trash2 /></button></article>)}</div>
            <div className="exam-results"><h3>विद्यार्थी निकाल</h3>{results.length === 0 ? <p className="empty-inline">अजून कुणी परीक्षा दिलेली नाही.</p> : <div className="table-scroll"><table className="data-table"><thead><tr><th>विद्यार्थी</th><th>Attempt</th><th>Status</th><th>Score</th><th>%</th><th>Submitted</th></tr></thead><tbody>{results.map((row) => { const linked = Array.isArray(row.students) ? row.students[0] : row.students; return <tr key={row.id}><td><b>{linked?.roll_number}</b><br />{linked?.name}</td><td>{row.attempt_no}</td><td><span className={`badge ${row.status === 'evaluated' ? 'badge-green' : 'badge-yellow'}`}>{row.status}</span></td><td>{row.score ?? '—'} / {row.max_score ?? '—'}</td><td>{row.percentage ?? '—'}</td><td>{formatDate(row.submitted_at)}</td></tr> })}</tbody></table></div>}</div>
          </>}
        </div>
      </section>
    </div>
  )
}
