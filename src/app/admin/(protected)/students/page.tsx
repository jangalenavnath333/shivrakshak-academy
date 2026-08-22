import Link from 'next/link'
import { ArrowRight, Search, UserPlus, Users } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { COURSES, formatDate } from '@/lib/utils'
import type { Student } from '@/types'
import ExportButtons from '@/components/admin/ExportButtons'
import StudentActionButtons from '@/components/admin/StudentActionButtons'

async function getStudents(search?: string, gender?: string, course?: string, tab: string = 'active'): Promise<Student[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('students').select('*').eq('admission_status', tab === 'archived' ? 'archived' : 'active').order('roll_number', { ascending: true })
  if (search) {
    // Search by name OR roll_number (S-01, S-02 style)
    query = query.or(`name.ilike.%${search}%,roll_number.ilike.%${search}%`)
  }
  if (gender) query = query.eq('gender', gender)
  if (course) query = query.eq('course', course)
  const { data } = await query.limit(500)
  return data || []
}

const initials = (name?: string | null) => (name || '?').trim().charAt(0).toUpperCase()

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; q?: string; gender?: string; course?: string; tab?: string }>
}) {
  const params = await searchParams
  // `q` accepted too, so the header's global search lands here correctly.
  const search = params.search || params.q
  const students = await getStudents(search, params.gender, params.course, params.tab)
  const filtered = Boolean(search || params.gender || params.course)

  return (
    <div className="admin-page adm-student-directory">
      <div className="page-header">
        <div>
          <div className="page-title">विद्यार्थी</div>
          <div className="page-subtitle">
            {filtered ? `${students.length} विद्यार्थी सापडले` : `एकूण ${students.length} ${params.tab === 'archived' ? 'अर्काईव्ह केलेले' : 'सक्रिय'} विद्यार्थी`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ExportButtons 
            title={params.tab === 'archived' ? "अर्काईव्ह विद्यार्थी यादी" : "विद्यार्थी यादी"}
            filename={params.tab === 'archived' ? "archived_students" : "students_list"}
            data={students.map(s => ({
              'रोल नं.': s.roll_number,
              'विद्यार्थी नाव': s.name,
              'पालक': s.parent_name || '',
              'संपर्क': s.phone || '',
              'पालक संपर्क': s.parent_phone || '',
              'कोर्स': COURSES[s.course] || s.course,
              'लिंग': s.gender === 'male' ? 'मुलगा' : 'मुलगी',
              'प्रवेश दिनांक': s.admission_date ? formatDate(s.admission_date) : ''
            }))} 
          />
          <Link href="/admin/students/new" className="btn btn-primary"><UserPlus size={16} /> नवीन विद्यार्थी</Link>
        </div>
      </div>

      <div className="adm-directory-tabs">
        <Link href="/admin/students?tab=active" data-active={params.tab !== 'archived'}>
          सक्रिय विद्यार्थी
        </Link>
        <Link href="/admin/students?tab=archived" data-active={params.tab === 'archived'}>
          अर्काईव्ह (Archive)
        </Link>
      </div>

      <form method="GET" className="adm-panel" style={{ padding: 14, marginBottom: 16 }}>
        <input type="hidden" name="tab" value={params.tab || 'active'} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} aria-hidden="true" />
            <input name="search" defaultValue={search} className="form-input" style={{ paddingLeft: 34 }}
              placeholder="नाव किंवा रोल नंबर (S-01) शोधा" aria-label="नाव किंवा रोल नंबर शोधा" />
          </div>
          <select name="course" defaultValue={params.course} className="form-input" style={{ maxWidth: 190 }} aria-label="कोर्स">
            <option value="">सर्व कोर्सेस</option>
            {Object.entries(COURSES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <select name="gender" defaultValue={params.gender} className="form-input" style={{ maxWidth: 140 }} aria-label="लिंग">
            <option value="">सर्व</option>
            <option value="male">मुले</option>
            <option value="female">मुली</option>
          </select>
          <button type="submit" className="btn btn-primary">शोधा</button>
          <Link href="/admin/students" className="btn btn-secondary">Reset</Link>
        </div>
      </form>

      {students.length === 0 ? (
        <div className="adm-panel">
          <div className="adm-empty">
            <Users size={32} />
            <b>कोणताही विद्यार्थी सापडला नाही</b>
            <span>{filtered ? 'शोध बदलून पुन्हा प्रयत्न करा किंवा Reset दाबा.' : 'प्रवेश मंजूर झाल्यावर विद्यार्थी इथे दिसतील.'}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="adm-panel adm-onlydesk adm-directory-table">
            <div className="adm-tablewrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>रोल नं.</th><th>विद्यार्थी</th><th>पालक</th><th>संपर्क</th>
                    <th>कोर्स</th><th>लिंग</th><th>प्रवेश दिनांक</th><th />
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="adm-student-row">
                      <td><span className="adm-badge adm-badge--muted" style={{ fontFamily: 'monospace' }}>{s.roll_number}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="adm-avatar">{initials(s.name)}</span>
                          <b style={{ fontWeight: 600 }}>{s.name}</b>
                        </div>
                      </td>
                      <td style={{ color: '#475569' }}>{s.parent_name || '—'}</td>
                      <td>
                        <div style={{ fontSize: 12.5 }}>{s.phone || '—'}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8' }}>पालक: {s.parent_phone || '—'}</div>
                      </td>
                      <td><span className="adm-badge adm-badge--info">{COURSES[s.course] || s.course}</span></td>
                      <td style={{ color: '#475569', fontSize: 12.5 }}>{s.gender === 'male' ? 'मुलगा' : 'मुलगी'}</td>
                      <td style={{ fontSize: 12.5, color: '#475569' }}>{s.admission_date ? formatDate(s.admission_date) : '—'}</td>
                      <td>
                        <StudentActionButtons studentId={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards keep the same data readable on a phone instead of a wide scroll. */}
          <div className="adm-onlymob" style={{ display: 'grid', gap: 10 }}>
            {students.map(s => (
              <Link key={s.id} href={`/admin/students/${s.id}`} className="adm-panel" style={{ padding: 14, textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span className="adm-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>{initials(s.name)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <b style={{ fontSize: 14, display: 'block' }}>{s.name}</b>
                    <span style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'monospace' }}>{s.roll_number}</span>
                  </div>
                  <ArrowRight size={16} style={{ color: '#94a3b8' }} aria-hidden="true" />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 11 }}>
                  <span className="adm-badge adm-badge--info">{COURSES[s.course] || s.course}</span>
                  <span className="adm-badge adm-badge--muted">{s.gender === 'male' ? 'मुलगा' : 'मुलगी'}</span>
                  {s.admission_date && <span className="adm-badge adm-badge--muted">{formatDate(s.admission_date)}</span>}
                </div>
                <div style={{ marginTop: 10, fontSize: 12.5, color: '#475569' }}>
                  {s.phone || '—'} · पालक: {s.parent_name || '—'}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
