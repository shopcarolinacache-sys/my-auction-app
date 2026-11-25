'use client'

import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search, UserRound, ShieldCheck, LogOut, PencilLine } from 'lucide-react'
import { useAdminAuth } from '@/components/admin-auth'
import { categoryCards, marketingHooks } from '@/data/storefront'
import { CartButton } from '@/components/cart-drawer'

type StorefrontSearchContextValue = { searchQuery: string; setSearchQuery: (value: string) => void }
const StorefrontSearchContext = createContext<StorefrontSearchContextValue | null>(null)

export function StorefrontSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  return <StorefrontSearchContext.Provider value={{ searchQuery, setSearchQuery }}>{children}</StorefrontSearchContext.Provider>
}

export function useStorefrontSearch() {
  const value = useContext(StorefrontSearchContext)
  if (!value) throw new Error('useStorefrontSearch must be used inside StorefrontSearchProvider')
  return value
}

export function StorefrontHeader() {
  const { authenticated, openModal, logout } = useAdminAuth()
  const { searchQuery, setSearchQuery } = useStorefrontSearch()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const toggleEditMode = () => {
    const next = !editMode
    setEditMode(next)
    document.body.dataset.adminEditMode = String(next)
    document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p').forEach((element) => {
      element.contentEditable = String(next)
      element.classList.toggle('outline-dashed', next)
      element.classList.toggle('outline-emerald-500', next)
      element.classList.toggle('outline-offset-2', next)
      element.setAttribute('aria-label', next ? 'Editable site text' : '')
    })
  }

  const focusCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
    setSearchOpen(false)
  }

  return <header className="sticky top-0 z-30 border-b border-[#e7e1d5] bg-[#F7F4EC]/95 text-[#1F2421] backdrop-blur-sm">
    <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3 sm:px-8 lg:px-10">
      <a href="#top" aria-label="Carolina Cache home" className="flex min-w-0 shrink-0 items-center gap-2.5">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full sm:size-12"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CCHEADER-UCvPQYQYJMaBnokhLOUiEPWfP4sB6S.jpg" alt="" className="size-full scale-[1.55] object-cover" /></span>
        <span className="hidden whitespace-nowrap font-serif text-[1.65rem] font-bold leading-none tracking-[-0.06em] sm:inline">Carolina <span className="text-[#1B4332]">Cache</span></span>
      </a>
      <nav aria-label="Primary navigation" className="hidden items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.08em] sm:flex lg:gap-5 lg:text-[10px] lg:tracking-[0.13em]">
        <a className="transition hover:text-[#1B4332]" href="#collection">Shop</a>
        <a className="transition hover:text-[#1B4332]" href="#live-auctions">Auctions</a>
        <a className="transition hover:text-[#1B4332]" href="#request">Source an item</a>
      </nav>
      <form onSubmit={focusCollection} role="search" className="hidden min-w-0 flex-1 md:flex">
        <label htmlFor="desktop-search" className="mx-auto flex w-full max-w-sm items-center gap-3 border-b border-[#c9c3b7] px-2 py-2 text-sm">
          <Search aria-hidden="true" className="size-4 shrink-0 text-neutral-500" />
          <input id="desktop-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the archive" className="w-full bg-transparent outline-none placeholder:text-neutral-500" />
          <button type="submit" className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 transition hover:text-[#1B4332]">Search</button>
        </label>
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <button type="button" aria-label="Open search" aria-expanded={searchOpen} aria-controls="mobile-search" onClick={() => setSearchOpen((current) => !current)} className="grid size-9 place-items-center text-neutral-700 transition hover:text-[#1B4332] md:hidden"><Search className="size-4" /></button>
        <div className="relative">
          <button type="button" aria-label="Account" aria-haspopup="true" aria-expanded={profileOpen} onClick={() => authenticated ? setProfileOpen((current) => !current) : openModal()} className="grid size-9 place-items-center text-neutral-700 transition hover:text-[#1B4332]"><UserRound className="size-4" />{authenticated && <span className="absolute right-0 top-0 size-2 rounded-full bg-emerald-700" />}</button>
          {authenticated && profileOpen && <div className="absolute right-0 top-full z-40 mt-3 w-60 border border-neutral-200 bg-white p-2 text-neutral-900 shadow-xl"><div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-3"><ShieldCheck className="size-4 text-emerald-700" /><span className="text-xs font-bold normal-case tracking-normal">Admin Mode</span></div><button type="button" onClick={toggleEditMode} className="flex w-full items-center gap-2 px-3 py-3 text-left text-xs font-semibold normal-case tracking-normal hover:bg-neutral-50"><PencilLine className="size-4" />{editMode ? 'Turn off inline editing' : 'Edit site content inline'}</button><Link href="/admin" onClick={() => setProfileOpen(false)} className="block px-3 py-3 text-xs font-semibold normal-case tracking-normal hover:bg-neutral-50">Open Admin Panel</Link><button type="button" onClick={() => { logout(); setProfileOpen(false); setEditMode(false); delete document.body.dataset.adminEditMode; document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p').forEach((element) => { element.contentEditable = 'false'; element.classList.remove('outline-dashed', 'outline-emerald-500', 'outline-offset-2') }) }} className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-3 text-left text-xs font-semibold normal-case tracking-normal text-neutral-500 hover:text-neutral-900"><LogOut className="size-4" />Sign out</button></div>}
        </div>
        <CartButton />
      </div>
      {searchOpen && <form id="mobile-search" onSubmit={focusCollection} role="search" className="absolute inset-x-0 top-full border-b border-[#e7e1d5] bg-[#F7F4EC] px-4 pb-3 md:hidden">
        <label htmlFor="mobile-search-input" className="flex items-center gap-3 border border-neutral-300 bg-white px-4 py-2.5 text-sm">
          <Search aria-hidden="true" className="size-4 shrink-0 text-neutral-500" />
          <input id="mobile-search-input" type="search" autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the archive" className="w-full bg-transparent outline-none placeholder:text-neutral-400" />
          <button type="submit" className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-emerald-800">Search</button>
        </label>
      </form>}
    </div>
  </header>
}

