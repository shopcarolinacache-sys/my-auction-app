import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST() {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json(
      { synced: 0, failed: 0, total: 0, errors: [{ email: 'system', message: 'Missing Supabase env vars', code: 'ENV_MISSING', details: null, hint: null }] },
      { status: 500 }
    )
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, customer_email, customer_name, customer_phone, shipping_address, created_at')
    .order('created_at', { ascending: false })

  if (ordersError) {
    return NextResponse.json(
      { synced: 0, failed: 0, total: 0, errors: [{ email: 'orders', message: ordersError.message, code: ordersError.code ?? null, details: ordersError.details ?? null, hint: ordersError.hint ?? null }] },
      { status: 500 }
    )
  }

  const grouped = new Map<string, { email: string; full_name: string | null; phone: string | null; default_shipping_address: unknown; orderIds: string[] }>()

  for (const row of orders ?? []) {
    const email = (row.customer_email ?? '').trim().toLowerCase()
    if (!email) continue
    const existing = grouped.get(email)
    if (!existing) {
      grouped.set(email, {
        email,
        full_name: row.customer_name?.trim() || null,
        phone: row.customer_phone?.trim() || null,
        default_shipping_address: row.shipping_address ?? null,
        orderIds: [row.id],
      })
    } else {
      if (!existing.full_name && row.customer_name?.trim()) existing.full_name = row.customer_name.trim()
      if (!existing.phone && row.customer_phone?.trim()) existing.phone = row.customer_phone.trim()
      if (!existing.default_shipping_address && row.shipping_address) existing.default_shipping_address = row.shipping_address
      existing.orderIds.push(row.id)
    }
  }

  let synced = 0
  let failed = 0
  const errors: Array<{ email: string; message: string; code: string | null; details: string | null; hint: string | null }> = []

  for (const [, customer] of grouped) {
    const { data: upserted, error: upsertError } = await supabase
      .from('customers')
      .upsert(
        {
          email: customer.email,
          full_name: customer.full_name,
          phone: customer.phone,
          default_shipping_address: customer.default_shipping_address,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single()

    if (upsertError || !upserted) {
      failed++
      errors.push({
        email: customer.email,
        message: upsertError?.message || 'Upsert failed',
        code: upsertError?.code ?? null,
        details: upsertError?.details ?? null,
        hint: upsertError?.hint ?? null,
      })
      continue
    }

    if (customer.orderIds.length > 0) {
      const { error: linkError } = await supabase
        .from('orders')
        .update({ customer_id: upserted.id })
        .in('id', customer.orderIds)

      if (linkError) {
        failed++
        errors.push({
          email: customer.email,
          message: linkError.message,
          code: linkError.code ?? null,
          details: linkError.details ?? null,
          hint: linkError.hint ?? null,
        })
        continue
      }
    }

    synced++
  }

  return NextResponse.json({ synced, failed, total: grouped.size, errors }, { status: 200 })
}
