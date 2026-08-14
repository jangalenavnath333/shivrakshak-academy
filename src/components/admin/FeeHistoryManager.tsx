'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FeePayment } from '@/types'

export default function FeeHistoryManager({ fees, studentId }: { fees: FeePayment[], studentId: string }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editMode, setEditMode] = useState<'cash' | 'upi' | 'bank_transfer' | 'cheque'>('cash')
  const [loading, setLoading] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('तुम्हाला खात्री आहे का की ही पावती डिलीट करायची आहे?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/mutations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fee.delete', payload: { id } })
      })
      if (!res.ok) throw new Error(await res.text())
      router.refresh()
    } catch (e) {
      alert('Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (f: FeePayment) => {
    setEditingId(f.id)
    setEditAmount(f.amount_paid.toString())
    setEditDate(f.payment_date)
    setEditMode(f.payment_mode)
  }

  const handleUpdate = async () => {
    if (!editingId || !editAmount || !editDate) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/mutations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fee.update', payload: { id: editingId, amount_paid: Number(editAmount), payment_date: editDate, payment_mode: editMode } })
      })
      if (!res.ok) throw new Error(await res.text())
      setEditingId(null)
      router.refresh()
    } catch (e) {
      alert('Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (fees.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: 14 }}>अजून फी भरली नाही</p>
  }

  return (
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>
          <th style={{ textAlign: 'left', padding: '6px 0' }}>तारीख</th>
          <th style={{ textAlign: 'right', padding: '6px 0' }}>रक्कम</th>
          <th style={{ textAlign: 'right', padding: '6px 0' }}>माध्यम</th>
          <th style={{ textAlign: 'right', padding: '6px 0', width: 60 }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {fees.map((f) => (
          <tr key={f.id} style={{ borderTop: '1px solid #f1f5f9' }}>
            {editingId === f.id ? (
              <td colSpan={4} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input type="date" className="form-input" style={{ width: 120, height: 30, padding: 4 }} value={editDate} onChange={e => setEditDate(e.target.value)} />
                  <input type="number" className="form-input" style={{ width: 100, height: 30, padding: 4 }} value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Amount" />
                  <select className="form-input" style={{ width: 100, height: 30, padding: 4 }} value={editMode} onChange={e => setEditMode(e.target.value as any)}>
                    <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option>
                  </select>
                  <button onClick={handleUpdate} disabled={loading} className="btn btn-primary" style={{ padding: '0 10px', height: 30 }}>सेव्ह</button>
                  <button onClick={() => setEditingId(null)} disabled={loading} className="btn btn-secondary" style={{ padding: '0 10px', height: 30 }}>रद्द</button>
                </div>
              </td>
            ) : (
              <>
                <td style={{ padding: '8px 0', color: '#475569' }}>{new Date(f.payment_date).toLocaleDateString('en-GB')}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{f.amount_paid.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right' }}><span className="badge badge-gray">{f.payment_mode}</span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => handleEdit(f)} className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: 11, marginRight: 4 }} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(f.id)} className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: 11 }} title="Delete">🗑️</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
