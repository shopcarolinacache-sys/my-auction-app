import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Privacy Policy', description: 'Privacy information for Carolina Cache visitors and customers.', alternates: { canonical: '/privacy' } }

export default function PrivacyPage() { return <main className="min-h-screen bg-[#f7f7f4] px-5 py-16 text-neutral-950 sm:px-8 lg:px-10"><div className="mx-auto max-w-3xl"><Link href="/" className="font-serif text-2xl font-black">Carolina <span className="text-emerald-700">Cache</span></Link><h1 className="mt-16 text-5xl font-black tracking-tight">Privacy policy</h1><p className="mt-6 text-lg leading-relaxed text-neutral-600">Carolina Cache uses information needed to provide checkout, order support, and site functionality. Email hello@carolinacache.com for privacy questions or data requests.</p></div></main> }
