'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import type { FormValues } from './PrintableForm'

/* ═══════════════════════════════════════════
   शिवरक्षक करिअर अकॅडमी — Digital प्रवेश अर्ज
   Step 1: वैयक्तिक माहिती
   Step 2: कोर्स + शारीरिक माहिती
   Step 3: कागदपत्रे व फोटो
   Step 4: तपासा व Admin approval साठी Submit
   ═══════════════════════════════════════════ */

const COURSES: { key: string; label: string }[] = [
  { key: 'police',  label: 'पोलीस भरती' },
  { key: 'army',    label: 'आर्मी / अग्निवीर' },
  { key: 'navy',    label: 'नेव्ही' },
  { key: 'mpsc',    label: 'एम.पी.एस.सी' },
  { key: 'railway', label: 'रेल्वे भरती' },
  { key: 'staff',   label: 'स्टॉफ सिलेक्शन' },
  { key: 'saral',   label: 'सरळ सेवा' },
  { key: 'other',   label: 'इतर' },
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

const COURSE_API_KEYS: Record<string, string> = {
  staff: 'staff_selection',
  saral: 'saral_seva',
}

const DOCUMENT_API_KEYS: Record<string, string> = {
  marksheet: 'school_leaving',
  parentId: 'parent_aadhaar',
}

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

async function compressImage(file: File): Promise<File> {
  if (file.type === 'application/pdf') return file
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (ev) => {
      const img = new Image()
      img.src = ev.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 1200
        const maxH = 1200
        let w = img.width
        let h = img.height
        if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW }
        if (h > maxH) { w = Math.round((w * maxH) / h); h = maxH }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas is empty'))
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }))
        }, 'image/jpeg', 0.8)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

