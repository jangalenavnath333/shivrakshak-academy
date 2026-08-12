import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = await createSupabaseServerClient()
  const [studentsRes, feeSummaryRes, messRes, noticesRes] = await Promise.all([
    supabase.from('students').select('id, gender, course', { count: 'exact' }).eq('admission_status', 'active'),
    supabase.from('student_fee_summary').select('total_fee, total_paid, pending_amount'),
    supabase.from('mess_expiry_reminders').select('id', { count: 'exact' }),
    supabase.from('notices').select('id', { count: 'exact' }).eq('is_published', true),
  ])

  const students = studentsRes.data || []
  const feeSummary = feeSummaryRes.data || []
  const totalStudents = studentsRes.count || 0
  const maleCount = students.filter(s => s.gender === 'male').length
  const femaleCount = students.filter(s => s.gender === 'female').length
  const totalFeeCollected = feeSummary.reduce((sum, s) => sum + Number(s.total_paid), 0)
  const totalFeePending = feeSummary.reduce((sum, s) => sum + Number(s.pending_amount), 0)
  const messExpiring = messRes.count || 0
  const activeNotices = noticesRes.count || 0

  return { totalStudents, maleCount, femaleCount, totalFeeCollected, totalFeePending, messExpiring, activeNotices }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    { label: 'एकूण विद्यार्थी', value: stats.totalStudents, icon: '👥', color: '#3b82f6', bg: '#eff6ff', link: '/admin/students' },
    { label: 'मुले', value: stats.maleCount, icon: '👦', color: '#0891b2', bg: '#ecfeff', link: '/admin/students?gender=male' },
    { label: 'मुली', value: stats.femaleCount, icon: '👧', color: '#db2777', bg: '#fdf2f8', link: '/admin/students?gender=female' },
    { label: 'फी जमा', value: formatCurrency(stats.totalFeeCollected), icon: '✅', color: '#16a34a', bg: '#f0fdf4', link: '/admin/fees' },
    { label: 'फी बाकी', value: formatCurrency(stats.totalFeePending), icon: '⏳', color: '#dc2626', bg: '#fef2f2', link: '/admin/fees' },
    { label: 'मेस संपणार', value: `${stats.messExpiring} विद्यार्थी`, icon: '🍽️', color: '#d97706', bg: '#fffbeb', link: '/admin/mess' },
  ]

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">📊 Dashboard</div>
          <div className="page-subtitle">शिवरक्षक करियर अकॅडमी — Admin Panel</div>
        </div>
        <Link href="/admin/students/new" className="btn btn-primary">
          + नवीन विद्यार्थी
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: card.bg, border: `1px solid ${card.color}22`, borderRadius: 12, padding: 20, transition: 'transform 0.15s' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/admin/students/new" className="btn btn-primary" style={{ justifyContent: 'center' }}>+ नवीन विद्यार्थी नोंदणी</Link>
            <Link href="/admin/fees" className="btn btn-secondary" style={{ justifyContent: 'center' }}>💰 फी भरणे</Link>
            <Link href="/admin/whatsapp" className="btn btn-whatsapp" style={{ justifyContent: 'center' }}>📱 WhatsApp Message पाठवा</Link>
            <Link href="/admin/notices" className="btn btn-secondary" style={{ justifyContent: 'center' }}>📢 नोटीस पोस्ट करा</Link>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#0f172a' }}>
            🍽️ मेस — आज संपणार
            {stats.messExpiring > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 8 }}>{stats.messExpiring}</span>
            )}
          </h3>
          {stats.messExpiring === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>आज कोणाचाही मेस संपत नाही ✅</p>
          ) : (
            <div>
              <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>⚠️ {stats.messExpiring} विद्यार्थ्यांचा मेस लवकरच संपतो!</p>
              <Link href="/admin/mess" className="btn btn-danger" style={{ justifyContent: 'center', width: '100%' }}>
                📱 Reminder पाठवा
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
