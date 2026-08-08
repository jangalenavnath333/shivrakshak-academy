'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { StudentFeeSummary } from '@/types'
import Link from 'next/link'

export default function FeesPage() {
  const [students, setStudents] = useState<StudentFeeSummary[]>([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<StudentFeeSummary[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [mode, setMode] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    supabase.from('student_fee_summary').select('*').order('name').then(({ data }) => {
      setStudents(data || [])
      setFiltered(data || [])
    })
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(students); return }
    setFiltered(students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_number?.includes(search)))
  }, [search, students])

  const handlePayment = async () => {
    if (!selected || !amount) return
    setLoading(true)
    const { error } = await supabase.from('fee_payments').insert({
      student_id: selected,
      amount_paid: Number(amount),
      payment_date: payDate,
      payment_mode: mode,
    })
    if (!error) {
      setSuccessMsg(`✅ ₹${amount} यशस्वीरित्या जमा झाले!`)
      setAmount('')
      setSelected(null)
      // Refresh
      const { data } = await supabase.from('student_fee_summary').select('*').order('name')
      setStudents(data || [])
      setFiltered(data || [])
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setLoading(false)
  }

  const sendWhatsApp = (s: StudentFeeSummary) => {
    const msg = `नमस्कार, ${s.name} यांची ₹${formatCurrency(s.pending_amount)} फी बाकी आहे. कृपया लवकरात लवकर भरा. — शिवरक्षक करियर अकॅडमी 🙏`
    window.open(`https://wa.me/91${s.parent_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const totalCollected = filtered.reduce((s, f) => s + Number(f.total_paid), 0)
  const totalPending = filtered.reduce((s, f) => s + Number(f.pending_amount), 0)

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">💰 फी व्यवस्थापन</div>
          <div className="page-subtitle">फी जमा, बाकी, इतिहास</div>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #16a34a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#166534', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ एकूण जमा</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#15803d' }}>{formatCurrency(totalCollected)}</div>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>⏳ एकूण बाकी</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#b91c1c' }}>{formatCurrency(totalPending)}</div>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>👥 विद्यार्थी</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1d4ed8' }}>{filtered.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Student List */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              className="form-input"
              placeholder="🔍 नाव किंवा S-01 code शोधा..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 540 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>नाव</th>
                  <th>एकूण</th>
                  <th>भरली</th>
                  <th>बाकी</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ cursor: 'pointer', background: selected === s.id ? '#fef3c7' : undefined }} onClick={() => setSelected(s.id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: '#7c2d12', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0 }}>{s.roll_number}</span>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatCurrency(s.total_fee)}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>{formatCurrency(s.total_paid)}</td>
                    <td>
                      <span className={`badge ${Number(s.pending_amount) > 0 ? 'badge-red' : 'badge-green'}`}>
                        {formatCurrency(s.pending_amount)}
                      </span>
                    </td>
                    <td>
                      {Number(s.pending_amount) > 0 && (
                        <button
                          className="btn btn-whatsapp"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={e => { e.stopPropagation(); sendWhatsApp(s) }}
                        >📱</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Form */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, height: 'fit-content' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>+ फी भरणे</h3>
          {!selected ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>← डाव्या बाजूने विद्यार्थी निवडा</p>
          ) : (
            <div>
              <div style={{ background: '#fef3c7', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: '#7c2d12', color: 'white', padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>
                    {filtered.find(s => s.id === selected)?.roll_number}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#7c2d12' }}>{filtered.find(s => s.id === selected)?.name}</span>
                </div>
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  बाकी: <strong>{formatCurrency(Number(filtered.find(s => s.id === selected)?.pending_amount))}</strong>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">रक्कम (₹) *</label>
                <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="रक्कम टाका" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">तारीख</label>
                <input type="date" className="form-input" value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">माध्यम</label>
                <select className="form-input" value={mode} onChange={e => setMode(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={handlePayment} disabled={loading}>
                {loading ? '⏳...' : '✅ फी जमा करा'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
