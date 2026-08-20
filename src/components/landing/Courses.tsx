import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { COURSES } from '@/content/landing'
import Reveal from './Reveal'

/** `photos` lets an admin-uploaded image override the bundled course photograph. */
export default function Courses({ photos }: { photos: Record<string, string | undefined> }) {
  return (
    <section className="sra-section sra-courses" id="courses">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>आमचे कोर्सेस</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>प्रत्येक भरतीसाठी वेगळा अभ्यासक्रम, वेगळा सराव आणि वेगळे मैदानी नियोजन.</p>
        </div>
        <div className="sra-courses__grid">
          {COURSES.map((course, i) => (
            <Reveal key={course.slug} as="article" delay={i * 70} className="sra-course">
              <div className="sra-course__img">
                <Image
                  src={photos[course.slug] || course.image}
                  alt={`${course.title} प्रशिक्षण`}
                  fill quality={90}
                  style={{ objectPosition: 'center', objectFit: 'contain', padding: '1.5rem', background: 'var(--sra-ground-2)' }}
                  sizes="(max-width: 620px) 100vw, (max-width: 1080px) 50vw, 25vw"
                />
              </div>
              <div className="sra-course__body">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <ul className="sra-course__feat">
                  {course.features.map(f => <li key={f}><Check size={14} aria-hidden="true" /> {f}</li>)}
                </ul>
                <Link href="/admission" className="sra-btn sra-btn--ghost">अधिक माहिती <ArrowRight size={15} /></Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
