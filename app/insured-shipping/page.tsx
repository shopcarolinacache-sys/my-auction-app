import type { Metadata } from 'next'
import { StorefrontInfoPage } from '@/components/storefront-info-page'

export const metadata: Metadata = { title: 'Insured Shipping', description: 'Every order is protected in transit with insured shipping.', alternates: { canonical: '/insured-shipping' } }

export default function InsuredShippingPage() {
  return <StorefrontInfoPage title="Insured shipping, peace of mind.">
    <p>A shipping insurance fee is added at checkout to help protect your order while it is in transit.</p>
    <p>It is one more way we help your finds make their way to you with care and confidence.</p>
  </StorefrontInfoPage>
}
