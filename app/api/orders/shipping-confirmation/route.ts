import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendShippingConfirmation } from '@/lib/email'
import { isRateLimited } from '@/lib/request-security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (isRateLimited(request, 'shipping-email', 10)) {
    return NextResponse.json({ error: 'Please wait before sending another tracking update.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    if (!orderId || orderId.length > 128) return NextResponse.json({ error: 'A valid order is required.' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !key) return NextResponse.json({ error: 'Shipping email is unavailable.' }, { status: 503 })

    const supabase = createClient(url, key)
    const { data: order, error } = await supabase.from('orders').select('order_number,customer_name,customer_email,shipping_address,items,carrier,tracking_number,fulfillment_status').eq('id', orderId).maybeSingle()
    if (error || !order) return NextResponse.json({ error: 'The saved order could not be verified.' }, { status: 404 })
    if (String(order.fulfillment_status).toLowerCase() !== 'shipped' || !order.carrier || !order.tracking_number) {
      return NextResponse.json({ error: 'Save a carrier, tracking number, and shipped status first.' }, { status: 409 })
    }
    const items = Array.isArray(order.items) ? order.items.map((item: any) => ({
      name: String(item?.title ?? item?.name ?? 'Item'),
      sku: typeof item?.sku === 'string' ? item.sku : typeof item?.id === 'string' ? item.id : undefined,
      quantity: Number(item?.quantity) || 1,
    })) : []
    await sendShippingConfirmation({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      carrier: order.carrier,
      trackingNumber: order.tracking_number,
      address: order.shipping_address,
      items,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Order was saved, but the tracking email could not be sent.' }, { status: 500 })
  }
}
