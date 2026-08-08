import { createSupabaseServerClient } from '@/lib/supabase-server'
import { COURSES, DOC_TYPES, formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import type { Student, FeePayment, Document, MessSubscription } from '@/types'

async function getStudentData(id: string) {
  const supabase = await createSupabaseServerClient()
  const [studentRes, feesRes, docsRes, messRes] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).single(),
    supabase.from('fee_payments').select('*').eq('student_id', id).order('payment_date', { ascending: false }),
    supabase.from('documents').select('*').eq('student_id', id),
    supabase.from('mess_subscriptions').select('*').eq('student_id', id).order('start_date', { ascending: false }).limit(5),
  ])
  return {
    student: studentRes.data as Student | null,
    fees: feesRes.data as FeePayment[] || [],
    docs: docsRes.data as Document[] || [],
    mess: messRes.data as MessSubscription[] || [],
  }
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { student, fees, docs, mess } = await getStudentData(id)

  if (!student) {
    return <div style={{ padding: 40, textAlign: 'center' }}>विद्यार्थी सापडला नाही</div>
  }

  const totalPaid = fees.reduce((sum, f) => sum + Number(f.amount_paid), 0)
  const pending = student.total_fee - totalPaid

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">{student.name}</div>
          <div className="page-subtitle">
            <span className="badge badge-blue">{student.roll_number}</span>
            <span style={{ marginLeft: 8 }}>{COURSES[student.course] || student.course}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`https://wa.me/91${student.parent_phone}?text=${encodeURIComponent(`नमस्कार, ${student.parent_name} जी, ${student.name} यांच्याबद्दल एक महत्त्वाचा संदेश आहे. — शिवरक्षक करियर अकॅडमी`)}`}
            target="_blank"
            className="btn btn-whatsapp"
          >
            📱 WhatsApp
          </a>
          <Link href="/admin/students" className="btn btn-secondary">← परत</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Basic Info */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>👤 मूलभूत माहिती</h3>
          {[
            ['नाव', student.name],
            ['पालकाचे नाव', student.parent_name],
            ['पत्ता', student.address],
            ['फोन', student.phone],
            ['पालकाचा मो.', student.parent_phone],
            ['आधार नं.', student.aadhaar_no],
            ['हमीपत्र नं.', student.guarantee_letter_no],
            ['जन्म तारीख', student.dob ? formatDate(student.dob) : '—'],
            ['लिंग', student.gender === 'male' ? '👦 मुलगा' : '👧 मुलगी'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Course + Physical */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>📋 कोर्स माहिती</h3>
          {[
            ['कोर्स', COURSES[student.course] || student.course],
            ['प्रवेश तारीख', student.admission_date ? formatDate(student.admission_date) : '—'],
            ['कालावधी', student.duration],
            ['वय', student.age ? `${student.age} वर्षे` : '—'],
            ['उंची', student.height ? `${student.height} सेमी` : '—'],
            ['वजन', student.weight ? `${student.weight} किलो` : '—'],
            ['छाती', student.chest ? `${student.chest} सेमी` : '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{value || '—'}</span>
            </div>
          ))}

          {/* Fee summary */}
          <div style={{ marginTop: 16, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>💰 फी सारांश</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
              <span>एकूण फी:</span><span style={{ fontWeight: 700 }}>{formatCurrency(student.total_fee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
              <span style={{ color: '#16a34a' }}>✅ भरली:</span><span style={{ fontWeight: 700, color: '#16a34a' }}>{formatCurrency(totalPaid)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: pending > 0 ? '#dc2626' : '#16a34a' }}>⏳ बाकी:</span>
              <span style={{ fontWeight: 700, color: pending > 0 ? '#dc2626' : '#16a34a' }}>{formatCurrency(pending)}</span>
            </div>
          </div>
          <Link href={`/admin/fees?student=${student.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
            + फी भरणे
          </Link>
        </div>

        {/* Documents */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
            📁 Documents
            <Link href={`/admin/students/${id}/documents`} style={{ fontSize: 12, color: '#b45309', marginLeft: 8, fontWeight: 400, textDecoration: 'none' }}>+ Upload करा</Link>
          </h3>
          {docs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>कोणतेही documents upload केले नाहीत</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.map((doc) => (
                <a key={doc.id} href={`/api/admin/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, textDecoration: 'none', color: '#0f172a', fontSize: 13 }}>
                  <span>{DOC_TYPES[doc.doc_type] || doc.doc_type}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 'auto' }}>📥</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Fee History */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>💳 फी इतिहास</h3>
          {fees.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>अजून फी भरली नाही</p>
          ) : (
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0' }}>तारीख</th>
                  <th style={{ textAlign: 'right', padding: '6px 0' }}>रक्कम</th>
                  <th style={{ textAlign: 'right', padding: '6px 0' }}>माध्यम</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0', color: '#475569' }}>{formatDate(f.payment_date)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(f.amount_paid)}</td>
                    <td style={{ textAlign: 'right' }}><span className="badge badge-gray">{f.payment_mode}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
