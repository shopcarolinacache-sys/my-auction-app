import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Terms of Service', description: 'Terms for shopping and participating in Carolina Cache sales and auctions.', alternates: { canonical: '/terms' } }

export default function TermsPage() { return <main className="min-h-screen bg-[#f7f7f4] px-5 py-16 text-neutral-950 sm:px-8 lg:px-10"><div className="mx-auto max-w-3xl"><Link href="/" className="font-serif text-2xl font-black">Carolina <span className="text-emerald-700">Cache</span></Link><h1 className="mt-16 text-5xl font-black tracking-tight">Terms of service</h1><p className="mt-6 text-lg leading-relaxed text-neutral-600">Purchases are subject to item descriptions, availability, payment authorization, and the shipping terms shown at checkout. Contact hello@carolinacache.com with questions about an order.</p></div></main> }
