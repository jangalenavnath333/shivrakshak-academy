import { Mukta, Oswald } from 'next/font/google'
import { MessageCircle } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import { createPublicSiteClient } from '@/lib/public-site-supabase'
import type { Course, MediaAsset, SiteSettings } from '@/types'
import { ACADEMY_ADDRESS, ACADEMY_EMAIL, RESULTS } from '@/content/landing'
import { BranchNote, RegistrationStrip } from '@/components/landing/BranchNote'
import LandingNav from '@/components/landing/LandingNav'
import Hero, { AcademyHeader } from '@/components/landing/Hero'
import Strengths from '@/components/landing/Strengths'
import Figures from '@/components/landing/Figures'
import Mission from '@/components/landing/Mission'
import Director from '@/components/landing/Director'
import Courses from '@/components/landing/Courses'
import Training from '@/components/landing/Training'
import Results from '@/components/landing/Results'
import Gallery from '@/components/landing/Gallery'
import Process from '@/components/landing/Process'
import Facilities from '@/components/landing/Facilities'
import Testimonials from '@/components/landing/Testimonials'
import FinalCta from '@/components/landing/FinalCta'
import ContactBand from '@/components/landing/ContactBand'
import LandingFooter from '@/components/landing/LandingFooter'
import './landing.css'

const mukta = Mukta({ subsets: ['devanagari', 'latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-mukta', display: 'swap' })
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-oswald', display: 'swap' })

const fallbackSettings: SiteSettings = {
  id: 1,
  academy_name: 'शिवरक्षक करिअर अकॅडमी',
  tagline: 'शिस्त, पराक्रम, समर्पण — यशाची आमची परंपरा.',
  hero_title: 'शिस्त, पराक्रम, समर्पण',
  hero_subtitle: 'Army • Police • SRPF • Written Exam Training',
  phone: '9011887714',
  whatsapp: '919011887714',
  email: 'powarraje34@gmail.com',
  address: 'बालिकाश्रम रोड, न्यू आर्ट्स कॉलेजसमोर, अहिल्यानगर (अहमदनगर), महाराष्ट्र ४१४००१',
}

const fallbackCourses = [
  { id: 'army', title: 'Army Bharti', slug: 'army', description: 'मैदानी व लेखी तयारी', image_url: '/images/gallery/training-3.jpg', is_published: true, sort_order: 1 },
  { id: 'police', title: 'Police Bharti', slug: 'police', description: 'पोलीस भरती तयारी', image_url: '/images/gallery/training-1.jpg', is_published: true, sort_order: 2 },
  { id: 'srpf', title: 'SRPF Bharti', slug: 'srpf', description: 'SRPF विशेष प्रशिक्षण', image_url: '/images/gallery/training-2.jpg', is_published: true, sort_order: 3 },
  { id: 'written', title: 'Written Exam Batch', slug: 'written', description: 'लेखी परीक्षा तयारी', image_url: '/images/gallery/academy-1.jpg', is_published: true, sort_order: 4 },
] satisfies Course[]

async function getHomeData() {
  try {
    const supabase = createPublicSiteClient()
    const [settings, media, courses] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('media_assets').select('*').eq('is_published', true).order('sort_order'),
      supabase.from('courses').select('*').eq('is_published', true).order('sort_order'),
    ])
    return {
      settings: (settings.data || fallbackSettings) as SiteSettings,
      media: (media.data || []) as MediaAsset[],
      courses: (courses.data?.length ? courses.data : fallbackCourses) as Course[],
    }
  } catch {
    return { settings: fallbackSettings, media: [] as MediaAsset[], courses: fallbackCourses }
  }
}

const getCachedHomeData = unstable_cache(getHomeData, ['academy-home-data-v7'], { revalidate: 300 })

const shivrakshakYoutube = 'https://www.youtube.com/@shivrakshak_academy_01'
const shivrakshakInstagram = 'https://www.instagram.com/shivrakshak_academy_01/'
const shivrakshakTelegram = 'https://t.me/shivrakshakcareeracademy'

export default async function HomePage() {
  const { settings, media, courses } = await getCachedHomeData()

  // Admin-uploaded photographs win over the bundled ones, slot by slot.
  const heroImage = media.find(item => item.placement === 'hero')?.url || '/academy-hero-v2.jpg'
  const coursePhotos = Object.fromEntries(
    ['army', 'police', 'srpf', 'written'].map(slug => [slug, media.find(item => item.placement === `course-${slug}`)?.url]),
  )
  const resultPhotos = RESULTS.map((_, index) => media.find(item => item.placement === `result-${index + 1}`)?.url)

  const phone = settings.phone || fallbackSettings.phone!
  const whatsapp = settings.whatsapp || phone
  const email = settings.email || ACADEMY_EMAIL
  const address = settings.address || ACADEMY_ADDRESS
  const academyName = settings.academy_name || fallbackSettings.academy_name
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('नमस्कार, मला शिवरक्षक करिअर अकॅडमीच्या प्रवेशाबद्दल माहिती हवी आहे.')}`

  return (
    <main className={`sra ${mukta.variable} ${oswald.variable}`}>
      {/*
        THESIS: A formal Maharashtra education-institution website translated for a defence academy.
        OWN-WORLD: White identity masthead, maroon navigation, warm cream editorial ground,
        restrained military gold and Mukta for Marathi.
        STORY: Trust and registration lead into training, leadership, courses, results and admission.
        FIRST VIEWPORT: Institutional masthead, notice strip and photographic cream hero with
        a Marathi headline, founder authority and a gold admission action.
        FORM: Brief-pinned direction from the supplied reference; no roll.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      */}
      <AcademyHeader
        academyName={academyName}
        waLink={waLink}
        socials={{
          youtube: settings.youtube_url || shivrakshakYoutube,
          instagram: settings.instagram_url || shivrakshakInstagram,
          facebook: settings.facebook_url || undefined,
          telegram: shivrakshakTelegram,
        }}
      />
      <LandingNav academyName={academyName} waLink={waLink} socials={{
        youtube: settings.youtube_url || shivrakshakYoutube,
        instagram: settings.instagram_url || shivrakshakInstagram,
        facebook: settings.facebook_url || undefined,
        telegram: shivrakshakTelegram,
      }} />
      <RegistrationStrip />
      <Hero academyName={academyName} />
      <Strengths />
      <BranchNote address={address} />
      <Director />
      <Courses photos={coursePhotos} />
      <Training />
      <Results photos={resultPhotos} />
      <Figures />
      <Gallery uploadedMedia={media.filter(m => m.placement === 'gallery')} />
      <Process />
      <Facilities />
      <Testimonials />
      <Mission image={heroImage} />
      <FinalCta image={heroImage} waLink={waLink} />
      <ContactBand
        phone={phone}
        whatsapp={whatsapp}
        address={address}
        waLink={waLink}
        courses={courses.slice(0, 6).map(({ id, slug, title }) => ({ id, slug, title }))}
      />
      <LandingFooter
        academyName={academyName}
        tagline={settings.tagline || fallbackSettings.tagline!}
        phone={phone}
        email={email}
        address={address}
        waLink={waLink}
        socials={{
          youtube: settings.youtube_url || shivrakshakYoutube,
          instagram: settings.instagram_url || shivrakshakInstagram,
          facebook: settings.facebook_url || undefined,
          telegram: shivrakshakTelegram,
        }}
      />
      <a className="sra-float" href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp वर संपर्क करा">
        <MessageCircle size={24} />
      </a>
    </main>
  )
}
