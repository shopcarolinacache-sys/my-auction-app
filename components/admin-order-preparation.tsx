'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Clipboard, PackageCheck, Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBrowserSupabase } from '@/lib/supabase-browser'

type OrderItem = { id?: string; product_id?: string; sku?: string; title?: string; name?: string; quantity?: number; price?: number; image?: string; images?: string[]; category?: string; section_placement?: string; source?: string; auction_id?: string }
type Order = { id: string; order_number: string; customer_name: string; customer_email: string; shipping_address: unknown; billing_address?: unknown; billing_same_as_shipping?: boolean; subtotal: number; shipping_cost?: number; protection_fee?: number; total: number; payment_status: string; fulfillment_status: string; carrier: string | null; tracking_number: string | null; notes: string | null; created_at: string; items?: unknown; source?: string; shipped_at?: string }
type Product = { id: string; sku: string | null; title: string; category: string | null; section_placement: string | null; images: string[] | null }

function asAddress(value: unknown): Record<string, string> {
  if (typeof value === 'string') return { street1: value }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}
function addressLines(value: unknown) {
  const address = asAddress(value)
  return [address.name, address.street1, address.street2, [address.city, address.state, address.zip].filter(Boolean).join(', '), address.country].filter(Boolean)
}
function sameAddress(left: unknown, right: unknown) {
  const normalize = (value: unknown) => JSON.stringify(Object.fromEntries(Object.entries(asAddress(value)).map(([key, item]) => [key, item.trim().toLowerCase()]).sort(([a], [b]) => a.localeCompare(b))))
  return normalize(left) === normalize(right)
}
function normalizedItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => entry && typeof entry === 'object' ? entry as OrderItem : null).filter((entry): entry is OrderItem => !!entry)
}
function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}
function categoryName(item: OrderItem, product?: Product) {
  const value = `${item.section_placement ?? product?.section_placement ?? ''} ${item.category ?? product?.category ?? ''}`.toLowerCase()
  if (value.includes('vault') || value.includes('card')) return 'The Vault'
  if (value.includes('shelf') || value.includes('toy') || value.includes('figure')) return 'The Shelf'
  return 'The Archive'
}

