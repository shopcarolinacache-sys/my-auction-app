'use client'

import { createContext, FormEvent, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, X } from 'lucide-react'

const SESSION_KEY = 'carolina-cache-admin-authenticated'
const TEST_FALLBACK_PASSWORD = 'admin123'

type AdminAuthContextValue = {
  authenticated: boolean
  ready: boolean
  modalOpen: boolean
  openModal: () => void
  closeModal: () => void
  authenticate: (password: string) => boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return context
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem(SESSION_KEY) === 'true')
    setReady(true)
  }, [])

  const authenticate = useCallback((password: string) => {
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || TEST_FALLBACK_PASSWORD
    if (!password || password !== expectedPassword) return false
    sessionStorage.setItem(SESSION_KEY, 'true')
    setAuthenticated(true)
    setModalOpen(false)
    return true
  }, [])
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthenticated(false)
    setModalOpen(false)
  }, [])

  return <AdminAuthContext.Provider value={{ authenticated: ready && authenticated, ready, modalOpen, openModal, closeModal, authenticate, logout }}>
    {children}
    <AdminPasswordModal open={modalOpen} onClose={() => setModalOpen(false)} onAuthenticate={authenticate} />
  </AdminAuthContext.Provider>
}

export function AdminRouteGate({ children }: { children: ReactNode }) {
  const { authenticated, ready, modalOpen, openModal } = useAdminAuth()

  useEffect(() => {
    if (ready && !authenticated) openModal()
  }, [authenticated, openModal, ready])

  if (!authenticated) return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5 text-neutral-900"><div className="max-w-sm text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-800"><LockKeyhole className="size-5" /></div><h1 className="mt-5 text-2xl font-black">Admin access required</h1><p className="mt-2 text-sm text-neutral-600">Enter the admin password to open this workspace.</p><button onClick={openModal} className="mt-5 bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-700">Enter password</button>{modalOpen && <span className="sr-only">Password dialog is open</span>}</div></main>

  return <>{children}</>
}

function AdminPasswordModal({ open, onClose, onAuthenticate }: { open: boolean; onClose: () => void; onAuthenticate: (password: string) => boolean }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      setPassword('')
      setError('')
      return
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!onAuthenticate(password)) setError('That password wasn’t recognized. Please try again.')
  }

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="admin-login-title" className="w-full max-w-sm border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-800"><LockKeyhole className="size-5" /></div><button type="button" onClick={onClose} aria-label="Close password dialog" className="grid size-9 place-items-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"><X className="size-4" /></button></div>
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Carolina Cache · Admin</p><h2 id="admin-login-title" className="mt-2 text-2xl font-black tracking-tight">Admin Password</h2><p className="mt-2 text-sm leading-relaxed text-neutral-600">Enter your password to unlock admin tools on this device session.</p>
      <form onSubmit={submit} className="mt-6"><label htmlFor="admin-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-700">Password</label><div className="flex border border-neutral-300 focus-within:border-emerald-600"><input id="admin-password" autoFocus required type={visible ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} aria-invalid={Boolean(error)} aria-describedby={error ? 'admin-password-error' : undefined} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((current) => !current)} className="px-3 text-neutral-500">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{error && <p id="admin-password-error" role="alert" className="mt-2 text-sm text-red-700">{error}</p>}<button type="submit" className="mt-4 w-full bg-neutral-950 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-emerald-700">Unlock admin tools</button></form>
    </section>
  </div>
}
