'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Phone, ShieldCheck, X } from 'lucide-react'
import Logo from '@/components/Logo'

const links = [
  ['#home', 'मुख्यपृष्ठ'],
  ['#courses', 'कोर्सेस'],
  ['#features', 'सुविधा'],
  ['#results', 'यशोगाथा'],
  ['#contact', 'संपर्क'],
]

export default function SiteNav({ phone = '9284842177' }: { phone?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="public-header">
      <div className="public-nav">
        <Link href="/" className="public-brand" aria-label="शिवरक्षक अकॅडमी मुख्यपृष्ठ">
          <Logo size={54} />
          <span><strong>शिवरक्षक</strong><b>अकॅडमी</b></span>
        </Link>
        <nav className="desktop-links" aria-label="मुख्य नेव्हिगेशन">
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a className="call-button" href={`tel:${phone}`}><Phone size={17} /> मोफत मार्गदर्शन</a>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="मेनू">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <nav className="mobile-links">
        {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <Link href="/admin"><ShieldCheck size={17} /> Admin Panel</Link>
      </nav>}
    </header>
  )
}
