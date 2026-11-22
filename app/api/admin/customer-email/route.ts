import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendCustomerDirectEmail } from '@/lib/email'
import { isRateLimited } from '@/lib/request-security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (isRateLimited(request, 'admin-customer-email', 10)) return NextResponse.json({ error: 'Please wait before sending another email.' }, { status: 429 })
  try {
    const body = await request.json()
    const customerId = typeof body?.customerId === 'string' ? body.customerId.trim() : ''
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!customerId || customerId.length > 128 || !subject || subject.length > 180 || !message || message.length > 8000) return NextResponse.json({ error: 'Enter a valid customer, subject, and message.' }, { status: 400 })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !key) return NextResponse.json({ error: 'Customer email is unavailable.' }, { status: 503 })
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: customer, error } = await supabase.from('customers').select('email,full_name').eq('id', customerId).maybeSingle()
    if (error || !customer?.email) return NextResponse.json({ error: 'The customer could not be verified.' }, { status: 404 })
    await sendCustomerDirectEmail({ to: customer.email, customerName: customer.full_name ?? '', subject, message })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'The email could not be sent.' }, { status: 500 })
  }
}
