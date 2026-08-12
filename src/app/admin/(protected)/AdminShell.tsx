'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/students', icon: '👥', label: 'विद्यार्थी' },
  { href: '/admin/leaves', icon: '🏠', label: 'Student Leave' },
  { href: '/admin/fees', icon: '💰', label: 'Admission Approval व फी' },
  { href: '/admin/mess', icon: '🍽️', label: 'मेस' },
  { href: '/admin/whatsapp', icon: '📱', label: 'WhatsApp' },
  { href: '/admin/notices', icon: '📢', label: 'नोटीस' },
  { href: '/admin/media', icon: '🖼️', label: 'फोटो व व्हिडिओ' },
  { href: '/admin/attendance', icon: '📷', label: 'Live Attendance' },
  { href: '/admin/exams', icon: '📝', label: 'Online परीक्षा' },
  { href: '/admin/settings', icon: '⚙️', label: 'Website Settings' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <aside className="admin-sidebar" style={{ width: 220, background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: '#7c2d12', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>शिवरक्षक</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#7c2d12', lineHeight: 1.2 }}>अकॅडमी</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Admin Panel</div>
        </div>
        <nav className="admin-sidebar-nav" style={{ padding: '12px 10px', flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              <span style={{ fontSize: 16 }}>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>🌐 Website पहा</Link>
          <button onClick={handleLogout} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>🔒 Logout</button>
        </div>
      </aside>
      <main className="admin-main" style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
