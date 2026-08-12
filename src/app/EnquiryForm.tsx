'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

type CourseOption = { id: string; slug: string; title: string }

export default function EnquiryForm({ courses }: { courses: CourseOption[] }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      form.reset()
      setStatus('success')
      setMessage('तुमची चौकशी मिळाली. अकॅडमीकडून लवकरच संपर्क केला जाईल.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'कृपया पुन्हा प्रयत्न करा.')
    }
  }

  return <form onSubmit={submit}>
    <input className="website-field" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div className="enquiry-fields">
      <input name="name" placeholder="पूर्ण नाव" minLength={2} required />
      <input name="phone" inputMode="numeric" pattern="[0-9]{10}" placeholder="10 अंकी मोबाईल नंबर" required />
      <input name="email" type="email" placeholder="ई-मेल (पर्यायी)" />
      <select name="course" defaultValue=""><option value="">कोर्स निवडा</option>{courses.map(course => <option key={course.id} value={course.slug}>{course.title}</option>)}</select>
    </div>
    <textarea name="message" maxLength={800} placeholder="तुमचा संदेश" />
    <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'पाठवत आहे…' : <>संपर्क करा <ArrowRight /></>}</button>
    {message && <p className={status === 'success' ? 'form-success' : 'form-error'} role="status">{status === 'success' && <CheckCircle2 />} {message}</p>}
  </form>
}
