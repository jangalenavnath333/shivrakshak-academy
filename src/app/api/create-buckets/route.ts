import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Visit: http://localhost:3000/api/create-buckets
export async function GET() {
  const supabase = getSupabaseAdmin()

  const buckets = [
    { name: 'student-documents', public: false },
    { name: 'student-photos', public: true },
    { name: 'notice-attachments', public: true },
  ]

  const results = []

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    })

    if (error && !error.message.includes('already exists')) {
      results.push({ bucket: bucket.name, status: '❌ Error: ' + error.message })
    } else {
      results.push({ bucket: bucket.name, status: error ? '✅ आधीच आहे' : '✅ नवीन बनवला' })
    }
  }

  const html = `<!DOCTYPE html>
<html lang="mr">
<head>
<meta charset="UTF-8">
<title>Buckets — शिवरक्षक अकॅडमी</title>
<style>
  body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f8fafc; }
  h1 { color: #7c2d12; }
  .item { background: white; border: 1px solid #86efac; border-radius: 8px; padding: 14px 18px; margin: 8px 0; font-size: 15px; }
  a { color: #7c2d12; font-weight: bold; display: inline-block; margin-top: 20px; }
</style>
</head>
<body>
<h1>🗂️ Storage Buckets Setup</h1>
${results.map(r => `<div class="item">${r.status} — <strong>${r.bucket}</strong></div>`).join('')}
<br>
<a href="/api/setup">📊 Database Tables Setup करा</a>
<br>
<a href="/admin">👉 Admin Panel उघडा</a>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
