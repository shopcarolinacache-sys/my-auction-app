import Link from 'next/link'
import { publicContactEmail } from '@/lib/email-config'

type SuccessPageProps = { searchParams: Promise<{ email?: string }> }

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { email } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f2] px-5 py-16">
      <section className="w-full max-w-xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Order confirmed</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Thanks for your purchase.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600">Your payment was successful. We&apos;ll begin preparing your order.</p>
        {email === 'sent' ? (
          <p role="status" className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-700">Your order confirmation email is on its way.</p>
        ) : email === 'unavailable' ? (
          <p role="status" className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">We couldn&apos;t send your confirmation email. You can reach us at <a className="font-semibold underline" href={`mailto:${publicContactEmail}`}>{publicContactEmail}</a>.</p>
        ) : null}
        <Link href="/#collection" className="mt-8 inline-flex bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-emerald-700">Continue shopping</Link>
      </section>
    </main>
  )
}
