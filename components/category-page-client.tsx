'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { LiveAuction } from '@/components/live-auction'
import { getCategory } from '@/data/storefront'
import { products, type Product } from '@/data/products'
import { StorefrontFooter } from '@/components/storefront-footer'

export function CategoryPageClient({ id }: { id: string }) {
  const category = getCategory(id)
  if (!category) return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-center"><div><h1 className="text-4xl font-black tracking-tight">Category not found</h1><Link href="/" className="mt-5 inline-flex text-sm font-bold text-emerald-700">Return to archive</Link></div></main>

  const categoryType = id === 'sports-trading-cards' ? 'cards' : id === 'electronics' ? 'electronics' : id === 'collectibles' ? 'collectibles' : id === 'toys' ? 'toys' : undefined
  const inventory: Product[] = products.filter((product) => product.category === categoryType)

  return <main className="min-h-screen bg-[#f7f7f4] text-neutral-950"><header className="border-b border-neutral-200 bg-[#f7f7f4] px-5 py-5 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="font-serif text-2xl font-black tracking-[-0.07em]">Carolina <span className="text-emerald-700">Cache</span></Link><Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ArrowLeft className="size-3" /> Back to archive</Link></div></header><section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">{category.eyebrow}</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.08em] sm:text-8xl">{category.title}</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">{category.description}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">Insured promotional shipping applied at checkout · Exclusive tier rewards active</p><div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{inventory.length > 0 ? inventory.map((product) => <ProductCard key={product.id} product={product} />) : <div className="col-span-full border border-dashed border-neutral-300 bg-white p-10 text-center"><h2 className="text-xl font-bold">More finds are being catalogued</h2><p className="mt-2 text-sm text-neutral-600">Return to the archive to browse the latest available collection.</p><Link href="/#collection" className="mt-5 inline-flex bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white">Browse featured finds</Link></div>}</div></section><LiveAuction /><StorefrontFooter /></main>
}
