export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: CategoryId;
  image: string;
  stock?: 'In Stock' | 'Low Stock' | 'Sold Out' | number;
  featured?: boolean;
  auctionDate?: string;
  startingBid?: number;
  
  // New properties required by your product-card.tsx to pass the Netlify build:
  condition?: 'Near Mint' | 'Mint' | 'Excellent' | 'Refurbished' | string;
  categoryLabel?: string;
  status?: string;
  location?: string;
  endsIn?: string;
  title?: string;
}
