import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Accessibility', description: 'Accessibility commitment and contact information for Carolina Cache.', alternates: { canonical: '/accessibility' } }

export default function AccessibilityPage() { return <main className="min-h-screen bg-[#f7f7f4] px-5 py-16 text-neutral-950 sm:px-8 lg:px-10"><div className="mx-auto max-w-3xl"><Link href="/" className="font-serif text-2xl font-black">Carolina <span className="text-emerald-700">Cache</span></Link><h1 className="mt-16 text-5xl font-black tracking-tight">Accessibility</h1><p className="mt-6 text-lg leading-relaxed text-neutral-600">We aim to make Carolina Cache usable with keyboards, screen readers, and responsive devices. Report an accessibility issue at hello@carolinacache.com so we can help.</p></div></main> }
