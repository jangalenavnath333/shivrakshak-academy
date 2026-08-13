'use client'
import { useEffect, useState } from 'react'
import { AlertCircle, Check, Eye, EyeOff, FileEdit, Megaphone, MessageCircle, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Notice } from '@/types'
import { formatDate } from '@/lib/utils'
import { adminMutation } from '@/lib/admin-api'

const CATEGORIES: Record<string, { label: string; emoji: string; color: string; cls: string }> = {
  general: { label: 'सामान्य', emoji: '📢', color: 'badge-gray', cls: 'adm-badge--muted' },
  exam: { label: 'परीक्षा', emoji: '📝', color: 'badge-blue', cls: 'adm-badge--info' },
  result: { label: 'निकाल', emoji: '🏆', color: 'badge-green', cls: 'adm-badge--ok' },
  holiday: { label: 'सुटी', emoji: '🎉', color: 'badge-yellow', cls: 'adm-badge--warn' },
  important: { label: 'महत्त्वाचे', emoji: '❗', color: 'badge-red', cls: 'adm-badge--danger' },
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_published: true })
  const [tab, setTab] = useState<'list' | 'new'>('list')
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<{ parent_phone: string }[]>([])

  useEffect(() => {
    supabase.from('notices').select('*').order('created_at', { ascending: false }).then(({ data }) => setNotices(data || []))
    supabase.from('students').select('parent_phone').then(({ data }) => setStudents(data || []))
  }, [])

  const addNotice = async () => {
    setLoading(true)
    try {
      const { data } = await adminMutation<{ data: Notice }>('notice.create', form)
      setNotices(prev => [data, ...prev])
      setForm({ title: '', content: '', category: 'general', is_published: true })
      setTab('list')
    } catch (error) { alert(error instanceof Error ? error.message : 'Notice could not be created') }
    setLoading(false)
  }

  const togglePublish = async (id: string, is_published: boolean) => {
    try {
      await adminMutation('notice.toggle', { id, is_published: !is_published })
      setNotices(prev => prev.map(n => n.id === id ? { ...n, is_published: !is_published } : n))
    } catch (error) { alert(error instanceof Error ? error.message : 'Notice update failed') }
  }

  const deleteNotice = async (id: string) => {
    if (!confirm('ही notice delete करायची आहे का?')) return
    try {
      await adminMutation('notice.delete', { id })
      setNotices(prev => prev.filter(n => n.id !== id))
    } catch (error) { alert(error instanceof Error ? error.message : 'Notice deletion failed') }
  }

  // Unchanged manual path: opens the WhatsApp app once per parent.
  const sendToWhatsApp = (notice: Notice) => {
    const msg = `📢 *शिवरक्षक करियर अकॅडमी — ${CATEGORIES[notice.category]?.emoji} ${notice.title}*\n\n${notice.content}`
    students.forEach((s, i) => {
      if (!s.parent_phone) return
      setTimeout(() => {
        window.open(`https://wa.me/91${s.parent_phone}?text=${encodeURIComponent(msg)}`, '_blank')
      }, i * 600)
    })
  }

  const published = notices.filter(n => n.is_published).length
  const drafts = notices.length - published
  const important = notices.filter(n => n.category === 'important').length

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="page-title">नोटीस</div>
          <div className="page-subtitle">सूचना तयार करा, प्रकाशित करा आणि पालकांना कळवा.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setTab('new')}><Plus size={16} /> नवीन नोटीस</button>
      </div>

      <div className="adm-stats" style={{ marginBottom: 18 }}>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#ecfdf3', color: '#027a48' }}><Eye size={19} /></span>
          <div className="adm-stat__lbl">प्रकाशित</div><div className="adm-stat__val">{published}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#f4f5f2', color: '#475569' }}><FileEdit size={19} /></span>
          <div className="adm-stat__lbl">ड्राफ्ट</div><div className="adm-stat__val">{drafts}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#fef3f2', color: '#b42318' }}><AlertCircle size={19} /></span>
          <div className="adm-stat__lbl">महत्त्वाच्या</div><div className="adm-stat__val">{important}</div>
        </div>
      </div>

      <div className="adm-tabs" role="tablist">
        {([{ key: 'list', label: 'सर्व नोटीस' }, { key: 'new', label: 'नवीन नोटीस' }] as const).map(t => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="adm-tab" data-active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {notices.length === 0 ? (
            <div className="adm-panel">
              <div className="adm-empty">
                <Megaphone size={32} /><b>अजून कोणतीही नोटीस नाही</b>
                <span>&ldquo;नवीन नोटीस&rdquo; दाबून पहिली सूचना तयार करा.</span>
              </div>
            </div>
          ) : notices.map(n => {
            const cat = CATEGORIES[n.category] || CATEGORIES.general
            return (
              <article key={n.id} className="adm-panel" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <span className="adm-avatar" style={{ width: 38, height: 38 }}><Megaphone size={17} /></span>
                  <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <b style={{ fontSize: 15, fontWeight: 700 }}>{n.title}</b>
                      <span className={`adm-badge ${cat.cls}`}>{cat.label}</span>
                      <span className={`adm-badge ${n.is_published ? 'adm-badge--ok' : 'adm-badge--muted'}`}>
                        {n.is_published ? 'प्रकाशित' : 'ड्राफ्ट'}
                      </span>
                    </div>
                    {n.content && <p style={{ color: '#475569', fontSize: 13.5, margin: '0 0 8px', lineHeight: 1.65 }}>{n.content}</p>}
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{formatDate(n.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }}>
                    <button className={`btn ${n.is_published ? 'btn-secondary' : 'btn-primary'}`} style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => togglePublish(n.id, n.is_published)}>
                      {n.is_published ? <><EyeOff size={14} /> लपवा</> : <><Eye size={14} /> प्रकाशित करा</>}
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => sendToWhatsApp(n)}
                      title="प्रत्येक पालकासाठी WhatsApp app उघडेल">
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 9px', fontSize: 12, color: '#b42318' }}
                      aria-label={`${n.title} — नोटीस delete करा`} onClick={() => deleteNotice(n.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {tab === 'new' && (
        <section className="adm-panel" style={{ maxWidth: 640 }}>
          <div className="adm-panel__head"><h3>नवीन नोटीस</h3></div>
          <div className="adm-panel__body" style={{ display: 'grid', gap: 14 }}>
            <label>
              <span className="form-label">शीर्षक *</span>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="उदा. उद्या सकाळी ५ वाजता ग्राउंड रनिंग" />
            </label>
            <label>
              <span className="form-label">श्रेणी</span>
              <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.entries(CATEGORIES).map(([val, c]) => <option key={val} value={val}>{c.label}</option>)}
              </select>
            </label>
            <label>
              <span className="form-label">तपशील</span>
              <textarea className="form-input" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="नोटीसचा संपूर्ण मजकूर येथे लिहा…" />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              आत्ताच website वर प्रकाशित करा
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addNotice} disabled={loading || !form.title}>
                {loading ? 'जतन होत आहे…' : <><Check size={16} /> नोटीस जतन करा</>}
              </button>
              <button className="btn btn-secondary" onClick={() => setTab('list')}>रद्द</button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
