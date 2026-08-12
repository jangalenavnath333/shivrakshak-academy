'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, GraduationCap, LockKeyhole } from 'lucide-react'
import Logo from '@/components/Logo'

export default function StudentLoginForm({ initialRollNumber }: { initialRollNumber: string }) {
  const router = useRouter()
  const [rollNumber, setRollNumber] = useState(initialRollNumber)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, password }),
      })
      const result = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Login झाले नाही.')
      router.replace('/student/exams')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login झाले नाही.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="student-login-page">
      <Link href="/" className="student-back"><ArrowLeft /> मुख्यपृष्ठ</Link>
      <section className="student-login-card">
        <div className="student-login-brand"><Logo size={66} /><div><strong>शिवरक्षक</strong><span>करिअर अकॅडमी</span></div></div>
        <div className="student-login-icon"><GraduationCap /></div>
        <h1>Student Exam Login</h1>
        <p>Online परीक्षा देण्यासाठी प्रवेश अर्जानंतर मिळालेला विद्यार्थी ID आणि तुमचा password टाका.</p>
        <form onSubmit={handleSubmit}>
          <label><span>विद्यार्थी ID</span><input value={rollNumber} onChange={(event) => setRollNumber(event.target.value.toUpperCase())} placeholder="उदा. S-01" autoComplete="username" required /></label>
          <label><span>Password</span><div className="password-input"><LockKeyhole /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Password लपवा' : 'Password दाखवा'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
          {error && <div className="student-login-error" role="alert">{error}</div>}
          <button className="student-login-submit" disabled={loading}>{loading ? 'Login होत आहे…' : 'परीक्षा पोर्टल उघडा'}</button>
        </form>
        <small>Password विसरल्यास अकॅडमीच्या Adminशी संपर्क करा.</small>
      </section>
    </main>
  )
}
