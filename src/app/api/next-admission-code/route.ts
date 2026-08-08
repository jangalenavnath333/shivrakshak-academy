import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getAdminUser } from '@/lib/admin-auth'

// Returns next sequential admission code: S-01, S-02, S-03...
export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supabase = createSupabaseAdminClient()

    // Get all roll_numbers matching S-XX pattern
    const { data, error } = await supabase
      .from('students')
      .select('roll_number')
      .like('roll_number', 'S-%')
      .order('created_at', { ascending: false })

    if (error) throw error

    let maxNum = 0
    for (const row of data || []) {
      const match = row.roll_number?.match(/^S-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    }

    const nextNum = maxNum + 1
    const code = `S-${String(nextNum).padStart(2, '0')}`

    return NextResponse.json({ code, next: nextNum })
  } catch {
    // Fallback if DB not connected — always S-01
    return NextResponse.json({ code: 'S-01', next: 1 })
  }
}
