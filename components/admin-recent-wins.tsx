'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { Check, ImagePlus, Plus, Save, Trash2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import { DEFAULT_RECENT_WINS, RecentWin, RecentWinCategory } from '@/data/storefront'

const SETTINGS_KEY = 'recent_wins'
const categories: RecentWinCategory[] = ['The Vault', 'The Shelf', 'The Archive']

function normalizeWins(value: unknown): RecentWin[] {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  if (!Array.isArray(parsed)) return DEFAULT_RECENT_WINS
  return parsed.filter((item): item is RecentWin => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.category === 'string' && typeof item.price === 'number' && typeof item.image === 'string')
}

export function AdminRecentWins() {
  const [wins, setWins] = useState<RecentWin[]>(DEFAULT_RECENT_WINS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const supabase = getBrowserSupabase()
    if (!supabase) {
      setNotice('Supabase is unavailable. Changes cannot be saved in this session.')
      setLoading(false)
      return
    }
    void supabase.from('site_settings').select('key,value').eq('key', SETTINGS_KEY).maybeSingle().then(async ({ data, error }) => {
      if (!active) return
      if (error) {
        setNotice(`Could not load collector wins: ${error.message}`)
        setLoading(false)
        return
      }
      if (data?.value) {
        try { setWins(normalizeWins(data.value)) } catch { setNotice('Saved collector wins could not be read. Your existing data has not been changed.') }
      } else {
        const { error: seedError } = await supabase.from('site_settings').upsert({ key: SETTINGS_KEY, value: JSON.stringify(DEFAULT_RECENT_WINS) }, { onConflict: 'key' })
        if (!active) return
        setWins(DEFAULT_RECENT_WINS)
        if (seedError) setNotice(`Showing starter wins. They could not be saved yet: ${seedError.message}`)
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  function updateWin(id: string, patch: Partial<RecentWin>) {
    setNotice('')
    setWins((current) => current.map((win) => win.id === id ? { ...win, ...patch } : win))
  }

  async function uploadPhoto(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setNotice('Choose an image file smaller than 5 MB.')
      return
    }
    const supabase = getBrowserSupabase()
    if (!supabase) { setNotice('Supabase is unavailable.'); return }
    setNotice('Uploading image…')
    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `recent-wins/${id}-${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false })
    if (error) { setNotice(`Image upload failed: ${error.message}`); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    updateWin(id, { image: data.publicUrl })
    setNotice('Photo uploaded. Save changes to publish it.')
  }

  async function saveWins() {
    const supabase = getBrowserSupabase()
    if (!supabase) { setNotice('Supabase is unavailable. Changes were not saved.'); return }
    if (wins.some((win) => !win.title.trim() || !Number.isFinite(win.price) || win.price < 0 || !win.image.trim())) {
      setNotice('Each item needs a title, a valid sold price, and an image URL.')
      return
    }
    setSaving(true)
    setNotice('')
    const { error } = await supabase.from('site_settings').upsert({ key: SETTINGS_KEY, value: JSON.stringify(wins) }, { onConflict: 'key' })
    setSaving(false)
    setNotice(error ? `Save failed: ${error.message}` : 'Collector wins saved to Supabase.')
  }

  function addWin() {
    const id = crypto.randomUUID()
    setWins((current) => [...current, { id, title: 'New collector win', category: 'The Vault', price: 0, image: DEFAULT_RECENT_WINS[0].image }])
  }

  return <section className="space-y-6">
    <header className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Storefront / Collector proof</p><h1 className="mt-2 text-3xl font-black tracking-tight">Recent Wins &amp; Sold</h1><p className="mt-2 max-w-xl text-sm text-neutral-600">Manage sold collectibles displayed on the storefront. Starter examples are stored in the existing site_settings table.</p></div>
      <div className="flex gap-2"><button type="button" onClick={addWin} className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold hover:border-neutral-950"><Plus className="size-4" />Add item</button><button type="button" onClick={saveWins} disabled={saving || loading} className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><Save className="size-4" />{saving ? 'Saving…' : 'Save changes'}</button></div>
    </header>
    {notice && <p role="status" className="border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">{notice}</p>}
    {loading ? <p className="py-8 text-sm text-neutral-500">Loading collector wins…</p> : <div className="grid gap-4 xl:grid-cols-2">{wins.map((win) => <article key={win.id} className="grid gap-4 border border-neutral-200 bg-white p-4 sm:grid-cols-[150px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-auto"><img src={win.image} alt={`Preview: ${win.title}`} className="size-full object-cover" onError={(event) => { event.currentTarget.style.opacity = '0' }} /></div>
      <div className="min-w-0 space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Item title<input value={win.title} onChange={(event) => updateWin(win.id, { title: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-emerald-600" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Category<select value={win.category} onChange={(event) => updateWin(win.id, { category: event.target.value as RecentWinCategory })} className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-emerald-600">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Sold price<input type="number" min="0" step="1" value={win.price} onChange={(event) => updateWin(win.id, { price: Number(event.target.value) })} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-emerald-600" /></label></div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Photo URL<input value={win.image} onChange={(event) => updateWin(win.id, { image: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-xs font-normal text-neutral-900 outline-none focus:border-emerald-600" /></label>
        <div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-800 hover:border-emerald-700"><ImagePlus className="size-4" />Upload photo<input type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadPhoto(win.id, event)} /></label><span className="inline-flex items-center gap-1 text-[10px] text-neutral-500"><Check className="size-3 text-emerald-700" />Public storefront photo</span><button type="button" onClick={() => setWins((current) => current.filter((item) => item.id !== win.id))} aria-label={`Delete ${win.title}`} className="ml-auto inline-flex items-center gap-1 px-2 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="size-4" />Delete</button></div>
      </div>
    </article>)}</div>}
  </section>
}
