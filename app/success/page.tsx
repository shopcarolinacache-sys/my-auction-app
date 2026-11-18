import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f2] px-5 py-16">
      <section className="w-full max-w-xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Order confirmed</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Thanks for your purchase.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600">Your payment was successful. We&apos;ll begin preparing your order and send confirmation details shortly.</p>
        <Link href="/#collection" className="mt-8 inline-flex bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-emerald-700">Continue shopping</Link>
      </section>
    </main>
  )
}
