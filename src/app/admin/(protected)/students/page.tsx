import { createSupabaseServerClient } from '@/lib/supabase-server'
import { COURSES, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Student } from '@/types'

async function getStudents(search?: string, gender?: string, course?: string): Promise<Student[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('students').select('*').eq('admission_status', 'active').order('roll_number', { ascending: true })
  if (search) {
    // Search by name OR roll_number (S-01, S-02 style)
    query = query.or(`name.ilike.%${search}%,roll_number.ilike.%${search}%`)
  }
  if (gender) query = query.eq('gender', gender)
  if (course) query = query.eq('course', course)
  const { data } = await query.limit(500)
  return data || []
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; gender?: string; course?: string }>
}) {
  const params = await searchParams
  const students = await getStudents(params.search, params.gender, params.course)

  return (
    <div style={{ padding: 28 }}>
      <div className="page-header">
        <div>
          <div className="page-title">👥 विद्यार्थी</div>
          <div className="page-subtitle">{students.length} विद्यार्थी सापडले</div>
        </div>
        <Link href="/admin/students/new" className="btn btn-primary">+ नवीन विद्यार्थी</Link>
      </div>

      {/* Search + Filters */}
      <form method="GET" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          name="search"
          defaultValue={params.search}
          className="form-input"
          style={{ maxWidth: 300 }}
          placeholder="🔍 नाव किंवा S-01 code शोधा..."
        />
        <select name="gender" defaultValue={params.gender} className="form-input" style={{ maxWidth: 150 }}>
          <option value="">सर्व</option>
          <option value="male">मुले</option>
          <option value="female">मुली</option>
        </select>
        <select name="course" defaultValue={params.course} className="form-input" style={{ maxWidth: 180 }}>
          <option value="">सर्व कोर्सेस</option>
          {Object.entries(COURSES).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">शोधा</button>
        <Link href="/admin/students" className="btn btn-secondary">Reset</Link>
      </form>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>रोल नं.</th>
              <th>नाव</th>
              <th>पालक</th>
              <th>फोन</th>
              <th>कोर्स</th>
              <th>लिंग</th>
              <th>प्रवेश</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                  कोणताही विद्यार्थी सापडला नाही
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-blue">{s.roll_number}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: '#64748b' }}>{s.parent_name}</td>
                  <td>
                    <div style={{ fontSize: 12 }}>{s.phone}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>पालक: {s.parent_phone}</div>
                  </td>
                  <td><span className="badge badge-yellow">{COURSES[s.course] || s.course}</span></td>
                  <td><span className={`badge ${s.gender === 'male' ? 'badge-blue' : 'badge-gray'}`}>{s.gender === 'male' ? '👦 मुलगा' : '👧 मुलगी'}</span></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{s.admission_date ? formatDate(s.admission_date) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/students/${s.id}`} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}>पहा</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