export default function AdmissionPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormValues>(EMPTY)
  const [files, setFiles] = useState<Record<string, { file: File; preview: string }>>({})
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [studentPassword, setStudentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
    totalFee: '',
    paidAmount: '',
    paymentDate: '',
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
      if (studentPassword.length < 8 || !/[A-Za-z]/.test(studentPassword) || !/\d/.test(studentPassword) || !/[^A-Za-z0-9]/.test(studentPassword)) {
        e.push('Exam login password किमान 8 अक्षरांचा आणि त्यात अक्षर, अंक व विशेष चिन्ह असावे')
      }
      if (studentPassword !== confirmPassword) e.push('Password आणि Confirm Password जुळत नाहीत')
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
  const onFile = async (key: string, file?: File) => {
    if (!file) return
    if (file.type.includes('pdf')) {
      if (file.size > 5 * 1024 * 1024) { setErrors([`${file.name} — PDF फाईल 5MB पेक्षा मोठी चालणार नाही`]); return }
      setFiles(p => ({ ...p, [key]: { file, preview: '' } }))
      setErrors([])
      return
    }
    try {
      const compressed = await compressImage(file)
      const reader = new FileReader()
      reader.onload = () => setFiles(p => ({ ...p, [key]: { file: compressed, preview: String(reader.result) } }))
      reader.readAsDataURL(compressed)
      setErrors([])
    } catch (err) {
      setErrors(['फोटो प्रोसेस करता आला नाही. कृपया दुसरा फोटो निवडा.'])
    }
  }

  /* ── Submit ── */
  const submit = async () => {
    setSaving(true); setErrors([])
    try {
      const payload = new globalThis.FormData()
      const primaryCourse = COURSE_API_KEYS[form.courses[0]] || form.courses[0] || 'other'
      const parentName = [form.fatherFirst, form.fatherMiddle, form.fatherLast].filter(Boolean).join(' ')
      const fullAddress = [form.address, form.village, form.taluka, form.district, form.pincode].filter(Boolean).join(', ')
      const admissionDetails = { ...finalForm, aadhaar: form.aadhaar.replace(/\s/g, '') }

      const values: Record<string, string> = {
        name: studentName,
        parent_name: parentName,
        address: fullAddress,
        phone: form.studentPhone,
        parent_phone: form.parentPhone,
        aadhaar_no: form.aadhaar.replace(/\s/g, ''),
        guarantee_letter_no: form.guaranteeNo,
        dob: form.dob,
        gender: form.gender,
        course: primaryCourse,
        admission_date: form.admissionDate,
        duration: `${form.durationMonths} महिने`,
        age: finalForm.age,
        height: form.height,
        weight: form.weight,
        chest: form.chest,
        admission_details: JSON.stringify(admissionDetails),
        student_password: studentPassword,
        password_confirmation: confirmPassword,
        agreed: 'true',
      }
      Object.entries(values).forEach(([key, value]) => payload.append(key, value))
      Object.entries(files).forEach(([key, value]) => {
        payload.append(`document:${DOCUMENT_API_KEYS[key] || key}`, value.file)
      })

      const response = await fetch('/api/admissions', { method: 'POST', body: payload })
      let result: { submitted?: boolean; error?: string } = {}
      let errorText = ''
      try {
        const cloned = response.clone()
        errorText = await cloned.text()
        result = JSON.parse(errorText)
      } catch (err) {
        console.error('Failed to parse API response as JSON', errorText)
      }

      if (!response.ok || !result.submitted) {
        if (response.status === 413) throw new Error('फॉर्म मधील फाईलची साईझ खूप मोठी आहे. कृपया लहान फोटो अपलोड करा. (Error 413)')
        if (response.status === 504) throw new Error('सर्व्हरला खूप वेळ लागत आहे (Timeout). कृपया पुन्हा प्रयत्न करा. (Error 504)')
        if (response.status >= 500) throw new Error(`सर्व्हर एरर (${response.status}). कृपया पुन्हा प्रयत्न करा.`)

        const message = response.status === 429
          ? 'खूप वेळा अर्ज submit करण्याचा प्रयत्न झाला. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
          : result.error || `Error ${response.status}: सर्व्हरने फॉर्म नाकारला.`
        throw new Error(message)
      }

      setSubmitted(true)
      setFiles({})
      setStudentPassword('')
      setConfirmPassword('')
      window.scrollTo({ top: 0 })
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'अर्ज submit झाला नाही. कृपया पुन्हा प्रयत्न करा.'])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  /* ══════════ SUCCESS SCREEN ══════════ */
  if (submitted) {
    return (
      <div className="sra">
        <div className="adm-wrap no-print">
          <div className="adm-success">
            <div className="succ-icon">✅</div>
            <h1>तुमचा फॉर्म यशस्वीपणे Submit झाला आहे!</h1>
            <p className="succ-sub">तुमचा अर्ज Admin approval साठी पाठवला आहे.</p>

            <div className="succ-info">
              <div><b>{studentName}</b></div>
              <div>{form.courses.map(k => COURSES.find(c => c.key === k)?.label).join(', ')}</div>
            </div>

            <div className="succ-steps">
              <b>पुढील प्रक्रिया</b>
              <ol>
                <li>पुढील प्रक्रियेसाठी <b>अकॅडमी / Admin Panel शी संपर्क करा</b>.</li>
                <li>Admin तुमचा अर्ज तपासून approve करेल.</li>
                <li>Fee भरल्यानंतरच तुमचा <b>Student Code</b> आणि <b>3 पानी Form Print/PDF</b> तयार होईल.</li>
                <li>Code आणि Form link तुमच्या ई-मेल व WhatsApp वर पाठवली जाईल.</li>
              </ol>
            </div>

            <div className="succ-links">
              <Link href="/">🏠 मुख्यपृष्ठ</Link>
              <a href={`https://wa.me/919284842177?text=${encodeURIComponent(`नमस्कार, मी ${studentName}. माझा प्रवेश अर्ज submit झाला आहे. पुढील प्रक्रियेसाठी संपर्क करत आहे.`)}`} target="_blank" rel="noopener">💬 अकॅडमीशी संपर्क</a>
            </div>
          </div>
        </div>
        <FormStyles />
      </div>
    )
  }

  /* ══════════ FORM ══════════ */
  const STEPS = ['वैयक्तिक माहिती', 'कोर्स', 'कागदपत्रे', 'तपासा']

  return (
    <div className="sra">
      <div className="adm-wrap no-print">
        <header className="adm-head">
          <Link href="/" className="adm-brand" aria-label="मुख्यपृष्ठावर जा">
            <NextImage src="/images/logo/academy-logo.png" alt="शिवरक्षक करिअर अकॅडमी" width={62} height={62} priority />
            <span>
              <b>शिवरक्षक करिअर अकॅडमी</b>
              <small>अहिल्यानगर • माजी सैनिकांद्वारे संचलित</small>
            </span>
          </Link>
          <Link href="/" className="adm-back">← मुख्यपृष्ठ</Link>
        </header>

        <section className="adm-intro">
          <div className="adm-intro-copy">
            <span className="adm-kicker">प्रवेश प्रक्रिया २०२६–२७</span>
            <h1>ऑनलाईन प्रवेश अर्ज</h1>
            <p>तुमच्या वर्दीच्या स्वप्नाकडे पहिले पाऊल — चार सोप्या टप्प्यांत अर्ज पूर्ण करा.</p>
          </div>
          <div className="adm-help-card">
            <b>अर्ज भरण्यापूर्वी</b>
            <span>मोबाईल क्रमांक, जन्मतारीख आणि पासपोर्ट फोटो जवळ ठेवा.</span>
            <small><strong>*</strong> असलेली माहिती भरणे आवश्यक आहे.</small>
          </div>
        </section>

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
          <div className="form-stage-title">
            <span>टप्पा {step} / 4</span>
            <div>
              <b>{STEPS[step - 1]}</b>
              <small>माहिती मराठी किंवा इंग्रजीमध्ये भरू शकता.</small>
            </div>
          </div>

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

            <SecTitle icon="🔐" title="Online परीक्षा Login" />
            <p className="login-help">अर्ज पूर्ण झाल्यावर मिळणारा विद्यार्थी ID आणि हा password वापरून mobileवर परीक्षा देता येईल. Password कुणालाही सांगू नका.</p>
            <Row2>
              <F label="Password *" v={studentPassword} on={setStudentPassword} ph="किमान 8 अक्षरे" type="password" />
              <F label="Confirm Password *" v={confirmPassword} on={setConfirmPassword} ph="Password पुन्हा टाका" type="password" />
            </Row2>

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
                  </label>
                )
              })}
            </div>

            {form.courses.length > 0 && <div className="auto-strip">निवडलेले कोर्स: <b>{form.courses.map(k => COURSES.find(c => c.key === k)?.label).join(' + ')}</b></div>}

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
              <RevRow k="फी" v="Admin approval नंतर निश्चित केली जाईल" hi />
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

      <FormStyles />
    </div>
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
.sra {
  --sra-ground:#f8f1e7; --sra-panel:#fffdf9; --sra-panel-2:#f7ede5;
  --sra-text:#32171a; --sra-muted:#755f60; --sra-line:#e7d3c3;
  --sra-gold:#c5962f; --sra-gold-lt:#e0ba5d; --sra-gold-dark:#9b6c18;
  --sra-maroon:#681d25; --sra-display:var(--sra-body, sans-serif);
  min-height:100vh; background:var(--sra-ground); color:var(--sra-text);
}
/* ═══ LANDING ═══ */
.adm-land { min-height:100vh; background:var(--sra-ground); color:var(--sra-text); padding-bottom:70px; font-family:var(--sra-body); }
.al-top { padding:16px 22px; }
.al-hero { max-width:760px; margin:0 auto; padding:36px 22px 60px; text-align:center;
  background:radial-gradient(ellipse 80% 70% at 50% 0%, rgba(212,164,55,.1) 0%, transparent 70%); }
