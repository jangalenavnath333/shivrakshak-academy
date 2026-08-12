import { createClient } from '@supabase/supabase-js'

// Public website data lives in the academy-owned Supabase project.
// The publishable/anon key is safe for browser exposure (RLS-protected), but it is read
// from the environment rather than hardcoded so the project can be rotated or pointed at
// a different environment without a code change.
export function createPublicSiteClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Public site Supabase environment is not configured')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
