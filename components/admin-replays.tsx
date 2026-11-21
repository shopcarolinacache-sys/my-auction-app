'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Film, Pencil, Plus, Save, Upload } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabase-browser'
import type { Replay, ReplayDemoType } from '@/components/replay-player'

const initialRows: Replay[] = [
  { id: 'demo-midnight-pull', title: 'The midnight card pull', duration: '08:42', winner_username: '@CharlotteCollector', winning_bid: 285, video_url: null, thumbnail_url: '/products/trading-card.png', demo_type: 'midnight-pull', is_active: true, sort_order: 0 },
  { id: 'demo-vintage-shelf', title: 'Vintage shelf tour', duration: '12:06', winner_username: '@RetroVaultNC', winning_bid: 148, video_url: null, thumbnail_url: '/products/action-figure.png', demo_type: 'vintage-shelf', is_active: true, sort_order: 1 },
  { id: 'demo-headphones-dark', title: 'Headphones after dark', duration: '06:18', winner_username: '@AudioHunter99', winning_bid: 220, video_url: null, thumbnail_url: '/products/headphones.png', demo_type: 'headphones-dark', is_active: true, sort_order: 2 },
]

type Draft = Pick<Replay, 'title' | 'duration' | 'winner_username' | 'winning_bid' | 'video_url' | 'thumbnail_url' | 'demo_type' | 'is_active'>
const emptyDraft: Draft = { title: '', duration: '00:00', winner_username: '', winning_bid: 0, video_url: null, thumbnail_url: null, demo_type: 'midnight-pull', is_active: true }
const fileName = (name: string) => name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-120)

