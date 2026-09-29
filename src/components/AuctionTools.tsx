"use client";

import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

const auctions = [
  {
    id: 'a1',
    title: '1999 Pokémon Base Set Charizard Holo',
    startingBid: 2500,
    currentBid: 3100,
    bidsCount: 14,
    endsIn: '2h 15m',
    image: 'https://unsplash.com',
    condition: 'Near Mint',
    categoryLabel: 'Trading Cards',
    location: 'Los Angeles, CA'
  },
  {
    id: 'a2',
    title: 'Vintage 1980 Star Wars Boba Fett Figure',
    startingBid: 500,
    currentBid: 780,
    bidsCount: 19,
    endsIn: '5h 45m',
    image: 'https://unsplash.com',
    condition: 'Excellent',
    categoryLabel: 'Toys',
    location: 'New York, NY'
  },
  {
    id: 'a3',
    title: '1986 Fleer Michael Jordan Rookie Card',
    startingBid: 5000,
    currentBid: 6200,
    bidsCount: 8,
    endsIn: '1d 3h',
    image: 'https://unsplash.com',
    condition: 'Mint',
    categoryLabel: 'Trading Cards',
    location: 'Chicago, IL'
  }
];

export default function AuctionTools() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between border-b border-gray-200 pb-5 sm:flex-row dark:border-gray-800">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Live Auctions
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
        {auctions.map((item: any) => {
          const normalizedProduct = {
            ...item,
            name: item.title || item.name || "Auction Item",
            price: item.startingBid || item.price || 0,
            category: 'auction' as any
          };

          return (
            <ProductCard 
              key={item.id} 
              product={normalizedProduct} 
            />
          );
        })}
      </div>
    </section>
  );
}
