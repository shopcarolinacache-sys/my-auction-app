'use client'

import { useState } from 'react'
import { filters, products, type Filter } from '@/data/products'
import { ProductCard } from './product-card'

export function ProductGrid() {
  const [active, setActive] = useState<Filter>('all')
  const visible = active === 'all' ? products : products.filter((product) => product.category === active)
  return (
    <section id="collection" className="border-y border-neutral-200 bg-[#f5f5f2]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">The collection</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Featured finds</h2></div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter collection">
            {filters.map((filter) => <button key={filter.value} role="tab" aria-selected={active === filter.value} onClick={() => setActive(filter.value)} className={`border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${active === filter.value ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-950 hover:text-neutral-950'}`}>{filter.label}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>
  )
}
