'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react'

export default function StudentCredentials({ studentId, hasCredentials }: { studentId: string; hasCredentials: boolean }) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(hasCredentials)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save() {
    setSaving(true); setMessage(''); setError('')
    try {
      const response = await fetch(`/api/admin/students/${studentId}/credentials`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, confirmPassword }),
      })
      const payload = await response.json() as { error?: string; created?: boolean }
      if (!response.ok) throw new Error(payload.error || 'Password save झाला नाही.')
      setPassword(''); setConfirmPassword('')
      setMessage(payload.created ? 'Student Exam Login activate झाले.' : 'Student Exam Password reset झाला.')
      setIsActive(true)
      router.refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Password save झाला नाही.') }
    finally { setSaving(false) }
  }

  return (
    <section className="student-credentials-card">
      <div><KeyRound /><span><strong>Student Exam Login</strong><small>{isActive ? 'Login active — येथे password reset करू शकता' : 'या जुन्या admissionसाठी login activate करा'}</small></span><b className={isActive ? 'active' : 'pending'}>{isActive ? 'ACTIVE' : 'NOT ACTIVE'}</b></div>
      <div className="student-credentials-form"><label><span className="form-label">नवीन Password</span><input className="form-input" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label><label><span className="form-label">Confirm Password</span><input className="form-input" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label><button className="btn btn-primary" onClick={save} disabled={saving || password.length < 8 || password !== confirmPassword}>{saving ? <LoaderCircle className="spin" /> : <KeyRound />} {isActive ? 'Password Reset' : 'Login Activate'}</button></div>
      {message && <p className="credential-success"><CheckCircle2 /> {message}</p>}{error && <p className="credential-error">{error}</p>}
    </section>
  )
}
