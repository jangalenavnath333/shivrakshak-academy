import { BookOpenCheck, Check, Footprints, Target, UserCheck } from 'lucide-react'
import { WHY_CHOOSE } from '@/content/landing'
import Reveal from './Reveal'

const ICONS = { run: Footprints, book: BookOpenCheck, mentor: UserCheck, target: Target }

export default function WhyChoose() {
  return (
    <section className="sra-section sra-section--tint sra-why">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>शिवरक्षक करिअर अकॅडमी का निवडावी?</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>मैदान, वर्ग आणि वैयक्तिक मार्गदर्शन — भरतीसाठी लागणारी संपूर्ण तयारी एकाच ठिकाणी.</p>
        </div>
        <div className="sra-why__grid">
          {WHY_CHOOSE.map((item, i) => {
            const Icon = ICONS[item.icon]
            return (
              <Reveal key={item.title} as="article" delay={i * 80} className="sra-card">
                <span className="sra-card__icon" aria-hidden="true"><Icon size={24} /></span>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map(point => (
                    <li key={point}><Check size={15} aria-hidden="true" /> {point}</li>
                  ))}
                </ul>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
