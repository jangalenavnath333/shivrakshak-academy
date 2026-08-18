'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { COURSES } from '@/lib/utils'
import { adminMutation } from '@/lib/admin-api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Student } from '@/types'

type FormData = {
  name: string; parent_name: string; address: string; phone: string; parent_phone: string
  aadhaar_no: string; guarantee_letter_no: string; dob: string; course: string
  admission_date: string; duration: string; age: string; height: string
  weight: string; chest: string; gender: string; total_fee: string; email: string
}

export default function EditStudentForm({ student }: { student: Student }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: student.name || '',
      parent_name: student.parent_name || '',
      address: student.address || '',
      phone: student.phone || '',
      parent_phone: student.parent_phone || '',
      aadhaar_no: student.aadhaar_no || '',
      guarantee_letter_no: student.guarantee_letter_no || '',
      dob: student.dob || '',
      course: student.course || '',
      admission_date: student.admission_date || '',
      duration: student.duration || '',
      age: student.age?.toString() || '',
      height: student.height?.toString() || '',
      weight: student.weight?.toString() || '',
      chest: student.chest?.toString() || '',
      gender: student.gender || 'male',
      total_fee: student.total_fee?.toString() || '0',
      email: student.admission_details?.email || ''
    }
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await adminMutation('student.update', {
        id: student.id,
        ...data, age: Number(data.age) || null, height: Number(data.height) || null,
        weight: Number(data.weight) || null, chest: Number(data.chest) || null,
        total_fee: Number(data.total_fee) || 0,
      })
      router.push('/admin/students')
      router.refresh()
    } catch (error) { alert('Error: ' + (error instanceof Error ? error.message : 'Student could not be updated')) }
    setLoading(false)
  }

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">✏️ {student.name} ची माहिती एडिट करा</div>
          <div className="page-subtitle">चुकीची माहिती दुरुस्त करा</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {student.admission_status === 'active' && (
            <button className="btn btn-primary" onClick={async () => {
              try {
                const res = await fetch('/api/admin/admissions', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'resend_email', studentId: student.id })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error)
                alert(data.delivery?.email?.sent ? 'ई-मेल यशस्वीरित्या पाठवला गेला!' : 'ई-मेल पाठवता आला नाही: ' + (data.delivery?.email?.detail || ''))
              } catch (e) { alert(e instanceof Error ? e.message : 'Error') }
            }}>
              📧 3-पानी अर्ज Email वर पुन्हा पाठवा
            </button>
          )}
          <Link href="/admin/students" className="btn btn-secondary">← परत</Link>
        </div>
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
              <label className="form-label">ईमेल (Email)</label>
              <input type="email" className="form-input" {...register('email')} />
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

            <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>एकूण फी (Total Fee - ₹)</label>
              <input type="number" className="form-input" {...register('total_fee')} placeholder="100000" style={{ fontWeight: 600, fontSize: 16 }} />
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>ही एकूण फी आहे. ही फी बदलल्यास विद्यार्थ्याची 'बाकी (Pending Amount)' आपोआप रीकॅल्क्युलेट होईल.</p>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
              {loading ? '⏳ सेव्ह करत आहे...' : '✅ बदल सेव्ह करा'}
            </button>
            <Link href="/admin/students" className="btn btn-secondary">रद्द करा</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
