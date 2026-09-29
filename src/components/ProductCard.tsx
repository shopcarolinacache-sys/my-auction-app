"use client";

import React from 'react';
import { Product } from '../types';

const conditionStyles = {
  'Near Mint': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Mint': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Excellent': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Refurbished': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const stockStyles = {
  'In Stock': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Low Stock': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Sold Out': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

interface ProductCardProps {
  product: Product;
  onAction?: (product: Product) => void;
}

const FALLBACK_IMAGE = '/placeholder.jpg';

export function ProductCard({ product, onAction }: ProductCardProps) {
  const displayTitle = product.name || product.title || 'Untitled Product';
  const displayPrice = product.price ?? product.startingBid ?? 0;
  
  const conditionKey = (product.condition || 'Mint') as keyof typeof conditionStyles;
  const currentConditionStyle = conditionStyles[conditionKey] || 'bg-gray-100 text-gray-800';

  let stockValue: 'In Stock' | 'Low Stock' | 'Sold Out' = 'In Stock';
  if (product.stock === 'Sold Out' || product.stock === 0) stockValue = 'Sold Out';
  else if (product.stock === 'Low Stock' || (typeof product.stock === 'number' && product.stock <= 3)) stockValue = 'Low Stock';
  
  const currentStockStyle = stockStyles[stockValue];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={displayTitle}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
      </div>

      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        {product.categoryLabel && (
          <span className="rounded px-2 py-0.5 text-xs font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900">
            {product.categoryLabel}
          </span>
        )}
        {product.condition && (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${currentConditionStyle}`}>
            {product.condition}
          </span>
        )}
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${currentStockStyle}`}>
          {stockValue}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayTitle}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {product.description}
            </p>
          )}
          
          {(product.location || product.endsIn) && (
            <div className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-900 dark:text-gray-400">
              {product.location && <div>📍 {product.location}</div>}
              {product.endsIn && <div className="text-rose-600 dark:text-rose-400">⏱️ Ends: {product.endsIn}</div>}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {product.startingBid ? 'Starting Bid' : 'Price'}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {'$' + displayPrice.toLocaleString()}
            </p>
          </div>
          {onAction && (
            <button
              onClick={() => onAction(product)}
              disabled={stockValue === 'Sold Out'}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-800"
            >
              {product.startingBid ? 'Place Bid' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

