'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Archive, Eye, FileText, Pencil } from 'lucide-react'

export default function StudentActionButtons({ studentId, showProfile = true }: { studentId: string, showProfile?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const archiveStudent = async () => {
    if (!confirm('तुम्हाला खात्री आहे का की तुम्हाला हा विद्यार्थी अर्काईव्ह (Archive) करायचा आहे?')) return
    setLoading(true)
    try {
      const response = await fetch('/api/admin/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', studentId })
      })
      if (!response.ok) throw new Error('Archive failed')
      router.refresh()
    } catch (err) {
      alert('Failed to archive student.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-student-actions">
      {showProfile && (
        <Link href={`/admin/students/${studentId}`} className="btn adm-action-primary">
          <Eye size={15} /> प्रोफाइल
        </Link>
      )}
      <a href={`/api/admin/print/${studentId}`} target="_blank" className="btn btn-secondary" title="प्रवेश Form / PDF">
        <FileText size={15} /> Form
      </a>
      <Link href={`/admin/students/edit/${studentId}`} className="btn btn-secondary adm-icon-button" title="माहिती बदला" aria-label="माहिती बदला">
        <Pencil size={15} />
      </Link>
      <button onClick={archiveStudent} disabled={loading} className="btn btn-secondary adm-icon-button adm-action-danger" title="अर्काईव्ह करा" aria-label="अर्काईव्ह करा">
        {loading ? '…' : <Archive size={15} />}
      </button>
    </div>
  )
}
