'use client'

import { Check, LoaderCircle, Plus } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/stripe'
import type { Product } from '@/data/products'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.STRIPE_PUBLISHABLE_KEY ?? '')

const conditionStyles = {
  'Near Mint': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Mint: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Excellent: 'bg-blue-50 text-blue-700 border-blue-200',
  Refurbished: 'bg-blue-50 text-blue-700 border-blue-200',
}
const stockStyles = { 'In Stock': 'bg-emerald-700', 'Low Stock': 'bg-amber-500', 'Sold Out': 'bg-neutral-400' }

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const soldOut = product.stock === 'Sold Out'

  async function handleAdd() {
    if (soldOut || loading) return
    setLoading(true)
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe could not be loaded.')
      const checkoutUrl = await createCheckoutSession(product.id)
      window.location.assign(checkoutUrl)
    } catch (error) {
      console.error('[v0] Checkout failed:', error)
      setLoading(false)
    }
  }
  return (
    <article className="group flex flex-col overflow-hidden border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-900 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img src={product.image} alt={`${product.name} — ${product.categoryLabel}, ${product.condition} condition`} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${conditionStyles[product.condition]}`}>{product.condition}</span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">{product.categoryLabel}</p>
        <h3 className="min-h-10 text-base font-semibold leading-snug text-neutral-900">{product.name}</h3>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-bold tracking-tight text-neutral-950">${product.price.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500"><span className={`size-1.5 rounded-full ${stockStyles[product.stock]}`} />{product.stock}</p>
          </div>
          <button onClick={handleAdd} disabled={soldOut || loading} aria-label={`${soldOut ? 'Sold out' : 'Quick add'} ${product.name}`} className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${soldOut ? 'cursor-not-allowed bg-neutral-100 text-neutral-400' : loading ? 'cursor-wait bg-neutral-700 text-white' : added ? 'bg-emerald-700 text-white' : 'bg-neutral-950 text-white hover:bg-emerald-700'}`}>
            {loading ? <><LoaderCircle className="size-3.5 animate-spin" />Loading</> : added ? <><Check className="size-3.5" />Added</> : <><Plus className="size-3.5" />Quick add</>}
          </button>
        </div>
      </div>
    </article>
  )
}
