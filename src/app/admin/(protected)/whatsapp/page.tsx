'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Student = { id: string; name: string; roll_number: string; parent_phone: string; phone: string }

type SendResult = {
  studentId: string
  name: string
  rollNumber: string | null
  status: 'sent' | 'invalid_number' | 'duplicate' | 'failed'
  reason?: string
}

type SendReport = {
  summary: { totalSelected: number; sent: number; failed: number; invalidNumber: number; duplicate: number }
  results: SendResult[]
}

const STATUS_LABEL: Record<SendResult['status'], { text: string; color: string }> = {
  sent: { text: '✅ पाठवले', color: '#15803d' },
  failed: { text: '❌ अयशस्वी', color: '#b91c1c' },
  invalid_number: { text: '⚠️ नंबर नाही', color: '#a16207' },
  duplicate: { text: '↩︎ तोच नंबर', color: '#64748b' },
}

// Academy WhatsApp number — admin sends FROM this number
const ACADEMY_WA = '917720991375'

const TEMPLATES = [
  { label: 'फी Reminder', text: 'नमस्कार, तुमच्या पाल्याची फी बाकी आहे. कृपया लवकरात लवकर भरा.\n— शिवरक्षक करियर अकॅडमी\n📞 7720991375 | 9284842177 🙏' },
  { label: 'मेस Renewal', text: 'नमस्कार, तुमच्या पाल्याचा मेसचा महिना उद्या संपत आहे. कृपया नूतनीकरण करा.\n— शिवरक्षक करियर अकॅडमी\n📞 7720991375 🙏' },
  { label: 'परीक्षा सूचना', text: 'नमस्कार, उद्या परीक्षा आहे. विद्यार्थ्याने वेळेवर यावे.\n— शिवरक्षक करियर अकॅडमी\n📞 7720991375 🙏' },
  { label: 'सुटी सूचना', text: 'नमस्कार, उद्या अकॅडमीला सुटी आहे.\n— शिवरक्षक करियर अकॅडमी 📞 7720991375' },
  { label: 'प्रवेश माहिती', text: 'नमस्कार, शिवरक्षक करियर अकॅडमी मध्ये पोलीस, आर्मी, नेव्ही, MPSC प्रशिक्षण सुरू आहे. अधिक माहितीसाठी संपर्क करा.\n📞 7720991375 | 9284842177\n🌐 localhost:3000' },
]

