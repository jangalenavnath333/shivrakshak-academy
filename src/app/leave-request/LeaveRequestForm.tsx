'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarCheck2, CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import styles from './leave-request.module.css'

type FormState = {
  name: string
  mobile: string
  rollNumber: string
  days: string
  website: string
}

const blankForm: FormState = { name: '', mobile: '', rollNumber: '', days: '', website: '' }

function showDate(value: string) {
  return new Date(`${value}T00:00:00+05:30`).toLocaleDateString('mr-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  })
}

export default function LeaveRequestForm() {
  const [form, setForm] = useState<FormState>(blankForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ returnDate: string } | null>(null)

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rollNumber: form.rollNumber.toUpperCase() }),
      })
      const payload = await response.json() as { data?: { returnDate: string }; error?: string }
      if (!response.ok || !payload.data) throw new Error(payload.error || 'अर्ज submit झाला नाही.')
      setSuccess({ returnDate: payload.data.returnDate })
      setForm(blankForm)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'अर्ज submit झाला नाही. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return <div className={styles.success} role="status">
      <CheckCircle2 aria-hidden="true" />
      <h2>अर्ज Adminकडे पोहोचला</h2>
      <p>Admin मंजुरीनंतर तुमच्या मोबाईलवर सुट्टी मंजूर झाल्याचा message येईल.</p>
      <div><span>परत येण्याची तारीख</span><strong>{showDate(success.returnDate)}</strong></div>
      <button type="button" onClick={() => setSuccess(null)}>दुसरा अर्ज भरा</button>
      <Link href="/"><ArrowLeft /> मुख्यपृष्ठावर जा</Link>
    </div>
  }

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.formHeading}>
      <CalendarCheck2 aria-hidden="true" />
      <div><h2>सुट्टीचा अर्ज</h2><p>प्रवेश अर्जात दिलेली माहितीच येथे लिहा.</p></div>
    </div>

    {error && <div className={styles.error} role="alert">{error}</div>}

    <label>
      <span>विद्यार्थ्याचे पूर्ण नाव *</span>
      <input value={form.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" maxLength={120} required placeholder="उदा. रोहित विजय पाटील" />
    </label>
    <label>
      <span>मोबाईल नंबर *</span>
      <input value={form.mobile} onChange={(event) => update('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" autoComplete="tel" pattern="[0-9]{10}" required placeholder="10 अंकी मोबाईल नंबर" />
    </label>
    <label>
      <span>विद्यार्थी ID / Form Code *</span>
      <input value={form.rollNumber} onChange={(event) => update('rollNumber', event.target.value.toUpperCase().replace(/[^S0-9-]/g, ''))} autoCapitalize="characters" maxLength={10} required placeholder="उदा. S-01" />
    </label>
    <label>
      <span>किती दिवस सुट्टी हवी? *</span>
      <input type="number" value={form.days} onChange={(event) => update('days', event.target.value)} inputMode="numeric" min={1} max={30} required placeholder="उदा. 3" />
      <small>सुट्टी आजपासून मोजली जाईल. जास्तीत जास्त 30 दिवस.</small>
    </label>

    <label className={styles.honeypot} aria-hidden="true">
      Website<input value={form.website} onChange={(event) => update('website', event.target.value)} tabIndex={-1} autoComplete="off" />
    </label>

    <button className={styles.submit} type="submit" disabled={saving}>
      {saving ? <LoaderCircle className={styles.spinner} aria-hidden="true" /> : <Send aria-hidden="true" />}
      {saving ? 'अर्ज पाठवत आहे…' : 'Admin Approval साठी अर्ज पाठवा'}
    </button>
    <p className={styles.privacy}>तुमची माहिती फक्त विद्यार्थी ओळख पडताळणी आणि सुट्टी मंजुरीसाठी वापरली जाते.</p>
  </form>
}
