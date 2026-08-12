import 'server-only'

import { createHash, createHmac } from 'node:crypto'

function printTokenSecret() {
  const secret = process.env.ADMISSION_PRINT_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Admission print security is not configured')
  return secret
}

export function createAdmissionPrintToken(studentId: string) {
  return createHmac('sha256', printTokenSecret()).update(studentId).digest('base64url')
}

export function hashAdmissionPrintToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
