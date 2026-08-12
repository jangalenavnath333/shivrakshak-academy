'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import PrintableForm, { type FormValues } from '../../PrintableForm'

export default function PrintAdmission({ form, rollNumber, photo }: {
  form: FormValues
  rollNumber: string
  photo?: string | null
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 350)
    return () => window.clearTimeout(timer)
  }, [])
  return <>
    <main className="adm-wrap no-print" style={{ minHeight: '100vh', paddingTop: 80 }}>
      <div className="adm-success">
        <div className="succ-icon">✅</div>
        <h1>प्रवेश मंजूर</h1>
        <p className="succ-sub">विद्यार्थी ID: <strong>{rollNumber}</strong></p>
        <button className="btn-print" onClick={() => window.print()}>🖨️ 3 पानी अर्ज Print / Save as PDF</button>
        <div className="succ-links"><Link href="/">🏠 मुख्यपृष्ठ</Link></div>
      </div>
    </main>
    <PrintableForm form={form} photo={photo} rollNumber={rollNumber} />
  </>
}
