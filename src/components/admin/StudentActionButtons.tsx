'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

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
    <div style={{ display: 'flex', gap: 8 }}>
      {showProfile && (
        <Link href={`/admin/students/${studentId}`} className="btn btn-secondary" style={{ padding: '5px 11px', fontSize: 12 }}>
          प्रोफाइल पहा
        </Link>
      )}
      <a href={`/api/admin/print/${studentId}`} target="_blank" className="btn btn-secondary" style={{ padding: '5px 11px', fontSize: 12 }}>
        🖨️ Form
      </a>
      <Link href={`/admin/students/edit/${studentId}`} className="btn btn-secondary" style={{ padding: '5px 8px', fontSize: 12 }} title="Edit">
        ✏️
      </Link>
      <button onClick={archiveStudent} disabled={loading} className="btn btn-secondary" style={{ padding: '5px 8px', fontSize: 12 }} title="Archive">
        {loading ? '...' : '🗑️'}
      </button>
    </div>
  )
}
