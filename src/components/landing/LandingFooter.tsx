import Link from 'next/link'
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send, ShieldHalf, Youtube } from 'lucide-react'
import { COURSES, MAP_EMBED } from '@/content/landing'

const QUICK_LINKS = [
  { href: '#home', label: 'मुख्यपृष्ठ' },
  { href: '#about', label: 'आमच्याबद्दल' },
  { href: '#courses', label: 'कोर्सेस' },
  { href: '#facilities', label: 'सुविधा' },
  { href: '#results', label: 'निकाल' },
  { href: '#gallery', label: 'गॅलरी' },
]

export default function LandingFooter({ academyName, tagline, phone, email, address, waLink, socials }: {
  academyName: string
  tagline: string
  phone: string
  email: string
  address: string
  waLink: string
  socials: { youtube: string; instagram: string; facebook?: string; telegram: string }
}) {
  return (
    <footer className="sra-footer">
      <div className="sra-wrap">
        <div className="sra-footer__grid">
          <div>
            <Link href="/" className="sra-brand">
              <span className="sra-brand__mark" aria-hidden="true"><ShieldHalf size={22} /></span>
              <span>
                <span className="sra-brand__name">{academyName}</span>
                <span className="sra-brand__sub">Army • Police • SRPF • Written Exam</span>
              </span>
            </Link>
            <p className="sra-footer__tag">{tagline}</p>
            <div className="sra-footer__social">
              {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={17} /></a>}
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
              <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={17} /></a>
              <a href={socials.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><Send size={17} /></a>
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              {QUICK_LINKS.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
              <li><Link href="/admission">प्रवेश अर्ज</Link></li>
              <li><Link href="/student/login">Student Login</Link></li>
            </ul>
          </div>

          <div>
            <h4>Our Courses</h4>
            <ul>
              {COURSES.map(course => <li key={course.slug}><a href="#courses">{course.title}</a></li>)}
            </ul>
          </div>

          <div>
            <h4>Contact Us</h4>
            <ul>
              <li><a href={`tel:${phone}`}><Phone size={14} /> {phone}</a></li>
              <li><a href={`mailto:${email}`}><Mail size={14} /> {email}</a></li>
              <li style={{ color: '#c2c6b6', fontSize: '.9rem', display: 'flex', gap: '.4rem' }}><MapPin size={14} style={{ flex: 'none', marginTop: 3 }} /> {address}</li>
            </ul>
          </div>

          <div>
            <h4>Our Location</h4>
            <div className="sra-map" style={{ minHeight: 150 }}>
              <iframe src={MAP_EMBED} title="अकॅडमीचे स्थान" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ minHeight: 150 }} />
            </div>
          </div>
        </div>

        <div className="sra-footer__bar">
          <span>© {new Date().getFullYear()} Shivrakshak Career Academy. सर्व हक्क राखीव.</span>
          <Link href="/admin" style={{ color: 'var(--sra-muted)' }}>Admin Panel</Link>
        </div>
      </div>
    </footer>
  )
}
