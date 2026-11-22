import 'server-only'

import { createClient } from '@supabase/supabase-js'

export type CustomerPayload = {
  email: string
  full_name?: string | null
  phone?: string | null
  default_shipping_address?: unknown
  acquisition_source?: string | null
  marketing_opt_in?: boolean
  favorite_categories?: string[]
  tags?: string[]
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) throw new Error('Supabase is not configured.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const nonEmpty = (value: unknown) => {
  if (typeof value === 'string') return value.trim() || null
  if (Array.isArray(value)) return value.length ? value : null
  if (value && typeof value === 'object') return Object.keys(value).length ? value : null
  return value ?? null
}
const uniqueStrings = (values: unknown[]) => [...new Set(values.filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).map((value) => value.trim()))]

export async function upsertCustomer(payload: CustomerPayload) {
  const email = payload.email.trim().toLowerCase()
  if (!email) throw new Error('A customer email is required.')

  const supabase = getServerSupabase()
  const { data: existing, error: lookupError } = await supabase.from('customers').select('id,full_name,phone,default_shipping_address,acquisition_source,marketing_opt_in,favorite_categories,tags,total_orders,total_spent,auctions_won').eq('email', email).maybeSingle()
  if (lookupError) throw lookupError

  const merged = {
    email,
    full_name: nonEmpty(payload.full_name) ?? existing?.full_name ?? null,
    phone: nonEmpty(payload.phone) ?? existing?.phone ?? null,
    default_shipping_address: nonEmpty(payload.default_shipping_address) ?? existing?.default_shipping_address ?? null,
    acquisition_source: nonEmpty(payload.acquisition_source) ?? existing?.acquisition_source ?? null,
    marketing_opt_in: payload.marketing_opt_in === true || existing?.marketing_opt_in === true,
    favorite_categories: uniqueStrings([...(existing?.favorite_categories ?? []), ...(payload.favorite_categories ?? [])]),
    tags: uniqueStrings([...(existing?.tags ?? []), ...(payload.tags ?? [])]),
    last_activity_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('customers').upsert(merged, { onConflict: 'email' }).select('id,email,full_name,phone,default_shipping_address,acquisition_source,marketing_opt_in,favorite_categories,tags,total_orders,total_spent,auctions_won').single()
  if (error) throw error
  return data
}
