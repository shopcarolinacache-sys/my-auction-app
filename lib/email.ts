import 'server-only'

import { Resend } from 'resend'
import { emailScenarios, fromAddress, replyToAddress } from '@/lib/email-config'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('Email delivery is unavailable.')
  return new Resend(process.env.RESEND_API_KEY)
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

function formatAddress(value: unknown) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
  const address = value as Record<string, unknown>
  return [address.name, address.street1, address.street2, [address.city, address.state, address.zip].filter(Boolean).join(', '), address.country]
    .filter((line) => typeof line === 'string' && line.trim())
    .map((line) => String(line).trim())
    .join('\n')
}

function brandedEmail(title: string, content: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f1;font-family:Arial,Helvetica,sans-serif;color:#171717"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(title)} — Carolina Cache</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f1;padding:28px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e5e5e5"><tr><td style="background:#111;padding:24px 32px"><p style="margin:0;color:#a7f3d0;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Carolina Cache</p><p style="margin:8px 0 0;color:#fff;font-size:12px">Rare finds. Real stories.</p></td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 20px;font-size:24px;line-height:1.25">${escapeHtml(title)}</h1>${content}<p style="margin:28px 0 0;color:#525252;font-size:14px;line-height:1.6">Warmly,<br><strong>Shop Carolina Cache</strong></p></td></tr><tr><td style="border-top:1px solid #e5e5e5;padding:18px 32px;color:#737373;font-size:12px">Questions? Reply to this email or reach us at <a href="mailto:${replyToAddress}" style="color:#047857">${replyToAddress}</a>.</td></tr></table></td></tr></table></body></html>`
}

async function deliverEmail(message: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  const { error } = await getResend().emails.send({
    from: fromAddress,
    to: message.to,
    subject: message.subject,
    text: message.text,
    ...(message.html ? { html: message.html } : {}),
    replyTo: replyToAddress,
  })
  if (error) throw new Error('Email delivery failed.')
}

export async function sendCustomerDirectEmail(input: { to: string; customerName: string; subject: string; message: string }) {
  const greeting = input.customerName.trim() ? `Hello ${input.customerName.trim()},\n\n` : ''
  const { error } = await getResend().emails.send({ from: 'Shop Carolina Cache <hello@shopcarolinacache.com>', to: input.to, subject: input.subject, text: `${greeting}${input.message.trim()}\n\nShop Carolina Cache`, html: brandedEmail(input.subject, `<p style="font-size:15px;line-height:1.7;white-space:pre-wrap">${escapeHtml(`${greeting}${input.message.trim()}`)}</p>`), replyTo: replyToAddress })
  if (error) throw new Error('Email delivery failed.')
}

export async function sendContactEmail(input: { subject: string; text: string; replyTo: string; customerName?: string; category?: string; message?: string; acknowledge?: boolean }) {
  const category = input.category || 'General Question'
  const visitorMessage = input.message || input.text
  const greeting = input.customerName?.trim() ? `Hi ${input.customerName.trim()},` : 'Hi there,'
  const ack = brandedEmail('We received your message', `<p style="font-size:16px;line-height:1.65">${escapeHtml(greeting)}</p><p style="font-size:15px;line-height:1.65">Thanks for reaching out about <strong>${escapeHtml(category)}</strong>. Your note is safely in our inbox, and we personally reply within 24 hours.</p><div style="margin-top:22px;padding:18px;background:#f4f4f1;border-left:3px solid #059669"><p style="margin:0 0 8px;color:#525252;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Your message</p><p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(visitorMessage)}</p></div>`)
  const alert = deliverEmail({ to: emailScenarios.generalContact.to, subject: input.subject, text: input.text, replyTo: input.replyTo })
  const acknowledgment = deliverEmail({ to: input.replyTo, subject: `We received your message — ${category}`, text: `${greeting}\n\nThanks for reaching out about ${category}. We personally reply within 24 hours.\n\nYour message:\n${visitorMessage}`, html: ack })
  const results = await Promise.allSettled(input.acknowledge === false ? [alert] : [alert, acknowledgment])
  return results.some((result) => result.status === 'fulfilled')
}

