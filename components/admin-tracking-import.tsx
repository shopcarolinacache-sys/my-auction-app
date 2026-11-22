'use client'

import { useMemo, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Order = { id: string; order_number: string; customer_name: string; customer_email: string; fulfillment_status: string; carrier: string | null; tracking_number: string | null }
type TrackingRow = { orderId: string; orderNumber: string; carrier: string; trackingNumber: string; order: Order | null; warning: string }
type ImportRow = { orderId: string; carrier: string; trackingNumber: string; order: Order }

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index += 1 }
      else quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell.trim()); cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell.trim()); cell = ''
      if (row.some(Boolean)) rows.push(row)
      row = []
    } else cell += character
  }
  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function normalizeHeader(value: string) { return value.replace(/^\uFEFF/, '').toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '') }

export function AdminTrackingImport({ orders, onClose, onConfirm, busy }: {
  orders: Order[]
  onClose: () => void
  onConfirm: (rows: ImportRow[], sendEmails: boolean) => void
  busy: boolean
}) {
  const [rows, setRows] = useState<TrackingRow[]>([])
  const [fileName, setFileName] = useState('')
  const [sendEmails, setSendEmails] = useState(true)
  const [error, setError] = useState('')

  const validRows = useMemo(() => rows.filter((row): row is TrackingRow & { order: Order } => !!row.order && !!row.carrier && !!row.trackingNumber && !row.warning).map((row) => ({ orderId: row.order.id, carrier: row.carrier, trackingNumber: row.trackingNumber, order: row.order })), [rows])

  async function readFile(file?: File) {
    if (!file) return
    setError('')
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Choose a .csv file.'); setRows([]); setFileName(''); return }
    const parsed = parseCsv(await file.text())
    if (parsed.length < 2) { setError('The CSV needs a header row and at least one tracking row.'); setRows([]); return }
    const headers = parsed[0].map(normalizeHeader)
    const indexOf = (...names: string[]) => headers.findIndex((header) => names.includes(header))
    const idIndex = indexOf('order_id', 'id')
    const numberIndex = indexOf('order_number', 'ordernumber')
    const carrierIndex = indexOf('carrier', 'shipping_carrier', 'service')
    const trackingIndex = indexOf('tracking_number', 'tracking', 'trackingnumber', 'tracking_no')
    if ((idIndex < 0 && numberIndex < 0) || trackingIndex < 0) {
      setError('Required columns: order_id or order_number, and tracking_number or tracking. Carrier is also required for dispatch.')
      setRows([])
      return
    }
    const seen = new Set<string>()
    const nextRows = parsed.slice(1).map((values) => {
      const orderId = idIndex >= 0 ? values[idIndex] ?? '' : ''
      const orderNumber = numberIndex >= 0 ? values[numberIndex] ?? '' : ''
      const carrier = carrierIndex >= 0 ? values[carrierIndex] ?? '' : ''
      const trackingNumber = values[trackingIndex] ?? ''
      const order = orders.find((candidate) => (orderId && candidate.id.toLowerCase() === orderId.toLowerCase()) || (orderNumber && candidate.order_number.toLowerCase() === orderNumber.toLowerCase())) ?? null
      const key = order?.id ?? `${orderId}:${orderNumber}`
      let warning = !order ? 'No matching order' : !carrier ? 'Carrier is missing' : !trackingNumber ? 'Tracking number is missing' : ''
      if (order && seen.has(key)) warning = 'Duplicate order row; only one tracking record per order is allowed'
      if (order) seen.add(key)
      return { orderId, orderNumber, carrier, trackingNumber, order, warning }
    })
    setRows(nextRows)
    setFileName(file.name)
    setSendEmails(true)
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}><section role="dialog" aria-modal="true" aria-labelledby="tracking-import-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col bg-white shadow-2xl">
    <header className="flex items-start justify-between border-b border-neutral-200 p-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Batch fulfillment</p><h2 id="tracking-import-title" className="mt-1 text-xl font-black text-neutral-950">Import tracking CSV</h2><p className="mt-1 text-sm text-neutral-600">Match tracking records to orders before updating shipment status.</p></div><button type="button" aria-label="Close import dialog" onClick={onClose} disabled={busy} className="grid size-9 place-items-center border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"><X className="size-4" /></button></header>
    <div className="flex-1 overflow-y-auto p-5"><label className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center hover:border-emerald-600"><Upload className="size-5 text-emerald-700" aria-hidden="true" /><span className="text-sm font-semibold">{fileName || 'Choose a CSV file'}</span><span className="text-xs text-neutral-500">Columns: order_id or order_number, carrier, tracking_number or tracking</span><input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void readFile(event.currentTarget.files?.[0])} /></label>
      {error && <p role="alert" className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {rows.length > 0 && <><div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Preview <span className="font-normal text-neutral-500">{validRows.length} ready · {rows.length - validRows.length} need attention</span></h3><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={sendEmails} onChange={(event) => setSendEmails(event.target.checked)} />Send shipping confirmation emails via Resend</label></div><div className="mt-3 overflow-x-auto border border-neutral-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-neutral-50 text-xs uppercase text-neutral-500"><tr><th className="px-3 py-2">Order</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Current status</th><th className="px-3 py-2">Carrier</th><th className="px-3 py-2">Tracking number</th><th className="px-3 py-2">Result</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.orderId}-${row.orderNumber}-${index}`} className="border-t border-neutral-100"><td className="px-3 py-2 font-semibold">{row.order?.order_number || row.orderNumber || row.orderId || '—'}</td><td className="px-3 py-2">{row.order?.customer_name || '—'}</td><td className="px-3 py-2 capitalize">{row.order?.fulfillment_status || '—'}</td><td className="px-3 py-2">{row.carrier || '—'}</td><td className="px-3 py-2 font-mono text-xs">{row.trackingNumber || '—'}</td><td className={`px-3 py-2 text-xs font-semibold ${row.warning ? 'text-amber-800' : 'text-emerald-800'}`}>{row.warning || 'Matched'}</td></tr>)}</tbody></table></div></>}
    </div><footer className="flex flex-col-reverse justify-between gap-3 border-t border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center"><Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={() => onConfirm(validRows, sendEmails)} disabled={busy || validRows.length === 0}>{busy ? 'Updating shipments…' : `Dispatch ${validRows.length} order${validRows.length === 1 ? '' : 's'}`}</Button></footer>
  </section></div>
}
