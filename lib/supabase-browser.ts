import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null | undefined

export function getBrowserSupabase() {
  if (browserClient !== undefined) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://cjlraclxbmhbnsgvtjar.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  browserClient = key ? createClient(url, key) : null
  return browserClient
}
