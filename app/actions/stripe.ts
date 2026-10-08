'use server'

import { headers } from 'next/headers'
import { products } from '@/data/products'
import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(productId: string) {
  const product = products.find((item) => item.id === productId)
  if (!product || product.stock === 'Sold Out') {
    throw new Error('This product is unavailable.')
  }

  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin') ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: product.price,
      },
      quantity: 1,
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#collection`,
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL.')
  return session.url
}
