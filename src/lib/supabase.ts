import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Browser client. Authentication is persisted in secure Supabase session cookies.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