export default function WhatsAppPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'parent' | 'student'>('parent')
  const [search, setSearch] = useState('')
  const [officialNotice, setOfficialNotice] = useState('')
  const [tab, setTab] = useState<'individual' | 'bulk' | 'notice'>('individual')
  const [sending, setSending] = useState(false)
  const [report, setReport] = useState<SendReport | null>(null)
  const sendingRef = useRef(false)

  useEffect(() => {
    supabase.from('students').select('id, name, roll_number, parent_phone, phone').order('roll_number', { ascending: true }).then(({ data }) => setStudents(data || []))
  }, [])

  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_number?.toLowerCase().includes(search.toLowerCase()))

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(filtered.map(s => s.id)))
  const clearAll = () => setSelected(new Set())

  // Primary path: Twilio sends server-side, no WhatsApp Web / app involved.
  const sendViaApi = async () => {
    // Ref guard, not state: a double-click fires again before React re-renders.
    if (sendingRef.current) return
    if (!message.trim()) { alert('Message लिहा'); return }
    const studentIds = [...selected]
    if (studentIds.length === 0) return
    if (!confirm(`${studentIds.length} ${mode === 'parent' ? 'पालकांना' : 'विद्यार्थ्यांना'} WhatsApp पाठवायचा आहे का?\n\nTwilio मार्फत थेट पाठवला जाईल — हे रद्द करता येणार नाही.`)) return

    sendingRef.current = true
    setSending(true)
    setReport(null)
    try {
      const response = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds, message, audience: mode }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'WhatsApp पाठवता आले नाही')
      setReport(data as SendReport)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'WhatsApp पाठवता आले नाही')
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  const sendToSelected = () => {
    if (!message) { alert('Message लिहा'); return }
    const selectedStudents = students.filter(s => selected.has(s.id))
    selectedStudents.forEach((s, i) => {
      const phone = mode === 'parent' ? s.parent_phone : s.phone
      if (!phone) return
      setTimeout(() => {
        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank')
      }, i * 500)
    })
  }

  const sendNoticeToAll = () => {
    if (!officialNotice) { alert('Notice लिहा'); return }
    if (!confirm(`सर्व ${students.length} पालकांना notice पाठवायची आहे का?`)) return
    students.forEach((s, i) => {
      if (!s.parent_phone) return
      setTimeout(() => {
        window.open(`https://wa.me/91${s.parent_phone}?text=${encodeURIComponent(officialNotice)}`, '_blank')
      }, i * 600)
    })
  }

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">📱 WhatsApp Messaging</div>
          <div className="page-subtitle">पालक / विद्यार्थी यांना message पाठवा</div>
        </div>
      </div>

      {/* Academy WhatsApp info */}
      <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 22 }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#166534' }}>तुमचा Academy WhatsApp नंबर: <span style={{ fontFamily: 'monospace', fontSize: 16 }}>7720991375</span></div>
          <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>खालील buttons दाबल्यावर तुमच्या phone वर WhatsApp उघडेल → पालकाला message पाठवा</div>
        </div>
        <a href={`https://wa.me/${ACADEMY_WA}?text=${encodeURIComponent('Test message from Shivrakshak Academy admin')}`}
          target="_blank"
          style={{ background: '#25d366', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
          📱 Test करा
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24 }}>
        {([
          { key: 'individual', label: '👤 एकट्याला' },
          { key: 'bulk', label: '👥 निवडलेल्यांना' },
          { key: 'notice', label: '📢 सर्वांना Notice' },
        ] as const).map(t => (
          <button key={t.key} className="btn" onClick={() => setTab(t.key)}
            style={{ background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#0f172a' : '#64748b', boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', padding: '8px 16px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Individual */}
      {tab === 'individual' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <input className="form-input" placeholder="🔍 नाव शोधा..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 500 }}>
              {filtered.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #f8fafc' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ background: '#7c2d12', color: 'white', padding: '1px 7px', borderRadius: 5, fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>{s.roll_number}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>पालक: {s.parent_phone}</div>
                  </div>
                  <a
                    href={`https://wa.me/91${s.parent_phone}?text=${encodeURIComponent(`नमस्कार, ${s.name} (${s.roll_number}) यांच्याबद्दल एक संदेश. — शिवरक्षक अकॅडमी`)}`}
                    target="_blank"
                    className="btn btn-whatsapp"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    📱 WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, height: 'fit-content' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📝 Templates</h3>
            {TEMPLATES.map(t => (
              <button key={t.label} onClick={() => {}} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 8, cursor: 'pointer', fontSize: 13, background: 'white' }}>
                <div style={{ fontWeight: 600, color: '#25d366' }}>{t.label}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{t.text.substring(0, 60)}...</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk */}
      {tab === 'bulk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input className="form-input" placeholder="🔍 शोधा..." style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={selectAll}>सर्व</button>
              <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={clearAll}>रद्द</button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 460 }}>
              {filtered.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selected.has(s.id) ? '#fef3c7' : 'white' }}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ background: '#7c2d12', color: 'white', padding: '1px 7px', borderRadius: 5, fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>{s.roll_number}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>पालक: {s.parent_phone}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#64748b' }}>
              {selected.size} विद्यार्थी निवडले
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, height: 'fit-content' }}>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">पाठवायचे कोणाला?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={`btn ${mode === 'parent' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('parent')} style={{ flex: 1, justifyContent: 'center' }}>पालक</button>
                <button className={`btn ${mode === 'student' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('student')} style={{ flex: 1, justifyContent: 'center' }}>विद्यार्थी</button>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Templates</label>
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => setMessage(t.text)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 6, cursor: 'pointer', fontSize: 12, background: 'white' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Message *</label>
              <textarea className="form-input" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message लिहा..." />
            </div>

            <button
              className="btn btn-whatsapp"
              style={{ width: '100%', justifyContent: 'center', padding: 12, opacity: sending || selected.size === 0 ? 0.6 : 1 }}
              onClick={sendViaApi}
              disabled={sending || selected.size === 0}
            >
              {sending ? '⏳ पाठवत आहे...' : `🚀 ${selected.size} जणांना थेट WhatsApp पाठवा`}
            </button>
            <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', margin: '8px 0 14px' }}>
              Twilio मार्फत server वरून पाठवले जाईल — WhatsApp app उघडणार नाही
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Twilio बंद असल्यास पर्याय:</div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={sendToSelected}
                disabled={selected.size === 0}
              >
                📱 WhatsApp app मधून एक-एक पाठवा
              </button>
            </div>

            {report && (
              <div style={{ marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '4px 9px', fontSize: 12, fontWeight: 700 }}>निवडले: {report.summary.totalSelected}</span>
                  <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 6, padding: '4px 9px', fontSize: 12, fontWeight: 700 }}>पाठवले: {report.summary.sent}</span>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 6, padding: '4px 9px', fontSize: 12, fontWeight: 700 }}>अयशस्वी: {report.summary.failed}</span>
                  {report.summary.invalidNumber > 0 && <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: 6, padding: '4px 9px', fontSize: 12, fontWeight: 700 }}>नंबर नाही: {report.summary.invalidNumber}</span>}
                  {report.summary.duplicate > 0 && <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 6, padding: '4px 9px', fontSize: 12, fontWeight: 700 }}>तोच नंबर: {report.summary.duplicate}</span>}
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: 8 }}>
                  {report.results.map(item => (
                    <div key={item.studentId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 10px', borderBottom: '1px solid #f8fafc', fontSize: 12 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.rollNumber} {item.name}</span>
                      <span style={{ color: STATUS_LABEL[item.status].color, fontWeight: 700, whiteSpace: 'nowrap' }} title={item.reason || ''}>{STATUS_LABEL[item.status].text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Notice to All */}
      {tab === 'notice' && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#78350f' }}>
              ⚠️ हे message सर्व <strong>{students.length} पालकांना</strong> एकाच वेळी पाठवले जाईल. काळजीपूर्वक लिहा.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Templates</label>
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => setOfficialNotice(t.text)} style={{ display: 'inline-block', margin: '0 6px 6px 0', padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, background: 'white' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Official Notice *</label>
              <textarea className="form-input" rows={6} value={officialNotice} onChange={e => setOfficialNotice(e.target.value)}
                placeholder="येथे अधिकृत सूचना लिहा...&#10;&#10;उदा: उद्या (तारीख) रोजी परीक्षा आहे. सर्व विद्यार्थ्यांनी सकाळी 7 वाजता उपस्थित रहावे." />
            </div>

            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16 }} onClick={sendNoticeToAll}>
              📢 सर्व पालकांना Official Notice पाठवा
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
