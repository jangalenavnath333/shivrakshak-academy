'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/students', icon: '👥', label: 'विद्यार्थी' },
  { href: '/admin/fees', icon: '💰', label: 'फी व्यवस्थापन' },
  { href: '/admin/mess', icon: '🍽️', label: 'मेस' },
  { href: '/admin/whatsapp', icon: '📱', label: 'WhatsApp' },
  { href: '/admin/notices', icon: '📢', label: 'नोटीस' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check on login page itself
    if (pathname === '/admin/login') return
    const isLoggedIn = sessionStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.replace('/admin/login')
    }
  }, [pathname, router])

  function handleLogout() {
    sessionStorage.removeItem('admin_logged_in')
    router.push('/admin/login')
  }

  // Don't render sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
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

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            🌐 Website पहा
          </Link>
          <button
            onClick={handleLogout}
            style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🔒 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
