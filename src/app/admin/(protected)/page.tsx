import Link from 'next/link'
import {
  ArrowRight, CalendarCheck, ClipboardList, FileText, IndianRupee, Inbox,
  Megaphone, MessageCircle, TrendingUp, UserPlus, Users, Utensils,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatCurrency } from '@/lib/utils'
import { DonutChart, TrendChart } from '@/components/admin/Charts'

export const dynamic = 'force-dynamic'

const COURSE_LABELS: Record<string, string> = {
  army: 'Army Bharti', police: 'Police Bharti', srpf: 'SRPF Bharti',
  written: 'Written Exam', mpsc: 'MPSC', navy: 'Navy',
  railway: 'Railway', staff_selection: 'Staff Selection', saral_seva: 'सरळ सेवा', other: 'इतर',
}
const COURSE_COLORS = ['#641b23', '#7c2029', '#a54a51', '#d7aaa4', '#c79b3b', '#a58d90']
const MONTHS_MR = ['जाने', 'फेब', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें']

async function getDashboard() {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)

  const [studentsRes, feeRes, noticesRes, messRes, sessionRes] = await Promise.all([
    supabase.from('students').select('id, name, course, gender, admission_status, created_at, roll_number'),
    supabase.from('student_fee_summary').select('total_paid, pending_amount'),
    supabase.from('notices').select('id, title, category, is_published, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('mess_expiry_reminders').select('id', { count: 'exact', head: true }),
    supabase.from('attendance_sessions').select('id').eq('session_date', today).order('created_at', { ascending: false }).limit(1),
  ])

  const students = studentsRes.data || []
  const active = students.filter(s => s.admission_status === 'active')
  const pending = students.filter(s => s.admission_status === 'pending')

  // Attendance only counts when a session actually exists for today.
  let attendance: { present: number; absent: number; leave: number; hasSession: boolean } =
    { present: 0, absent: 0, leave: 0, hasSession: false }
  const sessionId = sessionRes.data?.[0]?.id
  if (sessionId) {
    const { data: records } = await supabase.from('attendance_records').select('status').eq('session_id', sessionId)
    const rows = records || []
    attendance = {
      present: rows.filter(r => r.status === 'present').length,
      absent: rows.filter(r => r.status === 'absent').length,
      leave: rows.filter(r => r.status === 'leave').length,
      hasSession: true,
    }
  }

  // Registration trend: last 6 months of real created_at values.
  const now = new Date()
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    return {
      label: MONTHS_MR[d.getMonth()],
      value: students.filter(s => {
        if (!s.created_at) return false
        const t = new Date(s.created_at).getTime()
        return t >= d.getTime() && t < next.getTime()
      }).length,
    }
  })

  const courseCounts = new Map<string, number>()
  for (const s of active) {
    const key = s.course || 'other'
    courseCounts.set(key, (courseCounts.get(key) || 0) + 1)
  }
  const courses = [...courseCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], i) => ({ label: COURSE_LABELS[key] || key, value, color: COURSE_COLORS[i % COURSE_COLORS.length] }))

  const fee = feeRes.data || []
  return {
    totalActive: active.length,
    pendingCount: pending.length,
    collected: fee.reduce((sum, r) => sum + Number(r.total_paid || 0), 0),
    outstanding: fee.reduce((sum, r) => sum + Number(r.pending_amount || 0), 0),
    messExpiring: messRes.count || 0,
    publishedNotices: (noticesRes.data || []).filter(n => n.is_published).length,
    notices: noticesRes.data || [],
    recent: [...students].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5),
    trend,
    courses,
    attendance,
  }
}

const STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: 'प्रलंबित', cls: 'adm-badge--warn' },
  approved: { text: 'मंजूर', cls: 'adm-badge--info' },
  payment_recorded: { text: 'फी नोंद', cls: 'adm-badge--info' },
  active: { text: 'सक्रिय', cls: 'adm-badge--ok' },
}

