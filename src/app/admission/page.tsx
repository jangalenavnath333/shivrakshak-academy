'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import PrintableForm from './PrintableForm'

type FormData = {
  name: string; parent_name: string; address: string
  phone: string; parent_phone: string; aadhaar_no: string
  guarantee_letter_no: string; dob: string; gender: string
  course: string; admission_date: string; duration: string
  age: string; height: string; weight: string; chest: string
  total_fee: string
}

type DocFile = { file: File; preview: string }

type DocsState = {
  photo: DocFile | null
  signature: DocFile | null
  aadhaar_front: DocFile | null
  aadhaar_back: DocFile | null
  marksheet_10: DocFile | null
  marksheet_12: DocFile | null
  caste_certificate: DocFile | null
  domicile: DocFile | null
  sports_certificate: DocFile | null
  other: DocFile | null
}

const DOC_LIST: { key: keyof DocsState; label: string; emoji: string; required: boolean; accept: string }[] = [
  { key: 'photo',             label: 'पासपोर्ट फोटो',        emoji: '📷', required: true,  accept: 'image/*' },
  { key: 'signature',         label: 'विद्यार्थ्याची सही',     emoji: '✍️', required: false, accept: 'image/*' },
  { key: 'aadhaar_front',     label: 'आधार कार्ड (समोर)',      emoji: '🪪', required: true,  accept: 'image/*,.pdf' },
  { key: 'aadhaar_back',      label: 'आधार कार्ड (मागे)',      emoji: '🪪', required: false, accept: 'image/*,.pdf' },
  { key: 'marksheet_10',      label: '10वी मार्कशीट',          emoji: '📄', required: true,  accept: 'image/*,.pdf' },
  { key: 'marksheet_12',      label: '12वी मार्कशीट',          emoji: '📄', required: false, accept: 'image/*,.pdf' },
  { key: 'caste_certificate', label: 'जातीचा दाखला',           emoji: '📜', required: false, accept: 'image/*,.pdf' },
  { key: 'domicile',          label: 'अधिवास / रहिवासी दाखला', emoji: '📋', required: false, accept: 'image/*,.pdf' },
  { key: 'sports_certificate',label: 'क्रीडा प्रमाणपत्र',       emoji: '🏅', required: false, accept: 'image/*,.pdf' },
  { key: 'other',             label: 'इतर कागदपत्र',           emoji: '📎', required: false, accept: 'image/*,.pdf' },
]

const COURSES = [
  ['police', 'पोलीस'], ['navy', 'नेव्ही'], ['mpsc', 'एम.पी.एस.सी'],
  ['staff_selection', 'स्टॉफ सिलेक्शन'], ['saral_seva', 'सरळ सेवा'],
  ['other', 'इतर'], ['army', 'आर्मी'], ['railway', 'रेल्वे'],
]

const RULES = [
  'प्रशिक्षण दरम्यान मला कोणत्याही प्रकारची इजा झाल्यास मी स्वतः त्याला जबाबदार राहील.',
  'होस्टेल मध्ये कोणत्याही मौल्यवान वस्तु आनण्यास मनाई आहे. चोरी गेल्यास अॅकेडमी त्याला जबाबदार राहणार नाही याची सर्वांनी नोंद घ्यावी.',
  'अॅकेडमीमध्ये मुलींची छेड किंवा भांडण तंटे केल्यास अॅकेडमी जबाबदार राहणार नाही.',
  'अॅकेडमीतून कामा निमित्त किंवा गावी जायचे असेल तर अर्ज किंवा गेट पास घेऊन जाणे बंधन कारक आहे.',
  'अर्ज किंवा गेट पास न घेता गेला/गेली तर काय हनी झाल्यास मी स्वतः त्याला जबाबदार राहील.',
  'मुला मुलींनी कोणत्याही प्रकारचे गैर कृत्य केल्यास किंवा कोणताही अनुचित प्रकार केल्यास त्यास अॅकेडमी जबाबदार राहणार नाही.',
  'अॅकेडमी मध्ये विद्यार्थ्यांनी गैर वर्तन केल्यास शिक्षेस पात्र राहिल.',
]

function FieldLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
      <span style={{ fontSize: 14, whiteSpace: 'nowrap', minWidth: 200, fontWeight: 500 }}>{label} :</span>
      <div style={{ flex: 1, borderBottom: '1px solid #555', minHeight: 28 }}>{children}</div>
    </div>
  )
}

function FInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, background: 'transparent', paddingBottom: 2, fontFamily: 'inherit' }} />
  )
}

function AcademyHeader() {
  return (
    <div style={{ borderBottom: '2px solid #333', paddingBottom: 10, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, color: '#333', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700 }}>शिवमुद्रा व रक्षक ऑकेडमी संचलित</div>
          <div style={{ fontSize: 10, color: '#666' }}>महाराष्ट्रात सर्वाधिक पोलिस व आर्मी सैनिक घडविणारी एकमेव संस्था</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, margin: '0 16px' }}>
          <div style={{ fontSize: 24 }}>🛡️ 🌟 🏆</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#7c2d12', fontFamily: 'serif' }}>शिवरक्षक करियर ऑकेडमी</div>
        </div>
        <div style={{ fontSize: 11, color: '#333', lineHeight: 1.8, textAlign: 'right' }}>
          <div><strong>शिवमुद्रा :– रजि नं. ५२७/ए</strong></div>
          <div>रक्षक :– रजि नं. ०००००१३२०२४</div>
          <div>न्यू आर्टस् कॉलेजच्या पाठीमागे,</div>
          <div>गौरव स्पोट्स जवळ, बालिकाश्रम रोड, अ.नगर</div>
          <div><strong>9284842177 | 9011887714</strong></div>
          <div style={{ fontSize: 10 }}>★ संचालक – मेजर महाडिक सर ★ संचालक – मेजर पवार सर</div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { n: 1, label: 'प्रवेश अर्ज' },
  { n: 2, label: 'Documents' },
  { n: 3, label: 'संमतीपत्र' },
  { n: 4, label: 'फी पावती' },
]

