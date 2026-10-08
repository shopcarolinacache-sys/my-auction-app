'use client'

import Link from 'next/link'
import { ArrowUpRight, Search, UserRound } from 'lucide-react'
import { categoryCards, marketingHooks } from '@/data/storefront'
import { CartButton } from '@/components/cart-drawer'

export function StorefrontHeader() {
  return <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#f7f7f4]/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4 sm:px-8 lg:px-10">
      <a href="#top" className="shrink-0 font-serif text-2xl font-black tracking-[-0.07em] sm:text-3xl">Carolina <span className="text-emerald-700">Cache</span></a>
      <div className="hidden flex-1 md:block"><label className="mx-auto flex max-w-xl items-center gap-3 border border-neutral-300 bg-white px-4 py-2.5 text-sm"><Search className="size-4 text-neutral-500" /><input aria-label="Search inventory" placeholder="Search the archive" className="w-full bg-transparent outline-none placeholder:text-neutral-400" /><span className="border-l border-neutral-200 pl-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">All</span></label></div>
      <nav className="ml-auto flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] sm:gap-6"><a className="hidden hover:text-emerald-700 sm:block" href="#categories">Shop</a><a className="hidden hover:text-emerald-700 sm:block" href="#request">Source</a><button aria-label="Account"><UserRound className="size-4" /></button><CartButton /></nav>
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
  return <section id="request" className="bg-neutral-950 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">The request hub</p><h2 className="mt-4 max-w-2xl text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl">Can&apos;t find it? <span className="text-emerald-400">We source it.</span></h2><p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-400">Tell us what belongs in your collection. Our network is always looking for the next exceptional object.</p></div><form className="grid gap-3" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="item-title">Item title</label><input id="item-title" required placeholder="Item title" className="border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400" /><label className="sr-only" htmlFor="max-budget">Maximum budget</label><input id="max-budget" required inputMode="decimal" placeholder="Maximum budget" className="border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-400" /><button className="bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-950 transition hover:bg-white" type="submit">Submit request <ArrowUpRight className="ml-2 inline size-4" /></button></form></div></section>
}
