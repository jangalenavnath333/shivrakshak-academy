import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone, Shield, Target, Swords } from 'lucide-react'
import { ACADEMY_LOGO, FOUNDERS_PHOTO } from '@/content/landing'

export default function Hero({ phone, academyName }: { phone: string; academyName: string }) {
  return (
    <section className="sra-hero">
      {/* Background: existing founders photo as subtle texture */}
      <div className="sra-hero__bg" aria-hidden="true" style={{ opacity: 0.35 }}>
        <Image src={FOUNDERS_PHOTO} alt="" role="presentation" fill quality={45} sizes="100vw" />
      </div>
      <div className="sra-hero__scrim" aria-hidden="true" />

      <div className="sra-wrap" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
        {/* Academy Brand inside Hero */}
        <div className="sra-hero__top-brand" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div className="sra-hero__top-logo" style={{ width: '75px', height: '75px', position: 'relative' }}>
            <Image src={ACADEMY_LOGO as string} alt="Shivrakshak Logo" fill style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />
          </div>
          <h2 className="sra-hero__top-name" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.8)', margin: 0, letterSpacing: '0.02em' }}>
            {academyName}
          </h2>
        </div>
      </div>

      <div className="sra-wrap sra-hero__grid">
        {/* LEFT — Headlines & CTAs */}
        <div className="sra-hero__in sra-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Gold badge */}
          <div className="sra-hero__badge">
            <Shield size={16} />
            निवृत्त भारतीय सैन्य अधिकाऱ्यांच्या नेतृत्वाखाली
          </div>

          <h1 style={{ textShadow: '0 8px 24px rgba(0,0,0,0.7)' }}>
            <span>आम्ही फक्त प्रशिक्षण देत नाही,</span>
            <span className="gold">आम्ही सैनिक घडवतो!</span>
          </h1>

          <div className="sra-hero__values">
            <span>शिस्त</span>
            <span>मेहनत</span>
            <span>समर्पण</span>
            <span>यश</span>
          </div>

          <div className="sra-hero__highlight-box" style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,0,0,0.4))',
            borderLeft: '4px solid var(--sra-gold)',
            padding: '1.5rem',
            borderRadius: '4px',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <p style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.8rem' }}>
              महाराष्ट्रातील <span className="gold">एकमेव डिफेन्स अकॅडमी</span> — जिचे संस्थापक आणि संचालक, दोघेही निवृत्त भारतीय सैन्य अधिकारी!
            </p>
            <p style={{ color: 'var(--sra-gold-lt)', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '0.8rem' }}>
              सैन्याचा प्रत्यक्ष अनुभव &nbsp;•&nbsp; सैनिकी शिस्त &nbsp;•&nbsp; योग्य मार्गदर्शन
            </p>
            <p style={{ color: 'var(--sra-cream-2)', fontSize: '1.05rem', fontStyle: 'italic', margin: 0 }}>
              &quot;ज्यांनी देशसेवा केली, तेच आता घडवत आहेत देशाचे भावी जवान.&quot;
            </p>
          </div>

          {/* Trust indicators */}
          <div className="sra-hero__trust">
            <div className="sra-hero__trust-item">
              <b>अनुभवी मार्गदर्शन</b>
              <small>माजी सैनिकांकडून प्रत्यक्ष प्रशिक्षण</small>
            </div>
            <div className="sra-hero__trust-item">
              <b>सैनिकी शिस्त</b>
              <small>व्यवस्थित प्रशिक्षण पद्धती</small>
            </div>
            <div className="sra-hero__trust-item">
              <b>संपूर्ण तयारी</b>
              <small>मैदान + लेखी परीक्षा</small>
            </div>
          </div>

          <div className="sra-hero__actions">
            <Link href="/admission" className="sra-btn sra-btn--gold" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
              प्रवेशासाठी संपर्क करा <ArrowRight size={18} />
            </Link>
            <a href="#about" className="sra-btn sra-btn--ghost sra-glass" style={{ padding: '1rem 2rem' }}>
              आमच्याबद्दल जाणून घ्या
            </a>
          </div>

          <a className="sra-hero__call" href={`tel:${phone}`}>
            <span className="sra-hero__call-ico" aria-hidden="true"><Phone size={17} /></span>
            <span>
              <b>{phone}</b>
              <small>हेडक्वार्टर संपर्क</small>
            </span>
          </a>
        </div>

        {/* RIGHT — Director photo with military plaque */}
        <div className="sra-hero__panel sra-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="sra-hero__photo">
            <Image src={FOUNDERS_PHOTO} alt={`${academyName} — दोन्ही माजी सैनिक संस्थापक`}
              fill priority quality={90} sizes="(max-width: 980px) 92vw, 46vw" />
          </div>
          {/* Military plaque */}
          <div className="sra-hero__plaque">
            <div className="sra-hero__plaque-title">संस्थापक व संचालक</div>
            <div className="sra-hero__plaque-main">निवृत्त भारतीय सैन्य अधिकारी</div>
          </div>
        </div>
      </div>
    </section>
  )
}
