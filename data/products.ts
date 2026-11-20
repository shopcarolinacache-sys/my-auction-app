export type Category = 'cards' | 'toys' | 'electronics' | 'collectibles'
export type Condition = 'Near Mint' | 'Mint' | 'Excellent' | 'Refurbished' | 'New in Box' | 'Used - Like New' | 'Used - Very Good' | 'PSA 8 NM-MT'

export type ShippingTier = 'Small Mailer (<1 lb)' | 'Standard Box (1 lb)' | 'Medium Box (2 lb)' | 'Medium Box (3 lb)' | 'Large Box (5 lb)'
export type Stock = 'In Stock' | 'Low Stock' | 'Sold Out'

export type InventoryRow = {
  id: string
  title: string
  description: string
  price: number
  image_url?: string | null
  images?: string[]
  category: Category
  created_at?: string
  status?: Stock
}

export type Product = InventoryRow & {
  name: string
  categoryLabel: string
  condition: Condition
  stock: Stock
  sku?: string
  weight_oz?: number
  length_in?: number
  width_in?: number
  height_in?: number
  shipping_tier?: ShippingTier
  collectorNote?: string
  image: string
}

const fallbackImages = {
  rookieLot: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=1200&q=90',
  vintageCards: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=90',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90',
  console: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1200&q=90',
  marbles: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=90',
  postcards: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=90',
  photographs: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=90',
  stamps: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=90',
}

export function normalizeProductImages(value: unknown): string[] {
  const candidates = Array.isArray(value) ? value : typeof value === 'string' ? [value] : []
  return candidates.flatMap((candidate) => {
    if (typeof candidate !== 'string') return []
    const url = candidate.trim()
    return url ? [url] : []
  })
}

const imageFor = (imageUrl: string | null | undefined, fallbackUrl: string) => imageUrl?.trim() || fallbackUrl

