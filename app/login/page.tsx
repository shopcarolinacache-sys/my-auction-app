import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Secure sign in for Carolina Cache admin access.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-5 py-12 text-zinc-100"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_30%)]" /><div className="relative z-10 flex w-full max-w-md flex-col items-center"><Link href="/" className="mb-8 text-2xl font-black tracking-[-0.07em] text-white">Carolina <span className="text-emerald-400">Cache</span></Link><LoginForm /><Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-200"><ArrowLeft className="size-3.5" /> Return to storefront</Link></div></main>
}
