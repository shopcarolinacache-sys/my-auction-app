import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CartProvider } from '@/components/cart-drawer'

const siteUrl = 'https://carolinacache.com'
const siteTitle = 'Carolina Cache | Rare Collectibles & Vintage Finds'
const siteDescription = 'Shop rare trading cards, vintage toys, electronics, stamps, postcards, and curious objects at Carolina Cache.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: '%s | Carolina Cache' },
  description: siteDescription,
  keywords: ['rare collectibles', 'vintage collectibles', 'trading cards', 'stamps', 'postcards', 'vintage toys', 'Carolina Cache'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Shop Carolina Cache — Premium Collectibles & Electronics',
    description: 'Premium collectible trading cards, vintage toys, and electronics curated for collectors.',
    type: 'website',
    url: siteUrl,
    siteName: 'Carolina Cache',
    images: [{ url: '/products/trading-card.png', width: 1200, height: 630, alt: 'Carolina Cache rare collectibles' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Carolina Cache — Premium Collectibles & Electronics',
    description: 'Premium collectible trading cards, vintage toys, and electronics curated for collectors.',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
