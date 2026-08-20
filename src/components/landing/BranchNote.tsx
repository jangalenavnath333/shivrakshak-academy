import { MapPin, ShieldCheck, Award, Calendar } from 'lucide-react'
import { BRANCH_NOTE, REGISTRATION } from '@/content/landing'

/** Government trust bar — 3-column olive strip at the very top. */
export function RegistrationStrip() {
  return (
    <div className="sra-reg">
      <span><ShieldCheck size={14} aria-hidden="true" /> <b>{REGISTRATION.headline}</b></span>
      <i aria-hidden="true" />
      <span><Award size={13} aria-hidden="true" /> Udyam नोंदणी क्रमांक: <b>{REGISTRATION.udyam}</b></span>
      <i aria-hidden="true" />
      <span><Calendar size={13} aria-hidden="true" /> स्थापना <b>{REGISTRATION.since}</b></span>
    </div>
  )
}

/** The academy's single-branch claim, stated once and prominently. */
export function BranchNote({ address }: { address: string }) {
  return (
    <section className="sra-branch">
      <div className="sra-wrap">
        <b>{BRANCH_NOTE.title}</b>
        <strong>{BRANCH_NOTE.place}</strong>
        <small><MapPin size={14} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {address}</small>
      </div>
    </section>
  )
}
