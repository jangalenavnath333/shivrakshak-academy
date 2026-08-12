import { Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import EnquiryForm from '@/app/EnquiryForm'
import { MAP_EMBED, WORKING_HOURS } from '@/content/landing'
import Reveal from './Reveal'

export default function Contact({ phone, whatsapp, email, address, waLink, courses }: {
  phone: string
  whatsapp: string
  email: string
  address: string
  waLink: string
  courses: { id: string; slug: string; title: string }[]
}) {
  return (
    <section className="sra-section sra-contact" id="contact">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>संपर्क साधा</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>प्रवेश, batch वेळा आणि फीबद्दल माहितीसाठी थेट संपर्क करा किंवा चौकशी फॉर्म भरा.</p>
        </div>

        <div className="sra-contact__grid">
          <Reveal>
            <div>
              <div className="sra-contact__list">
                <a href={`tel:${phone}`}>
                  <Phone size={19} aria-hidden="true" />
                  <span><small>फोन</small><b>{phone}</b></span>
                </a>
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={19} aria-hidden="true" />
                  <span><small>WhatsApp</small><b>{whatsapp}</b></span>
                </a>
                <a href={`mailto:${email}`}>
                  <Mail size={19} aria-hidden="true" />
                  <span><small>ई-मेल</small><b>{email}</b></span>
                </a>
                <div>
                  <MapPin size={19} aria-hidden="true" />
                  <span><small>पत्ता</small><b>{address}</b></span>
                </div>
                <div>
                  <Clock3 size={19} aria-hidden="true" />
                  <span>
                    <small>वेळापत्रक</small>
                    {WORKING_HOURS.map(hour => <b key={hour.label}>{hour.label}: {hour.value}</b>)}
                  </span>
                </div>
              </div>

              <div className="sra-map" style={{ marginTop: '1.25rem' }}>
                <iframe
                  src={MAP_EMBED}
                  title="शिवरक्षक करिअर अकॅडमी नकाशा"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="sra-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.1rem' }}>चौकशी फॉर्म</h3>
              <EnquiryForm courses={courses} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
