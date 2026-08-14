export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL! + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data)
}
