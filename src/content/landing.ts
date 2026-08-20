/**
 * Landing page content.
 *
 * Everything an administrator is likely to edit lives in this one file: numbers,
 * names, photo paths and copy. Nothing here is fetched, so editing a value and
 * redeploying is enough. Photographs uploaded through the admin panel still
 * override the matching slots at runtime — see src/app/page.tsx.
 *
 * Replace a photograph by dropping the file into /public and updating the path.
 */

export type Stat = { value: string; label: string }

/**
 * The strengths strip under the hero.
 *
 * These are qualities the academy can stand behind, not counts. Selection totals
 * and success percentages are deliberately absent: none are recorded anywhere in
 * this project, and inventing them would put an unverifiable claim in front of
 * parents. Add ACADEMY_FIGURES below once real numbers exist.
 */
export const STRENGTHS = [
  { title: 'Expert Trainers', detail: 'माजी सैनिकांकडून प्रत्यक्ष मार्गदर्शन' },
  { title: 'Proven Results', detail: 'निवड झालेल्या विद्यार्थ्यांची परंपरा' },
  { title: 'Physical Excellence', detail: 'रोजचा मैदानी सराव व स्टॅमिना' },
  { title: 'Complete Guidance', detail: 'प्रवेशापासून अंतिम निवडीपर्यंत' },
]

/**
 * Verified facts only. Every line here is checkable — the Udyam certificate, the
 * founders' service, or the academy's own single-branch status.
 * Add counts here only when the academy confirms them.
 */
export const ACADEMY_FIGURES = [
  { value: '२', label: 'माजी सैनिक संचालक' },
  { value: '१७', label: 'वर्षे सैन्य सेवा (संस्थापक)' },
  { value: '१', label: 'शाखा — अहिल्यानगर' },
  { value: '४', label: 'भरती कोर्सेस' },
]

/**
 * Academy logo. Leave null to use the built-in shield mark (src/components/Logo.tsx).
 * To use your own file: save it as /public/images/logo/academy-logo.png (square,
 * transparent background, at least 256x256) and set:
 *   photo: '/images/logo/academy-logo.png'
 */
/** Academy logo — the golden eagle mark. */
export const ACADEMY_LOGO: string | null = '/images/logo/academy-logo.png'

/** Government registration, shown as the trust line above the hero heading. */
export const REGISTRATION = {
  headline: 'सरकार मान्यता प्राप्त · माजी सैनिकांद्वारे संचलित',
  udyam: 'UDYAM-MH-01-0126235',
  since: '2023',
}

/** One branch only — stated plainly because it is a genuine differentiator. */
export const BRANCH_NOTE = {
  title: 'महाराष्ट्रात फक्त एकच शाखा',
  place: 'अहिल्यानगर मध्ये',
}

export type DirectorDetail = {
  born: string
  intro: string
  milestones: { year: string; text: string }[]
  closing: string
}

/** Group photograph of both founders in uniform. */
export const FOUNDERS_PHOTO = '/images/director/founders.png'

/**
 * The two founders. Both are ex-servicemen who run the academy themselves.
 * Replace a portrait by putting the file in /public/images/director/.
 */
