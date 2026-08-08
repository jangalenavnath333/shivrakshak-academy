'use client'

import Image from 'next/image'
import { Camera, LoaderCircle, MonitorCheck, Play, RefreshCw, RotateCcw } from 'lucide-react'
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
  const [playbackState, setPlaybackState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [attempt, setAttempt] = useState(0)

  function play(videoId: string) {
    setActiveVideo(videoId)
    setPlaybackState('loading')
  }

  function reset() {
    setActiveVideo(null)
    setPlaybackState('idle')
  }

  function retry() {
    setAttempt((value) => value + 1)
    setPlaybackState('loading')
  }

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
            onClick={() => play(video.id)}
            aria-label={`${video.title} demo play करा`}
          >
            <Image src={video.poster} alt="" fill loading="eager" fetchPriority="high" sizes="(max-width: 720px) 100vw, 50vw" />
            <span className="feature-demo-play"><Play fill="currentColor" /></span>
            <span className="feature-demo-action">Demo पाहण्यासाठी play करा</span>
          </button> : youtubeId ? <iframe
            key={`${video.id}-${attempt}`}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onLoad={() => setPlaybackState('ready')}
            onError={() => setPlaybackState('error')}
          /> : <video
            key={`${video.id}-${attempt}`}
            autoPlay
            controls
            playsInline
            preload="metadata"
            poster={video.poster}
            onCanPlay={() => setPlaybackState('ready')}
            onError={() => setPlaybackState('error')}
          >
            <source src={video.url} type="video/mp4" />
            तुमचा browser हा video play करू शकत नाही.
          </video>}
          {isActive && playbackState === 'loading' ? <div className="feature-demo-status" role="status">
            <LoaderCircle className="feature-demo-spinner" />
            <strong>Video सुरू होत आहे…</strong>
          </div> : null}
          {isActive && playbackState === 'error' ? <div className="feature-demo-status feature-demo-error" role="alert">
            <strong>Video load झाला नाही.</strong>
            <button type="button" onClick={retry}><RefreshCw /> पुन्हा प्रयत्न करा</button>
          </div> : null}
        </div>
        <div className="feature-demo-copy">
          <Icon />
          <div><strong>{video.title}</strong><p>{video.description}</p></div>
          {isActive ? <button type="button" onClick={reset}><RotateCcw /> Poster पहा</button> : null}
        </div>
      </article>
    })}
  </div>
}
