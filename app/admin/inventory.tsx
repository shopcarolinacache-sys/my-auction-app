'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowDownWideNarrow, Check, Download, Filter, PackagePlus, Plus, Search, Trash2 } from 'lucide-react'
import { useInventory, type InventoryItem, type ListingStatus } from '@/components/inventory-store'
import type { Category } from '@/data/products'

const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: 'cards', label: 'Trading cards' },
  { value: 'toys', label: 'Vintage toys' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'collectibles', label: 'Collectibles' },
]
const statusClass: Record<ListingStatus, string> = {
  Available: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Sold: 'border-neutral-300 bg-neutral-100 text-neutral-700',
  Draft: 'border-amber-200 bg-amber-50 text-amber-800',
}

type SortBy = 'newest' | 'price-asc' | 'price-desc' | 'stock'

export default function InventoryManagement() {
  const { items, updateItem, removeItem, openEditor, importExistingItems } = useInventory()
  const [importing, setImporting] = useState(false)

  async function syncExistingItems() {
    setImporting(true)
    try {
      const count = await importExistingItems()
      setNotice(count ? `Imported ${count} existing site item${count === 1 ? '' : 's'} into Supabase.` : 'All existing site items are already in Supabase.')
    } catch (error) {
      setNotice(error instanceof Error ? `Import failed: ${error.message}` : 'Import failed. Check Supabase access and table policies.')
    } finally { setImporting(false) }
  }
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [selected, setSelected] = useState<string[]>([])
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.categoryLabel}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesQuery && (category === 'all' || item.category === category) && (status === 'all' || item.listingStatus === status)
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'stock') return a.quantity - b.quantity
    return b.createdAt.localeCompare(a.createdAt)
  }), [category, items, query, sortBy, status])

  const selectedVisible = filtered.length > 0 && filtered.every((item) => selected.includes(item.id))
  function toggleAll() {
    setSelected((current) => selectedVisible ? current.filter((id) => !filtered.some((item) => item.id === id)) : Array.from(new Set([...current, ...filtered.map((item) => item.id)])))
  }
  function bulkMarkSold() {
    selected.forEach((id) => updateItem(id, { listingStatus: 'Sold', quantity: 0 }))
    setNotice(`${selected.length} item${selected.length === 1 ? '' : 's'} marked sold in this session.`)
    setSelected([])
  }
  function bulkDelete() {
    if (!selected.length || !window.confirm(`Remove ${selected.length} selected item${selected.length === 1 ? '' : 's'} from this session?`)) return
    selected.forEach(removeItem)
    setNotice(`${selected.length} item${selected.length === 1 ? '' : 's'} removed from this session.`)
    setSelected([])
  }
  function exportCsv() {
    const rows = items.filter((item) => selected.length === 0 || selected.includes(item.id))
    const csv = [['title', 'description', 'category', 'price', 'quantity', 'status'], ...rows.map((item) => [item.title, item.description, item.categoryLabel, String(item.price), String(item.quantity), item.listingStatus])]
      .map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'carolina-cache-inventory.csv'
    link.click()
    URL.revokeObjectURL(url)
    setNotice(`${rows.length} item${rows.length === 1 ? '' : 's'} exported as CSV.`)
  }

  return <section className="space-y-7 p-5 sm:p-8" aria-labelledby="inventory-title">
    <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Workspace / Inventory</p><h2 id="inventory-title" className="mt-2 text-3xl font-black tracking-tight">Inventory</h2><p className="mt-2 max-w-2xl text-sm text-zinc-500">Edit the live storefront catalog. Updates are shared across pages for this browser session.</p></div><div className="flex flex-wrap gap-2"><button disabled={importing} onClick={syncExistingItems} className="border border-emerald-700 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-emerald-800 disabled:opacity-50">{importing ? 'Syncing…' : 'Sync / Import Existing Site Items to Database'}</button><button onClick={() => openEditor()} className="inline-flex items-center justify-center gap-2 bg-zinc-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700"><Plus className="size-4" /> Add item</button></div></div>
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Total items" value={items.length} icon={<PackagePlus className="size-4" />} /><Metric label="Available" value={items.filter((item) => item.listingStatus === 'Available').length} icon={<Check className="size-4" />} /><Metric label="Low stock" value={items.filter((item) => item.listingStatus === 'Available' && item.quantity > 0 && item.quantity <= 2).length} icon={<ArrowDownWideNarrow className="size-4" />} /></div>
    <div className="border border-zinc-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between sm:p-5"><div><h3 className="font-bold">Catalog</h3><p className="mt-1 text-xs text-zinc-500">Inline edits apply immediately to the current session.</p></div><div className="grid gap-2 sm:grid-cols-2 lg:flex"><label className="relative"><span className="sr-only">Search inventory</span><Search className="absolute left-3 top-2.5 size-4 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items" className="w-full border border-zinc-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 lg:w-52" /></label><label className="relative"><span className="sr-only">Filter category</span><Filter className="absolute left-3 top-2.5 size-4 text-zinc-400" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full appearance-none border border-zinc-200 bg-white py-2 pl-9 pr-7 text-sm outline-none focus:border-emerald-600"><option value="all">All categories</option>{categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label><span className="sr-only">Filter status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"><option value="all">All statuses</option><option>Available</option><option>Sold</option><option>Draft</option></select></label><label className="relative"><span className="sr-only">Sort inventory</span><ArrowDownWideNarrow className="absolute left-3 top-2.5 size-4 text-zinc-400" /><select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} className="w-full appearance-none border border-zinc-200 bg-white py-2 pl-9 pr-7 text-sm outline-none focus:border-emerald-600"><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="stock">Stock level</option></select></label></div></div>
      {selected.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-5"><span className="mr-auto text-xs font-bold text-emerald-900">{selected.length} selected</span><button onClick={bulkMarkSold} className="border border-emerald-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-900">Mark sold</button><button onClick={exportCsv} className="inline-flex items-center gap-2 border border-emerald-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-900"><Download className="size-3.5" />Export</button><button onClick={bulkDelete} className="inline-flex items-center gap-2 border border-red-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-red-700"><Trash2 className="size-3.5" />Delete</button></div>}
      {notice && <p role="status" aria-live="polite" className="border-b border-emerald-100 px-5 py-3 text-xs font-semibold text-emerald-800">{notice}</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-500"><tr><th className="w-10 px-4 py-3"><input aria-label="Select all visible items" type="checkbox" checked={selectedVisible} onChange={toggleAll} /></th><th className="px-4 py-3">Item / description</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.length === 0 ? <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-500">No items match those filters.</td></tr> : filtered.map((item) => <InventoryRow key={item.id} item={item} selected={selected.includes(item.id)} onSelect={(checked) => setSelected((current) => checked ? [...current, item.id] : current.filter((id) => id !== item.id))} onUpdate={(updates) => updateItem(item.id, updates)} onEdit={() => openEditor(item)} onRemove={() => { removeItem(item.id); setNotice(`${item.title} removed from this session.`) }} />)}</tbody></table></div>
      <div className="flex flex-col justify-between gap-2 border-t border-zinc-100 px-5 py-3 text-[10px] text-zinc-500 sm:flex-row"><span>Showing {filtered.length} of {items.length} items</span><button onClick={exportCsv} className="inline-flex items-center gap-1.5 self-start font-bold uppercase tracking-wider hover:text-emerald-800"><Download className="size-3.5" /> Export {selected.length ? 'selected' : 'all'}</button></div>
    </div>
  </section>
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <div className="flex items-center justify-between border border-zinc-200 bg-white p-4"><div><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div><span className="grid size-9 place-items-center bg-emerald-50 text-emerald-800">{icon}</span></div> }

