import Image from 'next/image'
import { MISSION } from '@/content/landing'

export default function Mission({ image }: { image: string }) {
  return (
    <section className="sra-mission">
      <div className="sra-mission__bg">
        <Image src={image} alt="" role="presentation" fill quality={70} sizes="100vw" />
      </div>
      <div className="sra-wrap">
        <blockquote>
          {MISSION.english.map(line => <span key={line}>{line}</span>)}
          <strong>{MISSION.highlight}</strong>
          <cite>{MISSION.marathi}</cite>
        </blockquote>
      </div>
    </section>
  )
}
