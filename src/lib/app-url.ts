import 'server-only'

/**
 * Base URL of this Next.js app, for links we hand to students (print form, login).
 *
 * NEXT_PUBLIC_APP_URL has been misconfigured in production to the Supabase REST
 * endpoint, which turned every print link into a 401 from Supabase instead of our
 * printable form. A link that leaves the app is worse than no link, so a configured
 * value is only trusted when it actually looks like this app: anything pointing at
 * Supabase, at a REST path, or not parseable as http(s) is ignored in favour of the
 * request origin.
 */
const isUsableAppOrigin = (value: string) => {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (url.hostname.endsWith('.supabase.co')) return false
    if (/\/rest\/v\d/.test(url.pathname)) return false
    return true
  } catch {
    return false
  }
}

export function appBaseUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured && isUsableAppOrigin(configured)) {
    return new URL(configured).origin
  }
  if (configured) {
    console.error('NEXT_PUBLIC_APP_URL is not a valid app origin; falling back to the request origin')
  }

  if (request) {
    try {
      return new URL(request.url).origin
    } catch {
      // fall through to the Vercel-provided host
    }
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`

  return ''
}
