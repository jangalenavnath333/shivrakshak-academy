'use client'
import { useState, useEffect } from 'react'

const SQL = `-- शिवरक्षक करियर अकॅडमी — Database Setup
-- हे सर्व copy करा आणि Supabase SQL Editor मध्ये paste करून Run दाबा

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT UNIQUE,
  name TEXT NOT NULL,
  parent_name TEXT,
  address TEXT,
  phone TEXT,
  parent_phone TEXT,
  aadhaar_no TEXT,
  guarantee_letter_no TEXT,
  dob DATE,
  course TEXT,
  admission_date DATE,
  duration TEXT,
  age INTEGER,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  chest NUMERIC(5,2),
  gender TEXT DEFAULT 'male',
  total_fee NUMERIC(10,2) DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT DEFAULT 'cash',
  receipt_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mess_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT,
  message_text TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW student_fee_summary AS
SELECT
  s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee,
  COALESCE(SUM(fp.amount_paid), 0) AS total_paid,
  s.total_fee - COALESCE(SUM(fp.amount_paid), 0) AS pending_amount
FROM students s
LEFT JOIN fee_payments fp ON s.id = fp.student_id
GROUP BY s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee;

CREATE OR REPLACE VIEW mess_expiry_reminders AS
SELECT ms.*, s.name AS student_name, s.phone AS student_phone, s.parent_phone
FROM mess_subscriptions ms
JOIN students s ON ms.student_id = s.id
WHERE ms.is_active = TRUE
  AND ms.end_date <= CURRENT_DATE + INTERVAL '2 days'
  AND ms.end_date >= CURRENT_DATE;`

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'missing'>('checking')
  const [bucketsStatus, setBucketsStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState('')

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    setSupabaseUrl(url)
    checkDB()
  }, [])

  async function checkDB() {
    setDbStatus('checking')
    try {
      const res = await fetch('/api/next-admission-code')
      const json = await res.json()
      // If API responds with a code, DB is connected (or at least reachable)
      // Try a more definitive check via students query
      const { createClient } = await import('@supabase/supabase-js')
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (!url || url.includes('placeholder')) { setDbStatus('missing'); return }
      const client = createClient(url, key)
      const { error } = await client.from('students').select('id').limit(1)
      if (error && (error.message?.includes('does not exist') || error.code === '42P01' || error.message?.includes('relation'))) {
        setDbStatus('missing')
      } else {
        setDbStatus('ok')
      }
    } catch {
      setDbStatus('missing')
    }
  }

  async function createBuckets() {
    setBucketsStatus('loading')
    try {
      const response = await fetch('/api/create-buckets', { method: 'POST' })
      setBucketsStatus(response.ok ? 'ok' : 'error')
    } catch {
      setBucketsStatus('error')
    }
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'bytoykdukngbwiespbwc'
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: '#7c2d12', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 28 }}>🛡️</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>शिवरक्षक करियर अकॅडमी</div>
          <div style={{ fontSize: 12, color: '#fcd34d' }}>Setup Wizard — एकदाच करायचे आहे</div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '32px auto', padding: '0 20px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>⚙️ First-Time Setup</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>खाली 2 steps करा — नंतर सगळे काम चालू होईल</p>
        </div>

        {/* STEP 1 — Database */}
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 28, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: dbStatus === 'ok' ? '#dcfce7' : '#fef3c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {dbStatus === 'checking' ? '⏳' : dbStatus === 'ok' ? '✅' : '1️⃣'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Database Tables तयार करा</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {dbStatus === 'checking' && 'तपासत आहे...'}
                {dbStatus === 'ok' && '✅ Tables आधीच आहेत — काम झाले!'}
                {dbStatus === 'missing' && 'Supabase SQL Editor मध्ये SQL paste करा'}
              </div>
            </div>
            {dbStatus === 'ok' && (
              <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✅ DONE</span>
            )}
          </div>

          {dbStatus === 'missing' && (
            <div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 18, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: '#78350f', marginBottom: 6 }}>📌 हे करा — फक्त एकदाच:</div>
                <ol style={{ margin: 0, paddingLeft: 20, color: '#92400e', lineHeight: 2.2 }}>
                  <li>खालील <strong>&quot;SQL Copy करा&quot;</strong> बटण दाबा</li>
                  <li><strong>Supabase SQL Editor</strong> उघडा (खाली बटण आहे)</li>
                  <li>SQL paste करा → <strong>Run</strong> दाबा</li>
                  <li>इथे परत येऊन <strong>&quot;Refresh&quot;</strong> दाबा</li>
                </ol>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={copySQL}
                  style={{
                    background: copied ? '#16a34a' : '#7c2d12', color: 'white',
                    padding: '12px 24px', borderRadius: 10, fontWeight: 800, border: 'none',
                    cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  {copied ? '✅ Copied!' : '📋 SQL Copy करा'}
                </button>
                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#1d4ed8', color: 'white',
                    padding: '12px 24px', borderRadius: 10, fontWeight: 800,
                    textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  🔗 Supabase SQL Editor उघडा ↗
                </a>
                <button
                  onClick={checkDB}
                  style={{
                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                    padding: '12px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  🔄 Refresh करा
                </button>
              </div>

              {/* SQL preview */}
              <div style={{ marginTop: 16, background: '#1e293b', borderRadius: 10, padding: '16px 20px', maxHeight: 200, overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: 11, color: '#86efac', fontFamily: 'Courier New, monospace', lineHeight: 1.7 }}>
                  {SQL.slice(0, 800)}...
                </pre>
              </div>
            </div>
          )}

          {dbStatus === 'ok' && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#166534' }}>
              🎉 सर्व 6 tables + 2 views तयार आहेत. विद्यार्थ्यांचे डेटा database मध्ये save होत आहे!
            </div>
          )}
        </div>

        {/* STEP 2 — Storage Buckets */}
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 28, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: bucketsStatus === 'ok' ? '#dcfce7' : '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {bucketsStatus === 'ok' ? '✅' : bucketsStatus === 'loading' ? '⏳' : '2️⃣'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Storage Buckets बनवा</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {bucketsStatus === 'idle' && 'Photos, Documents, Notices साठी storage'}
                {bucketsStatus === 'loading' && 'बनवत आहे...'}
                {bucketsStatus === 'ok' && '✅ Buckets तयार झाले!'}
                {bucketsStatus === 'error' && '❌ Error — पुन्हा प्रयत्न करा'}
              </div>
            </div>
            {bucketsStatus === 'ok' && (
              <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✅ DONE</span>
            )}
          </div>

          {bucketsStatus !== 'ok' && (
            <div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#1e40af' }}>
                📁 3 buckets बनतील: <strong>student-documents</strong> (private), <strong>student-photos</strong> (public), <strong>notice-attachments</strong> (public)
              </div>
              <button
                onClick={createBuckets}
                disabled={bucketsStatus === 'loading'}
                style={{
                  background: bucketsStatus === 'loading' ? '#94a3b8' : '#1d4ed8', color: 'white',
                  padding: '12px 28px', borderRadius: 10, fontWeight: 800, border: 'none',
                  cursor: bucketsStatus === 'loading' ? 'not-allowed' : 'pointer', fontSize: 14,
                }}
              >
                {bucketsStatus === 'loading' ? '⏳ बनवत आहे...' : '🗂️ Storage Buckets बनवा'}
              </button>
            </div>
          )}

          {bucketsStatus === 'ok' && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#166534' }}>
              🎉 Photos, documents, notices सगळे files Supabase Storage मध्ये save होतील!
            </div>
          )}
        </div>

        {/* STEP 3 — All done! */}
        {dbStatus === 'ok' && bucketsStatus === 'ok' && (
          <div style={{ background: 'linear-gradient(135deg, #7c2d12, #b45309)', borderRadius: 16, padding: 32, textAlign: 'center', color: 'white', marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Setup पूर्ण झाले!</h2>
            <p style={{ color: '#fed7aa', marginBottom: 24, fontSize: 15 }}>
              Database + Storage — सगळे तयार आहे. Admin Panel उघडा!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/admin" style={{ background: 'white', color: '#7c2d12', padding: '13px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', fontSize: 15 }}>
                📊 Admin Panel उघडा
              </a>
              <a href="/admission" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '13px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15, border: '2px solid rgba(255,255,255,0.4)' }}>
                📋 Admission Form
              </a>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#0f172a' }}>💡 कसे काम करते?</div>
            <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.9 }}>
              • विद्यार्थी form भरतो → <strong>S-01, S-02...</strong> code मिळतो<br />
              • Data <strong>Supabase database</strong> मध्ये save होतो<br />
              • Admin <strong>search</strong> मध्ये code किंवा नाव शोधतो<br />
              • <strong>WhatsApp</strong> बटणाने पालकांना message जातो<br />
              • सगळे <strong>free</strong> — कोणताही खर्च नाही!
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#0f172a' }}>📞 मदत हवी असल्यास</div>
            <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 2 }}>
              <strong>Supabase URL:</strong><br />
              <code style={{ fontSize: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                {supabaseUrl || 'Not set'}
              </code><br /><br />
              <strong>Project Ref:</strong> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{projectRef}</code>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/" style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 700, textDecoration: 'none', color: '#374151', fontSize: 14 }}>🏠 Home</a>
          <a href="/admin" style={{ padding: '10px 20px', background: '#7c2d12', color: 'white', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>📊 Admin Panel</a>
          <a href="/admission" style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 700, textDecoration: 'none', color: '#374151', fontSize: 14 }}>📋 Admission Form</a>
        </div>
      </div>
    </div>
  )
}