export async function sendOrderNotifications(input: {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{ name: string; sku?: string; quantity: number; price: number }>
  subtotal: number
  shipping: number
  total: number
  shippingAddress: unknown
  billingAddress: unknown
  billingSameAsShipping: boolean
}) {
  const rows = input.items.map((item) => `<tr><td style="padding:10px 6px;border-bottom:1px solid #e5e5e5">${escapeHtml(item.name)}${item.sku ? `<br><span style="color:#737373;font-size:12px">SKU ${escapeHtml(item.sku)}</span>` : ''}</td><td align="center" style="padding:10px 6px;border-bottom:1px solid #e5e5e5">${item.quantity}</td><td align="right" style="padding:10px 6px;border-bottom:1px solid #e5e5e5">${money(item.price)}</td></tr>`).join('')
  const itemsText = input.items.map((item) => `- ${item.name}${item.sku ? ` (SKU ${item.sku})` : ''} × ${item.quantity} — ${money(item.price)} each`).join('\n')
  const address = formatAddress(input.shippingAddress)
  const billingAddress = formatAddress(input.billingAddress)
  const billingBlock = input.billingSameAsShipping ? '' : `<h2 style="margin:18px 0 8px;font-size:14px">Billing address</h2><p style="margin:0;white-space:pre-wrap;font-size:13px;line-height:1.5;color:#525252">${escapeHtml(billingAddress)}</p>`
  const billingText = input.billingSameAsShipping ? '' : `\n\nBilling address:\n${billingAddress}`
  const customerHtml = brandedEmail(`Order confirmed — ${input.orderNumber}`, `<p style="font-size:15px;line-height:1.6">Hello ${escapeHtml(input.customerName)}, thank you for your order. We’re getting your finds ready.</p><p style="font-size:13px;color:#525252">Order number: <strong>${escapeHtml(input.orderNumber)}</strong></p><table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;font-size:14px"><thead><tr><th align="left" style="padding:8px 6px;border-bottom:1px solid #d4d4d4">Item</th><th>Qty</th><th align="right">Unit price</th></tr></thead><tbody>${rows}</tbody></table><table role="presentation" width="100%" style="margin-top:16px;font-size:14px"><tr><td style="padding:5px 0">Subtotal</td><td align="right">${money(input.subtotal)}</td></tr><tr><td style="padding:5px 0">Shipping</td><td align="right">${money(input.shipping)}</td></tr><tr><td style="padding:8px 0;border-top:1px solid #d4d4d4;font-weight:bold">Total paid</td><td align="right" style="border-top:1px solid #d4d4d4;font-weight:bold">${money(input.total)}</td></tr></table><h2 style="margin:24px 0 8px;font-size:15px">Shipping address</h2><p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(address)}</p>${billingBlock}<p style="margin:22px 0 0;padding:14px;background:#ecfdf5;color:#14532d;font-size:14px;line-height:1.6">A separate email with tracking details will arrive once your order is packed.</p>`)
  const alertText = `Order ${input.orderNumber}\nCustomer: ${input.customerName}\nEmail: ${input.customerEmail}\n\nItems:\n${itemsText}\n\nSubtotal: ${money(input.subtotal)}\nShipping: ${money(input.shipping)}\nTotal: ${money(input.total)}`
  const results = await Promise.allSettled([
    deliverEmail({ to: emailScenarios.orderAlert.to, subject: `${emailScenarios.orderAlert.subjectPrefix}: ${input.orderNumber}`, text: alertText }),
    deliverEmail({ to: input.customerEmail, subject: `${emailScenarios.orderConfirmation.subjectPrefix} — ${input.orderNumber}`, text: `Hello ${input.customerName},\n\nThank you for your order. Order ${input.orderNumber}.\n\n${itemsText}\n\nSubtotal: ${money(input.subtotal)}\nShipping: ${money(input.shipping)}\nTotal paid: ${money(input.total)}\n\nShipping address:\n${address}${billingText}\n\nA separate email with tracking details will arrive once packed.`, html: customerHtml }),
  ])
  return results.every((result) => result.status === 'fulfilled')
}

