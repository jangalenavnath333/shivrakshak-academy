'use client'

import Image from 'next/image'
import { Camera, MonitorCheck, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export interface FeatureDemoVideo {
  id: string
  kind: 'face' | 'exam'
  title: string
  description: string
  url: string
  poster: string
}

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const id = host === 'youtu.be'
      ? parsed.pathname.split('/').filter(Boolean)[0]
      : parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/)?.[1]
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

export default function FeatureDemoVideos({ videos }: { videos: FeatureDemoVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  return <div className="feature-demo-grid">
    {videos.map((video) => {
      const youtubeId = getYouTubeVideoId(video.url)
      const isActive = activeVideo === video.id
      const Icon = video.kind === 'face' ? Camera : MonitorCheck

      return <article className="feature-demo-card" key={video.id}>
        <div className="feature-demo-frame">
          {!isActive ? <button
            className="feature-demo-poster"
            type="button"
            onClick={() => setActiveVideo(video.id)}
            aria-label={`${video.title} demo play करा`}
          >
            <Image src={video.poster} alt="" fill sizes="(max-width: 720px) 100vw, 50vw" />
            <span className="feature-demo-play"><Play fill="currentColor" /></span>
            <span className="feature-demo-action">Demo पाहण्यासाठी play करा</span>
          </button> : youtubeId ? <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          /> : <video autoPlay controls playsInline preload="metadata" poster={video.poster}>
            <source src={video.url} type="video/mp4" />
            तुमचा browser हा video play करू शकत नाही.
          </video>}
        </div>
        <div className="feature-demo-copy">
          <Icon />
          <div><strong>{video.title}</strong><p>{video.description}</p></div>
          {isActive ? <button type="button" onClick={() => setActiveVideo(null)}><RotateCcw /> Poster पहा</button> : null}
        </div>
      </article>
    })}
  </div>
}
