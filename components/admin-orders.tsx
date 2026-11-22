'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Download, PackageCheck, Clock3, Truck, CheckCircle2, Ban, ShoppingBag, CircleAlert, ClipboardList, FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { AdminOrderPreparation } from '@/components/admin-order-preparation'
import { AdminTrackingImport } from '@/components/admin-tracking-import'

type Order = { id: string; order_number: string; customer_name: string; customer_email: string; shipping_address: unknown; billing_address?: unknown; billing_same_as_shipping?: boolean; subtotal: number; shipping_cost?: number; protection_fee?: number; total: number; payment_status: string; fulfillment_status: string; carrier: string | null; tracking_number: string | null; notes: string | null; created_at: string; items?: unknown; shipped_at?: string; weight_oz?: number }
type TrackingImportRow = { orderId: string; carrier: string; trackingNumber: string; order: Pick<Order, 'id' | 'order_number' | 'customer_name' | 'customer_email' | 'fulfillment_status' | 'carrier' | 'tracking_number'> }
type Shipment = { carrier: string; trackingNumber: string }
type OrderFilter = 'All orders' | 'New / Unfulfilled' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled / Refunded'
const filters: { label: OrderFilter; icon: typeof ShoppingBag }[] = [
  { label: 'All orders', icon: ShoppingBag }, { label: 'New / Unfulfilled', icon: Clock3 }, { label: 'Processing', icon: PackageCheck }, { label: 'Shipped', icon: Truck }, { label: 'Delivered', icon: CheckCircle2 }, { label: 'Cancelled / Refunded', icon: Ban },
]
const fulfillmentValues: Record<string, string> = { unfulfilled: 'New / Unfulfilled', pending: 'New / Unfulfilled', open: 'New / Unfulfilled', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled / Refunded', refunded: 'Cancelled / Refunded' }
function itemsFor(order: Order) { return Array.isArray(order.items) ? order.items as Array<Record<string, unknown>> : [] }
function addressFor(order: Order) {
  if (typeof order.shipping_address === 'string') {
    try { const parsed = JSON.parse(order.shipping_address); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown> } catch { return { street1: order.shipping_address } }
    return { street1: order.shipping_address }
  }
  return typeof order.shipping_address === 'object' && order.shipping_address ? order.shipping_address as Record<string, unknown> : {}
}
function shipCity(order: Order) {
  const address = addressFor(order)
  return [address.city, address.state].filter(Boolean).join(', ') || 'Address missing'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderFilter>('All orders')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('Loading orders from Supabase…')
  const [shipmentInputs, setShipmentInputs] = useState<Record<string, Shipment>>({})
  const [selected, setSelected] = useState<Order | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [trackingImportOpen, setTrackingImportOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const client = getBrowserSupabase()

  useEffect(() => {
    if (!client) { setNotice('Supabase browser client is unavailable.'); return }
    let alive = true
    const load = async () => {
      const { data, error } = await client.from('orders').select('id,order_number,customer_name,customer_email,shipping_address,billing_address,billing_same_as_shipping,subtotal,shipping_cost,protection_fee,total,payment_status,fulfillment_status,carrier,tracking_number,notes,created_at,items,shipped_at,weight_oz').order('created_at', { ascending: false })
      if (!alive) return
      if (error) setNotice(`Could not load orders: ${error.message}`)
      else { setOrders((data ?? []) as Order[]); setNotice(data?.length ? '' : 'No orders yet. New orders will appear here when inserted into the orders table.') }
    }
    void load()
    const channel = client.channel('admin-orders-live').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      if (payload.eventType === 'DELETE') setOrders((current) => current.filter((order) => order.id !== String((payload.old as { id?: string }).id)))
      else if (payload.new) setOrders((current) => { const next = payload.new as Order; return [next, ...current.filter((order) => order.id !== String(next.id))] })
    }).subscribe()
    return () => { alive = false; void client.removeChannel(channel) }
  }, [client])

  useEffect(() => { if (selected) setSelected(orders.find((order) => order.id === selected.id) ?? null) }, [orders])
  const visible = useMemo(() => orders.filter((order) => {
    const status = fulfillmentValues[order.fulfillment_status.toLowerCase()] ?? order.fulfillment_status
    const matchesFilter = filter === 'All orders' || status === filter
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [order.order_number, order.customer_name, order.customer_email, shipCity(order), ...itemsFor(order).map((item) => String(item.sku ?? ''))].some((value) => String(value ?? '').toLowerCase().includes(query))
    return matchesFilter && matchesSearch
  }), [orders, filter, search])
  const summary = [
    { label: 'Open orders', value: orders.filter((order) => ['unfulfilled', 'pending', 'open'].includes(order.fulfillment_status.toLowerCase())).length, icon: Clock3 },
    { label: 'Processing', value: orders.filter((order) => order.fulfillment_status.toLowerCase() === 'processing').length, icon: PackageCheck },
    { label: 'In transit', value: orders.filter((order) => order.fulfillment_status.toLowerCase() === 'shipped').length, icon: Truck },
    { label: 'Delivered', value: orders.filter((order) => order.fulfillment_status.toLowerCase() === 'delivered').length, icon: CheckCircle2 },
  ]

  async function updateOrder(id: string, values: Partial<Order>) {
    if (!client) return
    const { error } = await client.from('orders').update(values).eq('id', id)
    setNotice(error ? `Order update failed: ${error.message}` : 'Order changes saved.')
    if (!error) setOrders((current) => current.map((order) => order.id === id ? { ...order, ...values } : order))
  }
  async function moveToProcessing(order: Order) {
    setBusy(true)
    await updateOrder(order.id, { fulfillment_status: 'processing' })
    setBusy(false)
  }
  async function markShipped(order: Order) {
    if (!client) return
    const shipment = shipmentInputs[order.id] ?? { carrier: order.carrier ?? '', trackingNumber: order.tracking_number ?? '' }
    const carrier = shipment.carrier.trim()
    const trackingNumber = shipment.trackingNumber.trim()
    if (!carrier || !trackingNumber) { setNotice('Enter both a carrier and tracking number before marking this order shipped.'); return }
    setBusy(true)
    const values = { carrier, tracking_number: trackingNumber, fulfillment_status: 'shipped' }
    const shippedAt = new Date().toISOString()
    let { error } = await client.from('orders').update({ ...values, shipped_at: shippedAt } as never).eq('id', order.id)
    if (error && (error.code === '42703' || error.code === 'PGRST204' || /shipped_at/i.test(error.message))) {
      const fallback = await client.from('orders').update(values).eq('id', order.id)
      error = fallback.error
    }
    if (error) { setNotice(`Could not mark this order shipped: ${error.message}`); setBusy(false); return }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...values, shipped_at: shippedAt } : item))
    try {
      const response = await fetch('/api/orders/shipping-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id }) })
      setNotice(response.ok ? `Order ${order.order_number} marked shipped and tracking email sent.` : `Order ${order.order_number} is marked shipped, but the tracking email could not be sent.`)
    } catch { setNotice(`Order ${order.order_number} is marked shipped, but the tracking email could not be sent.`) }
    setBusy(false)
  }
  function downloadCsv(rows: unknown[][], filename: string) {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
  }
  function exportManifest() {
    const unshipped = orders.filter((order) => ['unfulfilled', 'open', 'pending', 'processing'].includes(order.fulfillment_status.toLowerCase()))
    const rows = [['Order', 'Customer', 'Email', 'Order date', 'Ship to', 'Street address', 'Items', 'SKUs', 'Quantities', 'Payment', 'Fulfillment', 'Subtotal', 'Shipping paid', 'Total'], ...unshipped.map((order) => {
      const address = addressFor(order)
      const items = itemsFor(order)
      return [order.order_number, order.customer_name, order.customer_email, order.created_at, shipCity(order), [address.street1, address.street2].filter(Boolean).join(' '), items.map((item) => String(item.title ?? item.name ?? 'Item')).join(' | '), items.map((item) => String(item.sku ?? '')).join(' | '), items.map((item) => String(item.quantity ?? 1)).join(' | '), order.payment_status, order.fulfillment_status, String(order.subtotal ?? 0), String(order.shipping_cost ?? 0), String(order.total)]
    })]
    downloadCsv(rows, 'carolina-cache-fulfillment-manifest.csv')
  }
  async function exportLabelCsv() {
    const selectedOrders = selectedOrderIds.length ? orders.filter((order) => selectedOrderIds.includes(order.id)) : orders.filter((order) => ['unfulfilled', 'open', 'pending', 'processing'].includes(order.fulfillment_status.toLowerCase()))
    if (!selectedOrders.length) { setNotice('Select at least one order to export label details.'); return }
    const allItems = selectedOrders.flatMap(itemsFor)
    const productIds = [...new Set(allItems.map((item) => String(item.product_id ?? item.id ?? '')).filter((id) => id && !id.startsWith('sample-') && !id.startsWith('local-')))]
    const productSkus = [...new Set(allItems.map((item) => String(item.sku ?? '')).filter(Boolean))]
    let products: Array<{ id: string; sku: string | null; weight_oz: number | null }> = []
    if (client && (productIds.length || productSkus.length)) {
      let query = client.from('products').select('id,sku,weight_oz')
      if (productIds.length) { const result = await query.in('id', productIds); products = (result.data ?? []) as typeof products }
      if (productSkus.length) { const result = await client.from('products').select('id,sku,weight_oz').in('sku', productSkus); products = [...products, ...((result.data ?? []) as typeof products)] }
    }
    const rows: unknown[][] = [['order_id', 'order_number', 'recipient_name', 'street_1', 'street_2', 'city', 'state', 'zip', 'country', 'email', 'phone', 'weight_oz', 'items_summary', 'gift_note']]
    for (const order of selectedOrders) {
      const address = addressFor(order)
      const items = itemsFor(order)
      const savedWeight = Number(order.weight_oz)
      const itemWeight = items.reduce((total, item) => {
        const itemId = String(item.product_id ?? item.id ?? '')
        const product = products.find((entry) => entry.id === itemId || (!!item.sku && entry.sku === item.sku))
        const weight = Number(item.weight_oz ?? product?.weight_oz)
        return total + (Number.isFinite(weight) && weight > 0 ? weight * (Number(item.quantity) || 1) : 0)
      }, 0)
      const weight = savedWeight > 0 ? savedWeight : itemWeight > 0 ? itemWeight : 4
      const itemsSummary = items.map((item) => `${String(item.sku ?? 'NO-SKU')} · ${String(item.title ?? item.name ?? 'Item')} × ${Number(item.quantity) || 1}`).join(' | ')
      const giftNote = [address.gift_note, address.note, order.notes, order.billing_same_as_shipping === false ? 'Gift order: billing address differs from shipping.' : ''].filter(Boolean).map(String).join(' ')
      rows.push([order.id, order.order_number, address.name ?? order.customer_name, address.street1 ?? '', address.street2 ?? '', address.city ?? '', address.state ?? '', address.zip ?? '', address.country ?? '', order.customer_email, address.phone ?? '', weight, itemsSummary, giftNote])
    }
    downloadCsv(rows, 'carolina-cache-label-export.csv')
    setNotice(`Exported ${selectedOrders.length} order${selectedOrders.length === 1 ? '' : 's'} for shipping labels.`)
  }
  async function importTracking(rows: TrackingImportRow[], sendEmails: boolean) {
    if (!client) { setNotice('Supabase browser client is unavailable.'); return }
    setBusy(true)
    let updated = 0
    let failed = 0
    const changed: Order[] = []
    const shippedAt = new Date().toISOString()
    for (const row of rows) {
      const currentOrder = orders.find((order) => order.id === row.orderId)
      if (!currentOrder) { failed += 1; continue }
      const values = { carrier: row.carrier, tracking_number: row.trackingNumber, fulfillment_status: 'shipped' }
      let { error } = await client.from('orders').update({ ...values, shipped_at: shippedAt } as never).eq('id', row.orderId)
      if (error && (error.code === '42703' || error.code === 'PGRST204' || /shipped_at/i.test(error.message))) {
        const fallback = await client.from('orders').update(values).eq('id', row.orderId)
        error = fallback.error
      }
      if (error) { failed += 1; continue }
      updated += 1
      const nextOrder = { ...currentOrder, ...values, shipped_at: shippedAt }
      changed.push(nextOrder)
      setOrders((current) => current.map((order) => order.id === row.orderId ? nextOrder : order))
    }
    let emailFailures = 0
    if (sendEmails && changed.some((order) => order.customer_email)) {
      try {
        const response = await fetch('/api/orders/bulk-shipping-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderIds: changed.filter((order) => order.customer_email).map((order) => order.id) }) })
        if (!response.ok) emailFailures = changed.filter((order) => order.customer_email).length
        else { const result = await response.json() as { failed?: number }; emailFailures = Number(result.failed) || 0 }
      } catch { emailFailures = changed.filter((order) => order.customer_email).length }
    }
    setBusy(false)
    setTrackingImportOpen(false)
    setSelectedOrderIds([])
    setNotice(`${updated} shipment${updated === 1 ? '' : 's'} updated${failed ? `; ${failed} failed` : ''}${sendEmails ? `; ${emailFailures} confirmation email${emailFailures === 1 ? '' : 's'} failed` : '; confirmation emails skipped'}.`)
  }

  return <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-6" aria-labelledby="orders-title">
    <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Workspace / Fulfillment</p><h1 id="orders-title" className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Order management</h1><p className="mt-2 max-w-2xl text-sm text-neutral-600">Review orders, prepare shipments, and keep every collector informed.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setTrackingImportOpen(true)}><Upload data-icon="inline-start" />Import Tracking CSV</Button><Button variant="outline" onClick={() => void exportLabelCsv()} disabled={!orders.length}><FileSpreadsheet data-icon="inline-start" />Export Label CSV</Button><Button variant="outline" onClick={exportManifest} disabled={!orders.some((order) => ['unfulfilled', 'open', 'pending', 'processing'].includes(order.fulfillment_status.toLowerCase()))}><Download data-icon="inline-start" />Export manifest</Button></div></div>
    {notice && <div role="status" className="flex items-start gap-3 border border-neutral-200 bg-white p-4 text-sm text-neutral-700"><CircleAlert className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Order summary">{summary.map(({ label, value, icon: Icon }) => <div key={label} className="border border-neutral-200 bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-neutral-600">{label}</span><span className="grid size-9 place-items-center bg-emerald-50 text-emerald-700"><Icon className="size-4" aria-hidden="true" /></span></div><p className="mt-4 text-2xl font-black tracking-tight text-neutral-950">{value}</p><p className="mt-1 text-xs text-neutral-500">Live from Supabase</p></div>)}</div>
    <div className="overflow-hidden border border-neutral-200 bg-white"><div className="border-b border-neutral-200 p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><h2 className="font-bold text-neutral-950">Orders</h2><p className="mt-1 text-xs text-neutral-500">Filter by fulfillment stage or search for an order.</p></div><label className="relative block min-w-0 sm:w-72"><span className="sr-only">Search orders by customer or order ID</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, city, SKU or order ID" className="w-full border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label></div><div className="mt-5 -mb-4 flex gap-1 overflow-x-auto pb-1" role="group" aria-label="Filter orders by status">{filters.map(({ label, icon: Icon }) => <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${filter === label ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}><Icon className="size-3.5" aria-hidden="true" />{label}</button>)}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500"><tr><th className="px-4 py-3"><input type="checkbox" aria-label="Select all visible orders" checked={visible.length > 0 && visible.every((order) => selectedOrderIds.includes(order.id))} onChange={(event) => setSelectedOrderIds((current) => event.target.checked ? [...new Set([...current, ...visible.map((order) => order.id)])] : current.filter((id) => !visible.some((order) => order.id === id)))} /></th>{['Order / customer', 'Ship to / items', 'Date', 'Payment', 'Fulfillment', 'Total', 'Prepare'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{visible.map((order) => { const items = itemsFor(order); const skus = items.map((item) => String(item.sku ?? '')).filter(Boolean); return <tr key={order.id} className="border-t border-neutral-100 align-top hover:bg-neutral-50/70"><td className="px-4 py-4"><input type="checkbox" aria-label={`Select order ${order.order_number}`} checked={selectedOrderIds.includes(order.id)} onChange={(event) => setSelectedOrderIds((current) => event.target.checked ? [...current, order.id] : current.filter((id) => id !== order.id))} /></td><td className="px-4 py-4"><p className="font-bold text-neutral-900">{order.order_number}</p><p className="mt-1 text-sm">{order.customer_name}</p><p className="text-xs text-neutral-500">{order.customer_email}</p></td><td className="px-4 py-4"><p className="text-sm font-medium text-neutral-800">{shipCity(order)}</p><p className="mt-1 text-xs text-neutral-500">{items.length} item{items.length === 1 ? '' : 's'}{skus.length ? ` · ${skus.join(', ')}` : ''}</p></td><td className="px-4 py-4 text-sm text-neutral-600">{new Date(order.created_at).toLocaleDateString()}</td><td className="px-4 py-4"><span className="text-xs font-bold capitalize">{order.payment_status}</span></td><td className="min-w-40 px-4 py-4"><select aria-label={`Fulfillment status for ${order.order_number}`} value={order.fulfillment_status} onChange={(event) => void updateOrder(order.id, { fulfillment_status: event.target.value })} className="w-full border border-neutral-300 bg-white px-2 py-2 text-sm capitalize">{['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((status) => <option key={status} value={status}>{status}</option>)}</select>{order.carrier && <p className="mt-1 text-xs text-neutral-500">{order.carrier}{order.tracking_number ? ` · ${order.tracking_number}` : ''}</p>}</td><td className="px-4 py-4 text-sm font-semibold">${Number(order.total || 0).toFixed(2)}</td><td className="px-4 py-4"><Button size="sm" variant="outline" onClick={() => setSelected(order)}><ClipboardList data-icon="inline-start" />Prepare Order</Button></td></tr> })}{!visible.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">No orders match this view.</td></tr>}</tbody></table></div>
      <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-3 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between"><span>{visible.length} of {orders.length} orders</span><span>Status, notes, and shipping updates save to Supabase.</span></div></div>
    {selected && <AdminOrderPreparation order={selected} onClose={() => setSelected(null)} onProcessing={() => void moveToProcessing(selected)} onShip={() => void markShipped(selected)} shipment={shipmentInputs[selected.id] ?? { carrier: selected.carrier ?? '', trackingNumber: selected.tracking_number ?? '' }} onShipmentChange={(value) => setShipmentInputs((current) => ({ ...current, [selected.id]: value }))} onNotesChange={(value) => void updateOrder(selected.id, { notes: value })} busy={busy} />}
    {trackingImportOpen && <AdminTrackingImport orders={orders} onClose={() => setTrackingImportOpen(false)} onConfirm={(rows, sendEmails) => void importTracking(rows, sendEmails)} busy={busy} />}
  </section>
}
