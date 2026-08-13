import { Activity, ShieldCheck, Target, Trophy } from 'lucide-react'
import { STRENGTHS } from '@/content/landing'

const ICONS = [ShieldCheck, Trophy, Activity, Target]

export default function Strengths() {
  return (
    <section className="sra-strength" aria-label="अकॅडमीची बलस्थाने">
      <div className="sra-wrap">
        <div className="sra-strength__grid">
          {STRENGTHS.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <article key={item.title}>
                <span aria-hidden="true"><Icon size={24} /></span>
                <div>
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
