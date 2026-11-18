'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Download, PackageCheck, Clock3, Truck, CheckCircle2, Ban, ShoppingBag, CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBrowserSupabase } from '@/lib/supabase-browser'

type Order = { id: string; order_number: string; customer_name: string; customer_email: string; shipping_address: string; subtotal: number; total: number; payment_status: string; fulfillment_status: string; carrier: string | null; tracking_number: string | null; notes: string | null; created_at: string }
type OrderFilter = 'All orders' | 'New / Unfulfilled' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled / Refunded'
const filters: { label: OrderFilter; icon: typeof ShoppingBag }[] = [
  { label: 'All orders', icon: ShoppingBag }, { label: 'New / Unfulfilled', icon: Clock3 }, { label: 'Processing', icon: PackageCheck }, { label: 'Shipped', icon: Truck }, { label: 'Delivered', icon: CheckCircle2 }, { label: 'Cancelled / Refunded', icon: Ban },
]
const fulfillmentValues: Record<string, string> = { unfulfilled: 'New / Unfulfilled', pending: 'New / Unfulfilled', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled / Refunded', refunded: 'Cancelled / Refunded' }

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderFilter>('All orders')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('Loading orders from Supabase…')
  const client = getBrowserSupabase()

  useEffect(() => {
    if (!client) { setNotice('Supabase browser client is unavailable.'); return }
    let alive = true
    const load = async () => {
      const { data, error } = await client.from('orders').select('id,order_number,customer_name,customer_email,shipping_address,subtotal,total,payment_status,fulfillment_status,carrier,tracking_number,notes,created_at').order('created_at', { ascending: false })
      if (!alive) return
      if (error) setNotice(`Could not load orders: ${error.message}`)
      else { setOrders((data ?? []) as Order[]); setNotice(data?.length ? '' : 'No orders yet. New orders will appear here when inserted into the orders table.') }
    }
    void load()
    const channel = client.channel('admin-orders-live').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      if (payload.eventType === 'DELETE') setOrders((current) => current.filter((order) => order.id !== String((payload.old as any).id)))
      else if (payload.new) setOrders((current) => { const next = payload.new as Order; return [next, ...current.filter((order) => order.id !== String(next.id))] })
    }).subscribe()
    return () => { alive = false; void client.removeChannel(channel) }
  }, [client])

  const visible = useMemo(() => orders.filter((order) => {
    const status = fulfillmentValues[order.fulfillment_status.toLowerCase()] ?? order.fulfillment_status
    const matchesFilter = filter === 'All orders' || status === filter
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [order.order_number, order.customer_name, order.customer_email].some((value) => value?.toLowerCase().includes(query))
    return matchesFilter && matchesSearch
  }), [orders, filter, search])
  const summary = [
    { label: 'Open orders', value: orders.filter((order) => ['unfulfilled', 'pending'].includes(order.fulfillment_status.toLowerCase())).length, icon: Clock3 },
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
  function exportCsv() {
    const rows = [['Order', 'Customer', 'Email', 'Date', 'Payment', 'Fulfillment', 'Total'], ...visible.map((order) => [order.order_number, order.customer_name, order.customer_email, order.created_at, order.payment_status, order.fulfillment_status, String(order.total)])]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'orders.csv'; link.click(); URL.revokeObjectURL(url)
  }
  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

  return <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-6" aria-labelledby="orders-title">
    <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Workspace / Fulfillment</p><h1 id="orders-title" className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Order management</h1><p className="mt-2 max-w-2xl text-sm text-neutral-600">Review orders, prepare shipments, and keep every collector informed.</p></div><Button variant="outline" onClick={exportCsv} disabled={!visible.length}><Download data-icon="inline-start" /> Export manifest</Button></div>
    {notice && <div role="status" className="flex items-start gap-3 border border-neutral-200 bg-white p-4 text-sm text-neutral-700"><CircleAlert className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Order summary">{summary.map(({ label, value, icon: Icon }) => <div key={label} className="border border-neutral-200 bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-neutral-600">{label}</span><span className="grid size-9 place-items-center bg-emerald-50 text-emerald-700"><Icon className="size-4" aria-hidden="true" /></span></div><p className="mt-4 text-2xl font-black tracking-tight text-neutral-950">{value}</p><p className="mt-1 text-xs text-neutral-500">Live from Supabase</p></div>)}</div>
    <div className="overflow-hidden border border-neutral-200 bg-white"><div className="border-b border-neutral-200 p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><h2 className="font-bold text-neutral-950">Orders</h2><p className="mt-1 text-xs text-neutral-500">Filter by fulfillment stage or search for an order.</p></div><label className="relative block min-w-0 sm:w-72"><span className="sr-only">Search orders by customer or order ID</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or order ID" className="w-full border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label></div><div className="mt-5 -mb-4 flex gap-1 overflow-x-auto pb-1" role="group" aria-label="Filter orders by status">{filters.map(({ label, icon: Icon }) => <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${filter === label ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}><Icon className="size-3.5" aria-hidden="true" />{label}</button>)}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left"><thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500"><tr>{['Order / customer', 'Date', 'Payment', 'Fulfillment', 'Shipping', 'Total'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{visible.map((order) => <tr key={order.id} className="border-t border-neutral-100 align-top"><td className="px-4 py-4"><p className="font-bold text-neutral-900">{order.order_number}</p><p className="mt-1 text-sm">{order.customer_name}</p><p className="text-xs text-neutral-500">{order.customer_email}</p></td><td className="px-4 py-4 text-sm text-neutral-600">{new Date(order.created_at).toLocaleDateString()}</td><td className="px-4 py-4"><span className="text-xs font-bold capitalize">{order.payment_status}</span></td><td className="min-w-48 px-4 py-4"><select aria-label={`Fulfillment status for ${order.order_number}`} value={order.fulfillment_status} onChange={(event) => void updateOrder(order.id, { fulfillment_status: event.target.value })} className="w-full border border-neutral-300 bg-white px-2 py-2 text-sm capitalize">{['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((value) => <option key={value} value={value}>{value}</option>)}</select><textarea aria-label={`Internal notes for ${order.order_number}`} defaultValue={order.notes ?? ''} onBlur={(event) => { if (event.currentTarget.value !== (order.notes ?? '')) void updateOrder(order.id, { notes: event.currentTarget.value }) }} placeholder="Internal notes" rows={2} className="mt-2 w-full resize-y border border-neutral-200 p-2 text-xs" /></td><td className="min-w-64 px-4 py-4"><div className="grid gap-2"><input aria-label={`Carrier for ${order.order_number}`} defaultValue={order.carrier ?? ''} onBlur={(event) => { if (event.currentTarget.value !== (order.carrier ?? '')) void updateOrder(order.id, { carrier: event.currentTarget.value }) }} placeholder="Carrier" className="border border-neutral-200 px-2 py-2 text-xs"/><input aria-label={`Tracking number for ${order.order_number}`} defaultValue={order.tracking_number ?? ''} onBlur={(event) => { if (event.currentTarget.value !== (order.tracking_number ?? '')) void updateOrder(order.id, { tracking_number: event.currentTarget.value }) }} placeholder="Tracking number" className="border border-neutral-200 px-2 py-2 text-xs"/></div></td><td className="px-4 py-4 text-right font-bold">{money(order.total)}</td></tr>)}{!visible.length && <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-neutral-500">{search ? 'No matching orders.' : orders.length ? `No ${filter.toLowerCase()} orders.` : 'Your order queue is empty.'}</td></tr>}</tbody></table></div>
      <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-3 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between"><span>{visible.length} of {orders.length} orders</span><span>Status, notes, and shipping updates save to Supabase.</span></div></div>
  </section>
}
