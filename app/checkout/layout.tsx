import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your Carolina Cache purchase with secure, insured checkout.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
