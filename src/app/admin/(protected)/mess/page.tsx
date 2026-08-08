'use client'
import { useEffect, useState } from 'react'
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
      setAll((data || []).map((d: any) => ({ ...d, student_name: d.students?.name, student_phone: d.students?.phone, parent_phone: d.students?.parent_phone })))
    })
    supabase.from('students').select('id, name, roll_number, phone, parent_phone').order('roll_number', { ascending: true }).then(({ data }) => setStudents(data || []))
  }, [])

  const addMess = async () => {
    setLoading(true)
    try {
      await adminMutation('mess.create', { student_id: newForm.student_id, start_date: newForm.start_date, end_date: newForm.end_date, amount: Number(newForm.amount) })
      setSuccessMsg('✅ मेस नोंदणी झाली!')
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

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">🍽️ मेस व्यवस्थापन</div>
          <div className="page-subtitle">जेवण मेस — नोंदणी, reminder, नूतनीकरण</div>
        </div>
        {expiring.length > 0 && (
          <button className="btn btn-whatsapp" onClick={sendAllReminders}>
            📱 सर्वांना Reminder पाठवा ({expiring.length})
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #16a34a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#166534', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24 }}>
        {[
          { key: 'expiring', label: `⚠️ संपणार (${expiring.length})` },
          { key: 'all', label: '📋 सर्व मेस' },
          { key: 'new', label: '+ नवीन मेस' },
        ].map(t => (
          <button
            key={t.key}
            className="btn"
            onClick={() => setTab(t.key as any)}
            style={{ background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#0f172a' : '#64748b', boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', padding: '8px 16px', border: 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Expiring tab */}
      {tab === 'expiring' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {expiring.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p>पुढील 2 दिवसात कोणाचाही मेस संपत नाही</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>विद्यार्थी</th><th>समाप्ती तारीख</th><th>रक्कम</th><th>Action</th></tr>
              </thead>
              <tbody>
                {expiring.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.student_name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.parent_phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-red">{formatDate(m.end_date)}</span>
                    </td>
                    <td>{formatCurrency(m.amount)}</td>
                    <td>
                      <button className="btn btn-whatsapp" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => sendReminder(m)}>
                        📱 Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* All tab */}
      {tab === 'all' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>विद्यार्थी</th><th>सुरू</th><th>समाप्ती</th><th>रक्कम</th><th>स्थिती</th></tr>
            </thead>
            <tbody>
              {all.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.student_name}</td>
                  <td style={{ fontSize: 13 }}>{formatDate(m.start_date)}</td>
                  <td style={{ fontSize: 13 }}>{formatDate(m.end_date)}</td>
                  <td>{formatCurrency(m.amount)}</td>
                  <td><span className={`badge ${m.is_active ? 'badge-green' : 'badge-gray'}`}>{m.is_active ? 'Active' : 'Expired'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Mess Form */}
      {tab === 'new' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, maxWidth: 500 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>नवीन मेस नोंदणी</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">विद्यार्थी *</label>
              <select className="form-input" value={newForm.student_id} onChange={e => setNewForm(f => ({ ...f, student_id: e.target.value }))}>
                <option value="">विद्यार्थी निवडा</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.roll_number} — {s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="form-label">सुरू तारीख *</label>
                <input type="date" className="form-input" value={newForm.start_date} onChange={e => setNewForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">समाप्ती तारीख *</label>
                <input type="date" className="form-input" value={newForm.end_date} onChange={e => setNewForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="form-label">मेस रक्कम (₹)</label>
              <input type="number" className="form-input" value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))} placeholder="महिन्याची रक्कम" />
            </div>
            <button className="btn btn-primary" style={{ justifyContent: 'center', padding: 12 }} onClick={addMess} disabled={loading}>
              {loading ? '⏳...' : '✅ मेस नोंदणी करा'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
