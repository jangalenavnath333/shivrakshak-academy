// src/app/api/next-admission-code/route.ts
// Sequential प्रवेश क्रमांक — S-01, S-02, S-03 ...

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder')) {
      return NextResponse.json({ code: 'S-01', demo: true })
    }

    const supabase = createClient(url, key)

    const { data } = await supabase
      .from('students')
      .select('roll_number')
      .like('roll_number', 'S-%')
      .order('created_at', { ascending: false })
      .limit(200)

    let max = 0
    for (const row of data || []) {
      const n = parseInt(String(row.roll_number).replace('S-', ''), 10)
      if (!isNaN(n) && n > max) max = n
    }

    const next = max + 1
    const code = `S-${String(next).padStart(2, '0')}`

    return NextResponse.json({ code })
  } catch {
    return NextResponse.json({ code: `S-${String(Date.now()).slice(-4)}`, fallback: true })
  }
}
