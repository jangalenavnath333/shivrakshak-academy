'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Medal, Phone, UserRound, X } from 'lucide-react'
import { DIRECTORS } from '@/content/landing'

/**
 * Founder cards. A founder whose full service record exists opens it in a
 * dialog; one without a record is a plain card, so nothing invites a click
 * that would lead nowhere.
 */
export default function DirectorCards() {
  const [open, setOpen] = useState<number | null>(null)
  const active = open === null ? null : DIRECTORS[open]

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      <div className="sra-dir__people">
        {DIRECTORS.map((person, i) => {
          const body = (
            <>
              <span className="sra-dir__shot" aria-hidden="true">
                {person.photo
                  ? <Image src={person.photo} alt="" fill sizes="(max-width: 620px) 40vw, 190px" style={{ objectFit: 'cover' }} />
                  : <UserRound size={40} />}
              </span>
              <div className="sra-dir__meta">
                <p className="sra-dir__name">{person.name}</p>
                <p className="sra-dir__role">{person.role}</p>
                <div className="sra-dir__facts">
                  {person.facts.map(f => (
                    <div key={f.label}><small>{f.label}</small><b>{f.value}</b></div>
                  ))}
                </div>
                <span className="sra-dir__foot">
                  <span className="sra-dir__phone"><Phone size={14} aria-hidden="true" /> {person.phone}</span>
                  {person.detail && <span className="sra-dir__more">संपूर्ण माहिती पहा →</span>}
                </span>
              </div>
            </>
          )

          return person.detail ? (
            <button key={person.name} type="button" className="sra-dir__card sra-dir__card--link"
              onClick={() => setOpen(i)} aria-haspopup="dialog"
              aria-label={`${person.name} — संपूर्ण माहिती पहा`}>
              {body}
            </button>
          ) : (
            <article key={person.name} className="sra-dir__card">{body}</article>
          )
        })}
      </div>

      {active?.detail && (
        <div className="sra-modal" role="dialog" aria-modal="true" aria-label={active.name}>
          <button type="button" className="sra-modal__scrim" aria-label="बंद करा" onClick={() => setOpen(null)} />
          <div className="sra-modal__box">
            <button type="button" className="sra-modal__x" aria-label="बंद करा" onClick={() => setOpen(null)}>
              <X size={20} />
            </button>

            <div className="sra-modal__grid">
              {active.photo && (
                <div className="sra-modal__photo">
                  <Image src={active.photo} alt={active.name} fill sizes="(max-width: 800px) 92vw, 40vw" quality={88} />
                </div>
              )}
              <div className="sra-modal__body">
                <h3>{active.name}</h3>
                <p className="sra-dir__role">{active.role}</p>
                <p className="sra-story__born">{active.detail.born}</p>
                <p className="sra-story__intro">{active.detail.intro}</p>

                <ol className="sra-story__line">
                  {active.detail.milestones.map(m => (
                    <li key={m.year}>
                      <span><Medal size={14} aria-hidden="true" /> {m.year}</span>
                      <p>{m.text}</p>
                    </li>
                  ))}
                </ol>

                <p className="sra-story__close">{active.detail.closing}</p>
                <a className="sra-btn sra-btn--gold" href={`tel:${active.phone}`} style={{ marginTop: '1.4rem' }}>
                  <Phone size={16} /> {active.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
