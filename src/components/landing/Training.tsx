import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CircleCheckBig } from 'lucide-react'
import { GALLERY, TRAINING_POINTS } from '@/content/landing'
import Reveal from './Reveal'

export default function Training() {
  return (
    <section className="sra-section sra-section--tint sra-train">
      <div className="sra-wrap sra-train__grid">
        <Reveal>
          <div>
            <h2>मैदानी प्रशिक्षण</h2>
            <div className="sra-rule" style={{ justifyContent: 'flex-start' }} aria-hidden="true"><i /></div>
            <ul>
              {TRAINING_POINTS.map(point => (
                <li key={point}><CircleCheckBig size={19} aria-hidden="true" /> {point}</li>
              ))}
            </ul>
            <Link href="/admission" className="sra-btn sra-btn--gold">अधिक माहिती घ्या <ArrowRight size={17} /></Link>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="sra-train__shots" style={{ display: 'flex', aspectRatio: 'auto', overflow: 'hidden', borderRadius: '8px' }}>
            <Image src="/images/training-collage.jpg" alt="मैदानी सरावाचे क्षण" width={800} height={600} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} quality={90} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
