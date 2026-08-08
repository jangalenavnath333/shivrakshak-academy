'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || data.user?.app_metadata?.role !== 'admin') {
      if (data.session) await supabase.auth.signOut()
      setError('❌ ईमेल, पासवर्ड किंवा admin परवानगी चुकीची आहे.')
      setLoading(false)
      return
    }

    router.replace('/admin')
    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', margin: 0 }}>
            शिवरक्षक करियर अकॅडमी
          </h1>
          <p style={{ color: '#78350f', fontSize: 13, marginTop: 4 }}>Admin Panel — Login</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              📧 Admin ईमेल
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              required
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              🔐 Admin पासवर्ड
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="पासवर्ड टाका..."
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c2d12'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#9ca3af' : '#7c2d12',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '⏳ तपासत आहे...' : '🔓 Login करा'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" style={{ color: '#78350f', fontSize: 13, textDecoration: 'none' }}>
            ← मुख्य पानावर जा
          </Link>
        </div>

        <div style={{ marginTop: 24, padding: '12px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
          <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>
            Supabase Auth मधील <strong>admin role</strong> असलेल्या account ने login करा.
          </p>
        </div>
      </div>
    </div>
  )
}
