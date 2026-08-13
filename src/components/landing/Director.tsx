import Image from 'next/image'
import {
  FOUNDERS_PHOTO, FOUNDER_BADGES, FOUNDER_INTRO, FOUNDER_QUOTE,
} from '@/content/landing'
import DirectorCards from './DirectorCards'
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
            <DirectorCards />
          </Reveal>
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
