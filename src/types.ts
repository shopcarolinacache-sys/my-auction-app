export type Condition = 'Near Mint' | 'Mint' | 'Lightly Played' | 'Refurbished' | 'Excellent';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Sold Out';

export type CategoryId = 'cards' | 'toys' | 'electronics';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  condition: Condition;
  stock: StockStatus;
  category: CategoryId;
}

export interface Category {
  id: CategoryId;
  title: string;
  subtitle: string;
  image: string;
}
