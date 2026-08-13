import Image from 'next/image'
import { CalendarDays, Check, MapPin, Phone } from 'lucide-react'
import { DIRECTORS, WHY_CHOOSE } from '@/content/landing'
import DirectorCards from './DirectorCards'
import Reveal from './Reveal'

export default function Director() {
  const founder = DIRECTORS[0]
  const detail = founder.detail

  return (
    <section className="sra-section sra-dir" id="about">
      <div className="sra-wrap sra-dir__grid">
        <div className="sra-dir__left">
          <Reveal>
            <div className="sra-dir__portrait">
              {founder.photo && (
                <Image src={founder.photo} alt={founder.name} fill quality={88}
                  sizes="(max-width: 980px) 92vw, 42vw" />
              )}
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="sra-whycard">
              <h3>Why Choose Us?</h3>
              <ul>
                {WHY_CHOOSE.map(item => (
                  <li key={item.title}>
                    <span aria-hidden="true"><Check size={13} /></span>
                    <div><b>{item.title}</b><small>{item.detail}</small></div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <div className="sra-dir__right">
            <p className="sra-dir__kicker">About our Director</p>
            <h2>{founder.name}</h2>
            <p className="sra-dir__role">{founder.role}</p>

            <div className="sra-dir__chips">
              <span><CalendarDays size={14} aria-hidden="true" /> जन्म : १७ जुलै १९८६</span>
              <span><MapPin size={14} aria-hidden="true" /> बीड जिल्हा, महाराष्ट्र</span>
              <a href={`tel:${founder.phone}`}><Phone size={14} aria-hidden="true" /> {founder.phone}</a>
            </div>

            {detail && (
              <>
                <p className="sra-dir__intro">{detail.intro}</p>

                <ol className="sra-timeline">
                  {detail.milestones.map((m, i) => (
                    <li key={m.year}>
                      <span className="sra-timeline__no">{i + 1}</span>
                      <div>
                        <b>{m.year}</b>
                        <p>{m.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <blockquote className="sra-dir__box">{detail.closing}</blockquote>
              </>
            )}
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
