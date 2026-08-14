import Image from 'next/image'
import { RESULTS } from '@/content/landing'
import Reveal from './Reveal'

/** `photos` lets admin-uploaded student photographs override the bundled ones. */
export default function Results({ photos }: { photos: (string | undefined)[] }) {
  return (
    <section className="sra-section sra-results" id="results">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>आमचे यशस्वी विद्यार्थी</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>मैदानी सराव आणि लेखी तयारीच्या जोरावर विविध दलांमध्ये निवड झालेले विद्यार्थी.</p>
        </div>
        <Reveal>
          <div className="sra-rail">
            {RESULTS.map((student, i) => (
              <article className="sra-res" key={student.name}>
                <div className="sra-res__img">
                  <Image src={photos[i] || student.photo} alt={student.name} fill quality={90} sizes="(max-width: 620px) 60vw, 210px" style={{ objectPosition: 'center top' }} />
                </div>
                <div className="sra-res__body">
                  <b>{student.name}</b>
                  <span>{student.force}</span>
                  <small>{student.year}</small>
                  <div><em className="sra-res__tag">Selected</em></div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
        <p className="sra-head" style={{ marginTop: '1.6rem', marginBottom: 0, fontSize: '.83rem', color: 'var(--sra-muted)' }}>
          वरील छायाचित्रे व नावे नमुना आहेत; admin panel मधून प्रत्यक्ष निवड झालेल्या विद्यार्थ्यांची माहिती भरता येते.
        </p>
      </div>
    </section>
  )
}