export function AdminReplays() {
  const [rows, setRows] = useState<Replay[]>(initialRows)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const supabase = getBrowserSupabase()

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('live_replays').select('id,title,duration,winner_username,winning_bid,video_url,thumbnail_url,demo_type,is_active,sort_order').order('sort_order', { ascending: true })
    if (error) { setNotice(`Replays could not load: ${error.message}`); return }
    if (data) setRows(data.map((row) => ({ id: String(row.id), title: String(row.title), duration: String(row.duration ?? '00:00'), winner_username: String(row.winner_username ?? ''), winning_bid: Number(row.winning_bid ?? 0), video_url: row.video_url ?? null, thumbnail_url: row.thumbnail_url ?? null, demo_type: (row.demo_type ?? 'midnight-pull') as ReplayDemoType, is_active: Boolean(row.is_active), sort_order: Number(row.sort_order ?? 0) })))
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const startCreate = () => { setEditingId(null); setDraft({ ...emptyDraft }); setVideoFile(null); setThumbnailFile(null); setNotice(''); setFormOpen(true) }
  const startEdit = (row: Replay) => { setEditingId(row.id); setDraft({ title: row.title, duration: row.duration, winner_username: row.winner_username, winning_bid: row.winning_bid, video_url: row.video_url, thumbnail_url: row.thumbnail_url, demo_type: row.demo_type, is_active: row.is_active }); setVideoFile(null); setThumbnailFile(null); setNotice(''); setFormOpen(true) }
  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))

  async function upload(file: File, kind: 'video' | 'thumbnail') {
    if (!supabase) throw new Error('Supabase client is unavailable.')
    const path = `${kind}s/${crypto.randomUUID()}-${fileName(file.name)}`
    const { data, error } = await supabase.storage.from('replay-videos').upload(path, file, { upsert: false, contentType: file.type })
    if (error) throw error
    return supabase.storage.from('replay-videos').getPublicUrl(data.path).data.publicUrl
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) { setNotice('Supabase client is unavailable; replay changes were not saved.'); return }
    if (videoFile && !['video/mp4', 'video/webm'].includes(videoFile.type)) { setNotice('Choose an .mp4 or .webm video file.'); return }
    if (thumbnailFile && !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(thumbnailFile.type)) { setNotice('Choose a JPG, PNG, WebP, or AVIF thumbnail.'); return }
    setBusy(true); setNotice('')
    try {
      const videoUrl = videoFile ? await upload(videoFile, 'video') : draft.video_url
      const thumbnailUrl = thumbnailFile ? await upload(thumbnailFile, 'thumbnail') : draft.thumbnail_url
      const payload = { ...draft, video_url: videoUrl || null, thumbnail_url: thumbnailUrl || null, sort_order: editingId ? rows.find((row) => row.id === editingId)?.sort_order ?? rows.length : rows.length }
      const result = editingId && !editingId.startsWith('demo-')
        ? await supabase.from('live_replays').update(payload).eq('id', editingId)
        : await supabase.from('live_replays').insert(payload)
      if (result.error) throw result.error
      setNotice('Replay saved.'); setEditingId(null); setDraft({ ...emptyDraft }); setVideoFile(null); setThumbnailFile(null); setFormOpen(false); await load()
    } catch (error) {
      setNotice(error instanceof Error ? `Save failed: ${error.message}` : 'Replay could not be saved.')
    } finally { setBusy(false) }
  }

  async function toggle(row: Replay) {
    if (!supabase) { setNotice('Supabase client is unavailable; visibility was not changed.'); return }
    const isActive = !row.is_active
    const payload = { title: row.title, duration: row.duration, winner_username: row.winner_username, winning_bid: row.winning_bid, video_url: row.video_url, thumbnail_url: row.thumbnail_url, demo_type: row.demo_type, is_active: isActive, sort_order: row.sort_order }
    const result = row.id.startsWith('demo-')
      ? await supabase.from('live_replays').insert(payload)
      : await supabase.from('live_replays').update({ is_active: isActive }).eq('id', row.id)
    if (result.error) { setNotice(`Visibility could not be changed: ${result.error.message}`); return }
    if (row.id.startsWith('demo-')) await load()
    else setRows((current) => current.map((item) => item.id === row.id ? { ...item, is_active: isActive } : item))
  }

  async function reorder(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= rows.length || !supabase) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    const before = next[index].sort_order
    next[index] = { ...next[index], sort_order: next[target].sort_order }
    next[target] = { ...next[target], sort_order: before }
    setRows(next)
    const updates = next.slice(index, target + 1).map((row) => row.id.startsWith('demo-')
      ? supabase.from('live_replays').insert({ title: row.title, duration: row.duration, winner_username: row.winner_username, winning_bid: row.winning_bid, video_url: row.video_url, thumbnail_url: row.thumbnail_url, demo_type: row.demo_type, is_active: row.is_active, sort_order: row.sort_order })
      : supabase.from('live_replays').update({ sort_order: row.sort_order }).eq('id', row.id))
    const results = await Promise.all(updates)
    if (results.some((result) => result.error)) { setNotice('Reordering could not be saved to Supabase.'); await load() }
    else if (next.slice(index, target + 1).some((row) => row.id.startsWith('demo-'))) await load()
  }

  return <section className="space-y-6"><header className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end"><div><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Workspace / Replays</span><h1 className="mt-1 text-3xl font-extrabold">Past Live Auctions / Replays</h1><p className="mt-2 max-w-2xl text-sm text-neutral-500">Manage the storefront replay cards, demo clips, and uploaded video files.</p></div><button type="button" onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-emerald-400"><Plus className="size-4" />New replay</button></header>
    {notice && <p role="status" className="rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-700">{notice}</p>}
    {formOpen && <form onSubmit={save} className="grid gap-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_0.8fr]"><div className="grid content-start gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-neutral-600">Title<input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-emerald-500" /></label><label className="text-xs font-bold text-neutral-600">Duration<input required value={draft.duration} onChange={(event) => updateDraft('duration', event.target.value)} placeholder="08:42" className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-emerald-500" /></label><label className="text-xs font-bold text-neutral-600">Winner username<input required value={draft.winner_username} onChange={(event) => updateDraft('winner_username', event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-emerald-500" /></label><label className="text-xs font-bold text-neutral-600">Winning bid ($)<input required min="0" step="0.01" type="number" value={draft.winning_bid} onChange={(event) => updateDraft('winning_bid', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-emerald-500" /></label><label className="text-xs font-bold text-neutral-600 sm:col-span-2">Demo scene<select value={draft.demo_type} onChange={(event) => updateDraft('demo_type', event.target.value as ReplayDemoType)} className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-emerald-500"><option value="midnight-pull">Midnight card pull</option><option value="vintage-shelf">Vintage shelf tour</option><option value="headphones-dark">Headphones after dark</option></select></label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.is_active} onChange={(event) => updateDraft('is_active', event.target.checked)} className="size-4 accent-emerald-500" />Visible on storefront</label></div><div className="flex flex-col gap-4"><label className="flex min-h-24 cursor-pointer flex-col justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm font-semibold text-neutral-700 hover:border-emerald-500"><span className="flex items-center gap-2"><Upload className="size-4 text-emerald-700" />Replay video (.mp4 or .webm)</span><span className="mt-1 text-xs font-normal text-neutral-500">{videoFile?.name ?? (draft.video_url ? 'A video is currently attached' : 'No video attached — plays the animated demo')}</span><input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} className="sr-only" /></label><label className="flex min-h-24 cursor-pointer flex-col justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm font-semibold text-neutral-700 hover:border-emerald-500"><span className="flex items-center gap-2"><Upload className="size-4 text-emerald-700" />Thumbnail image</span><span className="mt-1 text-xs font-normal text-neutral-500">{thumbnailFile?.name ?? (draft.thumbnail_url ? 'A thumbnail is currently attached' : 'Optional — themed fallback is used')}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} className="sr-only" /></label><div className="mt-auto flex justify-end gap-2"><button type="button" onClick={() => { setEditingId(null); setDraft({ ...emptyDraft }); setVideoFile(null); setThumbnailFile(null); setFormOpen(false) }} className="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100">Cancel</button><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Save className="size-4" />{busy ? 'Saving…' : 'Save replay'}</button></div></div></form>}
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"><div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-neutral-100 bg-neutral-50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 sm:grid-cols-[minmax(0,1fr)_140px_150px]"><span>Replay</span><span className="hidden sm:block">Winning bid</span><span className="text-right">Manage</span></div>{rows.map((row, index) => <article key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-neutral-100 px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_140px_150px]"><div className="flex min-w-0 items-center gap-3"><img src={row.thumbnail_url || initialRows.find((item) => item.demo_type === row.demo_type)?.thumbnail_url || '/products/trading-card.png'} alt="" className="size-14 shrink-0 rounded-lg bg-neutral-100 object-cover" /><div className="min-w-0"><p className="truncate text-sm font-bold">{row.title}</p><p className="mt-1 truncate text-xs text-neutral-500">{row.duration} · {row.winner_username}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${row.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>{row.is_active ? 'Visible' : 'Hidden'}{row.video_url ? ' · video' : ' · demo'}</span></div></div><p className="hidden text-sm font-bold sm:block">${Number(row.winning_bid).toLocaleString()}</p><div className="flex items-center justify-end gap-1"><button type="button" aria-label={`Move ${row.title} up`} disabled={index === 0} onClick={() => void reorder(index, -1)} className="grid size-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" aria-label={`Move ${row.title} down`} disabled={index === rows.length - 1} onClick={() => void reorder(index, 1)} className="grid size-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><ArrowDown className="size-4" /></button><button type="button" onClick={() => void toggle(row)} className="rounded-lg px-2 py-1.5 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100">{row.is_active ? 'Hide' : 'Show'}</button><button type="button" aria-label={`Edit ${row.title}`} onClick={() => startEdit(row)} className="grid size-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100"><Pencil className="size-4" /></button></div></article>)}</div>
    {!rows.length && <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center"><Film className="mx-auto size-6 text-neutral-400" /><p className="mt-2 text-sm font-semibold">No replay records yet</p></div>}
  </section>
}
