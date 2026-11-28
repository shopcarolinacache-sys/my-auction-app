import type { Metadata } from 'next'
import { StorefrontInfoPage } from '@/components/storefront-info-page'

export const metadata: Metadata = { title: 'Rewards Club', description: 'Discover the Carolina Cache Rewards Club and collector perks.', alternates: { canonical: '/rewards' } }

export default function RewardsPage() {
  return <StorefrontInfoPage title="Good finds deserve good perks.">
    <p>Welcome to the Carolina Cache Rewards Club. The more you shop with us, the more exclusive discounts and special perks you can receive.</p>
    <p>Keep an eye on your email for member-only offers, early access, and thoughtful extras made for collectors like you.</p>
  </StorefrontInfoPage>
}
