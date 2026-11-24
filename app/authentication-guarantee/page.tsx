import type { Metadata } from 'next'
import { StorefrontInfoPage } from '@/components/storefront-info-page'

export const metadata: Metadata = { title: 'Authentication Guarantee', description: 'Learn about Carolina Cache authentication and contact us with questions.', alternates: { canonical: '/authentication-guarantee' } }

export default function AuthenticationGuaranteePage() {
  return <StorefrontInfoPage title="Authentication guarantee">
    <p>We take care in sourcing and describing every item in the Carolina Cache archive, so you can shop with confidence.</p>
    <p>Have a question about an item? <a className="font-semibold text-emerald-300 underline decoration-emerald-400/50 underline-offset-4 hover:text-white" href="/contact">Get in touch with us</a> and we will be glad to help.</p>
  </StorefrontInfoPage>
}