export const DIRECTORS = [
  {
    photo: '/images/director/raje-pawar-army.jpg' as string | null,
    // Separate photograph for the small directors card only; the section
    // portrait and the dialog keep `photo`.
    cardPhoto: '/images/director/raje-pawar-yoddha.jpg' as string | null,
    backgroundPosition: 'center 20%',
    name: 'वस्ताद योद्धा राजे पवार',
    role: 'माजी सैनिक, भारतीय सेना | संस्थापक व संचालक',
    phone: '9011887714',
    // Rank and dates verified from the 101 Infantry Battalion (TA) discharge certificate.
    facts: [
      { label: 'रँक', value: 'हवालदार' },
      { label: 'सैन्य सेवा', value: '१७ वर्षे' },
      { label: 'रेजिमेंट', value: 'मराठा लाईट इन्फंट्री (TA)' },
      { label: 'सेवा काळ', value: '२००६ — २०२३' },
    ],
    detail: {
      born: 'जन्म : १७ जुलै १९८६ · बीड जिल्हा, महाराष्ट्र',
      intro:
        'लहानपणापासूनच एकच स्वप्न — देशसेवा करायची आणि तिरंग्याची शान वाढवायची. या स्वप्नासाठी सुरू झालेला संघर्ष २००६ मध्ये निर्णायक ठरला.',
      milestones: [
        { year: '२००६', text: 'मराठा लाईट इन्फंट्री, TA बटालियनच्या रेसमध्ये ५०० मुलांमध्ये प्रथम क्रमांक — भारतीय सैन्यात प्रवेश (२२ फेब्रुवारी २००६).' },
        { year: 'प्रशिक्षण', text: 'बेळगावच्या प्रशिक्षण केंद्रात ९ महिन्यांचे खडतर प्रशिक्षण. मलखांबमध्ये उत्कृष्ट कामगिरी आणि Best Bennett सन्मान.' },
        { year: '१७ वर्षे', text: 'जम्मू-काश्मीर, कुपवाडा, अनंतनाग, पट्टण, श्रीनगर, उधमपूर, राजस्थान, पुणे व दिल्ली येथे देशसेवा.' },
        { year: '२००९', text: 'मलखांबमधील उत्कृष्ट कामगिरीसाठी संरक्षण मंत्र्यांच्या हस्ते सन्मान.' },
        { year: 'दिल्ली परेड', text: 'दिल्ली परेडमध्ये प्रथम क्रमांक; वरिष्ठ अधिकाऱ्यांकडून अनेकदा गौरव.' },
        { year: '२०२३', text: 'हवालदार पदावरून सेवानिवृत्त (२८ फेब्रुवारी २०२३). Junior Leader म्हणून विशेष प्राविण्य.' },
      ],
      closing:
        'ही केवळ पुरस्कारांची यादी नाही — हा एका सैनिकाच्या १७ वर्षांच्या त्यागाचा, शिस्तीचा आणि देशासाठी दिलेल्या योगदानाचा इतिहास आहे. ज्याने स्वतः वर्दी परिधान करून देशसेवा केली, तोच आज हजारो तरुणांना वर्दीचे स्वप्न पूर्ण करण्यासाठी घडवत आहे.',
    } as DirectorDetail | null,
  },
  {
    photo: '/images/director/sambhaji-mahadik-portrait.jpg' as string | null,
    cardPhoto: '/images/director/sambhaji-mahadik-portrait.jpg' as string | null,
    backgroundPosition: 'center',
    name: 'वस्ताद संभाजी महाडिक',
    role: 'माजी सैनिक, भारतीय सेना | संस्थापक',
    phone: '9284842177',
    facts: [
      { label: 'रँक', value: 'हवालदार' },
      { label: 'सैन्य सेवा', value: '१७ वर्षे' },
      { label: 'रेजिमेंट', value: 'बॉम्बे इंजिनियर्स ग्रुप' },
      { label: 'सेवा काळ', value: '२००२ — २०१९' },
    ],
    detail: {
      born: 'माजी सैनिक, भारतीय सेना · बॉम्बे इंजिनियर्स अँड ग्रुप सेंटर',
      intro:
        'शाळेत जायला सुरुवात केल्यापासूनच मनात एकच विचार होता — "या देशासाठी काहीतरी करायचं!" छत्रपती शिवाजी महाराज, छत्रपती संभाजी महाराज आणि भारतासाठी आपले अमूल्य जीवन अर्पण करणाऱ्या क्रांतिकारकांच्या विचारांचा मनावर खोलवर परिणाम झाला. कुटुंबातील मामा आणि भाऊ भारतीय सैन्यात सेवेत असल्यामुळे सैन्यसेवेची प्रेरणा आणखी वाढली.',
      milestones: [
        { year: '४ ऑक्टो. २००२', text: 'वयाच्या अवघ्या साडेसतरा वर्षी, पहिल्याच सैन्य भरती रॅलीमध्ये हजारो उमेदवारांच्या गर्दीतून बॉम्बे इंजिनियर्स अँड ग्रुप सेंटर येथे भारतीय सैन्यात भरती.' },
        { year: 'प्रशिक्षण', text: 'WT कोर्स, शॉर्ट कमांडो कोर्स, IED कोर्स, Nuclear-Biological-Chemical Warfare, Combat Engineer Instructor Course, NCO प्रशिक्षण यशस्वीरीत्या पूर्ण.' },
        { year: '२०१२', text: 'भारत-अमेरिका संयुक्त सैन्य युद्धाभ्यासात उत्कृष्ट कामगिरीबद्दल प्रशस्तीपत्र प्राप्त.' },
        { year: 'NCO प्रमोशन', text: '४०० जवानांमधून द्वितीय क्रमांक मिळवत Grade \'A\' प्राप्त. रेजिमेंटल पोलीस हवालदार म्हणून महत्त्वाची जबाबदारी.' },
        { year: 'खेळ', text: 'कबड्डी आणि कुस्ती या दोन्ही खेळांमध्ये कमांड लेव्हलवर सहभाग.' },
        { year: '१७ वर्षे सेवा', text: 'भारतमातेच्या सेवेसाठी स्वतःला वाहून घेत तब्बल १७ वर्षे प्रामाणिक, शिस्तबद्ध आणि समर्पित सेवा बजावल्यानंतर स्वेच्छेने सेवानिवृत्ती.' },
        { year: 'अकॅडमी', text: 'संस्थापक — मैदानी प्रशिक्षण विभागाचे प्रमुख. आजही त्याच जिद्दीने, शिस्तीने युवकांना सैन्य, पोलीस व सुरक्षा दलांमध्ये जाण्यासाठी प्रेरित करण्याचे कार्य सुरू.' },
      ],
      closing:
        'सैनिक ते समाजघडविणारा मार्गदर्शक — देशासाठी जगायचं, देशासाठी घडायचं आणि देशासाठी पुढची पिढी तयार करायची — हा संकल्प आजही कायम आहे. "वेड फक्त देशसेवेचं!"',
    } as DirectorDetail | null,
  },
]

