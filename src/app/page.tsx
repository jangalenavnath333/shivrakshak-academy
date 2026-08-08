import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Notice } from '@/types'
import SiteNav from './SiteNav'
import Logo from '@/components/Logo'

const WA_LINK = 'https://wa.me/917720991375?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0%2C%20%E0%A4%AE%E0%A4%B2%E0%A4%BE%20%E0%A4%B6%E0%A4%BF%E0%A4%B5%E0%A4%B0%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%95%20%E0%A4%85%E0%A4%95%E0%A5%85%E0%A4%A1%E0%A4%AE%E0%A5%80%E0%A4%AC%E0%A4%A6%E0%A5%8D%E0%A4%A6%E0%A4%B2%20%E0%A4%AE%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%A4%E0%A5%80%20%E0%A4%B9%E0%A4%B5%E0%A5%80%20%E0%A4%B9%E0%A5%8B%E0%A4%A4%E0%A5%80.'

async function getLatestNotices(): Promise<Notice[]> {
  try {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6)
    return data || []
  } catch {
    return []
  }
}

const COURSES = [
  { emoji: '🚔', name: 'पोलीस भरती', desc: 'Maharashtra Police' },
  { emoji: '💂', name: 'आर्मी / अग्निवीर', desc: 'Indian Army' },
  { emoji: '⚓', name: 'नेव्ही', desc: 'Indian Navy' },
  { emoji: '✈️', name: 'वायुसेना', desc: 'Indian Airforce' },
  { emoji: '📋', name: 'एम.पी.एस.सी', desc: 'MPSC Exam' },
  { emoji: '🚂', name: 'रेल्वे भरती', desc: 'Railway Bharti' },
  { emoji: '📝', name: 'सरळ सेवा', desc: 'Direct Service' },
  { emoji: '👔', name: 'स्टाफ सिलेक्शन', desc: 'SSC / CISF / BSF' },
]

const FEATURES = [
  { icon: '🎖️', title: 'माजी सैनिक प्रशिक्षक', desc: 'सेवानिवृत्त लष्करी अधिकाऱ्यांकडून प्रत्यक्ष मैदानी मार्गदर्शन आणि शिस्तबद्ध प्रशिक्षण.' },
  { icon: '🏃', title: 'दैनिक शारीरिक प्रशिक्षण', desc: 'सकाळी Ground Training — Running, Long Jump, High Jump, Shot Put, Pull-ups, Drill.' },
  { icon: '📚', title: 'लेखी परीक्षा तयारी', desc: 'GK, गणित, मराठी, इंग्रजी, बुद्धिमत्ता — संपूर्ण अभ्यासक्रम आणि नियमित Test Series.' },
  { icon: '🍽️', title: 'निवास व मेस सुविधा', desc: 'बाहेरगावच्या विद्यार्थ्यांसाठी सुरक्षित वसतिगृह आणि पौष्टिक मेस सुविधा उपलब्ध.' },
  { icon: '🏆', title: 'सिद्ध निकाल', desc: '500+ विद्यार्थी महाराष्ट्र पोलीस, आर्मी, नेव्ही, रेल्वे मध्ये यशस्वीरित्या रुजू.' },
  { icon: '📱', title: 'Online प्रवेश व Updates', desc: 'घरबसल्या online प्रवेश अर्ज, PDF पावती, आणि WhatsApp वर तात्काळ सूचना.' },
]

