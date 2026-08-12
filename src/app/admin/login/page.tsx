'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabase'
import styles from './login.module.css'

const ADMIN_EMAIL = 'jangalenavnath333@gmail.com'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || data.user?.app_metadata?.role !== 'admin') {
      if (data.session) await supabase.auth.signOut()
      setError('ईमेल, पासवर्ड किंवा Admin परवानगी योग्य नाही. कृपया पुन्हा तपासा.')
      setLoading(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-label="शिवरक्षक अकॅडमी Admin माहिती">
        <div className={styles.brandHeader}>
          <Logo size={64} />
          <div>
            <strong>शिवरक्षक</strong>
            <span>करिअर अकॅडमी</span>
          </div>
        </div>

        <div className={styles.brandCopy}>
          <p className={styles.eyebrow}>SECURE ADMIN PORTAL</p>
          <h1>अकॅडमीचे संपूर्ण व्यवस्थापन एका सुरक्षित ठिकाणी.</h1>
          <p>
            विद्यार्थ्यांचे प्रवेश, फी, कागदपत्रे, उपस्थिती, परीक्षा आणि वेबसाइटवरील माहिती व्यवस्थापित करा.
          </p>
        </div>

        <div className={styles.featureList}>
          <div>
            <UsersRound aria-hidden="true" />
            <span><strong>विद्यार्थी व्यवस्थापन</strong><small>प्रवेश आणि नोंदी त्वरित पाहा</small></span>
          </div>
          <div>
            <BadgeCheck aria-hidden="true" />
            <span><strong>सुरक्षित प्रवेश</strong><small>फक्त अधिकृत Admin खात्यासाठी</small></span>
          </div>
        </div>
      </section>

      <section className={styles.formPanel}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> मुख्य पानावर जा
        </Link>

        <div className={styles.formWrap}>
          <div className={styles.formHeading}>
            <span className={styles.shieldIcon}><ShieldCheck aria-hidden="true" /></span>
            <p>ADMIN ACCESS</p>
            <h2>Admin Panel मध्ये Login करा</h2>
            <span>तुमच्या अधिकृत ईमेल आणि पासवर्डचा वापर करा.</span>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <label htmlFor="admin-email">Admin ईमेल</label>
            <div className={styles.inputWrap}>
              <Mail aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                spellCheck={false}
                required
              />
            </div>

            <label htmlFor="admin-password">Admin पासवर्ड</label>
            <div className={styles.inputWrap}>
              <LockKeyhole aria-hidden="true" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="पासवर्ड टाका"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>

            {error && <div className={styles.error} role="alert" aria-live="polite">{error}</div>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
              <span>{loading ? 'Login तपासत आहे…' : 'सुरक्षित Login करा'}</span>
              {!loading && <ArrowRight aria-hidden="true" />}
            </button>
          </form>

          <p className={styles.securityNote}>
            <LockKeyhole aria-hidden="true" /> हा विभाग फक्त अकॅडमीच्या अधिकृत Admin साठी आहे.
          </p>
        </div>
      </section>
    </main>
  )
}
