'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * The page's single authored motion: content settles upward once as it enters.
 * Content is visible by default if IntersectionObserver never fires, so a
 * failed observer can never leave the page blank.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className }: {
  children: ReactNode
  delay?: number
  as?: 'div' | 'section' | 'article' | 'li'
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); observer.disconnect() }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={['sra-reveal', className].filter(Boolean).join(' ')}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
