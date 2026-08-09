'use client'
import { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PrintableForm, { type FormValues } from './PrintableForm'

/* ═══════════════════════════════════════════
   शिवरक्षक करिअर अकॅडमी — Digital प्रवेश अर्ज
   Step 1: वैयक्तिक माहिती
   Step 2: कोर्स + फी + शारीरिक माहिती
   Step 3: कागदपत्रे व फोटो
   Step 4: तपासा व Submit → PDF print
   ═══════════════════════════════════════════ */

const COURSES: { key: string; label: string; fee: number }[] = [
  { key: 'police',  label: 'पोलीस भरती',      fee: 70000 },
  { key: 'army',    label: 'आर्मी / अग्निवीर', fee: 70000 },
  { key: 'navy',    label: 'नेव्ही',           fee: 70000 },
  { key: 'mpsc',    label: 'एम.पी.एस.सी',      fee: 70000 },
  { key: 'railway', label: 'रेल्वे भरती',      fee: 70000 },
  { key: 'staff',   label: 'स्टॉफ सिलेक्शन',   fee: 70000 },
  { key: 'saral',   label: 'सरळ सेवा',         fee: 70000 },
  { key: 'other',   label: 'इतर',              fee: 70000 },
]

const DOCS: { key: string; label: string; required: boolean }[] = [
  { key: 'photo',      label: 'पासपोर्ट फोटो',        required: true },
  { key: 'aadhaar',    label: 'आधार कार्ड',           required: true },
  { key: 'marksheet',  label: 'शाळा सोडल्याचा दाखला', required: false },
  { key: 'domicile',   label: 'रहिवासी दाखला',        required: false },
  { key: 'caste',      label: 'जात प्रमाणपत्र',       required: false },
  { key: 'parentId',   label: 'पालकाचे आधार कार्ड',   required: false },
]

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY: FormValues = {
  firstName: '', middleName: '', lastName: '',
  fatherFirst: '', fatherMiddle: '', fatherLast: '',
  address: '', village: '', taluka: '', district: 'अहमदनगर', pincode: '',
  studentPhone: '', studentWhatsapp: '', parentPhone: '', parentWhatsapp: '',
  email: '', aadhaar: '', guaranteeNo: '',
  dob: '', age: '', gender: 'male',
  courses: [],
  admissionDate: today(), durationMonths: '6', endDate: '', totalDays: '',
  height: '', weight: '', chest: '',
  totalFee: '', paidAmount: '', paymentDate: today(), paymentMode: 'cash',
}

export default function AdmissionPage() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormValues>(EMPTY)
  const [files, setFiles] = useState<Record<string, { file: File; preview: string }>>({})
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rollNumber, setRollNumber] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const printRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof FormValues, v: string | string[]) => setForm(p => ({ ...p, [k]: v }))

  /* ── Auto: DOB → age ── */
  const ageInfo = useMemo(() => {
    if (!form.dob) return null
    const b = new Date(form.dob), n = new Date()
    if (isNaN(b.getTime()) || b > n) return null
    let y = n.getFullYear() - b.getFullYear()
    let m = n.getMonth() - b.getMonth()
    let d = n.getDate() - b.getDate()
    if (d < 0) { m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate() }
    if (m < 0) { y--; m += 12 }
    const days = Math.floor((n.getTime() - b.getTime()) / 86400000)
    return { y, m, d, days }
  }, [form.dob])

  /* ── Auto: course → fee ── */
  const autoFee = useMemo(
    () => form.courses.reduce((s, k) => Math.max(s, COURSES.find(c => c.key === k)?.fee || 0), 0),
    [form.courses]
  )

  /* ── Auto: duration → end date + days ── */
  const durInfo = useMemo(() => {
    if (!form.admissionDate || !form.durationMonths) return null
    const s = new Date(form.admissionDate)
    if (isNaN(s.getTime())) return null
    const e = new Date(s); e.setMonth(e.getMonth() + Number(form.durationMonths))
    return { end: e.toISOString().slice(0, 10), days: Math.round((e.getTime() - s.getTime()) / 86400000) }
  }, [form.admissionDate, form.durationMonths])

  const finalForm: FormValues = {
    ...form,
    age: ageInfo ? String(ageInfo.y) : '',
    totalFee: form.totalFee || String(autoFee || ''),
    endDate: durInfo?.end || '',
    totalDays: durInfo ? String(durInfo.days) : '',
  }

  const studentName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ')

  /* ── Validation ── */
  const validate = (s: number): string[] => {
    const e: string[] = []
    if (s === 1) {
      if (!form.firstName.trim()) e.push('विद्यार्थ्याचे पहिले नाव आवश्यक')
      if (!form.lastName.trim()) e.push('आडनाव आवश्यक')
      if (!form.fatherFirst.trim()) e.push('वडिलांचे नाव आवश्यक')
      if (!/^\d{10}$/.test(form.studentPhone)) e.push('विद्यार्थ्याचा मोबाईल 10 अंकी हवा')
      if (!/^\d{10}$/.test(form.parentPhone)) e.push('पालकाचा मोबाईल 10 अंकी हवा')
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.push('ई-मेल चुकीचा आहे')
      if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar.replace(/\s/g, ''))) e.push('आधार 12 अंकी हवा')
      if (!form.dob) e.push('जन्म तारीख आवश्यक')
      if (!form.address.trim()) e.push('पत्ता आवश्यक')
    }
    if (s === 2 && form.courses.length === 0) e.push('किमान एक कोर्स निवडा')
    if (s === 3 && !files.photo) e.push('पासपोर्ट फोटो आवश्यक')
    return e
  }

  const next = () => {
    const e = validate(step)
    setErrors(e)
    if (e.length === 0) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }
  const back = () => { setErrors([]); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  /* ── File upload ── */
  const onFile = (key: string, file?: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors([`${file.name} — 5MB पेक्षा मोठी फाईल चालणार नाही`]); return }
    const reader = new FileReader()
    reader.onload = () => setFiles(p => ({ ...p, [key]: { file, preview: String(reader.result) } }))
    reader.readAsDataURL(file)
    setErrors([])
  }

  /* ── Submit ── */
  const submit = async () => {
    setSaving(true); setErrors([])
    let code = ''
    try {
      const r = await fetch('/api/next-admission-code')
      code = (await r.json()).code || ''
    } catch { /* offline */ }
    if (!code) code = `S-${String(Date.now()).slice(-4)}`
    setRollNumber(code)

    try {
      const { data, error } = await supabase.from('students').insert({
        roll_number: code,
        name: studentName,
        parent_name: [form.fatherFirst, form.fatherMiddle, form.fatherLast].filter(Boolean).join(' '),
        address: [form.address, form.village, form.taluka, form.district, form.pincode].filter(Boolean).join(', '),
        phone: form.studentPhone,
        parent_phone: form.parentPhone,
        aadhaar_no: form.aadhaar,
        guarantee_letter_no: form.guaranteeNo,
        dob: form.dob || null,
        course: form.courses.join(','),
        admission_date: form.admissionDate || null,
        duration: `${form.durationMonths} महिने`,
        age: ageInfo?.y ?? null,
        height: Number(form.height) || null,
        weight: Number(form.weight) || null,
        chest: Number(form.chest) || null,
        gender: form.gender,
        total_fee: Number(finalForm.totalFee) || 0,
      }).select('id').single()

      if (!error && data?.id) {
        for (const [key, v] of Object.entries(files)) {
          const ext = v.file.name.split('.').pop() || 'jpg'
          const path = `${data.id}/${key}.${ext}`
          await supabase.storage.from('student-documents').upload(path, v.file, { upsert: true })
        }
      }
    } catch { /* demo mode — form still prints */ }

    setSaving(false)
    setSubmitted(true)
    window.scrollTo({ top: 0 })
  }

  const doPrint = () => {
    const t = document.title
    document.title = `शिवरक्षक_प्रवेश_अर्ज_${studentName.replace(/\s+/g, '_')}_${rollNumber}`
    window.print()
    setTimeout(() => { document.title = t }, 900)
  }

  /* ══════════ SUCCESS SCREEN ══════════ */
  if (submitted) {
    return (
      <>
        <div className="adm-wrap no-print">
          <div className="adm-success">
            <div className="succ-icon">✅</div>
            <h1>प्रवेश अर्ज यशस्वी!</h1>
            <p className="succ-sub">तुमचा अर्ज नोंदवला गेला आहे</p>

            <div className="succ-code">
              <span>प्रवेश अर्ज क्रमांक</span>
              <strong>{rollNumber}</strong>
              <small>★ हा क्रमांक लक्षात ठेवा ★</small>
            </div>

            <div className="succ-info">
              <div><b>{studentName}</b></div>
              <div>{form.courses.map(k => COURSES.find(c => c.key === k)?.label).join(', ')}</div>
              <div>एकूण फी: <b>₹{Number(finalForm.totalFee).toLocaleString('en-IN')}</b></div>
            </div>

            <div className="succ-steps">
              <b>पुढे काय करायचे?</b>
              <ol>
                <li>खालील बटण दाबून <b>3 पानी अर्ज print</b> करा</li>
                <li>विद्यार्थी व पालकाची <b>सही</b> करा</li>
                <li>अकॅडमीत आणून <b>सरांची सही</b> घ्या</li>
              </ol>
            </div>

            <button className="btn-print" onClick={doPrint}>🖨️ अर्ज Print / PDF Download करा</button>
            <div className="succ-note">Print window मध्ये <b>&quot;Save as PDF&quot;</b> निवडा</div>

            <div className="succ-links">
              <Link href="/">🏠 मुख्यपृष्ठ</Link>
              <a href={`https://wa.me/917720991375?text=${encodeURIComponent(`नमस्कार, मी ${studentName} — प्रवेश अर्ज क्रमांक ${rollNumber} भरला आहे.`)}`} target="_blank" rel="noopener">💬 WhatsApp</a>
            </div>
          </div>
        </div>
        <PrintableForm ref={printRef} form={finalForm} photo={files.photo?.preview} rollNumber={rollNumber} />
        <FormStyles />
      </>
    )
  }

  /* ══════════ LANDING ══════════ */
  if (!started) {
    return (
      <>
        <div className="adm-land no-print">
          <div className="al-top">
            <Link href="/" className="adm-back">← मुख्यपृष्ठ</Link>
          </div>

          {/* Hero */}
          <div className="al-hero">
            <div className="al-badge">🇮🇳 शिवमुद्रा रजि. ५२७/ए &nbsp;•&nbsp; रक्षक रजि. ००००० १३२०२४</div>
            <h1>ऑनलाईन <span>प्रवेश अर्ज</span></h1>
            <p className="al-lead">
              शिवरक्षक करिअर अकॅडमी — पोलीस, आर्मी, नेव्ही व एम.पी.एस.सी. भरतीपूर्व प्रशिक्षण
            </p>
            <p className="al-sub">
              घरबसल्या फक्त <b>5 मिनिटांत</b> अर्ज भरा. लगेच प्रवेश क्रमांक मिळेल आणि
              <b> 3 पानी अर्ज PDF</b> डाउनलोड होईल — प्रिंट करून सरांची सही घ्या.
            </p>
            <button className="al-cta" onClick={() => setStarted(true)}>
              📋 अर्ज सुरू करा &nbsp;→
            </button>
            <div className="al-cta-note">कोणतेही शुल्क नाही • माहिती सुरक्षित राहील</div>
          </div>

          {/* How it works */}
          <div className="al-sec">
            <div className="al-sec-t"><span>प्रक्रिया</span>अर्ज कसा भरायचा?</div>
            <div className="al-steps">
              {[
                { n: '1', i: '👤', t: 'वैयक्तिक माहिती', d: 'नाव, पालकांचे नाव, पत्ता, मोबाईल, ई-मेल, आधार व जन्म तारीख भरा. वय आपोआप मोजले जाईल.' },
                { n: '2', i: '🎯', t: 'कोर्स व फी', d: 'हवा तो कोर्स निवडा — फी आपोआप दिसेल. कालावधी निवडल्यावर संपण्याची तारीख कळेल.' },
                { n: '3', i: '📎', t: 'कागदपत्रे', d: 'पासपोर्ट फोटो व आधार कार्ड अपलोड करा. इतर कागदपत्रे नंतरही देता येतील.' },
                { n: '4', i: '🖨️', t: 'प्रिंट करा', d: 'माहिती तपासून सबमिट करा. 3 पानी अर्ज PDF डाउनलोड करून प्रिंट काढा.' },
              ].map(s => (
                <div key={s.n} className="al-step">
                  <div className="al-step-n">{s.n}</div>
                  <div className="al-step-i">{s.i}</div>
                  <div className="al-step-t">{s.t}</div>
                  <div className="al-step-d">{s.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What you get */}
          <div className="al-sec">
            <div className="al-sec-t"><span>तुम्हाला काय मिळेल</span>3 पानी अर्ज</div>
            <div className="al-papers">
              {[
                { i: '📄', t: 'पान 1 — प्रवेश अर्ज', d: 'संपूर्ण माहिती, फोटो, निवडलेला कोर्स, वय-उंची-वजन-छाती आणि सह्यांची जागा' },
                { i: '📜', t: 'पान 2 — संमतीपत्र', d: 'अकॅडमीच्या सर्व 7 अटी व नियम, विद्यार्थी व पालकांच्या सहीसह' },
                { i: '🧾', t: 'पान 3 — फी पावती', d: 'मेन फी पावती / क्लासेस फी पावती — कालावधी, एकूण रक्कम व तारखेसह' },
              ].map(p => (
                <div key={p.t} className="al-paper">
                  <div className="al-paper-i">{p.i}</div>
                  <div>
                    <div className="al-paper-t">{p.t}</div>
                    <div className="al-paper-d">{p.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready checklist */}
          <div className="al-sec">
            <div className="al-sec-t"><span>तयारी</span>अर्ज भरण्याआधी हे जवळ ठेवा</div>
            <div className="al-check">
              {[
                ['📸', 'पासपोर्ट फोटो', 'अनिवार्य'],
                ['🆔', 'आधार कार्ड नंबर', 'अनिवार्य'],
                ['📱', 'विद्यार्थी व पालकांचा मोबाईल', 'अनिवार्य'],
                ['🎂', 'जन्म तारीख', 'अनिवार्य'],
                ['📧', 'ई-मेल आयडी', 'ऐच्छिक'],
                ['📄', 'शाळा सोडल्याचा दाखला', 'ऐच्छिक'],
              ].map(([i, t, r]) => (
                <div key={t} className={`al-chk ${r === 'अनिवार्य' ? 'req' : ''}`}>
                  <span className="al-chk-i">{i}</span>
                  <span className="al-chk-t">{t}</span>
                  <span className="al-chk-r">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courses + fee */}
          <div className="al-sec">
            <div className="al-sec-t"><span>कोर्सेस</span>उपलब्ध प्रशिक्षण</div>
            <div className="al-courses">
              {COURSES.map(c => (
                <div key={c.key} className="al-course">
                  <b>{c.label}</b>
                  <span>₹{c.fee.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="al-final">
            <h2>तयार आहात?</h2>
            <p>आजच अर्ज भरा आणि तुमच्या वर्दीच्या स्वप्नाकडे पहिले पाऊल टाका.</p>
            <button className="al-cta" onClick={() => setStarted(true)}>📋 अर्ज सुरू करा &nbsp;→</button>
            <div className="al-help">
              अडचण आल्यास संपर्क करा —
              <a href="tel:9284842177">📞 9284842177</a>
              <a href="https://wa.me/917720991375" target="_blank" rel="noopener">💬 WhatsApp</a>
            </div>
          </div>
        </div>
        <FormStyles />
      </>
    )
  }

  /* ══════════ FORM ══════════ */
  const STEPS = ['वैयक्तिक माहिती', 'कोर्स व फी', 'कागदपत्रे', 'तपासा']

  return (
    <>
      <div className="adm-wrap no-print">
        {/* Header */}
        <div className="adm-head">
          <Link href="/" className="adm-back">← परत</Link>
          <div className="adm-title">
            <div className="adm-t1">🛡️ शिवरक्षक करिअर अकॅडमी</div>
            <div className="adm-t2">ऑनलाईन प्रवेश अर्ज</div>
          </div>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`stp ${step === i + 1 ? 'on' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="stp-n">{step > i + 1 ? '✓' : i + 1}</div>
              <div className="stp-l">{s}</div>
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="err-box">
            {errors.map(e => <div key={e}>⚠️ {e}</div>)}
          </div>
        )}

        <div className="adm-card">

          {/* ── STEP 1 ── */}
          {step === 1 && <>
            <SecTitle icon="👤" title="विद्यार्थ्याचे नाव" />
            <Row3>
              <F label="पहिले नाव *" v={form.firstName} on={v => set('firstName', v)} ph="नवनाथ" />
              <F label="मधले नाव (वडिलांचे)" v={form.middleName} on={v => set('middleName', v)} ph="बाळासाहेब" />
              <F label="आडनाव *" v={form.lastName} on={v => set('lastName', v)} ph="जांगळे" />
            </Row3>

            <SecTitle icon="👨‍👦" title="पालकाचे (वडिलांचे) नाव" />
            <Row3>
              <F label="पहिले नाव *" v={form.fatherFirst} on={v => set('fatherFirst', v)} ph="बाळासाहेब" />
              <F label="मधले नाव" v={form.fatherMiddle} on={v => set('fatherMiddle', v)} ph="रामराव" />
              <F label="आडनाव" v={form.fatherLast} on={v => set('fatherLast', v)} ph="जांगळे" />
            </Row3>

            <SecTitle icon="📍" title="पत्ता" />
            <F label="संपूर्ण पत्ता *" v={form.address} on={v => set('address', v)} ph="घर क्र., गल्ली, भाग" area />
            <Row3>
              <F label="गाव" v={form.village} on={v => set('village', v)} />
              <F label="तालुका" v={form.taluka} on={v => set('taluka', v)} />
              <F label="जिल्हा" v={form.district} on={v => set('district', v)} />
            </Row3>
            <Row2>
              <F label="पिनकोड" v={form.pincode} on={v => set('pincode', v.replace(/\D/g, '').slice(0, 6))} ph="414001" num />
              <div>
                <label className="lbl">लिंग</label>
                <div className="radio-row">
                  {[['male', '👦 मुलगा'], ['female', '👧 मुलगी']].map(([v, l]) => (
                    <label key={v} className={`radio ${form.gender === v ? 'on' : ''}`}>
                      <input type="radio" checked={form.gender === v} onChange={() => set('gender', v)} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </Row2>

            <SecTitle icon="📱" title="संपर्क क्रमांक" />
            <Row2>
              <F label="विद्यार्थ्याचा मोबाईल *" v={form.studentPhone} on={v => set('studentPhone', v.replace(/\D/g, '').slice(0, 10))} ph="9876543210" num />
              <F label="विद्यार्थ्याचा WhatsApp" v={form.studentWhatsapp} on={v => set('studentWhatsapp', v.replace(/\D/g, '').slice(0, 10))} ph="वेगळा असल्यास" num />
            </Row2>
            <Row2>
              <F label="पालकाचा मोबाईल *" v={form.parentPhone} on={v => set('parentPhone', v.replace(/\D/g, '').slice(0, 10))} ph="9876543210" num />
              <F label="पालकाचा WhatsApp" v={form.parentWhatsapp} on={v => set('parentWhatsapp', v.replace(/\D/g, '').slice(0, 10))} ph="वेगळा असल्यास" num />
            </Row2>
            <F label="ई-मेल आयडी" v={form.email} on={v => set('email', v)} ph="name@gmail.com" type="email" />

            <SecTitle icon="🆔" title="ओळखपत्र व जन्म तारीख" />
            <Row2>
              <F label="आधार कार्ड नंबर" v={form.aadhaar} on={v => set('aadhaar', v.replace(/\D/g, '').slice(0, 12))} ph="12 अंकी" num />
              <F label="हमीपत्र नंबर" v={form.guaranteeNo} on={v => set('guaranteeNo', v)} />
            </Row2>
            <Row2>
              <F label="जन्म तारीख *" v={form.dob} on={v => set('dob', v)} type="date" />
              <div>
                <label className="lbl">वय (आपोआप)</label>
                <div className="auto-box">
                  {ageInfo
                    ? <><b>{ageInfo.y} वर्षे {ageInfo.m} महिने {ageInfo.d} दिवस</b><span>एकूण {ageInfo.days.toLocaleString('en-IN')} दिवस</span></>
                    : <span className="dim">जन्म तारीख टाका</span>}
                </div>
              </div>
            </Row2>
          </>}

          {/* ── STEP 2 ── */}
          {step === 2 && <>
            <SecTitle icon="🎯" title="कोर्स निवडा (एक किंवा अधिक)" />
            <div className="course-grid">
              {COURSES.map(c => {
                const on = form.courses.includes(c.key)
                return (
                  <label key={c.key} className={`course-chk ${on ? 'on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => {
                      set('courses', on ? form.courses.filter(k => k !== c.key) : [...form.courses, c.key])
                    }} />
                    <span className="cc-box">{on ? '✓' : ''}</span>
                    <span className="cc-lbl">{c.label}</span>
                    <span className="cc-fee">₹{c.fee.toLocaleString('en-IN')}</span>
                  </label>
                )
              })}
            </div>

            {form.courses.length > 0 && (
              <div className="fee-banner">
                <div>
                  <span>निवडलेले कोर्स</span>
                  <b>{form.courses.map(k => COURSES.find(c => c.key === k)?.label).join(' + ')}</b>
                </div>
                <div className="fee-amt">
                  <span>एकूण फी</span>
                  <b>₹{autoFee.toLocaleString('en-IN')}</b>
                </div>
              </div>
            )}

            <SecTitle icon="📅" title="प्रवेश कालावधी" />
            <Row2>
              <F label="प्रवेश घेण्याची तारीख" v={form.admissionDate} on={v => set('admissionDate', v)} type="date" />
              <div>
                <label className="lbl">कालावधी</label>
                <select className="inp" value={form.durationMonths} onChange={e => set('durationMonths', e.target.value)}>
                  {['3', '6', '9', '12', '18', '24'].map(m => <option key={m} value={m}>{m} महिने</option>)}
                </select>
              </div>
            </Row2>
            {durInfo && (
              <div className="auto-strip">
                📆 कोर्स संपण्याची तारीख: <b>{new Date(durInfo.end).toLocaleDateString('mr-IN')}</b>
                &nbsp;•&nbsp; एकूण <b>{durInfo.days} दिवस</b>
              </div>
            )}

            <SecTitle icon="💪" title="शारीरिक माहिती" />
            <Row3>
              <F label="उंची (सेमी)" v={form.height} on={v => set('height', v)} ph="170" num />
              <F label="वजन (किलो)" v={form.weight} on={v => set('weight', v)} ph="60" num />
              <F label="छाती (सेमी)" v={form.chest} on={v => set('chest', v)} ph="80" num />
            </Row3>

            <SecTitle icon="💰" title="फी भरणा" />
            <Row3>
              <F label="एकूण फी (₹)" v={finalForm.totalFee} on={v => set('totalFee', v)} num />
              <F label="आज भरलेली रक्कम (₹)" v={form.paidAmount} on={v => set('paidAmount', v)} ph="0" num />
              <F label="पैसे भरलेली तारीख" v={form.paymentDate} on={v => set('paymentDate', v)} type="date" />
            </Row3>
          </>}

          {/* ── STEP 3 ── */}
          {step === 3 && <>
            <SecTitle icon="📎" title="कागदपत्रे व फोटो अपलोड करा" />
            <div className="doc-hint">फोटो अनिवार्य आहे. इतर कागदपत्रे नंतरही देता येतील. (प्रत्येक फाईल 5MB पर्यंत)</div>
            <div className="doc-grid">
              {DOCS.map(d => {
                const up = files[d.key]
                return (
                  <label key={d.key} className={`doc-card ${up ? 'on' : ''}`}>
                    <input type="file" accept={d.key === 'photo' ? 'image/*' : 'image/*,application/pdf'} hidden
                      onChange={e => onFile(d.key, e.target.files?.[0])} />
                    <div className="doc-prev">
                      {up
                        ? (up.file.type.includes('pdf') ? <div className="doc-pdf">📄 PDF</div> : <img src={up.preview} alt="" />)
                        : <div className="doc-plus">＋</div>}
                    </div>
                    <div className="doc-name">{d.label}{d.required && <span className="req"> *</span>}</div>
                    <div className="doc-status">{up ? '✅ अपलोड झाले' : 'क्लिक करा'}</div>
                  </label>
                )
              })}
            </div>
          </>}

          {/* ── STEP 4 ── */}
          {step === 4 && <>
            <SecTitle icon="🔍" title="माहिती तपासा" />
            <div className="review">
              <RevRow k="विद्यार्थ्याचे नाव" v={studentName} />
              <RevRow k="पालकाचे नाव" v={[form.fatherFirst, form.fatherMiddle, form.fatherLast].filter(Boolean).join(' ')} />
              <RevRow k="पत्ता" v={[form.address, form.village, form.taluka, form.district, form.pincode].filter(Boolean).join(', ')} />
              <RevRow k="विद्यार्थी मोबाईल" v={form.studentPhone} />
              <RevRow k="पालक मोबाईल" v={form.parentPhone} />
              <RevRow k="ई-मेल" v={form.email || '—'} />
              <RevRow k="आधार" v={form.aadhaar || '—'} />
              <RevRow k="जन्म तारीख" v={form.dob ? new Date(form.dob).toLocaleDateString('mr-IN') : '—'} />
              <RevRow k="वय" v={ageInfo ? `${ageInfo.y} वर्षे ${ageInfo.m} महिने ${ageInfo.d} दिवस` : '—'} />
              <RevRow k="कोर्स" v={form.courses.map(k => COURSES.find(c => c.key === k)?.label).join(', ') || '—'} />
              <RevRow k="कालावधी" v={`${form.durationMonths} महिने${durInfo ? ` (${durInfo.days} दिवस)` : ''}`} />
              <RevRow k="एकूण फी" v={`₹${Number(finalForm.totalFee || 0).toLocaleString('en-IN')}`} hi />
              <RevRow k="कागदपत्रे" v={`${Object.keys(files).length} फाईल्स`} />
            </div>

            <div className="declare">
              <b>घोषणा</b>
              <p>वरील सर्व माहिती खरी असून, अकॅडमीचे सर्व नियम व अटी मला व माझ्या पालकांना मंजूर आहेत. त्यांचे पालन केले जाईल.</p>
            </div>
          </>}

          {/* Nav buttons */}
          <div className="nav-btns">
            {step > 1 && <button className="b-ghost" onClick={back}>← मागे</button>}
            {step < 4
              ? <button className="b-main" onClick={next}>पुढे →</button>
              : <button className="b-main b-sub" onClick={submit} disabled={saving}>
                  {saving ? '⏳ जतन करत आहे...' : '✅ अर्ज सबमिट करा'}
                </button>}
          </div>
        </div>
      </div>

      <PrintableForm ref={printRef} form={finalForm} photo={files.photo?.preview} rollNumber={rollNumber || 'S-XX'} />
      <FormStyles />
    </>
  )
}

/* ═══════ small components ═══════ */

function SecTitle({ icon, title }: { icon: string; title: string }) {
  return <div className="sec-title"><span>{icon}</span>{title}</div>
}
function Row2({ children }: { children: React.ReactNode }) { return <div className="row2">{children}</div> }
function Row3({ children }: { children: React.ReactNode }) { return <div className="row3">{children}</div> }

function F({ label, v, on, ph, type = 'text', area, num }: {
  label: string; v: string; on: (v: string) => void; ph?: string; type?: string; area?: boolean; num?: boolean
}) {
  return (
    <div>
      <label className="lbl">{label}</label>
      {area
        ? <textarea className="inp" rows={2} value={v} placeholder={ph} onChange={e => on(e.target.value)} />
        : <input className="inp" type={type} value={v} placeholder={ph}
            inputMode={num ? 'numeric' : undefined}
            onChange={e => on(e.target.value)} />}
    </div>
  )
}

function RevRow({ k, v, hi }: { k: string; v: string; hi?: boolean }) {
  return <div className={`rev-row ${hi ? 'hi' : ''}`}><span>{k}</span><b>{v}</b></div>
}

/* ═══════ styles ═══════ */

function FormStyles() {
  return <style dangerouslySetInnerHTML={{ __html: `
/* ═══ LANDING ═══ */
.adm-land { min-height:100vh; background:#0a1628; color:#f1f5f9; padding-bottom:70px; font-family:'Segoe UI',system-ui,'Noto Sans Devanagari',sans-serif; }
.al-top { padding:16px 22px; }
.al-hero { max-width:760px; margin:0 auto; padding:36px 22px 60px; text-align:center;
  background:radial-gradient(ellipse 80% 70% at 50% 0%, rgba(249,115,22,.1) 0%, transparent 70%); }
.al-badge { display:inline-block; background:rgba(249,115,22,.08); border:1px solid rgba(249,115,22,.22); color:#f97316; padding:7px 18px; border-radius:100px; font-size:11.5px; font-weight:700; letter-spacing:.4px; margin-bottom:26px; }
.al-hero h1 { font-size:52px; font-weight:900; margin:0 0 18px; letter-spacing:-1.6px; line-height:1.08; color:#fff; }
.al-hero h1 span { display:block; background:linear-gradient(120deg,#f97316,#fbbf24 60%,#f97316); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.al-lead { font-size:17px; color:#cbd5e1; margin:0 0 14px; line-height:1.65; font-weight:600; }
.al-sub { font-size:14.5px; color:#94a3b8; margin:0 0 34px; line-height:1.85; max-width:560px; margin-left:auto; margin-right:auto; }
.al-sub b { color:#fbbf24; }
.al-cta { display:inline-flex; align-items:center; padding:18px 44px; background:linear-gradient(135deg,#f97316,#c2410c); border:none; border-radius:12px; color:#fff; font-weight:800; font-size:17px; cursor:pointer; box-shadow:0 10px 34px rgba(249,115,22,.42); font-family:inherit; transition:transform .15s,box-shadow .15s; }
.al-cta:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(249,115,22,.5); }
.al-cta-note { font-size:12px; color:#475569; margin-top:14px; }

.al-sec { max-width:1020px; margin:0 auto 56px; padding:0 22px; }
.al-sec-t { text-align:center; font-size:29px; font-weight:800; color:#fff; margin-bottom:32px; letter-spacing:-.6px; }
.al-sec-t span { display:block; font-size:11px; font-weight:800; color:#f97316; letter-spacing:1.8px; margin-bottom:10px; }

.al-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); gap:15px; }
.al-step { position:relative; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:15px; padding:26px 20px 22px; }
.al-step-n { position:absolute; top:-13px; left:20px; width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#f97316,#c2410c); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; box-shadow:0 4px 14px rgba(249,115,22,.4); }
.al-step-i { font-size:32px; margin:8px 0 12px; }
.al-step-t { font-weight:800; font-size:15.5px; color:#f1f5f9; margin-bottom:8px; }
.al-step-d { font-size:13px; color:#64748b; line-height:1.75; }

.al-papers { display:flex; flex-direction:column; gap:12px; }
.al-paper { display:flex; gap:17px; align-items:flex-start; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:20px 22px; }
.al-paper-i { font-size:30px; flex-shrink:0; }
.al-paper-t { font-weight:800; font-size:15.5px; color:#fbbf24; margin-bottom:5px; }
.al-paper-d { font-size:13.5px; color:#64748b; line-height:1.7; }

.al-check { display:grid; grid-template-columns:repeat(auto-fit,minmax(255px,1fr)); gap:11px; }
.al-chk { display:flex; align-items:center; gap:13px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:11px; padding:15px 18px; }
.al-chk.req { border-color:rgba(249,115,22,.22); background:rgba(249,115,22,.05); }
.al-chk-i { font-size:20px; }
.al-chk-t { flex:1; font-size:14px; font-weight:600; color:#e2e8f0; }
.al-chk-r { font-size:10.5px; font-weight:800; color:#475569; padding:3px 10px; border-radius:100px; background:rgba(255,255,255,.05); white-space:nowrap; }
.al-chk.req .al-chk-r { color:#f97316; background:rgba(249,115,22,.12); }

.al-courses { display:grid; grid-template-columns:repeat(auto-fill,minmax(215px,1fr)); gap:11px; }
.al-course { display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:11px; padding:16px 18px; }
.al-course b { font-size:14.5px; color:#e2e8f0; font-weight:700; }
.al-course span { font-size:13px; color:#fbbf24; font-weight:800; }

.al-final { max-width:640px; margin:0 auto; padding:48px 26px; text-align:center; background:linear-gradient(135deg,rgba(249,115,22,.09),rgba(220,38,38,.06)); border:1px solid rgba(249,115,22,.2); border-radius:20px; }
.al-final h2 { font-size:31px; font-weight:900; color:#fff; margin:0 0 10px; letter-spacing:-.7px; }
.al-final p { color:#94a3b8; font-size:14.5px; margin:0 0 28px; line-height:1.7; }
.al-help { margin-top:24px; font-size:13px; color:#475569; display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; }
.al-help a { color:#f97316; text-decoration:none; font-weight:700; }

@media (max-width:640px) {
  .al-hero { padding:24px 18px 44px; }
  .al-hero h1 { font-size:34px; letter-spacing:-1px; }
  .al-lead { font-size:15px; }
  .al-sub { font-size:13.5px; }
  .al-cta { width:100%; justify-content:center; padding:17px 24px; font-size:16px; }
  .al-sec { margin-bottom:42px; padding:0 16px; }
  .al-sec-t { font-size:23px; margin-bottom:26px; }
  .al-steps, .al-check, .al-courses { grid-template-columns:1fr; }
  .al-final { margin:0 16px; padding:34px 20px; border-radius:16px; }
  .al-final h2 { font-size:25px; }
  .al-help { flex-direction:column; gap:9px; }
}

.adm-wrap { min-height:100vh; background:linear-gradient(180deg,#0a1628 0%,#0f2038 100%); padding:0 0 60px; font-family:'Segoe UI',system-ui,'Noto Sans Devanagari',sans-serif; }
.adm-head { display:flex; align-items:center; gap:16px; padding:18px 22px; background:rgba(0,0,0,.28); border-bottom:1px solid rgba(249,115,22,.2); position:sticky; top:0; z-index:50; backdrop-filter:blur(12px); }
.adm-back { color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; padding:8px 14px; border:1px solid rgba(255,255,255,.1); border-radius:8px; white-space:nowrap; }
.adm-t1 { color:#fff; font-weight:800; font-size:16px; }
.adm-t2 { color:#f97316; font-size:12px; font-weight:700; letter-spacing:.5px; margin-top:2px; }

.stepper { display:flex; max-width:880px; margin:26px auto 20px; padding:0 18px; gap:6px; }
.stp { flex:1; text-align:center; }
.stp-n { width:38px; height:38px; margin:0 auto 7px; border-radius:50%; background:rgba(255,255,255,.06); border:2px solid rgba(255,255,255,.12); color:#64748b; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; }
.stp.on .stp-n { background:linear-gradient(135deg,#f97316,#c2410c); border-color:#f97316; color:#fff; box-shadow:0 0 18px rgba(249,115,22,.5); }
.stp.done .stp-n { background:#16a34a; border-color:#16a34a; color:#fff; }
.stp-l { font-size:11.5px; color:#64748b; font-weight:600; }
.stp.on .stp-l { color:#f97316; }
.stp.done .stp-l { color:#4ade80; }

.err-box { max-width:880px; margin:0 auto 16px; padding:14px 18px; background:rgba(220,38,38,.12); border:1px solid rgba(220,38,38,.35); border-radius:11px; color:#fca5a5; font-size:13.5px; line-height:1.9; }

.adm-card { max-width:880px; margin:0 auto; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:30px 28px; }

.sec-title { display:flex; align-items:center; gap:9px; font-size:15px; font-weight:800; color:#f97316; margin:26px 0 15px; padding-bottom:9px; border-bottom:1px solid rgba(249,115,22,.18); }
.sec-title:first-child { margin-top:0; }
.sec-title span { font-size:18px; }

.row2 { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
.row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; }

.lbl { display:block; font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:6px; }
.inp { width:100%; padding:12px 13px; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.1); border-radius:9px; color:#f1f5f9; font-size:15px; outline:none; font-family:inherit; transition:.15s; margin-bottom:15px; }
.inp:focus { border-color:#f97316; background:rgba(249,115,22,.06); }
.inp::placeholder { color:#475569; }
select.inp option { background:#0f2038; color:#f1f5f9; }

.radio-row { display:flex; gap:10px; margin-bottom:15px; }
.radio { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:12px; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.1); border-radius:9px; cursor:pointer; font-size:14px; color:#cbd5e1; font-weight:600; }
.radio.on { border-color:#f97316; background:rgba(249,115,22,.12); color:#f97316; }
.radio input { display:none; }

.auto-box { padding:11px 13px; background:rgba(34,197,94,.08); border:1.5px solid rgba(34,197,94,.25); border-radius:9px; margin-bottom:15px; min-height:47px; display:flex; flex-direction:column; justify-content:center; }
.auto-box b { color:#4ade80; font-size:14.5px; }
.auto-box span { color:#64748b; font-size:11.5px; margin-top:2px; }
.auto-box .dim { color:#475569; font-size:13px; }
.auto-strip { padding:12px 16px; background:rgba(59,130,246,.09); border:1px solid rgba(59,130,246,.25); border-radius:9px; color:#93c5fd; font-size:13.5px; margin-bottom:8px; }
.auto-strip b { color:#dbeafe; }

.course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:11px; }
.course-chk { display:flex; align-items:center; gap:11px; padding:14px 15px; background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.09); border-radius:11px; cursor:pointer; transition:.15s; }
.course-chk:hover { border-color:rgba(249,115,22,.35); }
.course-chk.on { border-color:#f97316; background:rgba(249,115,22,.1); }
.course-chk input { display:none; }
.cc-box { width:24px; height:24px; border:2px solid rgba(255,255,255,.25); border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; color:#fff; flex-shrink:0; }
.course-chk.on .cc-box { background:#f97316; border-color:#f97316; }
.cc-lbl { flex:1; font-size:14.5px; font-weight:700; color:#e2e8f0; }
.cc-fee { font-size:12px; color:#64748b; font-weight:700; }
.course-chk.on .cc-fee { color:#fbbf24; }

.fee-banner { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-top:16px; padding:18px 22px; background:linear-gradient(135deg,rgba(249,115,22,.14),rgba(220,38,38,.1)); border:1.5px solid rgba(249,115,22,.3); border-radius:13px; flex-wrap:wrap; }
.fee-banner span { display:block; font-size:11.5px; color:#94a3b8; font-weight:600; margin-bottom:4px; }
.fee-banner b { color:#f1f5f9; font-size:15px; }
.fee-amt { text-align:right; }
.fee-amt b { font-size:30px; color:#fbbf24; font-weight:900; }

.doc-hint { font-size:13px; color:#64748b; margin-bottom:16px; line-height:1.7; }
.doc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(155px,1fr)); gap:13px; }
.doc-card { background:rgba(255,255,255,.03); border:1.5px dashed rgba(255,255,255,.16); border-radius:13px; padding:14px 11px; text-align:center; cursor:pointer; transition:.15s; }
.doc-card:hover { border-color:#f97316; }
.doc-card.on { border-style:solid; border-color:#22c55e; background:rgba(34,197,94,.07); }
.doc-prev { height:96px; border-radius:9px; overflow:hidden; background:rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
.doc-prev img { width:100%; height:100%; object-fit:cover; }
.doc-plus { font-size:34px; color:#334155; font-weight:300; }
.doc-pdf { font-size:15px; color:#f97316; font-weight:700; }
.doc-name { font-size:12.5px; font-weight:700; color:#e2e8f0; line-height:1.4; }
.doc-name .req { color:#f87171; }
.doc-status { font-size:10.5px; color:#64748b; margin-top:4px; }
.doc-card.on .doc-status { color:#4ade80; }

.review { display:flex; flex-direction:column; gap:1px; background:rgba(255,255,255,.06); border-radius:11px; overflow:hidden; }
.rev-row { display:flex; justify-content:space-between; gap:16px; padding:13px 17px; background:#0f2038; font-size:14px; }
.rev-row span { color:#64748b; flex-shrink:0; }
.rev-row b { color:#e2e8f0; text-align:right; font-weight:600; }
.rev-row.hi { background:rgba(249,115,22,.1); }
.rev-row.hi b { color:#fbbf24; font-size:17px; font-weight:900; }

.declare { margin-top:20px; padding:17px 19px; background:rgba(59,130,246,.07); border:1px solid rgba(59,130,246,.2); border-radius:11px; }
.declare b { color:#93c5fd; font-size:14px; }
.declare p { color:#94a3b8; font-size:13px; line-height:1.8; margin:7px 0 0; }

.nav-btns { display:flex; gap:12px; margin-top:30px; padding-top:22px; border-top:1px solid rgba(255,255,255,.07); }
.b-ghost { padding:15px 26px; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.12); border-radius:10px; color:#cbd5e1; font-weight:700; font-size:15px; cursor:pointer; font-family:inherit; }
.b-main { flex:1; padding:15px 26px; background:linear-gradient(135deg,#f97316,#c2410c); border:none; border-radius:10px; color:#fff; font-weight:800; font-size:16px; cursor:pointer; box-shadow:0 6px 22px rgba(249,115,22,.35); font-family:inherit; }
.b-main:disabled { opacity:.6; cursor:wait; }
.b-sub { background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 6px 22px rgba(22,163,74,.35); }

.adm-success { max-width:560px; margin:40px auto; padding:36px 30px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.09); border-radius:20px; text-align:center; }
.succ-icon { font-size:60px; margin-bottom:8px; }
.adm-success h1 { color:#4ade80; font-size:27px; font-weight:900; margin:0 0 6px; }
.succ-sub { color:#64748b; font-size:14px; margin:0 0 24px; }
.succ-code { background:linear-gradient(135deg,#c2410c,#7c2d12); border-radius:15px; padding:22px; margin-bottom:18px; }
.succ-code span { display:block; font-size:11.5px; color:#fbbf24; font-weight:700; letter-spacing:1.5px; margin-bottom:6px; }
.succ-code strong { display:block; font-size:46px; font-weight:900; color:#fff; letter-spacing:5px; font-family:monospace; }
.succ-code small { display:block; font-size:11px; color:#fed7aa; margin-top:7px; }
.succ-info { background:rgba(255,255,255,.04); border-radius:11px; padding:15px; margin-bottom:18px; color:#cbd5e1; font-size:13.5px; line-height:2; }
.succ-info b { color:#f1f5f9; }
.succ-steps { text-align:left; background:rgba(59,130,246,.07); border:1px solid rgba(59,130,246,.2); border-radius:11px; padding:16px 18px; margin-bottom:20px; }
.succ-steps b { color:#93c5fd; font-size:13.5px; }
.succ-steps ol { margin:9px 0 0; padding-left:20px; color:#94a3b8; font-size:13px; line-height:2; }
.succ-steps ol b { color:#e2e8f0; }
.btn-print { width:100%; padding:17px; background:linear-gradient(135deg,#f97316,#c2410c); border:none; border-radius:11px; color:#fff; font-weight:800; font-size:16px; cursor:pointer; box-shadow:0 6px 24px rgba(249,115,22,.4); font-family:inherit; }
.succ-note { font-size:12px; color:#64748b; margin-top:10px; }
.succ-links { display:flex; gap:11px; margin-top:22px; }
.succ-links a { flex:1; padding:13px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:9px; color:#cbd5e1; text-decoration:none; font-size:14px; font-weight:600; }

@media (max-width:700px) {
  .adm-card { padding:22px 16px; border-radius:14px; margin:0 12px; }
  .row2, .row3 { grid-template-columns:1fr; gap:0; }
  .stepper { padding:0 10px; }
  .stp-l { font-size:9.5px; }
  .stp-n { width:32px; height:32px; font-size:13px; }
  .course-grid { grid-template-columns:1fr; }
  .doc-grid { grid-template-columns:repeat(2,1fr); }
  .fee-banner { flex-direction:column; align-items:flex-start; }
  .fee-amt { text-align:left; }
  .nav-btns { flex-direction:column-reverse; }
  .b-ghost, .b-main { width:100%; }
  .rev-row { flex-direction:column; gap:3px; }
  .rev-row b { text-align:left; }
  .adm-success { margin:20px 12px; padding:28px 20px; }
  .succ-code strong { font-size:36px; letter-spacing:3px; }
  .adm-t1 { font-size:14px; }
}
  ` }} />
}

