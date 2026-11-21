const fallbackAddress = 'hello@shopcarolinacache.com'

export const fromAddress = 'Shop Carolina Cache <hello@shopcarolinacache.com>'
export const inboxAddress = process.env.STORE_INBOX_EMAIL?.trim() || fallbackAddress
export const publicContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || fallbackAddress

export const emailScenarios = {
  generalContact: {
    to: inboxAddress,
    subjectPrefix: 'Carolina Cache inquiry',
  },
  orderAlert: {
    to: inboxAddress,
    replyTo: inboxAddress,
    subjectPrefix: 'New Carolina Cache order',
  },
  orderConfirmation: {
    replyTo: inboxAddress,
    subjectPrefix: 'Order confirmation',
  },
  auctionBidAlert: {
    to: inboxAddress,
    replyTo: inboxAddress,
    subjectPrefix: 'New auction bid',
  },
  auctionBidConfirmation: {
    replyTo: inboxAddress,
    subjectPrefix: 'Bid confirmation',
  },
} as const
