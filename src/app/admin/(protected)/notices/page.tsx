'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notice } from '@/types'
import { formatDate } from '@/lib/utils'
import { adminMutation } from '@/lib/admin-api'

const CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  general: { label: 'सामान्य', emoji: '📢', color: 'badge-gray' },
  exam: { label: 'परीक्षा', emoji: '📝', color: 'badge-blue' },
  result: { label: 'निकाल', emoji: '🏆', color: 'badge-green' },
  holiday: { label: 'सुटी', emoji: '🎉', color: 'badge-yellow' },
  important: { label: 'महत्त्वाचे', emoji: '❗', color: 'badge-red' },
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
    await adminMutation('notice.toggle', { id, is_published: !is_published })
    setNotices(prev => prev.map(n => n.id === id ? { ...n, is_published: !is_published } : n))
  }

  const deleteNotice = async (id: string) => {
    if (!confirm('ही notice delete करायची आहे का?')) return
    await adminMutation('notice.delete', { id })
    setNotices(prev => prev.filter(n => n.id !== id))
  }

  const sendToWhatsApp = (notice: Notice) => {
    const msg = `📢 *शिवरक्षक करियर अकॅडमी — ${CATEGORIES[notice.category]?.emoji} ${notice.title}*\n\n${notice.content}`
    students.forEach((s, i) => {
      if (!s.parent_phone) return
      setTimeout(() => {
        window.open(`https://wa.me/91${s.parent_phone}?text=${encodeURIComponent(msg)}`, '_blank')
      }, i * 600)
    })
  }

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">📢 नोटीस व्यवस्थापन</div>
          <div className="page-subtitle">सूचना, प्रश्नपत्रिका, महत्त्वाचे संदेश</div>
        </div>
        <button className="btn btn-primary" onClick={() => setTab('new')}>+ नवीन नोटीस</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24 }}>
        {([{ key: 'list', label: '📋 सर्व नोटीस' }, { key: 'new', label: '+ नवीन' }] as const).map(t => (
          <button key={t.key} className="btn" onClick={() => setTab(t.key)}
            style={{ background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#0f172a' : '#64748b', boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', padding: '8px 16px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {tab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {notices.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              कोणत्याही नोटीसा नाहीत
            </div>
          ) : notices.map(n => (
            <div key={n.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ fontSize: 28 }}>{CATEGORIES[n.category]?.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{n.title}</span>
                  <span className={`badge ${CATEGORIES[n.category]?.color}`}>{CATEGORIES[n.category]?.label}</span>
                  <span className={`badge ${n.is_published ? 'badge-green' : 'badge-gray'}`}>{n.is_published ? '✅ Published' : '⏸ Draft'}</span>
                </div>
                {n.content && <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>{n.content}</p>}
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(n.created_at)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-whatsapp" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => sendToWhatsApp(n)}>
                  📱 सर्वांना पाठवा
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => togglePublish(n.id, n.is_published)}>
                  {n.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => deleteNotice(n.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Notice Form */}
      {tab === 'new' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, maxWidth: 600 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>नवीन नोटीस</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">शीर्षक *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="नोटीसचे शीर्षक" />
            </div>
            <div>
              <label className="form-label">श्रेणी</label>
              <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.entries(CATEGORIES).map(([val, c]) => (
                  <option key={val} value={val}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">तपशील</label>
              <textarea className="form-input" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="नोटीसचा संपूर्ण मजकूर येथे लिहा..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              <span style={{ fontSize: 14 }}>आत्ताच website वर publish करा</span>
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 12 }} onClick={addNotice} disabled={loading}>
                {loading ? '⏳...' : '✅ नोटीस जतन करा'}
              </button>
              <button className="btn btn-secondary" onClick={() => setTab('list')}>रद्द</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
