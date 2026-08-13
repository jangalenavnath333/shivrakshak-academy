import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Medal, Phone } from 'lucide-react'
import { ACADEMY_LOGO } from '@/content/landing'

export default function Hero({ image, phone, academyName }: { image: string; phone: string; academyName: string }) {
  return (
    <section className="sra-hero">
      <div className="sra-hero__bg">
        <Image src={image} alt="शिवरक्षक करिअर अकॅडमीचे मैदानी प्रशिक्षण" fill priority quality={82} sizes="100vw" />
      </div>
      <div className="sra-hero__scrim" aria-hidden="true" />

      <div className="sra-wrap">
        <div className="sra-hero__in">
          {/* The mark carries the academy's identity, so it opens the page at full size. */}
          {ACADEMY_LOGO && (
            <div className="sra-hero__brand">
              <div className="sra-hero__brand-mark">
                <Image src={ACADEMY_LOGO} alt="" role="presentation" fill sizes="168px" priority />
              </div>
              <div className="sra-hero__brand-text">
                <b>{academyName}</b>
                <span>Army • Police • SRPF • Written Exam</span>
              </div>
            </div>
          )}
          <p className="sra-hero__eyebrow">Join the force. Serve the nation.</p>
          <h1>
            <span>शिस्त, पराक्रम, समर्पण</span>
            <span className="gold">यशाची आमची परंपरा!</span>
          </h1>
          <p className="sra-hero__sub">Army • Police • SRPF • Written Exam Training</p>
          <p className="sra-hero__desc">
            तुमच्या सरकारी नोकरीच्या स्वप्नासाठी शिस्तबद्ध मैदानी प्रशिक्षण, लेखी परीक्षेची तयारी,
            अनुभवी मार्गदर्शन आणि नियमित सराव.
          </p>
          <div className="sra-hero__actions">
            <Link href="/admission" className="sra-btn sra-btn--gold">आजच प्रवेश घ्या <ArrowRight size={18} /></Link>
            <a href={`tel:${phone}`} className="sra-btn sra-btn--ghost">आमच्याशी संपर्क करा <Phone size={17} /></a>
          </div>
          <p className="sra-hero__badge"><Medal size={18} /> Guided by Retired Indian Army Personnel</p>
        </div>
      </div>
    </section>
  )
}
