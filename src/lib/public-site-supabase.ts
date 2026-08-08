import { createClient } from '@supabase/supabase-js'

// Public website data lives in the academy-owned Supabase project.
// The publishable key is intentionally safe for browser/server public-data access.
const PUBLIC_SITE_URL = 'https://thtvsqxxbkhdapaxtcqi.supabase.co'
const PUBLIC_SITE_KEY = 'sb_publishable_iSAWNG8Cy_Mg7saeqLCL3g_Bn-KybVD'

export function createPublicSiteClient() {
  return createClient(PUBLIC_SITE_URL, PUBLIC_SITE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

