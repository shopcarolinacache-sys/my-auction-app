"use client";

import React from 'react';
import Link from 'next/link';

interface CategoryGridProps {
  onSelect?: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All Categories', count: 0 },
  { id: 'cards', name: 'Trading Cards', count: 0 },
  { id: 'toys', name: 'Action Figures & Toys', count: 0 }
];

export default function CategoryGrid({ onSelect = () => {} }: CategoryGridProps) {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Browse Categories</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.id === 'all' ? '/shop' : `/shop?category=${category.id}`}
            onClick={() => onSelect(category.id)}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
