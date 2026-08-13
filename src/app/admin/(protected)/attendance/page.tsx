'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, CheckCircle2, CircleSlash, PlusCircle, UserCheck, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminMutation } from '@/lib/admin-api'

type Student = { id: string; name: string; roll_number: string }
type Session = { id: string; title: string; session_date: string; mode: 'face' | 'manual' | 'online'; is_open: boolean }

export default function AttendancePage() {
  const video = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [camera, setCamera] = useState(false)
  const [message, setMessage] = useState('Camera सुरू करण्यासाठी button दाबा.')
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [counts, setCounts] = useState({ present: 0, absent: 0, leave: 0 })

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('students').select('id,name,roll_number').eq('is_active', true).order('name'),
      supabase.from('attendance_sessions').select('*').order('session_date', { ascending: false }),
    ]).then(([studentResult, sessionResult]) => {
      if (active) { setStudents(studentResult.data || []); setSessions(sessionResult.data || []) }
    })
    return () => { active = false; streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  /** Counts for the chosen session, so the operator sees progress while marking. */
  const loadCounts = useCallback(async (sessionId: string) => {
    if (!sessionId) { setCounts({ present: 0, absent: 0, leave: 0 }); return }
    const { data } = await supabase.from('attendance_records').select('status').eq('session_id', sessionId)
    const rows = data || []
    setCounts({
      present: rows.filter(r => r.status === 'present').length,
      absent: rows.filter(r => r.status === 'absent').length,
      leave: rows.filter(r => r.status === 'leave').length,
    })
  }, [])

  // Loaded on selection rather than in an effect, so no render cascades off it.
  const chooseSession = (sessionId: string) => { setSelectedSession(sessionId); loadCounts(sessionId) }

  async function createSession() {
    const { data } = await adminMutation<{ data: Session }>('attendance.session.create', { title: `दैनिक उपस्थिती ${today}`, session_date: today, mode: 'face', is_open: true })
    setSessions(v => [data, ...v]); chooseSession(data.id)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream; setCamera(true)
      setTimeout(() => { if (video.current) video.current.srcObject = stream }, 0)
      setMessage('चेहरा frameमध्ये स्पष्ट दिसू द्या.')
    } catch { setMessage('Camera permission मिळाली नाही. Manual attendance वापरा.') }
  }

  async function mark(method: 'face' | 'manual') {
    if (!selectedStudent || !selectedSession) { setMessage('आधी session आणि विद्यार्थी निवडा.'); return }
    let confidence: number | null = null
    if (method === 'face') {
      if (!camera) { setMessage('आधी camera सुरू करा.'); return }
      const Detector = (window as unknown as { FaceDetector?: new () => { detect: (source: HTMLVideoElement) => Promise<unknown[]> } }).FaceDetector
      if (Detector && video.current) {
        const faces = await new Detector().detect(video.current)
        if (!faces.length) { setMessage('चेहरा सापडला नाही. पुन्हा cameraकडे पहा.'); return }
        confidence = 1
      } else {
        setMessage('या browserमध्ये automatic face detection उपलब्ध नाही; उपस्थिती camera verificationसह नोंदवली.')
      }
    }
    await adminMutation('attendance.mark', { session_id: selectedSession, student_id: selectedStudent, status: 'present', method, confidence })
    setMessage('उपस्थिती यशस्वीरीत्या नोंदली.'); setSelectedStudent('')
    loadCounts(selectedSession)
  }

  const todaySession = sessions.find(s => s.session_date === today)
  const marked = counts.present + counts.absent + counts.leave

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="page-title">Live Attendance</div>
          <div className="page-subtitle">Camera verification किंवा manual पद्धतीने आजची उपस्थिती नोंदवा.</div>
        </div>
        <button className="btn btn-primary" onClick={createSession}><PlusCircle size={16} /> आजचे Session तयार करा</button>
      </div>

      <div className="adm-stats" style={{ marginBottom: 18 }}>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#eff8ff', color: '#175cd3' }}><Users size={19} /></span>
          <div className="adm-stat__lbl">सक्रिय विद्यार्थी</div><div className="adm-stat__val">{students.length}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#ecfdf3', color: '#027a48' }}><CheckCircle2 size={19} /></span>
          <div className="adm-stat__lbl">उपस्थित</div><div className="adm-stat__val">{counts.present}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#fef3f2', color: '#b42318' }}><CircleSlash size={19} /></span>
          <div className="adm-stat__lbl">अनुपस्थित</div><div className="adm-stat__val">{counts.absent}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#fffaeb', color: '#b54708' }}><UserCheck size={19} /></span>
          <div className="adm-stat__lbl">रजा</div><div className="adm-stat__val">{counts.leave}</div>
        </div>
      </div>

      <div className={`adm-alert ${todaySession ? 'adm-alert--ok' : 'adm-alert--err'}`}>
        {todaySession
          ? `आजचे session तयार आहे — ${todaySession.title}. आतापर्यंत ${marked} नोंदी झाल्या.`
          : `आजचे (${new Date(today).toLocaleDateString('mr-IN')}) session अजून तयार नाही. उपस्थिती नोंदवण्यापूर्वी वरील button दाबा.`}
      </div>

      <div className="attendance-layout">
        <section className="admin-card camera-card">
          <div className="camera-frame">
            {camera ? <video ref={video} autoPlay muted playsInline /> : <CameraOff />}
          </div>
          <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={startCamera}>
            <Camera size={16} /> Camera सुरू करा
          </button>
          <p className="status-message">{message}</p>
        </section>

        <section className="admin-card">
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span className="form-label">Attendance Session</span>
            <select className="form-input" value={selectedSession} onChange={e => chooseSession(e.target.value)}>
              <option value="">निवडा</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </label>
          <label style={{ display: 'block' }}>
            <span className="form-label">विद्यार्थी</span>
            <select className="form-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">निवडा</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.roll_number} — {s.name}</option>)}
            </select>
          </label>
          <div className="attendance-actions">
            <button className="btn btn-primary" onClick={() => mark('face')}><UserCheck size={16} /> Face Verified Present</button>
            <button className="btn btn-secondary" onClick={() => mark('manual')}><CheckCircle2 size={16} /> Manual Present</button>
          </div>
          <p className="status-message" style={{ marginTop: 14 }}>
            Face detection हे browser मधील सुविधेवर अवलंबून आहे. उपलब्ध नसल्यास camera समोर पडताळणी करून Manual Present वापरा.
          </p>
        </section>
      </div>
    </div>
  )
}