.al-badge { display:inline-block; background:rgba(212,164,55,.08); border:1px solid rgba(212,164,55,.22); color:var(--sra-gold); padding:7px 18px; border-radius:100px; font-size:11.5px; font-weight:700; letter-spacing:.4px; margin-bottom:26px; }
.al-hero h1 { font-family:var(--sra-display); font-size:52px; font-weight:900; margin:0 0 18px; letter-spacing:-0.5px; line-height:1.08; color:var(--sra-gold-lt); text-transform:uppercase; }
.al-hero h1 span { display:block; background:linear-gradient(120deg,var(--sra-gold-lt),var(--sra-gold) 60%,var(--sra-gold-lt)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.al-lead { font-size:17px; color:var(--sra-text); margin:0 0 14px; line-height:1.65; font-weight:600; }
.al-sub { font-size:14.5px; color:var(--sra-muted); margin:0 0 34px; line-height:1.85; max-width:560px; margin-left:auto; margin-right:auto; }
.al-sub b { color:var(--sra-gold-lt); }
.al-cta { display:inline-flex; align-items:center; padding:18px 44px; background:linear-gradient(180deg,var(--sra-gold),var(--sra-gold-dark)); border:none; border-radius:4px; color:#000; font-weight:800; font-size:17px; cursor:pointer; font-family:var(--sra-display); text-transform:uppercase; letter-spacing:.05em; transition:filter .15s; }
.al-cta:hover { filter:brightness(1.1); }
.al-cta-note { font-size:12px; color:var(--sra-muted); margin-top:14px; }

.al-sec { max-width:1020px; margin:0 auto 56px; padding:0 22px; }
.al-sec-t { text-align:center; font-family:var(--sra-display); font-size:29px; font-weight:800; color:var(--sra-text); margin-bottom:32px; }
.al-sec-t span { display:block; font-family:var(--sra-display); font-size:11px; font-weight:800; color:var(--sra-gold); letter-spacing:1.8px; margin-bottom:10px; text-transform:uppercase; }

.al-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); gap:15px; }
.al-step { position:relative; background:var(--sra-panel); border:1px solid var(--sra-line); border-radius:4px; padding:26px 20px 22px; }
.al-step-n { position:absolute; top:-13px; left:20px; width:30px; height:30px; border-radius:50%; background:linear-gradient(180deg,var(--sra-gold),var(--sra-gold-dark)); color:#000; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; }
.al-step-i { font-size:32px; margin:8px 0 12px; }
.al-step-t { font-weight:800; font-size:15.5px; color:var(--sra-gold-lt); margin-bottom:8px; }
.al-step-d { font-size:13px; color:var(--sra-muted); line-height:1.75; }

.al-papers { display:flex; flex-direction:column; gap:12px; }
.al-paper { display:flex; gap:17px; align-items:flex-start; background:var(--sra-panel); border:1px solid var(--sra-line); border-radius:4px; padding:20px 22px; }
.al-paper-i { font-size:30px; flex-shrink:0; }
.al-paper-t { font-weight:800; font-size:15.5px; color:var(--sra-gold-lt); margin-bottom:5px; }
.al-paper-d { font-size:13.5px; color:var(--sra-muted); line-height:1.7; }

.al-check { display:grid; grid-template-columns:repeat(auto-fit,minmax(255px,1fr)); gap:11px; }
.al-chk { display:flex; align-items:center; gap:13px; background:var(--sra-panel); border:1px solid var(--sra-line); border-radius:4px; padding:15px 18px; }
.al-chk.req { border-color:rgba(212,164,55,.3); background:rgba(212,164,55,.05); }
.al-chk-i { font-size:20px; }
.al-chk-t { flex:1; font-size:14px; font-weight:600; color:var(--sra-text); }
.al-chk-r { font-size:10.5px; font-weight:800; color:var(--sra-muted); padding:3px 10px; border-radius:100px; background:var(--sra-panel-2); white-space:nowrap; }
.al-chk.req .al-chk-r { color:var(--sra-gold); background:rgba(212,164,55,.12); }

.al-courses { display:grid; grid-template-columns:repeat(auto-fill,minmax(215px,1fr)); gap:11px; }
.al-course { display:flex; justify-content:space-between; align-items:center; background:var(--sra-panel); border:1px solid var(--sra-line); border-radius:4px; padding:16px 18px; }
.al-course b { font-size:14.5px; color:var(--sra-text); font-weight:700; }
.al-course span { font-size:13px; color:var(--sra-gold-lt); font-weight:800; }

.al-final { max-width:640px; margin:0 auto; padding:48px 26px; text-align:center; background:linear-gradient(180deg,var(--sra-panel-2),var(--sra-panel)); border:1px solid var(--sra-gold); border-radius:4px; }
.al-final h2 { font-family:var(--sra-display); font-size:31px; font-weight:900; color:var(--sra-gold-lt); margin:0 0 10px; }
.al-final p { color:var(--sra-muted); font-size:14.5px; margin:0 0 28px; line-height:1.7; }
.al-help { margin-top:24px; font-size:13px; color:var(--sra-muted); display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; }
.al-help a { color:var(--sra-gold); text-decoration:none; font-weight:700; }

@media (max-width:640px) {
  .al-hero { padding:24px 18px 44px; }
  .al-hero h1 { font-size:34px; letter-spacing:-1px; }
  .al-lead { font-size:15px; }
  .al-sub { font-size:13.5px; }
  .al-cta { width:100%; justify-content:center; padding:17px 24px; font-size:16px; }
  .al-sec { margin-bottom:42px; padding:0 16px; }
  .al-sec-t { font-size:23px; margin-bottom:26px; }
  .al-steps, .al-check, .al-courses { grid-template-columns:1fr; }
  .al-final { margin:0 16px; padding:34px 20px; }
  .al-final h2 { font-size:25px; }
  .al-help { flex-direction:column; gap:9px; }
}

.adm-wrap { min-height:100vh; background:var(--sra-ground); padding:0 0 60px; font-family:var(--sra-body); }
.adm-head { display:flex; align-items:center; gap:16px; padding:18px 22px; background:rgba(5,8,5,.8); border-bottom:1px solid var(--sra-line); position:sticky; top:0; z-index:50; backdrop-filter:blur(12px); }
.adm-back { color:var(--sra-muted); text-decoration:none; font-size:14px; font-weight:600; padding:8px 14px; border:1px solid var(--sra-line); border-radius:4px; white-space:nowrap; }
.adm-t1 { color:var(--sra-gold-lt); font-family:var(--sra-display); font-weight:800; font-size:18px; }
.adm-t2 { color:var(--sra-gold); font-size:12px; font-weight:700; letter-spacing:.5px; margin-top:2px; text-transform:uppercase; }

.stepper { display:flex; max-width:880px; margin:26px auto 20px; padding:0 18px; gap:6px; }
.stp { flex:1; text-align:center; }
.stp-n { width:38px; height:38px; margin:0 auto 7px; border-radius:50%; background:var(--sra-panel-2); border:1px solid var(--sra-line); color:var(--sra-muted); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; }
.stp.on .stp-n { background:linear-gradient(180deg,var(--sra-gold),var(--sra-gold-dark)); border-color:var(--sra-gold); color:#000; }
.stp.done .stp-n { background:#16a34a; border-color:#16a34a; color:#fff; }
.stp-l { font-size:11.5px; color:var(--sra-muted); font-weight:600; }
.stp.on .stp-l { color:var(--sra-gold); }
.stp.done .stp-l { color:#4ade80; }

.err-box { max-width:880px; margin:0 auto 16px; padding:14px 18px; background:rgba(220,38,38,.12); border:1px solid rgba(220,38,38,.35); border-radius:4px; color:#fca5a5; font-size:13.5px; line-height:1.9; }

.adm-card { max-width:880px; margin:0 auto; background:var(--sra-panel); border:1px solid var(--sra-line); border-radius:4px; padding:30px 28px; }

.sec-title { display:flex; align-items:center; gap:9px; font-size:15px; font-weight:800; color:var(--sra-gold); margin:26px 0 15px; padding-bottom:9px; border-bottom:1px solid var(--sra-line); }
.sec-title:first-child { margin-top:0; }
.sec-title span { font-size:18px; }

.row2 { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
.row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; }

.lbl { display:block; font-size:12px; font-weight:700; color:var(--sra-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:.05em; }
.inp { width:100%; padding:12px 13px; background:var(--sra-panel-2); border:1px solid var(--sra-line); border-radius:4px; color:var(--sra-text); font-size:15px; outline:none; font-family:inherit; transition:.15s; margin-bottom:15px; }
.inp:focus { border-color:var(--sra-gold); }
.inp::placeholder { color:var(--sra-muted); }
.login-help { margin:-4px 0 14px; color:var(--sra-muted); font-size:12.5px; line-height:1.65; }
select.inp option { background:var(--sra-panel); color:var(--sra-text); }

.radio-row { display:flex; gap:10px; margin-bottom:15px; }
.radio { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:12px; background:var(--sra-panel-2); border:1px solid var(--sra-line); border-radius:4px; cursor:pointer; font-size:14px; color:var(--sra-text); font-weight:600; }
.radio.on { border-color:var(--sra-gold); background:rgba(212,164,55,.1); color:var(--sra-gold); }
.radio input { display:none; }

.auto-box { padding:11px 13px; background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.25); border-radius:4px; margin-bottom:15px; min-height:47px; display:flex; flex-direction:column; justify-content:center; }
.auto-box b { color:#4ade80; font-size:14.5px; }
.auto-box span { color:var(--sra-muted); font-size:11.5px; margin-top:2px; }
.auto-box .dim { color:var(--sra-muted); font-size:13px; }
.auto-strip { padding:12px 16px; background:rgba(212,164,55,.09); border:1px solid rgba(212,164,55,.25); border-radius:4px; color:var(--sra-gold-lt); font-size:13.5px; margin-bottom:8px; }
.auto-strip b { color:var(--sra-gold); }

.course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:11px; }
.course-chk { display:flex; align-items:center; gap:11px; padding:14px 15px; background:var(--sra-panel-2); border:1px solid var(--sra-line); border-radius:4px; cursor:pointer; transition:.15s; }
.course-chk:hover { border-color:rgba(212,164,55,.35); }
.course-chk.on { border-color:var(--sra-gold); background:rgba(212,164,55,.1); }
.course-chk input { display:none; }
.cc-box { width:24px; height:24px; border:1px solid var(--sra-line); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; color:#000; flex-shrink:0; }
.course-chk.on .cc-box { background:var(--sra-gold); border-color:var(--sra-gold); }
.cc-lbl { flex:1; font-size:14.5px; font-weight:700; color:var(--sra-text); }
.cc-fee { font-size:12px; color:var(--sra-muted); font-weight:700; }
.course-chk.on .cc-fee { color:var(--sra-gold); }

.fee-banner { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-top:16px; padding:18px 22px; background:var(--sra-panel-2); border:1px solid var(--sra-gold); border-radius:4px; flex-wrap:wrap; }
.fee-banner span { display:block; font-size:11.5px; color:var(--sra-muted); font-weight:600; margin-bottom:4px; text-transform:uppercase; }
.fee-banner b { color:var(--sra-text); font-size:15px; }
.fee-amt { text-align:right; }
.fee-amt b { font-size:30px; color:var(--sra-gold); font-weight:900; font-family:var(--sra-display); }

.doc-hint { font-size:13px; color:var(--sra-muted); margin-bottom:16px; line-height:1.7; }
.doc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(155px,1fr)); gap:13px; }
.doc-card { background:var(--sra-panel-2); border:1px dashed var(--sra-line); border-radius:4px; padding:14px 11px; text-align:center; cursor:pointer; transition:.15s; }
.doc-card:hover { border-color:var(--sra-gold); }
.doc-card.on { border-style:solid; border-color:#22c55e; background:rgba(34,197,94,.07); }
.doc-prev { height:96px; border-radius:4px; overflow:hidden; background:var(--sra-panel); display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
.doc-prev img { width:100%; height:100%; object-fit:cover; }
.doc-plus { font-size:34px; color:var(--sra-muted); font-weight:300; }
.doc-pdf { font-size:15px; color:var(--sra-gold); font-weight:700; }
.doc-name { font-size:12.5px; font-weight:700; color:var(--sra-text); line-height:1.4; }
.doc-name .req { color:#f87171; }
.doc-status { font-size:10.5px; color:var(--sra-muted); margin-top:4px; }
.doc-card.on .doc-status { color:#4ade80; }

.review { display:flex; flex-direction:column; gap:1px; background:var(--sra-line); border-radius:4px; overflow:hidden; border:1px solid var(--sra-line); }
.rev-row { display:flex; justify-content:space-between; gap:16px; padding:13px 17px; background:var(--sra-panel); font-size:14px; }
.rev-row span { color:var(--sra-muted); flex-shrink:0; }
.rev-row b { color:var(--sra-text); text-align:right; font-weight:600; }
.rev-row.hi { background:rgba(212,164,55,.1); }
.rev-row.hi b { color:var(--sra-gold); font-size:17px; font-weight:900; }

.declare { margin-top:20px; padding:17px 19px; background:rgba(212,164,55,.07); border:1px solid rgba(212,164,55,.2); border-radius:4px; }
.declare b { color:var(--sra-gold-lt); font-size:14px; }
.declare p { color:var(--sra-muted); font-size:13px; line-height:1.8; margin:7px 0 0; }

.nav-btns { display:flex; gap:12px; margin-top:30px; padding-top:22px; border-top:1px solid var(--sra-line); }
.b-ghost { padding:15px 26px; background:var(--sra-panel-2); border:1px solid var(--sra-line); border-radius:4px; color:var(--sra-text); font-weight:700; font-size:15px; cursor:pointer; font-family:inherit; }
.b-main { flex:1; padding:15px 26px; background:linear-gradient(180deg,var(--sra-gold),var(--sra-gold-dark)); border:none; border-radius:4px; color:#000; font-weight:800; font-size:16px; cursor:pointer; font-family:var(--sra-display); text-transform:uppercase; letter-spacing:.05em; }
.b-main:disabled { opacity:.6; cursor:wait; }
.b-sub { background:linear-gradient(135deg,#16a34a,#15803d); color:#fff; }

.adm-success { max-width:560px; margin:40px auto; padding:36px 30px; background:var(--sra-panel); border:1px solid var(--sra-line); border-radius:4px; text-align:center; }
.succ-icon { font-size:60px; margin-bottom:8px; }
.adm-success h1 { color:#4ade80; font-size:27px; font-weight:900; margin:0 0 6px; font-family:var(--sra-display); }
.succ-sub { color:var(--sra-muted); font-size:14px; margin:0 0 24px; }
.succ-code { background:var(--sra-panel-2); border:1px solid var(--sra-gold); border-radius:4px; padding:22px; margin-bottom:18px; }
.succ-code span { display:block; font-size:11.5px; color:var(--sra-gold-lt); font-weight:700; letter-spacing:1.5px; margin-bottom:6px; text-transform:uppercase; }
.succ-code strong { display:block; font-size:46px; font-weight:900; color:var(--sra-gold); letter-spacing:5px; font-family:monospace; }
.succ-code small { display:block; font-size:11px; color:var(--sra-muted); margin-top:7px; }
.succ-info { background:var(--sra-panel-2); border-radius:4px; padding:15px; margin-bottom:18px; color:var(--sra-muted); font-size:13.5px; line-height:2; }
.succ-info b { color:var(--sra-text); }
.succ-steps { text-align:left; background:var(--sra-panel-2); border:1px solid var(--sra-line); border-radius:4px; padding:16px 18px; margin-bottom:20px; }
.succ-steps b { color:var(--sra-gold-lt); font-size:13.5px; }
.succ-steps ol { margin:9px 0 0; padding-left:20px; color:var(--sra-muted); font-size:13px; line-height:2; }
.succ-steps ol b { color:var(--sra-text); }
.btn-print { width:100%; padding:17px; background:linear-gradient(180deg,var(--sra-gold),var(--sra-gold-dark)); border:none; border-radius:4px; color:#000; font-weight:800; font-size:16px; cursor:pointer; font-family:var(--sra-display); text-transform:uppercase; letter-spacing:.05em; }
.succ-note { font-size:12px; color:var(--sra-muted); margin-top:10px; }
.succ-links { display:flex; gap:11px; margin-top:22px; }
.succ-links a { flex:1; padding:13px; background:var(--sra-panel-2); border:1px solid var(--sra-line); border-radius:4px; color:var(--sra-text); text-decoration:none; font-size:14px; font-weight:600; }

@media (max-width:700px) {
  .adm-card { padding:22px 16px; margin:0 12px; }
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

/* ═══ ADMISSION EXPERIENCE ═══ */
.adm-wrap { background:linear-gradient(180deg,#f8f1e7 0,#fffaf4 320px,#f8f1e7 100%); padding-bottom:72px; }
.adm-head { position:relative; top:auto; max-width:none; min-height:82px; padding:10px max(24px,calc((100vw - 1120px)/2)); justify-content:space-between; background:#fff; border-bottom:4px solid var(--sra-maroon); box-shadow:0 4px 18px rgba(65,24,25,.08); backdrop-filter:none; }
.adm-brand { display:flex; align-items:center; gap:12px; text-decoration:none; color:var(--sra-maroon); }
.adm-brand img { width:58px; height:58px; object-fit:contain; }
.adm-brand span { display:flex; flex-direction:column; line-height:1.25; }
.adm-brand b { font-size:19px; font-weight:900; }
.adm-brand small { color:#8a6a62; font-size:11px; margin-top:4px; }
.adm-back { color:var(--sra-maroon); border-color:#dbc3b5; background:#fffaf4; border-radius:6px; padding:10px 16px; }
.adm-back:hover { border-color:var(--sra-maroon); }
.adm-intro { max-width:1100px; margin:0 auto; padding:34px 28px 28px; display:grid; grid-template-columns:1.4fr .75fr; gap:34px; align-items:center; }
.adm-kicker { color:var(--sra-gold-dark); font-size:12px; font-weight:900; letter-spacing:.12em; }
.adm-intro h1 { margin:7px 0 6px; color:var(--sra-maroon); font-size:clamp(32px,4vw,48px); line-height:1.12; font-weight:900; }
.adm-intro p { margin:0; color:#755f60; font-size:16px; line-height:1.65; }
.adm-help-card { padding:18px 20px; border-left:4px solid var(--sra-gold); background:#fff; box-shadow:0 8px 24px rgba(80,38,31,.08); display:flex; flex-direction:column; gap:5px; }
.adm-help-card b { color:var(--sra-maroon); font-size:15px; }
.adm-help-card span { color:#604b4b; font-size:13px; line-height:1.55; }
.adm-help-card small { color:#8a6a62; font-size:11.5px; }
.adm-help-card strong { color:#b4232f; }
.stepper { position:relative; max-width:880px; margin:0 auto 22px; padding:0 18px; gap:0; }
.stepper:before { content:''; position:absolute; top:20px; left:12%; right:12%; height:2px; background:#dcc9b9; }
.stp { position:relative; z-index:1; }
.stp-n { width:42px; height:42px; background:#fff; border:2px solid #dcc9b9; color:#806a67; box-shadow:0 0 0 5px #f8f1e7; }
.stp.on .stp-n { background:var(--sra-maroon); border-color:var(--sra-maroon); color:#fff; }
.stp.done .stp-n { background:var(--sra-gold-dark); border-color:var(--sra-gold-dark); }
.stp-l { color:#796563; font-size:12px; margin-top:3px; }
.stp.on .stp-l { color:var(--sra-maroon); font-weight:900; }
.stp.done .stp-l { color:var(--sra-gold-dark); }
.adm-card { max-width:1000px; padding:30px 34px 34px; background:#fff; border:1px solid #ead8ca; border-radius:12px; box-shadow:0 18px 50px rgba(79,39,32,.09); }
.form-stage-title { display:flex; align-items:center; gap:15px; margin:-6px 0 26px; padding:0 0 20px; border-bottom:1px solid #ead8ca; }
.form-stage-title > span { background:var(--sra-maroon); color:#fff; border-radius:5px; padding:8px 11px; font-size:11px; font-weight:800; white-space:nowrap; }
.form-stage-title div { display:flex; flex-direction:column; }
.form-stage-title b { color:var(--sra-maroon); font-size:20px; }
.form-stage-title small { color:#88706c; font-size:11.5px; margin-top:2px; }
.sec-title { color:var(--sra-maroon); font-size:16px; margin-top:30px; border-bottom-color:#ead8ca; }
.sec-title span { width:30px; height:30px; display:grid; place-items:center; background:#f7ede5; border-radius:50%; font-size:15px; }
.lbl { color:#573f40; font-size:12.5px; text-transform:none; letter-spacing:0; }
.inp { min-height:48px; background:#fffaf6; border-color:#dcc9ba; border-radius:7px; color:#32171a; font-size:15px; }
.inp:hover { border-color:#c8a98f; }
.inp:focus { border-color:var(--sra-maroon); box-shadow:0 0 0 3px rgba(104,29,37,.09); background:#fff; }
.inp::placeholder { color:#a38f89; }
.radio,.course-chk,.doc-card { background:#fffaf6; border-color:#dcc9ba; border-radius:8px; color:#32171a; }
.radio.on,.course-chk.on { border-color:var(--sra-maroon); background:#f9e9e8; color:var(--sra-maroon); }
.course-chk.on .cc-box { background:var(--sra-maroon); border-color:var(--sra-maroon); color:#fff; }
.cc-lbl,.doc-name { color:#32171a; }
.auto-box { background:#eef8f0; border-color:#b9dec2; }
.auto-box b { color:#22723a; }
.auto-strip { background:#fff5d9; border-color:#ead18d; color:#5e4512; }
.auto-strip b { color:#79520b; }
.login-help,.doc-hint { color:#755f60; background:#fff8e7; border-left:3px solid var(--sra-gold); padding:10px 12px; }
.err-box { background:#fff0f0; border-color:#e8a8ad; color:#991b28; border-radius:8px; }
.b-ghost { background:#fff; border-color:#cfb9aa; color:var(--sra-maroon); border-radius:7px; }
.b-main { background:var(--sra-maroon); color:#fff; border-radius:7px; box-shadow:0 8px 18px rgba(104,29,37,.18); text-transform:none; letter-spacing:0; }
.b-main:hover { background:#7b252e; transform:translateY(-1px); }
.b-sub { background:#28733d; }

@media (max-width:700px) {
  .adm-head { min-height:68px; padding:8px 14px; }
  .adm-brand { gap:8px; }
  .adm-brand img { width:46px; height:46px; }
  .adm-brand b { font-size:14px; }
  .adm-brand small { display:none; }
  .adm-back { padding:8px 10px; font-size:11px; }
  .adm-intro { padding:24px 18px 20px; grid-template-columns:1fr; gap:16px; }
  .adm-intro h1 { font-size:31px; }
  .adm-intro p { font-size:14px; }
  .adm-help-card { padding:14px 16px; }
  .stepper { margin-bottom:18px; }
  .stepper:before { top:17px; }
  .stp-n { width:34px; height:34px; box-shadow:0 0 0 4px #f8f1e7; }
  .stp-l { font-size:9.5px; }
  .adm-card { margin:0 10px; padding:22px 15px 26px; border-radius:9px; }
  .form-stage-title { margin-top:0; align-items:flex-start; }
  .form-stage-title b { font-size:18px; }
}
  ` }} />
}
