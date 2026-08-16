'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CircleCheckBig, ChevronLeft, ChevronRight, PlayCircle, X } from 'lucide-react'
import { TRAINING_POINTS } from '@/content/landing'
import Reveal from './Reveal'

export default function Training() {
  const [activeMedia, setActiveMedia] = useState<{ type: string; src: string } | null>(null)
  
  const mediaItems = [
    { type: 'video', src: '/videos/train-vid-1.mp4' },
    { type: 'video', src: '/videos/train-vid-2.mp4' },
    { type: 'video', src: '/videos/train-vid-3.mp4' },
    { type: 'image', src: '/images/gallery/train-new-1.jpg' },
    { type: 'image', src: '/images/gallery/train-new-2.jpg' },
    { type: 'video', src: '/videos/train-vid-4.mp4' },
  ]

  const railRef = useRef<HTMLDivElement>(null)
  const isInteracting = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (railRef.current && !isInteracting.current) {
        const { scrollLeft, scrollWidth, clientWidth } = railRef.current
        const maxScroll = scrollWidth - clientWidth
        if (scrollLeft >= maxScroll - 10) {
          railRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          railRef.current.scrollBy({ left: 260, behavior: 'smooth' })
        }
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const scrollLeft = () => {
    if (railRef.current) railRef.current.scrollBy({ left: -260, behavior: 'smooth' })
  }
  const scrollRight = () => {
    if (railRef.current) railRef.current.scrollBy({ left: 260, behavior: 'smooth' })
  }

  return (
    <section className="sra-section sra-section--tint sra-train">
      <div className="sra-wrap sra-train__grid">
        <Reveal>
          <div>
            <h2>मैदानी प्रशिक्षण</h2>
            <div className="sra-rule" style={{ justifyContent: 'center' }} aria-hidden="true"><i /></div>
            <ul>
              {TRAINING_POINTS.map(point => (
                <li key={point}><CircleCheckBig size={19} aria-hidden="true" /> {point}</li>
              ))}
            </ul>
            <Link href="/admission" className="sra-btn sra-btn--gold">अधिक माहिती घ्या <ArrowRight size={17} /></Link>
          </div>
        </Reveal>
      </div>

      <Reveal delay={90}>
        <div className="sra-train__carousel">
          <button className="sra-train__btn sra-train__btn--prev" onClick={scrollLeft} aria-label="Previous">
            <ChevronLeft size={28} />
          </button>

          <div 
            className="sra-train__shots" 
            ref={railRef}
            onMouseEnter={() => isInteracting.current = true}
            onMouseLeave={() => isInteracting.current = false}
            onTouchStart={() => isInteracting.current = true}
            onTouchEnd={() => isInteracting.current = false}
          >
            {mediaItems.map((item, i) => (
              <figure 
                key={i} 
                onClick={() => setActiveMedia(item)} 
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {item.type === 'image' ? (
                  <Image src={item.src} alt="मैदानी सरावाचे क्षण" fill quality={74} sizes="(max-width: 900px) 100vw, 30vw" />
                ) : (
                  <>
                    <video src={item.src} autoPlay loop muted playsInline style={{ pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                      <PlayCircle size={48} color="var(--sra-gold)" opacity={0.9} />
                    </div>
                  </>
                )}
              </figure>
            ))}
          </div>

          <button className="sra-train__btn sra-train__btn--next" onClick={scrollRight} aria-label="Next">
            <ChevronRight size={28} />
          </button>
        </div>
      </Reveal>

      {/* Lightbox Modal */}
      {activeMedia && (
        <div 
          className="sra-lightbox sra-fade-in" 
          onClick={() => setActiveMedia(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(5, 8, 5, 0.92)', backdropFilter: 'blur(15px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <button 
            onClick={() => setActiveMedia(null)}
            style={{
              position: 'absolute', top: '2rem', right: '2rem',
              background: 'transparent', border: 'none', color: '#fff',
              cursor: 'pointer', zIndex: 10000
            }}
          >
            <X size={40} />
          </button>
          
          <div 
            className="sra-lightbox__content"
            onClick={e => e.stopPropagation()} 
            style={{ position: 'relative', width: '100%', maxWidth: '1000px', maxHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {activeMedia.type === 'video' ? (
              <video 
                src={activeMedia.src} 
                controls 
                autoPlay 
                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
              />
            ) : (
              <img 
                src={activeMedia.src} 
                alt="Training Image" 
                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
