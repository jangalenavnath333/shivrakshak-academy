import Image from 'next/image'
import { TESTIMONIALS } from '@/content/landing'
import Reveal from './Reveal'

export default function Testimonials() {
  return (
    <section className="sra-section">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>विद्यार्थ्यांचे मनोगत</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
        </div>
        <div className="sra-tst">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} as="article" delay={i * 80}>
              <span className="sra-tst__q" aria-hidden="true">&ldquo;</span>
              <p>{item.quote}</p>
              <div className="sra-tst__who">
                <span><Image src={item.photo} alt={item.name} fill sizes="44px" quality={70} /></span>
                <div>
                  <b>{item.name}</b>
                  <small>{item.force}</small>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="sra-head" style={{ marginTop: '1.6rem', marginBottom: 0, fontSize: '.83rem', color: 'var(--sra-muted)' }}>
          ही नमुना मनोगते आहेत; विद्यार्थ्यांच्या संमतीने प्रत्यक्ष अभिप्राय येथे लावता येतील.
        </p>
      </div>
    </section>
  )
}
