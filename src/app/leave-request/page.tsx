import type { Metadata } from 'next'
import { BellRing, CheckCircle2, ClipboardCheck, MessageCircle } from 'lucide-react'
import SiteNav from '../SiteNav'
import LeaveRequestForm from './LeaveRequestForm'
import styles from './leave-request.module.css'

export const metadata: Metadata = {
  title: 'सुट्टीचा अर्ज | शिवरक्षक करिअर अकॅडमी',
  description: 'शिवरक्षक अकॅडमी विद्यार्थ्यांसाठी online leave request आणि admin approval.',
}

export default function LeaveRequestPage() {
  return <main className={styles.page}>
    <SiteNav />
    <section className={styles.shell}>
      <div className={styles.intro}>
        <div className={styles.introIcon}><ClipboardCheck aria-hidden="true" /></div>
        <h1>घरी जायचं आहे?<br /><strong>सुट्टीचा अर्ज इथे भरा.</strong></h1>
        <p>फक्त नाव, मोबाईल नंबर, विद्यार्थी ID आणि सुट्टीचे दिवस लिहा. अर्ज Adminकडे लगेच जाईल.</p>
        <ol>
          <li><CheckCircle2 aria-hidden="true" /><span><b>माहिती पडताळणी</b><small>प्रवेश formमधील विद्यार्थी माहितीशी सुरक्षित जुळवणी.</small></span></li>
          <li><BellRing aria-hidden="true" /><span><b>Admin Approval</b><small>Admin अर्ज तपासून मंजूर किंवा नामंजूर करेल.</small></span></li>
          <li><MessageCircle aria-hidden="true" /><span><b>मोबाईलवर Message</b><small>मंजुरी झाल्यावर WhatsApp/SMS notification मिळेल.</small></span></li>
        </ol>
      </div>
      <div className={styles.formPanel}><LeaveRequestForm /></div>
    </section>
  </main>
}
