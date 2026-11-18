'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key ? createClient(url, key) : null
}

const ADMIN_EMAIL = 'admin@carolinacache.com'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signedInEmail, setSignedInEmail] = useState('')

  useEffect(() => {
    let active = true
    const supabase = getSupabaseClient()
    if (supabase) supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user) setSignedInEmail(data.session.user.email ?? '')
    })
    return () => { active = false }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Authentication is not configured for this preview.')
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError || !data.user) {
      setError(authError?.status === 429 ? 'Too many attempts. Please wait a moment and try again.' : 'Invalid email or password.')
      setLoading(false)
      return
    }

    const isAdmin = data.user.app_metadata?.role === 'admin' || data.user.app_metadata?.is_admin === true || data.user.email?.toLowerCase() === ADMIN_EMAIL
    if (!isAdmin) {
      await supabase.auth.signOut()
      setError('This account does not have admin access.')
      setLoading(false)
      return
    }

    setSignedInEmail(data.user.email ?? email)
    router.replace('/admin')
    router.refresh()
  }

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
    setSignedInEmail('')
    setPassword('')
  }

  if (signedInEmail) {
    return <div className="w-full max-w-md border border-zinc-800 bg-zinc-900 p-7 shadow-2xl shadow-black/30 sm:p-9"><div className="flex size-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><ShieldCheck className="size-6" /></div><h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">You&apos;re signed in</h1><p className="mt-2 text-sm text-zinc-400">{signedInEmail}</p><div className="mt-7 grid gap-3"><button type="button" onClick={() => router.push('/admin')} className="bg-emerald-400 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-300">Open admin studio</button><button type="button" onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400"><LogOut className="size-4" /> Sign out</button></div></div>
  }

  return <div className="w-full max-w-md border border-zinc-800 bg-zinc-900 p-7 shadow-2xl shadow-black/30 sm:p-9"><div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300"><ShieldCheck className="size-4" /> Secure admin access</div><h1 className="mt-7 text-3xl font-semibold tracking-tight text-white">Welcome back.</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Sign in to manage inventory, auctions, orders, and customer activity.</p>{error && <div role="alert" className="mt-6 border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}<form className="mt-7 grid gap-5" onSubmit={handleSubmit}><div className="grid gap-2"><label htmlFor="email" className="text-sm font-medium text-zinc-200">Email address</label><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="border border-zinc-700 bg-zinc-950 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" placeholder="you@example.com" /></div><div className="grid gap-2"><label htmlFor="password" className="text-sm font-medium text-zinc-200">Password</label><div className="relative"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-zinc-700 bg-zinc-950 px-3.5 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)} className="absolute right-0 top-0 flex h-full items-center px-3 text-zinc-500 transition hover:text-zinc-200">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div><button type="submit" disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 bg-emerald-400 px-4 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="size-4 animate-spin" />}{loading ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-7 text-center text-xs leading-5 text-zinc-500">Admin access is limited to authorized accounts. Contact an administrator if you need access.</p></div>
}
