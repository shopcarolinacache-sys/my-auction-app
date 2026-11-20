'use client'

import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/data/products'
import { useCart, AddToCartButton } from '@/components/cart-drawer'
import { useAdminAuth } from '@/components/admin-auth'
import { useInventory } from '@/components/inventory-store'

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
  const [showDetails, setShowDetails] = useState(false)
  const soldOut = product.stock === 'Sold Out'
  const { add } = useCart()
  const { authenticated } = useAdminAuth()
  const { items, openEditor, updateItem, removeItem } = useInventory()
  const inventoryItem = items.find((item) => item.id === product.id)

  function handleAdd() {
    if (soldOut || loading) return
    setLoading(true)
    add(product)
    setAdded(true)
    window.setTimeout(() => { setLoading(false); setAdded(false) }, 1200)
  }
  return (
    <>
    <article className="group flex flex-col overflow-hidden border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-900 hover:shadow-xl">
      <div className="group relative aspect-square overflow-hidden bg-neutral-100">
        <img src={product.image} alt={`${product.name} — ${product.categoryLabel}, ${product.condition} condition`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/products/trading-card.png' }} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${conditionStyles[product.condition]}`}>{product.condition}</span>
        <span className="absolute right-3 top-3 border border-white/20 bg-neutral-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">{product.collectorNote ?? 'Curated find'}</span>
        {authenticated && inventoryItem && <div className="absolute inset-x-3 top-12 z-10 flex gap-1.5"><button onClick={() => openEditor(inventoryItem)} className="bg-white/95 px-2.5 py-2 text-[9px] font-black uppercase tracking-wider text-neutral-950 shadow">Edit</button><button onClick={() => updateItem(inventoryItem.id, { listingStatus: 'Draft' })} className="bg-white/95 px-2.5 py-2 text-[9px] font-black uppercase tracking-wider text-neutral-950 shadow">Hide</button><button onClick={() => { if (window.confirm(`Remove ${product.name} from this session?`)) removeItem(inventoryItem.id) }} className="bg-white/95 px-2.5 py-2 text-[9px] font-black uppercase tracking-wider text-red-700 shadow">Remove</button></div>}
        <AddToCartButton product={product} />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">{product.categoryLabel}</p>
        <h3 className="min-h-10 text-base font-semibold leading-snug text-neutral-900"><Link href={`/category/${product.category}`} className="hover:text-emerald-800">{product.name}</Link></h3>
        <button type="button" onClick={() => setShowDetails(true)} className="mt-2 self-start text-[10px] font-bold uppercase tracking-wider text-neutral-500 underline underline-offset-4 hover:text-emerald-800">View details</button>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-bold tracking-tight text-neutral-950">${product.price.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500"><span className={`size-1.5 rounded-full ${stockStyles[product.stock]}`} />{product.stock}</p>
          </div>
          <button onClick={handleAdd} disabled={soldOut || loading} aria-label={`${soldOut ? 'Sold out' : 'Add to cart'} ${product.name}`} className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${soldOut ? 'cursor-not-allowed bg-neutral-100 text-neutral-400' : loading ? 'cursor-wait bg-neutral-700 text-white' : added ? 'bg-emerald-700 text-white' : 'bg-neutral-950 text-white hover:bg-emerald-700'}`}>
            {loading ? <>Adding</> : added ? <><Check className="size-3.5" />Added</> : <><Plus className="size-3.5" />Add to cart</>}
          </button>
        </div>
      </div>
    </article>
    {showDetails && <div className="fixed inset-0 z-[130] grid place-items-center bg-neutral-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDetails(false) }}><section role="dialog" aria-modal="true" aria-labelledby={`product-detail-${product.id}`} className="w-full max-w-lg border border-neutral-200 bg-[#f7f7f4] p-6 text-neutral-950 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">{product.categoryLabel}</p><h2 id={`product-detail-${product.id}`} className="mt-2 text-2xl font-black tracking-tight">{product.name}</h2></div><button type="button" onClick={() => setShowDetails(false)} aria-label="Close product details" className="border border-neutral-300 bg-white px-3 py-2 text-sm">Close</button></div><p className="mt-4 text-sm leading-relaxed text-neutral-600">{product.description}</p>{product.sku && <p className="mt-5 border-t border-neutral-200 pt-3 font-mono text-xs text-neutral-500">SKU: {product.sku}</p>}</section></div>}
    </>
  )
}