export const FOUNDER_INTRO =
  'भारतीय सैन्यातील शिस्त, सेवाभाव आणि प्रशिक्षणाचा प्रत्यक्ष अनुभव विद्यार्थ्यांपर्यंत पोहोचवण्याच्या उद्देशाने शिवरक्षक करिअर अकॅडमीची स्थापना दोन माजी सैनिकांनी केली. ज्यांनी स्वतः वर्दी परिधान करून देशसेवा केली, तेच आज आपल्या अनुभवातून तरुणांना वर्दीचे स्वप्न पूर्ण करण्यासाठी घडवत आहेत.'

export const FOUNDER_QUOTE =
  'फक्त परीक्षा पास होणे हे ध्येय नाही; शिस्त, आत्मविश्वास आणि देशसेवेची मानसिकता घडवणे हे आमचे उद्दिष्ट आहे.'

export const FOUNDER_BADGES = ['माजी सैनिक मार्गदर्शन', 'शिस्तबद्ध प्रशिक्षण', 'वैयक्तिक लक्ष', 'मैदानी सराव']

export const WHY_CHOOSE = [
  { title: 'Army Written & Physical', detail: 'संपूर्ण तयारी — मैदान आणि वर्ग दोन्ही' },
  { title: 'NDA / Navy / Air Force', detail: 'संपूर्ण मार्गदर्शन व सराव' },
  { title: 'Personality Development', detail: 'आत्मविश्वास व नेतृत्वगुण' },
  { title: 'Physical Training', detail: 'रोजचा शिस्तबद्ध मैदानी सराव' },
  { title: 'Modern Infrastructure', detail: 'प्रशस्त मैदान व वर्गखोल्या' },
  { title: 'Selection Guidance', detail: 'निवडीपर्यंत सतत पाठिंबा' },
]

