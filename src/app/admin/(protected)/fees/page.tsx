'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { AdmissionFormDetails, StudentFeeSummary } from '@/types'
import { adminMutation } from '@/lib/admin-api'

type Application = {
  id: string
  name: string
  parent_name: string | null
  phone: string | null
  parent_phone: string | null
  course: string | null
  total_fee: number | string | null
  admission_status: 'pending' | 'approved' | 'payment_recorded'
  created_at: string
  admission_details: Partial<AdmissionFormDetails>
}

type ActivationResult = {
  rollNumber: string
  printUrl: string
  delivery: { email: { sent: boolean; reason?: string }; whatsapp: { sent: boolean; reason?: string } }
}

export default function FeesPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [students, setStudents] = useState<StudentFeeSummary[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [totalFee, setTotalFee] = useState('')
  const [amount, setAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [mode, setMode] = useState<AdmissionFormDetails['paymentMode']>('cash')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [printUrl, setPrintUrl] = useState('')

  const refresh = useCallback(async () => {
    const [applicationsResponse, feeResponse] = await Promise.all([
      fetch('/api/admin/admissions', { cache: 'no-store' }).then(response => response.json()),
      supabase.from('student_fee_summary').select('*').order('name'),
    ])
    setApplications(applicationsResponse.applications || [])
    setStudents(feeResponse.data || [])
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch('/api/admin/admissions', { cache: 'no-store' }).then(response => response.json()),
      supabase.from('student_fee_summary').select('*').order('name'),
    ]).then(([applicationsResponse, feeResponse]) => {
      if (cancelled) return
      setApplications(applicationsResponse.applications || [])
      setStudents(feeResponse.data || [])
    })

    return () => { cancelled = true }
  }, [])

  const pendingApplications = applications.filter(application => application.admission_status === 'pending')
  const approvedApplications = applications.filter(application => application.admission_status === 'approved')
  // Fee is already recorded but the exam login / code delivery did not finish.
  const incompleteApplications = applications.filter(application => application.admission_status === 'payment_recorded')
  const selectedApplication = approvedApplications.find(application => application.id === selected)
  const selectedActiveStudent = students.find(student => student.id === selected && student.admission_status === 'active')
  const filtered = useMemo(() => !search ? students : students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) || student.roll_number?.includes(search)
  ), [search, students])

  const approve = async (studentId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/admissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', studentId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Approval failed')
      setSuccessMsg('✅ अर्ज approve झाला. आता तो Fee Entry मध्ये दिसेल.')
      await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Approval failed') }
    finally { setLoading(false) }
  }

  const activate = async () => {
    if (!selectedApplication || !totalFee || !amount) return
    setLoading(true); setPrintUrl('')
    try {
      const response = await fetch('/api/admin/admissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', studentId: selectedApplication.id, totalFee: Number(totalFee), amountPaid: Number(amount), paymentDate: payDate, paymentMode: mode }),
      })
      const result = await response.json() as ActivationResult & { error?: string }
      if (!response.ok) throw new Error(result.error || 'Activation failed')
      setSuccessMsg(`✅ Fee जमा झाली. Student Code ${result.rollNumber} तयार झाला.`)
      setPrintUrl(result.printUrl)
      setSelected(null); setTotalFee(''); setAmount('')
      await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Activation failed') }
    finally { setLoading(false) }
  }

  // Fee already recorded; finish the exam login + code/print delivery without charging again.
  const resume = async (studentId: string) => {
    setLoading(true); setPrintUrl('')
    try {
      const response = await fetch('/api/admin/admissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', studentId }),
      })
      const result = await response.json() as ActivationResult & { error?: string }
      if (!response.ok) throw new Error(result.error || 'Retry failed')
      setSuccessMsg(`✅ Activation पूर्ण झाली. Student Code ${result.rollNumber}.`)
      setPrintUrl(result.printUrl)
      await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Retry failed') }
    finally { setLoading(false) }
  }

  const addPayment = async (studentId: string) => {
    if (!amount) return
    setLoading(true)
    try {
      await adminMutation('fee.create', { student_id: studentId, amount_paid: Number(amount), payment_date: payDate, payment_mode: mode })
      setSuccessMsg(`✅ ₹${amount} जमा झाले.`); setAmount(''); setSelected(null); await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Payment failed') }
    finally { setLoading(false) }
  }

  const totalCollected = filtered.reduce((sum, item) => sum + Number(item.total_paid), 0)
  const totalPending = filtered.reduce((sum, item) => sum + Number(item.pending_amount), 0)

  return <div style={{ padding: 28 }}>
    <div className="page-header"><div><div className="page-title">💰 Admission Approval व Fee</div><div className="page-subtitle">Form approval → fee entry → code व 3-page PDF</div></div></div>
    {successMsg && <div style={{ background:'#dcfce7', border:'1px solid #16a34a', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'#166534', fontWeight:700 }}>{successMsg}</div>}
    {printUrl && <a href={printUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginBottom:20 }}>🖨️ 3 पानी Form Print / PDF</a>}

    <section style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:20, marginBottom:22 }}>
      <h2 style={{ margin:'0 0 12px', fontSize:18 }}>⏳ Approval साठी आलेले अर्ज ({pendingApplications.length})</h2>
      {pendingApplications.length === 0 ? <p style={{ color:'#94a3b8' }}>Pending अर्ज नाहीत.</p> : <div style={{ overflowX:'auto' }}><table className="data-table"><thead><tr><th>नाव</th><th>मोबाईल</th><th>कोर्स</th><th>Submit तारीख</th><th></th></tr></thead><tbody>{pendingApplications.map(application => <tr key={application.id}><td><b>{application.name}</b><div style={{ fontSize:11, color:'#64748b' }}>{application.parent_name}</div></td><td>{application.phone}<div style={{ fontSize:11, color:'#64748b' }}>पालक: {application.parent_phone}</div></td><td>{application.course}</td><td>{new Date(application.created_at).toLocaleString('mr-IN')}</td><td><button className="btn btn-primary" disabled={loading} onClick={() => approve(application.id)}>✅ Approve</button></td></tr>)}</tbody></table></div>}
    </section>

    {incompleteApplications.length > 0 && <section style={{ background:'#fff', border:'1px solid #f59e0b', borderRadius:12, padding:20, marginBottom:22 }}>
      <h2 style={{ margin:'0 0 6px', fontSize:18 }}>⚠️ अपूर्ण Activation ({incompleteApplications.length})</h2>
      <p style={{ margin:'0 0 12px', fontSize:13, color:'#92400e' }}>यांची fee नोंदली गेली आहे, पण Exam Login किंवा code delivery अपूर्ण राहिली. पुन्हा प्रयत्न केल्यास fee दुसऱ्यांदा आकारली जाणार नाही.</p>
      <div style={{ overflowX:'auto' }}><table className="data-table"><thead><tr><th>नाव</th><th>मोबाईल</th><th>एकूण फी</th><th></th></tr></thead><tbody>{incompleteApplications.map(application => <tr key={application.id}><td><b>{application.name}</b></td><td>{application.phone || application.parent_phone}</td><td>{formatCurrency(Number(application.total_fee || 0))}</td><td><button type="button" className="btn btn-primary" disabled={loading} onClick={() => resume(application.id)}>🔄 पुन्हा प्रयत्न करा</button></td></tr>)}</tbody></table></div>
    </section>}

    <section style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 360px', gap:20, marginBottom:24 }}>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        <h2 style={{ margin:0, padding:'18px 20px', borderBottom:'1px solid #e2e8f0', fontSize:18 }}>✅ Approved — Fee भरायची बाकी ({approvedApplications.length})</h2>
        {approvedApplications.length === 0 ? <p style={{ color:'#94a3b8', padding:20 }}>Approved अर्ज नाहीत.</p> : <table className="data-table"><thead><tr><th>नाव</th><th>मोबाईल</th><th>ई-मेल</th><th></th></tr></thead><tbody>{approvedApplications.map(application => <tr key={application.id} style={{ background:selected === application.id ? '#fef3c7' : undefined }}><td><b>{application.name}</b></td><td>{application.phone || application.parent_phone}</td><td>{application.admission_details?.email || '—'}</td><td><button className="btn btn-secondary" onClick={() => { setSelected(application.id); setAmount(''); setTotalFee('') }}>Fee Entry</button></td></tr>)}</tbody></table>}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:20, height:'fit-content' }}>
        <h3 style={{ margin:'0 0 14px' }}>पहिली Fee + Code Generate</h3>
        {!selectedApplication && !selectedActiveStudent ? <p style={{ color:'#94a3b8' }}>Approved विद्यार्थी निवडा.</p> : <div><div style={{ padding:12, background:'#fff7ed', borderRadius:8, marginBottom:14 }}><b>{selectedApplication?.name || selectedActiveStudent?.name}</b><div style={{ fontSize:12 }}>{selectedApplication?.phone || selectedActiveStudent?.roll_number}</div></div>{selectedApplication && <><label className="form-label">एकूण फी (₹) *</label><input className="form-input" type="number" value={totalFee} onChange={e=>setTotalFee(e.target.value)} /></>}<label className="form-label" style={{ marginTop:12 }}>आता भरलेली रक्कम (₹) *</label><input className="form-input" type="number" value={amount} onChange={e=>setAmount(e.target.value)} /><label className="form-label" style={{ marginTop:12 }}>तारीख</label><input className="form-input" type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} /><label className="form-label" style={{ marginTop:12 }}>माध्यम</label><select className="form-input" value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option></select>{selectedApplication ? <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:16 }} disabled={loading} onClick={activate}>{loading ? '⏳...' : '✅ Fee Save + Code Generate'}</button> : <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:16 }} disabled={loading || !amount} onClick={() => selectedActiveStudent && addPayment(selectedActiveStudent.id)}>{loading ? '⏳...' : '₹ पुढील Fee जमा करा'}</button>}</div>}
      </div>
    </section>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}><div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12, padding:18 }}><b>एकूण जमा</b><div style={{ fontSize:25, color:'#15803d', fontWeight:800 }}>{formatCurrency(totalCollected)}</div></div><div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:18 }}><b>एकूण बाकी</b><div style={{ fontSize:25, color:'#b91c1c', fontWeight:800 }}>{formatCurrency(totalPending)}</div></div><div style={{ background:'#eff6ff', border:'1px solid #93c5fd', borderRadius:12, padding:18 }}><b>Active विद्यार्थी</b><div style={{ fontSize:25, color:'#1d4ed8', fontWeight:800 }}>{filtered.length}</div></div></div>
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}><div style={{ padding:14 }}><input className="form-input" placeholder="नाव किंवा S-01 शोधा" value={search} onChange={e=>setSearch(e.target.value)} /></div><table className="data-table"><thead><tr><th>Code / नाव</th><th>एकूण</th><th>भरली</th><th>बाकी</th><th>पुढील fee</th></tr></thead><tbody>{filtered.map(student => <tr key={student.id}><td><b>{student.roll_number}</b> — {student.name}</td><td>{formatCurrency(student.total_fee)}</td><td>{formatCurrency(student.total_paid)}</td><td>{formatCurrency(student.pending_amount)}</td><td><button className="btn btn-secondary" onClick={() => { setSelected(student.id); setAmount('') }}>Fee Entry</button></td></tr>)}</tbody></table></div>
  </div>
}
