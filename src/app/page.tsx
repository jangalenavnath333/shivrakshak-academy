import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import {
  ArrowRight, Award, BookOpenCheck, Camera, CheckCircle2, Clock3,
  Facebook, Instagram, Mail, MapPin, MessageCircle, MonitorCheck,
  Phone, PlayCircle, ShieldCheck, Target, Users, Youtube,
} from 'lucide-react'
import { createPublicSiteClient } from '@/lib/public-site-supabase'
import type { Course, MediaAsset, Notice, SiteSettings } from '@/types'
import SiteNav from './SiteNav'
import Logo from '@/components/Logo'
import EnquiryForm from './EnquiryForm'

const fallbackSettings: SiteSettings = {
  id: 1,
  academy_name: 'शिवरक्षक करिअर अकॅडमी',
  tagline: 'शिस्त • मेहनत • यश',
  hero_title: 'वर्दीचं स्वप्न, आता होणार पूर्ण!',
  hero_subtitle: 'भारतीय सेना, पोलीस, SRPF आणि इतर सर्व सरकारी स्पर्धा परीक्षांसाठी तज्ज्ञ मार्गदर्शन, शारीरिक आणि लेखी तयारीसह संपूर्ण प्रशिक्षण.',
  phone: '9284842177',
  whatsapp: '917720991375',
  email: 'info@shivrakshakacademy.in',
  address: 'अहमदनगर, महाराष्ट्र',
}

const fallbackCourses = [
  { id: 'police', title: 'पोलीस भरती', slug: 'police', description: 'मैदानी चाचणी, लेखी परीक्षा, मानसशास्त्र व मुलाखत मार्गदर्शन', image_url: '/hero-training.svg', is_published: true, sort_order: 1 },
  { id: 'army', title: 'आर्मी भरती', slug: 'army', description: 'शारीरिक क्षमता, GD / TDN, लेखी परीक्षा आणि वैयक्तिक मार्गदर्शन', image_url: '/hero-training.svg', is_published: true, sort_order: 2 },
  { id: 'srpf', title: 'SRPF भरती', slug: 'srpf', description: 'शारीरिक व मानसिक तयारी, विशेष मैदानी प्रशिक्षण आणि टेस्ट सिरीज', image_url: '/hero-training.svg', is_published: true, sort_order: 3 },
  { id: 'written', title: 'लेखी परीक्षा', slug: 'written', description: 'गणित, बुद्धिमत्ता, मराठी, सामान्य ज्ञान आणि नियमित Mock Tests', image_url: '/hero-training.svg', is_published: true, sort_order: 4 },
] satisfies Course[]

async function getHomeData() {
  try {
    const supabase = createPublicSiteClient()
    const [settings, media, courses, notices] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('media_assets').select('*').eq('is_published', true).order('sort_order'),
      supabase.from('courses').select('*').eq('is_published', true).order('sort_order'),
      supabase.from('notices').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
    ])
    return {
      settings: (settings.data || fallbackSettings) as SiteSettings,
      media: (media.data || []) as MediaAsset[],
      courses: (courses.data?.length ? courses.data : fallbackCourses) as Course[],
      notices: (notices.data || []) as Notice[],
    }
  } catch {
    return { settings: fallbackSettings, media: [] as MediaAsset[], courses: fallbackCourses, notices: [] as Notice[] }
  }
}

const getCachedHomeData = unstable_cache(getHomeData, ['academy-home-data'], { revalidate: 300 })

