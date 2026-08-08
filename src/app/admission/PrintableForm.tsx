'use client'

import React, { forwardRef } from 'react'

type FormData = {
  name: string; parent_name: string; address: string
  phone: string; parent_phone: string; aadhaar_no: string
  guarantee_letter_no: string; dob: string; gender: string
  course: string; admission_date: string; duration: string
  age: string; height: string; weight: string; chest: string
  total_fee: string
}

type DocFile = { file: File; preview: string }
type DocsState = { [key: string]: DocFile | null }

interface PrintableFormProps {
  form: FormData
  docs: DocsState
  rollNumber: string
}

const COURSE_LABELS: Record<string, string> = {
  police: 'पोलीस भरती', navy: 'नेव्ही भरती', mpsc: 'एम.पी.एस.सी',
  staff_selection: 'स्टॉफ सिलेक्शन', saral_seva: 'सरळ सेवा',
  army: 'आर्मी भरती', railway: 'रेल्वे भरती', other: 'इतर',
}

const RULES = [
  'प्रशिक्षण दरम्यान मला कोणत्याही प्रकारची इजा झाल्यास मी स्वतः त्याला जबाबदार राहील.',
  'होस्टेल मध्ये कोणत्याही मौल्यवान वस्तु आनण्यास मनाई आहे. चोरी गेल्यास अॅकेडमी त्याला जबाबदार राहणार नाही याची सर्वांनी नोंद घ्यावी.',
  'अॅकेडमीमध्ये मुलींची छेड किंवा भांडण तंटे केल्यास अॅकेडमी जबाबदार राहणार नाही.',
  'अॅकेडमीतून कामा निमित्त किंवा गावी जायचे असेल तर अर्ज किंवा गेट पास घेऊन जाणे बंधन कारक आहे.',
  'अर्ज किंवा गेट पास न घेता गेला/गेली तर काय हनी झाल्यास मी स्वतः त्याला जबाबदार राहील.',
  'मुला मुलींनी कोणत्याही प्रकारचे गैर कृत्य केल्यास किंवा कोणताही अनुचित प्रकार केल्यास त्यास अॅकेडमी जबाबदार राहणार नाही.',
  'अॅकेडमी मध्ये विद्यार्थ्यांनी गैर वर्तन केल्यास शिक्षेस पात्र राहिल.',
]

const AcademyHeader = () => (
  <div style={{ borderBottom: '2px solid #333', paddingBottom: 10, marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontSize: 10, color: '#333', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 800 }}>शिवमुद्रा व रक्षक ऑकेडमी संचलित</div>
        <div style={{ fontSize: 9.5, color: '#555' }}>महाराष्ट्रात सर्वाधिक पोलिस व आर्मी सैनिक घडविणारी एकमेव संस्था</div>
      </div>
      <div style={{ textAlign: 'center', flex: 1, margin: '0 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#7c2d12', fontFamily: 'Georgia, serif' }}>शिवरक्षक करियर ऑकेडमी</div>
        <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>ARMY / POLICE / NAVY RECRUITMENT TRAINING</div>
      </div>
      <div style={{ fontSize: 10, color: '#333', lineHeight: 1.8, textAlign: 'right' }}>
        <div style={{ fontWeight: 700 }}>शिवमुद्रा :– रजि नं. ५२७/ए</div>
        <div>रक्षक :– रजि नं. ०००००१३२०२४</div>
        <div>न्यू आर्टस् कॉलेजच्या पाठीमागे,</div>
        <div>गौरव स्पोट्स जवळ, बालिकाश्रम रोड, अ.नगर</div>
        <div style={{ fontWeight: 700 }}>9284842177 | 9011887714</div>
        <div style={{ fontSize: 9 }}>★ संचालक – मेजर महाडिक सर ★ संचालक – मेजर पवार सर ★</div>
      </div>
    </div>
  </div>
)

