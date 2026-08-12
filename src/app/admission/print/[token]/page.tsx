import { notFound } from 'next/navigation'
import type { FormValues } from '../../PrintableForm'
import { hashAdmissionPrintToken } from '@/lib/admission-print-token'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import PrintAdmission from './PrintAdmission'

export const dynamic = 'force-dynamic'

export default async function AdmissionPrintPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[A-Za-z0-9_-]{32,100}$/.test(token)) notFound()
  const admin = createSupabaseAdminClient()
  const tokenHash = hashAdmissionPrintToken(token)
  const { data: printToken } = await admin.from('admission_print_tokens').select('student_id, expires_at, revoked_at').eq('token_hash', tokenHash).maybeSingle()
  if (!printToken || printToken.revoked_at || (printToken.expires_at && new Date(printToken.expires_at) < new Date())) notFound()

  const { data: student } = await admin.from('students')
    .select('roll_number, total_fee, admission_details, admission_status, print_enabled_at, activation_fee_payment_id')
    .eq('id', printToken.student_id).maybeSingle()
  if (!student?.roll_number || student.admission_status !== 'active' || !student.print_enabled_at || !student.activation_fee_payment_id) notFound()

  const { data: payment } = await admin.from('fee_payments').select('amount_paid, payment_date, payment_mode').eq('id', student.activation_fee_payment_id).maybeSingle()
  if (!payment) notFound()
  const form = {
    ...(student.admission_details as FormValues),
    totalFee: String(student.total_fee),
    paidAmount: String(payment.amount_paid),
    paymentDate: payment.payment_date,
    paymentMode: payment.payment_mode,
  }

  const { data: photoDoc } = await admin.from('documents').select('file_url').eq('student_id', printToken.student_id).eq('doc_type', 'photo').maybeSingle()
  const signedPhoto = photoDoc?.file_url ? await admin.storage.from('student-documents').createSignedUrl(photoDoc.file_url, 300) : null
  return <PrintAdmission form={form} rollNumber={student.roll_number} photo={signedPhoto?.data?.signedUrl} />
}
