'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { GALLERY } from '@/content/landing'
import Reveal from './Reveal'

export type GalleryMedia = {
  id: string
  url: string
  thumbnail_url?: string
  title?: string
  media_type: 'image' | 'video' | 'youtube'
}

export default function Gallery({ uploadedMedia = [] }: { uploadedMedia?: GalleryMedia[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Normalize hardcoded GALLERY to match GalleryMedia type
  const combinedMedia: GalleryMedia[] = [
    ...uploadedMedia,
    ...GALLERY.map((g, i) => ({
      id: `hardcoded-${i}`,
      url: g.src,
      title: g.caption,
      media_type: 'image' as const
    }))
  ]

  const activeMedia = activeIndex !== null ? combinedMedia[activeIndex] : null

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % combinedMedia.length)
    }
  }

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + combinedMedia.length) % combinedMedia.length)
    }
  }

  return (
    <section className="sra-section sra-section--tint" id="gallery">
      <div className="sra-wrap">
        <div className="sra-head">
          <h2>आमची गॅलरी</h2>
          <div className="sra-rule" aria-hidden="true"><i /></div>
          <p>मैदान, वर्ग आणि अकॅडमीतील दैनंदिन प्रशिक्षणाचे क्षण.</p>
        </div>
        <Reveal>
          <div className="sra-gal">
            {combinedMedia.map((item, i) => (
              <figure 
                key={item.id} 
                onClick={() => setActiveIndex(i)}
                style={{ cursor: 'pointer' }}
              >
                <Image 
                  src={item.thumbnail_url || item.url} 
                  alt={item.title || 'Gallery Image'} 
                  fill 
                  quality={74} 
                  sizes="(max-width: 620px) 100vw, (max-width: 1080px) 33vw, 25vw" 
                />
                {item.media_type === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <PlayCircle size={48} color="var(--sra-gold)" opacity={0.9} />
                  </div>
                )}
                {item.title && <figcaption>{item.title}</figcaption>}
              </figure>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Lightbox Modal */}
      {activeMedia && (
        <div 
          className="sra-lightbox sra-fade-in" 
          onClick={() => setActiveIndex(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(5, 8, 5, 0.92)', backdropFilter: 'blur(15px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <button 
            onClick={() => setActiveIndex(null)}
            style={{
              position: 'absolute', top: '2rem', right: '2rem',
              background: 'transparent', border: 'none', color: '#fff',
              cursor: 'pointer', zIndex: 10000
            }}
          >
            <X size={40} />
          </button>
          
          <button 
            onClick={prevMedia}
            style={{
              position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
              cursor: 'pointer', zIndex: 10000, width: '50px', height: '50px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ChevronLeft size={32} />
          </button>

          <button 
            onClick={nextMedia}
            style={{
              position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
              cursor: 'pointer', zIndex: 10000, width: '50px', height: '50px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ChevronRight size={32} />
          </button>

          <div 
            className="sra-lightbox__content"
            onClick={e => e.stopPropagation()} 
            style={{ position: 'relative', width: '100%', maxWidth: '1000px', maxHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {activeMedia.media_type === 'video' ? (
              <video 
                key={activeMedia.url}
                src={activeMedia.url} 
                controls 
                autoPlay 
                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
              />
            ) : (
              <img 
                key={activeMedia.url}
                src={activeMedia.url} 
                alt={activeMedia.title || ''} 
                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
              />
            )}
            {activeMedia.title && (
              <div style={{
                position: 'absolute', bottom: '-40px', left: 0, right: 0,
                textAlign: 'center', color: '#fff', fontSize: '1.2rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}>
                {activeMedia.title}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
