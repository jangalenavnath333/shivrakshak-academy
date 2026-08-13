import Image from 'next/image'
import { Medal, Phone, UserRound } from 'lucide-react'
import {
  DIRECTORS, FOUNDERS_PHOTO, FOUNDER_BADGES, FOUNDER_INTRO,
  FOUNDER_QUOTE, FOUNDER_STORY,
} from '@/content/landing'
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

        <div className="sra-dir__lead">
          <Reveal>
            <div className="sra-dir__photo">
              <Image src={FOUNDERS_PHOTO} alt="शिवरक्षक करिअर अकॅडमीचे दोन्ही संस्थापक — माजी सैनिक"
                fill sizes="(max-width: 900px) 92vw, 46vw" quality={88} />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="sra-dir__people">
              {DIRECTORS.map(person => (
                <article key={person.name} className="sra-dir__card">
                  <span className="sra-dir__badge" aria-hidden="true"><UserRound size={19} /></span>
                  <div>
                    <p className="sra-dir__name">{person.name}</p>
                    <p className="sra-dir__role">{person.role}</p>
                    <div className="sra-dir__facts">
                      {person.facts.map(f => (
                        <div key={f.label}><small>{f.label}</small><b>{f.value}</b></div>
                      ))}
                    </div>
                    <a className="sra-dir__phone" href={`tel:${person.phone}`}>
                      <Phone size={14} aria-hidden="true" /> {person.phone}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Service record — the academy's own account of the founder's 17 years. */}
        <Reveal delay={120}>
          <div className="sra-story">
            <h3>{FOUNDER_STORY.title}</h3>
            <p className="sra-story__born">{FOUNDER_STORY.born}</p>
            <p className="sra-story__intro">{FOUNDER_STORY.intro}</p>
            <ol className="sra-story__line">
              {FOUNDER_STORY.milestones.map(m => (
                <li key={m.year}>
                  <span><Medal size={14} aria-hidden="true" /> {m.year}</span>
                  <p>{m.text}</p>
                </li>
              ))}
            </ol>
            <p className="sra-story__close">{FOUNDER_STORY.closing}</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
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
