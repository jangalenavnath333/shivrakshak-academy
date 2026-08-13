import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone, PlayCircle } from 'lucide-react'
import { ACADEMY_LOGO, FOUNDERS_PHOTO } from '@/content/landing'

export default function Hero({ phone, academyName }: { phone: string; academyName: string }) {
  return (
    <section className="sra-hero">
      {/* The founders' own poster is the hero image — no stock photography. */}
      <div className="sra-hero__bg">
        <Image src={FOUNDERS_PHOTO} alt="शिवरक्षक करिअर अकॅडमीचे माजी सैनिक संस्थापक"
          fill priority quality={86} sizes="100vw" />
      </div>
      <div className="sra-hero__scrim" aria-hidden="true" />

      <div className="sra-wrap sra-hero__grid">
        <div className="sra-hero__in">
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

        {ACADEMY_LOGO && (
          <div className="sra-hero__seal" aria-hidden="true">
            <Image src={ACADEMY_LOGO} alt="" role="presentation" fill sizes="320px" priority />
            <p>{academyName}<span>अहिल्यानगर</span></p>
          </div>
        )}
      </div>
    </section>
  )
}