const FieldLine = ({ label, value, width }: { label: string; value?: string; width?: number }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14, width: width ? `${width}%` : '100%' }}>
    <span style={{ fontSize: 11.5, whiteSpace: 'nowrap', minWidth: 170, fontWeight: 500, color: '#222' }}>{label} :</span>
    <div style={{ flex: 1, borderBottom: '1px solid #444', minHeight: 22, paddingBottom: 2 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#000' }}>{value || ''}</span>
    </div>
  </div>
)

const AdmissionCodeBox = ({ rollNumber, size = 'normal' }: { rollNumber: string; size?: 'normal' | 'small' }) => (
  <div style={{
    border: '2px solid #7c2d12', borderRadius: 8, padding: size === 'small' ? '5px 12px' : '8px 16px',
    background: '#fffbeb', textAlign: 'center', display: 'inline-block',
  }}>
    <div style={{ fontSize: 9, color: '#78350f', fontWeight: 700, letterSpacing: 0.5 }}>प्रवेश अर्ज क्रमांक</div>
    <div style={{
      fontSize: size === 'small' ? 18 : 24, fontWeight: 900, color: '#7c2d12',
      fontFamily: 'Courier New, monospace', letterSpacing: 3,
    }}>{rollNumber}</div>
    <div style={{ fontSize: 8.5, color: '#92400e' }}>★ हा क्रमांक लक्षात ठेवा ★</div>
  </div>
)

const PrintableForm = forwardRef<HTMLDivElement, PrintableFormProps>(({ form, docs, rollNumber }, ref) => {
  const pageStyle: React.CSSProperties = {
    width: 794,
    minHeight: 1123,
    background: '#ffffff',
    padding: '32px 40px',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', 'Noto Sans', Arial, sans-serif",
    fontSize: 13,
    color: '#000',
    borderBottom: '3px solid #7c2d12',
  }

  const photo = docs.photo?.preview && docs.photo.preview !== 'pdf' ? docs.photo.preview : null
  const signature = docs.signature?.preview && docs.signature.preview !== 'pdf' ? docs.signature.preview : null

  return (
    <div ref={ref} className="print-root" style={{ position: 'fixed', left: -9999, top: 0, zIndex: -1, width: 794 }}>

      {/* ══════════════════════════════════════════
          PAGE 1 — प्रवेश अर्ज
      ══════════════════════════════════════════ */}
      <div className="pdf-page" style={pageStyle}>
        <AcademyHeader />

        {/* Title + Admission Code + Photo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: '#7c2d12', marginBottom: 10 }}>★ प्रवेश अर्ज ★</div>
            <AdmissionCodeBox rollNumber={rollNumber} />
          </div>

          {/* Passport photo box */}
          <div style={{
            width: 100, height: 120, border: '2px solid #333', borderRadius: 4,
            overflow: 'hidden', background: '#f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {photo
              ? <img src={photo} alt="Passport Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ fontSize: 10, color: '#999', textAlign: 'center', padding: 4 }}>पासपोर्ट<br />फोटो</div>
            }
          </div>
        </div>

        <FieldLine label="विद्यार्थ्याचे पूर्ण नाव" value={form.name} />
        <FieldLine label="वडिलांचे / पालकाचे नाव" value={form.parent_name} />

        {/* DOB + Age in one row */}
        <div style={{ display: 'flex', gap: 24 }}>
          <FieldLine label="जन्म तारीख" value={form.dob} width={55} />
          <FieldLine label="वय" value={form.age ? `${form.age} वर्षे` : ''} width={45} />
        </div>

        <FieldLine label="पत्ता" value={form.address} />

        {/* Phones in one row */}
        <div style={{ display: 'flex', gap: 24 }}>
          <FieldLine label="विद्यार्थ्याचा मोबाईल नं" value={form.phone} width={50} />
          <FieldLine label="पालकाचा मोबाईल नं" value={form.parent_phone} width={50} />
        </div>

        <FieldLine label="आधार कार्ड नं" value={form.aadhaar_no} />
        {form.guarantee_letter_no && (
          <FieldLine label="गॅरेंटी लेटर / इतर नं" value={form.guarantee_letter_no} />
        )}

        {/* Physical measurements */}
        <div style={{ display: 'flex', gap: 24 }}>
          <FieldLine label="उंची (cm)" value={form.height} width={33} />
          <FieldLine label="वजन (kg)" value={form.weight} width={33} />
          <FieldLine label="छाती (cm)" value={form.chest} width={34} />
        </div>

        {/* Course box */}
        <div style={{ border: '1.5px solid #7c2d12', borderRadius: 8, padding: '10px 16px', marginBottom: 18, background: '#fffbeb' }}>
          <div style={{ fontSize: 10, color: '#78350f', fontWeight: 600, marginBottom: 3 }}>निवडलेला कोर्स</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#7c2d12' }}>
            {COURSE_LABELS[form.course] || form.course || '—'}
          </div>
          <div style={{ fontSize: 10.5, color: '#555', marginTop: 4 }}>
            लिंग: <strong>{form.gender === 'male' ? 'पुरुष (मुलगा)' : 'महिला (मुलगी)'}</strong>
            {form.admission_date && <>&nbsp;&nbsp;|&nbsp;&nbsp; प्रवेश तारीख: <strong>{form.admission_date}</strong></>}
            {form.duration && <>&nbsp;&nbsp;|&nbsp;&nbsp; कालावधी: <strong>{form.duration}</strong></>}
          </div>
        </div>

        {/* Signature area — 3 lines */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            {/* Student signature — actual image if uploaded */}
            <div style={{ textAlign: 'center', width: 200 }}>
              {signature
                ? <img src={signature} alt="Signature" style={{ height: 45, maxWidth: 190, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
                : <div style={{ height: 45, borderBottom: '1px solid #555' }} />
              }
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>विद्यार्थ्याची सही</div>
            </div>

            {/* Parent signature */}
            <div style={{ textAlign: 'center', width: 200 }}>
              <div style={{ height: 45, borderBottom: '1px solid #555' }} />
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>पालकाची सही</div>
            </div>

            {/* Academy seal */}
            <div style={{ textAlign: 'center', width: 200 }}>
              <div style={{ height: 45, borderBottom: '1px solid #555' }} />
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>शिवरक्षक करियर ऑकेडमी</div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PAGE 2 — संमतीपत्र
      ══════════════════════════════════════════ */}
      <div className="pdf-page" style={{ ...pageStyle, marginTop: 20 }}>
        <AcademyHeader />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: '#7c2d12' }}>★ पालक / विद्यार्थी / विद्यार्थीनी संमतीपत्र ★</div>
          <AdmissionCodeBox rollNumber={rollNumber} size="small" />
        </div>

        <FieldLine label="मी" value={form.name} />
        <FieldLine label="पत्ता" value={form.address} />
        <FieldLine label="मोबाईल (पालकाचा व विद्यार्थ्याचा)" value={`${form.parent_phone} / ${form.phone}`} />
        <FieldLine label="प्रवेश घेतलेला कोर्स" value={COURSE_LABELS[form.course] || form.course} />

        <p style={{ fontSize: 12, lineHeight: 1.9, color: '#333', margin: '16px 0', textAlign: 'justify' }}>
          खालील सर्व अटी नियम मी स्वतः माझ्या पालकाला वाचुन सांगितल्या असून या सर्व अटी नियम मला व माझ्या पालकांना मंजुर आहेत. मी त्यांचे पालन करीन.
        </p>

        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: '#7c2d12' }}>अटी व नियम :</div>
        {RULES.map((rule, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11.5, lineHeight: 1.8 }}>
            <span style={{ fontWeight: 800, minWidth: 20, color: '#7c2d12' }}>{i + 1})</span>
            <span style={{ color: '#333' }}>{rule}</span>
          </div>
        ))}

        {/* Oval niyam box */}
        <div style={{
          border: '2px solid #7c2d12', borderRadius: 50, padding: '10px 24px',
          textAlign: 'center', margin: '20px auto 10px', maxWidth: 220,
          fontSize: 13, fontWeight: 800, color: '#7c2d12',
        }}>
          नियम व अटी
        </div>

        <p style={{ fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.8 }}>
          विद्यार्थ्याने कसलेही गैरवर्तन, बेशिस्तपणा केल्यास शिक्षेस पात्र राहील.<br />
          मला व माझ्या पाल्यास सर्व अटी मंजुर असून त्यांचे पालन केले जाईल. ✅
        </p>

        {/* Signatures */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
          {['विद्यार्थ्याची सही', 'पालकाची सही', 'शिवरक्षक करियर ऑकेडमी'].map(lbl => (
            <div key={lbl} style={{ textAlign: 'center', width: 200 }}>
              <div style={{ height: 45, borderBottom: '1px solid #555' }} />
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PAGE 3 — फी पावती
      ══════════════════════════════════════════ */}
      <div className="pdf-page" style={{ ...pageStyle, marginTop: 20 }}>
        {/* Fee page header — slightly different */}
        <div style={{ borderBottom: '2px solid #333', paddingBottom: 10, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 11 }}>शिवमुद्रा व रक्षक संचलित....</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#7c2d12', fontFamily: 'Georgia, serif', margin: '4px 0' }}>शिवरक्षक करिअर अकेंडमी</div>
          <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>बालिकाश्रम रोड न्यू आर्टस्कॉलेज गेट नंबर 5 गौरव स्पोट्स जवळ</div>
          <div style={{ fontSize: 11 }}>
            संचालक:- मेजर महाडिक सर &nbsp;&nbsp; मो:- 9284842177 &nbsp;&nbsp;&nbsp;
            संचालक:- मेजर पवार सर &nbsp;&nbsp; मो:- 9011887714
          </div>
        </div>

        {/* Fee title + Code */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#7c2d12' }}>मेन फी पावती / क्लासेस फी पावती</div>
          <AdmissionCodeBox rollNumber={rollNumber} size="small" />
        </div>

        <FieldLine label="विद्याथ्याचे नाव :-" value={form.name} />
        <FieldLine label="पत्ता" value={form.address} />
        <FieldLine label="विद्याथ्याचा मो नंबर:-" value={form.phone} />
        <FieldLine label="कालावधी :-" value={form.duration} />

        {/* Fee box */}
        <div style={{ border: '2px solid #7c2d12', borderRadius: 10, padding: '16px 20px', margin: '16px 0', background: '#fffbeb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#78350f', fontWeight: 600, marginBottom: 4 }}>एकूण रुपये (Total Fee)</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a' }}>
                {form.total_fee ? `₹ ${Number(form.total_fee).toLocaleString('en-IN')}` : '₹ —'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#78350f', fontWeight: 600 }}>पैसे भरलेली तारीख</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>
                {form.admission_date || new Date().toLocaleDateString('mr-IN')}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: 8, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#92400e', marginBottom: 10 }}>
          ( टीप:- एकदा भरलेली फी वापस मिळणार नाही )
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 16px', fontSize: 11.5, color: '#166534', marginBottom: 8 }}>
          <strong>कोर्स:</strong> {COURSE_LABELS[form.course] || form.course} &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>लिंग:</strong> {form.gender === 'male' ? 'पुरुष' : 'महिला'}
        </div>

        {/* Signatures */}
        <div style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', width: 240 }}>
            <div style={{ height: 55, borderBottom: '1px solid #555' }} />
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>पैसे भरणाऱ्या ची सही</div>
          </div>
          <div style={{ textAlign: 'center', width: 240 }}>
            <div style={{ height: 55, borderBottom: '1px solid #555' }} />
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>शिवरक्षक करियर अकेंडमी</div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 40, textAlign: 'center', fontSize: 10.5, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          ★ Hi copy kavdhi hi sajir theva | शिवरक्षक करियर अकॅडमी — अहमदनगर | Ph: 9284842177 ★
        </div>
      </div>

    </div>
  )
})

PrintableForm.displayName = 'PrintableForm'

export default PrintableForm
