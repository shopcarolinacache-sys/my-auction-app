'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { Activity, ArrowUpRight, ExternalLink, Eye, ImagePlus, Monitor, RotateCcw, Save, ShieldCheck, Smartphone, Tablet, Upload, Video, ZoomIn, ZoomOut } from 'lucide-react'
import { useInventory } from '@/components/inventory-store'

type SiteDraft = {
  hero_headline: string
  hero_subtitle: string
  announcement_text: string
  announcement_link: string
  announcement_enabled: string
  hero_image: string
  video_title: string
  video_caption: string
  video_url: string
  video_enabled: string
}

const initialDraft: SiteDraft = {
  hero_headline: 'Rare finds. Curated weekly.',
  hero_subtitle: 'High-end collectibles, vintage toys, trading cards, and objects with a story.',
  announcement_text: 'Carolina Cache / Curated objects / Insured promotional shipping applied at checkout',
  announcement_link: '#collection',
  announcement_enabled: 'true',
  hero_image: '',
  video_title: 'The archive, in motion',
  video_caption: 'A closer look at the pieces behind the collection.',
  video_url: '',
  video_enabled: 'true',
}

const editableSections = [
  { id: 'hero', label: 'Hero banner', icon: Eye },
  { id: 'announcement', label: 'Announcement bar', icon: Activity },
  { id: 'video', label: 'Video showcase', icon: Video },
]

