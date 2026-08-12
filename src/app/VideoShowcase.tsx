'use client'

import Image from 'next/image'
import { ExternalLink, Instagram, Play, PlayCircle, Youtube } from 'lucide-react'
import { useState } from 'react'
import type { MediaAsset } from '@/types'

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    let id = ''

    if (host === 'youtu.be') id = parsed.pathname.split('/').filter(Boolean)[0] || ''
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      id = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/)?.[1] || ''
    }

    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

function isInstagramUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '') === 'instagram.com'
  } catch {
    return false
  }
}

export default function VideoShowcase({ videos }: { videos: MediaAsset[] }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  return <div className="video-grid">
    {videos.map(video => {
      const youtubeId = video.media_type === 'youtube' ? getYouTubeVideoId(video.url) : null
      const instagram = isInstagramUrl(video.url)
      const poster = video.thumbnail_url || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '/academy-hero-v2.jpg')
      const isActive = activeVideo === video.id

      return <article className="video-card" key={video.id}>
        <div className="video-frame">
          {youtubeId && isActive ? <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          /> : instagram ? <a
            className="video-poster"
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${video.title} Instagram वर पहा`}
          >
            <Image src={poster} alt="" fill sizes="(max-width: 620px) 78vw, (max-width: 980px) 31vw, 280px" />
            <span className="video-poster-shade" />
            <span className="video-platform"><Instagram /> Instagram Reel</span>
            <span className="video-play"><ExternalLink /></span>
            <span className="video-poster-action">Instagram वर Reel पहा</span>
          </a> : !isActive ? <button
            className="video-poster"
            type="button"
            onClick={() => setActiveVideo(video.id)}
            aria-label={`${video.title} play करा`}
          >
            <Image src={poster} alt="" fill sizes="(max-width: 620px) 78vw, (max-width: 980px) 31vw, 280px" />
            <span className="video-poster-shade" />
            <span className="video-platform">{youtubeId ? <Youtube /> : <PlayCircle />} {youtubeId ? 'YouTube Shorts' : 'Academy Video'}</span>
            <span className="video-play"><Play fill="currentColor" /></span>
            <span className="video-poster-action">Video play करा</span>
          </button> : <video autoPlay controls preload="metadata" poster={poster}><source src={video.url} /></video>}
        </div>
        <div className="video-caption">
          {instagram ? <Instagram /> : youtubeId ? <Youtube /> : <PlayCircle />}
          <strong>{video.title}</strong>
        </div>
      </article>
    })}
  </div>
}
