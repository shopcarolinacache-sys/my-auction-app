import Link from 'next/link'

export const footerKeywords = [
  { label: 'Vintage postcards', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Rare stamps for sale', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Vintage marbles', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Antique collectibles', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Collectible coins', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Estate sale finds', href: '/category/misc', category: 'Collectibles' },
  { label: 'Vintage photo prints', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Carolina collectibles', href: '/category/collectibles', category: 'Collectibles' },
  { label: 'Retro collectibles', href: '/category/misc', category: 'Collectibles' },
  { label: 'Curated rare objects', href: '/category/misc', category: 'Collectibles' },
  { label: 'Graded sports cards', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Carolina rookie cards', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Vintage baseball cards', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Basketball trading cards', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Football cards', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Rare sports memorabilia', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Rookie cards for sale', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Slabbed sports cards', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Vintage card collections', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Collectible card vaults', href: '/category/sports-trading-cards', category: 'Sports Cards' },
  { label: 'Vintage toys', href: '/category/toys', category: 'Vintage & Antiques' },
  { label: 'Antique toys', href: '/category/toys', category: 'Vintage & Antiques' },
  { label: 'Retro toy collectibles', href: '/category/toys', category: 'Vintage & Antiques' },
  { label: 'Vintage action figures', href: '/category/toys', category: 'Vintage & Antiques' },
  { label: 'Old toy cars', href: '/category/toys', category: 'Vintage & Antiques' },
  { label: 'Mid-century objects', href: '/category/misc', category: 'Vintage & Antiques' },
  { label: 'Vintage home decor', href: '/category/misc', category: 'Vintage & Antiques' },
  { label: 'Antique shop finds', href: '/category/misc', category: 'Vintage & Antiques' },
  { label: 'Heirloom objects', href: '/category/misc', category: 'Vintage & Antiques' },
  { label: 'Nostalgic gifts', href: '/category/toys', category: 'Vintage & Antiques' },
  { label: 'Trading cards online', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Buy rare trading cards', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Rare card packs', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Trading card singles', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Card collecting supplies', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Mint condition cards', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Collectible card deals', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Limited edition cards', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Trading card auctions', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Card collector marketplace', href: '/category/sports-trading-cards', category: 'Trading Cards' },
  { label: 'Rare items for sale', href: '/category/misc', category: 'Rare Items' },
  { label: 'Online auctions', href: '/#live-auction', category: 'Rare Items' },
  { label: 'One of a kind finds', href: '/category/misc', category: 'Rare Items' },
  { label: 'Hard to find collectibles', href: '/category/collectibles', category: 'Rare Items' },
  { label: 'Collector marketplace', href: '/category/collectibles', category: 'Rare Items' },
  { label: 'Rare vintage finds', href: '/category/misc', category: 'Rare Items' },
  { label: 'Curated collectibles', href: '/category/collectibles', category: 'Rare Items' },
  { label: 'Unique gifts for collectors', href: '/category/misc', category: 'Rare Items' },
  { label: 'Auction house finds', href: '/#live-auction', category: 'Rare Items' },
  { label: 'Premium collector goods', href: '/category/collectibles', category: 'Rare Items' },
] as const

const keywordGroups = ['Collectibles', 'Sports Cards', 'Vintage & Antiques', 'Trading Cards', 'Rare Items']

export function StorefrontFooter() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Carolina Cache',
    url: 'https://carolinacache.com',
    potentialAction: { '@type': 'SearchAction', target: 'https://carolinacache.com/search?q={search_term_string}', 'query-input': 'required name=search_term_string' },
  }

  return <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-300">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
        <div><p className="font-serif text-3xl font-black tracking-[-0.07em] text-white">Carolina <span className="text-emerald-400">Cache</span></p><p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">Rare finds, collector-grade objects, and Carolina stories curated for the curious.</p><nav aria-label="Quick links" className="mt-8"><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Quick links</h2><ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm"><li><Link className="transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400" href="/">Home</Link></li><li><Link className="transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400" href="/#categories">Shop categories</Link></li><li><Link className="transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400" href="/#live-auction">Live auctions</Link></li><li><Link className="transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400" href="/#request">Source an item</Link></li></ul></nav></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Top categories &amp; search terms</h2><div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">{keywordGroups.map((group) => <nav key={group} aria-label={`${group} search terms`}><h3 className="text-sm font-semibold text-white">{group}</h3><ul className="mt-3 space-y-2">{footerKeywords.filter((keyword) => keyword.category === group).map((keyword) => <li key={keyword.label}><Link href={keyword.href} className="text-xs leading-5 text-zinc-400 transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">{keyword.label}</Link></li>)}</ul></nav>)}</div></div>
      </div>
      <div className="mt-14 grid gap-8 border-t border-zinc-800 pt-8 sm:grid-cols-3"><nav aria-label="Customer support"><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Help &amp; support</h2><ul className="mt-3 space-y-2 text-sm text-zinc-400"><li><a href="mailto:hello@carolinacache.com" className="hover:text-emerald-300">Contact us</a></li><li><Link href="/checkout" className="hover:text-emerald-300">Shipping &amp; returns</Link></li><li><a href="mailto:hello@carolinacache.com?subject=Order%20support" className="hover:text-emerald-300">Order support</a></li></ul></nav><nav aria-label="Legal"><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Terms &amp; privacy</h2><ul className="mt-3 space-y-2 text-sm text-zinc-400"><li><a href="/terms" className="hover:text-emerald-300">Terms of service</a></li><li><a href="/privacy" className="hover:text-emerald-300">Privacy policy</a></li><li><a href="/accessibility" className="hover:text-emerald-300">Accessibility</a></li></ul></nav><div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Secure payments</h2><div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold tracking-wide text-zinc-300"><span className="border border-zinc-700 px-2 py-1">VISA</span><span className="border border-zinc-700 px-2 py-1">MC</span><span className="border border-zinc-700 px-2 py-1">AMEX</span><span className="border border-zinc-700 px-2 py-1">APPLE PAY</span></div><p className="mt-3 text-xs text-zinc-500">Encrypted checkout powered by Stripe.</p></div></div>
      <div className="mt-10 flex flex-col justify-between gap-3 border-t border-zinc-800 pt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 sm:flex-row"><span>© 2026 Carolina Cache</span><span>Made for the curious · Insured promotional shipping applied at checkout</span></div>
    </div>
  </footer>
}
