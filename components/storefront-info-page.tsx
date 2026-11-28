import type { ReactNode } from 'react'
import Link from 'next/link'

export function StorefrontInfoPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-950 px-5 py-12 text-zinc-100 sm:px-8 sm:py-16 lg:px-10">
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="font-serif text-3xl font-black tracking-[-0.07em] text-white">Carolina <span className="text-emerald-400">Cache</span></Link>
      <article className="mt-20 border-t border-zinc-800 pt-10 sm:mt-28 sm:pt-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Carolina Cache</p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl">{title}</h1>
        <div className="mt-7 max-w-2xl space-y-5 text-base leading-relaxed text-zinc-300 sm:text-lg">{children}</div>
        <Link href="/" className="mt-10 inline-flex border-b border-emerald-400 pb-2 text-sm font-semibold text-emerald-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">Explore the collection</Link>
      </article>
    </div>
  </main>
}
