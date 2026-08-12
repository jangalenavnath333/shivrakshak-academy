import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'

export default function FinalCta({ image, waLink }: { image: string; waLink: string }) {
  return (
    <section className="sra-cta">
      <div className="sra-cta__bg">
        <Image src={image} alt="" role="presentation" fill quality={70} sizes="100vw" />
      </div>
      <div className="sra-wrap">
        <h2>तुमच्या स्वप्नातील सरकारी नोकरीची सुरुवात आजच करा!</h2>
        <div className="sra-cta__actions">
          <Link href="/admission" className="sra-btn sra-btn--gold">ऑनलाइन प्रवेश अर्ज करा <ArrowRight size={18} /></Link>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="sra-btn sra-btn--wa">
            <MessageCircle size={18} /> WhatsApp वर संपर्क करा
          </a>
        </div>
      </div>
    </section>
  )
}
