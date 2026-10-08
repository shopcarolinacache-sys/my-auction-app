export type Category = 'cards' | 'toys' | 'electronics' | 'collectibles'
export type Condition = 'Near Mint' | 'Mint' | 'Excellent' | 'Refurbished'
export type Stock = 'In Stock' | 'Low Stock' | 'Sold Out'

export type InventoryRow = {
  id: string
  title: string
  description: string
  price: number
  image_url?: string | null
  category: Category
  created_at?: string
  status?: Stock
}

export type Product = InventoryRow & {
  name: string
  categoryLabel: string
  condition: Condition
  stock: Stock
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

const imageFor = (imageUrl: string | null | undefined, fallbackUrl: string) => imageUrl || fallbackUrl

const rawProducts: Array<Omit<Product, 'image'> & { image_url?: string | null; fallbackUrl: string }> = [
  { id: '01', title: 'Carolina Rookie Card Lot', name: 'Carolina Rookie Card Lot', description: 'A hand-selected run of graded modern classics.', category: 'cards', categoryLabel: 'Rare Trading Cards', condition: 'Near Mint', stock: 'Low Stock', status: 'Low Stock', price: 4850, image_url: null, fallbackUrl: fallbackImages.rookieLot },
  { id: '02', title: 'Vintage Curiosity Shop Find', name: 'Vintage Curiosity Shop Find', description: 'Playroom icon with display-ready paint and a bright original finish.', category: 'toys', categoryLabel: 'Vintage Toys & Objects', condition: 'Mint', stock: 'In Stock', status: 'In Stock', price: 220, image_url: null, fallbackUrl: fallbackImages.vintageCards },
  { id: '03', title: 'Red Archive Headphones', name: 'Red Archive Headphones', description: 'Warm, detailed sound in a sculptural red finish.', category: 'electronics', categoryLabel: 'Rare Electronics', condition: 'Excellent', stock: 'In Stock', status: 'In Stock', price: 340, image_url: null, fallbackUrl: fallbackImages.headphones },
  { id: '04', title: 'Pocket Game Console', name: 'Pocket Game Console', description: 'A compact throwback with a crisp modern screen.', category: 'electronics', categoryLabel: 'Rare Electronics', condition: 'Excellent', stock: 'Sold Out', status: 'Sold Out', price: 180, image_url: null, fallbackUrl: fallbackImages.console },
  { id: '05', title: 'Hand-Picked Cat-Eye Marbles', name: 'Hand-Picked Cat-Eye Marbles', description: 'A luminous set of vintage glass marbles in jewel tones.', category: 'collectibles', categoryLabel: 'Marbles & Small Wonders', condition: 'Excellent', stock: 'In Stock', status: 'In Stock', price: 68, image_url: null, fallbackUrl: fallbackImages.marbles },
  { id: '06', title: 'Postcard Album: Carolina Coast', name: 'Postcard Album: Carolina Coast', description: 'A carefully preserved album of regional scenes and correspondence.', category: 'collectibles', categoryLabel: 'Postcards & Paper', condition: 'Excellent', stock: 'Low Stock', status: 'Low Stock', price: 145, image_url: null, fallbackUrl: fallbackImages.postcards },
  { id: '07', title: 'Vintage Portrait Contact Sheets', name: 'Vintage Portrait Contact Sheets', description: 'Unusual studio proofs with expressive mid-century character.', category: 'collectibles', categoryLabel: 'Vintage Images', condition: 'Near Mint', stock: 'In Stock', status: 'In Stock', price: 96, image_url: null, fallbackUrl: fallbackImages.photographs },
  { id: '08', title: 'United States Commemorative Stamp Set', name: 'United States Commemorative Stamp Set', description: 'Archival album pages filled with colorful commemorative issues.', category: 'collectibles', categoryLabel: 'Stamps & Postal History', condition: 'Mint', stock: 'In Stock', status: 'In Stock', price: 210, image_url: null, fallbackUrl: fallbackImages.stamps },
]

export const products: Product[] = rawProducts.map(({ fallbackUrl, image_url, ...product }) => ({ ...product, image_url, image: imageFor(image_url, fallbackUrl) }))

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