const QUICK = [
  { href: '/admin/fees', label: 'नवीन प्रवेश', icon: UserPlus },
  { href: '/admin/students/new', label: 'विद्यार्थी जोडा', icon: Users },
  { href: '/admin/fees', label: 'फी नोंदवा', icon: IndianRupee },
  { href: '/admin/notices', label: 'नोटीस पाठवा', icon: Megaphone },
  { href: '/admin/whatsapp', label: 'WhatsApp संदेश', icon: MessageCircle },
  { href: '/admin/exams', label: 'परीक्षा पहा', icon: ClipboardList },
]

export default async function AdminDashboard() {
  const d = await getDashboard()
  const marked = d.attendance.present + d.attendance.absent + d.attendance.leave
  const pct = marked > 0 ? Math.round((d.attendance.present / marked) * 100) : 0

  const kpis = [
    { label: 'सक्रिय विद्यार्थी', value: String(d.totalActive), icon: Users, tint: '#7c2029', bg: '#fbf1ed', href: '/admin/students' },
    { label: 'प्रलंबित प्रवेश मंजुरी', value: String(d.pendingCount), icon: Inbox, tint: '#b54708', bg: '#fffaeb', href: '/admin/fees' },
    { label: 'आज उपस्थित', value: d.attendance.hasSession ? String(d.attendance.present) : '—', icon: CalendarCheck, tint: '#175cd3', bg: '#eff8ff', href: '/admin/attendance' },
    { label: 'फी जमा', value: formatCurrency(d.collected), icon: IndianRupee, tint: '#027a48', bg: '#ecfdf3', href: '/admin/fees' },
    { label: 'फी बाकी', value: formatCurrency(d.outstanding), icon: TrendingUp, tint: '#b42318', bg: '#fef3f2', href: '/admin/fees' },
    { label: 'मेस संपणार', value: String(d.messExpiring), icon: Utensils, tint: '#a15c07', bg: '#fffaeb', href: '/admin/mess' },
  ]

  return (
    <div className="admin-page">
      <div className="adm-stats">
        {kpis.map(k => {
          const Icon = k.icon
          return (
            <Link key={k.label} href={k.href} className="adm-stat">
              <span className="adm-stat__ico" style={{ background: k.bg, color: k.tint }}><Icon size={19} /></span>
              <div className="adm-stat__lbl">{k.label}</div>
              <div className="adm-stat__val">{k.value}</div>
            </Link>
          )
        })}
      </div>

      <div className="adm-row2">
        <section className="adm-panel">
          <div className="adm-panel__head">
            <h3>विद्यार्थी नोंदणी ट्रेंड</h3>
            <span style={{ fontSize: 11.5, color: '#94a3b8' }}>गेले ६ महिने</span>
          </div>
          <div className="adm-panel__body">
            {d.trend.some(t => t.value > 0)
              ? <TrendChart points={d.trend} />
              : <div className="adm-empty"><FileText size={30} /><b>अजून नोंदणी नाही</b><span>नवीन प्रवेश झाल्यावर इथे ट्रेंड दिसेल.</span></div>}
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel__head"><h3>कोर्सनुसार विद्यार्थी</h3></div>
          <div className="adm-panel__body">
            {d.courses.length
              ? <DonutChart slices={d.courses} total={d.totalActive} caption="कोर्सनुसार विद्यार्थी" />
              : <div className="adm-empty"><Users size={30} /><b>सक्रिय विद्यार्थी नाहीत</b><span>प्रवेश मंजूर झाल्यावर इथे दिसतील.</span></div>}
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel__head"><h3>त्वरित कृती</h3></div>
          <div className="adm-panel__body">
            <div className="adm-qa">
              {QUICK.map(q => {
                const Icon = q.icon
                return (
                  <Link key={q.label} href={q.href}>
                    <span><Icon size={17} /></span>
                    {q.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="adm-row3">
        <section className="adm-panel">
          <div className="adm-panel__head">
            <h3>अलीकडील प्रवेश अर्ज</h3>
            <Link href="/admin/fees" className="adm-panel__link">सर्व पहा <ArrowRight size={13} /></Link>
          </div>
          {d.recent.length ? (
            <div className="adm-list">
              {d.recent.map(s => {
                const st = STATUS[s.admission_status || 'pending'] || STATUS.pending
                return (
                  <div className="adm-list__row" key={s.id}>
                    <span className="adm-avatar">{(s.name || '?').trim().charAt(0)}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <b>{s.name}</b>
                      <small>{COURSE_LABELS[s.course || ''] || s.course || '—'} · {s.created_at ? new Date(s.created_at).toLocaleDateString('mr-IN') : '—'}</small>
                    </div>
                    <span className={`adm-badge ${st.cls}`}>{st.text}</span>
                  </div>
                )
              })}
            </div>
          ) : <div className="adm-empty"><Inbox size={30} /><b>अजून अर्ज नाहीत</b><span>नवीन अर्ज आल्यावर इथे दिसतील.</span></div>}
        </section>

        <section className="adm-panel">
          <div className="adm-panel__head"><h3>आजची उपस्थिती</h3></div>
          <div className="adm-panel__body">
            {d.attendance.hasSession ? (
              <>
                <div style={{ display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                  <div style={{ position: 'relative', width: 132, height: 132 }}>
                    <svg width="132" height="132" role="img" aria-label={`उपस्थिती ${pct} टक्के`}>
                      <g transform="rotate(-90 66 66)">
                        <circle cx="66" cy="66" r="56" fill="none" stroke="#eef0eb" strokeWidth="16" />
                        <circle cx="66" cy="66" r="56" fill="none" stroke="#7c2029" strokeWidth="16" strokeLinecap="round"
                          strokeDasharray={`${(pct / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`} />
                      </g>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
                      <div style={{ fontSize: 25, fontWeight: 800 }}>{pct}%</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.attendance.present} / {marked}</div>
                    </div>
                  </div>
                </div>
                <div className="adm-legend">
                  <div><i style={{ background: '#7c2029' }} />उपस्थित<b>{d.attendance.present}</b></div>
                  <div><i style={{ background: '#dc2626' }} />अनुपस्थित<b>{d.attendance.absent}</b></div>
                  <div><i style={{ background: '#d97706' }} />रजा<b>{d.attendance.leave}</b></div>
                </div>
                <Link href="/admin/attendance" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                  सविस्तर रिपोर्ट <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <div className="adm-empty">
                <CalendarCheck size={30} />
                <b>आजचे session अजून तयार नाही</b>
                <span>उपस्थिती नोंदवण्यासाठी session सुरू करा.</span>
                <Link href="/admin/attendance" className="btn btn-primary" style={{ marginTop: 14 }}>Session तयार करा</Link>
              </div>
            )}
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel__head">
            <h3>अलीकडील नोटीस</h3>
            <Link href="/admin/notices" className="adm-panel__link">सर्व पहा <ArrowRight size={13} /></Link>
          </div>
          {d.notices.length ? (
            <div className="adm-list">
              {d.notices.map(n => (
                <div className="adm-list__row" key={n.id}>
                  <span className="adm-avatar" style={{ background: '#fffaeb', color: '#b54708', borderColor: '#fedf89' }}><Megaphone size={15} /></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <b style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</b>
                    <small>{n.created_at ? new Date(n.created_at).toLocaleDateString('mr-IN') : '—'}</small>
                  </div>
                  <span className={`adm-badge ${n.is_published ? 'adm-badge--ok' : 'adm-badge--muted'}`}>
                    {n.is_published ? 'प्रकाशित' : 'ड्राफ्ट'}
                  </span>
                </div>
              ))}
            </div>
          ) : <div className="adm-empty"><Megaphone size={30} /><b>अजून नोटीस नाही</b><span>नवीन सूचना इथे दिसतील.</span></div>}
        </section>
      </div>
    </div>
  )
}
