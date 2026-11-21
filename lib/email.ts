import 'server-only'

import { Resend } from 'resend'
import { emailScenarios, fromAddress } from '@/lib/email-config'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Email delivery is unavailable.')
  }

  return new Resend(process.env.RESEND_API_KEY)
}

async function deliverEmail(message: {
  to: string
  subject: string
  text: string
  replyTo?: string
}) {
  const { error } = await getResend().emails.send({
    from: fromAddress,
    to: message.to,
    subject: message.subject,
    text: message.text,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
  })

  if (error) throw new Error('Email delivery failed.')
}

export async function sendContactEmail(input: {
  subject: string
  text: string
  replyTo: string
}) {
  await deliverEmail({
    to: emailScenarios.generalContact.to,
    subject: input.subject,
    text: input.text,
    replyTo: input.replyTo,
  })
}

export async function sendOrderNotifications(input: {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
}) {
  const itemsText = input.items
    .map((item) => `- ${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n')

  await Promise.all([
    deliverEmail({
      to: emailScenarios.orderAlert.to,
      replyTo: emailScenarios.orderAlert.replyTo,
      subject: `${emailScenarios.orderAlert.subjectPrefix}: ${input.orderNumber}`,
      text: `Order ${input.orderNumber}\nCustomer: ${input.customerName}\nEmail: ${input.customerEmail}\n\nItems:\n${itemsText}\n\nTotal: $${input.total.toFixed(2)}`,
    }),
    deliverEmail({
      to: input.customerEmail,
      replyTo: emailScenarios.orderConfirmation.replyTo,
      subject: `${emailScenarios.orderConfirmation.subjectPrefix} — ${input.orderNumber}`,
      text: `Hello ${input.customerName},\n\nThank you for your order from Carolina Cache. Your order number is ${input.orderNumber}.\n\nItems:\n${itemsText}\n\nTotal: $${input.total.toFixed(2)}\n\nReply to this email if you need help.`,
    }),
  ])
}

export async function sendAuctionBidNotifications(input: {
  auctionTitle: string
  bidderName: string
  bidderEmail: string
  amount: number
}) {
  await Promise.all([
    deliverEmail({
      to: emailScenarios.auctionBidAlert.to,
      replyTo: emailScenarios.auctionBidAlert.replyTo,
      subject: `${emailScenarios.auctionBidAlert.subjectPrefix}: ${input.auctionTitle}`,
      text: `A new bid was placed.\n\nAuction: ${input.auctionTitle}\nBidder: ${input.bidderName}\nBidder email: ${input.bidderEmail}\nAmount: $${input.amount.toFixed(2)}`,
    }),
    deliverEmail({
      to: input.bidderEmail,
      replyTo: emailScenarios.auctionBidConfirmation.replyTo,
      subject: `${emailScenarios.auctionBidConfirmation.subjectPrefix}: ${input.auctionTitle}`,
      text: `Hello ${input.bidderName},\n\nYour bid of $${input.amount.toFixed(2)} for “${input.auctionTitle}” was recorded.\n\nReply to this email if you have any questions.`,
    }),
  ])
}
