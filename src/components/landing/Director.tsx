import Image from 'next/image'
import { UserRound } from 'lucide-react'
import { DIRECTORS, FOUNDER_BADGES, FOUNDER_INTRO, FOUNDER_QUOTE } from '@/content/landing'
import Reveal from './Reveal'

export default function Director() {
  return (
    <section className="sra-section sra-dir" id="about">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>आमचे संस्थापक व प्रमुख मार्गदर्शक</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>{FOUNDER_INTRO}</p>
        </div>

        <div className="sra-dir__pair">
          {DIRECTORS.map((person, i) => (
            <Reveal key={person.name} as="article" delay={i * 90} className="sra-dir__card">
              <div className="sra-dir__photo">
                {person.photo ? (
                  <Image src={person.photo} alt={person.name} fill sizes="(max-width: 900px) 90vw, 30vw" quality={85} />
                ) : (
                  // Honest placeholder: these are real people, so no stock face stands in.
                  <div className="sra-dir__ph">
                    <UserRound size={48} aria-hidden="true" />
                    <b>फोटो जोडायचा आहे</b>
                    <span>/public/images/director/director-{i + 1}.jpg</span>
                  </div>
                )}
                <span className="sra-dir__flag" aria-hidden="true" />
              </div>

              <div className="sra-dir__info">
                <p className="sra-dir__name">{person.name}</p>
                <p className="sra-dir__role">{person.role}</p>
                <div className="sra-dir__facts">
                  {person.facts.map(fact => (
                    <div key={fact.label}><small>{fact.label}</small><b>{fact.value}</b></div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <div className="sra-dir__close">
            <blockquote className="sra-dir__quote"><span>{FOUNDER_QUOTE}</span></blockquote>
            <div className="sra-dir__badges">
              {FOUNDER_BADGES.map(badge => <span key={badge}>{badge}</span>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
