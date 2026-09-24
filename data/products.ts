export type Category = 'cards' | 'toys' | 'electronics'
export type Condition = 'Near Mint' | 'Mint' | 'Excellent' | 'Refurbished'
export type Stock = 'In Stock' | 'Low Stock' | 'Sold Out'

export type Product = {
  id: string
  name: string
  category: Category
  categoryLabel: string
  condition: Condition
  stock: Stock
  price: number
  image: string
}

export const products: Product[] = [
  { id: '01', name: 'First Edition Charizard', category: 'cards', categoryLabel: 'Trading Cards', condition: 'Near Mint', stock: 'Low Stock', price: 4850, image: '/products/trading-card.png' },
  { id: '02', name: 'Astro Mech — Series 01', category: 'toys', categoryLabel: 'Action Figures & Toys', condition: 'Mint', stock: 'In Stock', price: 220, image: '/products/action-figure.png' },
  { id: '03', name: 'Sonic Arc Wireless', category: 'electronics', categoryLabel: 'Premium Electronics', condition: 'Excellent', stock: 'In Stock', price: 340, image: '/products/headphones.png' },
  { id: '04', name: 'Pocket Instax 90', category: 'electronics', categoryLabel: 'Premium Electronics', condition: 'Excellent', stock: 'Sold Out', price: 180, image: '/products/camera.png' },
]

export const filters = [
  { label: 'All', value: 'all' as const },
  { label: 'Trading Cards', value: 'cards' as const },
  { label: 'Action Figures', value: 'toys' as const },
  { label: 'Electronics', value: 'electronics' as const },
]
export type Filter = (typeof filters)[number]['value']
export type CategoryId = Category
