import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { DOCUMENT_MIME_TYPE_SET, DOCUMENT_TYPE_SET, MAX_ADMISSION_DOCUMENT_BYTES, MAX_DOCUMENT_BYTES } from '@/lib/document-policy'
import { encryptAdmissionPassword } from '@/lib/admission-credentials'

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => value === '' ? undefined : value, schema.optional())

const admissionDetailsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  middleName: z.string().trim().max(80),
  lastName: z.string().trim().min(1).max(80),
  fatherFirst: z.string().trim().min(1).max(80),
  fatherMiddle: z.string().trim().max(80),
  fatherLast: z.string().trim().max(80),
  address: z.string().trim().min(1).max(500),
  village: z.string().trim().max(120),
  taluka: z.string().trim().max(120),
  district: z.string().trim().max(120),
  pincode: z.string().trim().regex(/^\d{6}$/).optional().or(z.literal('')),
  studentPhone: z.string().trim().regex(/^\d{10}$/),
  studentWhatsapp: z.string().trim().regex(/^\d{10}$/).optional().or(z.literal('')),
  parentPhone: z.string().trim().regex(/^\d{10}$/),
  parentWhatsapp: z.string().trim().regex(/^\d{10}$/).optional().or(z.literal('')),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  aadhaar: z.string().trim().regex(/^\d{12}$/).optional().or(z.literal('')),
  guaranteeNo: z.string().trim().max(80),
  dob: z.string().max(10),
  age: z.string().max(3),
  gender: z.enum(['male', 'female']),
  courses: z.array(z.enum(['police', 'army', 'navy', 'mpsc', 'railway', 'staff', 'saral', 'other'])).min(1).max(8),
  admissionDate: z.string().max(10),
  durationMonths: z.string().max(3),
  endDate: z.string().max(10),
  totalDays: z.string().max(5),
  height: z.string().max(8),
  weight: z.string().max(8),
  chest: z.string().max(8),
  totalFee: z.string().max(12),
  paidAmount: z.string().max(12),
  paymentDate: z.string().max(10),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
})

const admissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  parent_name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(500).optional().default(''),
  phone: z.string().trim().regex(/^\d{10}$/).optional().or(z.literal('')),
  parent_phone: z.string().trim().regex(/^\d{10}$/),
  aadhaar_no: z.string().trim().regex(/^\d{12}$/).optional().or(z.literal('')),
  guarantee_letter_no: z.string().trim().max(80).optional().default(''),
  dob: z.string().optional().default(''),
  gender: z.enum(['male', 'female']),
  course: z.enum(['police', 'navy', 'mpsc', 'staff_selection', 'saral_seva', 'army', 'railway', 'other']),
  admission_date: z.string().optional().default(''),
  duration: z.string().trim().max(80).optional().default(''),
  age: optionalNumber(z.coerce.number().int().min(14).max(80)),
  height: optionalNumber(z.coerce.number().min(100).max(250)),
  weight: optionalNumber(z.coerce.number().min(25).max(250)),
  chest: optionalNumber(z.coerce.number().min(40).max(200)),
  admission_details: z.string().max(20_000),
  student_password: z.string().min(8).max(72)
    .regex(/[A-Za-z]/)
    .regex(/\d/)
    .regex(/[^A-Za-z0-9]/),
  password_confirmation: z.string().min(8).max(72),
  agreed: z.literal('true'),
}).refine((value) => value.student_password === value.password_confirmation, {
  path: ['password_confirmation'],
  message: 'Passwords do not match',
})

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_ADMISSION_DOCUMENT_BYTES + 1024 * 1024) {
      return NextResponse.json({ error: 'Admission upload is too large' }, { status: 413 })
    }
    const supabase = createSupabaseAdminClient()
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const clientIp = forwardedFor || request.headers.get('x-real-ip') || 'unknown'
    const { data: ipAllowed, error: ipLimitError } = await supabase.rpc('consume_admission_rate_limit', { p_key: `ip:${clientIp}` })
    if (ipLimitError) {
      console.error('Admission IP rate-limit check failed', { code: ipLimitError.code })
      return NextResponse.json({ error: 'Admission service is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    }
    if (!ipAllowed) {
      return NextResponse.json({ error: 'Too many admission attempts. Please try again later.' }, { status: 429 })
    }

    const body = await request.formData()
    const raw = Object.fromEntries(
      Array.from(body.entries()).filter(([, value]) => typeof value === 'string'),
    )
    const parsed = admissionSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid admission details', issues: parsed.error.flatten() }, { status: 400 })
    }

    let rawAdmissionDetails: unknown
    try {
      rawAdmissionDetails = JSON.parse(parsed.data.admission_details)
    } catch {
      return NextResponse.json({ error: 'Invalid admission details' }, { status: 400 })
    }
    const admissionDetails = admissionDetailsSchema.safeParse(rawAdmissionDetails)
    if (!admissionDetails.success) {
      return NextResponse.json({ error: 'Invalid admission details', issues: admissionDetails.error.flatten() }, { status: 400 })
    }

    const { data: phoneAllowed, error: phoneLimitError } = await supabase.rpc('consume_admission_rate_limit', { p_key: `phone:${parsed.data.parent_phone}` })
    if (phoneLimitError) {
      console.error('Admission phone rate-limit check failed', { code: phoneLimitError.code })
      return NextResponse.json({ error: 'Admission service is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    }
    if (!phoneAllowed) {
      return NextResponse.json({ error: 'Too many admission attempts for this phone number.' }, { status: 429 })
    }

    const files = Array.from(body.entries()).filter((entry): entry is [string, File] => entry[1] instanceof File)
    const seenTypes = new Set<string>()
    let totalBytes = 0
    for (const [key, file] of files) {
      const documentType = key.startsWith('document:') ? key.slice(9) : ''
      if (!DOCUMENT_TYPE_SET.has(documentType) || seenTypes.has(documentType)) {
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
      }
      seenTypes.add(documentType)
      totalBytes += file.size
      if (!DOCUMENT_MIME_TYPE_SET.has(file.type) || file.size > MAX_DOCUMENT_BYTES || totalBytes > MAX_ADMISSION_DOCUMENT_BYTES) {
        return NextResponse.json({ error: `Invalid document: ${file.name}` }, { status: 400 })
      }
    }

    const data = parsed.data
    const pendingAdmissionDetails = {
      ...admissionDetails.data,
      totalFee: '',
      paidAmount: '',
      paymentDate: '',
      paymentMode: 'cash' as const,
    }
    const { data: student, error: studentError } = await supabase.from('students').insert({
      name: data.name,
      parent_name: data.parent_name,
      address: data.address,
      phone: data.phone || null,
      parent_phone: data.parent_phone,
      aadhaar_no: data.aadhaar_no || null,
      guarantee_letter_no: data.guarantee_letter_no || null,
      dob: data.dob || null,
      gender: data.gender,
      course: data.course,
      admission_date: data.admission_date || null,
      duration: data.duration || null,
      age: data.age || null,
      height: data.height || null,
      weight: data.weight || null,
      chest: data.chest || null,
      total_fee: 0,
      is_active: false,
      admission_status: 'pending',
      roll_number: null,
      admission_details: pendingAdmissionDetails,
    }).select('id').single()

    if (studentError || !student) {
      console.error('Admission student insert failed', { code: studentError?.code })
      return NextResponse.json({ error: 'Admission could not be saved' }, { status: 500 })
    }

    const uploadedPaths: string[] = []
    const rollbackAdmission = async () => {
      const storageCleanup = uploadedPaths.length
        ? await supabase.storage.from('student-documents').remove(uploadedPaths)
        : { error: null }
      const studentCleanup = await supabase.from('students').delete().eq('id', student.id)
      if (storageCleanup.error || studentCleanup.error) {
        console.error('Admission cleanup requires reconciliation', {
          studentId: student.id,
          storageError: storageCleanup.error,
          studentError: studentCleanup.error,
        })
        return false
      }
      return true
    }

    const { error: credentialError } = await supabase.from('pending_student_credentials').insert({
      student_id: student.id,
      password_encrypted: encryptAdmissionPassword(data.student_password),
    })
    if (credentialError) {
      console.error('Pending admission credential save failed', { studentId: student.id, code: credentialError.code })
      await rollbackAdmission()
      return NextResponse.json({ error: 'Exam Login माहिती सुरक्षित करता आली नाही.' }, { status: 500 })
    }

    try {
      for (const [key, file] of files) {
        const docType = key.slice(9)
        const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const path = `${student.id}/${docType}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('student-documents')
          .upload(path, file, { upsert: true, contentType: file.type })
        if (uploadError) throw uploadError
        uploadedPaths.push(path)

        const { error: documentError } = await supabase.from('documents').insert({
          student_id: student.id,
          doc_type: docType,
          file_url: path,
          file_name: file.name,
        })
        if (documentError) throw documentError
      }
    } catch {
      if (!await rollbackAdmission()) {
        return NextResponse.json({ error: 'Admission failed and requires admin reconciliation', reference: student.id }, { status: 500 })
      }
      return NextResponse.json({ error: 'Documents could not be saved; no admission was created' }, { status: 500 })
    }

    return NextResponse.json({ submitted: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid admission request' }, { status: 400 })
  }
}
