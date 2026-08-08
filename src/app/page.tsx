import Link from 'next/link'
import {
  ArrowRight, Award, BookOpenCheck, CheckCircle2, ChevronDown,
  Dumbbell, GraduationCap, MapPin, Menu, MessageCircle, Phone,
  Quote, ShieldCheck, Star, Target, Trophy, Users, X,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Notice } from '@/types'
import Logo from '@/components/Logo'

const WA_LINK = 'https://wa.me/917720991375?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0%2C%20%E0%A4%AE%E0%A4%B2%E0%A4%BE%20%E0%A4%B6%E0%A4%BF%E0%A4%B5%E0%A4%B0%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%95%20%E0%A4%85%E0%A4%95%E0%A5%85%E0%A4%A1%E0%A4%AE%E0%A5%80%E0%A4%AC%E0%A4%A6%E0%A5%8D%E0%A4%A6%E0%A4%B2%20%E0%A4%AE%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%A4%E0%A5%80%20%E0%A4%B9%E0%A4%B5%E0%A5%80%20%E0%A4%B9%E0%A5%8B%E0%A4%A4%E0%A5%80.'

async function getLatestNotices(): Promise<Notice[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.from('notices').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4)
    return data || []
  } catch { return [] }
}

const courses = [
  { icon: ShieldCheck, title: 'पोलीस भरती', text: 'मैदानी चाचणी, लेखी परीक्षा, मानसिक क्षमता आणि वैयक्तिक मार्गदर्शन.', tags: ['Ground', 'Written', 'Mock Tests'] },
  { icon: Target, title: 'आर्मी / अग्निवीर', text: 'शारीरिक क्षमता, शिस्त, GD आणि भरती प्रक्रियेची संपूर्ण तयारी.', tags: ['Physical', 'GD', 'Interview'] },
  { icon: Dumbbell, title: 'SRPF व सुरक्षा दल', text: 'SRPF, CISF, BSF आणि संबंधित सुरक्षा दलांसाठी लक्ष्यित प्रशिक्षण.', tags: ['Running', 'Strength', 'Theory'] },
  { icon: BookOpenCheck, title: 'लेखी परीक्षा', text: 'गणित, बुद्धिमत्ता, मराठी, इंग्रजी आणि सामान्य ज्ञानाचा सखोल अभ्यास.', tags: ['Daily Class', 'Test Series', 'Notes'] },
]

const faq = [
  ['प्रवेश प्रक्रिया कशी आहे?', 'ऑनलाइन प्रवेश अर्ज भरा किंवा अकॅडमीला भेट द्या. अर्जानंतर आमची टीम पुढील प्रक्रिया समजावून सांगेल.'],
  ['मैदानी आणि लेखी दोन्ही प्रशिक्षण मिळते का?', 'होय. निवडलेल्या कोर्सनुसार शारीरिक प्रशिक्षण, लेखी वर्ग, टेस्ट सिरीज आणि वैयक्तिक मार्गदर्शन दिले जाते.'],
  ['निवास व मेस सुविधा उपलब्ध आहे का?', 'होय. बाहेरगावच्या विद्यार्थ्यांसाठी सुरक्षित निवास आणि मेस सुविधेबद्दल प्रवेशावेळी माहिती दिली जाते.'],
  ['मुलींसाठी स्वतंत्र मार्गदर्शन आहे का?', 'होय. महिला उमेदवारांसाठी सुरक्षित वातावरण आणि आवश्यकतेनुसार स्वतंत्र मार्गदर्शन उपलब्ध आहे.'],
]

