'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { Pause, Play, RotateCcw, X } from 'lucide-react'

export type ReplayDemoType = 'midnight-pull' | 'vintage-shelf' | 'headphones-dark'

export type Replay = {
  id: string
  title: string
  duration: string
  winner_username: string
  winning_bid: number
  video_url: string | null
  thumbnail_url: string | null
  demo_type: ReplayDemoType
  is_active: boolean
  sort_order: number
}

const demoContent: Record<ReplayDemoType, { image: string; scene: string; item: string; winner: string; bid: number; chats: string[] }> = {
  'midnight-pull': { image: '/products/trading-card.png', scene: 'Midnight card pull', item: 'Graded holo · fresh from the sleeve', winner: '@CharlotteCollector', bid: 285, chats: ['That centering is unreal', 'Sleeve reveal incoming!', 'Bid $260 — let’s go'] },
  'vintage-shelf': { image: '/products/action-figure.png', scene: 'Vintage shelf tour', item: 'Retro collectible · original-era find', winner: '@RetroVaultNC', bid: 148, chats: ['Top shelf has the grail', 'Love the condition on that one', 'I’m in at $135'] },
  'headphones-dark': { image: '/products/headphones.png', scene: 'Headphones after dark', item: 'Studio headphones · late-night sound check', winner: '@AudioHunter99', bid: 220, chats: ['Those cups are mint', 'Turn them up!', 'Bid $200 from me'] },
}

export function ReplayPlayer({ replay, onClose }: { replay: Replay; onClose: () => void }) {
  const [playing, setPlaying] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(10)
  const [bid, setBid] = useState(Math.max(1, replay.winning_bid - 35))
  const [finished, setFinished] = useState(false)
  const demo = demoContent[replay.demo_type] ?? demoContent['midnight-pull']

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!playing || finished || replay.video_url) return
    const timer = window.setInterval(() => {
      setSecondsLeft((remaining) => {
        if (remaining <= 1) { setFinished(true); setBid(replay.winning_bid); return 0 }
        setBid((current) => Math.min(replay.winning_bid, current + Math.max(1, Math.ceil((replay.winning_bid - current) / remaining))))
        return remaining - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, finished, replay.video_url, replay.winning_bid])

  const replayDemo = () => { setSecondsLeft(10); setBid(Math.max(1, replay.winning_bid - 35)); setFinished(false); setPlaying(true) }
  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) onClose() }

  return <div role="presentation" onMouseDown={closeOnBackdrop} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
    <section role="dialog" aria-modal="true" aria-labelledby="replay-title" className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#10110f] text-white shadow-2xl">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Carolina Cache · auction replay</p><h2 id="replay-title" className="mt-1 truncate text-lg font-bold sm:text-xl">{replay.title}</h2></div><button type="button" onClick={onClose} aria-label="Close replay" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"><X className="size-5" /></button></header>
      {replay.video_url ? <video key={replay.video_url} controls autoPlay playsInline className="aspect-video w-full bg-black" poster={replay.thumbnail_url ?? undefined}><source src={replay.video_url} /></video> : <div className="replay-stage relative aspect-video overflow-hidden bg-[#171916]" data-demo-type={replay.demo_type} data-playing={playing}>
        <div className="replay-camera absolute inset-0"><img src={demo.image} alt={demo.item} className="size-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-black/65" /></div>
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider"><span className="size-2 animate-pulse rounded-full bg-white" />Replay</div><div className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold backdrop-blur">◉ {replay.demo_type === 'vintage-shelf' ? '864' : replay.demo_type === 'headphones-dark' ? '1,092' : '1,248'} watching</div></div>
          <div className="max-w-sm self-start rounded-xl border border-white/15 bg-black/55 p-3 backdrop-blur-md sm:p-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">{demo.scene}</p><p className="mt-1 text-sm font-semibold sm:text-base">{demo.item}</p><div className="mt-3 flex items-end justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Current bid</p><p className="text-2xl font-black tabular-nums sm:text-3xl">${bid.toLocaleString()}</p></div><div className={`rounded-lg px-3 py-2 text-center ${secondsLeft <= 3 && !finished ? 'bg-red-600 animate-pulse' : 'bg-white/10'}`}><p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Sudden death</p><p className="font-mono text-lg font-bold tabular-nums">00:{String(secondsLeft).padStart(2, '0')}</p></div></div></div>
          <div className="flex items-end justify-between gap-3"><div className="replay-chat space-y-1.5" aria-live="polite">{demo.chats.map((message, index) => <p key={message} className="w-fit max-w-[min(80vw,330px)] rounded-full bg-black/55 px-3 py-1.5 text-[10px] text-white shadow backdrop-blur sm:text-xs" style={{ animationDelay: `${index * 0.8}s` }}><span className="mr-2 font-bold text-emerald-300">{['@cardboardkate', '@shelfsitter', '@bidclub'][index]}</span>{message}</p>)}</div>{finished && <div className="replay-winner rounded-xl bg-emerald-400 px-4 py-3 text-center text-zinc-950 shadow-xl sm:px-6 sm:py-4"><p className="text-base font-black uppercase tracking-wide sm:text-xl">Auction won! 🎉</p><p className="mt-1 text-xs font-bold">{replay.winner_username} · ${replay.winning_bid.toLocaleString()}</p></div>}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-emerald-400 transition-[width] duration-1000" style={{ width: `${(10 - secondsLeft) * 10}%` }} /></div>
      </div>}
      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><p className="text-xs text-white/50">{replay.video_url ? 'Official replay video' : 'Live room simulation'} <span className="px-1">·</span> {replay.duration}</p>{!replay.video_url && <div className="flex items-center gap-2"><button type="button" onClick={() => setPlaying((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold transition hover:bg-white/20">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}{playing ? 'Pause' : 'Play'}</button><button type="button" onClick={replayDemo} className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-300"><RotateCcw className="size-4" />Replay</button></div>}</footer>
    </section>
  </div>
}
