import Image from 'next/image'
import { Check, ShieldCheck } from 'lucide-react'
import { WHY_CHOOSE } from '@/content/landing'
import DirectorCards from './DirectorCards'
import Reveal from './Reveal'

export default function Director() {
  return (
    <section className="sra-section sra-dir" id="about">
      <div className="sra-wrap sra-dir__grid">
        <div className="sra-dir__left">
          <Reveal>
            <div className="sra-dir__portrait">
              <Image src="/images/gallery/training-1.jpg" alt="शिवरक्षक अकॅडमीतील मैदानी प्रशिक्षण" fill quality={92}
                sizes="(max-width: 980px) 92vw, 42vw" />
              <div className="sra-dir__image-caption">
                <ShieldCheck size={22} aria-hidden="true" />
                <span><b>प्रत्यक्ष मैदानावर प्रशिक्षण</b><small>शिस्त · स्टॅमिना · सातत्य</small></span>
              </div>
            </div>

            <div className="sra-dir__quote-card">
              <p>
                "वर्दीची ती शान आणि तिरंग्याची ती आन, हीच एका खऱ्या सैनिकाची खरी ओळख असते!"
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <div className="sra-dir__right">
            <div className="sra-whycard">
              <div className="sra-head sra-whycard__head">
                <h2>आम्हालाच का निवडावे?</h2>
                <p>भरतीच्या प्रत्येक टप्प्यासाठी एकाच ठिकाणी शिस्तबद्ध तयारी.</p>
                <div className="sra-rule" aria-hidden="true"><i /></div>
              </div>
              <ul className="sra-whycard__list">
                {WHY_CHOOSE.map(item => (
                  <li key={item.title}>
                    <span aria-hidden="true"><Check size={15} /></span>
                    <div>
                      <b>{item.title}</b>
                      <small>{item.detail}</small>
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
