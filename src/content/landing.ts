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

/** Headline numbers under the hero. Placeholders — replace with verified figures. */
export const HERO_STATS: Stat[] = [
  { value: '5000+', label: 'प्रशिक्षित विद्यार्थी' },
  { value: '15+', label: 'वर्षांचा अनुभव' },
  { value: '100+', label: 'टेस्ट व सराव' },
  { value: '98%', label: 'यशाचा ध्यास' },
]

/** Second strip, lower on the page. Placeholders — replace with verified figures. */
export const RESULT_STATS: Stat[] = [
  { value: '5000+', label: 'प्रशिक्षित विद्यार्थी' },
  { value: '1200+', label: 'निवड झालेले विद्यार्थी' },
  { value: '15+', label: 'वर्षांचा अनुभव' },
  { value: '100+', label: 'टेस्ट व सराव' },
  { value: '98%', label: 'Selection Rate' },
]

export const DIRECTOR = {
  /**
   * Portrait photograph. Leave as null to show the authored placeholder frame.
   * To use a real photo: save it as /public/images/director/director.jpg and set
   *   photo: '/images/director/director.jpg'
   */
  photo: null as string | null,
  name: 'Ex-Army श्री. [संचालकांचे नाव]',
  role: 'Retired Indian Army | Founder & Director',
  intro:
    'भारतीय सैन्यातील शिस्त, सेवाभाव आणि प्रशिक्षणाचा प्रत्यक्ष अनुभव विद्यार्थ्यांपर्यंत पोहोचवण्याच्या उद्देशाने शिवरक्षक करिअर अकॅडमीची स्थापना करण्यात आली.',
  quote:
    'फक्त परीक्षा पास होणे हे ध्येय नाही; शिस्त, आत्मविश्वास आणि देशसेवेची मानसिकता घडवणे हे आमचे उद्दिष्ट आहे.',
  /** Replace the bracketed placeholders with the director's real service record. */
  facts: [
    { label: 'Former Rank', value: '[रँक]' },
    { label: 'Army Service', value: '[वर्षे] वर्षे' },
    { label: 'Training Experience', value: '[वर्षे] वर्षे' },
    { label: 'Academy', value: 'संस्थापक व संचालक' },
  ],
  badges: ['Ex-Army Experience', 'Discipline Based Training', 'Personal Guidance', 'Physical Excellence'],
}

export const WHY_CHOOSE = [
  { title: 'मैदानी प्रशिक्षण', icon: 'run', points: ['1600m Running', '100m Sprint', 'Long Jump', 'Shot Put', 'Ground Practice'] },
  { title: 'लेखी परीक्षा तयारी', icon: 'book', points: ['Army Bharti', 'Police Bharti', 'SRPF', 'GK', 'मराठी', 'गणित'] },
  { title: 'अनुभवी मार्गदर्शन', icon: 'mentor', points: ['Personal Mentoring', 'Daily Progress', 'Performance Tracking'] },
  { title: 'शिस्त आणि यश', icon: 'target', points: ['Army-style Routine', 'Regular Tests', 'Performance Analysis'] },
] as const

/** Course photographs live in /public. Replace the file or change the path. */
export const COURSES = [
  { slug: 'army', title: 'Army Bharti', image: '/course-army.jpg', description: 'भारतीय सेनेत भरती होण्याचे स्वप्न पूर्ण करण्यासाठी संपूर्ण मैदानी व लेखी तयारी.', features: ['GD / Technical', 'Physical Standards', 'Written Practice'] },
  { slug: 'police', title: 'Police Bharti', image: '/course-police.jpg', description: 'महाराष्ट्र पोलीस भरतीसाठी मैदानी चाचणी, लेखी परीक्षा व मुलाखतीची तयारी.', features: ['मैदानी चाचणी', 'लेखी परीक्षा', 'मुलाखत मार्गदर्शन'] },
  { slug: 'srpf', title: 'SRPF Bharti', image: '/course-srpf.jpg', description: 'SRPF व राज्य राखीव दलासाठी विशेष शारीरिक आणि मानसिक तयारी.', features: ['विशेष मैदानी सराव', 'Stamina Training', 'Test Series'] },
  { slug: 'written', title: 'Written Exam Batch', image: '/course-written.jpg', description: 'गणित, बुद्धिमत्ता, मराठी, इंग्रजी आणि सामान्य ज्ञानाची सखोल तयारी.', features: ['गणित व बुद्धिमत्ता', 'मराठी / इंग्रजी', 'Daily Mock Tests'] },
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
  { name: 'अमोल पाटील', force: 'Indian Army', year: '2023', photo: '/result-1.jpg' },
  { name: 'रोहन शिंदे', force: 'Maharashtra Police', year: '2023', photo: '/result-2.jpg' },
  { name: 'सागर जाधव', force: 'SRPF', year: '2023', photo: '/result-3.jpg' },
  { name: 'प्रतीक खरे', force: 'Indian Army', year: '2024', photo: '/result-4.jpg' },
  { name: 'विकास वाघमारे', force: 'Maharashtra Police', year: '2024', photo: '/result-5.jpg' },
  { name: 'नितीन कदम', force: 'SRPF', year: '2024', photo: '/result-6.jpg' },
]

/** Gallery tiles. Replace `src` with real academy photographs. */
export const GALLERY = [
  { src: '/academy-hero-v2.jpg', caption: 'मैदानी सराव' },
  { src: '/course-army.jpg', caption: 'Army प्रशिक्षण' },
  { src: '/course-police.jpg', caption: 'पोलीस भरती सराव' },
  { src: '/course-srpf.jpg', caption: 'SRPF प्रशिक्षण' },
  { src: '/course-written.jpg', caption: 'लेखी परीक्षा वर्ग' },
  { src: '/course-scenes.png', caption: 'ग्राउंड प्रॅक्टिस' },
  { src: '/selected-students.png', caption: 'निवड झालेले विद्यार्थी' },
  { src: '/result-2.jpg', caption: 'यशस्वी विद्यार्थी' },
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
  { name: 'संदीप कदम', force: 'Indian Army', photo: '/result-1.jpg', quote: 'शिवरक्षकमधल्या रोजच्या मैदानी सरावामुळे माझा स्टॅमिना खूप वाढला. शिस्तबद्ध वेळापत्रकामुळेच मी सैन्यात निवड मिळवू शकलो.' },
  { name: 'रोहित जाधव', force: 'Maharashtra Police', photo: '/result-2.jpg', quote: 'दररोजची तयारी, टेस्ट सिरीज आणि सरांचे वैयक्तिक मार्गदर्शन यामुळे पोलीस भरतीत माझी निवड झाली.' },
  { name: 'अमोल शिरसाट', force: 'SRPF', photo: '/result-3.jpg', quote: 'SRPF साठी लागणारे सर्व मैदानी आणि लेखी प्रशिक्षण इथे एकाच ठिकाणी मिळाले. मार्गदर्शन अतिशय स्पष्ट होते.' },
]

export const WORKING_HOURS = [
  { label: 'सकाळची batch', value: 'सकाळी ५:०० — १०:०० वाजता' },
  { label: 'सायंकाळची batch', value: 'सायं. ४:०० — ८:०० वाजता' },
  { label: 'रविवार', value: 'सकाळी ५:०० — ९:०० वाजता' },
]

/** Replace with the academy's exact address and a matching Google Maps embed. */
export const MAP_EMBED =
  'https://www.google.com/maps?q=Ahmednagar%2C%20Maharashtra&output=embed'