export default async function HomePage() {
  const notices = await getLatestNotices()

  return (
    <main className="landing-v2">
      {/* THESIS: disciplined momentum, not a generic coaching template. OWN-WORLD: warm white, command navy, field olive, decisive saffron. STORY: see the standard, trust the system, begin admission. FIRST VIEWPORT: statement left, aspirants in motion right, action immediately visible. FORM: editorial recruitment field-guide; seed shivrakshak-2026. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */}
      <header className="v2-header">
        <a className="v2-brand" href="#top" aria-label="शिवरक्षक अकॅडमी मुख्यपृष्ठ"><Logo size={48} /><span><b>शिवरक्षक</b><small>करियर अकॅडमी</small></span></a>
        <nav className="v2-nav" aria-label="मुख्य नेव्हिगेशन">
          <a href="#about">आमच्याबद्दल</a><a href="#courses">कोर्सेस</a><a href="#results">यशोगाथा</a><a href="#notices">सूचना</a><a href="#contact">संपर्क</a>
        </nav>
        <a className="v2-top-cta" href="tel:9284842177"><Phone size={17} /> मोफत मार्गदर्शन</a>
      </header>

      <section id="top" className="v2-hero">
        <div className="v2-hero-copy">
          <span className="v2-kicker"><span /> अहमदनगर · प्रवेश सुरू</span>
          <h1>वर्दीचं स्वप्न,<br/><em>आता होणार पूर्ण!</em></h1>
          <p>पोलीस, आर्मी, अग्निवीर, SRPF आणि सुरक्षा दल भरतीसाठी मैदानी व लेखी परीक्षेची शिस्तबद्ध, परिणामकारक तयारी.</p>
          <div className="v2-actions"><Link href="/admission" className="v2-primary">आजच प्रवेश घ्या <ArrowRight size={19}/></Link><a href="#courses" className="v2-secondary">कोर्सेस पहा <ArrowRight size={18}/></a></div>
          <div className="v2-trust">
            <span><Award/> अनुभवी प्रशिक्षक</span><span><Dumbbell/> मैदानी + लेखी तयारी</span><span><Users/> वैयक्तिक मार्गदर्शन</span>
          </div>
        </div>
        <div className="v2-hero-photo" role="img" aria-label="मैदानावर धावण्याचा सराव करणारे विद्यार्थी">
          <div className="v2-photo-note"><b>शिस्त. मेहनत. यश.</b><span>प्रत्येक दिवस निवडीच्या दिशेने</span></div>
        </div>
      </section>

      <section className="v2-numbers" aria-label="अकॅडमीची माहिती">
        <div><strong>500+</strong><span>यशस्वी विद्यार्थी</span></div><div><strong>8+</strong><span>विशेष कोर्सेस</span></div><div><strong>7+</strong><span>वर्षांचा अनुभव</span></div><div><strong>100%</strong><span>प्रशिक्षणासाठी समर्पण</span></div>
      </section>

      <section id="courses" className="v2-section v2-courses">
        <div className="v2-section-title"><div><span>तुमच्या ध्येयासाठी योग्य प्रशिक्षण</span><h2>भरतीची संपूर्ण तयारी,<br/>एका विश्वासार्ह ठिकाणी.</h2></div><p>प्रत्येक कोर्समध्ये फिटनेस, अभ्यास, टेस्ट आणि मार्गदर्शनाचा समतोल आराखडा.</p></div>
        <div className="v2-course-grid">
          {courses.map(({icon: Icon,title,text,tags}, index)=><article key={title} className="v2-course"><div className="v2-course-image v2-img"><span>0{index+1}</span><Icon/></div><div className="v2-course-body"><h3>{title}</h3><p>{text}</p><ul>{tags.map(t=><li key={t}><CheckCircle2/>{t}</li>)}</ul><a href={WA_LINK} target="_blank" rel="noopener noreferrer">अधिक माहिती <ArrowRight/></a></div></article>)}
        </div>
      </section>

      <section id="about" className="v2-method">
        <div className="v2-method-photo"><div><Trophy/><b>ध्येय फक्त परीक्षा पास करणे नाही—<br/>निवडीसाठी तयार होणे आहे.</b></div></div>
        <div className="v2-method-copy"><span>शिवरक्षक पद्धत</span><h2>मैदानापासून मेरिटपर्यंत, प्रत्येक पावलावर सोबत.</h2><p>अनुभवी प्रशिक्षक, नियमित सराव, प्रगतीचे परीक्षण आणि कमकुवत विषयांवर वैयक्तिक लक्ष—ही आमच्या प्रशिक्षणाची चार सूत्रे.</p><ol><li><b>दैनिक मैदानी सराव</b><small>Running, long jump, shot put, pull-ups आणि drill.</small></li><li><b>संकल्पना स्पष्ट करणारे वर्ग</b><small>अभ्यासक्रमानुसार notes, प्रश्नसंच आणि revision.</small></li><li><b>नियमित मूल्यांकन</b><small>Mock tests, वेळेचे नियोजन आणि performance feedback.</small></li></ol><Link href="/admission" className="v2-primary">प्रवेश अर्ज भरा <ArrowRight size={19}/></Link></div>
      </section>

      <section id="results" className="v2-section v2-results">
        <div className="v2-result-intro"><span>यशाची सुरुवात योग्य तयारीने</span><h2>प्रत्येक निवड ही शिस्तबद्ध प्रवासाची साक्ष.</h2><p>आमच्या विद्यार्थ्यांना सरकारी भरतीच्या प्रत्येक टप्प्यासाठी आत्मविश्वासाने उभे करणे हेच आमचे खरे यश.</p><div className="v2-rating"><div><Star/><Star/><Star/><Star/><Star/></div><b>विद्यार्थी-केंद्रित प्रशिक्षण</b></div></div>
        <div className="v2-quote"><Quote/><blockquote>“दररोजचा सराव, वेळेवर feedback आणि शिक्षकांचे वैयक्तिक लक्ष यामुळे तयारीला योग्य दिशा मिळाली.”</blockquote><p>— शिवरक्षक विद्यार्थी अनुभव</p></div>
        <div className="v2-quote"><Quote/><blockquote>“मैदानी तयारीसोबत लेखी परीक्षेचे नियोजनही एकाच ठिकाणी मिळाल्यामुळे सातत्य राखता आले.”</blockquote><p>— शिवरक्षक विद्यार्थी अनुभव</p></div>
      </section>

      <section id="notices" className="v2-notices">
        <div className="v2-notice-head"><div><span>अकॅडमी अपडेट्स</span><h2>ताज्या सूचना</h2></div><a href={WA_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle/> WhatsApp वर विचारा</a></div>
        <div className="v2-notice-list">
          {notices.length ? notices.map(n=><article key={n.id}><time>{new Date(n.created_at).toLocaleDateString('mr-IN')}</time><div><h3>{n.title}</h3>{n.content&&<p>{n.content}</p>}</div><ArrowRight/></article>) : <article><time>आज</time><div><h3>नवीन Batch प्रवेश सुरू</h3><p>सध्याच्या batch, फी आणि वेळापत्रकासाठी अकॅडमीशी संपर्क करा.</p></div><ArrowRight/></article>}
        </div>
      </section>

      <section className="v2-section v2-faq"><div><span>तुमचे प्रश्न, स्पष्ट उत्तरे</span><h2>वारंवार विचारले जाणारे प्रश्न</h2><p>अजून काही विचारायचे आहे? आमच्या मार्गदर्शकाशी थेट फोन किंवा WhatsApp वर बोला.</p><a href="tel:9284842177"><Phone/> 9284842177</a></div><div>{faq.map(([q,a])=><details key={q}><summary>{q}<ChevronDown/></summary><p>{a}</p></details>)}</div></section>

      <section id="contact" className="v2-contact">
        <div><span>आजच सुरुवात करा</span><h2>तुमच्या वर्दीच्या स्वप्नाला<br/>योग्य दिशा द्या.</h2><p>प्रवेश, batch timing, फी किंवा निवास सुविधेसाठी आमच्याशी संपर्क करा.</p><div className="v2-contact-links"><a href="tel:9284842177"><Phone/> <span><small>कॉल करा</small><b>9284842177</b></span></a><a href={WA_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle/><span><small>WhatsApp</small><b>7720991375</b></span></a></div></div>
        <aside><MapPin/><h3>शिवरक्षक करियर अकॅडमी</h3><p>न्यू आर्टस् कॉलेजच्या पाठीमागे, गौरव स्पोर्ट्स जवळ, बालिकाश्रम रोड, अहमदनगर — 414001</p><a href="https://maps.google.com/?q=New+Arts+College+Ahmednagar" target="_blank" rel="noopener noreferrer">Google Maps वर पहा <ArrowRight/></a></aside>
      </section>

      <footer className="v2-footer"><div className="v2-brand"><Logo size={46}/><span><b>शिवरक्षक</b><small>करियर अकॅडमी</small></span></div><p>शिस्त · साहस · स्वप्नपूर्ती</p><nav><a href="#courses">कोर्सेस</a><a href="#notices">सूचना</a><Link href="/admission">प्रवेश अर्ज</Link><Link href="/admin">Admin</Link></nav><small>© 2026 शिवरक्षक करियर अकॅडमी, अहमदनगर.</small></footer>
      <a className="v2-fab" href={WA_LINK} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp वर संपर्क करा"><MessageCircle/></a>
      <style>{css}</style>
    </main>
  )
}

const css = String.raw`
.landing-v2{--ink:#0b1f33;--navy:#071827;--orange:#ef650f;--olive:#53662e;--paper:#f7f5ef;background:var(--paper);color:var(--ink);font-family:'Noto Sans Devanagari','Segoe UI',sans-serif;overflow:hidden}.landing-v2 *{box-sizing:border-box}.landing-v2 a{text-decoration:none}.v2-header{height:86px;display:flex;align-items:center;justify-content:space-between;padding:0 max(4vw,24px);background:#fff;position:relative;z-index:10;border-bottom:1px solid #e6e1d7}.v2-brand{display:flex;align-items:center;gap:10px;color:var(--ink)}.v2-brand span{display:grid}.v2-brand b{font-size:22px;line-height:1;font-weight:900}.v2-brand small{color:var(--orange);font-size:12px;font-weight:800;margin-top:5px}.v2-nav{display:flex;gap:30px}.v2-nav a{color:#243444;font-weight:700;font-size:14px}.v2-nav a:hover{color:var(--orange)}.v2-top-cta,.v2-primary{display:inline-flex;align-items:center;gap:9px;background:var(--orange);color:#fff;padding:13px 20px;border-radius:8px;font-weight:800;box-shadow:0 12px 26px rgba(239,101,15,.18)}.v2-hero{min-height:640px;display:grid;grid-template-columns:48% 52%;background:#fff}.v2-hero-copy{padding:80px 5vw 50px 6vw;display:flex;flex-direction:column;justify-content:center}.v2-kicker,.v2-section-title span,.v2-method-copy>span,.v2-result-intro>span,.v2-notice-head span,.v2-faq>div>span,.v2-contact>div>span{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--olive);font-weight:900}.v2-kicker{display:flex;align-items:center;gap:9px}.v2-kicker span{width:28px;height:2px;background:var(--orange)}.v2-hero h1{font-size:clamp(48px,5.4vw,78px);line-height:1.08;letter-spacing:-.045em;margin:24px 0 22px;font-weight:950}.v2-hero h1 em{font-style:normal;color:var(--orange)}.v2-hero-copy>p{max-width:620px;font-size:18px;line-height:1.8;color:#405164;margin:0}.v2-actions{display:flex;gap:12px;margin:32px 0}.v2-secondary{display:inline-flex;align-items:center;gap:9px;color:var(--ink);padding:12px 18px;border:1px solid #a9b0b6;border-radius:8px;font-weight:800}.v2-trust{display:flex;gap:22px;margin-top:14px;padding-top:24px;border-top:1px solid #e9e4da;flex-wrap:wrap}.v2-trust span{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;color:#435349}.v2-trust svg{width:19px;color:var(--olive)}.v2-hero-photo{min-height:640px;background:linear-gradient(90deg,rgba(255,255,255,.12),transparent 25%),linear-gradient(0deg,rgba(7,24,39,.5),transparent 46%),url('https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg?auto=compress&cs=tinysrgb&w=1600') center/cover;position:relative}.v2-photo-note{position:absolute;right:32px;bottom:30px;background:rgba(7,24,39,.92);color:white;padding:18px 22px;border-radius:8px;display:grid;border-top:3px solid var(--orange)}.v2-photo-note b{font-size:17px}.v2-photo-note span{font-size:11px;color:#cbd5df;margin-top:4px}.v2-numbers{background:var(--navy);color:white;margin:-1px 4vw 0;display:grid;grid-template-columns:repeat(4,1fr);position:relative;z-index:2;border-radius:8px;padding:30px 0;box-shadow:0 18px 44px rgba(7,24,39,.16)}.v2-numbers div{text-align:center;border-right:1px solid rgba(255,255,255,.16)}.v2-numbers div:last-child{border:0}.v2-numbers strong{display:block;font-size:34px;color:#e5a339}.v2-numbers span{font-size:12px;color:#d9e0e6}.v2-section{padding:110px 6vw}.v2-section-title{display:flex;justify-content:space-between;align-items:end;gap:40px;margin-bottom:48px}.v2-section-title h2,.v2-method-copy h2,.v2-result-intro h2,.v2-notice-head h2,.v2-faq h2,.v2-contact h2{font-size:clamp(34px,4vw,54px);line-height:1.2;letter-spacing:-.035em;margin:12px 0 0}.v2-section-title>p{max-width:440px;color:#66717b;line-height:1.75}.v2-course-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.v2-course{background:#fff;border:1px solid #e4dfd4;border-radius:10px;overflow:hidden;transition:.25s}.v2-course:hover{transform:translateY(-6px);box-shadow:0 24px 46px rgba(11,31,51,.1)}.v2-course-image{height:150px;padding:20px;display:flex;align-items:flex-end;justify-content:space-between;color:white}.v2-course-image span{font-size:13px;font-weight:900;opacity:.7}.v2-course-image svg{width:48px;height:48px}.v2-course:nth-child(1) .v2-img{background:#17394a}.v2-course:nth-child(2) .v2-img{background:#596932}.v2-course:nth-child(3) .v2-img{background:#9a4a21}.v2-course:nth-child(4) .v2-img{background:#253650}.v2-course-body{padding:25px}.v2-course h3{font-size:20px;margin:0}.v2-course p{color:#6b737a;font-size:13px;line-height:1.7;min-height:68px}.v2-course ul{padding:0;margin:18px 0;list-style:none;display:grid;gap:8px}.v2-course li{font-size:12px;font-weight:700;color:#46564a;display:flex;gap:7px}.v2-course li svg{width:15px;color:var(--olive)}.v2-course a{color:var(--ink);font-weight:900;font-size:13px;display:flex;justify-content:space-between;border-top:1px solid #ece7de;padding-top:16px}.v2-course a svg{width:17px}.v2-method{display:grid;grid-template-columns:48% 52%;background:#fff}.v2-method-photo{min-height:650px;background:linear-gradient(0deg,rgba(7,24,39,.65),transparent),url('https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&w=1400') center/cover;position:relative}.v2-method-photo>div{position:absolute;bottom:44px;left:44px;color:#fff;display:flex;gap:16px;align-items:center}.v2-method-photo svg{width:44px;height:44px;color:#f5a12a}.v2-method-photo b{font-size:20px;line-height:1.5}.v2-method-copy{padding:76px 7vw}.v2-method-copy>p{color:#65717a;line-height:1.8}.v2-method ol{list-style:none;padding:10px 0 22px;counter-reset:method}.v2-method li{counter-increment:method;padding:17px 0 17px 55px;position:relative;border-bottom:1px solid #ece7de}.v2-method li:before{content:'0' counter(method);position:absolute;left:0;color:var(--orange);font-weight:900}.v2-method li b,.v2-method li small{display:block}.v2-method li small{color:#747e86;margin-top:5px;line-height:1.5}.v2-results{background:var(--navy);color:#fff;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:24px}.v2-result-intro{padding-right:30px}.v2-result-intro>span{color:#e5a339}.v2-result-intro p{color:#aebbc5;line-height:1.75}.v2-rating{margin-top:30px}.v2-rating svg{width:18px;fill:#e5a339;color:#e5a339}.v2-rating b{display:block;margin-top:8px;font-size:13px}.v2-quote{background:#102b3e;padding:34px;border-radius:10px;display:flex;flex-direction:column;justify-content:center}.v2-quote>svg{color:var(--orange);width:34px;height:34px}.v2-quote blockquote{font-size:18px;line-height:1.8;margin:24px 0;color:#edf2f5}.v2-quote p{font-size:12px;color:#93a5b2}.v2-notices{padding:100px 12vw;background:#fff}.v2-notice-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:32px}.v2-notice-head h2{margin-top:5px}.v2-notice-head>a,.v2-faq>div>a{display:flex;gap:8px;align-items:center;color:#15803d;font-weight:900}.v2-notice-list article{display:grid;grid-template-columns:110px 1fr 30px;gap:20px;align-items:center;border-top:1px solid #ded9cf;padding:22px 4px}.v2-notice-list time{color:var(--orange);font-weight:900}.v2-notice-list h3{margin:0;font-size:17px}.v2-notice-list p{color:#737d85;margin:7px 0 0}.v2-notice-list svg{width:20px}.v2-faq{display:grid;grid-template-columns:1fr 1.2fr;gap:9vw;background:#f1eee5}.v2-faq>div:first-child p{color:#68727a;line-height:1.8;max-width:450px}.v2-faq>div>a{margin-top:25px;color:var(--orange)}.v2-faq details{border-bottom:1px solid #d7d1c5;padding:21px 0}.v2-faq summary{font-weight:900;cursor:pointer;display:flex;justify-content:space-between;list-style:none}.v2-faq summary svg{width:20px}.v2-faq details p{color:#68727a;line-height:1.7;font-size:14px}.v2-contact{padding:90px 8vw;display:grid;grid-template-columns:1.3fr .8fr;gap:8vw;background:var(--orange);color:#fff}.v2-contact>div>span{color:#ffe0c8}.v2-contact h2{font-size:clamp(38px,5vw,64px)}.v2-contact>div>p{color:#fff3ea}.v2-contact-links{display:flex;gap:12px;margin-top:28px}.v2-contact-links>a{display:flex;align-items:center;gap:11px;padding:14px 18px;background:#fff;color:var(--ink);border-radius:8px}.v2-contact-links svg{width:24px}.v2-contact-links span{display:grid}.v2-contact-links small{font-size:10px;color:#68727a}.v2-contact aside{background:var(--navy);padding:36px;border-radius:10px}.v2-contact aside>svg{color:#e5a339;width:34px;height:34px}.v2-contact aside p{color:#bcc7cf;line-height:1.8}.v2-contact aside a{color:#fff;font-weight:900;display:flex;justify-content:space-between}.v2-contact aside a svg{width:18px}.v2-footer{padding:44px 6vw 28px;background:#06131f;color:#fff;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:35px}.v2-footer .v2-brand{color:#fff}.v2-footer>p{color:#788b99}.v2-footer nav{display:flex;gap:20px}.v2-footer nav a{color:#b8c4cc;font-size:13px}.v2-footer>small{grid-column:1/-1;border-top:1px solid #183042;padding-top:20px;color:#597080}.v2-fab{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;background:#20b95a;color:#fff;display:grid;place-items:center;z-index:50;box-shadow:0 12px 28px rgba(32,185,90,.35)}.v2-fab svg{width:27px}
@media(max-width:980px){.v2-nav{display:none}.v2-hero{grid-template-columns:1fr}.v2-hero-copy{padding:70px 7vw}.v2-hero-photo{min-height:480px}.v2-course-grid{grid-template-columns:repeat(2,1fr)}.v2-results{grid-template-columns:1fr 1fr}.v2-result-intro{grid-column:1/-1}.v2-method{grid-template-columns:1fr}.v2-method-photo{min-height:500px}.v2-faq,.v2-contact{grid-template-columns:1fr}.v2-footer{grid-template-columns:1fr}.v2-footer>small{grid-column:auto}}
@media(max-width:640px){.v2-header{height:72px;padding:0 16px}.v2-brand b{font-size:17px}.v2-brand small{font-size:9px}.v2-top-cta{font-size:0;padding:12px}.v2-top-cta svg{margin:0}.v2-hero{min-height:auto}.v2-hero-copy{padding:54px 20px 42px}.v2-hero h1{font-size:43px}.v2-hero-copy>p{font-size:15px}.v2-actions{flex-direction:column}.v2-actions a{justify-content:center}.v2-trust{gap:12px}.v2-hero-photo{min-height:390px}.v2-photo-note{left:18px;right:18px;bottom:18px}.v2-numbers{margin:0;border-radius:0;grid-template-columns:1fr 1fr;padding:10px 0}.v2-numbers div{padding:18px 5px;border-bottom:1px solid rgba(255,255,255,.13)}.v2-numbers strong{font-size:28px}.v2-section{padding:72px 18px}.v2-section-title{display:block}.v2-section-title h2,.v2-method-copy h2,.v2-result-intro h2,.v2-notice-head h2,.v2-faq h2,.v2-contact h2{font-size:34px}.v2-course-grid{grid-template-columns:1fr}.v2-course p{min-height:auto}.v2-method-photo{min-height:380px}.v2-method-photo>div{left:20px;bottom:24px}.v2-method-copy{padding:60px 20px}.v2-results{grid-template-columns:1fr}.v2-notices{padding:70px 18px}.v2-notice-head{display:block}.v2-notice-head>a{margin-top:20px}.v2-notice-list article{grid-template-columns:70px 1fr}.v2-notice-list article>svg{display:none}.v2-faq{gap:30px}.v2-contact{padding:70px 20px}.v2-contact-links{flex-direction:column}.v2-footer{padding:40px 20px}.v2-footer nav{flex-wrap:wrap}.v2-fab{width:52px;height:52px}}
@media(prefers-reduced-motion:reduce){.landing-v2 *{scroll-behavior:auto!important;transition:none!important}}
`
