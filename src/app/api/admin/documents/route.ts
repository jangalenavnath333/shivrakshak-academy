import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const allowedTypes = new Set(['photo', 'signature', 'aadhaar_front', 'aadhaar_back', 'marksheet_10', 'marksheet_12', 'caste_certificate', 'domicile', 'sports_certificate', 'other'])
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

export async function POST(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.formData()
  const studentId = body.get('student_id')
  const docType = body.get('doc_type')
  const file = body.get('file')

  if (typeof studentId !== 'string' || typeof docType !== 'string' || !allowedTypes.has(docType) || !(file instanceof File)) {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
  }
  if (!allowedMimeTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be PDF/JPG/PNG/WEBP and at most 10MB' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${studentId}/${docType}.${extension}`
  const { error: uploadError } = await supabase.storage.from('student-documents').upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

  const { error } = await supabase.from('documents').upsert({
    student_id: studentId,
    doc_type: docType,
    file_url: path,
    file_name: file.name,
  }, { onConflict: 'student_id,doc_type' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
