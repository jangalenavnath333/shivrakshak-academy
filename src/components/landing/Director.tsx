import Image from 'next/image'
import { CalendarDays, Check, MapPin, Phone } from 'lucide-react'
import { DIRECTORS, WHY_CHOOSE } from '@/content/landing'
import DirectorCards from './DirectorCards'
import Reveal from './Reveal'

export default function Director() {
  const founder = DIRECTORS[0]

  return (
    <section className="sra-section sra-dir" id="about">
      <div className="sra-wrap sra-dir__grid">
        <div className="sra-dir__left">
          <Reveal>
            <div className="sra-dir__portrait" style={{ aspectRatio: '3 / 4' }}>
              {founder.photo && (
                <Image src={founder.photo} alt={founder.name} fill quality={95}
                  style={{ objectPosition: 'center top' }}
                  sizes="(max-width: 980px) 92vw, 42vw" />
              )}
            </div>
            
            {/* Army Shayari / Quote under the photo */}
            <div className="sra-dir__quote-card" style={{
              marginTop: '1.2rem',
              padding: '1.2rem',
              background: 'linear-gradient(180deg, var(--sra-panel-2), var(--sra-panel))',
              border: '1px solid var(--sra-line)',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <p style={{
                fontFamily: 'var(--sra-display)',
                fontSize: '1.15rem',
                color: 'var(--sra-gold)',
                lineHeight: '1.4',
                fontWeight: '600',
                margin: 0
              }}>
                "वर्दीची ती शान आणि तिरंग्याची ती आन, हीच एका खऱ्या सैनिकाची खरी ओळख असते!"
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <div className="sra-dir__right">
            <div className="sra-whycard" style={{ marginTop: 0 }}>
              <div className="sra-head" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <p className="sra-dir__kicker" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--sra-gold)', fontFamily: 'var(--sra-display)', fontSize: '.8rem' }}>Why Choose Us?</p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginTop: '0.3rem' }}>आम्हालाच का निवडावे?</h2>
                <div className="sra-rule" aria-hidden="true" style={{ justifyContent: 'flex-start', marginTop: '0.6rem' }}><i /></div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.2rem' }}>
                {WHY_CHOOSE.map(item => (
                  <li key={item.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span aria-hidden="true" style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      display: 'grid', placeItems: 'center',
                      background: 'rgba(212,164,55,.1)', color: 'var(--sra-gold)',
                      flex: 'none', marginTop: '2px'
                    }}><Check size={12} /></span>
                    <div>
                      <b style={{ display: 'block', color: 'var(--sra-gold-lt)', fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</b>
                      <small style={{ display: 'block', color: 'var(--sra-muted)', fontSize: '0.88rem', marginTop: '0.2rem', lineHeight: '1.5' }}>{item.detail}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Both founders — the co-founder is never dropped from the page. */}
      <div className="sra-wrap" style={{ marginTop: 'clamp(2.6rem, 6vw, 4.2rem)' }}>
        <div className="sra-head" style={{ marginBottom: '1.8rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.2rem)' }}>आमचे संचालक</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
        </div>
        <Reveal><DirectorCards /></Reveal>
      </div>
    </section>
  )
}
