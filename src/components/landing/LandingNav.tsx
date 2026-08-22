'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { href: '#home', label: 'मुख्यपृष्ठ' },
  { href: '#about', label: 'आमच्याबद्दल' },
  { href: '#courses', label: 'कोर्सेस' },
  { href: '#facilities', label: 'सुविधा' },
  { href: '#results', label: 'निकाल' },
  { href: '#gallery', label: 'गॅलरी' },
  { href: '/admission', label: 'प्रवेश' },
  { href: '/student/login', label: 'विद्यार्थी लॉगिन' },
  { href: '#contact', label: 'संपर्क' },
]

export default function LandingNav(props: { academyName: string; waLink: string; socials: { youtube: string; instagram: string; telegram: string; facebook?: string } }) {
  void props
  const [open, setOpen] = useState(false)

  // A drawer left open while the page scrolls behind it reads as a stuck overlay.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [open])

  return (
    <header className="sra-nav" id="home">
      <div className="sra-wrap sra-nav__in">
        <nav className="sra-nav__links" aria-label="मुख्य नेव्हिगेशन">
          {LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>

        <div className="sra-nav__right">
          <button
            type="button"
            className="sra-nav__burger"
            aria-expanded={open}
            aria-controls="sra-drawer"
            aria-label={open ? 'मेनू बंद करा' : 'मेनू उघडा'}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className="sra-drawer" id="sra-drawer" data-open={open}>
        <div className="sra-wrap">
          <nav>
            {LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
          </nav>
          <Link href="/admission" className="sra-btn sra-btn--gold" onClick={() => setOpen(false)}>प्रवेश घ्या</Link>
        </div>
      </div>
    </header>
  )
}
