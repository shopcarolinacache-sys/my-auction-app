import { useState } from 'react';
import ProductCard from './ProductCard';
import { products } from '@/data/products';
import type { CategoryId } from '@/types';

const filters: { label: string; value: CategoryId | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Trading Cards', value: 'cards' },
  { label: 'Action Figures & Toys', value: 'toys' },
  { label: 'Premium Electronics', value: 'electronics' },
];

interface Props {
  active: CategoryId | 'all';
  onFilter: (value: CategoryId | 'all') => void;
}

export default function ProductGrid({ active, onFilter }: Props) {
  const [localActive, setLocalActive] = useState<CategoryId | 'all'>('all');
  const current = active ?? localActive;

  const handleFilter = (value: CategoryId | 'all') => {
    setLocalActive(value);
    onFilter(value);
  };

  const filtered =
    current === 'all'
      ? products
      : products.filter((p) => p.category === current);

  return (
    <section id="shop" className="bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700">
              The Collection
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Featured Products
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilter(f.value)}
                className={`text-xs font-semibold uppercase tracking-wide px-4 py-2 border transition-all duration-300 ${
                  current === f.value
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
