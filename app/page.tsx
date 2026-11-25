import { ArrowDownRight } from 'lucide-react'
import { LiveAuction } from '@/components/live-auction'
import { MediaHub } from '@/components/media-hub'
import { ProductGrid } from '@/components/product-grid'
import { CategoryShowcase, MarketingHooks, RequestHub, StorefrontHeader, StorefrontSearchProvider } from '@/components/storefront-sections'
import { StorefrontFooter } from '@/components/storefront-footer'
import { StorefrontContentSync } from '@/components/storefront-content-sync'
import { SiteVideoShowcase } from '@/components/site-video-showcase'

export const metadata = {
  title: 'Rare Collectibles, Trading Cards & Vintage Finds',
  description: 'Explore Carolina Cache for rare trading cards, vintage toys, electronics, stamps, postcards, and one-of-a-kind objects.',
  alternates: { canonical: '/' },
  openGraph: { title: 'Rare Collectibles, Trading Cards & Vintage Finds', description: 'A curated archive of rare collectibles and vintage finds.', type: 'website', images: ['/products/trading-card.png'] },
}

export default function Page() {
  const websiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Carolina Cache', url: 'https://carolinacache.com', potentialAction: { '@type': 'SearchAction', target: 'https://carolinacache.com/?q={search_term_string}', 'query-input': 'required name=search_term_string' } }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
 <StorefrontSearchProvider><div id="top" className="min-h-screen bg-[#F7F4EC] text-[#1F2421]">
    <StorefrontContentSync />
    <a data-site-content="announcement_text" href="#collection" className="block border-b border-[#e7e1d5] bg-[#F7F4EC] px-5 py-2 text-center text-[10px] font-medium tracking-[0.08em] text-[#625f57]">Complimentary insured shipping on qualifying orders</a>
    <StorefrontHeader />
    <main>
      <section data-site-hero className="relative overflow-hidden bg-neutral-950 bg-cover bg-center px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-20"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-end"><div><p className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">The Carolina Cache collection</p><h1 data-site-content="hero_headline" className="max-w-4xl text-6xl font-black leading-[0.86] tracking-[-0.08em] sm:text-8xl lg:text-9xl">Rare finds.<br /><span data-hero-accent className="text-emerald-400">Curated weekly.</span></h1></div><div className="max-w-sm lg:justify-self-end"><p data-site-content="hero_subtitle" className="text-lg leading-relaxed text-neutral-300">High-end collectibles, vintage toys, trading cards, and objects with a story.</p><a href="#collection" className="mt-8 inline-flex items-center gap-2 border-b border-white pb-2 text-xs font-bold uppercase tracking-[0.15em] hover:border-emerald-400 hover:text-emerald-400">Shop the archive <ArrowDownRight className="size-4" /></a></div></div></section>
      <MarketingHooks />
      <CategoryShowcase />
      <ProductGrid />
      <LiveAuction />
      <RequestHub />
      <MediaHub />
      <SiteVideoShowcase />
    </main>
    <StorefrontFooter />
  </div></StorefrontSearchProvider></>
}
