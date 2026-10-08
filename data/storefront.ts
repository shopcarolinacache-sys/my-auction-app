export type StorefrontCategory = {
  id: string
  title: string
  description: string
  image: string
  eyebrow: string
  items: { name: string; description: string; image: string; price: string }[]
}

export const categoryCards: StorefrontCategory[] = [
  { id: 'sports-trading-cards', title: 'Sports & Trading Cards', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=85', eyebrow: 'The vault', description: 'Graded cards, rookie pulls, and rare cardboard with a story.', items: [{ name: 'Carolina rookie card lot', description: 'A hand-selected run of graded modern classics.', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=85', price: '$185' }, { name: 'Midnight holo pull', description: 'Limited-print foil collectible in archival sleeve.', image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=900&q=85', price: '$240' }] },
  { id: 'clothes', title: 'Curated Clothes', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85', eyebrow: 'The edit', description: 'Premium streetwear and considered pieces for everyday rotation.', items: [{ name: 'Archive varsity jacket', description: 'Heavyweight wool blend with embroidered detailing.', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85', price: '$120' }, { name: 'Washed utility denim', description: 'Relaxed vintage fit with a softened hand feel.', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85', price: '$78' }] },
  { id: 'toys', title: 'Vintage Toys', image: 'https://images.unsplash.com/photo-1594784051410-6f2c7e1c2c31?auto=format&fit=crop&w=1200&q=85', eyebrow: 'The shelf', description: 'Playroom icons, collectible figures, and retro favorites.', items: [{ name: 'Retro space figure', description: 'Original-era figure with bright, display-ready paint.', image: 'https://images.unsplash.com/photo-1560961911-ba7ef651a56c?auto=format&fit=crop&w=900&q=85', price: '$95' }, { name: 'Pocket monster set', description: 'A nostalgic boxed set for collectors and curious kids.', image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=900&q=85', price: '$64' }] },
  { id: 'electronics', title: 'Rare Electronics', image: 'https://images.unsplash.com/photo-1518441313282-6b6c9d0a5dc4?auto=format&fit=crop&w=1200&q=85', eyebrow: 'The archive', description: 'Modern audio, gaming gear, and beautiful machines.', items: [{ name: 'Studio headphone set', description: 'Warm, detailed sound in a sculptural red finish.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', price: '$210' }, { name: 'Pocket game console', description: 'A compact throwback with a crisp modern screen.', image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=900&q=85', price: '$145' }] },
  { id: 'misc', title: 'Misc. Objects', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85', eyebrow: 'The curious', description: 'Unexpected objects selected for their charm, craft, or history.', items: [{ name: 'Curious desk object', description: 'A tactile conversation piece for the considered home.', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85', price: '$52' }, { name: 'Found object no. 07', description: 'One-off vintage treasure with a little mystery.', image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=85', price: '$86' }] },
  { id: 'collectibles', title: 'Marbles, Postcards & Stamps', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=85', eyebrow: 'The paper trail', description: 'Small wonders, regional memories, vintage images, and postal history.', items: [{ name: 'Cat-eye marble set', description: 'Jewel-toned glass marbles selected for clarity and color.', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=85', price: '$68' }, { name: 'Carolina postcard album', description: 'A preserved album of coastal scenes and handwritten notes.', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=900&q=85', price: '$145' }, { name: 'Commemorative stamp set', description: 'Colorful postal issues mounted in archival pages.', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=900&q=85', price: '$210' }] },
]

export const marketingHooks = [
  { number: '01', title: 'Live drops daily', copy: 'Rare finds, right on time. Join the room for limited releases.' },
  { number: '02', title: '99.8% verified', copy: 'Every collectible is checked, catalogued, and shipped with care.' },
  { number: '03', title: 'Rewards club', copy: 'Early access and considered perks for the collectors who return.' },
]

export const mediaWins = [
  { image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=85', label: 'SOLD for $250' },
  { image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85', label: 'Won by UserX!' },
  { image: 'https://images.unsplash.com/photo-1594784051410-6f2c7e1c2c31?auto=format&fit=crop&w=800&q=85', label: 'SOLD for $95' },
  { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=85', label: 'Won by Maya!' },
]

export const auctionVideos = [
  { title: 'The midnight card pull', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1000&q=85', duration: '08:42' },
  { title: 'Vintage shelf tour', image: 'https://images.unsplash.com/photo-1594784051410-6f2c7e1c2c31?auto=format&fit=crop&w=1000&q=85', duration: '12:06' },
  { title: 'Headphones after dark', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85', duration: '06:18' },
]

export function getCategory(id: string) {
  return categoryCards.find((category) => category.id === id)
}

export const categoryIds = categoryCards.map((category) => category.id)
