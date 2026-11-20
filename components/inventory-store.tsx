'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { normalizeProductImages, products, type Category, type Product, type Stock } from '@/data/products'
import { getBrowserSupabase } from '@/lib/supabase-browser'

export type ListingStatus = 'Available' | 'Sold' | 'Draft'
export const SHIPPING_PRESETS = [{ id: 'flat', label: 'Flat Mailer (8 oz - 11x9x1)', tier: 'Flat Mailer', w: 8, l: 11, wd: 9, h: 1 }, { id: 'small', label: 'Small Box (16 oz - 10x8x4)', tier: 'Standard Box (1 lb)', w: 16, l: 10, wd: 8, h: 4 }, { id: 'med', label: 'Medium Box (48 oz - 14x12x6)', tier: 'Medium Box (3 lb)', w: 48, l: 14, wd: 12, h: 6 }, { id: 'large', label: 'Large Box (96 oz - 18x14x10)', tier: 'Large Box (6 lb)', w: 96, l: 18, wd: 14, h: 10 }]
export type InventoryItem = Product & { quantity: number; listingStatus: ListingStatus; createdAt: string }

type NewInventoryItem = {
  title: string
  description: string
  price: number
  category: Category
  quantity: number
  listingStatus: ListingStatus
  image: string
}
type InventoryContextValue = {
  items: InventoryItem[]
  visibleItems: InventoryItem[]
  createItem: (input: NewInventoryItem) => InventoryItem
  updateItem: (id: string, updates: Partial<NewInventoryItem>) => void
  removeItem: (id: string) => void
  openEditor: (item?: InventoryItem, category?: Category) => void
  notify: (message: string) => void
  importExistingItems: () => Promise<number>
}

function fromDatabase(row: any): InventoryItem {
  const rawCategory = String(row.category ?? '').toLowerCase()
  const category: Category = rawCategory.includes('card') ? 'cards' : rawCategory.includes('toy') ? 'toys' : rawCategory.includes('electronic') ? 'electronics' : 'collectibles'
  const images = normalizeProductImages(row.images)
  const image = images[0] ?? '/products/trading-card.png'
  const quantity = Number(row.stock ?? 0)
  const listingStatus: ListingStatus = row.status === 'draft' ? 'Draft' : row.status === 'sold' || quantity <= 0 ? 'Sold' : 'Available'
  const stock = stockFor(quantity, listingStatus)
  return { id: String(row.id), title: row.title ?? '', name: row.title ?? '', description: row.description ?? '', price: Number(row.price ?? 0), category, categoryLabel: categoryLabels[category], condition: row.condition ?? 'Excellent', stock, status: stock, quantity, listingStatus, image, image_url: image, images, createdAt: row.created_at ?? new Date().toISOString() }
}

function toDatabase(item: InventoryItem | NewInventoryItem) {
  return { title: item.title, description: item.description, price: item.price, category: item.category, condition: 'condition' in item ? item.condition : 'Excellent', stock: item.quantity, status: item.listingStatus === 'Draft' ? 'draft' : item.listingStatus === 'Sold' ? 'sold' : 'active', images: [item.image || '/products/trading-card.png'], section_placement: 'collection', weight_oz: (item as any).weight_oz ?? 16, length_in: (item as any).length_in ?? 10, width_in: (item as any).width_in ?? 8, height_in: (item as any).height_in ?? 4, shipping_tier: (item as any).shipping_tier ?? 'Standard Box (1 lb)' }
}

const categoryLabels: Record<Category, string> = {
  cards: 'Rare Trading Cards',
  toys: 'Vintage Toys & Objects',
  electronics: 'Rare Electronics',
  collectibles: 'Collectibles & Curiosities',
}
const categories: Array<{ value: Category; label: string }> = [
  { value: 'cards', label: 'Trading cards' },
  { value: 'toys', label: 'Vintage toys' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'collectibles', label: 'Collectibles' },
]
const stockFor = (quantity: number, status: ListingStatus): Stock => status === 'Sold' || quantity <= 0 ? 'Sold Out' : quantity <= 2 ? 'Low Stock' : 'In Stock'
const initialItems: InventoryItem[] = products.map((product, index) => ({
  ...product,
  quantity: product.stock === 'Sold Out' ? 0 : product.stock === 'Low Stock' ? 2 : 8,
  listingStatus: product.stock === 'Sold Out' ? 'Sold' : 'Available',
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
}))

const InventoryContext = createContext<InventoryContextValue | null>(null)