export default async function HomePage() {
  const notices = await getLatestNotices()

  return (
    <div className="site">
      <SiteNav />

      {/* ══ TICKER ══ */}
      <div className="ticker no-print">
        <div className="ticker-track">
          <span>🏆 पोलीस भरती 2024-25 नवीन Batch सुरू &nbsp;•&nbsp; ⚡ अग्निवीर Army Batch प्रवेश चालू &nbsp;•&nbsp; 📞 माहितीसाठी: 9284842177 &nbsp;•&nbsp; 🎯 MPSC Batch लवकरच &nbsp;•&nbsp; ✈️ Navy व Airforce Batch प्रवेश सुरू &nbsp;•&nbsp; 🍽️ मेस व वसतिगृह सुविधा उपलब्ध &nbsp;•&nbsp;&nbsp;</span>
          <span>🏆 पोलीस भरती 2024-25 नवीन Batch सुरू &nbsp;•&nbsp; ⚡ अग्निवीर Army Batch प्रवेश चालू &nbsp;•&nbsp; 📞 माहितीसाठी: 9284842177 &nbsp;•&nbsp; 🎯 MPSC Batch लवकरच &nbsp;•&nbsp; ✈️ Navy व Airforce Batch प्रवेश सुरू &nbsp;•&nbsp; 🍽️ मेस व वसतिगृह सुविधा उपलब्ध &nbsp;•&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="hero tactical-bg">
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />

        <div className="hero-inner">
          <div className="hero-content">
            <div className="eyebrow">🇮🇳 &nbsp; महाराष्ट्रातील विश्वासार्ह अकॅडमी · SINCE 2018</div>

            <h1 className="hero-title">
              <span className="line1">शिवरक्षक</span>
              <span className="line2">करियर अकॅडमी</span>
            </h1>

            <p className="hero-lead">
              पोलीस &nbsp;•&nbsp; आर्मी &nbsp;•&nbsp; नेव्ही &nbsp;•&nbsp; एम.पी.एस.सी.<br />
              <strong style={{ color: '#e2e8f0' }}>भरतीपूर्व संपूर्ण प्रशिक्षण — अहमदनगर</strong>
            </p>
            <p className="hero-addr">
              📍 न्यू आर्टस् कॉलेजच्या पाठीमागे, गौरव स्पोट्स जवळ, बालिकाश्रम रोड, अ.नगर
            </p>

            <div className="hero-cta">
              <Link href="/admission" className="btn-hero">📋 प्रवेश अर्ज भरा</Link>
              <a href={WA_LINK} target="_blank" rel="noopener" className="btn-wa">💬 WhatsApp करा</a>
              <a href="tel:9284842177" className="btn-ghost">📞 9284842177</a>
            </div>

            <div className="hero-stats">
              {[
                { num: '500+', label: 'यशस्वी विद्यार्थी', sub: 'Selected in Govt Jobs' },
                { num: '8+', label: 'कोर्सेस', sub: 'Police, Army, Navy...' },
                { num: '7+', label: 'वर्षे अनुभव', sub: 'Trusted Since 2018' },
              ].map(s => (
                <div key={s.num} className="hero-stat">
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ COURSES ══ */}
      <section id="courses" className="section tactical-bg" style={{ background: 'var(--navy-950)' }}>
        <div className="section-inner">
          <div className="section-head">
            <div className="eyebrow">COURSES OFFERED</div>
            <h2 className="section-title">आमचे कोर्सेस</h2>
            <p className="section-sub">सरकारी नोकरीच्या प्रत्येक भरतीसाठी संपूर्ण प्रशिक्षण — एकाच ठिकाणी</p>
          </div>
          <div className="grid-courses">
            {COURSES.map(c => (
              <div key={c.name} className="card course-card">
                <div className="course-icon">{c.emoji}</div>
                <div className="course-name">{c.name}</div>
                <div className="course-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ACHIEVEMENTS ══ */}
      <section style={{ background: 'linear-gradient(135deg, #c2410c 0%, #b91c1c 45%, #7c2d12 100%)', padding: '60px 20px' }}>
        <div className="section-inner">
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 34px', textAlign: 'center', letterSpacing: '-0.5px' }}>
            आमची उपलब्धी
          </h2>
          <div className="grid-stats">
            {[
              { num: '500+', label: 'Selected Students', sub: 'सरकारी नोकरी मिळवली' },
              { num: '8+', label: 'Courses', sub: 'विविध भरती परीक्षा' },
              { num: '7+', label: 'Years', sub: '2018 पासून कार्यरत' },
              { num: '100%', label: 'Dedication', sub: 'विद्यार्थ्यांप्रती समर्पण' },
            ].map(a => (
              <div key={a.label}>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{a.num}</div>
                <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: 700, marginTop: 8 }}>{a.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, marginTop: 3 }}>{a.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section id="about" className="section tactical-bg">
        <div className="section-inner">
          <div className="section-head">
            <div className="eyebrow">WHY CHOOSE US</div>
            <h2 className="section-title">आम्ही का वेगळे?</h2>
            <p className="section-sub">इतर अकॅडमीपेक्षा शिवरक्षक निवडण्याची ६ कारणे</p>
          </div>
          <div className="grid-features">
            {FEATURES.map(f => (
              <div key={f.title} className="card">
                <div style={{ fontSize: 36, marginBottom: 15, lineHeight: 1 }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16.5, marginBottom: 9, color: '#f1f5f9' }}>{f.title}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NOTICES ══ */}
      <section id="notices" className="section" style={{ background: 'var(--navy-950)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div className="section-head">
            <div className="eyebrow">LIVE UPDATES</div>
            <h2 className="section-title">📢 ताज्या सूचना</h2>
          </div>
          {notices.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '48px 24px', background: 'var(--surface)', borderRadius: 15, border: '1px solid var(--border)', fontSize: 14.5 }}>
              सध्या कोणत्याही सूचना नाहीत. लवकरच update होतील.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notices.map(n => (
                <div key={n.id} className="notice-row">
                  <span style={{ fontSize: 21, flexShrink: 0, marginTop: 1 }}>
                    {n.category === 'exam' ? '📝' : n.category === 'result' ? '🏆' : n.category === 'holiday' ? '🎉' : n.category === 'important' ? '❗' : '📢'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="notice-title">{n.title}</div>
                    {n.content && <div className="notice-body">{n.content}</div>}
                  </div>
                  <div className="notice-date">{new Date(n.created_at).toLocaleDateString('mr-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" className="section tactical-bg">
        <div className="section-inner">
          <div className="section-head">
            <div className="eyebrow">CONTACT US</div>
            <h2 className="section-title">संपर्क करा</h2>
          </div>

          <div className="grid-contact">
            <div className="card">
              <div style={{ fontSize: 27, marginBottom: 16 }}>📍</div>
              <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 10, color: '#f1f5f9' }}>पत्ता</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.85 }}>
                न्यू आर्टस् कॉलेजच्या पाठीमागे,<br />
                गौरव स्पोट्स जवळ,<br />
                बालिकाश्रम रोड, अहमदनगर,<br />
                महाराष्ट्र — 414001
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 27, marginBottom: 16 }}>📞</div>
              <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 14, color: '#f1f5f9' }}>संपर्क क्रमांक</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div>
                  <a href="tel:9284842177" style={{ color: 'var(--saffron)', textDecoration: 'none', fontWeight: 700, fontSize: 19 }}>📱 9284842177</a>
                  <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 3 }}>मेजर महाडिक सर — संचालक</div>
                </div>
                <div>
                  <a href="tel:9011887714" style={{ color: 'var(--saffron)', textDecoration: 'none', fontWeight: 700, fontSize: 19 }}>📱 9011887714</a>
                  <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 3 }}>मेजर पवार सर — संचालक</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(37,211,102,0.05)', borderColor: 'rgba(37,211,102,0.16)' }}>
              <div style={{ fontSize: 27, marginBottom: 16 }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 10, color: '#f1f5f9' }}>WhatsApp</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13.5, marginBottom: 20, lineHeight: 1.65 }}>
                प्रवेश, Batch, फी — कोणत्याही प्रश्नासाठी तात्काळ WhatsApp करा
              </div>
              <a href={WA_LINK} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#25d366', color: '#fff', padding: '13px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14.5, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.28)' }}>
                💬 7720991375
              </a>
            </div>
          </div>

          {/* Registration */}
          <div style={{ marginTop: 26, textAlign: 'center', padding: '18px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: 12.5, lineHeight: 1.9 }}>
              <span style={{ color: 'var(--saffron)', fontWeight: 700 }}>शिवमुद्रा रजि. नं. ५२७/ए</span>
              <span style={{ opacity: 0.4 }}> &nbsp;|&nbsp; </span>
              <span style={{ color: 'var(--saffron)', fontWeight: 700 }}>रक्षक रजि. नं. ०००००१३२०२४</span>
              <span style={{ opacity: 0.4 }}> &nbsp;|&nbsp; </span>
              महाराष्ट्र शासन मान्यताप्राप्त संस्था
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy-800), var(--navy-950))', padding: '64px 20px', textAlign: 'center', borderTop: '1px solid var(--border-saffron)' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ fontSize: 29, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.6px' }}>
            आजच आपले भविष्य घडवा
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14.5, margin: '0 0 30px', lineHeight: 1.7 }}>
            online प्रवेश अर्ज भरा — २ मिनिटांत. लगेच प्रवेश क्रमांक आणि PDF पावती मिळेल.
          </p>
          <Link href="/admission" className="btn-hero" style={{ fontSize: 16, padding: '17px 40px' }}>
            📋 आत्ताच प्रवेश अर्ज भरा
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="site-footer no-print">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Logo size={34} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#e2e8f0' }}>शिवरक्षक करियर अकॅडमी</div>
              <div style={{ color: '#334155', fontSize: 11, marginTop: 2 }}>© 2024 • अहमदनगर, महाराष्ट्र</div>
            </div>
          </div>
          <div className="footer-links">
            <Link href="/admission">प्रवेश अर्ज</Link>
            <a href="#courses">कोर्सेस</a>
            <a href="#contact">संपर्क</a>
            <a href={WA_LINK} target="_blank" rel="noopener" style={{ color: '#25d366', fontWeight: 600 }}>💬 WhatsApp</a>
            <Link href="/admin" style={{ color: 'var(--saffron)', fontWeight: 600 }}>🔐 Admin Panel</Link>
          </div>
        </div>
      </footer>

      {/* ══ FLOATING WHATSAPP ══ */}
      <a href={WA_LINK} target="_blank" rel="noopener" className="fab-wa no-print" aria-label="WhatsApp">💬</a>
    </div>
  )
}
