'use client'

import { createContext, useCallback, useContext, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { products, type Category, type Product, type Stock } from '@/data/products'

export type ListingStatus = 'Available' | 'Sold' | 'Draft'
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
      image: input.image || '/products/trading-card.png',
      image_url: input.image || '/products/trading-card.png',
      createdAt: new Date().toISOString(),
    }
    setItems((current) => [item, ...current])
    notify(`${item.title} added to this session.`)
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
    notify('Inventory changes saved for this browser session.')
  }, [notify])

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    notify('Item removed from this browser session.')
  }, [notify])
  const openEditor = useCallback((item?: InventoryItem, category?: Category) => {
    setEditorItemId(item?.id ?? null)
    setEditorDefaultCategory(category ?? item?.category ?? 'collectibles')
    setEditorOpen(true)
  }, [])
  const closeEditor = useCallback(() => setEditorOpen(false), [])

  return <InventoryContext.Provider value={{ items, visibleItems, createItem, updateItem, removeItem, openEditor, notify }}>
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
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Choose an image under 5 MB. Image previews stay in this browser session and are not uploaded.')
      event.currentTarget.value = ''
      return
    }
    setBusy(true)
    const reader = new FileReader()
    reader.onload = () => { setImage(String(reader.result ?? '')); setError(''); setBusy(false); notify('Image preview is ready. It has not been uploaded to storage.') }
    reader.onerror = () => { setError('This image could not be previewed.'); setBusy(false); notify('Image preview could not be created.') }
    reader.readAsDataURL(file)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedPrice = Number(price)
    const parsedQuantity = Number(quantity)
    if (!title.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setError('Enter an item title, a valid price, and a whole-number quantity of zero or more.')
      return
    }
    onSave({ title: title.trim(), description: description.trim(), price: Math.round(parsedPrice * 100) / 100, category, quantity: parsedQuantity, listingStatus, image })
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
        <label><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Status</span><select value={listingStatus} onChange={(event) => setListingStatus(event.target.value as ListingStatus)} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700"><option>Available</option><option>Sold</option><option>Draft</option></select></label>
        <div className="sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">Product image · browser preview only</span><label className="flex cursor-pointer items-center gap-4 border border-dashed border-neutral-300 bg-white p-3 hover:border-emerald-700"><span className="grid size-16 shrink-0 place-items-center overflow-hidden bg-neutral-100">{image ? <img src={image} alt="Selected product preview" className="size-full object-cover" /> : <ImagePlus className="size-5 text-neutral-400" />}</span><span className="text-xs font-bold">{busy ? 'Preparing preview…' : 'Choose an image'}<span className="mt-1 block font-normal text-neutral-500">JPEG, PNG, WebP · up to 5 MB. Not uploaded to storage.</span></span><input type="file" accept="image/*" onChange={handleImage} className="sr-only" /></label></div>
        {error && <p role="alert" className="sm:col-span-2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 sm:col-span-2"><button type="button" onClick={onClose} className="border border-neutral-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider">Cancel</button><button disabled={busy} type="submit" className="bg-neutral-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50">{item ? 'Save changes' : 'Add item'}</button></div>
      </form>
    </section>
  </div>
}
