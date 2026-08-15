'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CircleCheckBig } from 'lucide-react'
import { TRAINING_POINTS } from '@/content/landing'
import Reveal from './Reveal'

export default function Training() {
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
        <Reveal delay={90}>
          <div 
            className="sra-train__shots" 
            ref={railRef}
            onMouseEnter={() => isInteracting.current = true}
            onMouseLeave={() => isInteracting.current = false}
            onTouchStart={() => isInteracting.current = true}
            onTouchEnd={() => isInteracting.current = false}
          >
            {mediaItems.map((item, i) => (
              <figure key={i}>
                {item.type === 'image' ? (
                  <Image src={item.src} alt="मैदानी सरावाचे क्षण" fill quality={74} sizes="(max-width: 900px) 100vw, 30vw" />
                ) : (
                  <video src={item.src} autoPlay loop muted playsInline controls />
                )}
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
