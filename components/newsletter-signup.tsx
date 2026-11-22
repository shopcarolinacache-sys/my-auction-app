'use client'

import { useState } from 'react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setNotice('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'next-drop', email: email.trim() }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Signup could not be completed.')
      setEmail(''); setNotice('You’re on the list for new drops and live auctions.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Signup could not be completed. Please try again.') }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="mt-3 flex flex-col gap-2"><label htmlFor="newsletter-email" className="sr-only">Email address for new drops and live auctions</label><div className="flex"><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none" /><button disabled={busy} className="shrink-0 bg-emerald-400 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-neutral-950 hover:bg-white disabled:opacity-60">{busy ? 'Joining…' : 'Join'}</button></div>{notice && <p role="status" aria-live="polite" className="text-xs text-emerald-300">{notice}</p>}</form>
}