/** Cinematic closing line. */
export const MISSION = {
  english: ['YOUR DREAM.', 'OUR MISSION.'],
  highlight: 'TOGETHER WE WILL DEFEND THE NATION!',
  marathi: 'तुमचे स्वप्न — आमचे ध्येय.',
}

/** Course photographs live in /public. Replace the file or change the path. */
export const COURSES = [
  { slug: 'army', title: 'Indian Army', image: '/images/courses/army.jpg', description: 'भारतीय सेनेत भरती होण्याचे स्वप्न पूर्ण करण्यासाठी संपूर्ण मैदानी व लेखी तयारी.', features: ['GD / Technical', 'Physical Standards', 'Written Practice'] },
  { slug: 'police', title: 'Maharashtra Police', image: '/images/courses/police.jpg', description: 'महाराष्ट्र पोलीस भरतीसाठी मैदानी चाचणी, लेखी परीक्षा व मुलाखतीची तयारी.', features: ['मैदानी चाचणी', 'लेखी परीक्षा', 'मुलाखत मार्गदर्शन'] },
  { slug: 'srpf', title: 'State Reserve Police Force', image: '/images/courses/srpf.jpg', description: 'SRPF व राज्य राखीव दलासाठी विशेष शारीरिक आणि मानसिक तयारी.', features: ['विशेष मैदानी सराव', 'Stamina Training', 'Test Series'] },
  { slug: 'written', title: 'Written Examination', image: '/images/courses/written.jpg', description: 'गणित, बुद्धिमत्ता, मराठी, इंग्रजी आणि सामान्य ज्ञानाची सखोल तयारी.', features: ['गणित व बुद्धिमत्ता', 'मराठी / इंग्रजी', 'Daily Mock Tests'] },
]

export const TRAINING_POINTS = [
  '1600m Running', '100m Sprint', 'Long Jump',
  'Shot Put', 'Daily Ground Practice', 'Fitness & Stamina Training',
]

/**
 * Selected students. Photographs are placeholders from /public — replace each
 * `photo` with a real student photograph and update the name, force and year.
 */
export const RESULTS = [
  { name: 'अमोल पाटील', force: 'Indian Army', year: '2023', photo: '/images/gallery/felicitation-1.jpg' },
  { name: 'रोहन शिंदे', force: 'Maharashtra Police', year: '2023', photo: '/images/gallery/felicitation-2.jpg' },
  { name: 'सागर जाधव', force: 'SRPF', year: '2023', photo: '/images/gallery/felicitation-3.jpg' },
  { name: 'प्रतीक खरे', force: 'Indian Army', year: '2024', photo: '/images/gallery/felicitation-4.jpg' },
  { name: 'विकास वाघमारे', force: 'Maharashtra Police', year: '2024', photo: '/images/gallery/felicitation-5.jpg' },
  { name: 'नितीन कदम', force: 'SRPF', year: '2024', photo: '/images/gallery/felicitation-6.jpg' },
]

/** Real academy photographs. */
export const GALLERY = [
  { src: '/images/gallery/felicitation-1.jpg', caption: 'निवड झालेल्या विद्यार्थ्यांचा सत्कार' },
  { src: '/images/gallery/training-1.jpg', caption: 'मैदानी सराव' },
  { src: '/images/gallery/felicitation-2.jpg', caption: 'यशाचा जल्लोष' },
  { src: '/images/gallery/training-2.jpg', caption: 'ग्राउंड प्रॅक्टिस' },
  { src: '/images/gallery/felicitation-3.jpg', caption: 'सत्कार समारंभ' },
  { src: '/images/gallery/training-3.jpg', caption: 'शारीरिक प्रशिक्षण' },
  { src: '/images/gallery/felicitation-5.jpg', caption: 'अकॅडमी परिवार' },
  { src: '/images/gallery/academy-1.jpg', caption: 'अकॅडमीतील क्षण' },
]

