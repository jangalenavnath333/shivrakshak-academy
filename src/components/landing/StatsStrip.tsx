import { Award, BarChart3, ClipboardCheck, GraduationCap, Users } from 'lucide-react'
import type { Stat } from '@/content/landing'

const ICONS = [Users, Award, ClipboardCheck, BarChart3, GraduationCap]

export default function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className={`sra-stats${stats.length === 5 ? ' sra-stats--five' : ''}`} aria-label="अकॅडमीची आकडेवारी">
      <div className="sra-wrap">
        <div className="sra-stats__grid">
          {stats.map((stat, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <div className="sra-stat" key={stat.label}>
                <Icon size={22} aria-hidden="true" />
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
