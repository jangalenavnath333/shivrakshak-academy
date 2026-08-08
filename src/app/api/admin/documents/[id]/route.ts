import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { documentStoragePath } from '@/lib/document-policy'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: document, error } = await supabase.from('documents').select('file_url').eq('id', id).single()
  if (error || !document) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  const { data, error: signError } = await supabase.storage
    .from('student-documents')
    .createSignedUrl(documentStoragePath(document.file_url), 60)
  if (signError) return NextResponse.json({ error: 'Document is unavailable' }, { status: 404 })

  return NextResponse.redirect(data.signedUrl)
}
