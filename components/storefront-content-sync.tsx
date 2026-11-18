'use client'

import { useEffect } from 'react'
import { getBrowserSupabase } from '@/lib/supabase-browser'

type ContentValues = Record<string, string>

function applyContent(content: ContentValues) {
  const headline = document.querySelector<HTMLElement>('[data-site-content="hero_headline"]')
  const subtitle = document.querySelector<HTMLElement>('[data-site-content="hero_subtitle"]')
  const announcement = document.querySelector<HTMLElement>('[data-site-content="announcement_text"]')
  if (headline && content.hero_headline) {
    const [firstLine, ...rest] = content.hero_headline.split(/\\n|\n/)
    const accent = headline.querySelector<HTMLElement>('[data-hero-accent]')
    if (accent && rest.length) {
      headline.firstChild?.remove()
      headline.insertBefore(document.createTextNode(firstLine), headline.firstChild)
      accent.textContent = rest.join(' ')
    } else headline.textContent = content.hero_headline
  }
  if (subtitle && content.hero_subtitle) subtitle.textContent = content.hero_subtitle
  if (announcement) {
    if (content.announcement_text) announcement.textContent = content.announcement_text
    if (announcement instanceof HTMLAnchorElement && content.announcement_link) {
      const link = content.announcement_link.trim()
      if (link.startsWith('#') || (link.startsWith('/') && !link.startsWith('//'))) announcement.href = link
      else {
        try { if (new URL(link).protocol === 'https:') announcement.href = link } catch { /* Ignore invalid promo links. */ }
      }
    }
    announcement.hidden = content.announcement_enabled === 'false'
  }
  const hero = document.querySelector<HTMLElement>('[data-site-hero]')
  if (hero && content.hero_image) hero.style.backgroundImage = `linear-gradient(90deg, rgba(10,10,10,.92), rgba(10,10,10,.28)), url("${content.hero_image.replaceAll('"', '')}")`
  const videoSection = document.querySelector<HTMLElement>('[data-site-video]')
  if (videoSection) {
    videoSection.hidden = content.video_enabled === 'false'
    const title = videoSection.querySelector<HTMLElement>('[data-video-title]')
    const caption = videoSection.querySelector<HTMLElement>('[data-video-caption]')
    if (title && content.video_title) title.textContent = content.video_title
    if (caption && content.video_caption) caption.textContent = content.video_caption
    const player = videoSection.querySelector<HTMLVideoElement>('[data-video-player]')
    const embed = videoSection.querySelector<HTMLIFrameElement>('[data-video-embed]')
    const videoUrl = content.video_url ?? ''
    const youtube = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
    const vimeo = videoUrl.match(/vimeo\.com\/(\d+)/)
    const embedUrl = youtube ? `https://www.youtube-nocookie.com/embed/${youtube[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : ''
    if (embedUrl && embed) {
      if (embed.src !== embedUrl) embed.src = embedUrl
      embed.hidden = false
      if (player) player.hidden = true
    } else if (videoUrl.startsWith('https://') && player) {
      const source = player.querySelector('source')
      if (source && source.src !== videoUrl) { source.src = videoUrl; player.load() }
      player.hidden = false
      if (embed) embed.hidden = true
    } else {
      if (player) player.hidden = true
      if (embed) embed.hidden = true
    }
  }
}

export function StorefrontContentSync() {
  useEffect(() => {
    let alive = true
    const applySaved = (value: unknown) => {
      if (value && typeof value === 'object') applyContent(value as ContentValues)
    }
    try { applySaved(JSON.parse(window.localStorage.getItem('carolina-cache-site-content') ?? 'null')) } catch { /* Ignore malformed local fallback. */ }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'carolina-cache-site-content' && event.newValue) {
        try { applySaved(JSON.parse(event.newValue)) } catch { /* Ignore malformed local fallback. */ }
      }
    }
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) applySaved(event.data?.type === 'storefront-content-preview' ? event.data.content : null)
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('message', handleMessage)
    const client = getBrowserSupabase()
    if (client) {
      void client.from('site_settings').select('key,value').then(({ data }) => {
        if (alive && data) applySaved(Object.fromEntries(data.map((row) => [row.key, String(row.value ?? '')])))
      })
    }
    return () => { alive = false; window.removeEventListener('storage', handleStorage); window.removeEventListener('message', handleMessage) }
  }, [])
  return null
}
