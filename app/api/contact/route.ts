import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { isRateLimited, isValidEmail } from '@/lib/request-security'

export const runtime = 'nodejs'

const maxTextLength = 2000

export async function POST(request: Request) {
  if (isRateLimited(request, 'contact-email', 5)) {
    return NextResponse.json({ error: 'Please wait a few minutes before sending another request.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }
    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true })
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    if (body.type === 'source-request') {
      const item = typeof body.item === 'string' ? body.item.trim() : ''
      const details = typeof body.details === 'string' ? body.details.trim() : ''
      const budget = Number(body.budget)
      if (!item || item.length > 160 || !Number.isFinite(budget) || budget <= 0 || budget > 1_000_000 || details.length > maxTextLength) {
        return NextResponse.json({ error: 'Check the item, budget, and details, then try again.' }, { status: 400 })
      }

      await sendContactEmail({
        replyTo: body.email,
        subject: `Item sourcing request: ${item}`,
        text: `Item: ${item}\nMaximum budget: $${budget.toFixed(2)}\nEmail: ${body.email}\nDetails: ${details || 'Not provided'}`,
      })
      return NextResponse.json({ success: true })
    }

    if (body.type === 'next-drop') {
      await sendContactEmail({
        replyTo: body.email,
        subject: 'Notify me for the next drop',
        text: `Please notify ${body.email} about the next Carolina Cache drop.`,
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unsupported message type.' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'We could not send your request right now. Please try again later.' }, { status: 500 })
  }
}