export const PROCESS = [
  { step: 'प्रवेश', detail: 'अर्ज, कागदपत्रे आणि batch निवड.' },
  { step: 'Physical Assessment', detail: 'सुरुवातीची शारीरिक क्षमता चाचणी.' },
  { step: 'Daily Training', detail: 'रोजचा मैदानी व लेखी सराव.' },
  { step: 'Written Test Series', detail: 'नियमित सराव परीक्षा आणि विश्लेषण.' },
  { step: 'Performance Tracking', detail: 'प्रगतीची नोंद व वैयक्तिक सुधारणा.' },
  { step: 'Final Selection Preparation', detail: 'अंतिम भरतीपूर्व तयारी व मार्गदर्शन.' },
]

export const FACILITIES = [
  { title: 'Training Ground', detail: 'प्रशस्त मैदान व ट्रॅक' },
  { title: 'Classroom', detail: 'लेखी परीक्षेसाठी वर्ग' },
  { title: 'Online Exam System', detail: 'Timer व instant result' },
  { title: 'Attendance Tracking', detail: 'दैनंदिन उपस्थिती नोंद' },
  { title: 'Study Material', detail: 'अद्ययावत नोट्स व सराव संच' },
  { title: 'Regular Test Series', detail: 'नियमित सराव परीक्षा' },
  { title: 'Personal Mentoring', detail: 'वैयक्तिक मार्गदर्शन' },
  { title: 'Physical Assessment', detail: 'क्षमता मोजमाप व अहवाल' },
]

/** Placeholder testimonials — replace with real, consented student quotes. */
export const TESTIMONIALS = [
  { name: 'संदीप कदम', force: 'Indian Army', photo: '/images/gallery/felicitation-1.jpg', quote: 'शिवरक्षकमधल्या रोजच्या मैदानी सरावामुळे माझा स्टॅमिना खूप वाढला. शिस्तबद्ध वेळापत्रकामुळेच मी सैन्यात निवड मिळवू शकलो.' },
  { name: 'रोहित जाधव', force: 'Maharashtra Police', photo: '/images/gallery/felicitation-2.jpg', quote: 'दररोजची तयारी, टेस्ट सिरीज आणि सरांचे वैयक्तिक मार्गदर्शन यामुळे पोलीस भरतीत माझी निवड झाली.' },
  { name: 'अमोल शिरसाट', force: 'SRPF', photo: '/images/gallery/felicitation-3.jpg', quote: 'SRPF साठी लागणारे सर्व मैदानी आणि लेखी प्रशिक्षण इथे एकाच ठिकाणी मिळाले. मार्गदर्शन अतिशय स्पष्ट होते.' },
]

export const WORKING_HOURS = [
  { label: 'सकाळची batch', value: 'सकाळी ५:०० — १०:०० वाजता' },
  { label: 'सायंकाळची batch', value: 'सायं. ४:०० — ८:०० वाजता' },
  { label: 'रविवार', value: 'सकाळी ५:०० — ९:०० वाजता' },
]

/** Replace with the academy's exact address and a matching Google Maps embed. */
export const MAP_EMBED =
  'https://www.google.com/maps?q=Balikashram+Road%2C+Opp.+New+Arts+College%2C+Ahmednagar%2C+Maharashtra+414001&output=embed'

/** From the Udyam registration certificate. */
export const ACADEMY_ADDRESS = 'बालिकाश्रम रोड, न्यू आर्ट्स कॉलेजसमोर, अहिल्यानगर (अहमदनगर), महाराष्ट्र ४१४००१'
export const ACADEMY_EMAIL = 'powarraje34@gmail.com'