export async function sendAuctionBidNotifications(input: { auctionTitle: string; bidderName: string; bidderEmail: string; amount: number }) {
  const items = await Promise.allSettled([
    deliverEmail({ to: emailScenarios.auctionBidAlert.to, subject: `${emailScenarios.auctionBidAlert.subjectPrefix}: ${input.auctionTitle}`, text: `A new bid was placed.\n\nAuction: ${input.auctionTitle}\nBidder: ${input.bidderName}\nBidder email: ${input.bidderEmail}\nAmount: ${money(input.amount)}` }),
    deliverEmail({ to: input.bidderEmail, subject: `${emailScenarios.auctionBidConfirmation.subjectPrefix}: ${input.auctionTitle}`, text: `Hello ${input.bidderName},\n\nYour bid of ${money(input.amount)} for “${input.auctionTitle}” was recorded.\n\nReply to this email if you have any questions.` }),
  ])
  if (items.every((result) => result.status === 'rejected')) throw new Error('Email delivery failed.')
}

export async function sendAuctionWinEmail(input: { email: string; title: string; sku: string; amount: number }) {
  await deliverEmail({ to: input.email, subject: `You won ${input.title} — Carolina Cache`, text: `Congratulations! You won ${input.title} (SKU ${input.sku}) with a bid of ${money(input.amount)}. Please reply to this email within 24 hours and we’ll send your secure payment and checkout instructions.`, html: brandedEmail('You won the auction', `<p style="font-size:15px;line-height:1.6">Congratulations! The lot is yours.</p><div style="margin:20px 0;padding:18px;background:#f4f4f1"><p style="margin:0;font-size:18px;font-weight:bold">${escapeHtml(input.title)}</p><p style="margin:8px 0;color:#525252;font-size:13px">SKU ${escapeHtml(input.sku)}</p><p style="margin:0;font-size:15px">Winning bid: <strong>${money(input.amount)}</strong></p></div><p style="font-size:14px;line-height:1.65">Please reply to this email within 24 hours. We’ll send your secure payment and checkout instructions directly.</p>`) })
}

function trackingUrl(carrier: string, trackingNumber: string) {
  const encoded = encodeURIComponent(trackingNumber)
  const name = carrier.toLowerCase()
  if (name.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`
  if (name.includes('ups')) return `https://www.ups.com/track?tracknum=${encoded}`
  if (name.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`
  return ''
}

export async function sendShippingConfirmation(input: { orderNumber: string; customerName: string; customerEmail: string; carrier: string; trackingNumber: string; address: unknown; items: Array<{ name: string; sku?: string; quantity: number }> }) {
  const url = trackingUrl(input.carrier, input.trackingNumber)
  const itemsText = input.items.map((item) => `- ${item.name}${item.sku ? ` (SKU ${item.sku})` : ''} × ${item.quantity}`).join('\n')
  const itemRows = input.items.map((item) => `<li style="padding:5px 0">${escapeHtml(item.name)}${item.sku ? ` — SKU ${escapeHtml(item.sku)}` : ''} × ${item.quantity}</li>`).join('')
  const address = formatAddress(input.address)
  const link = url ? `<p style="margin:22px 0"><a href="${url}" style="display:inline-block;padding:12px 18px;background:#047857;color:#fff;text-decoration:none;font-weight:bold">Track your package</a></p>` : ''
  await deliverEmail({ to: input.customerEmail, subject: `Your order ${input.orderNumber} has shipped`, text: `Hello ${input.customerName},\n\nOrder ${input.orderNumber} is on its way.\nCarrier: ${input.carrier}\nTracking number: ${input.trackingNumber}\n${url ? `Track here: ${url}\n` : ''}\nShipped items:\n${itemsText}\n\nDestination: ${address}\nTracking can take up to 24 hours to show initial carrier scans.`, html: brandedEmail('Your order is on its way', `<p style="font-size:15px;line-height:1.6">Hello ${escapeHtml(input.customerName)}, order <strong>${escapeHtml(input.orderNumber)}</strong> has shipped.</p><div style="padding:16px;background:#f4f4f1"><p style="margin:0 0 6px"><strong>Carrier:</strong> ${escapeHtml(input.carrier)}</p><p style="margin:0"><strong>Tracking number:</strong> ${escapeHtml(input.trackingNumber)}</p></div>${link}<h2 style="margin:24px 0 8px;font-size:15px">Shipped items</h2><ul style="padding-left:20px;font-size:14px;line-height:1.6">${itemRows}</ul><h2 style="margin:24px 0 8px;font-size:15px">Shipping destination</h2><p style="white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(address)}</p><p style="margin:20px 0 0;padding:14px;background:#f4f4f1;color:#525252;font-size:13px;line-height:1.6">Tracking can take up to 24 hours to show initial carrier scans.</p>`) })
}
