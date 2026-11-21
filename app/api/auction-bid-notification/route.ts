import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAuctionBidNotifications } from '@/lib/email'
import { claimOnce, isRateLimited, releaseClaim } from '@/lib/request-security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (isRateLimited(request, 'auction-bid-email', 10)) {
    return NextResponse.json({ error: 'Please wait before requesting another bid notification.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }
    const bidId = typeof body.bidId === 'string' || typeof body.bidId === 'number' ? String(body.bidId).trim() : ''
    if (!bidId || bidId.length > 128) {
      return NextResponse.json({ error: 'A valid bid reference is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/[\'"]/g, '').trim()
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/[\'"]/g, '').trim()
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Bid notification is unavailable.' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('id,auction_id,bidder_name,bidder_email,amount')
      .eq('id', bidId)
      .maybeSingle()

    if (bidError || !bid) {
      return NextResponse.json({ error: 'The saved bid could not be verified.' }, { status: 404 })
    }

    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('title')
      .eq('id', bid.auction_id)
      .maybeSingle()

    if (auctionError || !auction) {
      return NextResponse.json({ error: 'Bid notifications could not be sent.' }, { status: 404 })
    }
    const notificationKey = `auction-bid-email:${bid.id}`
    if (!claimOnce(notificationKey)) {
      return NextResponse.json({ success: true, alreadySent: true })
    }

    try {
      await sendAuctionBidNotifications({
        auctionTitle: auction.title,
        bidderName: bid.bidder_name,
        bidderEmail: bid.bidder_email,
        amount: Number(bid.amount),
      })
    } catch (error) {
      releaseClaim(notificationKey)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bid was saved, but email notifications could not be sent.' }, { status: 500 })
  }
}