export default function AdminOverview({ onNavigate }: { onNavigate: (section: string) => void }) {
  const { items } = useInventory()
  const [draft, setDraft] = useState<SiteDraft>(initialDraft)
  const [saved, setSaved] = useState<SiteDraft>(initialDraft)
  const [zoom, setZoom] = useState(100)
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [section, setSection] = useState('hero')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [health, setHealth] = useState('')
  const [orderMetrics, setOrderMetrics] = useState({ revenue: 0, unfulfilled: 0 })
  const [auctionCount, setAuctionCount] = useState(0)
  const previewFrame = useRef<HTMLIFrameElement>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const lowStock = items.filter((item) => item.quantity > 0 && item.quantity <= 2).length
  const liveCount = items.filter((item) => item.listingStatus === 'Available').length
  const supabase = getBrowserSupabase()

  useEffect(() => {
    let active = true
    let metricsChannel: ReturnType<NonNullable<typeof supabase>['channel']> | undefined
    try {
      const local = window.localStorage.getItem('carolina-cache-site-content')
      if (local) {
        const parsed = JSON.parse(local) as Partial<SiteDraft>
        const next = { ...initialDraft, ...parsed }
        if (active) { setDraft(next); setSaved(next) }
      }
    } catch { /* Ignore malformed local recovery data. */ }
    if (supabase) {
      const loadMetrics = async () => {
        const [{ data: orderData }, { data: auctionData }] = await Promise.all([supabase.from('orders').select('total,fulfillment_status'), supabase.from('auctions').select('id,status')])
        if (!active) return
        setOrderMetrics({ revenue: (orderData ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0), unfulfilled: (orderData ?? []).filter((order) => ['unfulfilled', 'pending'].includes(String(order.fulfillment_status).toLowerCase())).length })
        setAuctionCount((auctionData ?? []).filter((auction) => ['live', 'active', 'published'].includes(String(auction.status).toLowerCase())).length)
      }
      void loadMetrics()
      metricsChannel = supabase.channel('admin-overview-live').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { void loadMetrics() }).on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => { void loadMetrics() }).subscribe()
      void supabase.from('site_content').select('id,hero_title,hero_subtitle,hero_image_url,announcement_text,announcement_active,bottom_videos').limit(1).maybeSingle().then(({ data }) => {
        if (!active || !data) return
        let video: { title?: string; caption?: string; url?: string; enabled?: boolean } = {}
        try { video = Array.isArray(data.bottom_videos) ? data.bottom_videos[0] ?? {} : typeof data.bottom_videos === 'string' ? JSON.parse(data.bottom_videos)[0] ?? {} : {} } catch { video = {} }
        const next: SiteDraft = { ...initialDraft, hero_headline: data.hero_title ?? initialDraft.hero_headline, hero_subtitle: data.hero_subtitle ?? initialDraft.hero_subtitle, hero_image: data.hero_image_url ?? '', announcement_text: data.announcement_text ?? initialDraft.announcement_text, announcement_enabled: String(data.announcement_active ?? true), video_title: video.title ?? initialDraft.video_title, video_caption: video.caption ?? initialDraft.video_caption, video_url: video.url ?? '', video_enabled: String(video.enabled ?? true) }
        setDraft(next)
        setSaved(next)
      })
    }
    return () => { active = false; if (supabase && metricsChannel) void supabase.removeChannel(metricsChannel) }
  }, [supabase])

  useEffect(() => {
    previewFrame.current?.contentWindow?.postMessage({ type: 'storefront-content-preview', content: draft }, window.location.origin)
  }, [draft])

  const change = useCallback((key: keyof SiteDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setNotice('Unpublished draft')
  }, [])

  async function uploadAsset(file: File, kind: 'image' | 'video') {
    if (!supabase) { setNotice('Storage is not connected. Add an image URL instead.'); return }
    if ((kind === 'image' && !file.type.startsWith('image/')) || (kind === 'video' && !file.type.startsWith('video/'))) {
      setNotice(`Choose a valid ${kind} file.`)
      return
    }
    if (file.size > (kind === 'image' ? 8 : 100) * 1024 * 1024) { setNotice('File exceeds the upload size limit.'); return }
    setBusy(true)
    const path = `site/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true, contentType: file.type })
    if (error || !data) setNotice('Upload failed. Check product-images bucket permissions.')
    else {
      const { data: publicAsset } = supabase.storage.from('product-images').getPublicUrl(data.path)
      change(kind === 'image' ? 'hero_image' : 'video_url', publicAsset.publicUrl)
      setNotice('Upload ready in the draft.')
    }
    setBusy(false)
  }

  async function publish() {
    setBusy(true)
    setNotice('')
    if (!supabase) { setNotice('Supabase client is unavailable.'); setBusy(false); return }
    const bottomVideos = [{ title: draft.video_title, caption: draft.video_caption, url: draft.video_url, enabled: draft.video_enabled === 'true' }]
    const contentRow = { hero_title: draft.hero_headline, hero_subtitle: draft.hero_subtitle, hero_image_url: draft.hero_image, announcement_text: draft.announcement_text, announcement_active: draft.announcement_enabled === 'true', bottom_videos: bottomVideos }
    const { data: existing, error: readError } = await supabase.from('site_content').select('id').limit(1).maybeSingle()
    const result = readError ? { error: readError } : existing?.id ? await supabase.from('site_content').update(contentRow).eq('id', existing.id) : await supabase.from('site_content').insert(contentRow)
    if (result.error) setNotice(`Supabase save failed: ${result.error.message}`)
    else { setNotice('Published to site_content.'); setSaved(draft); window.dispatchEvent(new CustomEvent('storefront-content-updated', { detail: draft })) }
    setBusy(false)
  }

  function revert() {
    setDraft(saved)
    setNotice('Draft restored to the last saved version.')
    window.dispatchEvent(new CustomEvent('storefront-content-updated', { detail: saved }))
  }

  async function verifyHealth() {
    setHealth('Checking storefront and data connection…')
    const checks: string[] = []
    if (supabase) {
      const { error } = await supabase.from('site_content').select('id').limit(1)
      checks.push(error ? 'Supabase table/permissions need attention' : 'Supabase connected')
    } else checks.push('Supabase client unavailable; local fallback active')
    const urls = [draft.hero_image, draft.video_url].filter((value) => value.startsWith('https://'))
    const imageStatus = await Promise.all(urls.map(async (url) => {
      try { const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' }); return response.type === 'opaque' || response.ok }
      catch { return false }
    }))
    checks.push(urls.length ? `${imageStatus.filter(Boolean).length}/${urls.length} media links reachable` : 'No custom media links to check')
    checks.push('Admin workspaces are in-app tabs; route rendering is available for manual review')
    setHealth(checks.join(' · '))
  }

  const sectionMeta = editableSections.find((item) => item.id === section) ?? editableSections[0]
  const previewWidth = viewport === 'desktop' ? 1280 : viewport === 'tablet' ? 768 : 390

  return <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Workspace / Overview</p><h1 className="mt-2 text-3xl font-black tracking-tight">Store command center</h1><p className="mt-1 text-sm text-neutral-500">Edit, preview, and publish the storefront without disturbing your other workspaces.</p></div><div className="flex flex-wrap gap-2">{['Inventory', 'Orders', 'Auctions'].map((tab) => <button key={tab} onClick={() => onNavigate(tab)} className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2 text-xs font-bold hover:border-emerald-700">{tab}<ArrowUpRight className="size-3.5" /></button>)}</div></div>

    <section aria-label="Store health indicators" className="grid grid-cols-2 gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-3 xl:grid-cols-5">{[
      ['Total revenue', `$${orderMetrics.revenue.toLocaleString()}`, 'From orders table'], ['Active inventory', String(liveCount), 'Available listings'], ['Unfulfilled orders', String(orderMetrics.unfulfilled), 'Live from orders'], ['Live auctions', String(auctionCount), 'Live from auctions'], ['Low-stock alerts', String(lowStock), 'Items at 2 or fewer'],
    ].map(([label, value, helper]) => <article key={label} className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] text-neutral-500">{helper}</p></article>)}</section>

    <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-white px-4 py-3"><div className="flex items-center gap-2 text-xs"><span className={`size-2 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`} /><span className="font-bold">{dirty ? 'Draft changes' : 'In sync'}</span><span className="text-neutral-500">{notice || (supabase ? 'Supabase content sync available' : 'Local fallback mode')}</span></div><div className="flex gap-2"><button disabled={!dirty || busy} onClick={revert} className="inline-flex items-center gap-2 border border-neutral-300 px-3 py-2 text-xs font-bold disabled:opacity-40"><RotateCcw className="size-3.5" />Revert to saved</button><button disabled={!dirty || busy} onClick={publish} className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-40"><Save className="size-3.5" />{busy ? 'Saving…' : 'Publish Live'}</button></div></div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 overflow-hidden border border-neutral-200 bg-neutral-100" aria-label="Live storefront canvas">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center bg-neutral-950 text-emerald-300"><Eye className="size-3.5" /></span><span className="text-xs font-bold">Storefront canvas</span><span className="text-[10px] text-neutral-500">Draft preview</span></div><div className="flex flex-wrap items-center gap-1"><div className="flex items-center border border-neutral-200"><button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(50, value - 25))} className="p-2 hover:bg-neutral-100"><ZoomOut className="size-3.5" /></button><span className="min-w-11 text-center text-[10px] font-bold">{zoom}%</span><button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(125, value + 25))} className="p-2 hover:bg-neutral-100"><ZoomIn className="size-3.5" /></button></div>{[50, 75, 100, 125].map((value) => <button key={value} onClick={() => setZoom(value)} aria-pressed={zoom === value} className={`px-2 py-2 text-[10px] font-bold ${zoom === value ? 'bg-neutral-950 text-white' : 'hover:bg-neutral-200'}`}>{value}%</button>)}<div className="ml-1 flex border-l border-neutral-200 pl-2">{([{ id: 'desktop', icon: Monitor }, { id: 'tablet', icon: Tablet }, { id: 'mobile', icon: Smartphone }] as const).map(({ id, icon: Icon }) => <button key={id} onClick={() => setViewport(id)} aria-label={`${id} preview`} aria-pressed={viewport === id} className={`p-2 ${viewport === id ? 'text-emerald-700' : 'text-neutral-500'}`}><Icon className="size-4" /></button>)}</div></div></div>
        <div className="flex min-h-[530px] justify-center overflow-auto p-4 sm:p-6"><div className="h-[480px] shrink-0 overflow-hidden border border-neutral-300 bg-white shadow-lg transition-[width]" style={{ width: `${Math.min(previewWidth * zoom / 100, 1200)}px`, maxWidth: '100%' }}><iframe ref={previewFrame} title="Live storefront preview" src="/?editor-preview=1" onLoad={() => previewFrame.current?.contentWindow?.postMessage({ type: 'storefront-content-preview', content: draft }, window.location.origin)} className="h-full border-0" style={{ width: `${previewWidth}px`, transform: `scale(${zoom / 100})`, transformOrigin: 'top left', height: `${480 / (zoom / 100)}px` }} /></div></div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 bg-white px-4 py-3"><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Select block</span><div className="flex gap-1">{editableSections.map(({ id, label }) => <button key={id} onClick={() => setSection(id)} aria-pressed={section === id} className={`px-2.5 py-1.5 text-[10px] font-bold ${section === id ? 'bg-emerald-100 text-emerald-900' : 'bg-neutral-100 text-neutral-600'}`}>{label}</button>)}</div></div><a href="/?editor-preview=1" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-emerald-800">Open storefront <ExternalLink className="size-3" /></a></div>
      </section>

      <aside className="h-fit border border-neutral-200 bg-white"><div className="border-b border-neutral-200 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Site inspector</p><h2 className="mt-1 text-lg font-black">{sectionMeta.label}</h2><p className="mt-1 text-xs text-neutral-500">Changes stay in preview until published.</p></div><div className="flex flex-col gap-4 p-4">
        {section === 'hero' && <><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Headline</span><textarea rows={3} value={draft.hero_headline} onChange={(event) => change('hero_headline', event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Description</span><textarea rows={4} value={draft.hero_subtitle} onChange={(event) => change('hero_subtitle', event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Hero image URL</span><input value={draft.hero_image} onChange={(event) => change('hero_image', event.target.value)} placeholder="https://…" className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="flex cursor-pointer items-center gap-2 border border-dashed border-neutral-300 p-3 text-xs font-bold hover:border-emerald-700"><ImagePlus className="size-4" />{busy ? 'Uploading…' : 'Upload hero image'}<input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file, 'image') }} /></label></>}
        {section === 'announcement' && <><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Promo message</span><textarea rows={3} value={draft.announcement_text} onChange={(event) => change('announcement_text', event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Promo link</span><input value={draft.announcement_link} onChange={(event) => change('announcement_link', event.target.value)} placeholder="/collection or https://…" className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="flex items-center justify-between border border-neutral-200 p-3 text-xs font-bold">Show announcement bar<input type="checkbox" checked={draft.announcement_enabled === 'true'} onChange={(event) => change('announcement_enabled', String(event.target.checked))} className="size-4 accent-emerald-700" /></label></>}
        {section === 'video' && <><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Video title</span><input value={draft.video_title} onChange={(event) => change('video_title', event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Caption</span><textarea rows={3} value={draft.video_caption} onChange={(event) => change('video_caption', event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">YouTube, Vimeo, or hosted URL</span><input value={draft.video_url} onChange={(event) => change('video_url', event.target.value)} placeholder="https://…" className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" /></label><label className="flex cursor-pointer items-center gap-2 border border-dashed border-neutral-300 p-3 text-xs font-bold hover:border-emerald-700"><Upload className="size-4" />Upload video to Storage<input type="file" accept="video/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file, 'video') }} /></label><label className="flex items-center justify-between border border-neutral-200 p-3 text-xs font-bold">Show video section<input type="checkbox" checked={draft.video_enabled === 'true'} onChange={(event) => change('video_enabled', String(event.target.checked))} className="size-4 accent-emerald-700" /></label></>}
        <div className="border-t border-neutral-200 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Catalog shortcuts</p><button onClick={() => onNavigate('Inventory')} className="mt-2 flex w-full items-center justify-between border border-neutral-200 px-3 py-2.5 text-xs font-bold hover:border-emerald-700">Open inventory <ArrowUpRight className="size-3.5" /></button><button onClick={() => onNavigate('Auctions')} className="mt-2 flex w-full items-center justify-between border border-neutral-200 px-3 py-2.5 text-xs font-bold hover:border-emerald-700">Manage auctions <ArrowUpRight className="size-3.5" /></button></div>
      </div></aside>
    </div>

    <section className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-white p-4"><div><h2 className="text-sm font-black">System integrity</h2><p className="mt-1 text-xs text-neutral-500">Check the connected content table and media URLs. Admin tabs use in-app workspaces.</p>{health && <p role="status" className="mt-2 text-xs text-neutral-700">{health}</p>}</div><button onClick={verifyHealth} className="inline-flex items-center gap-2 border border-neutral-300 px-4 py-2.5 text-xs font-bold hover:border-emerald-700"><ShieldCheck className="size-4" />Verify site health</button></section>
    <div className="sr-only" aria-live="polite">{notice}</div>
  </div>
}
