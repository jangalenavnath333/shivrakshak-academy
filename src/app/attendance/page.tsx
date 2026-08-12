import Link from 'next/link'
import { Camera,ShieldCheck } from 'lucide-react'
export default function AttendanceInfo(){return <main className="student-feature-page"><Camera/><h1>Live Attendance</h1><p>अकॅडमीमध्ये camera-assisted face verification, manual आणि online उपस्थिती उपलब्ध आहे. उपस्थिती नोंदवण्यासाठी प्रशिक्षकांनी दिलेल्या sessionमध्ये सहभागी व्हा.</p><div><ShieldCheck/> तुमचा camera फक्त परवानगी दिल्यानंतरच सुरू होतो.</div><Link href="/">मुख्यपृष्ठावर परत जा</Link></main>}
