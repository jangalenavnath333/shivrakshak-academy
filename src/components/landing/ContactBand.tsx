import { MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import EnquiryForm from '@/app/EnquiryForm'
import { MAP_EMBED } from '@/content/landing'
import Reveal from './Reveal'

export default function ContactBand({ phone, whatsapp, address, waLink, courses }: {
  phone: string
  whatsapp: string
  address: string
  waLink: string
  courses: { id: string; slug: string; title: string }[]
}) {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <section className="sra-section sra-contact" id="contact">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>संपर्क साधा</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>प्रवेश, batch वेळा आणि फीबद्दल माहितीसाठी थेट संपर्क करा किंवा चौकशी फॉर्म भरा.</p>
        </div>

        <div className="sra-contact__three">
          <Reveal>
            <div className="sra-cbox">
              <span className="sra-cbox__ico sra-cbox__ico--wa" aria-hidden="true"><MessageCircle size={20} /></span>
              <h3>WhatsApp चौकशी</h3>
              <p>त्वरित माहितीसाठी</p>
              <a className="sra-cbox__num" href={`tel:${phone}`}>{phone}</a>
              <a className="sra-btn sra-btn--wa" href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> WhatsApp करा
              </a>
              <a className="sra-btn sra-btn--ghost" href={`tel:${phone}`}><Phone size={16} /> Call करा</a>
              <p className="sra-cbox__alt">WhatsApp: {whatsapp}</p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="sra-cbox sra-cbox--form">
              <h3>चौकशी करा</h3>
              <p>आजच आपले नाव नोंदवा</p>
              <EnquiryForm courses={courses} />
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="sra-cbox">
              <span className="sra-cbox__ico" aria-hidden="true"><MapPin size={20} /></span>
              <h3>अकॅडमीला भेट द्या</h3>
              <p className="sra-cbox__addr">{address}</p>
              <a className="sra-btn sra-btn--gold" href={directions} target="_blank" rel="noopener noreferrer">
                <Navigation size={16} /> रस्ता दाखवा
              </a>
              <div className="sra-map" style={{ marginTop: '1rem', minHeight: 190 }}>
                <iframe src={MAP_EMBED} title="शिवरक्षक करिअर अकॅडमी नकाशा" loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" style={{ minHeight: 190 }} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
