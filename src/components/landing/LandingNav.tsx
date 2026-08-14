'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, MessageCircle, X, Instagram, Youtube, Send } from 'lucide-react'
import Logo from '@/components/Logo'
import { ACADEMY_LOGO } from '@/content/landing'

const LINKS = [
  { href: '#home', label: 'मुख्यपृष्ठ' },
  { href: '#about', label: 'आमच्याबद्दल' },
  { href: '#courses', label: 'कोर्सेस' },
  { href: '#facilities', label: 'सुविधा' },
  { href: '#results', label: 'निकाल' },
  { href: '#gallery', label: 'गॅलरी' },
  { href: '/admission', label: 'प्रवेश' },
  { href: '#contact', label: 'संपर्क' },
]

export default function LandingNav({ academyName, waLink, socials }: { academyName: string; waLink: string; socials: { youtube: string; instagram: string; telegram: string; facebook?: string } }) {
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
        <Link href="/" className="sra-brand">
          {ACADEMY_LOGO
            ? <span className="sra-brand__logo"><Image src={ACADEMY_LOGO} alt="" role="presentation" fill sizes="42px" /></span>
            : <span className="sra-brand__mark" aria-hidden="true"><Logo size={30} /></span>}
          <span>
            <span className="sra-brand__name">{academyName}</span>
            <span className="sra-brand__sub">Army • Police • SRPF • Written Exam</span>
          </span>
        </Link>

        <nav className="sra-nav__links">
          {LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>

        <div className="sra-nav__right">
          <div className="sra-nav__socials">
            <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="sra-nav__social sra-nav__social--insta">
              <Instagram size={17} />
            </a>
            <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="sra-nav__social sra-nav__social--yt">
              <Youtube size={17} />
            </a>
            <a href={socials.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="sra-nav__social sra-nav__social--tg">
              <Send size={17} />
            </a>
          </div>
          <Link href="/admission" className="sra-btn sra-btn--gold sra-nav__cta">प्रवेश घ्या</Link>
          <a className="sra-nav__wa" href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp वर संपर्क करा">
            <MessageCircle size={19} />
          </a>
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
