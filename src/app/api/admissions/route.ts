import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => value === '' ? undefined : value, schema.optional())

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
  total_fee: z.coerce.number().min(0).max(10_000_000).default(0),
  agreed: z.literal('true'),
})

const allowedDocumentTypes = new Set([
  'photo', 'signature', 'aadhaar_front', 'aadhaar_back', 'marksheet_10',
  'marksheet_12', 'caste_certificate', 'domicile', 'sports_certificate', 'other',
])
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
const maxFileSize = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const body = await request.formData()
    const raw = Object.fromEntries(
      Array.from(body.entries()).filter(([, value]) => typeof value === 'string'),
    )
    const parsed = admissionSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid admission details', issues: parsed.error.flatten() }, { status: 400 })
    }

    const files = Array.from(body.entries()).filter((entry): entry is [string, File] => entry[1] instanceof File)
    for (const [key, file] of files) {
      if (!key.startsWith('document:') || !allowedDocumentTypes.has(key.slice(9))) {
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
      }
      if (!allowedMimeTypes.has(file.type) || file.size > maxFileSize) {
        return NextResponse.json({ error: `Invalid document: ${file.name}` }, { status: 400 })
      }
    }

    const supabase = createSupabaseAdminClient()
    const data = parsed.data
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
      total_fee: data.total_fee,
    }).select('id, roll_number').single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Admission could not be saved' }, { status: 500 })
    }

    const uploadedPaths: string[] = []
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

        const { error: documentError } = await supabase.from('documents').upsert({
          student_id: student.id,
          doc_type: docType,
          file_url: path,
          file_name: file.name,
        }, { onConflict: 'student_id,doc_type' })
        if (documentError) throw documentError
      }
    } catch {
      if (uploadedPaths.length) await supabase.storage.from('student-documents').remove(uploadedPaths)
      await supabase.from('students').delete().eq('id', student.id)
      return NextResponse.json({ error: 'Documents could not be saved; the admission was rolled back' }, { status: 500 })
    }

    return NextResponse.json({ code: student.roll_number }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid admission request' }, { status: 400 })
  }
}