export function useInventory() {
  const value = useContext(InventoryContext)
  if (!value) throw new Error('useInventory must be used inside InventoryProvider')
  return value
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const [editorItemId, setEditorItemId] = useState<string | null>(null)
  useEffect(() => {
    const client = getBrowserSupabase()
    if (!client) return
    let alive = true
    const load = async () => {
      const { data, error } = await client.from('products').select('id,title,description,price,category,section_placement,condition,stock,status,images,created_at').order('created_at', { ascending: false })
      if (!alive || error || !data?.length) return
      setItems(data.map(fromDatabase))
    }
    void load()
    const channel = client.channel('storefront-products-live').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
      if (payload.eventType === 'DELETE') setItems((current) => current.filter((item) => item.id !== String((payload.old as any).id)))
      else if (payload.new) setItems((current) => { const next = fromDatabase(payload.new); return [next, ...current.filter((item) => item.id !== next.id)] })
    }).subscribe()
    return () => { alive = false; void client.removeChannel(channel) }
  }, [])
  const [editorDefaultCategory, setEditorDefaultCategory] = useState<Category>('collectibles')
  const [editorOpen, setEditorOpen] = useState(false)
  const [toast, setToast] = useState('')
  const notify = useCallback((message: string) => setToast(message), [])
  const visibleItems = useMemo(() => items.filter((item) => item.listingStatus !== 'Draft'), [items])

  const createItem = useCallback((input: NewInventoryItem) => {
    const item: InventoryItem = {
      id: `local-${crypto.randomUUID()}`,
      title: input.title,
      name: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      categoryLabel: categoryLabels[input.category],
      condition: 'Excellent',
      stock: stockFor(input.quantity, input.listingStatus),
      status: stockFor(input.quantity, input.listingStatus),
      quantity: input.quantity,
      listingStatus: input.listingStatus,
      image: input.image?.trim() || '/products/trading-card.png',
      image_url: input.image?.trim() || '/products/trading-card.png',
      images: input.image?.trim() ? [input.image.trim()] : [],
      createdAt: new Date().toISOString(),
    }
    setItems((current) => [item, ...current])
    const client = getBrowserSupabase()
    if (client) void client.from('products').insert(toDatabase(item)).select('id,title,description,price,category,section_placement,condition,stock,status,images,created_at').single().then(({ data, error }) => {
      if (error) { notify(`Could not save ${item.title}: ${error.message}`); return }
      if (data) setItems((current) => current.map((entry) => entry.id === item.id ? fromDatabase(data) : entry))
      notify(`${item.title} saved to Supabase.`)
    })
    else notify(`${item.title} added to this session.`)
    return item
  }, [notify])

  const updateItem = useCallback((id: string, updates: Partial<NewInventoryItem>) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item
      const next = { ...item, ...updates }
      const listingStatus = updates.listingStatus ?? item.listingStatus
      const quantity = updates.quantity ?? item.quantity
      const category = updates.category ?? item.category
      const stock = stockFor(quantity, listingStatus)
      return {
        ...next,
        title: next.title,
        name: next.title,
        category,
        categoryLabel: categoryLabels[category],
        quantity,
        listingStatus,
        stock,
        status: stock,
        image_url: next.image,
      }
    }))
    const current = items.find((item) => item.id === id)
    const next = current ? { ...current, ...updates, title: updates.title ?? current.title, name: updates.title ?? current.title, category: updates.category ?? current.category, quantity: updates.quantity ?? current.quantity, listingStatus: updates.listingStatus ?? current.listingStatus, image: updates.image ?? current.image } : null
    const client = getBrowserSupabase()
    if (client && next && !id.startsWith('local-')) void client.from('products').update(toDatabase(next)).eq('id', id).then(({ error }) => notify(error ? `Could not save inventory change: ${error.message}` : 'Inventory change saved to Supabase.'))
    else notify('Inventory changes saved in this session.')
  }, [items, notify])

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    const client = getBrowserSupabase()
    if (client && !id.startsWith('local-')) void client.from('products').delete().eq('id', id).then(({ error }) => notify(error ? `Could not remove item: ${error.message}` : 'Item removed from Supabase.'))
    else notify('Item removed from this session.')
  }, [notify])

  const importExistingItems = useCallback(async () => {
    const client = getBrowserSupabase()
    if (!client) throw new Error('Supabase client is not configured.')
    const { data: existing, error: readError } = await client.from('products').select('title')
    if (readError) throw readError
    const known = new Set((existing ?? []).map((row) => String(row.title).trim().toLowerCase()))
    const toImport = products.filter((product) => !known.has(product.title.trim().toLowerCase())).map((product) => toDatabase({ ...product, quantity: product.stock === 'Sold Out' ? 0 : product.stock === 'Low Stock' ? 2 : 8, listingStatus: product.stock === 'Sold Out' ? 'Sold' : 'Available', image: product.image }))
    if (!toImport.length) return 0
    const { error } = await client.from('products').insert(toImport)
    if (error) throw error
    const { data } = await client.from('products').select('id,title,description,price,category,section_placement,condition,stock,status,images,created_at').order('created_at', { ascending: false })
    if (data?.length) setItems(data.map(fromDatabase))
    return toImport.length
  }, [])
  const openEditor = useCallback((item?: InventoryItem, category?: Category) => {
    setEditorItemId(item?.id ?? null)
    setEditorDefaultCategory(category ?? item?.category ?? 'collectibles')
    setEditorOpen(true)
  }, [])
  const closeEditor = useCallback(() => setEditorOpen(false), [])

  return <InventoryContext.Provider value={{ items, visibleItems, createItem, updateItem, removeItem, openEditor, notify, importExistingItems }}>
    {children}
    {toast && <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[110] flex max-w-sm items-center gap-4 border border-emerald-700 bg-neutral-950 px-4 py-3 text-xs font-semibold text-white shadow-xl"><span>{toast}</span><button onClick={() => setToast('')} className="shrink-0 text-emerald-300 underline underline-offset-2">Dismiss</button></div>}
    {editorOpen && <InventoryEditorDialog
      item={items.find((entry) => entry.id === editorItemId) ?? null}
      defaultCategory={editorDefaultCategory}
      notify={notify}
      onClose={closeEditor}
      onSave={(input) => {
        if (editorItemId) updateItem(editorItemId, input)
        else createItem(input)
        closeEditor()
      }}
    />}
  </InventoryContext.Provider>
}

