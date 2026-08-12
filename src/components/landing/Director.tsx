import Image from 'next/image'
import { UserRound } from 'lucide-react'
import { DIRECTOR } from '@/content/landing'
import Reveal from './Reveal'

export default function Director() {
  return (
    <section className="sra-section sra-dir" id="about">
      <div className="sra-wrap sra-dir__grid">
        <Reveal>
          <div className="sra-dir__photo">
            {DIRECTOR.photo ? (
              <Image src={DIRECTOR.photo} alt={DIRECTOR.name} fill sizes="(max-width: 900px) 90vw, 34vw" quality={85} />
            ) : (
              // Honest placeholder rather than a stand-in face: the director is a real
              // person and a stock portrait here would misrepresent the academy.
              <div className="sra-dir__ph">
                <UserRound size={54} aria-hidden="true" />
                <b>संचालकांचा फोटो</b>
                <span>/public/images/director/director.jpg येथे फोटो ठेवा आणि content फाइलमध्ये path द्या.</span>
              </div>
            )}
            <span className="sra-dir__flag" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div>
            <h2>आमचे संस्थापक व प्रमुख मार्गदर्शक</h2>
            <div className="sra-rule" style={{ justifyContent: 'flex-start' }} aria-hidden="true"><i /></div>
            <p className="sra-dir__name">{DIRECTOR.name}</p>
            <p className="sra-dir__role">{DIRECTOR.role}</p>
            <p className="sra-dir__intro">{DIRECTOR.intro}</p>

            <div className="sra-dir__facts">
              {DIRECTOR.facts.map(fact => (
                <div key={fact.label}><small>{fact.label}</small><b>{fact.value}</b></div>
              ))}
            </div>

            <blockquote className="sra-dir__quote"><span>{DIRECTOR.quote}</span></blockquote>

            <div className="sra-dir__badges">
              {DIRECTOR.badges.map(badge => <span key={badge}>{badge}</span>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
