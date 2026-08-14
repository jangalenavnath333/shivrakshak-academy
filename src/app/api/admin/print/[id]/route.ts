import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdmissionPrintToken, hashAdmissionPrintToken } from '@/lib/admission-print-token'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.redirect(new URL('/admin/login', request.url))

  const params = await props.params
  const studentId = params.id
  
  try {
    const admin = createSupabaseAdminClient()
    const token = createAdmissionPrintToken(studentId)
    const tokenHash = hashAdmissionPrintToken(token)

    // Auto-heal missing token row (useful for old students)
    await admin.from('admission_print_tokens').upsert({ student_id: studentId, token_hash: tokenHash, revoked_at: null }, { onConflict: 'token_hash' })

    // Auto-heal missing student print_enabled_at or activation_fee_payment_id
    const { data: student } = await admin.from('students').select('print_enabled_at, activation_fee_payment_id').eq('id', studentId).single()
    if (student && (!student.print_enabled_at || !student.activation_fee_payment_id)) {
      const updates: any = {}
      if (!student.print_enabled_at) updates.print_enabled_at = new Date().toISOString()
      if (!student.activation_fee_payment_id) {
         // find a fee payment
         const { data: payment } = await admin.from('fee_payments').select('id').eq('student_id', studentId).order('payment_date', { ascending: false }).limit(1).maybeSingle()
         if (payment) updates.activation_fee_payment_id = payment.id
      }
      if (Object.keys(updates).length > 0) {
        await admin.from('students').update(updates).eq('id', studentId)
      }
    }

    return NextResponse.redirect(new URL(`/admission/print/${token}`, request.url))
  } catch (err) {
    return NextResponse.json({ error: 'Token generation failed' }, { status: 500 })
  }
}
