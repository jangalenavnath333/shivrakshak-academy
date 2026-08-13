import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone, PlayCircle } from 'lucide-react'
import { ACADEMY_LOGO, FOUNDERS_PHOTO } from '@/content/landing'

export default function Hero({ phone, academyName }: { phone: string; academyName: string }) {
  return (
    <section className="sra-hero">
      {/* Texture only — the founders sit in their own panel so neither face is
          buried under the scrim the headline needs. */}
      <div className="sra-hero__bg" aria-hidden="true">
        <Image src={FOUNDERS_PHOTO} alt="" role="presentation" fill quality={45} sizes="100vw" />
      </div>
      <div className="sra-hero__scrim" aria-hidden="true" />

      <div className="sra-wrap sra-hero__grid">
        <div className="sra-hero__in">
          {/* Its own space above the headline — never laid over the poster, which
              already carries the academy's own branding. */}
          {ACADEMY_LOGO && (
            <div className="sra-hero__mark">
              <Image src={ACADEMY_LOGO} alt="" role="presentation" fill sizes="140px" priority />
            </div>
          )}
          <p className="sra-hero__eyebrow">Discipline · Dedication · Destination</p>

          <h1>
            <span>WE DON&rsquo;T JUST TRAIN,</span>
            <span className="gold">WE CREATE</span>
            <span>WARRIORS!</span>
          </h1>

          <p className="sra-hero__desc">तुमचा भारतीय सैन्यदलातील प्रवास इथून सुरू होतो.</p>

          <div className="sra-hero__actions">
            <Link href="/admission" className="sra-btn sra-btn--gold">प्रवेश घ्या <ArrowRight size={18} /></Link>
            <a href="#gallery" className="sra-btn sra-btn--ghost">Academy पहा <PlayCircle size={18} /></a>
          </div>

          <a className="sra-hero__call" href={`tel:${phone}`}>
            <span className="sra-hero__call-ico" aria-hidden="true"><Phone size={17} /></span>
            <span>
              <b>{phone}</b>
              <small>माहितीसाठी कॉल करा</small>
            </span>
          </a>
        </div>

        <div className="sra-hero__panel">
          <div className="sra-hero__photo">
            <Image src={FOUNDERS_PHOTO} alt={`${academyName} — दोन्ही माजी सैनिक संस्थापक`}
              fill priority quality={90} sizes="(max-width: 980px) 92vw, 46vw" />
          </div>
        </div>
      </div>
    </section>
  )
}
