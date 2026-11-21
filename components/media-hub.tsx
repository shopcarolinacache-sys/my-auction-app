'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Play } from 'lucide-react'
import { auctionVideos, DEFAULT_RECENT_WINS, RecentWin } from '@/data/storefront'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { Replay, ReplayPlayer } from '@/components/replay-player'
import { getCategoryFallbackImage } from '@/data/products'

const fallbackReplays = auctionVideos.map((video) => ({ ...video, thumbnail_url: video.image })) as Replay[]

function parseRecentWins(value: unknown): RecentWin[] {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  if (!Array.isArray(parsed)) return DEFAULT_RECENT_WINS
  return parsed.filter((item): item is RecentWin => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.category === 'string' && typeof item.price === 'number' && typeof item.image === 'string')
}

export function MediaHub() {
  const [replays, setReplays] = useState<Replay[]>(fallbackReplays)
  const [wins, setWins] = useState<RecentWin[]>(DEFAULT_RECENT_WINS)
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null)

  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (!supabase) return
    let current = true
    void supabase.from('live_replays').select('id,title,duration,winner_username,winning_bid,video_url,thumbnail_url,demo_type,is_active,sort_order').eq('is_active', true).order('sort_order', { ascending: true }).then(({ data, error }) => {
      if (!current || error || !data?.length) return
      const items = data.map((row) => ({
        id: String(row.id), title: String(row.title), duration: String(row.duration ?? '00:00'),
        winner_username: String(row.winner_username ?? '@Collector'), winning_bid: Number(row.winning_bid ?? 0),
        video_url: row.video_url ?? null, thumbnail_url: row.thumbnail_url ?? null,
        demo_type: (row.demo_type ?? 'midnight-pull') as Replay['demo_type'], is_active: Boolean(row.is_active), sort_order: Number(row.sort_order ?? 0),
      }))
      setReplays(items)
    })
    void supabase.from('site_settings').select('value').eq('key', 'recent_wins').maybeSingle().then(({ data, error }) => {
      if (!current || error || !data?.value) return
      try { setWins(parseRecentWins(data.value)) } catch { setWins(DEFAULT_RECENT_WINS) }
    })
    return () => { current = false }
  }, [])

  return <section aria-labelledby="media-heading" className="border-t border-neutral-200 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">The proof is in the room</p><h2 id="media-heading" className="mt-3 text-4xl font-black tracking-[-0.07em] sm:text-6xl">Live from the Cache.</h2></div><p className="max-w-xs text-sm leading-relaxed text-neutral-500">Replay the pulls, celebrate the wins, and see what is moving through the archive.</p></div><div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]"><div><div className="mb-4 flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-[0.18em]">Past live auctions</h3><a href="#top" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-emerald-700">View all <ArrowUpRight className="ml-1 inline size-3" /></a></div><div className="grid gap-4 sm:grid-cols-3">{replays.map((replay) => <button type="button" key={replay.id} onClick={() => setSelectedReplay(replay)} aria-label={`Play replay: ${replay.title}`} className="group text-left"><div className="relative aspect-[4/3] overflow-hidden bg-neutral-900"><img src={replay.thumbnail_url?.trim() || fallbackReplays.find((item) => item.demo_type === replay.demo_type)?.thumbnail_url || getCategoryFallbackImage(replay.demo_type)} alt={`${replay.title} replay from Carolina Cache`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getCategoryFallbackImage(replay.demo_type) }} className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" /><div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" /><span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-white text-neutral-950"><Play className="size-4 fill-current" /></span><span className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 text-[9px] font-bold text-white">{replay.duration}</span><span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Replay</span></div><h4 className="mt-3 text-sm font-bold transition-colors group-hover:text-emerald-700">{replay.title}</h4></button>)}</div></div><div><div className="mb-4 flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-[0.18em]">Recent wins &amp; sold</h3><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Collector proof</span></div><div className="grid grid-cols-2 gap-3">{wins.map((win) => <article key={win.id} className="group relative aspect-[4/5] overflow-hidden bg-neutral-900"><img src={win.image} alt={`${win.title}, ${win.category}`} onError={(event) => { const fallback = DEFAULT_RECENT_WINS.find((item) => item.category === win.category)?.image; if (fallback && event.currentTarget.src !== new URL(fallback, window.location.href).href) event.currentTarget.src = fallback; else event.currentTarget.style.opacity = '0' }} className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" /><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-3 text-white"><span className="inline-flex bg-white/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{win.category}</span><p className="mt-2 text-xs font-semibold leading-snug">{win.title}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wider">Sold for ${win.price.toLocaleString()}</p></div></article>)}</div></div></div></div>{selectedReplay && <ReplayPlayer replay={selectedReplay} onClose={() => setSelectedReplay(null)} />}</section>
}
