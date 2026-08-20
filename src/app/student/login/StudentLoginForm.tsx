'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, ShieldCheck, LockKeyhole, AlertCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import '@/app/landing.css'

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
    <main className="sra-login" style={{
      minHeight: '100vh',
      background: 'var(--sra-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      <Link href="/" className="sra-btn sra-btn--ghost" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', padding: '0.4rem 1rem' }}>
        <ArrowLeft size={16} /> मुख्यपृष्ठ
      </Link>

      <section style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--sra-panel)',
        border: '1px solid var(--sra-line)',
        borderRadius: '8px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative'
      }}>
        {/* Subtle decorative accent */}
        <div style={{ position: 'absolute', top: 0, left: '20px', right: '20px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--sra-gold), transparent)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--sra-line)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <span style={{ color: 'var(--sra-gold)' }}><Logo size={50} /></span>
          <div>
            <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--sra-gold-lt)', fontFamily: 'var(--sra-display)', lineHeight: 1.1 }}>शिवरक्षक</strong>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sra-gold)', textTransform: 'uppercase', letterSpacing: '.08em' }}>करिअर अकॅडमी</span>
          </div>
        </div>

        <div style={{
          width: '56px', height: '56px',
          background: 'rgba(212,164,55,.1)',
          color: 'var(--sra-gold)',
          borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={30} />
        </div>

        <h1 style={{ fontSize: '1.8rem', color: 'var(--sra-text)', marginBottom: '0.5rem', fontFamily: 'var(--sra-display)', letterSpacing: '.02em' }}>Student Exam Login</h1>
        <p style={{ color: 'var(--sra-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          Online परीक्षा देण्यासाठी प्रवेश अर्जानंतर मिळालेला विद्यार्थी ID आणि तुमचा password टाका.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sra-gold)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '0.5rem', fontWeight: 600 }}>विद्यार्थी ID</span>
            <input 
              value={rollNumber} 
              onChange={(event) => setRollNumber(event.target.value.toUpperCase())} 
              placeholder="उदा. S-01" 
              autoComplete="username" 
              required 
              style={{
                width: '100%', height: '52px',
                background: 'var(--sra-panel-2)',
                border: '1px solid var(--sra-line)',
                borderRadius: '4px',
                padding: '0 1rem',
                color: 'var(--sra-text)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color .2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--sra-gold)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--sra-line)'}
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--sra-gold)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '0.5rem', fontWeight: 600 }}>Password</span>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--sra-panel-2)',
              border: '1px solid var(--sra-line)',
              borderRadius: '4px',
              padding: '0 1rem',
              height: '52px',
              transition: 'border-color .2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--sra-gold)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--sra-line)'}
            >
              <LockKeyhole size={18} style={{ color: 'var(--sra-muted)', marginRight: '0.8rem' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                autoComplete="current-password" 
                required 
                style={{
                  flex: 1, height: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--sra-text)',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword((value) => !value)} 
                aria-label={showPassword ? 'Password लपवा' : 'Password दाखवा'}
                style={{ background: 'transparent', border: 'none', color: 'var(--sra-muted)', cursor: 'pointer', padding: '0.4rem', marginLeft: '0.5rem' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <div role="alert" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '0.8rem 1rem',
              borderRadius: '4px',
              fontSize: '0.9rem',
              display: 'flex', gap: '0.5rem', alignItems: 'center'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            disabled={loading}
            style={{
              height: '54px',
              background: 'linear-gradient(180deg, var(--sra-gold), var(--sra-gold-dark))',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.05rem',
              fontWeight: 700,
              fontFamily: 'var(--sra-display)',
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem',
              transition: 'filter .2s'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.filter = 'none')}
          >
            {loading ? 'Login होत आहे…' : 'परीक्षा पोर्टल उघडा'}
          </button>
        </form>

        <small style={{ display: 'block', textAlign: 'center', color: 'var(--sra-muted)', marginTop: '2rem', fontSize: '0.85rem' }}>
          Password विसरल्यास अकॅडमीच्या Adminशी संपर्क करा.
        </small>
      </section>
    </main>
  )
}
