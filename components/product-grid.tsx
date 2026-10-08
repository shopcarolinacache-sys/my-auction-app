'use client'

import { useState } from 'react'
import Link from 'next/link'
import { filters, products, type Filter } from '@/data/products'

export function ProductGrid() {
  const [active, setActive] = useState<Filter>('all')
  const visible = active === 'all' ? products : products.filter((product) => product.category === active)
  return (
    <section id="collection" className="border-y border-neutral-200 bg-[#f5f5f2]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">The collection</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Featured finds</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">A visual edit of the latest Carolina Cache arrivals. Open a category to see every item and shop the inventory.</p></div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter collection">
            {filters.map((filter) => <button key={filter.value} role="tab" aria-selected={active === filter.value} onClick={() => setActive(filter.value)} className={`border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${active === filter.value ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-950 hover:text-neutral-950'}`}>{filter.label}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{visible.map((product) => <Link key={product.id} href={`/category/${product.category}`} className="group overflow-hidden border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-950 hover:shadow-xl"><div className="aspect-square overflow-hidden bg-neutral-950"><img src={product.image} alt={`${product.name} teaser — ${product.categoryLabel}, ${product.condition} condition`} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="flex items-center justify-between gap-3 p-4 sm:p-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">{product.categoryLabel}</p><h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900">{product.name}</h3></div><span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">↗</span></div></Link>)}</div>
      </div>
    </section>
  )
}
