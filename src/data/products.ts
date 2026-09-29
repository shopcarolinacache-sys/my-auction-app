import { type Product, type CategoryId } from '../types';

export interface Filter {
  label: string;
  value: CategoryId | 'all';
}

export const filters: Filter[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Trading Cards', value: 'cards' },
  { label: 'Action Figures & Toys', value: 'toys' }
];

export const products: Product[] = [
  {
    id: '1',
    name: '1999 Base Set Charizard Holo',
    description: 'PSA 9 Mint Condition Base Set Charizard First Edition Shadowless Holo.',
    price: 3200,
    category: 'cards',
    categoryLabel: 'Trading Cards',
    condition: 'Mint',
    stock: 'In Stock',
    image: '/products/trading-card.png'
  },
  {
    id: '2',
    name: 'Vintage Star Wars Boba Fett Figure',
    description: '1980 Kenner Star Wars Empire Strikes Back Boba Fett loose action figure with original blaster.',
    price: 450,
    category: 'toys',
    categoryLabel: 'Action Figures & Toys',
    condition: 'Excellent',
    stock: 'Low Stock',
    image: '/products/action-figure.png'
  },
  {
    id: '3',
    name: '1986 Fleer Michael Jordan Rookie Card',
    description: 'BGS 9.5 Gem Mint Michael Jordan Rookie Card #57. Iconic collectors piece.',
    price: 7500,
    category: 'cards',
    categoryLabel: 'Trading Cards',
    condition: 'Near Mint',
    stock: 'In Stock',
    image: '/products/trading-card.png'
  }
];
