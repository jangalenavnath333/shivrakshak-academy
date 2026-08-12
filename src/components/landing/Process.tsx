import { Activity, ClipboardList, Dumbbell, FileCheck2, LineChart, Trophy } from 'lucide-react'
import { PROCESS } from '@/content/landing'
import Reveal from './Reveal'

const ICONS = [ClipboardList, Activity, Dumbbell, FileCheck2, LineChart, Trophy]

export default function Process() {
  return (
    <section className="sra-section">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>प्रशिक्षण प्रक्रिया</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>प्रवेशापासून अंतिम भरतीपर्यंत प्रत्येक टप्प्यावर नियोजित मार्गदर्शन.</p>
        </div>
        <div className="sra-proc">
          {PROCESS.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <Reveal key={item.step} as="article" delay={i * 70}>
                <span className="sra-proc__dot" aria-hidden="true"><Icon size={22} /></span>
                <div>
                  <h3>{item.step}</h3>
                  <p>{item.detail}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
