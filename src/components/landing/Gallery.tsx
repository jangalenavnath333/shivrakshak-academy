import Image from 'next/image'
import { GALLERY } from '@/content/landing'
import Reveal from './Reveal'

export default function Gallery() {
  return (
    <section className="sra-section sra-section--tint" id="gallery">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>आमची गॅलरी</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>मैदान, वर्ग आणि अकॅडमीतील दैनंदिन प्रशिक्षणाचे क्षण.</p>
        </div>
        <Reveal>
          <div className="sra-gal">
            {GALLERY.map((item, i) => (
              <figure key={`${item.src}-${i}`}>
                <Image src={item.src} alt={item.caption} fill quality={74} sizes="(max-width: 620px) 100vw, (max-width: 1080px) 33vw, 25vw" />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
