import { ArrowDownRight, ArrowUpRight, Menu, Search, ShoppingBag } from 'lucide-react'
import { LiveAuction } from '@/components/live-auction'
import { ProductGrid } from '@/components/product-grid'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f5f5f2] text-neutral-950">
      <header>
        <div className="border-b border-neutral-200 bg-neutral-950 px-5 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white">Curated objects. Considered collecting. Free shipping over $150.</div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <a href="#top" className="text-lg font-black tracking-[-0.06em]">Carolina <span className="text-emerald-700">Cache</span></a>
        <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] md:flex"><a className="hover:text-emerald-700" href="#collection">Shop</a><a className="hover:text-emerald-700" href="#story">Our story</a><a className="hover:text-emerald-700" href="#journal">Journal</a></nav>
        <div className="flex items-center gap-4"><button aria-label="Search" className="hidden sm:block"><Search className="size-4" /></button><button aria-label="Shopping bag"><ShoppingBag className="size-4" /></button><button aria-label="Open menu" className="md:hidden"><Menu className="size-5" /></button></div>
      </div>
      </header>
      <main>
      <section id="top" className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-10 lg:pb-28 lg:pt-20">
        <div><p className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">A considered marketplace</p><h1 className="max-w-3xl text-6xl font-black leading-[0.9] tracking-[-0.075em] sm:text-8xl">Objects with <span className="text-emerald-700">a story.</span></h1></div>
        <div className="max-w-sm lg:justify-self-end"><p className="text-lg leading-relaxed text-neutral-600">A rotating edit of rare finds, iconic designs, and everyday objects worth keeping around.</p><a href="#collection" className="mt-8 inline-flex items-center gap-2 border-b border-neutral-950 pb-2 text-xs font-bold uppercase tracking-[0.15em] hover:border-emerald-700 hover:text-emerald-700">Explore the collection <ArrowDownRight className="size-4" /></a></div>
      </section>
      <div className="overflow-hidden border-y border-neutral-200 bg-emerald-700 py-3 text-center text-[10px] font-bold uppercase tracking-[0.26em] text-white">New arrivals / collectible design / built to last / New arrivals / collectible design / built to last</div>
      <ProductGrid />
      <section id="story" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-28"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Why material/form</p><div><h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-[-0.05em] sm:text-5xl">Good things get better with time.</h2><p className="mt-6 max-w-xl leading-relaxed text-neutral-600">We believe the best objects earn their place. Every piece is checked, catalogued, and chosen for a life beyond the moment.</p><a href="#collection" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">See all pieces <ArrowUpRight className="size-4" /></a></div></section>
      <LiveAuction />
      <footer id="journal" className="border-t border-neutral-200 px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 sm:flex-row"><span>© 2026 Carolina Cache</span><span>Made for the curious</span></div></footer>
      </main>
    </div>
  )
}
