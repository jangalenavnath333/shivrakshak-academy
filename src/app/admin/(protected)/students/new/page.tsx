'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { COURSES } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FormData = {
  name: string; parent_name: string; address: string; phone: string; parent_phone: string
  aadhaar_no: string; guarantee_letter_no: string; dob: string; course: string
  admission_date: string; duration: string; age: string; height: string
  weight: string; chest: string; gender: string; total_fee: string
}

export default function NewStudentPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    // Get next sequential code S-01, S-02...
    let nextCode = 'S-01'
    try {
      const res = await fetch('/api/next-admission-code')
      const json = await res.json()
      nextCode = json.code || 'S-01'
    } catch { /* fallback S-01 */ }

    const { error } = await supabase.from('students').insert({
      ...data,
      roll_number: nextCode,
      age: Number(data.age) || null,
      height: Number(data.height) || null,
      weight: Number(data.weight) || null,
      chest: Number(data.chest) || null,
      total_fee: Number(data.total_fee) || 0,
    })
    setLoading(false)
    if (!error) {
      router.push('/admin/students')
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">+ नवीन विद्यार्थी</div>
          <div className="page-subtitle">प्रवेश अर्ज भरा</div>
        </div>
        <Link href="/admin/students" className="btn btn-secondary">← परत</Link>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">विद्यार्थ्याचे नाव *</label>
              <input className="form-input" {...register('name', { required: true })} />
              {errors.name && <span style={{ color: 'red', fontSize: 12 }}>आवश्यक</span>}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">पालकाचे नाव *</label>
              <input className="form-input" {...register('parent_name', { required: true })} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">पत्ता</label>
              <textarea className="form-input" rows={2} {...register('address')} />
            </div>

            <div>
              <label className="form-label">फोन</label>
              <input className="form-input" {...register('phone')} />
            </div>

            <div>
              <label className="form-label">पालकाचा मो. (WhatsApp) *</label>
              <input className="form-input" {...register('parent_phone', { required: true })} />
            </div>

            <div>
              <label className="form-label">आधार कार्ड नं.</label>
              <input className="form-input" {...register('aadhaar_no')} />
            </div>

            <div>
              <label className="form-label">हमीपत्र नं.</label>
              <input className="form-input" {...register('guarantee_letter_no')} />
            </div>

            <div>
              <label className="form-label">जन्म तारीख</label>
              <input type="date" className="form-input" {...register('dob')} />
            </div>

            <div>
              <label className="form-label">लिंग</label>
              <select className="form-input" {...register('gender')}>
                <option value="male">मुलगा</option>
                <option value="female">मुलगी</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">कोर्स *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {Object.entries(COURSES).map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" {...register('course', { required: true })} value={val} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">प्रवेश तारीख</label>
              <input type="date" className="form-input" {...register('admission_date')} />
            </div>

            <div>
              <label className="form-label">कालावधी</label>
              <input className="form-input" {...register('duration')} placeholder="6 महिने / 1 वर्ष" />
            </div>

            <div>
              <label className="form-label">वय</label>
              <input type="number" className="form-input" {...register('age')} />
            </div>
            <div>
              <label className="form-label">उंची (सेमी)</label>
              <input type="number" step="0.1" className="form-input" {...register('height')} />
            </div>
            <div>
              <label className="form-label">वजन (किलो)</label>
              <input type="number" step="0.1" className="form-input" {...register('weight')} />
            </div>
            <div>
              <label className="form-label">छाती (सेमी)</label>
              <input type="number" step="0.1" className="form-input" {...register('chest')} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">एकूण फी (₹)</label>
              <input type="number" className="form-input" {...register('total_fee')} placeholder="100000" />
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
              {loading ? '⏳ जतन करत आहे...' : '✅ विद्यार्थी जतन करा'}
            </button>
            <Link href="/admin/students" className="btn btn-secondary">रद्द करा</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
