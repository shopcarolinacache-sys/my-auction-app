import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { upsertCustomer } from '@/lib/customers'
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

      await upsertCustomer({ email: body.email, full_name: typeof body.name === 'string' ? body.name : undefined, acquisition_source: 'inquiry' }).catch((error) => console.error('Inquiry customer upsert failed:', error))
      await sendContactEmail({
        replyTo: body.email,
        customerName: typeof body.name === 'string' ? body.name.slice(0, 160) : undefined,
        category: 'General Question',
        message: details || `I’m looking for ${item}. My maximum budget is $${budget.toFixed(2)}.`,
        subject: `Item sourcing request: ${item}`,
        text: `Item: ${item}\nMaximum budget: $${budget.toFixed(2)}\nEmail: ${body.email}\nDetails: ${details || 'Not provided'}`,
      }).catch(() => undefined)
      return NextResponse.json({ success: true })
    }

    if (body.type === 'next-drop') {
      await upsertCustomer({ email: body.email, acquisition_source: 'newsletter', marketing_opt_in: true }).catch((error) => console.error('Newsletter customer upsert failed:', error))
      await sendContactEmail({
        replyTo: body.email,
        subject: 'Notify me for the next drop',
        text: `Please notify ${body.email} about the next Carolina Cache drop.`,
        acknowledge: false,
      }).catch(() => undefined)
      return NextResponse.json({ success: true })
    }

    if (body.type === 'inquiry') {
      const message = typeof body.message === 'string' ? body.message.trim() : ''
      const categories = ['General Question', 'Item/Card Condition', 'Order Help', 'Auction Question']
      const category = categories.includes(body.category) ? body.category : 'General Question'
      const customerName = typeof body.name === 'string' ? body.name.trim().slice(0, 160) : ''
      if (!message || message.length > maxTextLength || (body.name !== undefined && (typeof body.name !== 'string' || body.name.length > 160))) {
        return NextResponse.json({ error: 'Enter a message under 2,000 characters.' }, { status: 400 })
      }
      await upsertCustomer({ email: body.email, full_name: customerName || undefined, acquisition_source: 'inquiry' }).catch((error) => console.error('Inquiry customer upsert failed:', error))
      await sendContactEmail({
        replyTo: body.email,
        customerName,
        category,
        message,
        subject: `Carolina Cache inquiry — ${category}`,
        text: `Category: ${category}\nName: ${customerName || 'Not provided'}\nEmail: ${body.email}\n\n${message}`,
      }).catch(() => undefined)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unsupported message type.' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'We could not send your request right now. Please try again later.' }, { status: 500 })
  }
}
