'use client'

import { useEffect, useMemo, useState } from 'react'
import { Gavel, ImageIcon, Radio, ShoppingBag, TimerReset, UserRound } from 'lucide-react'

type Auction = {
  id: string
  name: string
  description: string
  image: string
  seller: string
  minBid: number
  currentBid: number
  bidder: string
  buyNow?: number
  type: 'live' | 'static'
  endsAt: number
  status: 'live' | 'closed' | 'sold'
}

type Activity = { text: string; time: string; tone?: 'accent' | 'muted' }

const seedAuction: Auction = {
  id: 'lot-014',
  name: '1998 Chrome Blaster Box',
  description: 'Factory sealed collectible with a pristine box. One winner, no reserve.',
  image: '/products/trading-card.png',
  seller: 'Carolina Cache',
  minBid: 50,
  currentBid: 74,
  bidder: 'M***r',
  buyNow: 140,
  type: 'live',
  // Keep the first render deterministic for SSR; the client starts the countdown after hydration.
  endsAt: 0,
  status: 'live',
}

const seedActivity: Activity[] = [
  { text: 'M***r is leading at $74', time: 'just now', tone: 'accent' },
  { text: 'K***n placed $68', time: '12 sec ago' },
  { text: 'J***s placed $61', time: '25 sec ago' },
  { text: 'A***y placed $54', time: '41 sec ago' },
]

const money = (value: number) => `$${value.toLocaleString()}`

