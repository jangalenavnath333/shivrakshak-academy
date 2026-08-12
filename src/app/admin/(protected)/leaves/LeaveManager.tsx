'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays, CheckCircle2, Clock3, Home, LoaderCircle, Mail, MessageCircle,
  Pencil, PlusCircle, RotateCcw, Search, UserCheck, XCircle,
} from 'lucide-react'
import styles from './LeaveManager.module.css'

type AdmissionDetails = { email?: string; studentWhatsapp?: string; parentWhatsapp?: string }
type Student = {
  id: string
  name: string
  roll_number: string
  phone: string
  parent_phone: string
  admission_details?: AdmissionDetails | null
}
type DeliveryStatus = 'pending' | 'sent' | 'skipped' | 'failed'
type Leave = {
  id: string
  student_id: string
  departure_date: string
  return_date: string
  reason: string
  status: 'scheduled' | 'on_leave' | 'returned' | 'cancelled'
  notification_email: string | null
  notification_phone: string | null
  notify_email: boolean
  notify_whatsapp: boolean
  confirmation_email_sent_at: string | null
  confirmation_whatsapp_sent_at: string | null
  reminder_email_status: DeliveryStatus
  reminder_whatsapp_status: DeliveryStatus
  reminder_email_sent_at: string | null
  reminder_whatsapp_sent_at: string | null
  last_notification_error: string | null
  students: Student | Student[]
}
type FormState = {
  student_id: string
  departure_date: string
  return_date: string
  reason: string
  notification_email: string
  notification_phone: string
  notify_email: boolean
  notify_whatsapp: boolean
}

const today = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())

const blankForm = (): FormState => ({
  student_id: '', departure_date: today(), return_date: today(), reason: '',
  notification_email: '', notification_phone: '', notify_email: false, notify_whatsapp: false,
})

const linkedStudent = (leave: Leave) => Array.isArray(leave.students) ? leave.students[0] : leave.students
const showDate = (value: string) => new Date(`${value}T00:00:00+05:30`).toLocaleDateString('mr-IN', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
})

async function fetchLeaveData() {
  const response = await fetch('/api/admin/leaves', { cache: 'no-store' })
  const payload = await response.json() as { data?: { leaves: Leave[]; students: Student[] }; error?: string }
  if (!response.ok) throw new Error(payload.error || 'Leave data load झाले नाही.')
  return { leaves: payload.data?.leaves || [], students: payload.data?.students || [] }
}

const statusLabel: Record<Leave['status'], string> = {
  scheduled: 'नियोजित', on_leave: 'सुट्टीवर', returned: 'परत आले', cancelled: 'रद्द',
}

function DeliveryBadge({ channel, status }: { channel: 'email' | 'whatsapp'; status: DeliveryStatus }) {
  const Icon = channel === 'email' ? Mail : MessageCircle
  return <span className={`${styles.delivery} ${styles[status]}`}><Icon /> {channel === 'email' ? 'Email' : 'WhatsApp'}: {status}</span>
}

