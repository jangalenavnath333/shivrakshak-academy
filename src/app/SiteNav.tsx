'use client'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

const LINKS: [string, string][] = [
  ['#courses', 'कोर्सेस'],
  ['#about', 'आमच्याबद्दल'],
  ['#notices', 'सूचना'],
  ['#contact', 'संपर्क'],
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="site-header no-print">
        <div className="header-inner">
          <Link href="/" className="brand">
            <Logo size={44} />
            <div style={{ minWidth: 0 }}>
              <div className="brand-name">शिवरक्षक करियर अकॅडमी</div>
              <div className="brand-tag">POLICE · ARMY · NAVY BHARTI</div>
            </div>
          </Link>

          <nav className="nav-desktop">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
            <Link href="/admin" className="nav-link" style={{ color: '#94a3b8' }}>🔐 Admin</Link>
            <Link href="/admission" className="btn-nav" style={{ marginLeft: 8 }}>📋 प्रवेश अर्ज</Link>
          </nav>

          <button
            className="nav-toggle"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <nav className={`nav-mobile no-print ${open ? 'open' : ''}`}>
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} className="nav-link" onClick={() => setOpen(false)}>{label}</a>
        ))}
        <Link href="/admin" className="nav-link" onClick={() => setOpen(false)}>🔐 Admin Panel</Link>
        <Link href="/admission" className="btn-hero" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
          📋 प्रवेश अर्ज भरा
        </Link>
      </nav>
    </>
  )
}
