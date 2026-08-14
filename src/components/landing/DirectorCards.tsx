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
  const [activeDoc, setActiveDoc] = useState<number | null>(null)

  const active = open === null ? null : DIRECTORS[open]

  useEffect(() => {
    if (open === null && activeDoc === null) return
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setOpen(null)
        setActiveDoc(null)
      } 
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, activeDoc])

  return (
    <>
      <div className="sra-dir__people">
        {DIRECTORS.map((person, i) => {
          const body = (
            <>
              <span className="sra-dir__shot" aria-hidden="true">
                {person.cardPhoto
                  ? <Image src={person.cardPhoto} alt="" fill sizes="(max-width: 620px) 40vw, 240px" quality={90} style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
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
                  <Image src={active.photo} alt={active.name} fill sizes="(max-width: 800px) 92vw, 40vw" quality={92} style={{ objectFit: 'contain' }} />
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
                
                {/* Military Service Documents Section */}
                {active.name.includes('राजे पवार') && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--sra-line)', paddingTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--sra-gold)', fontFamily: 'var(--sra-display)', fontSize: '1.15rem', marginBottom: '1rem', letterSpacing: '.04em' }}>
                      अधिकृत सैन्य सेवा प्रमाणपत्रे व दस्तऐवज
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '1.2rem',
                      alignItems: 'start' // Prevent vertical stretching
                    }}>
                      {[1, 2, 3, 4].map(num => {
                        // doc-1, doc-2, doc-3 are portrait (3:4), doc-4 is landscape (4:3)
                        const isPortrait = num !== 4;
                        return (
                          <div key={num} 
                            onClick={() => setActiveDoc(num)}
                            className="sra-doc-frame"
                            role="button"
                            tabIndex={0}
                            style={{
                              position: 'relative',
                              aspectRatio: isPortrait ? '3 / 4' : '4 / 3',
                              border: '1px solid var(--sra-gold)',
                              background: '#0c0f08',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              cursor: 'zoom-in',
                              padding: 0,
                              transition: 'border-color .2s, box-shadow .2s'
                            }}
                          >
                              <img 
                                src={`/images/director/doc-${num}.jpg`} 
                                alt={`सैन्य सेवा दस्तऐवज ${num}`} 
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }} 
                              />
                          </div>
                        )
                      })}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--sra-muted)', marginTop: '0.6rem', textAlign: 'center' }}>
                      * दस्तऐवज स्पष्ट पाहण्यासाठी फोटोवर क्लिक करा.
                    </p>
                  </div>
                )}

                <a className="sra-btn sra-btn--gold" href={`tel:${active.phone}`} style={{ marginTop: '1.4rem' }}>
                  <Phone size={16} /> {active.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Document Popup Modal */}
      {activeDoc !== null && (
        <div className="sra-modal" style={{ zIndex: 99999 }} role="dialog" aria-modal="true">
          <button type="button" className="sra-modal__scrim" aria-label="बंद करा" onClick={() => setActiveDoc(null)} />
          <div className="sra-modal__box" style={{ 
            maxWidth: '95vw', 
            maxHeight: '95vh', 
            width: 'auto', 
            background: '#050804',
            border: '2px solid var(--sra-gold)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            position: 'relative'
          }}>
            <button type="button" className="sra-modal__x" aria-label="बंद करा" onClick={() => setActiveDoc(null)} style={{ zIndex: 110 }}>
              <X size={24} />
            </button>
            
            <div style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              minHeight: '300px'
            }}>
              <img 
                src={`/images/director/doc-${activeDoc}.jpg`} 
                alt="दस्तऐवज स्पष्ट पहा" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div style={{ marginTop: '20px', zIndex: 105 }}>
              <button 
                onClick={() => setActiveDoc(null)}
                className="sra-btn sra-btn--gold"
                style={{ padding: '8px 24px', fontSize: '1rem', cursor: 'pointer' }}
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
