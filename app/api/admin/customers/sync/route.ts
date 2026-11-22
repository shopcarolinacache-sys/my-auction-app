import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orderRows: Array<{ id: string; customer_name: string; customer_email: string; shipping_address: unknown; total: number }> = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('orders').select('id,customer_name,customer_email,shipping_address,total,created_at').order('created_at', { ascending: false }).range(offset, offset + 999)
    if (error) {
      console.error('Order sync failed:', error)
      return NextResponse.json({ error: `Order sync failed: ${error.message}`, code: error.code }, { status: 500 })
    }
    orderRows.push(...(data ?? []) as typeof orderRows)
    if (!data || data.length < 1000) break
  }

  const grouped = new Map<string, { email: string; full_name: string; address: unknown; total: number; orders: number; orderIds: string[] }>()
  for (const order of orderRows) {
    const email = String(order.customer_email ?? '').trim().toLowerCase(); if (!email) continue
    const previous = grouped.get(email) ?? { email, full_name: order.customer_name ?? '', address: order.shipping_address, total: 0, orders: 0, orderIds: [] }
    previous.total += Number(order.total ?? 0); previous.orders += 1; previous.orderIds.push(order.id)
    grouped.set(email, previous)
  }

  let failed = 0
  const errors: Array<{ email: string; message: string; code: string | null }> = []

  // Fetch existing customers to get their current full_name and default_shipping_address
  const { data: existingCustomers, error: fetchError } = await supabase.from('customers').select('id,email,full_name,default_shipping_address')
  if (fetchError) {
    console.error('Failed to fetch existing customers:', fetchError)
    return NextResponse.json({ error: `Failed to fetch existing customers: ${fetchError.message}`, code: fetchError.code }, { status: 500 })
  }
  const existingCustomersMap = new Map(existingCustomers?.map(c => [c.email.toLowerCase(), c]))

  for (const customer of grouped.values()) {
    const current = existingCustomersMap.get(customer.email)
    const upsertData = {
      email: customer.email,
      full_name: customer.full_name || current?.full_name,
      default_shipping_address: customer.address ?? current?.default_shipping_address,
      total_orders: customer.orders,
      total_spent: customer.total,
      last_activity_at: new Date().toISOString()
    }
    const result = await supabase.from('customers').upsert(upsertData, { onConflict: 'email' }).select('id').single()
    if (result.error || !result.data?.id) {
      failed++
      errors.push({ email: customer.email, message: result.error?.message || 'Unknown error during upsert', code: result.error?.code || null })
      console.error(`Failed to upsert customer ${customer.email}:`, result.error)
      continue
    }
    const { error: linkError } = await supabase.from('orders').update({ customer_id: result.data.id }).in('id', customer.orderIds)
    if (linkError) {
      failed++
      errors.push({ email: customer.email, message: `Failed to link orders: ${linkError.message}`, code: linkError.code || null })
      console.error(`Failed to link orders for customer ${customer.email}:`, linkError)
    }
  }

  return NextResponse.json({ failed, total: grouped.size, errors }, { status: 200 })
}