export const products: Product[] = [
  { id: 'sample-1001', sku: 'CLT-CARD-1001', title: '1999 Pokémon Base Set Charizard Holo #4/102 (PSA 8 NM-MT)', name: '1999 Pokémon Base Set Charizard Holo #4/102 (PSA 8 NM-MT)', description: 'Iconic Unlimited Holo Charizard encapsulated in an authentic PSA 8 Near Mint-Mint slab. Crisp holofoil shine with clean edges; ships insured in a bubble mailer.', category: 'cards', categoryLabel: 'Trading Cards', condition: 'PSA 8 NM-MT', stock: 'Low Stock', status: 'Low Stock', price: 385, image: '/images/samples/charizard-psa8.png', image_url: '/images/samples/charizard-psa8.png', images: ['/images/samples/charizard-psa8.png'], weight_oz: 12, length_in: 8, width_in: 6, height_in: 2, shipping_tier: 'Standard Box (1 lb)', collectorNote: 'PSA 8 · Unlimited Holo' },
  { id: 'sample-1002', sku: 'CLT-CARD-1002', title: '2023 Panini Prizm Victor Wembanyama Silver Prizm Rookie #136', name: '2023 Panini Prizm Victor Wembanyama Silver Prizm Rookie #136', description: 'Pack-fresh Silver Prizm rookie card with sharp 55/45 centering and mirror-bright refractor finish. Stored in a magnetic one-touch case.', category: 'cards', categoryLabel: 'Trading Cards', condition: 'Near Mint', stock: 'Low Stock', status: 'Low Stock', price: 245, image: '/images/samples/wembanyama-silver-prizm.png', image_url: '/images/samples/wembanyama-silver-prizm.png', images: ['/images/samples/wembanyama-silver-prizm.png'], weight_oz: 6, length_in: 7, width_in: 5, height_in: 1, shipping_tier: 'Small Mailer (<1 lb)', collectorNote: 'Silver Prizm rookie' },
  { id: 'sample-1003', sku: 'CLT-FIG-1003', title: 'Star Wars Black Series Boba Fett (Prototype Armor) 6" Figure — MISB', name: 'Star Wars Black Series Boba Fett (Prototype Armor) 6" Figure — MISB', description: 'Factory-sealed Mint-in-Sealed-Box collector edition featuring crisp window packaging, twin blasters, and removable jetpack. Never opened.', category: 'toys', categoryLabel: 'Action Figures', condition: 'New in Box', stock: 'Low Stock', status: 'Low Stock', price: 54, image: '/images/samples/boba-fett-prototype.png', image_url: '/images/samples/boba-fett-prototype.png', images: ['/images/samples/boba-fett-prototype.png'], weight_oz: 14, length_in: 10, width_in: 6, height_in: 3, shipping_tier: 'Standard Box (1 lb)', collectorNote: 'MISB · Prototype armor' },
  { id: 'sample-1004', sku: 'CLT-FIG-1004', title: 'Mafex No. 185 Spider-Man (Classic Costume Ver.) 1/12 Import Figure', name: 'Mafex No. 185 Spider-Man (Classic Costume Ver.) 1/12 Import Figure', description: 'Authentic Medicom Toy Japan import complete with unmasked Peter Parker head sculpt, magnetic wall-crawling hands/feet, and articulated display stand.', category: 'toys', categoryLabel: 'Action Figures', condition: 'Near Mint', stock: 'Low Stock', status: 'Low Stock', price: 118, image: '/images/samples/classic-web-hero.png', image_url: '/images/samples/classic-web-hero.png', images: ['/images/samples/classic-web-hero.png'], weight_oz: 16, length_in: 9, width_in: 7, height_in: 4, shipping_tier: 'Standard Box (1 lb)', collectorNote: 'Complete import figure' },
  { id: 'sample-1005', sku: 'CLT-ELEC-1005', title: 'Nintendo Switch OLED Model (White Joy-Con) + Dock & Pro Case', name: 'Nintendo Switch OLED Model (White Joy-Con) + Dock & Pro Case', description: 'Vibrant 7-inch OLED screen with zero burn-in or scratches. Includes white dock, Joy-Con grip, OEM power adapter, HDMI cable, and hardshell travel case.', category: 'electronics', categoryLabel: 'Electronics', condition: 'Used - Like New', stock: 'Low Stock', status: 'Low Stock', price: 239, image: '/images/samples/oled-console.png', image_url: '/images/samples/oled-console.png', images: ['/images/samples/oled-console.png'], weight_oz: 42, length_in: 14, width_in: 10, height_in: 5, shipping_tier: 'Medium Box (3 lb)', collectorNote: 'Complete travel bundle' },
  { id: 'sample-1006', sku: 'CLT-ELEC-1006', title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones — Silver', name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones — Silver', description: 'Industry-leading ANC headphones tested for 30-hour battery health and crystal-clear call audio. Includes original collapsible case and USB-C charging cable.', category: 'electronics', categoryLabel: 'Electronics', condition: 'Used - Very Good', stock: 'Low Stock', status: 'Low Stock', price: 219, image: '/images/samples/noise-cancel-headphones.png', image_url: '/images/samples/noise-cancel-headphones.png', images: ['/images/samples/noise-cancel-headphones.png'], weight_oz: 22, length_in: 11, width_in: 9, height_in: 4, shipping_tier: 'Medium Box (2 lb)', collectorNote: '30-hour battery health tested' },
  { id: 'sample-1007', sku: 'CLT-COLL-1007', title: 'LEGO Star Wars Millennium Falcon 75257 Collector Display Set (Complete)', name: 'LEGO Star Wars Millennium Falcon 75257 Collector Display Set (Complete)', description: '100% piece-verified display build including Finn, Chewbacca, Lando Calrissian, Boolio, C-3PO, R2-D2, and D-O minifigures plus original instruction manual.', category: 'collectibles', categoryLabel: 'Collectibles', condition: 'Used - Very Good', stock: 'Low Stock', status: 'Low Stock', price: 135, image: '/images/samples/space-freighter-set.png', image_url: '/images/samples/space-freighter-set.png', images: ['/images/samples/space-freighter-set.png'], weight_oz: 68, length_in: 22, width_in: 15, height_in: 4, shipping_tier: 'Large Box (5 lb)', collectorNote: 'Complete · piece-verified' },
  { id: 'sample-1008', sku: 'CLT-COLL-1008', title: '1996 Original Tamagotchi Gen 1 Translucent Blue — Tested & Working', name: '1996 Original Tamagotchi Gen 1 Translucent Blue — Tested & Working', description: 'Authentic Bandai 1996 first-generation virtual pet with crisp pixel display, responsive buttons, and intact keychain clip. Fresh LR44 batteries installed.', category: 'collectibles', categoryLabel: 'Collectibles', condition: 'Used - Very Good', stock: 'Low Stock', status: 'Low Stock', price: 48, image: '/images/samples/translucent-virtual-pet.png', image_url: '/images/samples/translucent-virtual-pet.png', images: ['/images/samples/translucent-virtual-pet.png'], weight_oz: 4, length_in: 6, width_in: 4, height_in: 2, shipping_tier: 'Small Mailer (<1 lb)', collectorNote: 'Tested · working' },
]

export const filters = [
  { label: 'All', value: 'all' as const },
  { label: 'Trading Cards', value: 'cards' as const },
  { label: 'Action Figures', value: 'toys' as const },
  { label: 'Electronics', value: 'electronics' as const },
  { label: 'Collectibles', value: 'collectibles' as const },
]

export type Filter = (typeof filters)[number]['value']
export type CategoryId = Category
export { fallbackImages, imageFor }