export function AdminOrderPreparation({ order, onClose, onProcessing, onShip, shipment, onShipmentChange, onNotesChange, busy }: {
  order: Order; onClose: () => void; onProcessing: () => void; onShip: () => void; shipment: { carrier: string; trackingNumber: string }; onShipmentChange: (value: { carrier: string; trackingNumber: string }) => void; onNotesChange: (value: string) => void; busy: boolean
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [billOpen, setBillOpen] = useState(false)
  const client = getBrowserSupabase()
  const items = useMemo(() => normalizedItems(order.items), [order.items])
  const billingDiffers = order.billing_same_as_shipping === false || (!!order.billing_address && !sameAddress(order.billing_address, order.shipping_address))

  useEffect(() => {
    if (!client || !items.length) return
    const ids = items.map((item) => item.product_id ?? item.id).filter((id): id is string => !!id && !id.startsWith('sample-'))
    const skus = items.map((item) => item.sku).filter((sku): sku is string => !!sku)
    let alive = true
    const load = async () => {
      const results: Product[] = []
      if (ids.length) {
        const { data } = await client.from('products').select('id,sku,title,category,section_placement,images').in('id', ids)
        results.push(...((data ?? []) as Product[]))
      }
      if (skus.length) {
        const { data } = await client.from('products').select('id,sku,title,category,section_placement,images').in('sku', skus)
        results.push(...((data ?? []) as Product[]))
      }
      if (alive) setProducts(results)
    }
    void load()
    return () => { alive = false }
  }, [client, items])

  const productFor = (item: OrderItem) => products.find((product) => (item.product_id ?? item.id) === product.id || (!!item.sku && item.sku === product.sku))
  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
  const shipAddress = addressLines(order.shipping_address)
  const addressText = [...shipAddress, order.customer_email, asAddress(order.shipping_address).phone].filter(Boolean).join('\n')

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(addressText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  function printSlip() {
    const printWindow = window.open('', '_blank', 'width=760,height=900')
    if (!printWindow) return
    const showPrices = !billingDiffers
    const rows = items.map((item) => `<tr><td>${escapeHtml(item.title ?? item.name ?? 'Item')}<br><small>SKU ${escapeHtml(item.sku ?? '—')}</small></td><td>${Number(item.quantity) || 1}</td>${showPrices ? `<td>${escapeHtml(money(Number(item.price) || 0))}</td>` : ''}</tr>`).join('')
    const addr = shipAddress.map((line) => `<div>${escapeHtml(line)}</div>`).join('')
    printWindow.document.write(`<!doctype html><html><head><title>Packing slip ${escapeHtml(order.order_number)}</title><style>body{font:14px Arial,sans-serif;color:#171717;margin:40px}header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #171717;padding-bottom:18px}.brand{font-size:22px;font-weight:700}.muted{color:#666;font-size:12px;margin-top:6px}.meta{text-align:right}h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;margin:28px 0 8px}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #ddd}th{font-size:11px;text-transform:uppercase;color:#555}td:last-child,th:last-child{text-align:right}td:nth-child(2),th:nth-child(2){text-align:center}small{color:#666}.note{margin-top:24px;padding:12px;background:#f5f5f5}</style></head><body><header><div><div class="brand">Carolina Cache</div><div class="muted">hello@shopcarolinacache.com</div></div><div class="meta"><strong>PACKING SLIP</strong><div>Order #${escapeHtml(order.order_number)}</div><div>${escapeHtml(new Date(order.created_at).toLocaleDateString())}</div></div></header><h2>Ship to</h2><div>${addr}<div>${escapeHtml(order.customer_email)}</div></div><table><thead><tr><th>Item / SKU</th><th>Qty</th>${showPrices ? '<th>Price</th>' : ''}</tr></thead><tbody>${rows}</tbody></table>${order.notes ? `<div class="note">${escapeHtml(order.notes)}</div>` : ''}<script>window.onload=()=>window.print()<\\/script></body></html>`)
    printWindow.document.close()
  }

  return <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/45" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-labelledby="prepare-title" className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
    <header className="flex items-start justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Order preparation</p><h2 id="prepare-title" className="mt-1 text-xl font-black">{order.order_number}</h2><p className="mt-1 text-sm text-neutral-500">{order.customer_name} · {new Date(order.created_at).toLocaleString()}</p></div><button type="button" aria-label="Close preparation panel" onClick={onClose} className="grid size-9 place-items-center border border-neutral-200 hover:bg-neutral-50"><X className="size-4" /></button></header>
    <div className="flex-1 overflow-y-auto p-5"><section className="border border-neutral-200 p-4"><div className="flex items-center justify-between"><h3 className="font-bold">1. Order &amp; payment</h3><span className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold capitalize text-emerald-800">{order.payment_status || 'unknown'}</span></div><p className="mt-2 text-sm text-neutral-600">Source: {order.source ?? (items.some((item) => item.source === 'auction' || item.auction_id) ? 'Auction Win' : 'Store Checkout')}</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><span>Subtotal</span><span className="text-right">{money(order.subtotal)}</span><span>Shipping paid</span><span className="text-right">{money(order.shipping_cost ?? 0)}</span><span>Protection</span><span className="text-right">{money(order.protection_fee ?? 0)}</span><span className="border-t pt-2 font-bold">Total</span><span className="border-t pt-2 text-right font-bold">{money(order.total)}</span></div><label className="mt-3 block border-t border-neutral-100 pt-3 text-xs font-semibold text-neutral-600">Order notes<textarea aria-label={`Internal notes for ${order.order_number}`} defaultValue={order.notes ?? ''} onBlur={(event) => { if (event.currentTarget.value !== (order.notes ?? '')) onNotesChange(event.currentTarget.value) }} placeholder="Customer or gift notes" rows={2} className="mt-1 w-full resize-y border border-neutral-200 p-2 text-sm font-normal" /></label></section>
      <section className="mt-4 border border-neutral-200 p-4"><div className="flex items-center justify-between"><h3 className="font-bold">2. Pick &amp; pack</h3><span className="text-xs text-neutral-500">{items.length} line item{items.length === 1 ? '' : 's'}</span></div>{items.length ? <div className="mt-3 divide-y divide-neutral-100">{items.map((item, index) => { const product = productFor(item); const key = item.sku ?? item.product_id ?? item.id ?? `${item.title ?? item.name}-${index}`; const image = item.image ?? item.images?.[0] ?? product?.images?.[0]; return <article key={key} className="flex gap-3 py-3"><div className="size-14 shrink-0 overflow-hidden bg-neutral-100">{image && <img src={image} alt="" className="size-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title ?? item.name ?? product?.title ?? 'Item'}</p><div className="mt-1 flex flex-wrap gap-2 text-xs"><span className="border border-neutral-200 px-1.5 py-0.5 font-mono">{item.sku ?? product?.sku ?? item.product_id ?? 'SKU —'}</span><span className="text-neutral-500">{categoryName(item, product)}</span><span className="text-neutral-500">Qty {Number(item.quantity) || 1}</span></div><div className="mt-2 flex gap-4 text-xs"><label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={!!checked[`${key}-picked`]} onChange={(event) => setChecked((current) => ({ ...current, [`${key}-picked`]: event.target.checked }))} />Picked</label><label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={!!checked[`${key}-packed`]} onChange={(event) => setChecked((current) => ({ ...current, [`${key}-packed`]: event.target.checked }))} />Packed</label></div></div></article> })}</div> : <p className="mt-3 text-sm text-neutral-500">No item details were saved with this order.</p>}{['unfulfilled', 'open', 'pending'].includes(order.fulfillment_status.toLowerCase()) && <Button className="mt-3 w-full" onClick={onProcessing}><PackageCheck data-icon="inline-start" />Move to Processing</Button>}</section>
      <section className="mt-4 border border-emerald-200 bg-emerald-50/40 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">3. Ship to</h3><div className="flex items-center gap-2">{billingDiffers && <span className="border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900">Billing ≠ Shipping</span>}<Button size="sm" variant="outline" onClick={() => void copyAddress()}><Clipboard data-icon="inline-start" />{copied ? 'Copied!' : 'Copy address'}</Button></div></div><address className="mt-3 not-italic text-sm leading-6">{shipAddress.map((line, index) => <div key={`${line}-${index}`} className={index === 0 ? 'font-semibold' : ''}>{line}</div>)}<div>{asAddress(order.shipping_address).phone}</div><div>{order.customer_email}</div></address>{billingDiffers && <div className="mt-3 border-t border-amber-200 pt-3"><button type="button" aria-expanded={billOpen} onClick={() => setBillOpen((open) => !open)} className="flex w-full items-center justify-between text-left text-sm font-semibold"><span>Bill To</span><ChevronDown className={`size-4 transition-transform ${billOpen ? 'rotate-180' : ''}`} /></button>{billOpen && <address className="mt-2 not-italic text-sm leading-6">{addressLines(order.billing_address).map((line, index) => <div key={`${line}-${index}`}>{line}</div>)}</address>}</div>}</section>
      <section className="mt-4 border border-neutral-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">4. Packing slip &amp; dispatch</h3><p className="mt-1 text-xs text-neutral-500">Gift orders hide item prices on the packing slip.</p></div><Button variant="outline" onClick={printSlip}><Printer data-icon="inline-start" />Print packing slip</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Carrier<input value={shipment.carrier} onChange={(event) => onShipmentChange({ ...shipment, carrier: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" placeholder="USPS, UPS, etc." /></label><label className="text-xs font-semibold">Tracking number<input value={shipment.trackingNumber} onChange={(event) => onShipmentChange({ ...shipment, trackingNumber: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" placeholder="Tracking number" /></label></div><Button disabled={busy} onClick={onShip} className="mt-3 w-full"><Check data-icon="inline-start" />{busy ? 'Saving shipment…' : 'Mark shipped & send tracking'}</Button></section>
    </div>
  </section></div>
}
