'use client'

import { BarChart3, CalendarClock, ChevronDown, ChevronUp, CheckCircle2, Download, Edit3, Eye, EyeOff, FileQuestion, LoaderCircle, PlayCircle, PlusCircle, Radio, Save, Trash2, Upload, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

/** Minimal RFC4180 CSV parser — handles quoted fields with embedded commas/newlines/escaped quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1 } else inQuotes = false
      } else field += char
      continue
    }
    if (char === '"') inQuotes = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\r') continue
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else field += char
  }
  row.push(field)
  if (row.length > 1 || row[0] !== '') rows.push(row)
  return rows
}

const CSV_TEMPLATE = 'question_text,option_a,option_b,option_c,option_d,correct_option,marks\n"महाराष्ट्राची राजधानी कोणती?",मुंबई,पुणे,नाशिक,नागपूर,A,1\n'

function downloadCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'question_template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const bulkFileInputRef = useRef<HTMLInputElement>(null)

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
    setShowAdvanced(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveExam() {
    setSaving(true); setError(''); setMessage('')
    try {
      const body = { ...form, starts_at: toIso(form.starts_at), ends_at: toIso(form.ends_at), result_release_at: toIso(form.result_release_at) }
      const response = await fetch('/api/admin/exams', {
        method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const payload = await response.json() as { data?: Exam; error?: string; issues?: any }
      if (!response.ok) {
        let errorMessage = payload.error || 'Exam save झाली नाही.'
        if (payload.issues && payload.issues.fieldErrors) {
          const fields = Object.keys(payload.issues.fieldErrors)
          if (fields.length > 0) {
            errorMessage += ` (Fields: ${fields.join(', ')})`
          }
        }
        throw new Error(errorMessage)
      }
      setMessage(form.id ? 'परीक्षा व वेळापत्रक update झाले.' : 'परीक्षा तयार झाली. आता प्रश्न जोडा.')
      setForm(blankExam)
      setShowAdvanced(false)
      await loadExams()
    } catch (err: any) {
      setError(err.message || String(err))
    } finally { setSaving(false) }
  }

  async function quickAction(exam: Exam, action: 'start' | 'end') {
    if (!window.confirm(action === 'start' ? 'परीक्षा आता लगेच विद्यार्थ्यांसाठी सुरू करायची आहे का?' : 'परीक्षा आता लगेच थांबवायची आहे का? (नवीन विद्यार्थी सुरू करू शकणार नाहीत)')) return
    setError(''); setMessage('')
    try {
      const now = new Date().toISOString()
      const body = {
        ...exam,
        starts_at: action === 'start' ? now : (exam.starts_at && new Date(exam.starts_at) > new Date(now) ? now : exam.starts_at),
        ends_at: action === 'end' ? now : (action === 'start' && exam.ends_at && new Date(exam.ends_at) < new Date(now) ? null : exam.ends_at),
        is_published: true,
        is_live: action === 'start'
      }
      const response = await fetch('/api/admin/exams', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'अॅक्शन पूर्ण झाली नाही.')
      setMessage(action === 'start' ? 'परीक्षा लगेच सुरू झाली! (Live)' : 'परीक्षा थांबवण्यात आली.')
      await loadExams()
      const refreshed = (exams || []).find(e => e.id === exam.id)
      if (refreshed) setSelected({ ...refreshed, ...body })
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'अॅक्शन पूर्ण झाली नाही.') }
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

  async function bulkUploadQuestions(file: File) {
    if (!selected) return
    setBulkUploading(true); setError(''); setMessage('')
    try {
      const text = await file.text()
      const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''))
      if (rows.length < 2) throw new Error('CSV मध्ये किमान एक question row असायला हवा.')
      const [header, ...dataRows] = rows
      const columnIndex = (name: string) => header.findIndex((col) => col.trim().toLowerCase() === name)
      const qIdx = columnIndex('question_text'), aIdx = columnIndex('option_a'), bIdx = columnIndex('option_b')
      const cIdx = columnIndex('option_c'), dIdx = columnIndex('option_d'), correctIdx = columnIndex('correct_option'), marksIdx = columnIndex('marks')
      if ([qIdx, aIdx, bIdx, cIdx, dIdx, correctIdx].some((value) => value === -1)) {
        throw new Error('CSV headers चुकीचे आहेत. खालून Template डाउनलोड करून तोच वापरा.')
      }
      const questionsPayload = dataRows.map((row) => {
        const letter = (row[correctIdx] || '').trim().toUpperCase()
        const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
        const correctOption = letter in letterMap ? letterMap[letter] : Number(letter) - 1
        const marksValue = marksIdx >= 0 ? Number(row[marksIdx]) : 1
        return {
          question_text: (row[qIdx] || '').trim(),
          options: [row[aIdx], row[bIdx], row[cIdx], row[dIdx]].map((value) => (value || '').trim()),
          correct_option: correctOption,
          marks: marksValue > 0 ? marksValue : 1,
        }
      })
      const response = await fetch(`/api/admin/exams/${selected.id}/questions/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questions: questionsPayload }),
      })
      const payload = await response.json() as { created?: number; failed?: number; failures?: { row: number; error: string }[]; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Upload झाला नाही.')
      setMessage(`${payload.created || 0} questions जोडले गेले.${payload.failed ? ` ${payload.failed} अयशस्वी.` : ''}`)
      if (payload.failures && payload.failures.length > 0) {
        setError(payload.failures.map((item) => `Row ${item.row}: ${item.error}`).join(' · '))
      }
      const refreshed = await fetch(`/api/admin/exams/${selected.id}/questions`, { cache: 'no-store' })
      const refreshedPayload = await refreshed.json() as { data?: Question[] }
      setQuestions(refreshedPayload.data || [])
      setQuestion({ ...blankQuestion, sort_order: (refreshedPayload.data?.length || 0) + 1 })
      await loadExams()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Upload झाला नाही.')
    } finally {
      setBulkUploading(false)
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = ''
    }
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

  const examsListMemo = useMemo(() => {
    return exams.map((exam) => <article key={exam.id} className={selected?.id === exam.id ? 'selected' : ''}><div className="exam-list-title"><span className={exam.is_published ? 'published' : 'draft'}>{exam.is_published ? 'PUBLISHED' : 'DRAFT'}</span><h3>{exam.title}</h3><p>{formatDate(exam.starts_at)}</p></div><div className="exam-list-stats"><span><FileQuestion /> {exam.question_count} प्रश्न</span><span><UsersRound /> {exam.attempt_count} attempts</span><span><BarChart3 /> {exam.completed_count} निकाल</span></div><div className="exam-list-actions"><button onClick={() => editExam(exam)}><Edit3 /> Edit / Reschedule</button><button onClick={() => loadWorkspace(exam)}><PlusCircle /> Questions & Results</button></div></article>)
  }, [exams, selected])

  const questionsListMemo = useMemo(() => {
    return questions.map((item, itemIndex) => <article key={item.id}><span>{itemIndex + 1}</span><div><b>{item.question_text}</b><p>{item.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join(' · ')}</p><small>Correct: {String.fromCharCode(65 + item.correct_option)} · {item.marks} गुण</small></div><button onClick={() => setQuestion(item)} aria-label="Edit question"><Edit3 /></button><button className="danger" onClick={() => deleteQuestion(item.id)} aria-label="Delete question"><Trash2 /></button></article>)
  }, [questions])

  const resultsListMemo = useMemo(() => {
    return results.map((row) => { const linked = Array.isArray(row.students) ? row.students[0] : row.students; return <tr key={row.id}><td><b>{linked?.roll_number}</b><br />{linked?.name}</td><td>{row.attempt_no}</td><td><span className={`badge ${row.status === 'evaluated' ? 'badge-green' : 'badge-yellow'}`}>{row.status}</span></td><td>{row.score ?? '—'} / {row.max_score ?? '—'}</td><td>{row.percentage ?? '—'}</td><td>{formatDate(row.submitted_at)}</td></tr> })
  }, [results])

  return (
    <div className="admin-page exam-manager">
      <div className="page-header"><div><h1 className="page-title">Online परीक्षा व्यवस्थापन</h1><p className="page-subtitle">Exam schedule, प्रश्नपत्रिका, live attempts आणि निकाल एकाच ठिकाणी.</p></div><div className="exam-security-note"><CheckCircle2 /> Server timer & secure scoring</div></div>
      <div className="adm-workflow-help adm-workflow-help--numbered">
        <strong>परीक्षेचा पूर्ण क्रम</strong><span>१. परीक्षा तयार करा</span><i>→</i><span>२. Questions जोडा</span><i>→</i><span>३. Publish / सुरू करा</span><i>→</i><span>४. निकाल पहा</span>
      </div>
      {error && <div className="admin-alert error">{error}</div>}{message && <div className="admin-alert success">{message}</div>}

      <section className="admin-card exam-editor">
        <div className="exam-editor-heading"><div><span className="adm-section-kicker">STEP 1 · परीक्षा सेटअप</span><h2>{form.id ? 'परीक्षा Edit / Reschedule' : 'नवीन परीक्षा तयार करा'}</h2><p>आधी नाव, course आणि वेळ भरा. परीक्षा Save झाल्यावर खाली Questions जोडता येतील.</p></div>{form.id && <button className="btn btn-secondary" onClick={() => { setForm(blankExam); setShowAdvanced(false) }}>नवीन Form</button>}</div>
        <div className="admin-form-grid exam-form-grid">
          <label><span className="form-label">परीक्षेचे नाव *</span><input className="form-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label><span className="form-label">कोर्स</span><select className="form-input" value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}><option value="all">सर्व विद्यार्थी</option><option value="police">Police</option><option value="army">Army</option><option value="navy">Navy</option><option value="mpsc">MPSC</option><option value="railway">Railway</option><option value="staff_selection">Staff Selection</option><option value="saral_seva">Saral Seva</option><option value="other">Other</option></select></label>
          <label><span className="form-label">सुरू होण्याची वेळ</span><input type="datetime-local" className="form-input" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} /></label>
          <label><span className="form-label">समाप्त होण्याची वेळ</span><input type="datetime-local" className="form-input" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} /></label>
          <label><span className="form-label">कालावधी (मिनिटे)</span><input type="number" className="form-input" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })} /></label>
          <label className="check-control"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />{form.is_published ? <Eye /> : <EyeOff />} विद्यार्थ्यांना Publish करा</label>
        </div>
        <button type="button" className="exam-advanced-toggle" onClick={() => setShowAdvanced((value) => !value)}>{showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Advanced Settings (वर्णन, गुणपद्धती, निकाल वेळ...)</button>
        {showAdvanced && (
          <div className="admin-form-grid exam-form-grid">
            <label className="wide-field"><span className="form-label">वर्णन</span><textarea className="form-input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label className="wide-field"><span className="form-label">विद्यार्थ्यांसाठी सूचना</span><textarea className="form-input" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} /></label>
            <label><span className="form-label">निकाल जाहीर करण्याची वेळ</span><input type="datetime-local" className="form-input" value={form.result_release_at} onChange={(event) => setForm({ ...form, result_release_at: event.target.value })} /></label>
            <label><span className="form-label">Pass Marks</span><input type="number" className="form-input" value={form.pass_marks} onChange={(event) => setForm({ ...form, pass_marks: Number(event.target.value) })} /></label>
            <label><span className="form-label">Wrong Answer Negative Marks</span><input type="number" step="0.25" className="form-input" value={form.negative_marks} onChange={(event) => setForm({ ...form, negative_marks: Number(event.target.value) })} /></label>
            <label><span className="form-label">Maximum Attempts</span><input type="number" min="1" max="10" className="form-input" value={form.max_attempts} onChange={(event) => setForm({ ...form, max_attempts: Number(event.target.value) })} /></label>
            <label className="check-control"><input type="checkbox" checked={form.is_live} onChange={(event) => setForm({ ...form, is_live: event.target.checked })} /><Radio /> LIVE badge दाखवा</label>
          </div>
        )}
        <button className="btn btn-primary exam-save-button" onClick={saveExam} disabled={saving || !form.title}>{saving ? <LoaderCircle className="spin" /> : <Save />} {form.id ? 'बदल Save करा' : 'परीक्षा तयार करा'}</button>
      </section>

      <section className="exam-overview">
        <div className="exam-list-panel admin-card"><span className="adm-section-kicker">STEP 2 · परीक्षा निवडा</span><h2>तयार केलेल्या परीक्षा <span>{exams.length}</span></h2>{loading ? <div className="admin-loading"><LoaderCircle className="spin" /></div> : exams.length === 0 ? <div className="admin-empty"><FileQuestion /><p>वरचा form भरून पहिली परीक्षा तयार करा.</p></div> : examsListMemo}</div>

        <div className="exam-workspace admin-card">
          {!selected ? <div className="admin-empty large"><FileQuestion /><h2>Question Paper तयार करा</h2><p>डावीकडून परीक्षा निवडा. येथे प्रश्न, correct answer आणि results दिसतील.</p></div> : <>
            <div className="workspace-heading">
              <div><small>SELECTED EXAM</small><h2>{selected.title}</h2><p>{questions.length} प्रश्न · {totalQuestionMarks} गुण · {results.length} attempts</p></div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => quickAction(selected, 'start')} disabled={saving}><PlayCircle size={16} /> लगेच सुरू करा</button>
                <button className="btn btn-secondary" style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }} onClick={() => quickAction(selected, 'end')} disabled={saving}>🛑 लगेच संपवा</button>
                <button className="btn btn-secondary" onClick={() => editExam(selected)}><CalendarClock size={16} /> Reschedule</button>
              </div>
            </div>
            <div className="bulk-upload-card">
              <div><b>एकाचवेळी अनेक Questions Upload करा</b><p>CSV file मधून प्रश्न जोडा — आधी Template डाउनलोड करून त्यातच भरा.</p></div>
              <div className="bulk-upload-actions">
                <button type="button" className="btn btn-secondary" onClick={downloadCsvTemplate}><Download size={15} /> Template डाउनलोड</button>
                <button type="button" className="btn btn-secondary" onClick={() => bulkFileInputRef.current?.click()} disabled={bulkUploading}>{bulkUploading ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />} CSV Upload करा</button>
                <input ref={bulkFileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(event) => { const file = event.target.files?.[0]; if (file) void bulkUploadQuestions(file) }} />
              </div>
            </div>
            <div className="question-editor"><h3>{question.id ? 'Question Edit करा' : 'नवीन Question जोडा'}</h3><label><span className="form-label">Question *</span><textarea className="form-input" value={question.question_text} onChange={(event) => setQuestion({ ...question, question_text: event.target.value })} /></label><div className="question-options-editor">{question.options.map((option, optionIndex) => <label key={optionIndex} className={question.correct_option === optionIndex ? 'correct' : ''}><input type="radio" checked={question.correct_option === optionIndex} onChange={() => setQuestion({ ...question, correct_option: optionIndex })} /><span>{String.fromCharCode(65 + optionIndex)}</span><input className="form-input" value={option} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} onChange={(event) => setQuestion({ ...question, options: question.options.map((item, index) => index === optionIndex ? event.target.value : item) })} /></label>)}</div><div className="question-editor-footer"><label><span className="form-label">गुण</span><input type="number" className="form-input" value={question.marks} onChange={(event) => setQuestion({ ...question, marks: Number(event.target.value) })} /></label><label><span className="form-label">क्रमांक</span><input type="number" className="form-input" value={question.sort_order} onChange={(event) => setQuestion({ ...question, sort_order: Number(event.target.value) })} /></label><button className="btn btn-primary" onClick={saveQuestion} disabled={questionSaving || !question.question_text || question.options.some((option) => !option)}>{questionSaving ? <LoaderCircle className="spin" /> : <Save />} Question Save</button>{question.id && <button className="btn btn-secondary" onClick={() => setQuestion({ ...blankQuestion, sort_order: questions.length + 1 })}>Cancel</button>}</div></div>
            <div className="question-list"><h3>Question Paper</h3>{questions.length === 0 ? <p className="empty-inline">Publish करण्यापूर्वी questions जोडा.</p> : questionsListMemo}</div>
            <div className="exam-results"><h3>विद्यार्थी निकाल</h3>{results.length === 0 ? <p className="empty-inline">अजून कुणी परीक्षा दिलेली नाही.</p> : <div className="table-scroll"><table className="data-table"><thead><tr><th>विद्यार्थी</th><th>Attempt</th><th>Status</th><th>Score</th><th>%</th><th>Submitted</th></tr></thead><tbody>{resultsListMemo}</tbody></table></div>}</div>
          </>}
        </div>
      </section>
    </div>
  )
}
