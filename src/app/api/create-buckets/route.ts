import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getAdminUser } from '@/lib/admin-auth'

// Visit: http://localhost:3000/api/create-buckets
export async function POST() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (process.env.ALLOW_ADMIN_SETUP !== 'true') {
    return NextResponse.json({ error: 'Setup operations are disabled' }, { status: 403 })
  }
  const supabase = createSupabaseAdminClient()

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

  return NextResponse.json({ results })
}