export function MarketingHooks() {
  return <section aria-label="Why shop Carolina Cache" className="border-y border-neutral-200 bg-white"><div className="mx-auto grid max-w-7xl md:grid-cols-3">{marketingHooks.map((hook) => <article key={hook.number} className="border-b border-neutral-200 p-6 last:border-0 md:border-b-0 md:border-r md:p-8 md:last:border-r-0"><span className="text-[10px] font-bold text-emerald-700">{hook.number}</span><h2 className="mt-10 text-2xl font-black uppercase tracking-[-0.05em]">{hook.title}</h2><p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-600">{hook.copy}</p></article>)}</div></section>
}

export function CategoryShowcase() {
  return <section id="categories" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Browse the edit</p><h2 className="mt-3 text-4xl font-black tracking-[-0.07em] sm:text-6xl">Find your next favorite.</h2></div><a href="#collection" className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest sm:flex">View all <ArrowUpRight className="size-4" /></a></div><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{categoryCards.map((category, index) => <Link key={category.id} href={`/category/${category.id}`} className={`group relative min-h-64 overflow-hidden bg-neutral-900 ${index === 0 ? 'col-span-2 row-span-2 min-h-[32rem]' : index === 4 ? 'col-span-2 lg:col-span-1' : ''}`}><img src={category.image} alt={`${category.title} collection at Carolina Cache`} className="absolute inset-0 size-full object-cover opacity-80 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:opacity-100" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">{category.eyebrow}</p><h3 className="mt-2 text-xl font-black tracking-[-0.04em]">{category.title}</h3></div></Link>)}</div></section>
}

export function RequestHub() {
  const [requestNotice, setRequestNotice] = useState('')
  const [requestSending, setRequestSending] = useState(false)
  const [requestError, setRequestError] = useState(false)

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requestSending) return

    const form = event.currentTarget
    const formData = new FormData(form)
    setRequestSending(true)
    setRequestError(false)
    setRequestNotice('Sending your request...')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'source-request',
          item: String(formData.get('item-title') ?? ''),
          budget: String(formData.get('max-budget') ?? ''),
          email: String(formData.get('request-email') ?? ''),
          details: String(formData.get('request-details') ?? ''),
          website: String(formData.get('website') ?? ''),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'We could not send your request.')
      setRequestError(false)
      setRequestNotice('Request sent. We’ll be in touch by email.')
      form.reset()
    } catch (error) {
      setRequestError(true)
      setRequestNotice(error instanceof Error ? error.message : 'We could not send your request. Please try again.')
    } finally {
      setRequestSending(false)
    }
  }

  return <section id="request" className="bg-neutral-950 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">The request hub</p><h2 className="mt-4 max-w-2xl text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl">Can&apos;t find it? <span className="text-emerald-400">We source it.</span></h2><p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-400">Tell us what belongs in your collection. Our network is always looking for the next exceptional object.</p></div><form className="grid gap-3" onSubmit={submitRequest}><label className="sr-only" htmlFor="item-title">Item title</label><input id="item-title" name="item-title" required placeholder="Item title" className="border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400" /><label className="sr-only" htmlFor="max-budget">Maximum budget</label><input id="max-budget" name="max-budget" required type="number" min="1" step="0.01" inputMode="decimal" placeholder="Maximum budget" className="border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400" /><label className="sr-only" htmlFor="request-email">Your email</label><input id="request-email" name="request-email" type="email" required placeholder="Your email address" className="border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400" /><label className="sr-only" htmlFor="request-details">Additional details</label><textarea id="request-details" name="request-details" rows={3} placeholder="Anything else we should know?" className="resize-y border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400" /><input aria-hidden="true" tabIndex={-1} autoComplete="off" name="website" className="sr-only" /><button disabled={requestSending} className="bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-70" type="submit">{requestSending ? 'Sending request...' : 'Send request'} <ArrowUpRight className="ml-2 inline size-4" /></button>{requestNotice && <p role={requestError ? 'alert' : 'status'} aria-live="polite" className={`border px-4 py-3 text-sm ${requestError ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}`}>{requestNotice}</p>}<p className="text-xs text-neutral-500">Your request is sent securely to our team. We only use your email to reply.</p></form></div></section>
}
