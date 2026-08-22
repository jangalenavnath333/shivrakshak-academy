import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Youtube, Send, MessageCircle, ArrowRight, Phone, ShieldCheck, Dumbbell, BookOpen } from 'lucide-react'
import { ACADEMY_LOGO, FOUNDERS_PHOTO } from '@/content/landing'

export function AcademyHeader({
  academyName,
  waLink,
  socials,
}: {
  academyName: string
  waLink: string
  socials: { youtube: string; instagram: string; telegram: string; facebook?: string }
}) {
  return (
    <header className="sra-academy-header">
      <div className="sra-wrap sra-hero__topbar-inner">
        <div className="sra-hero__top-brand">
          <div className="sra-hero__top-logo">
            <Image src={ACADEMY_LOGO as string} alt="शिवरक्षक करिअर अकॅडमी लोगो" fill sizes="82px" />
          </div>
          <div>
            <p className="sra-academy-header__trust">निवृत्त भारतीय सैन्य अधिकाऱ्यांच्या मार्गदर्शनाखाली</p>
            <h2 className="sra-hero__top-name">{academyName}</h2>
            <p className="sra-academy-header__sub">Army · Police · SRPF · Written Exam Training</p>
          </div>
        </div>
        <div className="sra-hero__top-actions">
          <div className="sra-hero__top-socials">
            <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="sra-nav__social sra-nav__social--insta"><Instagram size={17} /></a>
            <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="sra-nav__social sra-nav__social--yt"><Youtube size={17} /></a>
            <a href={socials.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="sra-nav__social sra-nav__social--tg"><Send size={17} /></a>
          </div>
          <Link href="/admission" className="sra-btn sra-btn--gold sra-hero__top-cta">प्रवेश घ्या</Link>
          <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="sra-hero__top-wa"><MessageCircle size={18} /></a>
        </div>
      </div>
    </header>
  )
}

export default function Hero({ 
  academyName,
  phone = '9011887714',
}: { 
  academyName: string;
  phone?: string;
  waLink?: string;
  socials?: { youtube: string; instagram: string; telegram: string; facebook?: string };
}) {
  return (
    <section className="sra-hero">
      {/* Static training image keeps the hero calm and accessible. */}
      <div className="sra-hero__bg" aria-hidden="true" style={{ opacity: 0.45 }}>
        <Image src="/academy-hero-v2.jpg" alt="" fill priority quality={72} sizes="100vw" />
      </div>
      <div className="sra-hero__scrim" aria-hidden="true" />

      <div className="sra-wrap sra-hero__grid">
        {/* LEFT — Headlines & CTAs */}
        <div className="sra-hero__in sra-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="sra-hero__title" style={{ fontFamily: 'var(--sra-display)' }}>
            आम्ही फक्त <br />
            प्रशिक्षण देत नाही, <br />
            <span className="gold">आम्ही सैनिक घडवतो!</span>
          </h1>

          <div className="sra-hero__values">
            <span>शिस्त</span>
            <span>मेहनत</span>
            <span>समर्पण</span>
            <span>यश</span>
          </div>

          <div className="sra-hero__highlight-box">
            <p>
              महाराष्ट्रातील <span style={{ color: 'var(--sra-gold)' }}>एकमेव डिफेन्स अकॅडमी</span> — जिचे संस्थापक आणि संचालक, दोघेही <span style={{ color: 'var(--sra-gold)' }}>निवृत्त भारतीय सैन्य अधिकारी</span>!
            </p>
            <p className="sra-hero__proof">
              सैन्याचा प्रत्यक्ष अनुभव &nbsp;•&nbsp; सैनिकी शिस्त &nbsp;•&nbsp; योग्य मार्गदर्शन
            </p>
            <p className="sra-hero__quote">
              &quot;ज्यांनी देशसेवा केली, तेच आता घडवत आहेत देशाचे भावी जवान.&quot;
            </p>
          </div>

          <div className="sra-hero__action-row">
            <Link href="/admission" className="sra-hero__admission">
              <span>
                <small>प्रवेश प्रक्रिया सुरू आहे</small>
                <b>आजच प्रवेश अर्ज भरा</b>
              </span>
              <ArrowRight size={22} aria-hidden="true" />
            </Link>
            <a href={`tel:${phone}`} className="sra-hero__phone">
              <Phone size={19} aria-hidden="true" />
              <span><small>अधिक माहितीसाठी</small><b>{phone}</b></span>
            </a>
          </div>

          <div className="sra-hero__signals" aria-label="अकॅडमीची वैशिष्ट्ये">
            <span><ShieldCheck size={19} aria-hidden="true" /> माजी सैनिकांचे मार्गदर्शन</span>
            <span><Dumbbell size={19} aria-hidden="true" /> मैदानी प्रशिक्षण</span>
            <span><BookOpen size={19} aria-hidden="true" /> लेखी परीक्षेची तयारी</span>
          </div>


        </div>

        {/* RIGHT — Director photo with military plaque */}
        <div className="sra-hero__panel sra-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="sra-hero__photo">
            <Image src={FOUNDERS_PHOTO} alt={`${academyName} — दोन्ही माजी सैनिक संस्थापक`}
              fill priority quality={90} sizes="(max-width: 980px) 92vw, 46vw" />
          </div>
        </div>
      </div>
    </section>
  )
}
