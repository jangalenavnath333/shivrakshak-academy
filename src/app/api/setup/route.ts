import { NextResponse } from 'next/server'

// One-time setup route — run once to create all tables
// Visit: http://localhost:3000/api/setup
export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
    return NextResponse.json({ error: 'Supabase keys not set in .env.local' }, { status: 400 })
  }

  const statements = [
    // Students table
    `CREATE TABLE IF NOT EXISTS students (
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
    )`,

    // Fee payments
    `CREATE TABLE IF NOT EXISTS fee_payments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      amount_paid NUMERIC(10,2) NOT NULL,
      payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
      payment_mode TEXT DEFAULT 'cash',
      receipt_no TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Documents
    `CREATE TABLE IF NOT EXISTS documents (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      doc_type TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Mess subscriptions
    `CREATE TABLE IF NOT EXISTS mess_subscriptions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      amount NUMERIC(10,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      reminder_sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Notices
    `CREATE TABLE IF NOT EXISTS notices (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT DEFAULT 'general',
      attachment_url TEXT,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // WhatsApp logs
    `CREATE TABLE IF NOT EXISTS whatsapp_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      phone_number TEXT NOT NULL,
      message_type TEXT,
      message_text TEXT,
      status TEXT DEFAULT 'sent',
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Fee summary view
    `CREATE OR REPLACE VIEW student_fee_summary AS
      SELECT
        s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee,
        COALESCE(SUM(fp.amount_paid), 0) AS total_paid,
        s.total_fee - COALESCE(SUM(fp.amount_paid), 0) AS pending_amount
      FROM students s
      LEFT JOIN fee_payments fp ON s.id = fp.student_id
      GROUP BY s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee`,

    // Mess expiry view
    `CREATE OR REPLACE VIEW mess_expiry_reminders AS
      SELECT ms.*, s.name AS student_name, s.phone AS student_phone, s.parent_phone
      FROM mess_subscriptions ms
      JOIN students s ON ms.student_id = s.id
      WHERE ms.is_active = TRUE
        AND ms.end_date <= CURRENT_DATE + INTERVAL '2 days'
        AND ms.end_date >= CURRENT_DATE`,
  ]

  const results: { sql: string; status: string; error?: string }[] = []

  for (const sql of statements) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql }),
      })

      if (!res.ok) {
        // Try alternative: direct query via pg endpoint
        const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ query: sql }),
        })
        const text = await res2.text()
        results.push({ sql: sql.slice(0, 50) + '...', status: res2.ok ? '✅ done' : '⚠️ ' + text.slice(0, 100) })
      } else {
        results.push({ sql: sql.slice(0, 50) + '...', status: '✅ done' })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ sql: sql.slice(0, 50) + '...', status: '⚠️ ' + msg })
    }
  }

  // Return HTML response
  const html = `<!DOCTYPE html>
<html lang="mr">
<head>
<meta charset="UTF-8">
<title>Setup — शिवरक्षक अकॅडमी</title>
<style>
  body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; background: #f8fafc; }
  h1 { color: #7c2d12; }
  .item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 8px 0; }
  .done { border-color: #86efac; }
  .warn { border-color: #fcd34d; }
  .note { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; }
  a { color: #7c2d12; font-weight: bold; }
  pre { background: #1e293b; color: #86efac; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; }
</style>
</head>
<body>
<h1>🛡️ Database Setup Results</h1>
<p>जर खाली "done" दिसत असेल तर tables बनले. जर warnings असतील तर खाली SQL manually run करा.</p>

${results.map(r => `
  <div class="item ${r.status.includes('✅') ? 'done' : 'warn'}">
    <strong>${r.status}</strong><br>
    <small style="color:#64748b">${r.sql}</small>
    ${r.error ? `<div style="color:red;font-size:12px">${r.error}</div>` : ''}
  </div>
`).join('')}

<div class="note">
  <strong>⚠️ जर tables नाही बनले:</strong><br><br>
  <a href="https://supabase.com/dashboard/project/bytoykdukngbwiespbwc/sql" target="_blank">
    👉 Supabase SQL Editor उघडा
  </a>
  आणि खालील SQL paste करा → Run दाबा:
</div>

<pre>
-- हे सर्व copy करा आणि Supabase SQL Editor मध्ये paste करा

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
  AND ms.end_date &lt;= CURRENT_DATE + INTERVAL '2 days'
  AND ms.end_date &gt;= CURRENT_DATE;
</pre>

<p style="margin-top:30px">
  <a href="/admin">👉 Admin Panel उघडा</a> &nbsp;|&nbsp;
  <a href="/">🏠 Website</a>
</p>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