function InventoryEditorDialog({ item, defaultCategory, notify, onClose, onSave }: {
  item: InventoryItem | null
  defaultCategory: Category
  notify: (message: string) => void
  onClose: () => void
  onSave: (input: NewInventoryItem) => void
}) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [price, setPrice] = useState(item ? String(item.price) : '')
  const [category, setCategory] = useState<Category>(item?.category ?? defaultCategory)
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '1')
  const [listingStatus, setListingStatus] = useState<ListingStatus>(item?.listingStatus ?? 'Available')
  const [image, setImage] = useState(item?.image ?? '')
  const [presetId, setPresetId] = useState(SHIPPING_PRESETS.find((p) => p.tier === (item as any)?.shipping_tier)?.id ?? 'small')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Choose an image under 5 MB.')
      event.currentTarget.value = ''
      return
    }
    setBusy(true)
    const client = getBrowserSupabase()
    if (!client) { setError('Supabase is unavailable.'); setBusy(false); return }
    const path = `products/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const { data, error } = await client.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false })
    if (error || !data) { setError(error?.message ?? 'Image upload failed.'); setBusy(false); return }
    setImage(client.storage.from('product-images').getPublicUrl(data.path).data.publicUrl)
    setError('')
    setBusy(false)
    notify('Image uploaded to product-images.')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedPrice = Number(price)
    const parsedQuantity = Number(quantity)
    if (!title.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setError('Enter an item title, a valid price, and a whole-number quantity of zero or more.')
      return
    }
    const pr = SHIPPING_PRESETS.find((p) => p.id === presetId) ?? SHIPPING_PRESETS[1]; onSave({ title: title.trim(), description: description.trim(), price: Math.round(parsedPrice * 100) / 100, category, quantity: parsedQuantity, listingStatus, image, weight_oz: pr.w, length_in: pr.l, width_in: pr.wd, height_in: pr.h, shipping_tier: pr.tier } as any)
  }

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="inventory-editor-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-neutral-200 bg-[#f7f7f4] p-5 text-neutral-950 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between border-b border-neutral-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Carolina Cache · Inventory</p><h2 id="inventory-editor-title" className="mt-2 text-2xl font-black tracking-tight">{item ? 'Edit item' : 'Add a find'}</h2><p className="mt-1 text-xs text-neutral-500">Edits update the current storefront session only.</p></div><button type="button" onClick={onClose} aria-label="Close item editor" className="grid size-9 place-items-center border border-neutral-200 bg-white"><X className="size-4" /></button></div>
      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Title</span><input required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700" /></label>
        <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Description</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700" /></label>
        <label><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Price</span><input type="number" required min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700" /></label>
        <label><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Quantity</span><input type="number" required min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700" /></label>
        <label><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Category</span><select value={category} onChange={(event) => setCategory(event.target.value as Category)} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700">{categories.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select></label>
        <label><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Status</span><select value={listingStatus} onChange={(event) => setListingStatus(event.target.value as ListingStatus)} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700"><option>Available</option><option>Sold</option><option>Draft</option></select></label><label className='sm:col-span-2'><span className='mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600'>Shipping Package Preset</span><select value={presetId} onChange={(e) => setPresetId(e.target.value)} className='w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700'>{SHIPPING_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
        <div className="sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Product image · browser preview only</span><label className="flex cursor-pointer items-center gap-4 border border-dashed border-neutral-300 bg-white p-3 hover:border-emerald-700"><span className="grid size-16 shrink-0 place-items-center overflow-hidden bg-neutral-100">{image ? <img src={image} alt="Selected product preview" className="size-full object-cover" /> : <ImagePlus className="size-5 text-neutral-400" />}</span><span className="text-xs font-bold">{busy ? 'Preparing preview…' : 'Choose an image'}<span className="mt-1 block font-normal text-neutral-500">JPEG, PNG, WebP · up to 5 MB. Not uploaded to storage.</span></span><input type="file" accept="image/*" onChange={handleImage} className="sr-only" /></label></div>
        {error && <p role="alert" className="sm:col-span-2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 sm:col-span-2"><button type="button" onClick={onClose} className="border border-neutral-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider">Cancel</button><button disabled={busy} type="submit" className="bg-neutral-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50">{item ? 'Save changes' : 'Add item'}</button></div>
      </form>
    </section>
  </div>
}
