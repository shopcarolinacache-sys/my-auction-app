import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { upsertCustomer } from '@/lib/customers'
import { isRateLimited, isValidEmail } from '@/lib/request-security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (isRateLimited(request, 'auction-bid-submit', 8)) return NextResponse.json({ error: 'Too many bid attempts. Please try again shortly.' }, { status: 429 })
  try {
    const body = await request.json()
    const auctionId = typeof body?.auctionId === 'string' ? body.auctionId.trim() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const amount = Number(body?.amount)
    if (!auctionId || auctionId.length > 128 || name.length < 2 || name.length > 160 || !isValidEmail(email) || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) return NextResponse.json({ error: 'Check your name, email, and bid amount.' }, { status: 400 })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !key) return NextResponse.json({ error: 'Bidding is unavailable.' }, { status: 503 })
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: auction, error: auctionError } = await supabase.from('auctions').select('id,status,current_bid,starting_bid,min_increment').eq('id', auctionId).maybeSingle()
    if (auctionError || !auction || !['live', 'active', 'published'].includes(String(auction.status).toLowerCase())) return NextResponse.json({ error: 'This auction is not accepting bids.' }, { status: 409 })
    const minimum = Math.max(Number(auction.starting_bid ?? 0), Number(auction.current_bid ?? 0) + Number(auction.min_increment ?? 1))
    if (amount < minimum) return NextResponse.json({ error: `Your bid must be at least $${minimum.toFixed(2)}.` }, { status: 400 })
    const customer = await upsertCustomer({ email, full_name: name, acquisition_source: 'auction', tags: ['Live Bidder'] })
    const { data: bid, error } = await supabase.from('bids').insert({ auction_id: auctionId, bidder_name: name, bidder_email: email.trim().toLowerCase(), amount, customer_id: customer.id }).select('id').single()
    if (error) return NextResponse.json({ error: 'The bid could not be saved.' }, { status: 500 })
    const { error: updateError } = await supabase.from('auctions').update({ current_bid: amount, winner_email: email.trim().toLowerCase() }).eq('id', auctionId)
    if (updateError) return NextResponse.json({ error: 'Bid recorded, but the auction total could not be updated.' }, { status: 500 })
    return NextResponse.json({ success: true, bidId: bid.id })
  } catch {
    return NextResponse.json({ error: 'The bid could not be saved.' }, { status: 500 })
  }
}