function InventoryRow({ item, selected, onSelect, onUpdate, onEdit, onRemove }: { item: InventoryItem; selected: boolean; onSelect: (checked: boolean) => void; onUpdate: (updates: { title?: string; description?: string; price?: number; category?: Category; quantity?: number; listingStatus?: ListingStatus }) => void; onEdit: () => void; onRemove: () => void }) {
  const lowStock = item.listingStatus === 'Available' && item.quantity > 0 && item.quantity <= 2
  return <tr className="align-top hover:bg-zinc-50/70"><td className="px-4 py-4"><input aria-label={`Select ${item.title}`} type="checkbox" checked={selected} onChange={(event) => onSelect(event.target.checked)} /></td><td className="max-w-[320px] px-4 py-4"><div className="flex gap-3"><img src={item.images?.[0]?.trim() || item.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/products/trading-card.png' }} className="size-12 shrink-0 border border-zinc-200 bg-zinc-100 object-cover" /><div className="min-w-0 flex-1"><InlineText ariaLabel={`Edit title for ${item.title}`} value={item.title} onSave={(value) => onUpdate({ title: value })} /><InlineText ariaLabel={`Edit description for ${item.title}`} value={item.description} onSave={(value) => onUpdate({ description: value })} multiline /></div></div></td><td className="px-4 py-4"><select aria-label={`Category for ${item.title}`} value={item.category} onChange={(event) => onUpdate({ category: event.target.value as Category })} className="max-w-36 border border-transparent bg-transparent px-1 py-1 text-xs hover:border-zinc-200 focus:border-emerald-600 focus:bg-white">{categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td className="px-4 py-4"><label className="flex items-center gap-1"><span className="text-zinc-400">$</span><InlineNumber ariaLabel={`Price for ${item.title}`} value={item.price} min={0} step="0.01" onSave={(value) => onUpdate({ price: Math.round(value * 100) / 100 })} /></label></td><td className="px-4 py-4"><select aria-label={`Status for ${item.title}`} value={item.listingStatus} onChange={(event) => onUpdate({ listingStatus: event.target.value as ListingStatus })} className={`border px-2 py-1 text-[10px] font-bold uppercase ${statusClass[item.listingStatus]}`}><option>Available</option><option>Sold</option><option>Draft</option></select></td><td className="px-4 py-4"><div className="flex items-center gap-2"><InlineNumber ariaLabel={`Quantity for ${item.title}`} value={item.quantity} min={0} step="1" onSave={(value) => onUpdate({ quantity: Math.floor(value) })} /><span className={`text-[9px] font-bold uppercase tracking-wider ${lowStock ? 'text-amber-700' : 'text-zinc-400'}`}>{lowStock ? 'Low' : item.listingStatus === 'Sold' ? 'Sold' : ''}</span></div></td><td className="px-4 py-4 text-right"><div className="inline-flex items-center gap-1"><button onClick={onEdit} className="border border-zinc-200 bg-white px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider hover:border-emerald-600">Edit</button><button onClick={onRemove} aria-label={`Delete ${item.title}`} className="grid size-8 place-items-center text-zinc-400 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" /></button></div></td></tr>
}

function InlineText({ value, onSave, ariaLabel, multiline = false }: { value: string; onSave: (value: string) => void; ariaLabel: string; multiline?: boolean }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  if (multiline) return <textarea aria-label={ariaLabel} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => { if (draft !== value) onSave(draft) }} className="mt-1 w-full resize-y border border-transparent bg-transparent px-1 py-1 text-[11px] leading-relaxed text-zinc-500 hover:border-zinc-200 focus:border-emerald-600 focus:bg-white focus:outline-none" />
  return <input aria-label={ariaLabel} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => { if (draft.trim() && draft !== value) onSave(draft.trim()); else setDraft(value) }} className="w-full border border-transparent bg-transparent px-1 py-1 text-xs font-bold hover:border-zinc-200 focus:border-emerald-600 focus:bg-white focus:outline-none" />
}

function InlineNumber({ value, onSave, ariaLabel, min, step }: { value: number; onSave: (value: number) => void; ariaLabel: string; min: number; step: string }) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])
  return <input aria-label={ariaLabel} type="number" min={min} step={step} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => { const parsed = Number(draft); if (draft !== '' && Number.isFinite(parsed) && parsed >= min) onSave(parsed); else setDraft(String(value)) }} className="w-20 border border-transparent bg-transparent px-1 py-1 text-xs font-semibold hover:border-zinc-200 focus:border-emerald-600 focus:bg-white focus:outline-none" />
}
