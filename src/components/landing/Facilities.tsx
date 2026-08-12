import {
  BookMarked, CalendarCheck, ClipboardCheck, Dumbbell,
  GraduationCap, MonitorCheck, School, UserCheck,
} from 'lucide-react'
import { FACILITIES } from '@/content/landing'
import Reveal from './Reveal'

const ICONS = [Dumbbell, School, MonitorCheck, CalendarCheck, BookMarked, ClipboardCheck, UserCheck, GraduationCap]

export default function Facilities() {
  return (
    <section className="sra-section sra-section--tint" id="facilities">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>अकॅडमीतील सुविधा</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>प्रशिक्षणासाठी लागणारी मैदानी, शैक्षणिक आणि तांत्रिक व्यवस्था.</p>
        </div>
        <Reveal>
          <div className="sra-fac">
            {FACILITIES.map((item, i) => {
              const Icon = ICONS[i % ICONS.length]
              return (
                <article key={item.title}>
                  <Icon size={21} aria-hidden="true" />
                  <div>
                    <b>{item.title}</b>
                    <span>{item.detail}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
