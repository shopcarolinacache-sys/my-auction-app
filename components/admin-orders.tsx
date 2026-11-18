'use client'

import { useMemo, useState } from 'react'
import { Search, Download, PackageCheck, Clock3, Truck, CheckCircle2, Ban, ShoppingBag, CircleAlert, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

type OrderFilter = 'All orders' | 'New / Unfulfilled' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled / Refunded'

const filters: { label: OrderFilter; icon: typeof ShoppingBag }[] = [
  { label: 'All orders', icon: ShoppingBag },
  { label: 'New / Unfulfilled', icon: Clock3 },
  { label: 'Processing', icon: PackageCheck },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: CheckCircle2 },
  { label: 'Cancelled / Refunded', icon: Ban },
]

export default function AdminOrders() {
  const [filter, setFilter] = useState<OrderFilter>('All orders')
  const [search, setSearch] = useState('')
  const normalizedSearch = useMemo(() => search.trim(), [search])

  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-6" aria-labelledby="orders-title">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Workspace / Fulfillment</p>
          <h1 id="orders-title" className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Order management</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">Review orders, prepare shipments, and keep every collector informed.</p>
        </div>
        <Button variant="outline" disabled aria-label="Export orders as CSV; unavailable until order data is connected">
          <Download data-icon="inline-start" /> Export manifest
        </Button>
      </div>

      <div role="status" className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold">Order data isn&apos;t connected</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-900">This view is ready for your fulfillment workflow, but it isn&apos;t reading or changing orders yet. No sample orders are shown. Live sync, status updates, shipping details, and stock changes require the Supabase connection and database setup you chose to defer.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Order summary">
        {[
          { label: 'Open orders', value: '0', icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Ready to ship', value: '0', icon: PackageCheck, tone: 'text-emerald-700 bg-emerald-50' },
          { label: 'In transit', value: '0', icon: Truck, tone: 'text-sky-700 bg-sky-50' },
          { label: 'Delivered', value: '0', icon: CheckCircle2, tone: 'text-neutral-700 bg-neutral-100' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">{label}</span>
              <span className={`grid size-9 place-items-center ${tone}`}><Icon className="size-4" aria-hidden="true" /></span>
            </div>
            <p className="mt-4 text-2xl font-black tracking-tight text-neutral-950">{value}</p>
            <p className="mt-1 text-xs text-neutral-500">No connected order records</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-bold text-neutral-950">Orders</h2>
              <p className="mt-1 text-xs text-neutral-500">Filter by fulfillment stage or search for an order.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block min-w-0 sm:w-72">
                <span className="sr-only">Search orders by customer or order ID</span>
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or order ID" className="w-full border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <Button variant="outline" disabled aria-label="Additional filters; unavailable until order data is connected">
                <SlidersHorizontal data-icon="inline-start" /> Filters
              </Button>
            </div>
          </div>
          <div className="mt-5 -mb-4 flex gap-1 overflow-x-auto pb-1" role="group" aria-label="Filter orders by status">
            {filters.map(({ label, icon: Icon }) => (
              <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${filter === label ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}>
                <Icon className="size-3.5" aria-hidden="true" />{label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              <tr>
                <th className="w-12 px-5 py-3"><span className="sr-only">Select order</span><input type="checkbox" disabled aria-label="Select all orders; unavailable until order data is connected" className="size-4 accent-emerald-700" /></th>
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Fulfillment</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center">
                    <span className="grid size-14 place-items-center rounded-full bg-neutral-100 text-neutral-500"><ShoppingBag className="size-6" aria-hidden="true" /></span>
                    <h3 className="mt-4 text-base font-bold text-neutral-900">{normalizedSearch ? 'No matching orders' : filter === 'All orders' ? 'Your order queue is empty' : `No ${filter.toLowerCase()} orders`}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">{normalizedSearch ? 'No order records are available to match this search.' : 'Once order data is connected, new purchases will appear here for fulfillment.'}</p>
                    {normalizedSearch && <button type="button" onClick={() => setSearch('')} className="mt-4 text-sm font-bold text-emerald-800 underline underline-offset-4">Clear search</button>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-3 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>0 orders</span>
          <span>Bulk updates and exports will be available when order data is connected.</span>
        </div>
      </div>
    </section>
  )
}
