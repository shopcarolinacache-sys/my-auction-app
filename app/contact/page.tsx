import type { Metadata } from 'next'
import { StorefrontInfoPage } from '@/components/storefront-info-page'

export const metadata: Metadata = { title: 'Contact', description: 'Get in touch with Carolina Cache.', alternates: { canonical: '/contact' } }

export default function ContactPage() {
  return <StorefrontInfoPage title="Get in touch">
    <p>A considered archive of rare finds, collector-grade objects, and Carolina stories. Curated for the curious, sourced with care.</p>
    <p>Questions or just want to say hello? Reach us at <a className="font-semibold text-emerald-300 underline decoration-emerald-400/50 underline-offset-4 hover:text-white" href="mailto:hello@shopcarolinacache.com">hello@shopcarolinacache.com</a>.</p>
  </StorefrontInfoPage>
}
