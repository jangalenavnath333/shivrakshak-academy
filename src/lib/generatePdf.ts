// PDF Generator for Shivrakshak Academy Admission Form
// Uses jspdf — no external server needed

import jsPDF from 'jspdf'

export interface StudentPdfData {
  // Personal Info
  fullName: string
  dob: string
  age: string
  birthPlace: string
  religion: string
  caste: string
  subCaste: string
  maritalStatus: string
  bloodGroup: string
  aadharNo: string
  panNo: string

  // Address
  address: string
  taluka: string
  district: string
  pincode: string
  state: string

  // Contact
  mobile: string
  parentMobile: string
  email: string

  // Education
  tenthYear: string
  tenthPercent: string
  tenthBoard: string
  twelfthYear: string
  twelfthPercent: string
  twelfthBoard: string
  graduationYear: string
  graduationPercent: string
  graduationDegree: string

  // Physical
  height: string
  weight: string
  chest: string
  chestExpanded: string

  // Course
  course: string
  gender: string
  fatherName: string
  motherName: string
  photo?: string // base64

  // Fee
  totalFee: string
  paidAmount: string
  pendingAmount: string
  paymentMode: string
  paymentDate: string
  rollNumber: string

  // Mess
  messMonths: string
  messAmount: string
}

function addLine(doc: jsPDF, label: string, value: string, x: number, y: number, labelWidth = 50) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(label + ':', x, y)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(value || '—', x + labelWidth, y)

  doc.setDrawColor(180, 180, 180)
  doc.line(x + labelWidth, y + 1, x + labelWidth + 80, y + 1)
}

function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(124, 45, 18) // maroon
  doc.rect(10, y - 5, 190, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(title, 14, y)
  doc.setTextColor(0, 0, 0)
  return y + 8
}