export default function LeaveManager() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState<FormState>(blankForm)
  const [editing, setEditing] = useState<Leave | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [listSearch, setListSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const currentDate = today()

  const loadData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await fetchLeaveData()
      setLeaves(data.leaves)
      setStudents(data.students)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Leave data load झाले नाही.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    fetchLeaveData()
      .then((data) => {
        if (!active) return
        setLeaves(data.leaves)
        setStudents(data.students)
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Leave data load झाले नाही.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase()
    return students.filter((student) => !query || student.name.toLowerCase().includes(query) || student.roll_number.toLowerCase().includes(query))
  }, [studentSearch, students])

  const filteredLeaves = useMemo(() => leaves.filter((leave) => {
    const student = linkedStudent(leave)
    const query = listSearch.trim().toLowerCase()
    const matchesQuery = !query || student?.name.toLowerCase().includes(query) || student?.roll_number.toLowerCase().includes(query)
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && ['scheduled', 'on_leave'].includes(leave.status))
      || leave.status === statusFilter
    return matchesQuery && matchesStatus
  }), [leaves, listSearch, statusFilter])

  const stats = useMemo(() => ({
    active: leaves.filter((leave) => ['scheduled', 'on_leave'].includes(leave.status)).length,
    today: leaves.filter((leave) => leave.return_date === currentDate && ['scheduled', 'on_leave'].includes(leave.status)).length,
    overdue: leaves.filter((leave) => leave.return_date < currentDate && leave.status === 'on_leave').length,
    returned: leaves.filter((leave) => leave.status === 'returned').length,
  }), [currentDate, leaves])

  function chooseStudent(studentId: string) {
    const student = students.find((item) => item.id === studentId)
    const email = student?.admission_details?.email || ''
    const phone = student?.admission_details?.parentWhatsapp || student?.parent_phone
      || student?.admission_details?.studentWhatsapp || student?.phone || ''
    setForm((current) => ({
      ...current, student_id: studentId, notification_email: email,
      notification_phone: phone, notify_email: Boolean(email), notify_whatsapp: Boolean(phone),
    }))
  }

  function resetForm() {
    setEditing(null); setForm(blankForm()); setStudentSearch('')
  }

  function editLeave(leave: Leave) {
    setEditing(leave)
    setForm({
      student_id: leave.student_id, departure_date: leave.departure_date, return_date: leave.return_date,
      reason: leave.reason, notification_email: leave.notification_email || '', notification_phone: leave.notification_phone || '',
      notify_email: leave.notify_email, notify_whatsapp: leave.notify_whatsapp,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveLeave() {
    setSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/admin/leaves', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, status: editing.status, leave: form } : form),
      })
      const payload = await response.json() as { error?: string; delivery?: { email: string; whatsapp: string } }
      if (!response.ok) throw new Error(payload.error || 'Leave save झाले नाही.')
      if (editing) {
        setMessage('सुट्टीची माहिती update झाली. नवीन return dateसाठी reminder पुन्हा schedule झाला.')
      } else {
        const delivered = [payload.delivery?.email, payload.delivery?.whatsapp].filter((value) => value === 'sent').length
        setMessage(delivered > 0
          ? `सुट्टी नोंद झाली आणि ${delivered} confirmation notification पाठवले.`
          : 'सुट्टी नोंद झाली. Email/WhatsApp provider configure झाल्यावर automatic reminder जाईल.')
      }
      resetForm()
      await loadData()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Leave save झाले नाही.')
    } finally { setSaving(false) }
  }

  async function updateStatus(leave: Leave, status: Leave['status']) {
    setError(''); setMessage('')
    try {
      const response = await fetch('/api/admin/leaves', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: leave.id, status }),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'Status update झाला नाही.')
      setMessage(status === 'returned' ? 'विद्यार्थी परत आल्याची नोंद झाली.' : 'सुट्टी रद्द केली.')
      await loadData()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Status update झाला नाही.') }
  }

  const canSave = form.student_id && form.reason.trim().length >= 2
    && form.return_date >= form.departure_date
    && (!form.notify_email || Boolean(form.notification_email))
    && (!form.notify_whatsapp || form.notification_phone.replace(/\D/g, '').length >= 10)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><h1><Home /> Student Leave</h1><p>घरी जाण्याची व परत येण्याची तारीख नोंदवा आणि automatic reminder track करा.</p></div>
        <div className={styles.cronNote}><Clock3 /><span><b>Daily ~9:00 AM IST</b><small>Return-date reminder check</small></span></div>
      </header>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {message && <div className={styles.success} role="status"><CheckCircle2 /> {message}</div>}

      <section className={styles.stats}>
        <div><Home /><span><b>{stats.active}</b><small>Active Leaves</small></span></div>
        <div><CalendarDays /><span><b>{stats.today}</b><small>आज परत येणार</small></span></div>
        <div className={stats.overdue ? styles.dangerStat : ''}><Clock3 /><span><b>{stats.overdue}</b><small>Overdue</small></span></div>
        <div><UserCheck /><span><b>{stats.returned}</b><small>परत आले</small></span></div>
      </section>

      <section className={styles.formCard}>
        <div className={styles.sectionHeading}><div><h2>{editing ? 'Leave Edit / Reschedule' : 'नवीन सुट्टी नोंदवा'}</h2><p>Save केल्यावर confirmation आणि return dateला automatic reminder जाईल.</p></div>{editing && <button className="btn btn-secondary" onClick={resetForm}><RotateCcw /> नवीन Form</button>}</div>
        <div className={styles.formGrid}>
          <label className={styles.studentPicker}><span>विद्यार्थी शोधा *</span><div className={styles.searchBox}><Search /><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="नाव किंवा S-01 ID..." /></div><select className="form-input" value={form.student_id} onChange={(event) => chooseStudent(event.target.value)} disabled={Boolean(editing)}><option value="">विद्यार्थी निवडा</option>{visibleStudents.map((student) => <option key={student.id} value={student.id}>{student.roll_number} — {student.name}</option>)}</select></label>
          <label><span>घरी जाण्याची तारीख *</span><input type="date" className="form-input" value={form.departure_date} onChange={(event) => setForm({ ...form, departure_date: event.target.value, return_date: event.target.value > form.return_date ? event.target.value : form.return_date })} /></label>
          <label><span>परत येण्याची शेवटची तारीख *</span><input type="date" className="form-input" min={form.departure_date} value={form.return_date} onChange={(event) => setForm({ ...form, return_date: event.target.value })} /></label>
          <label className={styles.reason}><span>सुट्टीचे कारण *</span><textarea className="form-input" rows={3} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="उदा. कौटुंबिक कार्यक्रम / तब्येत..." /></label>
          <label><span>Email</span><div className={styles.channelInput}><input type="checkbox" checked={form.notify_email} onChange={(event) => setForm({ ...form, notify_email: event.target.checked })} /><Mail /><input type="email" className="form-input" value={form.notification_email} onChange={(event) => setForm({ ...form, notification_email: event.target.value })} placeholder="student@email.com" /></div></label>
          <label><span>WhatsApp नंबर</span><div className={styles.channelInput}><input type="checkbox" checked={form.notify_whatsapp} onChange={(event) => setForm({ ...form, notify_whatsapp: event.target.checked })} /><MessageCircle /><input className="form-input" value={form.notification_phone} onChange={(event) => setForm({ ...form, notification_phone: event.target.value })} placeholder="10 digit number" /></div></label>
        </div>
        <div className={styles.formFooter}><p><MessageCircle /> WhatsApp template approval आणि provider keys configure असणे आवश्यक आहे.</p><button className="btn btn-primary" onClick={saveLeave} disabled={saving || !canSave}>{saving ? <LoaderCircle className="spin" /> : editing ? <Pencil /> : <PlusCircle />} {editing ? 'बदल Save करा' : 'Leave Save & Notify'}</button></div>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listTools}><div><h2>Leave Register</h2><p>{filteredLeaves.length} records</p></div><div className={styles.filters}><div className={styles.searchBox}><Search /><input aria-label="Leave listमध्ये विद्यार्थी शोधा" value={listSearch} onChange={(event) => setListSearch(event.target.value)} placeholder="Student शोधा..." /></div><select aria-label="Leave status filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="active">Active</option><option value="all">सर्व</option><option value="scheduled">नियोजित</option><option value="on_leave">सुट्टीवर</option><option value="returned">परत आले</option><option value="cancelled">रद्द</option></select></div></div>
        {loading ? <div className={styles.empty}><LoaderCircle className="spin" /> Loading...</div> : filteredLeaves.length === 0 ? <div className={styles.empty}><Home /><b>Leave record नाही</b><span>वरील formमधून पहिली सुट्टी नोंदवा.</span></div> : <div className={styles.leaveGrid}>{filteredLeaves.map((leave) => { const student = linkedStudent(leave); const overdue = leave.return_date < currentDate && leave.status === 'on_leave'; return <article key={leave.id} className={overdue ? styles.overdueCard : ''}>
          <div className={styles.cardTop}><div><span className={styles.roll}>{student?.roll_number}</span><h3>{student?.name || 'Unknown student'}</h3></div><span className={`${styles.status} ${styles[leave.status]}`}>{overdue ? 'OVERDUE' : statusLabel[leave.status]}</span></div>
          <div className={styles.dates}><span><small>घरी जाणार</small><b>{showDate(leave.departure_date)}</b></span><i aria-hidden="true">→</i><span><small>परत येणार</small><b>{showDate(leave.return_date)}</b></span></div>
          <p className={styles.leaveReason}>{leave.reason}</p>
          <div className={styles.deliveryRow}><DeliveryBadge channel="whatsapp" status={leave.reminder_whatsapp_status} /><DeliveryBadge channel="email" status={leave.reminder_email_status} /></div>
          {leave.last_notification_error && <p className={styles.notificationError}>{leave.last_notification_error}</p>}
          <div className={styles.actions}><button onClick={() => editLeave(leave)} disabled={['returned', 'cancelled'].includes(leave.status)}><Pencil /> Edit</button>{['scheduled', 'on_leave'].includes(leave.status) && <><button className={styles.returnedButton} onClick={() => updateStatus(leave, 'returned')}><UserCheck /> परत आले</button><button className={styles.cancelButton} onClick={() => updateStatus(leave, 'cancelled')}><XCircle /> रद्द</button></>}</div>
        </article> })}</div>}
      </section>
    </div>
  )
}
