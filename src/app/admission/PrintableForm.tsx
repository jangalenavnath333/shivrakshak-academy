'use client'
import { forwardRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   शिवरक्षक करिअर अकॅडमी — 3 Page Printable Form
   Page 1: प्रवेश अर्ज
   Page 2: पालक / विद्यार्थी / विद्यार्थीनी संमतीपत्र
   Page 3: मेन फी पावती / क्लासेस फी पावती
   ═══════════════════════════════════════════════════════════ */

export type FormValues = {
  firstName: string; middleName: string; lastName: string
  fatherFirst: string; fatherMiddle: string; fatherLast: string
  address: string; village: string; taluka: string; district: string; pincode: string
  studentPhone: string; studentWhatsapp: string
  parentPhone: string; parentWhatsapp: string
  email: string
  aadhaar: string; guaranteeNo: string
  dob: string; age: string
  gender: string
  courses: string[]
  admissionDate: string; durationMonths: string; endDate: string; totalDays: string
  height: string; weight: string; chest: string
  totalFee: string; paidAmount: string; paymentDate: string; paymentMode: string
}

type Props = {
  form: FormValues
  photo?: string | null
  rollNumber: string
}

const PAGE: React.CSSProperties = {
  width: 794,
  minHeight: 1123,
  background: '#fff',
  color: '#000',
  padding: '30px 42px 26px',
  fontFamily: "'Nirmala UI', 'Noto Sans Devanagari', 'Mangal', sans-serif",
  boxSizing: 'border-box',
  position: 'relative',
}

const fmtDate = (d?: string) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`
}

/* ── Filled value on a ruled line ── */
function Line({ label, value, w = 'auto', labelW }: { label?: string; value?: string; w?: number | string; labelW?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 13, width: w }}>
      {label && <span style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', width: labelW, flexShrink: 0 }}>{label}</span>}
      <span style={{ flex: 1, borderBottom: '1.4px solid #000', minHeight: 21, fontSize: 15, fontWeight: 600, paddingLeft: 6, paddingBottom: 1, lineHeight: '20px' }}>
        {value || ' '}
      </span>
    </div>
  )
}

function Box({ label, value, boxW = 118 }: { label: string; value?: string; boxW?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
      <div style={{ border: '1.6px solid #000', width: boxW, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700 }}>
        {value || ''}
      </div>
    </div>
  )
}

function Check({ label, on }: { label: string; on: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 118 }}>{label}</span>
      <div style={{ border: '1.6px solid #000', width: 40, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, lineHeight: 1 }}>
        {on ? '✔' : ''}
      </div>
    </div>
  )
}

/* ── Letterhead (Page 1 & 2) ── */
function Header({ serial }: { serial: string }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>शिवमुद्रा व रक्षक अ‍ॅकॅडमी संचलित</div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 3 }}>
            <Emblem type="wings" /><Emblem type="star" /><Emblem type="shield" />
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, marginBottom: 3 }}>महाराष्ट्रात सर्वाधिक पोलिस व आर्मी सैनिक घडविणारी एकमेव संस्था</div>
          <div style={{ fontSize: 29, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>शिवरक्षक करियर अ‍ॅकॅडमी</div>
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.55, textAlign: 'right', paddingTop: 2 }}>
          <div style={{ fontWeight: 800 }}>शिवमुद्रा :- रजि नं. ५२७/ए</div>
          <div style={{ fontWeight: 800, marginBottom: 3 }}>रक्षक :- रजि नं. ००००० १३२०२४</div>
          <div>न्यू आर्टस् कॉलेजच्या पाठीमागे,</div>
          <div style={{ marginBottom: 4 }}>गौरव स्पोर्ट्स जवळ, बालिकाश्रम रोड, अ.नगर</div>
          <div style={{ border: '1.6px solid #000', padding: '4px 9px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>9284842177 | 9011887714</div>
            <div style={{ fontSize: 8.5, fontWeight: 700 }}>★ संचालक – मेजर महाडिक सर ★ संचालक – मेजर पवार सर</div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '2.4px solid #000', margin: '9px 0 0' }} />
      <div style={{ position: 'absolute', left: 46, top: 172, fontSize: 21, fontWeight: 900, color: '#c00' }}>{serial}</div>
    </>
  )
}

function Emblem({ type }: { type: 'wings' | 'star' | 'shield' }) {
  const s = type === 'star' ? 34 : 27
  return (
    <svg width={s} height={s} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="19" fill="#1a1a1a" />
      {type === 'wings' && <>
        <path d="M6 22 Q20 13 34 22 L34 25 Q20 17 6 25 Z" fill="#fff" />
        <circle cx="20" cy="19" r="3" fill="#fff" />
      </>}
      {type === 'star' && <>
        <path d="M20 7 L23 16 L32 16 L25 21.5 L27.5 30 L20 25 L12.5 30 L15 21.5 L8 16 L17 16 Z" fill="#fff" />
      </>}
      {type === 'shield' && <>
        <path d="M20 8 L30 12 V21 Q30 29 20 33 Q10 29 10 21 V12 Z" fill="#fff" />
        <path d="M20 13 L21.8 18 L27 18 L22.8 21 L24.4 26 L20 23 L15.6 26 L17.2 21 L13 18 L18.2 18 Z" fill="#1a1a1a" />
      </>}
    </svg>
  )
}

function Signatures({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 4 }}>
      {items.map(s => (
        <div key={s} style={{ fontSize: 14, fontWeight: 800, textAlign: 'center' }}>
          <div style={{ borderTop: '1.4px solid #000', width: 152, marginBottom: 5 }} />
          {s}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */

const PrintableForm = forwardRef<HTMLDivElement, Props>(function PrintableForm({ form, photo, rollNumber }, ref) {
  const f = form
  const studentName = [f.firstName, f.middleName, f.lastName].filter(Boolean).join(' ')
  const fatherName = [f.fatherFirst, f.fatherMiddle, f.fatherLast].filter(Boolean).join(' ')
  const fullAddress = [f.address, f.village, f.taluka && `ता. ${f.taluka}`, f.district && `जि. ${f.district}`, f.pincode]
    .filter(Boolean).join(', ')

  const COURSE_ROWS: [string, string][][] = [
    [['पोलीस', 'police'], ['नेव्ही', 'navy'], ['एम.पी.एस.सी', 'mpsc']],
    [['स्टॉफ सिलेक्शन', 'staff'], ['सरळ सेवा', 'saral'], ['इतर', 'other']],
    [['आर्मी', 'army'], ['रेल्वे', 'railway'], ['', '']],
  ]

  return (
    <div ref={ref} className="print-root" style={{ position: 'fixed', left: -99999, top: 0, zIndex: -1, width: 794, background: '#fff' }}>

      {/* ════════ PAGE 1 — प्रवेश अर्ज ════════ */}
      <div className="pdf-page" style={PAGE}>
        <Header serial={rollNumber} />

        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, margin: '16px 0 16px' }}>★ प्रवेश अर्ज ★</div>

        {/* Photo box */}
        <div style={{ position: 'absolute', right: 44, top: 208, width: 118, height: 148, border: '1.8px solid #000', overflow: 'hidden', background: '#fff' }}>
          {photo
            ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ fontSize: 10, textAlign: 'center', paddingTop: 62, color: '#666' }}>फोटो</div>}
        </div>

        <div style={{ paddingRight: 140 }}>
          <Line label="विद्यार्थ्याचे नाव :" value={studentName} labelW={150} />
          <Line value={fullAddress ? `(${f.gender === 'female' ? 'कु.' : 'श्री.'}) ${studentName}` : ''} />
          <Line label="विद्यार्थ्याचा रोल नंबर :" value={rollNumber} labelW={180} />
        </div>

        <Line label="पालकाचे नाव :" value={fatherName} labelW={130} />
        <Line label="पत्ता :" value={fullAddress} labelW={62} />

        <div style={{ display: 'flex', gap: 22 }}>
          <Line label="फोन :" value={f.studentPhone} labelW={56} w="46%" />
          <Line label="पालकाचा मो." value={f.parentPhone} labelW={110} w="54%" />
        </div>

        <div style={{ display: 'flex', gap: 22 }}>
          <Line label="आधार कार्ड नं." value={f.aadhaar} labelW={118} w="52%" />
          <Line label="हमीपत्र नं :" value={f.guaranteeNo} labelW={92} w="48%" />
        </div>

        <div style={{ display: 'flex', gap: 22 }}>
          <Line label="जन्म तारिख :" value={fmtDate(f.dob)} labelW={112} w="52%" />
          <Line label="ई-मेल :" value={f.email} labelW={64} w="48%" />
        </div>

        {/* Courses */}
        <div style={{ display: 'flex', gap: 14, marginTop: 4, marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, paddingTop: 3 }}>कोर्स :</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
            {COURSE_ROWS.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 26 }}>
                {row.map(([label, key], ci) =>
                  label
                    ? <Check key={key} label={label} on={f.courses.includes(key)} />
                    : <div key={`sp${ci}`} style={{ minWidth: 167 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 22 }}>
          <Line label="प्रवेश घेण्याची तारीख :" value={fmtDate(f.admissionDate)} labelW={180} w="52%" />
          <Line label="प्रवेश कालावधी :" value={f.durationMonths ? `${f.durationMonths} महिने` : ''} labelW={135} w="48%" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 16 }}>
          <Box label="वय" value={f.age ? `${f.age} वर्षे` : ''} boxW={104} />
          <Box label="उंची" value={f.height ? `${f.height} सेमी` : ''} boxW={104} />
          <Box label="वजन" value={f.weight ? `${f.weight} किलो` : ''} boxW={104} />
          <Box label="छाती" value={f.chest ? `${f.chest} सेमी` : ''} boxW={104} />
        </div>

        {/* Terms */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ display: 'inline-block', border: '1.8px solid #000', borderRadius: 26, padding: '4px 26px', fontSize: 16, fontWeight: 900, marginBottom: 12 }}>
            नियम व अटी
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.75 }}>
            विद्यार्थ्याने कसलेही गैरवर्तन, बेशिस्तपणा केल्यास शिक्षेस पात्र राहिल.<br />
            मला व माझ्या पाल्यास सर्व अटी मंजुर असून त्यांचे पालन केले जाईल.
          </div>
        </div>

        <Signatures items={['विद्यार्थ्याची सही', 'पालकाची सही', 'शिवरक्षक करियर अ‍ॅकॅडमी']} />
      </div>

      {/* ════════ PAGE 2 — संमतीपत्र ════════ */}
      <div className="pdf-page" style={PAGE}>
        <Header serial={rollNumber} />

        <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 900, margin: '16px 0 18px' }}>
          ★ पालक / विद्यार्थी / विद्यार्थीनी संमतीपत्र ★
        </div>

        <Line label="मी" value={`${f.gender === 'female' ? 'कु.' : 'श्री.'} ${studentName}`} labelW={34} />
        <Line label="पत्ता :" value={fullAddress} labelW={62} />
        <Line label="प्रवेश अर्ज क्रमांक :" value={rollNumber} labelW={162} />
        <Line label="मोबाईल नंबर : पालकाचा व विद्यार्थ्याचा :" value={`${f.parentPhone || '—'}  /  ${f.studentPhone || '—'}`} labelW={310} />

        <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.95, margin: '12px 0 10px' }}>
          खालील सर्व अटी नियम मी स्वता माझ्या पालकाला वाचून सांगितल्या असून या सर्व अटी नियम मला व माझ्या पालकांना मंजुर आहेत. मी त्यांचे पालन करील.
        </div>

        <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 8 }}>अटी व नियम :</div>

        <ol style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.85, paddingLeft: 26, margin: 0 }}>
          <li style={{ marginBottom: 7 }}>प्रशिक्षण दरम्यान मला कोणत्याही प्रकारची इजा झाल्यास मी स्वतः त्याला जबाबदार राहील.</li>
          <li style={{ marginBottom: 7 }}>होस्टेल मध्ये कोणत्याही मौल्यावान वस्तु आणण्यास मनाई आहे. चोरी गेल्यास अ‍ॅकॅडमी त्याला जबाबदार राहणार नाही याची सर्वांनी नोंद घ्यावी.</li>
          <li style={{ marginBottom: 7 }}>अ‍ॅकॅडमीमध्ये मुलींची छेड किंवा भांडण तंटे केल्यास अ‍ॅकॅडमी जबाबदार राहणार नाही.</li>
          <li style={{ marginBottom: 7 }}>अ‍ॅकॅडमीतून कामा निमित्त किंवा गावी जायचे असेल तर अर्ज किंवा गेट पास घेऊन जाणे बंधन कारक आहे.</li>
          <li style={{ marginBottom: 7 }}>अर्ज किंवा गेट पास न घेता गेला / गेली तर काय हनी झाल्यास मी स्वंता त्याला जबाबदार राहील.</li>
          <li style={{ marginBottom: 7 }}>मुला मुलींनी कोणत्याही प्रकारचे गैर कृत्य केल्यास किंवा कोणताही अनुचित प्रकार केल्यास त्यास अ‍ॅकॅडमी जबाबदार राहणार नाही.</li>
          <li style={{ marginBottom: 7 }}>अ‍ॅकॅडमी मध्ये विद्यार्थ्यांनी गैर वर्तन केल्यास शिक्षेस पात्र राहिल.</li>
        </ol>

        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <div style={{ display: 'inline-block', border: '1.8px solid #000', borderRadius: 26, padding: '4px 26px', fontSize: 16, fontWeight: 900, marginBottom: 11 }}>
            नियम व अटी
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>
            मला व माझ्या पाल्यास सर्व अटी मंजुर असून त्यांचे पालन केले जाईल.
          </div>
        </div>

        <Signatures items={['विद्यार्थ्याची सही', 'पालकाची सही', 'शिवरक्षक करियर अ‍ॅकॅडमी']} />
      </div>

      {/* ════════ PAGE 3 — फी पावती ════════ */}
      <div className="pdf-page" style={PAGE}>
        <div style={{ border: '2.2px solid #000', minHeight: 1050, padding: '22px 30px 20px', display: 'flex', flexDirection: 'column' }}>

          <div style={{ fontSize: 13, fontWeight: 700 }}>शिवमुद्रा व रक्षक संचलित.....</div>
          <div style={{ fontSize: 30, fontWeight: 900, textAlign: 'center', margin: '8px 0 10px' }}>शिवरक्षक करिअर अ‍ॅकॅडमी</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#c00', textAlign: 'center', marginBottom: 12 }}>
            बालिकाश्रम रोड न्यू आर्टस्कॉलेज गेट नंबर 5 गौरव स्पोर्ट्स जवळ
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700, lineHeight: 1.75 }}>
            <div>
              <div>संचालक:-संभाजी महाडिक {'{ मेजर }'}</div>
              <div>मो, नंबर:- 9284842177</div>
            </div>
            <div>
              <div>संचालक :-राजे पवार {'{ मेजर }'}</div>
              <div>मो,नंबर :-9011887714</div>
            </div>
          </div>

          <div style={{ borderTop: '2.2px solid #000', margin: '12px -30px 0' }} />

          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, margin: '16px 0 24px' }}>मेन फी पावती / क्लासेस फी पावती</div>

          <div style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 2.6 }}>
            <DotLine label="विद्यार्थ्यांचे नाव :-" value={studentName} />
            <DotLine label="पत्ता" value={fullAddress} />
            <DotLine label="विद्याथ्यांचा मो नंबर:-" value={f.studentPhone} />
            <DotLine label="कालावधी :-" value={f.durationMonths ? `${f.durationMonths} महिने  (${fmtDate(f.admissionDate)} ते ${fmtDate(f.endDate)})` : ''} />
            <DotLine label="एकूण रुपये:-" value={f.totalFee ? `₹ ${Number(f.totalFee).toLocaleString('en-IN')} /-` : ''} />
            <DotLine label="पैसे भरलेली तारीख :-" value={fmtDate(f.paymentDate || f.admissionDate)} />
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0 0' }}>
            <span style={{ background: '#ffec3d', padding: '4px 14px', fontSize: 16.5, fontWeight: 800 }}>
              ( टीप :- एकदा भरलेली फी वापस मिळणार नाही )
            </span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, textAlign: 'center' }}>
              <div style={{ borderTop: '1.4px solid #000', width: 168, marginBottom: 5 }} />
              पैसे भरणाऱ्या ची सही
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, textAlign: 'center' }}>
              <div style={{ borderTop: '1.4px solid #000', width: 190, marginBottom: 5 }} />
              शिवरक्षक करियर अ‍ॅकॅडमी
            </div>
          </div>

          <div style={{ borderTop: '2.2px solid #000', margin: '0 -30px 10px' }} />
          <div style={{ fontSize: 12, fontWeight: 700 }}>pg. 1</div>
        </div>
      </div>

    </div>
  )
})

function DotLine({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, marginBottom: 6 }}>
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{
        flex: 1, borderBottom: '2.4px dotted #000', minHeight: 24,
        fontSize: 15.5, fontWeight: 700, paddingLeft: 6, lineHeight: '22px',
      }}>
        {value || ' '}
      </span>
    </div>
  )
}

export default PrintableForm