export async function generateAdmissionPdf(data: StudentPdfData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageW = 210
  let y = 15

  // ─── PAGE 1: ADMISSION FORM ─────────────────────────────────────────────

  // Header border
  doc.setDrawColor(124, 45, 18)
  doc.setLineWidth(0.8)
  doc.rect(8, 8, 194, 280)

  // Academy header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(80, 80, 80)
  doc.text('शिवमुद्रा रजि. नं. ५२७/ए', 12, y)
  doc.text('रक्षक रजि. नं. ०००००१३२०२४', pageW - 12, y, { align: 'right' })
  y += 5

  // Academy name
  doc.setFontSize(16)
  doc.setTextColor(124, 45, 18)
  doc.setFont('helvetica', 'bold')
  doc.text('SHIVRAKSHAK CAREER ACADEMY', pageW / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(10)
  doc.text('(ARMY / POLICE / NAVY RECRUITMENT TRAINING)', pageW / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(7)
  doc.setTextColor(60, 60, 60)
  doc.text('New Arts College Maghe, Gaurav Sports Javal, Balikashram Road, Ahmednagar', pageW / 2, y, { align: 'center' })
  y += 4
  doc.text('📞 9284842177 | 9011887714', pageW / 2, y, { align: 'center' })
  y += 5

  // Form title
  doc.setFillColor(124, 45, 18)
  doc.rect(8, y - 4, 194, 8, 'F')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('PRAVESH ARJ / ADMISSION FORM', pageW / 2, y + 1, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 12

  // Roll number + photo box
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(124, 45, 18)
  doc.text('Roll No.: ' + (data.rollNumber || '___________'), 12, y)
  // Photo box
  doc.setDrawColor(124, 45, 18)
  doc.setLineWidth(0.5)
  doc.rect(160, y - 4, 32, 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text('PHOTO', 176, y + 15, { align: 'center' })
  y += 8

  // Personal Info
  y = addSection(doc, 'VYAKTIGAT MAHITI / PERSONAL INFORMATION', y)
  y += 4

  addLine(doc, 'Purna Nav / Full Name', data.fullName, 12, y)
  y += 7
  addLine(doc, "WaDil'cha Nav / Father's Name", data.fatherName, 12, y)
  y += 7
  addLine(doc, "Aai'cha Nav / Mother's Name", data.motherName, 12, y)
  y += 7

  // Two columns
  addLine(doc, 'Janam Tarikh / DOB', data.dob, 12, y, 40)
  addLine(doc, 'Vay / Age', data.age, 110, y, 20)
  y += 7
  addLine(doc, 'Janam Sthan / Birth Place', data.birthPlace, 12, y, 40)
  addLine(doc, 'Rakta Gat / Blood Group', data.bloodGroup, 110, y, 30)
  y += 7
  addLine(doc, 'Dharma / Religion', data.religion, 12, y, 40)
  addLine(doc, 'Jat / Caste', data.caste, 110, y, 20)
  y += 7
  addLine(doc, 'Vivahit / Marital Status', data.maritalStatus, 12, y, 40)
  addLine(doc, 'Aadhar No', data.aadharNo, 110, y, 25)
  y += 10

  // Address
  y = addSection(doc, 'PATTA / ADDRESS', y)
  y += 4

  addLine(doc, 'Purn Patta / Full Address', data.address, 12, y)
  y += 7
  addLine(doc, 'Taluka', data.taluka, 12, y, 30)
  addLine(doc, 'Jilha / District', data.district, 80, y, 30)
  addLine(doc, 'Pin', data.pincode, 155, y, 15)
  y += 7
  addLine(doc, 'Rajya / State', data.state, 12, y, 30)
  y += 10

  // Contact
  y = addSection(doc, 'SAMPARK / CONTACT', y)
  y += 4

  addLine(doc, 'Mobile', data.mobile, 12, y, 30)
  addLine(doc, 'Palak Mobile', data.parentMobile, 110, y, 30)
  y += 7
  addLine(doc, 'Email', data.email, 12, y)
  y += 10

  // Education
  y = addSection(doc, 'SHIKSHAN / EDUCATION', y)
  y += 4

  addLine(doc, '10vi Sal / 10th Year', data.tenthYear, 12, y, 35)
  addLine(doc, '% Gunu', data.tenthPercent + '%', 110, y, 20)
  y += 7
  addLine(doc, '12vi Sal / 12th Year', data.twelfthYear, 12, y, 35)
  addLine(doc, '% Gunu', data.twelfthPercent + '%', 110, y, 20)
  y += 7
  if (data.graduationYear) {
    addLine(doc, 'Padvi / Degree', data.graduationDegree, 12, y, 35)
    addLine(doc, '% Gunu', data.graduationPercent + '%', 110, y, 20)
    y += 7
  }
  y += 3

  // Physical
  y = addSection(doc, 'SHARIRIK MAHITI / PHYSICAL DETAILS', y)
  y += 4

  addLine(doc, 'Unchi / Height (cm)', data.height, 12, y, 40)
  addLine(doc, 'Vajan / Weight (kg)', data.weight, 110, y, 40)
  y += 7
  addLine(doc, 'Chhaati / Chest (cm)', data.chest, 12, y, 40)
  addLine(doc, 'Fanafune / Expanded', data.chestExpanded, 110, y, 40)
  y += 10

  // Course
  y = addSection(doc, 'PARVESH KORS / ADMISSION COURSE', y)
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(124, 45, 18)
  doc.text(data.course || '—', 12, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(8)
  doc.text('Ling / Gender: ' + data.gender, 120, y)
  y += 8

  // Signatures
  y += 5
  doc.setDrawColor(0, 0, 0)
  doc.line(12, y, 60, y)
  doc.line(80, y, 130, y)
  doc.line(150, y, 198, y)
  y += 4
  doc.setFontSize(7)
  doc.setTextColor(80, 80, 80)
  doc.text("Vidyarthi Sahi / Student's Sign.", 12, y)
  doc.text("Palak Sahi / Parent's Sign.", 80, y)
  doc.text('Sanstha Sahi / Academy Sign.', 150, y)

  // ─── PAGE 2: SAMMATIPATRA ─────────────────────────────────────────────────
  doc.addPage()
  y = 15

  doc.setDrawColor(124, 45, 18)
  doc.setLineWidth(0.8)
  doc.rect(8, 8, 194, 280)

  // Header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(124, 45, 18)
  doc.text('SHIVRAKSHAK CAREER ACADEMY', pageW / 2, y, { align: 'center' })
  y += 6
  doc.setFillColor(124, 45, 18)
  doc.rect(8, y - 3, 194, 7, 'F')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('SAMMATIPATRA / AGREEMENT FORM', pageW / 2, y + 2, { align: 'center' })
  y += 12

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Mi / I, ' + data.fullName + ', Roll No. ' + (data.rollNumber || '___'), 12, y)
  y += 5
  doc.text('khali dilelay niyam va ati manyakela aahe / I hereby agree to the following terms and conditions:', 12, y)
  y += 8

  const rules = [
    '1. Mi academy chya vel anusar upasthit rahil. (I will attend the academy on time)',
    '2. Mi niyamit abhyas karil va shist palin karil. (I will study regularly and maintain discipline)',
    '3. Mi mobile phone class madhe vaparnaar nahi. (I will not use mobile phone in class)',
    '4. Mi fees velich bharil. (I will pay fees on time)',
    '5. Mi anyay/ragging prakar karanar nahi. (I will not indulge in any ragging/misconduct)',
    '6. Academy che samagri kharabi karanar nahi. (I will not damage academy property)',
    '7. Ya sansthechya koni niyam modat kelyaas pravesh naakel jain. (Admission can be cancelled for rule violations)',
  ]

  rules.forEach((rule) => {
    doc.text(rule, 16, y)
    y += 8
  })

  y += 10
  // Oval border for agreement section
  doc.setDrawColor(124, 45, 18)
  doc.setLineWidth(0.5)
  doc.ellipse(pageW / 2, y + 15, 85, 25)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(124, 45, 18)
  doc.text('Mi varil sarva niyam manato / manate.', pageW / 2, y + 10, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text('(I agree to all the above rules and conditions)', pageW / 2, y + 16, { align: 'center' })
  y += 42

  doc.setFontSize(8)
  doc.text('Tarikh / Date: ' + new Date().toLocaleDateString('en-IN'), 12, y)
  y += 10

  doc.setDrawColor(0, 0, 0)
  doc.line(12, y, 75, y)
  doc.line(140, y, 198, y)
  y += 4
  doc.setFontSize(7)
  doc.setTextColor(80, 80, 80)
  doc.text("Vidyarthi / Palak Sahi (Student/Parent Sign.)", 12, y)
  doc.text('Sanstha Sahi (Academy Sign.)', 140, y)

  // ─── PAGE 3: FEE RECEIPT ──────────────────────────────────────────────────
  doc.addPage()
  y = 15

  doc.setDrawColor(124, 45, 18)
  doc.setLineWidth(0.8)
  doc.rect(8, 8, 194, 280)

  // Header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(124, 45, 18)
  doc.text('SHIVRAKSHAK CAREER ACADEMY', pageW / 2, y, { align: 'center' })
  y += 6

  doc.setFillColor(124, 45, 18)
  doc.rect(8, y - 3, 194, 7, 'F')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('FEE PAVATI / FEE RECEIPT', pageW / 2, y + 2, { align: 'center' })
  y += 14

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Roll No.: ' + (data.rollNumber || '___________'), 12, y)
  doc.text('Tarikh / Date: ' + (data.paymentDate || new Date().toLocaleDateString('en-IN')), pageW - 12, y, { align: 'right' })
  y += 10

  addLine(doc, 'Vidyarthi Nav / Name', data.fullName, 12, y)
  y += 8
  addLine(doc, 'Kors / Course', data.course, 12, y)
  y += 8
  addLine(doc, 'Mobile', data.mobile, 12, y)
  y += 12

  // Fee table
  doc.setDrawColor(124, 45, 18)
  doc.setLineWidth(0.5)
  // Header row
  doc.setFillColor(124, 45, 18)
  doc.rect(12, y - 4, 186, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('VIVARAN / DESCRIPTION', 16, y)
  doc.text('RAKAM / AMOUNT (Rs.)', 180, y, { align: 'right' })
  y += 8

  const rows = [
    ['Ek un Fees / Total Fees', `Rs. ${data.totalFee || '0'}`],
    ['Bharleli Fees / Paid Amount', `Rs. ${data.paidAmount || '0'}`],
    ['Payment Mode', data.paymentMode || 'Cash'],
    ...(data.messMonths ? [['Mess Subscription', `${data.messMonths} महिने — Rs. ${data.messAmount || '0'}`]] : []),
    ['Baki Fees / Pending Amount', `Rs. ${data.pendingAmount || '0'}`],
  ]

  rows.forEach((row, i) => {
    const rowY = y + i * 9
    doc.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 247, i % 2 === 0 ? 255 : 235)
    doc.rect(12, rowY - 4, 186, 9, 'F')
    doc.setFont('helvetica', i === rows.length - 1 ? 'bold' : 'normal')
    doc.setFontSize(8)
    doc.setTextColor(i === rows.length - 1 ? 124 : 0, i === rows.length - 1 ? 45 : 0, i === rows.length - 1 ? 18 : 0)
    doc.text(row[0], 16, rowY)
    doc.text(row[1], 194, rowY, { align: 'right' })
  })

  doc.setDrawColor(124, 45, 18)
  doc.rect(12, y - 4, 186, rows.length * 9, 'S')

  y += rows.length * 9 + 16

  // Signatures
  doc.setDrawColor(0, 0, 0)
  doc.line(12, y, 75, y)
  doc.line(140, y, 198, y)
  y += 4
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text("Vidyarthi Sahi (Student Signature)", 12, y)
  doc.text('Sanstha Sahi (Academy Seal & Sign.)', 140, y)

  y += 20
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text('* Hi copy Kavha Hi Sajir Theva / Please keep this copy safe', pageW / 2, y, { align: 'center' })
  doc.text('Shivrakshak Career Academy — Ahmednagar | Ph: 9284842177', pageW / 2, y + 5, { align: 'center' })

  // Save
  const fileName = `Shivrakshak_Form_${data.fullName.replace(/\s+/g, '_')}_${data.rollNumber || 'NEW'}.pdf`
  doc.save(fileName)
}
