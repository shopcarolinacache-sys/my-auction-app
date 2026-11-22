import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendShippingConfirmation } from '@/lib/email'
import { isRateLimited } from '@/lib/request-security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (isRateLimited(request, 'bulk-shipping-email', 3)) {
    return NextResponse.json({ error: 'Please wait before sending another batch of tracking updates.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const orderIds = Array.isArray(body?.orderIds) ? [...new Set(body.orderIds.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0 && id.length <= 128))] : []
    if (!orderIds.length || orderIds.length > 100) return NextResponse.json({ error: 'Provide between 1 and 100 order IDs.' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !key) return NextResponse.json({ error: 'Shipping email is unavailable.' }, { status: 503 })

    const supabase = createClient(url, key)
    const { data: orders, error } = await supabase.from('orders')
      .select('id,order_number,customer_name,customer_email,shipping_address,items,carrier,tracking_number,fulfillment_status')
      .in('id', orderIds)
    if (error) return NextResponse.json({ error: 'Could not load the saved orders.' }, { status: 500 })

    let sent = 0
    let failed = orderIds.length - (orders?.length ?? 0)
    for (const order of orders ?? []) {
      if (String(order.fulfillment_status).toLowerCase() !== 'shipped' || !order.carrier || !order.tracking_number || !order.customer_email) {
        failed += 1
        continue
      }
      const items = Array.isArray(order.items) ? order.items.map((item: any) => ({
        name: String(item?.title ?? item?.name ?? 'Item'),
        sku: typeof item?.sku === 'string' ? item.sku : typeof item?.id === 'string' ? item.id : undefined,
        quantity: Number(item?.quantity) || 1,
      })) : []
      try {
        await sendShippingConfirmation({
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          carrier: order.carrier,
          trackingNumber: order.tracking_number,
          address: order.shipping_address,
          items,
        })
        sent += 1
      } catch {
        failed += 1
      }
    }
    return NextResponse.json({ success: true, sent, failed })
  } catch {
    return NextResponse.json({ error: 'The shipping confirmation batch could not be completed.' }, { status: 500 })
  }
}
