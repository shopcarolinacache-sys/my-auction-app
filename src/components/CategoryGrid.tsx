import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/products';
import type { CategoryId } from '@/types';

interface Props {
  onSelect?: (id: CategoryId) => void;
}

export default function CategoryGrid({ onSelect }: Props) {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700">
            Explore
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            Shop by Category
          </h2>
        </div>
        <a
          href="#shop"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-emerald-700 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect?.(cat.id)}
            className="group relative aspect-[4/5] overflow-hidden border border-neutral-200 text-left"
          >
            <img
              src={cat.image}
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <p className="text-xs tracking-[0.15em] uppercase text-white/70 mb-1">
                {cat.subtitle}
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-xl lg:text-2xl font-bold text-white">
                  {cat.title}
                </h3>
                <span className="flex items-center justify-center h-9 w-9 bg-white/95 text-neutral-900 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