export default function AdmissionPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rollNumber, setRollNumber] = useState('')
  const [agreed, setAgreed] = useState(false)
  const formPdfRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormData>({
    name: '', parent_name: '', address: '', phone: '', parent_phone: '',
    aadhaar_no: '', guarantee_letter_no: '', dob: '', gender: 'male',
    course: '', admission_date: '', duration: '', age: '', height: '',
    weight: '', chest: '', total_fee: '',
  })

  const [docs, setDocs] = useState<DocsState>({
    photo: null, signature: null, aadhaar_front: null, aadhaar_back: null,
    marksheet_10: null, marksheet_12: null, caste_certificate: null,
    domicile: null, sports_certificate: null, other: null,
  })

  const upd = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleDocUpload = (key: keyof DocsState, file: File) => {
    const isImg = file.type.startsWith('image/')
    const reader = new FileReader()
    reader.onload = (e) => {
      setDocs(d => ({ ...d, [key]: { file, preview: isImg ? (e.target?.result as string) : 'pdf' } }))
    }
    reader.readAsDataURL(file)
  }

  const removeDoc = (key: keyof DocsState) => setDocs(d => ({ ...d, [key]: null }))

  const uploadedCount = Object.values(docs).filter(Boolean).length
  const requiredDocs = DOC_LIST.filter(d => d.required)
  const requiredUploaded = requiredDocs.filter(d => docs[d.key]).length

  const handleSubmit = async () => {
    if (!agreed) { alert('कृपया नियम व अटी मंजूर करा'); return }
    setLoading(true)

    try {
      const payload = new globalThis.FormData()
      Object.entries(form).forEach(([key, value]) => payload.append(key, value))
      payload.append('agreed', 'true')
      DOC_LIST.forEach(({ key }) => {
        const document = docs[key]
        if (document) payload.append(`document:${key}`, document.file)
      })

      const response = await fetch('/api/admissions', { method: 'POST', body: payload })
      const result = await response.json()
      if (!response.ok || !result.code) {
        throw new Error(result.error || 'Admission failed')
      }
      setRollNumber(result.code)
      setSubmitted(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error submitting. Please try again.')
    }
    setLoading(false)
  }

  const pageStyle: React.CSSProperties = {
    background: 'white', border: '1.5px solid #aaa', borderRadius: 4,
    padding: '28px 32px', maxWidth: 780, margin: '0 auto',
    fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  }

  // ── PDF Download — Browser Print (Desktop + Mobile दोन्हीवर चालते) ──
  const handleDownloadPdf = () => {
    const prevTitle = document.title
    document.title = `ShivrakshakAcademy_${(form.name || 'Form').replace(/\s+/g, '_')}_${rollNumber}`
    window.print()
    setTimeout(() => { document.title = prevTitle }, 800)
  }

  // ── SUCCESS ──────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

          {/* Academy name */}
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7c2d12', marginBottom: 4 }}>🛡️ शिवरक्षक करियर अकॅडमी</div>
          <div style={{ fontSize: 11, color: '#78350f', marginBottom: 20 }}>अहमदनगर — 9284842177</div>

          <div style={{ fontSize: 56, marginBottom: 10 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#166534', marginBottom: 6 }}>प्रवेश अर्ज यशस्वी झाला!</h2>
          <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>तुमचा प्रवेश अर्ज क्रमांक मिळाला आहे</p>

          {/* BIG prominent admission code */}
          <div style={{ background: 'linear-gradient(135deg, #7c2d12, #b45309)', borderRadius: 16, padding: '24px 32px', marginBottom: 16, boxShadow: '0 4px 20px rgba(124,45,18,0.4)' }}>
            <div style={{ fontSize: 12, color: '#fcd34d', fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>प्रवेश अर्ज क्रमांक</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: 6, fontFamily: 'monospace' }}>
              {rollNumber}
            </div>
            <div style={{ fontSize: 12, color: '#fed7aa', marginTop: 8 }}>★ हा क्रमांक लक्षात ठेवा — सर्व कामांसाठी लागेल ★</div>
          </div>

          {/* Warning box */}
          <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
            <div style={{ fontWeight: 800, color: '#92400e', marginBottom: 4 }}>⚠️ महत्त्वाचे!</div>
            <div style={{ color: '#78350f' }}>
              हा नंबर <strong>फोनमध्ये Save करा</strong> किंवा <strong>लिहून ठेवा</strong>.<br />
              अकॅडमीत आल्यावर हाच नंबर सांगायचा आहे.
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 10, marginBottom: 20, fontSize: 12, color: '#166534' }}>
            ✅ {uploadedCount} कागदपत्रे upload झाली &nbsp;|&nbsp; 📞 संपर्क: 9284842177
          </div>

          {/* PDF Download */}
          <button
            onClick={handleDownloadPdf}
            style={{ width: '100%', background: '#7c2d12', color: 'white', padding: '14px', borderRadius: 10, fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 15, marginBottom: 10, boxShadow: '0 4px 12px rgba(124,45,18,0.3)' }}
          >
            📥 प्रवेश अर्ज PDF Download करा ({rollNumber})
          </button>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/" style={{ flex: 1, background: '#f1f5f9', color: '#374151', padding: '11px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14, border: '1px solid #e2e8f0', display: 'block' }}>
              🏠 मुख्यपृष्ठ
            </Link>
            <button onClick={() => window.print()} style={{ flex: 1, background: '#f1f5f9', color: '#374151', padding: '11px', borderRadius: 8, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 14 }}>
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <> {/* Fragment — main page + hidden PDF form */}
    <div style={{ minHeight: '100vh', background: '#e5e7eb', paddingBottom: 60 }}>

      {/* Top bar */}
      <div style={{ background: '#7c2d12', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>🛡️ शिवरक्षक करियर अकॅडमी — प्रवेश अर्ज</div>
        <Link href="/" style={{ color: '#fcd34d', textDecoration: 'none', fontSize: 13 }}>← परत</Link>
      </div>

      {/* Step bar */}
      <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '10px 24px', display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
              background: step === s.n ? '#7c2d12' : step > s.n ? '#16a34a' : 'white',
              color: step >= s.n ? 'white' : '#94a3b8',
              borderRadius: 20, fontSize: 13, fontWeight: 700,
              border: `1px solid ${step === s.n ? '#7c2d12' : step > s.n ? '#16a34a' : '#e2e8f0'}`,
            }}>
              <span>{step > s.n ? '✓' : s.n}</span><span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: '#fde68a', margin: '0 3px' }} />}
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 16px' }}>

        {/* ══════════════════════════════════
            STEP 1 — प्रवेश अर्ज
        ══════════════════════════════════ */}
        {step === 1 && (
          <div style={pageStyle}>
            <AcademyHeader />
            {/* Admission code header — top of form */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: '#7c2d12' }}>★ प्रवेश अर्ज ★</div>
              <div style={{ border: '2px solid #7c2d12', borderRadius: 8, padding: '8px 18px', textAlign: 'center', background: '#fffbeb', minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#78350f', fontWeight: 600, letterSpacing: 0.5, marginBottom: 3 }}>प्रवेश अर्ज क्रमांक</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#7c2d12', letterSpacing: 2, fontFamily: 'monospace' }}>
                  (Submit नंतर मिळेल)
                </div>
                <div style={{ fontSize: 10, color: '#92400e', marginTop: 3 }}>★ हा क्रमांक लक्षात ठेवा ★</div>
              </div>
            </div>

            {/* Name + Photo */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <FieldLine label="विद्यार्थ्याचे नाव">
                  <FInput value={form.name} onChange={e => upd('name', e.target.value)} required />
                </FieldLine>
              </div>
              <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 90, height: 110, border: '1.5px dashed #999', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: docs.photo ? 'transparent' : '#fafafa', overflow: 'hidden' }}>
                  {docs.photo?.preview
                    ? <img src={docs.photo.preview} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>📷<br />फोटो<br />click करा</div>
                  }
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleDocUpload('photo', e.target.files[0])} />
              </label>
            </div>

            <FieldLine label="विद्यार्थ्याचा रोल नंबर">
              <span style={{ fontSize: 12, color: '#94a3b8' }}>(Submit नंतर मिळेल)</span>
            </FieldLine>
            <FieldLine label="पालकाचे नाव">
              <FInput value={form.parent_name} onChange={e => upd('parent_name', e.target.value)} required />
            </FieldLine>
            <FieldLine label="पत्ता">
              <FInput value={form.address} onChange={e => upd('address', e.target.value)} placeholder="गाव, तालुका, जिल्हा" />
            </FieldLine>

            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              {[['फोन', 'phone', 'tel'], ['पालकाचा मो.', 'parent_phone', 'tel']].map(([lbl, key, type]) => (
                <div key={key} style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14, whiteSpace: 'nowrap', fontWeight: 500 }}>{lbl} :</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #555' }}>
                    <FInput type={type} value={form[key as keyof FormData]} onChange={e => upd(key as keyof FormData, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              {[['आधार कार्ड नं.', 'aadhaar_no'], ['हमीपत्र नं.', 'guarantee_letter_no']].map(([lbl, key]) => (
                <div key={key} style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14, whiteSpace: 'nowrap', fontWeight: 500 }}>{lbl} :</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #555' }}>
                    <FInput value={form[key as keyof FormData]} onChange={e => upd(key as keyof FormData, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 14, whiteSpace: 'nowrap', fontWeight: 500 }}>जन्म तारीख :</span>
                <div style={{ flex: 1, borderBottom: '1px solid #555' }}>
                  <FInput type="date" value={form.dob} onChange={e => upd('dob', e.target.value)} />
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 14, whiteSpace: 'nowrap', fontWeight: 500 }}>लिंग :</span>
                <div style={{ flex: 1, borderBottom: '1px solid #555' }}>
                  <select value={form.gender} onChange={e => upd('gender', e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'inherit' }}>
                    <option value="male">पुरुष</option>
                    <option value="female">महिला</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Course */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>कोर्स :</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {COURSES.map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '6px 10px', border: `1.5px solid ${form.course === val ? '#7c2d12' : '#e2e8f0'}`, borderRadius: 6, background: form.course === val ? '#fef3c7' : 'white' }}>
                    <input type="radio" name="course" value={val} checked={form.course === val} onChange={() => upd('course', val)} style={{ accentColor: '#7c2d12' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              {[['प्रवेश तारीख', 'admission_date', 'date', ''], ['कालावधी', 'duration', 'text', '6 महिने / 1 वर्ष']].map(([lbl, key, type, ph]) => (
                <div key={key} style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14, whiteSpace: 'nowrap', fontWeight: 500 }}>{lbl} :</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #555' }}>
                    <FInput type={type} value={form[key as keyof FormData]} onChange={e => upd(key as keyof FormData, e.target.value)} placeholder={ph} />
                  </div>
                </div>
              ))}
            </div>

            {/* Physical */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              {[['वय', 'age', 'वर्षे'], ['उंची', 'height', 'सेमी'], ['वजन', 'weight', 'किलो'], ['छाती', 'chest', 'सेमी']].map(([lbl, key, ph]) => (
                <div key={key} style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{lbl}</div>
                  <div style={{ border: '1px solid #555', padding: '4px 8px', minHeight: 32 }}>
                    <input type="number" step="0.1" value={form[key as keyof FormData]} onChange={e => upd(key as keyof FormData, e.target.value)} placeholder={ph}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, background: 'transparent', fontFamily: 'inherit' }} />
                  </div>
                </div>
              ))}
            </div>

            <FieldLine label="एकूण कोर्स फी (₹)">
              <FInput type="number" value={form.total_fee} onChange={e => upd('total_fee', e.target.value)} placeholder="उदा. 100000" />
            </FieldLine>

            <div style={{ border: '1.5px solid #333', borderRadius: 40, padding: '8px 20px', textAlign: 'center', margin: '20px auto', maxWidth: 220, fontSize: 14, fontWeight: 700 }}>नियम व अटी</div>
            <p style={{ fontSize: 12, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 1.7 }}>
              विद्यार्थ्याने कसलेही गैरवर्तन, बेशिस्तपणा केल्यास शिक्षेस पात्र राहील.<br />
              मला व माझ्या पाल्यास सर्व अटी मंजुर असून त्यांचे पालन केले जाईल.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              {['विद्यार्थ्याची सही', 'पालकाची सही', 'शिवरक्षक करियर ऑकेडमी'].map(lbl => (
                <div key={lbl} style={{ textAlign: 'center', width: 160 }}>
                  <div style={{ borderBottom: '1px solid #555', height: 40, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>

            <button onClick={() => {
              if (!form.name || !form.parent_name || !form.parent_phone || !form.course)
                return alert('कृपया नाव, पालकाचे नाव, पालकाचा मो. नं. आणि कोर्स भरा')
              setStep(2)
            }} style={{ marginTop: 20, width: '100%', background: '#7c2d12', color: 'white', border: 'none', padding: 14, borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              पुढे → Documents Upload करा
            </button>
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 2 — DOCUMENTS UPLOAD
        ══════════════════════════════════ */}
        {step === 2 && (
          <div style={pageStyle}>
            <AcademyHeader />

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: '#7c2d12' }}>📁 कागदपत्रे Upload करा</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
                {uploadedCount} / {DOC_LIST.length} upload झाले &nbsp;•&nbsp;
                <span style={{ color: '#dc2626' }}>★ आवश्यक</span> ते {requiredUploaded}/{requiredDocs.length} upload झाले
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#f1f5f9', borderRadius: 10, height: 8, marginBottom: 28, overflow: 'hidden' }}>
              <div style={{ background: '#16a34a', height: '100%', width: `${(uploadedCount / DOC_LIST.length) * 100}%`, transition: 'width 0.3s', borderRadius: 10 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {DOC_LIST.map(({ key, label, emoji, required, accept }) => {
                const doc = docs[key]
                const isImg = doc?.preview && doc.preview !== 'pdf'
                return (
                  <div key={key} style={{ border: `2px solid ${doc ? '#16a34a' : required ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 12, overflow: 'hidden', background: doc ? '#f0fdf4' : 'white' }}>
                    {/* Preview area */}
                    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: doc ? (isImg ? 'transparent' : '#dcfce7') : '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                      {doc
                        ? isImg
                          ? <img src={doc.preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 36 }}>📄</div>
                              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>PDF Upload झाला ✅</div>
                            </div>
                        : <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: 32 }}>{emoji}</div>
                            <div style={{ fontSize: 11, marginTop: 4 }}>Click to upload</div>
                          </div>
                      }
                      {doc && (
                        <button onClick={() => removeDoc(key)} style={{ position: 'absolute', top: 6, right: 6, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      )}
                    </div>

                    {/* Label + Upload button */}
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                        {label}
                        {required && <span style={{ color: '#dc2626', marginLeft: 4 }}>★</span>}
                      </div>
                      <label style={{ cursor: 'pointer', display: 'block' }}>
                        <div style={{ background: doc ? '#16a34a' : '#7c2d12', color: 'white', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                          {doc ? '🔄 बदला' : '⬆️ Upload करा'}
                        </div>
                        <input type="file" accept={accept} style={{ display: 'none' }}
                          onChange={e => e.target.files?.[0] && handleDocUpload(key, e.target.files[0])} />
                      </label>
                      {doc && <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file.name}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 14, marginTop: 20, fontSize: 13, color: '#78350f' }}>
              💡 <strong>★ आवश्यक:</strong> फोटो, आधार कार्ड, 10वी मार्कशीट &nbsp;|&nbsp; बाकी documents नंतर admin panel मधून upload करता येतात.
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← मागे</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: '#7c2d12', color: 'white', border: 'none', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                पुढे → संमतीपत्र ({uploadedCount} files ready)
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 3 — संमतीपत्र
        ══════════════════════════════════ */}
        {step === 3 && (
          <div style={pageStyle}>
            <AcademyHeader />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#7c2d12' }}>★ पालक / विद्यार्थी संमतीपत्र ★</div>
              <div style={{ border: '2px solid #7c2d12', borderRadius: 8, padding: '6px 14px', textAlign: 'center', background: '#fffbeb' }}>
                <div style={{ fontSize: 10, color: '#78350f', fontWeight: 600 }}>प्रवेश अर्ज क्रमांक</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#94a3b8', letterSpacing: 1 }}>(Submit नंतर मिळेल)</div>
              </div>
            </div>

            <FieldLine label="मी"><span style={{ fontWeight: 600 }}>{form.name}</span></FieldLine>
            <FieldLine label="पत्ता"><span>{form.address}</span></FieldLine>
            <FieldLine label="प्रवेश अर्ज क्रमांक"><span style={{ color: '#94a3b8', fontSize: 12 }}>(Submit नंतर मिळेल)</span></FieldLine>
            <FieldLine label="मोबाईल नंबर (पालकाचा व विद्यार्थ्याचा)"><span>{form.parent_phone} / {form.phone}</span></FieldLine>

            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#333', marginBottom: 16 }}>
              खालील सर्व अटी नियम मी स्वतः माझ्या पालकाला वाचुन सांगितल्या असून या सर्व अटी नियम मला व माझ्या पालकांना मंजुर आहेत. मी त्यांचे पालन करीन.
            </p>

            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>अटी व नियम :</div>
            {RULES.map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 13, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 700, minWidth: 24 }}>{i + 1})</span>
                <span style={{ color: '#333' }}>{rule}</span>
              </div>
            ))}

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 16, margin: '20px 0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: '#7c2d12', flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: 1.7, fontWeight: 600, color: '#78350f' }}>
                  मला व माझ्या पाल्यास सर्व अटी मंजुर असून त्यांचे पालन केले जाईल. ✅
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              {['विद्यार्थ्याची सही', 'पालकाची सही', 'शिवरक्षक करियर ऑकेडमी'].map(lbl => (
                <div key={lbl} style={{ textAlign: 'center', width: 160 }}>
                  <div style={{ borderBottom: '1px solid #555', height: 40, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← मागे</button>
              <button onClick={() => setStep(4)} style={{ flex: 2, background: '#7c2d12', color: 'white', border: 'none', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>पुढे → फी पावती</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 4 — फी पावती + Submit
        ══════════════════════════════════ */}
        {step === 4 && (
          <div style={pageStyle}>
            <div style={{ borderBottom: '2px solid #333', paddingBottom: 10, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>शिवमुद्रा व रक्षक संचलित....</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#7c2d12', fontFamily: 'serif', margin: '4px 0' }}>शिवरक्षक करिअर अकेंडमी</div>
              <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>बालिकाश्रम रोड न्यू आर्टस्कॉलेज गेट नंबर 5 गौरव स्पोट्स जवळ</div>
              <div style={{ fontSize: 11 }}>संचालक:- मेजर महाडिक सर &nbsp; मो:- 9284842177 &nbsp;&nbsp; संचालक:- मेजर पवार सर &nbsp; मो:- 9011887714</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#7c2d12' }}>मेन फी पावती / क्लासेस फी पावती</div>
              <div style={{ border: '2px solid #7c2d12', borderRadius: 8, padding: '8px 16px', textAlign: 'center', background: '#fffbeb', minWidth: 180 }}>
                <div style={{ fontSize: 10, color: '#78350f', fontWeight: 600, letterSpacing: 0.5 }}>प्रवेश अर्ज क्रमांक</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#7c2d12', fontFamily: 'monospace', letterSpacing: 2 }}>(Submit नंतर मिळेल)</div>
                <div style={{ fontSize: 9, color: '#92400e' }}>★ हा क्रमांक लक्षात ठेवा ★</div>
              </div>
            </div>

            <FieldLine label="विद्याथ्याचे नाव :-"><span style={{ fontWeight: 600 }}>{form.name}</span></FieldLine>
            <FieldLine label="पत्ता"><span>{form.address}</span></FieldLine>
            <FieldLine label="विद्याथ्याचा मो नंबर:-"><span>{form.phone}</span></FieldLine>
            <FieldLine label="कालावधी :-"><span>{form.duration}</span></FieldLine>
            <FieldLine label="एकूण रुपये:-">
              <span style={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>
                {form.total_fee ? `₹${Number(form.total_fee).toLocaleString('en-IN')}` : '—'}
              </span>
            </FieldLine>
            <FieldLine label="पैसे भरलेली तारीख :-">
              <span>{form.admission_date || new Date().toLocaleDateString('mr-IN')}</span>
            </FieldLine>

            {/* Documents summary */}
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, margin: '16px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#166534', marginBottom: 8 }}>📁 Upload झालेले Documents ({uploadedCount})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DOC_LIST.filter(d => docs[d.key]).map(d => (
                  <span key={d.key} style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {d.emoji} {d.label}
                  </span>
                ))}
                {uploadedCount === 0 && <span style={{ color: '#94a3b8', fontSize: 13 }}>कोणतेही documents upload केले नाहीत</span>}
              </div>
            </div>

            <div style={{ background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: 8, padding: '10px 16px', margin: '16px 0', textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
              ( टीप:- एकदा भरलेली फी वापस मिळणार नाही )
            </div>

            {!agreed && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
                ⚠️ संमतीपत्रात ✅ मंजूर करणे बाकी आहे — मागे जाऊन करा
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              {['पैसे भरणाऱ्या ची सही', 'शिवरक्षक करियर अकेंडमी'].map(lbl => (
                <div key={lbl} style={{ textAlign: 'center', width: 200 }}>
                  <div style={{ borderBottom: '1px solid #555', height: 40, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: 13, borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← मागे</button>
              <button onClick={handleSubmit} disabled={loading || !agreed}
                style={{ flex: 2, background: agreed ? '#16a34a' : '#94a3b8', color: 'white', border: 'none', padding: 13, borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: agreed ? 'pointer' : 'not-allowed' }}>
                {loading ? '⏳ Submit होत आहे...' : '✅ प्रवेश अर्ज Submit करा'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>

    {/* Hidden PrintableForm — always rendered off-screen for PDF capture */}
    <PrintableForm ref={formPdfRef} form={form} docs={docs} rollNumber={rollNumber || 'S-XX'} />

    </> /* end Fragment */
  )
}
