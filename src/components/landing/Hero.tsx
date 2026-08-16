import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone, PlayCircle } from 'lucide-react'
import { ACADEMY_LOGO, FOUNDERS_PHOTO } from '@/content/landing'

export default function Hero({ phone, academyName }: { phone: string; academyName: string }) {
  return (
    <section className="sra-hero">
      {/* Texture: Ultra-dark military overlay for deep contrast */}
      <div className="sra-hero__bg" aria-hidden="true" style={{ opacity: 0.4 }}>
        <Image src={FOUNDERS_PHOTO} alt="" role="presentation" fill quality={45} sizes="100vw" />
      </div>
      <div className="sra-hero__scrim" aria-hidden="true" style={{
        background: 'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.05), transparent 40%), linear-gradient(180deg, rgba(2,3,2,0.85) 0%, rgba(2,3,2,0.95) 100%)'
      }} />

      <div className="sra-wrap sra-hero__grid">
        <div className="sra-hero__in sra-fade-in" style={{ animationDelay: '0.2s' }}>
          {ACADEMY_LOGO && (
            <div className="sra-hero__mark">
              <Image src={ACADEMY_LOGO} alt="" role="presentation" fill sizes="140px" priority />
            </div>
          )}
          <p className="sra-hero__eyebrow" style={{ color: 'var(--sra-gold-lt)', textShadow: '0 0 10px rgba(255,224,122,0.5)' }}>
            SHIVRAKSHAK COMMAND CENTER
          </p>

          <h1 style={{ letterSpacing: '2px', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            <span>WE DON&rsquo;T JUST TRAIN,</span>
            <span className="gold" style={{ background: 'linear-gradient(to right, #ffd86b, #c99324)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.3))' }}>
              WE CREATE WARRIORS
            </span>
          </h1>

          <p className="sra-hero__desc" style={{ fontSize: '1.15rem', color: '#e4e7d9' }}>
            महाराष्ट्रातील सर्वात कडक शिस्त आणि सर्वोत्तम निकाल देणारी डिफेन्स अकॅडमी. तुमचा भारतीय सैन्यदलातील प्रवास इथून सुरू होतो.
          </p>

          <div className="sra-hero__actions">
            <Link href="/admission" className="sra-btn sra-btn--gold" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              JOIN THE MISSION <ArrowRight size={18} />
            </Link>
            <a href="#gallery" className="sra-btn sra-btn--ghost sra-glass" style={{ padding: '1rem 2rem' }}>
              Academy Tour <PlayCircle size={18} />
            </a>
          </div>

          <a className="sra-hero__call" href={`tel:${phone}`} style={{ marginTop: '3rem' }}>
            <span className="sra-hero__call-ico" aria-hidden="true" style={{ boxShadow: '0 0 20px rgba(212,175,55,0.2)' }}><Phone size={17} /></span>
            <span>
              <b style={{ textShadow: '0 0 10px rgba(212,175,55,0.3)' }}>{phone}</b>
              <small>हेडक्वार्टर संपर्क</small>
            </span>
          </a>
        </div>

        <div className="sra-hero__panel sra-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="sra-hero__photo" style={{ border: '2px solid rgba(212,175,55,0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.1)' }}>
            <Image src={FOUNDERS_PHOTO} alt={`${academyName} — दोन्ही माजी सैनिक संस्थापक`}
              fill priority quality={90} sizes="(max-width: 980px) 92vw, 46vw" />
          </div>
        </div>
      </div>
    </section>
  )
}
