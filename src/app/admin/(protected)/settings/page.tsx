'use client'

import { useEffect, useState } from 'react'
import { Building2, Check, Contact, Megaphone, Share2 } from 'lucide-react'
import { adminMutation } from '@/lib/admin-api'
import { supabase } from '@/lib/supabase'

const initial = {
  academy_name: 'शिवरक्षक करिअर अकॅडमी', tagline: 'शिस्त • मेहनत • यश',
  hero_title: 'वर्दीचं स्वप्न, आता होणार पूर्ण!', hero_subtitle: '',
  phone: '', whatsapp: '', email: '', address: '',
  youtube_url: '', instagram_url: '', facebook_url: '',
}

type Field = { key: keyof typeof initial; label: string; hint?: string; area?: boolean; type?: string; placeholder?: string }

/** Raw column names replaced with what an administrator actually calls these. */
const SECTIONS: { id: string; title: string; note: string; icon: typeof Building2; fields: Field[] }[] = [
  {
    id: 'academy', title: 'अकॅडमीची माहिती', note: 'वेबसाइटच्या वरती व footer मध्ये दिसते.', icon: Building2,
    fields: [
      { key: 'academy_name', label: 'अकॅडमीचे नाव' },
      { key: 'tagline', label: 'घोषवाक्य (Tagline)', hint: 'उदा. शिस्त • मेहनत • यश' },
    ],
  },
  {
    id: 'hero', title: 'मुख्यपृष्ठावरील शीर्षक', note: 'Homepage उघडल्यावर सर्वात आधी दिसणारा मजकूर.', icon: Megaphone,
    fields: [
      { key: 'hero_title', label: 'मुख्य शीर्षक' },
      { key: 'hero_subtitle', label: 'उपशीर्षक', area: true, hint: 'शीर्षकाखालील छोटे वर्णन.' },
    ],
  },
  {
    id: 'contact', title: 'संपर्क माहिती', note: 'वेबसाइटवर व विद्यार्थ्यांना पाठवल्या जाणाऱ्या संदेशांत वापरली जाते.', icon: Contact,
    fields: [
      { key: 'phone', label: 'फोन नंबर', type: 'tel', placeholder: '9284842177' },
      { key: 'whatsapp', label: 'WhatsApp नंबर', type: 'tel', placeholder: '917720991375', hint: 'देश कोडसह (91) लिहा.' },
      { key: 'email', label: 'ई-मेल', type: 'email', placeholder: 'info@shivrakshakacademy.in' },
      { key: 'address', label: 'पत्ता', area: true },
    ],
  },
  {
    id: 'social', title: 'सोशल मीडिया', note: 'रिकामे ठेवल्यास ते icon वेबसाइटवर दिसणार नाही.', icon: Share2,
    fields: [
      { key: 'youtube_url', label: 'YouTube चॅनेल लिंक', type: 'url', placeholder: 'https://youtube.com/@...' },
      { key: 'instagram_url', label: 'Instagram लिंक', type: 'url', placeholder: 'https://instagram.com/...' },
      { key: 'facebook_url', label: 'Facebook पेज लिंक', type: 'url', placeholder: 'https://facebook.com/...' },
    ],
  },
]

export default function SettingsPage() {
  // Holds the whole row, so saving sends exactly what it always did.
  const [form, setForm] = useState<Record<string, string>>(initial)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single()
      .then(({ data }) => data && setForm({ ...initial, ...data }))
  }, [])

  async function save() {
    setBusy(true); setDone(''); setError('')
    try {
      await adminMutation('settings.update', form)
      setDone('वेबसाइट सेटिंग्ज जतन झाल्या.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'जतन करता आले नाही.')
    }
    setBusy(false)
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="page-title">वेबसाइट सेटिंग्ज</div>
          <div className="page-subtitle">वेबसाइटवर दिसणारा मजकूर, संपर्क माहिती आणि सोशल लिंक बदला.</div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? 'जतन होत आहे…' : <><Check size={16} /> बदल जतन करा</>}
        </button>
      </div>

      {done && <div className="adm-alert adm-alert--ok">{done}</div>}
      {error && <div className="adm-alert adm-alert--err">{error}</div>}

      <div style={{ display: 'grid', gap: 16 }}>
        {SECTIONS.map(section => {
          const Icon = section.icon
          return (
            <section className="adm-panel" key={section.id}>
              <div className="adm-panel__head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="adm-avatar" style={{ width: 32, height: 32 }}><Icon size={15} /></span>
                  <div>
                    <h3>{section.title}</h3>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{section.note}</div>
                  </div>
                </div>
              </div>
              <div className="adm-panel__body">
                <div className="admin-form-grid" style={{ marginBottom: 0 }}>
                  {section.fields.map(field => (
                    <label key={field.key} className={field.area ? 'wide-field' : ''}>
                      <span className="form-label">{field.label}</span>
                      {field.area ? (
                        <textarea className="form-input" rows={3} value={form[field.key] ?? ''}
                          onChange={e => set(field.key, e.target.value)} />
                      ) : (
                        <input className="form-input" type={field.type || 'text'} placeholder={field.placeholder}
                          value={form[field.key] ?? ''} onChange={e => set(field.key, e.target.value)} />
                      )}
                      {field.hint && <span style={{ display: 'block', fontSize: 11.5, color: '#94a3b8', marginTop: 5 }}>{field.hint}</span>}
                    </label>
                  ))}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <div style={{
        position: 'sticky', bottom: 0, marginTop: 18, padding: '14px 0',
        background: 'linear-gradient(180deg, rgba(247,248,245,0), #f7f8f5 38%)',
        display: 'flex', justifyContent: 'flex-end', gap: 10,
      }}>
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? 'जतन होत आहे…' : <><Check size={16} /> बदल जतन करा</>}
        </button>
      </div>
    </div>
  )
}
