'use client'
import { useEffect, useState } from 'react'
import { CalendarClock, Check, CircleSlash, IndianRupee, MessageCircle, Plus, Utensils } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { MessSubscription } from '@/types'
import { adminMutation } from '@/lib/admin-api'

export default function MessPage() {
  const [expiring, setExpiring] = useState<MessSubscription[]>([])
  const [all, setAll] = useState<MessSubscription[]>([])
  const [students, setStudents] = useState<{ id: string; name: string; roll_number: string; phone: string; parent_phone: string }[]>([])
  const [tab, setTab] = useState<'expiring' | 'all' | 'new'>('expiring')
  const [newForm, setNewForm] = useState({ student_id: '', start_date: '', end_date: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    supabase.from('mess_expiry_reminders').select('*').then(({ data }) => setExpiring(data || []))
    supabase.from('mess_subscriptions').select('*, students(name, phone, parent_phone)').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      type MessRow = MessSubscription & { students?: { name?: string; phone?: string; parent_phone?: string } | null }
      setAll((data || []).map((d: MessRow) => ({ ...d, student_name: d.students?.name, student_phone: d.students?.phone, parent_phone: d.students?.parent_phone })))
    })
    supabase.from('students').select('id, name, roll_number, phone, parent_phone').order('roll_number', { ascending: true }).then(({ data }) => setStudents(data || []))
  }, [])

  const addMess = async () => {
    setLoading(true)
    try {
      await adminMutation('mess.create', { student_id: newForm.student_id, start_date: newForm.start_date, end_date: newForm.end_date, amount: Number(newForm.amount) })
      setSuccessMsg('मेस नोंदणी झाली.')
      setNewForm({ student_id: '', start_date: '', end_date: '', amount: '' })
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) { alert(error instanceof Error ? error.message : 'Mess registration failed') }
    setLoading(false)
  }

  const sendReminder = (m: MessSubscription) => {
    const msg = `नमस्कार, ${m.student_name} यांचा मेसचा महिना ${formatDate(m.end_date)} रोजी संपत आहे. कृपया उद्या नूतनीकरण करा. — शिवरक्षक करियर अकॅडमी 🙏`
    window.open(`https://wa.me/91${m.parent_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendAllReminders = () => {
    expiring.forEach(m => sendReminder(m))
  }

  const activeCount = all.filter(m => m.is_active).length
  const expiredCount = all.filter(m => !m.is_active).length
  const monthlyAmount = all.filter(m => m.is_active).reduce((sum, m) => sum + Number(m.amount || 0), 0)

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="page-title">मेस व्यवस्थापन</div>
          <div className="page-subtitle">मेस नोंदणी, नूतनीकरण आणि संपणाऱ्या सदस्यत्वांचे reminder.</div>
        </div>
        {expiring.length > 0 && (
          <button className="btn btn-whatsapp" onClick={sendAllReminders}>
            <MessageCircle size={16} /> सर्वांना Reminder ({expiring.length})
          </button>
        )}
      </div>

      {successMsg && <div className="adm-alert adm-alert--ok">{successMsg}</div>}

      <div className="adm-stats" style={{ marginBottom: 18 }}>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#ecfdf3', color: '#027a48' }}><Utensils size={19} /></span>
          <div className="adm-stat__lbl">सक्रिय मेस</div><div className="adm-stat__val">{activeCount}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#fffaeb', color: '#b54708' }}><CalendarClock size={19} /></span>
          <div className="adm-stat__lbl">लवकरच संपणार</div><div className="adm-stat__val">{expiring.length}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#eff8ff', color: '#175cd3' }}><IndianRupee size={19} /></span>
          <div className="adm-stat__lbl">सक्रिय मेसची रक्कम</div><div className="adm-stat__val">{formatCurrency(monthlyAmount)}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#f4f5f2', color: '#475569' }}><CircleSlash size={19} /></span>
          <div className="adm-stat__lbl">संपलेले</div><div className="adm-stat__val">{expiredCount}</div>
        </div>
      </div>

      <div className="adm-tabs" role="tablist">
        {([
          { key: 'expiring', label: `संपणार (${expiring.length})` },
          { key: 'all', label: 'सर्व नोंदी' },
          { key: 'new', label: 'नवीन मेस' },
        ] as const).map(t => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="adm-tab" data-active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'expiring' && (
        <section className="adm-panel">
          {expiring.length === 0 ? (
            <div className="adm-empty">
              <Check size={32} /><b>सध्या कोणाचाही मेस संपत नाही</b>
              <span>पुढील २ दिवसांत संपणारे सदस्यत्व नाही.</span>
            </div>
          ) : (
            <div className="adm-tablewrap">
              <table className="data-table">
                <thead><tr><th>विद्यार्थी</th><th>समाप्ती तारीख</th><th>रक्कम</th><th /></tr></thead>
                <tbody>
                  {expiring.map(m => (
                    <tr key={m.id}>
                      <td><b>{m.student_name}</b><div style={{ fontSize: 11.5, color: '#94a3b8' }}>{m.parent_phone}</div></td>
                      <td><span className="adm-badge adm-badge--danger">{formatDate(m.end_date)}</span></td>
                      <td>{formatCurrency(m.amount)}</td>
                      <td>
                        <button className="btn btn-whatsapp" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => sendReminder(m)}>
                          <MessageCircle size={14} /> Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'all' && (
        <section className="adm-panel">
          {all.length === 0 ? (
            <div className="adm-empty"><Utensils size={32} /><b>अजून मेस नोंदणी नाही</b><span>&ldquo;नवीन मेस&rdquo; मधून पहिली नोंद करा.</span></div>
          ) : (
            <div className="adm-tablewrap">
              <table className="data-table">
                <thead><tr><th>विद्यार्थी</th><th>सुरू</th><th>समाप्ती</th><th>रक्कम</th><th>स्थिती</th></tr></thead>
                <tbody>
                  {all.map(m => (
                    <tr key={m.id}>
                      <td><b>{m.student_name}</b></td>
                      <td style={{ fontSize: 12.5 }}>{formatDate(m.start_date)}</td>
                      <td style={{ fontSize: 12.5 }}>{formatDate(m.end_date)}</td>
                      <td>{formatCurrency(m.amount)}</td>
                      <td><span className={`adm-badge ${m.is_active ? 'adm-badge--ok' : 'adm-badge--muted'}`}>{m.is_active ? 'सक्रिय' : 'संपले'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'new' && (
        <section className="adm-panel" style={{ maxWidth: 560 }}>
          <div className="adm-panel__head"><h3>नवीन मेस नोंदणी</h3></div>
          <div className="adm-panel__body" style={{ display: 'grid', gap: 14 }}>
            <label>
              <span className="form-label">विद्यार्थी *</span>
              <select className="form-input" value={newForm.student_id} onChange={e => setNewForm(f => ({ ...f, student_id: e.target.value }))}>
                <option value="">विद्यार्थी निवडा</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.roll_number} — {s.name}</option>)}
              </select>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label>
                <span className="form-label">सुरू तारीख *</span>
                <input type="date" className="form-input" value={newForm.start_date} onChange={e => setNewForm(f => ({ ...f, start_date: e.target.value }))} />
              </label>
              <label>
                <span className="form-label">समाप्ती तारीख *</span>
                <input type="date" className="form-input" value={newForm.end_date} onChange={e => setNewForm(f => ({ ...f, end_date: e.target.value }))} />
              </label>
            </div>
            <label>
              <span className="form-label">मेस रक्कम (₹)</span>
              <input type="number" className="form-input" value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))} placeholder="महिन्याची रक्कम" />
            </label>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={addMess} disabled={loading || !newForm.student_id}>
              {loading ? 'नोंद होत आहे…' : <><Plus size={16} /> मेस नोंदणी करा</>}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
