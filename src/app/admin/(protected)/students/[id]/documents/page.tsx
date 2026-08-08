'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DOC_TYPES } from '@/lib/utils'
import Link from 'next/link'
import { use } from 'react'

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [student, setStudent] = useState<{ name: string } | null>(null)
  const [docs, setDocs] = useState<{ id: string; doc_type: string; file_url: string; file_name: string }[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    supabase.from('students').select('name').eq('id', id).single().then(({ data }) => setStudent(data))
    loadDocs()
  }, [id])

  const loadDocs = async () => {
    const { data } = await supabase.from('documents').select('*').eq('student_id', id)
    setDocs(data || [])
  }

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType)
    const payload = new FormData()
    payload.append('student_id', id)
    payload.append('doc_type', docType)
    payload.append('file', file)
    const response = await fetch('/api/admin/documents', { method: 'POST', body: payload })
    const result = await response.json()
    if (!response.ok) { alert('Upload error: ' + (result.error || 'Unknown error')); setUploading(null); return }
    setSuccessMsg(`✅ ${DOC_TYPES[docType]} upload झाला!`)
    setTimeout(() => setSuccessMsg(''), 3000)
    await loadDocs()
    setUploading(null)
  }

  const uploadedTypes = new Set(docs.map(d => d.doc_type))

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">📁 Documents — {student?.name}</div>
          <div className="page-subtitle">सर्व आवश्यक कागदपत्रे upload करा</div>
        </div>
        <Link href={`/admin/students/${id}`} className="btn btn-secondary">← परत</Link>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #16a34a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#166534', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {Object.entries(DOC_TYPES).map(([type, label]) => {
          const uploaded = uploadedTypes.has(type)
          const doc = docs.find(d => d.doc_type === type)
          return (
            <div key={type} style={{ background: 'white', border: `1.5px solid ${uploaded ? '#86efac' : '#e2e8f0'}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 24 }}>{label.split(' ')[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label.substring(label.indexOf(' ') + 1)}</div>
                  <span className={`badge ${uploaded ? 'badge-green' : 'badge-gray'}`}>{uploaded ? '✅ Upload झाला' : '⏳ बाकी'}</span>
                </div>
              </div>

              {uploaded && doc && (
                <a href={`/api/admin/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#3b82f6', marginBottom: 10, textDecoration: 'none' }}>
                  📥 {doc.file_name} पहा
                </a>
              )}

              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div className={`btn ${uploaded ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  {uploading === type ? '⏳ Upload होत आहे...' : uploaded ? '🔄 Replace करा' : '⬆️ Upload करा'}
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  disabled={!!uploading}
                  onChange={e => { if (e.target.files?.[0]) handleUpload(type, e.target.files[0]) }}
                />
              </label>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 14, fontSize: 13, color: '#78350f' }}>
        💡 PDF, JPG, PNG, WEBP files accept केल्या जातात. प्रत्येक file जास्तीत जास्त 10MB असावी.
      </div>
    </div>
  )
}
