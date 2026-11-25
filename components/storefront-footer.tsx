import Link from 'next/link'
import { publicContactEmail } from '@/lib/email-config'

const footerLinkClass = 'text-sm text-[#625f57] transition hover:text-[#1B4332] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B4332]'

export function StorefrontFooter() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Carolina Cache',
    url: 'https://carolinacache.com',
    potentialAction: { '@type': 'SearchAction', target: 'https://carolinacache.com/search?q={search_term_string}', 'query-input': 'required name=search_term_string' },
  }

  return <footer className="border-t border-[#e7e1d5] bg-[#F7F4EC] text-[#1F2421]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] lg:gap-12">
        <section aria-labelledby="footer-brand">
          <a href="#top" aria-label="Carolina Cache home" className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CCHEADER-UCvPQYQYJMaBnokhLOUiEPWfP4sB6S.jpg" alt="" className="size-full scale-[1.55] object-cover" /></span>
            <h2 id="footer-brand" className="font-serif text-2xl font-semibold tracking-[-0.05em]">Carolina <span className="text-[#1B4332]">Cache</span></h2>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#625f57]">Hand-sourced, thoughtfully curated resale finds for collectors and the curious.</p>
          <a href={`mailto:${publicContactEmail}?subject=Newsletter%20signup`} className="mt-4 inline-flex border-b border-[#1B4332] pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#1B4332] hover:text-[#1F2421]">Notes from the Cache</a>
        </section>
        <nav aria-label="Quick links">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F2421]">Quick links</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li><Link className={footerLinkClass} href="/#collection">Shop all</Link></li>
            <li><Link className={footerLinkClass} href="/#live-auctions">Live auctions</Link></li>
            <li><Link className={footerLinkClass} href="/#request">Source an item</Link></li>
            <li><a className={footerLinkClass} href={`mailto:${publicContactEmail}?subject=Rewards%20Club`}>Rewards club</a></li>
          </ul>
        </nav>
        <nav aria-label="Support">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F2421]">Support</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li><a className={footerLinkClass} href={`mailto:${publicContactEmail}`}>Contact</a></li>
            <li><Link className={footerLinkClass} href="/checkout">Insured shipping &amp; returns</Link></li>
            <li><a className={footerLinkClass} href={`mailto:${publicContactEmail}?subject=Authentication%20guarantee`}>Authentication guarantee</a></li>
          </ul>
        </nav>
        <nav aria-label="Legal and payment methods">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F2421]">Legal</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li><Link className={footerLinkClass} href="/terms">Terms</Link></li>
            <li><Link className={footerLinkClass} href="/privacy">Privacy</Link></li>
            <li><Link className={footerLinkClass} href="/accessibility">Accessibility</Link></li>
          </ul>

        </nav>
      </div>
      <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#e7e1d5] pt-5 text-xs text-[#625f57] sm:flex-row"><span>© 2026 Carolina Cache</span><span>Hand-sourced, chosen to be kept.</span></div>
    </div>
  </footer>
}
