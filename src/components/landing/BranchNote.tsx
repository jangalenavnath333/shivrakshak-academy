import { MapPin, ShieldCheck } from 'lucide-react'
import { BRANCH_NOTE, REGISTRATION } from '@/content/landing'

/** Government registration line — sits directly above the hero. */
export function RegistrationStrip() {
  return (
    <div className="sra-reg">
      <span><ShieldCheck size={14} aria-hidden="true" /> <b>{REGISTRATION.headline}</b></span>
      <i aria-hidden="true" />
      <span>Udyam नोंदणी क्रमांक: <b>{REGISTRATION.udyam}</b></span>
      <i aria-hidden="true" />
      <span>स्थापना {REGISTRATION.since}</span>
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
