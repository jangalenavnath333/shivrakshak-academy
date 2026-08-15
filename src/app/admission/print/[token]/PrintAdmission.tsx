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
    <style dangerouslySetInnerHTML={{ __html: `
      :root { --adm-bg: #030811; --adm-card: #091321; --adm-acc: #f97316; }
      body { margin:0; font-family:var(--font-sans),sans-serif; background:var(--adm-bg); color:#f8fafc; }
      .adm-wrap { padding:0 20px 40px; }
      .adm-success { max-width:560px; margin:40px auto; padding:36px 30px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.09); border-radius:20px; text-align:center; }
      .succ-icon { font-size:60px; margin-bottom:8px; }
      .adm-success h1 { color:#4ade80; font-size:27px; font-weight:900; margin:0 0 6px; }
      .succ-sub { color:#64748b; font-size:14px; margin:0 0 24px; }
      .btn-print { width:100%; padding:17px; background:linear-gradient(135deg,#f97316,#c2410c); border:none; border-radius:11px; color:#fff; font-weight:800; font-size:16px; cursor:pointer; box-shadow:0 6px 24px rgba(249,115,22,.4); font-family:inherit; }
      .succ-links { display:flex; gap:11px; margin-top:22px; }
      .succ-links a { flex:1; padding:13px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:9px; color:#cbd5e1; text-decoration:none; font-size:14px; font-weight:600; }
      
      @media (max-width:700px) {
        .adm-success { margin:20px 12px; padding:28px 20px; }
      }
    `}} />
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