export function LiveAuction() {
  const [auction, setAuction] = useState(seedAuction)
  const [activity, setActivity] = useState(seedActivity)
  const [view, setView] = useState<'live' | 'static'>('live')
  const [bid, setBid] = useState('')
  const [message, setMessage] = useState('')
  const [showListing, setShowListing] = useState(false)
  const [draft, setDraft] = useState({ name: '', description: '', image: '', minBid: '', buyNow: '', type: 'static', endsAt: '' })
  // Keep all time-derived output stable during SSR and the first client render.
  const [remaining, setRemaining] = useState(0)
  const time = useMemo(() => {
    const total = Math.floor(remaining / 1000)
    const days = Math.floor(total / 86400)
    const hours = Math.floor((total % 86400) / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return { days, hours, minutes, seconds }
  }, [remaining])

  useEffect(() => {
    const start = () => {
      const now = Date.now()
      const endAt = auction.endsAt === 0 ? now + 38_000 : auction.endsAt
      if (auction.endsAt === 0) setAuction((current) => ({ ...current, endsAt: endAt }))
      setRemaining(Math.max(0, endAt - now))
      return endAt
    }

    start()
    const timer = window.setInterval(() => {
      setAuction((current) => {
        const nextRemaining = Math.max(0, current.endsAt - Date.now())
        setRemaining(nextRemaining)
        return current.status === 'live' && current.endsAt > 0 && nextRemaining === 0 ? { ...current, status: 'closed' } : current
      })
    }, 1000)

    // This event bridge mirrors the Supabase Realtime UPDATE payload shape in preview.
    const channel = 'public:auctions'
    const handleRealtimeUpdate = (event: Event) => {
      const detail = (event as CustomEvent<Partial<Auction> & { ends_at?: string }>).detail
      if (!detail || detail.id !== auction.id) return
      setAuction((current) => ({
        ...current,
        ...detail,
        endsAt: detail.ends_at ? new Date(detail.ends_at).getTime() : detail.endsAt ?? current.endsAt,
      }))
    }
    window.addEventListener(channel, handleRealtimeUpdate)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener(channel, handleRealtimeUpdate)
    }
  }, [auction.id])

  function updateAuctionSchedule(value: string) {
    const endsAt = new Date(value).getTime()
    if (!Number.isFinite(endsAt)) return
    window.dispatchEvent(new CustomEvent('public:auctions', { detail: { id: auction.id, ends_at: new Date(endsAt).toISOString() } }))
    setMessage('Inventory update synced to the live auction channel.')
  }

  function placeBid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(bid)
    if (auction.status !== 'live') return setMessage('This auction has closed.')
    if (!Number.isFinite(amount) || amount <= Math.max(auction.currentBid, auction.minBid)) return setMessage(`Enter more than ${money(Math.max(auction.currentBid, auction.minBid))}.`)
    setAuction((current) => ({ ...current, currentBid: amount, bidder: 'You***' }))
    const newActivity: Activity = { text: `You are leading at ${money(amount)}`, time: 'just now', tone: 'accent' }
    setActivity((current) => [newActivity, ...current].slice(0, 5))
    setBid('')
    setMessage('Bid accepted. You are leading.')
  }

  function buyNow() {
    if (!auction.buyNow || auction.status !== 'live') return
    setAuction((current) => ({ ...current, status: 'sold', currentBid: current.buyNow ?? current.currentBid, bidder: 'You***' }))
    setActivity((current) => [{ text: `You bought this lot for ${money(auction.buyNow!)}`, time: 'just now', tone: 'accent' }, ...current])
    setMessage('Sold. Your instant checkout is ready.')
  }

  function createListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const minBid = Number(draft.minBid)
    const endsAt = new Date(draft.endsAt).getTime()
    if (!draft.name || !minBid || !endsAt) return
    setAuction({ id: crypto.randomUUID(), name: draft.name, description: draft.description, image: draft.image || '/products/action-figure.png', seller: 'Carolina Cache', minBid, currentBid: minBid, bidder: 'No bids yet', buyNow: draft.buyNow ? Number(draft.buyNow) : undefined, type: draft.type as 'live' | 'static', endsAt, status: 'live' })
    setView(draft.type as 'live' | 'static')
    setShowListing(false)
    setDraft({ name: '', description: '', image: '', minBid: '', buyNow: '', type: 'static', endsAt: '' })
  }

  return (
    <section aria-labelledby="live-auctions-heading" className="border-y border-neutral-800 bg-neutral-950 px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400"><Radio className="size-3 animate-pulse" /> Carolina Cache auctions</div><h2 id="live-auctions-heading" className="max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">Live &amp; timed drops.</h2><p className="mt-4 max-w-xl text-sm text-neutral-400">Rapid-fire live rooms and static high-bid auctions, synced in real time.</p></div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-800 pb-4"><button onClick={() => setView('live')} className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${view === 'live' ? 'bg-red-600' : 'text-neutral-500'}`}>Live streams</button><button onClick={() => setView('static')} className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${view === 'static' ? 'bg-red-600' : 'text-neutral-500'}`}>Timed drop auctions</button></div>

        {false && <form onSubmit={createListing} className="mb-6 grid gap-3 border border-neutral-800 bg-neutral-900 p-5 sm:grid-cols-2 lg:grid-cols-3"><label className="text-xs text-neutral-400">Product name<input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white" /></label><label className="text-xs text-neutral-400">Description<input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white" /></label><label className="text-xs text-neutral-400">Image URL<input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white" /></label><label className="text-xs text-neutral-400">Minimum starting bid<input required type="number" min="1" value={draft.minBid} onChange={(e) => setDraft({ ...draft, minBid: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white" /></label><label className="text-xs text-neutral-400">Buy It Now price<input type="number" min="1" value={draft.buyNow} onChange={(e) => setDraft({ ...draft, buyNow: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white" /></label><label className="text-xs text-neutral-400">Auction end date/time<input required type="datetime-local" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white" /></label><label className="text-xs text-neutral-400">Auction type<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm text-white"><option value="static">Static high-bid</option><option value="live">Live stream</option></select></label><button className="self-end bg-red-600 p-3 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-red-500">Publish listing</button></form>}

        {false && <div className="mb-6 flex flex-col gap-4 border border-neutral-800 bg-neutral-900 p-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">Seller execution panel</p><h3 className="mt-2 text-lg font-black uppercase tracking-[-0.03em]">Manage live inventory</h3><p className="mt-1 text-xs text-neutral-500">Update the close time without interrupting bids or sessions.</p></div><label className="w-full text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400 sm:max-w-xs">Auction ends at<input type="datetime-local" defaultValue={new Date(auction.endsAt).toISOString().slice(0, 16)} onChange={(event) => updateAuctionSchedule(event.target.value)} className="mt-2 w-full border border-neutral-700 bg-neutral-950 p-3 text-sm font-normal tracking-normal text-white" /></label></div>}

        <div className="grid min-w-0 overflow-hidden border border-neutral-800 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="flex min-w-0 min-h-[390px] flex-col bg-zinc-900 bg-[url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1600&q=90')] bg-cover bg-center bg-blend-soft-light p-5 text-zinc-100 sm:p-8 lg:p-10"><div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-950/15 pb-5"><div className="flex min-w-0 items-center gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden bg-neutral-950/10"><img src={auction.image} alt={`${auction.name} auction listing`} className="size-full object-cover" /><ImageIcon className="sr-only" aria-hidden="true" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Current lot</p><p className="mt-1 truncate text-sm font-black uppercase">{auction.id}</p></div></div><div className="inline-flex shrink-0 items-center gap-2 bg-red-600 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white"><span className="size-2 animate-pulse rounded-full bg-white" /> {auction.status === 'live' ? 'LIVE' : auction.status === 'sold' ? 'SOLD' : 'CLOSED'}</div></div><div className="flex flex-1 flex-col justify-between gap-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{view === 'live' ? 'Live room / sudden death' : 'Timed drop / high bid'}</p><h3 className="mt-3 max-w-lg text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-6xl">{auction.name}</h3><p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300">{auction.description}</p><p className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400"><UserRound className="size-3" /> Seller: {auction.seller}</p></div><div className="flex flex-wrap items-end justify-between gap-6 border-t border-neutral-950/15 pt-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Highest bid · {auction.bidder}</p><p className="mt-1 text-5xl font-black tracking-[-0.07em]">{money(auction.currentBid)}</p><p className="text-xs font-bold text-zinc-400">Reserve: {money(auction.minBid)}</p></div><div className="flex items-center gap-2 text-right"><TimerReset className="size-5" /><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">{auction.status === 'closed' ? 'Winner' : 'Closes in'}</p><p className="font-mono text-xl font-bold tabular-nums">{auction.status === 'closed' ? auction.bidder : `${time.days}d ${String(time.hours).padStart(2, '0')}h ${String(time.minutes).padStart(2, '0')}m ${String(time.seconds).padStart(2, '0')}s`}</p></div></div></div></div></div>
          <aside aria-label="Auction activity" className="flex min-w-0 flex-col bg-neutral-900 p-5 sm:p-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4"><p className="text-xs font-bold uppercase tracking-[0.18em]">Bidding activity</p><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">● realtime</span></div><div className="flex-1 space-y-4">{activity.map((entry, index) => <div key={`${entry.text}-${index}`} className="flex items-start justify-between gap-3 text-sm"><div><p className={entry.tone === 'accent' ? 'font-bold text-red-400' : 'font-bold text-white'}>{entry.text}</p><p className="text-xs text-neutral-500">{entry.time}</p></div><span className="text-zinc-400">↗</span></div>)}</div><form onSubmit={placeBid} className="mt-8 border-t border-neutral-800 pt-6"><label htmlFor="auction-bid" className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Place sudden death bid</label><div className="flex flex-col gap-2 min-[420px]:flex-row"><div className="flex min-w-0 flex-1 items-center border border-neutral-700 bg-neutral-950 px-3"><span className="text-neutral-500">$</span><input id="auction-bid" value={bid} onChange={(e) => setBid(e.target.value)} inputMode="decimal" type="number" min={auction.currentBid + 1} placeholder={String(auction.currentBid + 1)} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-zinc-400" /></div><button disabled={auction.status !== 'live'} className="shrink-0 bg-red-600 px-3 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">Place bid</button></div></form>{auction.buyNow && <button onClick={buyNow} disabled={auction.status !== 'live'} className="mt-3 inline-flex items-center justify-center gap-2 border border-amber-500 px-3 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-amber-400 hover:bg-amber-500 hover:text-zinc-100 disabled:opacity-50"><ShoppingBag className="size-3" /> Buy It Now · {money(auction.buyNow)}</button>}{message && <p role="status" className="mt-3 text-xs text-red-300">{message}</p>}</aside>
        </div>
        <p className="mt-5 text-xs text-neutral-500">Supabase Realtime-ready state: bids, close events, inventory updates, and buyouts are modeled as async broadcast events.</p>
      </div>
    </section>
  )
}
