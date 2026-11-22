'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Mail, Search, Users, DollarSign, Repeat2, Send, RefreshCw, X } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabase-browser'

type Customer = {
  id: string | null; email: string; full_name: string | null; phone: string | null; default_shipping_address: unknown
  acquisition_source: string | null; marketing_opt_in: boolean; favorite_categories: string[] | null; tags: string[] | null
  notes: string | null; total_orders: number | null; total_spent: number | null; auctions_won: number | null; last_activity_at?: string | null; is_lead: boolean
}
type HistoryRow = { id: string; created_at: string; order_number?: string; items?: unknown; total?: number; subtotal?: number; carrier?: string | null; tracking_number?: string | null; fulfillment_status?: string; auction_id?: string; amount?: number; bidder_name?: string }
const filters = ['All', 'VIP ($250+)', 'Repeat Buyers', 'Auction Winners', 'Marketing Opt-In', 'Leads'] as const
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
const addressText = (address: unknown) => typeof address === 'string' ? address : address && typeof address === 'object' ? Object.values(address as Record<string, unknown>).filter(Boolean).join(', ') : '—'
const csvCell = (value: unknown) => { const text = String(value ?? '').replaceAll('"', '""'); return `"${/^[=+@\\-]/.test(text) ? `'${text}` : text}"` }

export default function AdminCustomers() {
  const client = getBrowserSupabase()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<HistoryRow[]>([])
  const [bids, setBids] = useState<HistoryRow[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [notice, setNotice] = useState('Loading customers…')
  const [tagDraft, setTagDraft] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [busy, setBusy] = useState(false)

    const reload = async () => {
    setNotice('Loading customers…')
    try {
      const response = await fetch('/api/admin/customers')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load customers')
      }
      const data = await response.json()
      setCustomers(data as Customer[])
      setNotice(data?.length ? '' : 'No customer records yet. New orders and leads will appear here.')
    } catch (error) {
      setNotice(error instanceof Error ? `Could not load customers: ${error.message}` : 'Could not load customers.')
    }
  }

  useEffect(() => { void reload() }, [])
    useEffect(() => {
    if (!client || !selected || !selected.id) { setOrders([]); setBids([]); return }
    setTagDraft((selected.tags ?? []).join(', '))
    setNoteDraft(selected.notes ?? '')
    void Promise.all([
      client.from('orders').select('id,order_number,created_at,items,total,subtotal,carrier,tracking_number,fulfillment_status').eq('customer_id', selected.id).order('created_at', { ascending: false }),
      client.from('bids').select('id,auction_id,created_at,amount,bidder_name').eq('customer_id', selected.id).order('created_at', { ascending: false }),
    ]).then(([orderResult, bidResult]) => {
      if (orderResult.error) setNotice(`Order history unavailable: ${orderResult.error.message}`)
      else setOrders((orderResult.data ?? []) as HistoryRow[])
      if (bidResult.error) setNotice(`Bid history unavailable: ${bidResult.error.message}`)
      else setBids((bidResult.data ?? []) as HistoryRow[])
    })
  }, [client, selected?.id])

  const visible = useMemo(() => customers.filter((customer) => {
    const term = search.trim().toLowerCase()
    const matched = !term || [customer.full_name, customer.email, ...(customer.tags ?? [])].some((value) => value?.toLowerCase().includes(term))
    if (!matched) return false
    if (filter === 'VIP ($250+)') return Number(customer.total_spent) >= 250
    if (filter === 'Repeat Buyers') return Number(customer.total_orders) > 1
    if (filter === 'Auction Winners') return Number(customer.auctions_won) > 0
    if (filter === 'Marketing Opt-In') return customer.marketing_opt_in
    if (filter === 'Leads') return customer.is_lead && Number(customer.total_orders) === 0 && Number(customer.auctions_won) === 0
    return true
  }), [customers, filter, search])
  const stats = [
    { label: 'Total customers', value: String(customers.length), icon: Users },
    { label: 'Lifetime revenue', value: money(customers.reduce((sum, customer) => sum + Number(customer.total_spent || 0), 0)), icon: DollarSign },
    { label: 'Repeat buyer rate', value: customers.length ? `${Math.round(customers.filter((customer) => Number(customer.total_orders) > 1).length / customers.length * 100)}%` : '0%', icon: Repeat2 },
    { label: 'Marketing subscribers', value: String(customers.filter((customer) => customer.marketing_opt_in).length), icon: Mail },
  ]

    async function saveCustomer(values: Partial<Customer>) {
    if (!client || !selected || !selected.id) return
    const { error } = await client.from('customers').update(values).eq('id', selected.id)
    if (error) { setNotice(`Could not save customer: ${error.message}`); return }
    const updated = { ...selected, ...values }
    setSelected(updated); setCustomers((current) => current.map((item) => item.id === updated.id ? updated : item)); setNotice('Customer updated.')
  }
  function exportCsv() {
        const rows = [['Name', 'Email', 'Phone', 'Orders', 'Lifetime spend', 'Marketing opt-in', 'Tags', 'Categories', 'Is Lead'], ...visible.map((customer) => [customer.full_name, customer.email, customer.phone, customer.total_orders, customer.total_spent, customer.marketing_opt_in ? 'yes' : 'no', (customer.tags ?? []).join('; '), (customer.favorite_categories ?? []).join('; '), customer.is_lead ? 'yes' : 'no'])]
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'carolina-cache-customers.csv'; link.click(); URL.revokeObjectURL(url)
  }
    async function syncOrders() {
    setBusy(true); setNotice('Syncing historical orders…')
    try {
      const response = await fetch('/api/admin/customers/sync', { method: 'POST' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed')
      }

      if (result.failed > 0) {
        const errorMessages = result.errors.map((err: any) => `Email: ${err.email}, Message: ${err.message}, Code: ${err.code}`).join('; ')
        setNotice(`Sync completed with ${result.failed} customer record${result.failed === 1 ? '' : 's'} rejected. Details: ${errorMessages}`)
      } else {
        setNotice(`Synced ${result.total} customers from historical orders.`)
      }
      await reload()
    } catch (error) {
      setNotice(error instanceof Error ? `Order sync failed: ${error.message}` : 'Order sync failed.')
    } finally {
      setBusy(false)
    }
  }
  async function sendEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected || busy) return
    setBusy(true)
    try {
      const response = await fetch('/api/admin/customer-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: selected.id, subject: emailSubject, message: emailMessage }) })
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Email could not be sent.')
      setEmailOpen(false); setEmailSubject(''); setEmailMessage(''); setNotice('Email sent.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Email could not be sent.') }
    finally { setBusy(false) }
  }

  return <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-6" aria-labelledby="customers-title">
    <header className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Workspace / Relationships</p><h1 id="customers-title" className="mt-2 text-3xl font-black tracking-tight">Customers</h1><p className="mt-2 max-w-2xl text-sm text-neutral-600">Manage collectors, leads, and customer engagement in one place.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={syncOrders} disabled={busy} className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2.5 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50"><RefreshCw className="size-4" />Sync existing orders</button><button type="button" onClick={exportCsv} disabled={!visible.length} className="inline-flex items-center gap-2 bg-neutral-950 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"><Download className="size-4" />Export filtered CSV</button></div></header>
    {notice && <p role="status" className="border border-neutral-200 bg-white p-3 text-sm text-neutral-700">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <article key={label} className="flex items-center justify-between border border-neutral-200 bg-white p-4"><div><p className="text-xs font-medium text-neutral-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div><span className="grid size-10 place-items-center bg-emerald-50 text-emerald-800"><Icon className="size-5" /></span></article>)}</div>
    <div className="overflow-hidden border border-neutral-200 bg-white"><div className="border-b border-neutral-200 p-4"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><h2 className="font-bold">Customer directory</h2><p className="mt-1 text-xs text-neutral-500">Search profiles, then open a record for engagement history.</p></div><label className="relative block w-full md:max-w-sm"><span className="sr-only">Search customers by name, email, or tag</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or tag" className="w-full border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-700" /></label></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Customer segments">{filters.map((item) => <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)} className={`shrink-0 border px-3 py-2 text-xs font-bold ${filter === item ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>{item}</button>)}</div></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500"><tr>{['Customer', 'Orders', 'Lifetime value', 'Segments', 'Marketing', 'Last activity'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{visible.map((customer) => <tr key={customer.id || customer.email} className="border-t border-neutral-100 hover:bg-emerald-50/40"><td className="px-4 py-4"><button type="button" onClick={() => setSelected(customer)} className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"><span className="block font-bold">{customer.full_name || 'Name not provided'}</span><span className="block text-xs text-neutral-500">{customer.email}</span></button></td><td className="px-4 py-4 text-sm">{customer.total_orders ?? 0}</td><td className="px-4 py-4 text-sm font-semibold">{money(Number(customer.total_spent))}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-1">{(customer.tags ?? []).map((tag) => <span key={tag} className="bg-neutral-100 px-2 py-1 text-[10px] font-bold">{tag}</span>)}</div></td><td className="px-4 py-4 text-xs">{customer.marketing_opt_in ? 'Subscribed' : 'Not subscribed'}</td><td className="px-4 py-4 text-xs text-neutral-500">{customer.last_activity_at ? new Date(customer.last_activity_at).toLocaleDateString() : '—'}</td></tr>)}</tbody></table>{!visible.length && <p className="p-8 text-center text-sm text-neutral-500">No customers match this segment.</p>}</div><footer className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">Showing {visible.length} of {customers.length} customers</footer></div>
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/45" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><section role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl"><header className="sticky top-0 flex items-start justify-between border-b border-neutral-200 bg-white p-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Customer profile</p><h2 id="customer-detail-title" className="mt-1 text-2xl font-black">{selected.full_name || selected.email}</h2><p className="text-sm text-neutral-500">{selected.email}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close customer detail" className="grid size-9 place-items-center hover:bg-neutral-100"><X className="size-4" /></button></header><div className="flex flex-col gap-6 p-5"><div className="grid gap-3 sm:grid-cols-2"><div className="border border-neutral-200 p-4"><p className="text-xs text-neutral-500">Lifetime value</p><p className="mt-1 text-xl font-black">{money(Number(selected.total_spent))}</p><p className="mt-2 text-xs text-neutral-500">{selected.total_orders ?? 0} orders · {selected.auctions_won ?? 0} auction wins</p></div><div className="border border-neutral-200 p-4"><p className="text-xs text-neutral-500">Contact & shipping</p><p className="mt-1 text-sm">{selected.phone || 'No phone on file'}</p><p className="mt-2 text-xs text-neutral-600">{addressText(selected.default_shipping_address)}</p></div></div>
      <div className="flex flex-col gap-2"><label htmlFor="customer-tags" className="text-xs font-bold uppercase tracking-wide">Tags</label><div className="flex gap-2"><input id="customer-tags" value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-sm" placeholder="VIP, Live Bidder" /><button type="button" onClick={() => void saveCustomer({ tags: [...new Set(tagDraft.split(',').map((tag) => tag.trim()).filter(Boolean))] })} className="bg-neutral-950 px-4 text-xs font-bold text-white">Save</button></div></div>
      <div className="flex flex-col gap-2"><label htmlFor="customer-notes" className="text-xs font-bold uppercase tracking-wide">Admin notes</label><textarea id="customer-notes" rows={4} maxLength={5000} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} className="resize-y border border-neutral-300 p-3 text-sm" placeholder="Private notes for your team" /><button type="button" disabled={busy} onClick={() => void saveCustomer({ notes: noteDraft.trim() || null })} className="self-start bg-neutral-950 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Save notes</button></div>
      <button type="button" onClick={() => setEmailOpen(true)} className="inline-flex items-center justify-center gap-2 border border-neutral-300 px-4 py-3 text-sm font-bold hover:bg-neutral-50"><Mail className="size-4" />Send direct email</button>
      <section><h3 className="border-b border-neutral-200 pb-2 text-sm font-black uppercase tracking-wide">Order & bid history</h3><div className="mt-3 flex flex-col gap-3">{[...orders.map((row) => ({ ...row, kind: 'Order' })), ...bids.map((row) => ({ ...row, kind: 'Bid' }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((row) => <article key={`${row.kind}-${row.id}`} className="border border-neutral-200 p-4"><div className="flex justify-between gap-3"><p className="text-sm font-bold">{row.kind === 'Order' ? row.order_number || 'Order' : `Auction bid${row.auction_id ? ` · ${row.auction_id}` : ''}`}</p><time className="text-xs text-neutral-500">{new Date(row.created_at).toLocaleDateString()}</time></div>{row.kind === 'Order' ? <><p className="mt-1 text-sm">{money(Number(row.total ?? row.subtotal))} · {row.fulfillment_status || 'status unavailable'}</p>{Array.isArray(row.items) && <p className="mt-1 text-xs text-neutral-600">{row.items.map((item: any) => `${item.name || item.title || item.sku || 'Item'}${item.sku ? ` (SKU ${item.sku})` : ''}`).join(', ')}</p>}{row.tracking_number && <p className="mt-1 text-xs text-neutral-500">{row.carrier || 'Carrier'} tracking: {row.tracking_number}</p>}</> : <p className="mt-1 text-sm">{money(Number(row.amount))} · {row.bidder_name || 'Bidder'}</p>}</article>)}{!orders.length && !bids.length && <p className="text-sm text-neutral-500">No order or bid history linked yet.</p>}</div></section></div></section></div>}
    {emailOpen && selected && <div className="fixed inset-0 z-[60] grid place-items-center bg-neutral-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEmailOpen(false) }}><section role="dialog" aria-modal="true" aria-labelledby="customer-email-title" className="w-full max-w-lg bg-white p-5 shadow-2xl"><div className="flex justify-between"><div><h2 id="customer-email-title" className="text-lg font-black">Send direct email</h2><p className="text-xs text-neutral-500">To {selected.email}</p></div><button type="button" onClick={() => setEmailOpen(false)} aria-label="Close email dialog"><X className="size-4" /></button></div><form className="mt-4 flex flex-col gap-3" onSubmit={sendEmail}><label className="text-xs font-bold">Subject<input required maxLength={180} value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" /></label><label className="text-xs font-bold">Message<textarea required maxLength={8000} rows={7} value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} className="mt-1 w-full border border-neutral-300 p-3 text-sm" /></label><button disabled={busy} className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-4 py-3 text-xs font-bold uppercase text-white disabled:opacity-50"><Send className="size-4" />{busy ? 'Sending…' : 'Send email'}</button></form></section></div>}
  </section>
}
