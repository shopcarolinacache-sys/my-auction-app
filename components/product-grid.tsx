'use client'

import { useState } from 'react'
import { filters, type Filter } from '@/data/products'
import { useInventory } from '@/components/inventory-store'
import { useAdminAuth } from '@/components/admin-auth'
import { ProductCard } from '@/components/product-card'
import { useStorefrontSearch } from '@/components/storefront-sections'

export function ProductGrid() {
  const [active, setActive] = useState<Filter>('all')
  const { searchQuery } = useStorefrontSearch()
  const { visibleItems, openEditor } = useInventory()
  const { authenticated } = useAdminAuth()
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const visible = visibleItems.filter((product) => {
    const matchesCategory = active === 'all' || product.category === active
    const searchableText = `${product.name} ${product.description} ${product.categoryLabel} ${product.condition} ${product.collectorNote ?? ''}`.toLowerCase()
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery))
  })
  return (
    <section id="collection" className="border-y border-neutral-200 bg-[#f5f5f2]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">The collection</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Featured finds</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">A visual edit of the latest Carolina Cache arrivals. Every find is priced, catalogued, and ready to collect.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter collection">
              {filters.map((filter) => <button key={filter.value} role="tab" aria-selected={active === filter.value} onClick={() => setActive(filter.value)} className={`border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${active === filter.value ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-950 hover:text-neutral-950'}`}>{filter.label}</button>)}
            </div>
            {authenticated && <button onClick={() => openEditor()} className="border border-emerald-700 bg-emerald-50 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-900 hover:bg-emerald-100">+ Add item here</button>}
          </div>
        </div>
        {visible.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p role="status" className="border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-600">No finds match that search. Try another term or browse all items.</p>}
      </div>
    </section>
  )
}
