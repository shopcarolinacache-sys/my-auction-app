import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';

const conditionStyles: Record<Product['condition'], string> = {
  'Near Mint': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Mint': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Excellent': 'bg-blue-50 text-blue-700 border-blue-200',
  'Lightly Played': 'bg-amber-50 text-amber-700 border-amber-200',
  'Refurbished': 'bg-blue-50 text-blue-700 border-blue-200',
};

const stockStyles: Record<Product['stock'], string> = {
  'In Stock': 'bg-emerald-600 text-white',
  'Low Stock': 'bg-amber-500 text-white',
  'Sold Out': 'bg-neutral-400 text-white',
};

const stockDot: Record<Product['stock'], string> = {
  'In Stock': 'bg-white',
  'Low Stock': 'bg-white animate-pulse',
  'Sold Out': 'bg-white/50',
};

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const soldOut = product.stock === 'Sold Out';

  const handleAdd = () => {
    if (soldOut) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group flex flex-col border border-neutral-200 bg-white overflow-hidden transition-all duration-300 hover:border-neutral-900 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Condition badge */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 border ${conditionStyles[product.condition]}`}
        >
          {product.condition}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          {/* Stock pill */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 ${stockStyles[product.stock]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stockDot[product.stock]}`} />
            {product.stock}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-900">
            ${product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            disabled={soldOut}
            aria-label="Quick Add"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
              soldOut
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 text-white hover:bg-emerald-700'
            }`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
