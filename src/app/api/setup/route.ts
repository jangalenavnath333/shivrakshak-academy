import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'

// Schema changes are intentionally manual and reviewable. This endpoint no longer
// attempts to execute arbitrary SQL with the service-role key.
export async function POST() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (process.env.ALLOW_ADMIN_SETUP !== 'true') {
    return NextResponse.json({ error: 'Setup operations are disabled' }, { status: 403 })
  }

  return NextResponse.json(
    {
      error: 'Remote schema execution is disabled',
      instructions: 'Review and apply SUPABASE-SETUP.sql, then supabase/security-hardening.sql, in the Supabase SQL Editor.',
    },
    { status: 410 },
  )
}
