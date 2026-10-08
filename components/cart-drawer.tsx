'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '@/data/products'

type CartLine = { product: Product; quantity: number }
type CartContextValue = { lines: CartLine[]; isOpen: boolean; add: (product: Product) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; open: () => void; close: () => void; subtotal: number }
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const add = (product: Product) => { if (product.stock === 'Sold Out') return; setLines((current) => { const existing = current.find((line) => line.product.id === product.id); return existing ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }] }); setIsOpen(true) }
  const update = (id: string, quantity: number) => setLines((current) => quantity < 1 ? current.filter((line) => line.product.id !== id) : current.map((line) => line.product.id === id ? { ...line, quantity } : line))
  const remove = (id: string) => setLines((current) => current.filter((line) => line.product.id !== id))
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [lines])
  return <CartContext.Provider value={{ lines, isOpen, add, update, remove, open: () => setIsOpen(true), close: () => setIsOpen(false), subtotal }}>{children}<CartDrawer /></CartContext.Provider>
}

export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used inside CartProvider'); return value }

function CartDrawer() {
  const { lines, isOpen, close, update, remove, subtotal } = useCart()
  return <><div aria-hidden={!isOpen} onClick={close} className={`fixed inset-0 z-40 bg-neutral-950/45 transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} /><aside aria-label="Shopping cart" aria-hidden={!isOpen} className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#f7f7f4] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}><div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Carolina Cache</p><h2 className="mt-1 text-2xl font-black tracking-tight">Your cart</h2></div><button onClick={close} aria-label="Close cart" className="rounded-full p-2 hover:bg-neutral-200"><X className="size-5" /></button></div><div className="flex-1 overflow-y-auto px-6 py-5">{lines.length === 0 ? <div className="grid h-full place-items-center text-center"><ShoppingBag className="mx-auto size-8 text-neutral-300" /><p className="mt-4 font-bold">Your archive is waiting.</p><p className="mt-2 text-sm text-neutral-500">Add a rare find to begin checkout.</p></div> : <div className="space-y-5">{lines.map(({ product, quantity }) => <article key={product.id} className="flex gap-4 border-b border-neutral-200 pb-5"><img src={product.image} alt={`${product.name} cart thumbnail`} className="size-20 object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><h3 className="font-bold leading-snug">{product.name}</h3><button onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}><Trash2 className="size-4 text-neutral-400 hover:text-red-600" /></button></div><p className="mt-2 text-sm text-neutral-500">${product.price.toLocaleString()}</p><div className="mt-3 inline-flex items-center border border-neutral-300 bg-white"><button onClick={() => update(product.id, quantity - 1)} className="p-1.5" aria-label="Decrease quantity"><Minus className="size-3" /></button><span className="min-w-8 text-center text-sm">{quantity}</span><button onClick={() => update(product.id, quantity + 1)} className="p-1.5" aria-label="Increase quantity"><Plus className="size-3" /></button></div></div></article>)}</div>}</div>{lines.length > 0 && <div className="border-t border-neutral-200 px-6 py-5"><div className="flex justify-between text-sm font-bold"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div><p className="mt-3 text-xs leading-relaxed text-neutral-500">Insured promotional shipping applied at checkout. Exclusive tier rewards active.</p><div className="mt-5 grid gap-3"><button type="button" onClick={close} className="w-full border border-neutral-300 bg-white px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] text-neutral-950 transition hover:border-neutral-950">Keep shopping</button><Link href="/checkout" onClick={close} className="block w-full bg-neutral-950 px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] text-white">Checkout</Link></div></div>}</aside></>
}

export function CartButton() { const { lines, open } = useCart(); const count = lines.reduce((sum, line) => sum + line.quantity, 0); return <button onClick={open} aria-label={`Shopping bag${count ? `, ${count} items` : ''}`} className="relative"><ShoppingBag className="size-4" />{count > 0 && <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-emerald-500 text-[9px] font-black text-neutral-950">{count}</span>}</button> }
export function AddToCartButton({ product }: { product: Product }) { const { add } = useCart(); const soldOut = product.stock === 'Sold Out'; return <button onClick={() => add(product)} disabled={soldOut} className="absolute inset-x-3 bottom-3 translate-y-2 bg-emerald-400 px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-950 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-neutral-200">{soldOut ? 'Sold out' : 'Add to cart'}</button> }
export function CartToast() { return null }
export type { CartLine }
export type CheckoutProps = { lines: CartLine[]; subtotal: number }
