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
    .select('*')
    .eq('id', printToken.student_id).maybeSingle()
  if (!student?.roll_number || student.admission_status !== 'active' || !student.print_enabled_at || !student.activation_fee_payment_id) notFound()

  const { data: payment } = await admin.from('fee_payments').select('amount_paid, payment_date, payment_mode').eq('id', student.activation_fee_payment_id).maybeSingle()
  if (!payment) notFound()
  const details = student.admission_details as any || {}
  
  const nameParts = (student.name || '').split(' ')
  const firstName = nameParts[0] || details.firstName || ''
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : details.lastName || ''
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : details.middleName || ''

  const parentParts = (student.parent_name || '').split(' ')
  const fatherFirst = parentParts[0] || details.fatherFirst || ''
  const fatherLast = parentParts.length > 1 ? parentParts[parentParts.length - 1] : details.fatherLast || ''
  const fatherMiddle = parentParts.length > 2 ? parentParts.slice(1, -1).join(' ') : details.fatherMiddle || ''

  const form = {
    ...details,
    firstName,
    middleName,
    lastName,
    fatherFirst,
    fatherMiddle,
    fatherLast,
    address: student.address || details.address || '',
    studentPhone: student.phone || details.studentPhone || '',
    studentWhatsapp: student.phone || details.studentWhatsapp || '',
    parentPhone: student.parent_phone || details.parentPhone || '',
    parentWhatsapp: student.parent_phone || details.parentWhatsapp || '',
    aadhaar: student.aadhaar_no || details.aadhaar || '',
    guaranteeNo: student.guarantee_letter_no || details.guaranteeNo || '',
    dob: student.dob || details.dob || '',
    age: student.age ? String(student.age) : details.age || '',
    gender: student.gender || details.gender || '',
    courses: student.course ? [student.course] : details.courses || [],
    admissionDate: student.admission_date || details.admissionDate || '',
    durationMonths: student.duration || details.durationMonths || '',
    height: student.height ? String(student.height) : details.height || '',
    weight: student.weight ? String(student.weight) : details.weight || '',
    chest: student.chest ? String(student.chest) : details.chest || '',
    totalFee: String(student.total_fee),
    paidAmount: String(payment.amount_paid),
    paymentDate: payment.payment_date,
    paymentMode: payment.payment_mode,
  } as FormValues

  const { data: photoDoc } = await admin.from('documents').select('file_url').eq('student_id', printToken.student_id).eq('doc_type', 'photo').maybeSingle()
  const signedPhoto = photoDoc?.file_url ? await admin.storage.from('student-documents').createSignedUrl(photoDoc.file_url, 300) : null
  return <PrintAdmission form={form} rollNumber={student.roll_number} photo={signedPhoto?.data?.signedUrl} />
}
