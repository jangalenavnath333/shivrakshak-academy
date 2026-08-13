'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, BadgeCheck, Check, FileText, IndianRupee, Inbox,
  Printer, RotateCw, Search, Users,
} from 'lucide-react'
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
  delivery: { email: { sent: boolean; reason?: string; detail?: string }; whatsapp: { sent: boolean; reason?: string; detail?: string } }
}

type Tab = 'approval' | 'fee' | 'students' | 'incomplete'

/** The five stages an admission passes through, shown so the order is never a guess. */
const STEPS = [
  { id: 'approval', label: 'अर्ज प्राप्त' },
  { id: 'approval2', label: 'मंजुरी' },
  { id: 'fee', label: 'Fee Entry' },
  { id: 'fee2', label: 'Student Code' },
  { id: 'students', label: 'Activation' },
]

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
  const [delivery, setDelivery] = useState<ActivationResult['delivery'] | null>(null)
  const [tab, setTab] = useState<Tab>('approval')

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
      setSuccessMsg('अर्ज मंजूर झाला. आता तो "Fee Entry" मध्ये दिसेल.')
      await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Approval failed') }
    finally { setLoading(false) }
  }

  const activate = async () => {
    if (!selectedApplication || !totalFee || !amount) return
    setLoading(true); setPrintUrl(''); setDelivery(null)
    try {
      const response = await fetch('/api/admin/admissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', studentId: selectedApplication.id, totalFee: Number(totalFee), amountPaid: Number(amount), paymentDate: payDate, paymentMode: mode }),
      })
      const result = await response.json() as ActivationResult & { error?: string }
      if (!response.ok) throw new Error(result.error || 'Activation failed')
      setSuccessMsg(`Fee जमा झाली. Student Code ${result.rollNumber} तयार झाला.`)
      setPrintUrl(result.printUrl)
      setDelivery(result.delivery)
      setSelected(null); setTotalFee(''); setAmount('')
      await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Activation failed') }
    finally { setLoading(false) }
  }

  // Fee already recorded; finish the exam login + code/print delivery without charging again.
  const resume = async (studentId: string) => {
    setLoading(true); setPrintUrl(''); setDelivery(null)
    try {
      const response = await fetch('/api/admin/admissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', studentId }),
      })
      const result = await response.json() as ActivationResult & { error?: string }
      if (!response.ok) throw new Error(result.error || 'Retry failed')
      setSuccessMsg(`Activation पूर्ण झाली. Student Code ${result.rollNumber}.`)
      setPrintUrl(result.printUrl)
      setDelivery(result.delivery)
      await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Retry failed') }
    finally { setLoading(false) }
  }

  const addPayment = async (studentId: string) => {
    if (!amount) return
    setLoading(true)
    try {
      await adminMutation('fee.create', { student_id: studentId, amount_paid: Number(amount), payment_date: payDate, payment_mode: mode })
      setSuccessMsg(`₹${amount} जमा झाले.`); setAmount(''); setSelected(null); await refresh()
    } catch (error) { alert(error instanceof Error ? error.message : 'Payment failed') }
    finally { setLoading(false) }
  }

  const totalCollected = filtered.reduce((sum, item) => sum + Number(item.total_paid), 0)
  const totalPending = filtered.reduce((sum, item) => sum + Number(item.pending_amount), 0)

  const feeForm = (kind: 'activate' | 'next') => (
    <div>
      <div style={{ padding: 12, background: 'var(--a-green-50)', border: '1px solid #d7e9dd', borderRadius: 9, marginBottom: 14 }}>
        <b>{selectedApplication?.name || selectedActiveStudent?.name}</b>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{selectedApplication?.phone || selectedActiveStudent?.roll_number}</div>
      </div>
      {kind === 'activate' && (
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span className="form-label">एकूण फी (₹) *</span>
          <input className="form-input" type="number" value={totalFee} onChange={e => setTotalFee(e.target.value)} />
        </label>
      )}
      <label style={{ display: 'block', marginBottom: 12 }}>
        <span className="form-label">आता भरलेली रक्कम (₹) *</span>
        <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      </label>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <span className="form-label">तारीख</span>
        <input className="form-input" type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
      </label>
      <label style={{ display: 'block', marginBottom: 4 }}>
        <span className="form-label">माध्यम</span>
        <select className="form-input" value={mode} onChange={e => setMode(e.target.value as typeof mode)}>
          <option value="cash">Cash</option><option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option>
        </select>
      </label>
      {kind === 'activate' ? (
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
          disabled={loading || !totalFee || !amount} onClick={activate}>
          {loading ? 'थांबा…' : <><BadgeCheck size={16} /> Fee नोंदवा व Code तयार करा</>}
        </button>
      ) : (
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
          disabled={loading || !amount} onClick={() => selectedActiveStudent && addPayment(selectedActiveStudent.id)}>
          {loading ? 'थांबा…' : <><IndianRupee size={16} /> पुढील Fee जमा करा</>}
        </button>
      )}
    </div>
  )

  const TABS: { id: Tab; label: string; count?: number; hidden?: boolean }[] = [
    { id: 'approval', label: 'प्रवेश मंजुरी', count: pendingApplications.length },
    { id: 'fee', label: 'Fee Entry', count: approvedApplications.length },
    { id: 'students', label: 'विद्यार्थी व फी', count: students.length },
    { id: 'incomplete', label: 'अपूर्ण Activation', count: incompleteApplications.length, hidden: incompleteApplications.length === 0 },
  ]

  const activeStep = tab === 'approval' ? 1 : tab === 'fee' ? 3 : 5

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="page-title">प्रवेश मंजुरी व फी</div>
          <div className="page-subtitle">अर्ज मंजूर करा → फी नोंदवा → Student Code व 3-पानी अर्ज तयार होईल.</div>
        </div>
      </div>

      <ol className="adm-steps">
        {STEPS.map((step, i) => (
          <li key={step.id} data-on={i < activeStep}>
            <b>{i + 1}</b> {step.label}
          </li>
        ))}
      </ol>

      {successMsg && <div className="adm-alert adm-alert--ok">{successMsg}</div>}
      {printUrl && (
        <a href={printUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginBottom: 16 }}>
          <Printer size={16} /> 3 पानी अर्ज Print / PDF
        </a>
      )}
      {delivery && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {([['ई-मेल', delivery.email], ['WhatsApp', delivery.whatsapp]] as const).map(([label, state]) => (
            <div key={label} className={`adm-alert ${state.sent ? 'adm-alert--ok' : 'adm-alert--err'}`} style={{ margin: 0, maxWidth: 430 }}>
              {state.sent ? `${label} पाठवला` : `${label} गेला नाही`}
              {!state.sent && (state.detail || state.reason) && (
                <div style={{ marginTop: 4, fontWeight: 500, lineHeight: 1.55 }}>{state.detail || state.reason}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="adm-stats" style={{ marginBottom: 18 }}>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#fffaeb', color: '#b54708' }}><Inbox size={19} /></span>
          <div className="adm-stat__lbl">मंजुरी बाकी</div><div className="adm-stat__val">{pendingApplications.length}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#eff8ff', color: '#175cd3' }}><FileText size={19} /></span>
          <div className="adm-stat__lbl">फी भरायची बाकी</div><div className="adm-stat__val">{approvedApplications.length}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#ecfdf3', color: '#027a48' }}><IndianRupee size={19} /></span>
          <div className="adm-stat__lbl">एकूण जमा</div><div className="adm-stat__val">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__ico" style={{ background: '#fef3f2', color: '#b42318' }}><IndianRupee size={19} /></span>
          <div className="adm-stat__lbl">एकूण बाकी</div><div className="adm-stat__val">{formatCurrency(totalPending)}</div>
        </div>
      </div>

      <div className="adm-tabs" role="tablist">
        {TABS.filter(t => !t.hidden).map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="adm-tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.id === 'incomplete' && <AlertTriangle size={14} />}
            {t.label}
            {typeof t.count === 'number' && <span className="adm-badge adm-badge--muted">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'approval' && (
        <section className="adm-panel">
          <div className="adm-panel__head"><h3>मंजुरीसाठी आलेले अर्ज</h3></div>
          {pendingApplications.length === 0 ? (
            <div className="adm-empty"><Inbox size={32} /><b>मंजुरी बाकी नाही</b><span>नवीन अर्ज आल्यावर इथे दिसतील.</span></div>
          ) : (
            <div className="adm-tablewrap">
              <table className="data-table">
                <thead><tr><th>विद्यार्थी</th><th>मोबाईल</th><th>कोर्स</th><th>अर्ज दिनांक</th><th /></tr></thead>
                <tbody>
                  {pendingApplications.map(a => (
                    <tr key={a.id}>
                      <td><b>{a.name}</b><div style={{ fontSize: 11.5, color: '#94a3b8' }}>{a.parent_name}</div></td>
                      <td>{a.phone}<div style={{ fontSize: 11.5, color: '#94a3b8' }}>पालक: {a.parent_phone}</div></td>
                      <td><span className="adm-badge adm-badge--info">{a.course}</span></td>
                      <td style={{ fontSize: 12.5, color: '#475569' }}>{new Date(a.created_at).toLocaleDateString('mr-IN')}</td>
                      <td><button className="btn btn-primary" disabled={loading} onClick={() => approve(a.id)}><Check size={15} /> मंजूर करा</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'fee' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 350px', gap: 16, alignItems: 'start' }} className="adm-feegrid">
          <section className="adm-panel">
            <div className="adm-panel__head"><h3>मंजूर — पहिली फी बाकी</h3></div>
            {approvedApplications.length === 0 ? (
              <div className="adm-empty"><BadgeCheck size={32} /><b>कोणीही प्रतीक्षेत नाही</b><span>अर्ज मंजूर केल्यावर तो इथे येईल.</span></div>
            ) : (
              <div className="adm-tablewrap">
                <table className="data-table">
                  <thead><tr><th>विद्यार्थी</th><th>मोबाईल</th><th>ई-मेल</th><th /></tr></thead>
                  <tbody>
                    {approvedApplications.map(a => (
                      <tr key={a.id} style={{ background: selected === a.id ? 'var(--a-green-50)' : undefined }}>
                        <td><b>{a.name}</b></td>
                        <td>{a.phone || a.parent_phone}</td>
                        <td style={{ fontSize: 12.5, color: '#475569' }}>{a.admission_details?.email || '—'}</td>
                        <td>
                          <button className={`btn ${selected === a.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '5px 11px', fontSize: 12 }}
                            onClick={() => { setSelected(a.id); setAmount(''); setTotalFee('') }}>निवडा</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="adm-panel">
            <div className="adm-panel__head"><h3>पहिली फी व Student Code</h3></div>
            <div className="adm-panel__body">
              {selectedApplication ? feeForm('activate') : (
                <div className="adm-empty" style={{ padding: '20px 8px' }}>
                  <IndianRupee size={28} /><b>विद्यार्थी निवडा</b>
                  <span>डावीकडील यादीतून &ldquo;निवडा&rdquo; दाबा.</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 350px', gap: 16, alignItems: 'start' }} className="adm-feegrid">
          <section className="adm-panel">
            <div className="adm-panel__head">
              <h3>विद्यार्थी व फी नोंदी</h3>
              <div style={{ position: 'relative', maxWidth: 230 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} aria-hidden="true" />
                <input className="form-input" style={{ paddingLeft: 31, height: 34, fontSize: 13 }} placeholder="नाव किंवा S-01"
                  aria-label="विद्यार्थी शोधा" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="adm-empty"><Users size={32} /><b>विद्यार्थी सापडला नाही</b><span>शोध बदलून पहा.</span></div>
            ) : (
              <div className="adm-tablewrap">
                <table className="data-table">
                  <thead><tr><th>Code / नाव</th><th>एकूण</th><th>भरली</th><th>बाकी</th><th /></tr></thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} style={{ background: selected === s.id ? 'var(--a-green-50)' : undefined }}>
                        <td><b style={{ fontFamily: 'monospace' }}>{s.roll_number}</b> — {s.name}</td>
                        <td>{formatCurrency(s.total_fee)}</td>
                        <td style={{ color: '#027a48', fontWeight: 600 }}>{formatCurrency(s.total_paid)}</td>
                        <td style={{ color: Number(s.pending_amount) > 0 ? '#b42318' : '#94a3b8', fontWeight: 600 }}>{formatCurrency(s.pending_amount)}</td>
                        <td>
                          <button className={`btn ${selected === s.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '5px 11px', fontSize: 12 }}
                            onClick={() => { setSelected(s.id); setAmount('') }}>फी नोंदवा</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="adm-panel">
            <div className="adm-panel__head"><h3>पुढील फी नोंद</h3></div>
            <div className="adm-panel__body">
              {selectedActiveStudent ? feeForm('next') : (
                <div className="adm-empty" style={{ padding: '20px 8px' }}>
                  <IndianRupee size={28} /><b>विद्यार्थी निवडा</b>
                  <span>यादीतून &ldquo;फी नोंदवा&rdquo; दाबा.</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'incomplete' && (
        <section className="adm-panel">
          <div className="adm-panel__head"><h3>अपूर्ण Activation</h3></div>
          <div style={{ padding: '0 18px' }}>
            <div className="adm-alert adm-alert--err" style={{ marginTop: 14 }}>
              यांची फी नोंदली गेली आहे, पण Exam Login किंवा code delivery अपूर्ण राहिली.
              पुन्हा प्रयत्न केल्यास फी दुसऱ्यांदा आकारली जाणार नाही.
            </div>
          </div>
          <div className="adm-tablewrap">
            <table className="data-table">
              <thead><tr><th>विद्यार्थी</th><th>मोबाईल</th><th>एकूण फी</th><th /></tr></thead>
              <tbody>
                {incompleteApplications.map(a => (
                  <tr key={a.id}>
                    <td><b>{a.name}</b></td>
                    <td>{a.phone || a.parent_phone}</td>
                    <td>{formatCurrency(Number(a.total_fee || 0))}</td>
                    <td><button type="button" className="btn btn-primary" disabled={loading} onClick={() => resume(a.id)}><RotateCw size={15} /> पुन्हा प्रयत्न करा</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
