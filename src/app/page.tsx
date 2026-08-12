import { Mukta, Oswald } from 'next/font/google'
import { MessageCircle } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import { createPublicSiteClient } from '@/lib/public-site-supabase'
import type { Course, MediaAsset, SiteSettings } from '@/types'
import { HERO_STATS, RESULT_STATS, RESULTS } from '@/content/landing'
import LandingNav from '@/components/landing/LandingNav'
import Hero from '@/components/landing/Hero'
import StatsStrip from '@/components/landing/StatsStrip'
import Director from '@/components/landing/Director'
import WhyChoose from '@/components/landing/WhyChoose'
import Courses from '@/components/landing/Courses'
import Training from '@/components/landing/Training'
import Results from '@/components/landing/Results'
import Gallery from '@/components/landing/Gallery'
import Process from '@/components/landing/Process'
import Facilities from '@/components/landing/Facilities'
import Testimonials from '@/components/landing/Testimonials'
import FinalCta from '@/components/landing/FinalCta'
import Contact from '@/components/landing/Contact'
import LandingFooter from '@/components/landing/LandingFooter'
import './landing.css'

const mukta = Mukta({ subsets: ['devanagari', 'latin'], weight: ['400', '500', '700', '800'], variable: '--font-mukta', display: 'swap' })
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-oswald', display: 'swap' })

const fallbackSettings: SiteSettings = {
  id: 1,
  academy_name: 'शिवरक्षक करिअर अकॅडमी',
  tagline: 'शिस्त, पराक्रम, समर्पण — यशाची आमची परंपरा.',
  hero_title: 'शिस्त, पराक्रम, समर्पण',
  hero_subtitle: 'Army • Police • SRPF • Written Exam Training',
  phone: '9284842177',
  whatsapp: '917720991375',
  email: 'info@shivrakshakacademy.in',
  address: 'अहमदनगर, महाराष्ट्र',
}

const fallbackCourses = [
  { id: 'army', title: 'Army Bharti', slug: 'army', description: 'मैदानी व लेखी तयारी', image_url: '/course-army.jpg', is_published: true, sort_order: 1 },
  { id: 'police', title: 'Police Bharti', slug: 'police', description: 'पोलीस भरती तयारी', image_url: '/course-police.jpg', is_published: true, sort_order: 2 },
  { id: 'srpf', title: 'SRPF Bharti', slug: 'srpf', description: 'SRPF विशेष प्रशिक्षण', image_url: '/course-srpf.jpg', is_published: true, sort_order: 3 },
  { id: 'written', title: 'Written Exam Batch', slug: 'written', description: 'लेखी परीक्षा तयारी', image_url: '/course-written.jpg', is_published: true, sort_order: 4 },
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

const getCachedHomeData = unstable_cache(getHomeData, ['academy-home-data-v6'], { revalidate: 300 })

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
  const email = settings.email || fallbackSettings.email!
  const address = settings.address || fallbackSettings.address!
  const academyName = settings.academy_name || fallbackSettings.academy_name
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('नमस्कार, मला शिवरक्षक करिअर अकॅडमीच्या प्रवेशाबद्दल माहिती हवी आहे.')}`

  return (
    <main className={`sra ${mukta.variable} ${oswald.variable}`}>
      {/*
        THESIS: A recruitment-drive noticeboard, not a coaching-class brochure — the
        academy's authority is a retired Army officer, so the page leads with training
        ground and command, and refuses the pastel edu-template.
        OWN-WORLD: Near-black olive ground, deep olive panels, one military gold accent,
        hairline gold rules, square corners, Oswald for command lettering and Mukta for Marathi.
        STORY: The visitor sees disciplined training, learns who leads it, what is trained,
        who got selected, and applies.
        FIRST VIEWPORT: Full-bleed training photograph under a dark scrim, Marathi headline
        with the second line in gold, admission as the gold primary action.
        FORM: Brief-pinned direction from the supplied reference; no roll.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      */}
      <LandingNav academyName={academyName} waLink={waLink} />
      <Hero image={heroImage} phone={phone} />
      <StatsStrip stats={HERO_STATS} />
      <Director />
      <WhyChoose />
      <Courses photos={coursePhotos} />
      <Training hero={heroImage} />
      <Results photos={resultPhotos} />
      <StatsStrip stats={RESULT_STATS} />
      <Gallery />
      <Process />
      <Facilities />
      <Testimonials />
      <FinalCta image={heroImage} waLink={waLink} />
      <Contact
        phone={phone}
        whatsapp={whatsapp}
        email={email}
        address={address}
        waLink={waLink}
        courses={courses.slice(0, 4).map(({ id, slug, title }) => ({ id, slug, title }))}
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
