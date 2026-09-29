"use client";

import { useState } from 'react';
import { products } from '../data/products';
import { ProductCard } from './ProductCard';
import { type CategoryId } from '../types';

interface ProductGridProps {
  active?: CategoryId | 'all';
  onFilter?: (category: CategoryId | 'all') => void;
}

export function ProductGrid({ active, onFilter }: ProductGridProps) {
  const [localActive, setLocalActive] = useState<CategoryId | 'all'>('all');
  const currentCategory = active ?? localActive;

  const handleFilterChange = (category: CategoryId | 'all') => {
    if (onFilter) {
      onFilter(category);
    } else {
      setLocalActive(category);
    }
  };

  const filteredProducts = currentCategory === 'all'
    ? products
    : products.filter(product => product.category === currentCategory);

  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between border-b border-gray-200 pb-5 sm:flex-row dark:border-gray-800">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Trending Items
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
