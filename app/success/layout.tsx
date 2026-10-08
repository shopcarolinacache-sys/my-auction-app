import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your Carolina Cache order has been confirmed.',
  alternates: { canonical: '/success' },
  robots: { index: false, follow: false },
}

export default function SuccessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
