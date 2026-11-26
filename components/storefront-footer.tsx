import Link from 'next/link'
import { publicContactEmail } from '@/lib/email-config'
import { NewsletterSignup } from '@/components/newsletter-signup'

const footerLinkClass = 'text-sm text-zinc-400 transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400'

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
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <section aria-labelledby="footer-brand">
          <h2 id="footer-brand" className="font-serif text-3xl font-black tracking-[-0.07em] text-white">Carolina Cache</h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">A considered archive of rare finds, collector-grade objects, and Carolina stories. Curated for the curious, sourced with care.</p>
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-200">Notes from the Cache</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">New arrivals and early access, delivered occasionally.</p>
            <NewsletterSignup />
          </div>
        </section>
        <nav aria-label="Quick links">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Quick links</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li><Link className={footerLinkClass} href="/#collection">Shop all</Link></li>
            <li><Link className={footerLinkClass} href="/#live-auctions">Live auctions</Link></li>
            <li><Link className={footerLinkClass} href="/#request">Source an item</Link></li>
            <li><a className={footerLinkClass} href={`mailto:${publicContactEmail}?subject=Rewards%20Club`}>Rewards club</a></li>
          </ul>
        </nav>
        <nav aria-label="Support">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Support</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li><a className={footerLinkClass} href={`mailto:${publicContactEmail}`}>Contact</a></li>
            <li><Link className={footerLinkClass} href="/checkout">Insured shipping &amp; returns</Link></li>
            <li><a className={footerLinkClass} href={`mailto:${publicContactEmail}?subject=Authentication%20guarantee`}>Authentication guarantee</a></li>
          </ul>
        </nav>
        <nav aria-label="Legal and payment methods">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Legal &amp; payments</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li><Link className={footerLinkClass} href="/terms">Terms</Link></li>
            <li><Link className={footerLinkClass} href="/privacy">Privacy</Link></li>
            <li><Link className={footerLinkClass} href="/accessibility">Accessibility</Link></li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold tracking-wide text-zinc-300" aria-label="Accepted payment methods">
            <span className="border border-zinc-700 px-2 py-1">VISA</span><span className="border border-zinc-700 px-2 py-1">MC</span><span className="border border-zinc-700 px-2 py-1">AMEX</span><span className="border border-zinc-700 px-2 py-1">APPLE PAY</span>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Secure checkout powered by Stripe.</p>
        </nav>
      </div>
      <div className="mt-12 flex flex-col justify-between gap-3 border-t border-zinc-800 pt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 sm:flex-row"><span>© 2026 Carolina Cache</span><span>Made for the curious · Insured shipping</span></div>
    </div>
  </footer>
}