export default async function HomePage() {
  const { settings, media, courses, notices } = await getCachedHomeData()
  const hero = media.find((item) => item.placement === 'hero')?.url || '/academy-hero-v2.png'
  const videos = media.filter((item) => item.media_type !== 'image').slice(0, 3)
  const phone = settings.phone || fallbackSettings.phone!
  const whatsapp = settings.whatsapp || phone
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('नमस्कार, मला शिवरक्षक अकॅडमीबद्दल माहिती हवी आहे.')}`

  return <main className="academy-site" id="home">
    <SiteNav phone={phone} />

    <section className="academy-hero">
      <div className="hero-copy">
        <h1><span>{settings.hero_title?.split(',')[0] || 'वर्दीचं स्वप्न'}</span><strong>{settings.hero_title?.includes(',') ? settings.hero_title.slice(settings.hero_title.indexOf(',') + 1) : 'आता होणार पूर्ण!'}</strong></h1>
        <p>{settings.hero_subtitle}</p>
        <div className="hero-actions">
          <Link href="/admission" className="primary-action">आजच प्रवेश घ्या <ArrowRight size={19} /></Link>
          <a href="#courses" className="secondary-action">कोर्सेस पहा <ArrowRight size={18} /></a>
        </div>
      </div>
      <div className="hero-photo">
        <Image src={hero} alt="शिवरक्षक अकॅडमीचे मैदानी प्रशिक्षण" fill priority sizes="(max-width: 800px) 100vw, 58vw" />
      </div>
      <div className="hero-benefits">
        <span><Users /> अनुभवी प्रशिक्षक</span>
        <span><Target /> मैदानी + लेखी तयारी</span>
        <span><ShieldCheck /> वैयक्तिक मार्गदर्शन</span>
      </div>
    </section>

    <section className="proof-strip" aria-label="अकॅडमीची वैशिष्ट्ये">
      <div><Users /><strong>अनुभवी</strong><span>प्रशिक्षक टीम</span></div>
      <div><BookOpenCheck /><strong>नियमित</strong><span>टेस्ट सिरीज</span></div>
      <div><Target /><strong>संपूर्ण</strong><span>मैदानी तयारी</span></div>
      <div><Award /><strong>समर्पित</strong><span>मार्गदर्शन</span></div>
    </section>

    <section className="courses-section" id="courses">
      <div className="section-heading"><h2>ध्येयासाठी योग्य प्रशिक्षण</h2><p>प्रत्येक भरतीसाठी शारीरिक, लेखी आणि व्यक्तिमत्त्व विकासाची एकत्रित तयारी.</p></div>
      <div className="course-grid">
        {courses.slice(0, 4).map((course, index) => {
          const dynamicImage = media.find((item) => item.placement === `course-${course.slug}`)?.url
          return <article className="course-tile" key={course.id}>
            <div className="course-photo">{dynamicImage ? <Image src={dynamicImage} alt={course.title} fill sizes="(max-width: 720px) 100vw, 25vw" /> : <Image className={`course-scene course-scene-${index}`} src="/course-scenes.png" alt={course.title} fill sizes="(max-width: 720px) 100vw, 25vw" />}</div>
            <div className="course-content"><h3>{course.title}</h3><p>{course.description}</p><ul><li><CheckCircle2 /> नियमित सराव व चाचण्या</li><li><CheckCircle2 /> तज्ज्ञांचे वैयक्तिक मार्गदर्शन</li></ul><a href="#contact">अधिक माहिती <ArrowRight size={16} /></a></div>
          </article>
        })}
      </div>
    </section>

    <section className="admission-banner">
      <div><strong>आजच तुमच्या ध्येयाची सुरुवात करा</strong><span>योग्य मार्गदर्शन, शिस्तबद्ध तयारी आणि सातत्यपूर्ण सरावाने वर्दीचं स्वप्न नक्की पूर्ण होते.</span></div>
      <Link href="/admission">आजच प्रवेश घ्या <ArrowRight /></Link>
    </section>

    <section className="feature-band" id="features">
      <div><h2>तंत्रज्ञानासोबत शिस्तबद्ध तयारी</h2><p>अकॅडमीतील आणि online विद्यार्थ्यांसाठी उपस्थिती व परीक्षा एकाच व्यवस्थेत.</p></div>
      <div className="feature-grid">
        <article><Camera /><h3>Face Attendance</h3><p>Camera detectionसह live उपस्थिती आणि manual fallback.</p><Link href="/attendance">उपस्थिती पहा <ArrowRight /></Link></article>
        <article><MonitorCheck /><h3>Live Online Exam</h3><p>Timer, प्रश्नसंच, submission आणि निकालासह online tests.</p><Link href="/exams">परीक्षा पहा <ArrowRight /></Link></article>
        <article><PlayCircle /><h3>Video Academy</h3><p>Adminमधून uploaded videos व YouTube guidance.</p><a href="#videos">व्हिडिओ पहा <ArrowRight /></a></article>
      </div>
    </section>

    <section className="video-section" id="videos">
      <div className="section-heading"><h2>मैदानी सराव आणि मार्गदर्शन</h2><p>नवीन videos admin panelमधून प्रकाशित करता येतात.</p></div>
      {videos.length ? <div className="video-grid">{videos.map(video => <a key={video.id} href={video.url} target="_blank" rel="noreferrer"><div className="video-thumb">{video.thumbnail_url && <Image src={video.thumbnail_url} alt={video.alt_text || video.title} fill />}<PlayCircle /></div><strong>{video.title}</strong></a>)}</div> : <div className="empty-public"><PlayCircle /><p>प्रशिक्षणाचे videos लवकरच येथे दिसतील.</p></div>}
    </section>

    <section className="results-section" id="results">
      <div className="section-heading"><h2>अकॅडमीचे क्षण</h2><p>Admin panelमधून निवड, प्रशिक्षण आणि कार्यक्रमांचे फोटो बदला.</p></div>
      <div className="results-gallery">{Array.from({ length: 6 }).map((_, index) => {
        const photo = media.find((item) => item.placement === `result-${index + 1}`)?.url
        return <div className="selected-student" key={index}>{photo ? <Image src={photo} alt={`अकॅडमी फोटो ${index + 1}`} fill sizes="(max-width: 600px) 50vw, 16vw" /> : <Image className={`selected-scene selected-student-${index}`} src="/selected-students.png" alt={`निवड झालेला विद्यार्थी ${index + 1}`} fill sizes="(max-width: 600px) 50vw, 16vw" />}</div>
      })}</div>
      <p className="photo-note">वरील नमुना छायाचित्रे admin panel मधून वास्तविक निवड झालेल्या विद्यार्थ्यांच्या फोटोंनी बदलता येतात.</p>
      <h3 className="commitment-title">विद्यार्थ्यांसाठी आमची बांधिलकी</h3>
      <div className="commitment-grid">
        <article><b>“</b><p>मैदानी आणि लेखी तयारीसाठी स्पष्ट अभ्यासक्रम, नियमित सराव आणि प्रगतीचा सातत्याने आढावा.</p><strong>शिस्तबद्ध प्रशिक्षण</strong></article>
        <article><b>“</b><p>प्रत्येक विद्यार्थ्याच्या क्षमतेनुसार वैयक्तिक मार्गदर्शन आणि सुधारण्यासाठी ठोस सूचना.</p><strong>वैयक्तिक लक्ष</strong></article>
        <article><b>“</b><p>परीक्षेच्या तयारीसोबत आत्मविश्वास, वेळेचे नियोजन आणि स्पर्धात्मक दृष्टिकोनाचा विकास.</p><strong>संपूर्ण तयारी</strong></article>
      </div>
    </section>

    {notices.length > 0 && <section className="notice-section"><div className="section-heading"><h2>ताज्या सूचना</h2></div><div className="notice-list">{notices.map(n => <article key={n.id}><Clock3 /><div><strong>{n.title}</strong><p>{n.content}</p></div></article>)}</div></section>}

    <section className="help-section">
      <div className="faq-card"><h3>वारंवार विचारले जाणारे प्रश्न</h3>{['प्रवेश प्रक्रिया कशी आहे?','कोर्स कालावधी किती आहे?','वसतिगृहाची सुविधा आहे का?','शारीरिक चाचणीसाठी काय तयारी करावी?','अभ्यास साहित्य उपलब्ध आहे का?'].map(question => <details key={question}><summary>{question}</summary><p>अधिकृत आणि अद्ययावत माहितीसाठी अकॅडमीशी फोन किंवा WhatsApp वर संपर्क करा.</p></details>)}</div>
      <div className="enquiry-card"><h3>चौकशी फॉर्म</h3><EnquiryForm courses={courses.slice(0,4).map(({ id, slug, title }) => ({ id, slug, title }))} /></div>
      <div className="quick-contact"><h3>संपर्क</h3><a href={`tel:${phone}`}><Phone /> {phone}</a><a href={waLink}><MessageCircle /> WhatsApp</a><a href={`mailto:${settings.email}`}><Mail /> {settings.email}</a><p><MapPin /> {settings.address}</p><a className="quick-wa" href={waLink}>WhatsApp वर त्वरित संपर्क करा <ArrowRight /></a></div>
    </section>

    <section className="contact-section" id="contact">
      <div><h2>आजच तुमच्या ध्येयाची सुरुवात करा</h2><p>प्रवेश, batch आणि प्रशिक्षणाची माहिती मिळवण्यासाठी संपर्क करा.</p></div>
      <div className="contact-actions"><a href={`tel:${phone}`}><Phone /> {phone}</a><a href={waLink} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp करा</a><a href={`mailto:${settings.email}`}><Mail /> {settings.email}</a></div>
    </section>

    <footer className="academy-footer">
      <div className="footer-brand"><Logo size={58} /><div><strong>{settings.academy_name}</strong><span>{settings.tagline}</span></div></div>
      <div><h3>संपर्क</h3><p><MapPin size={16} /> {settings.address}</p><p><Phone size={16} /> {phone}</p></div>
      <div><h3>आमच्याशी जोडा</h3><div className="social-row">{settings.youtube_url && <a href={settings.youtube_url} aria-label="YouTube"><Youtube /></a>}{settings.instagram_url && <a href={settings.instagram_url} aria-label="Instagram"><Instagram /></a>}{settings.facebook_url && <a href={settings.facebook_url} aria-label="Facebook"><Facebook /></a>}<a href={waLink} aria-label="WhatsApp"><MessageCircle /></a><a href={`mailto:${settings.email}`} aria-label="Email"><Mail /></a></div><Link href="/admin" className="admin-entry">Admin Panel</Link></div>
    </footer>
    <a className="floating-whatsapp" href={waLink} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a>
  </main>
}

