import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAuctionWinEmail } from '@/lib/email'
import { isRateLimited } from '@/lib/request-security'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (isRateLimited(request, 'auction-win-email', 5)) {
    return NextResponse.json({ error: 'Please wait before requesting another auction email.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const id = typeof body?.auctionId === 'string' ? body.auctionId.trim() : ''
    if (!id || id.length > 128) return NextResponse.json({ error: 'A valid auction is required.' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!url || !key) return NextResponse.json({ error: 'Auction email is unavailable.' }, { status: 503 })

    const supabase = createClient(url, key)
    const { data, error } = await supabase.from('auctions').select('title,current_bid,status,winner_email').eq('id', id).maybeSingle()
    if (error || !data) return NextResponse.json({ error: 'The saved auction could not be verified.' }, { status: 404 })
    if (!['ended', 'closed', 'sold'].includes(String(data.status).toLowerCase())) {
      return NextResponse.json({ error: 'This auction is not closed.' }, { status: 409 })
    }
    if (!data.winner_email || !/^\S+@\S+\.\S+$/.test(data.winner_email)) {
      return NextResponse.json({ success: true, skipped: true })
    }

    await sendAuctionWinEmail({
      email: data.winner_email,
      title: data.title,
      sku: typeof body.sku === 'string' && /^AU-[A-Z0-9-]{1,24}$/i.test(body.sku) ? body.sku : `AU-${id.slice(0, 8).toUpperCase()}`,
      amount: Number(data.current_bid ?? 0),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Auction was saved, but the winner email could not be sent.' }, { status: 500 })
  }
}
