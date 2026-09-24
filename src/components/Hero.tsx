import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] border-b border-neutral-200">
      {/* Left — text panel */}
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-md">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700 mb-5">
            The Drop · Volume 09
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
            Rare finds,<br />curated weekly.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed">
            From graded vintage cards to certified-refurbished electronics —
            Carolina Cache is your destination for authenticated collectibles.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#shop"
              className="group inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-4 text-sm font-semibold tracking-wide uppercase hover:bg-emerald-700 transition-all duration-300"
            >
              Shop the Drop
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-2 border border-neutral-300 text-neutral-900 px-8 py-4 text-sm font-semibold tracking-wide uppercase hover:border-neutral-900 transition-all duration-300"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </div>

      {/* Right — image panel */}
      <div className="relative min-h-[400px] lg:min-h-full overflow-hidden">
        <img
          src="https://images.pexels.com/photos/9661252/pexels-photo-9661252.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
          alt="Collectible trading cards"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
          <div className="text-white">
            <p className="text-xs tracking-[0.15em] uppercase opacity-80">Featured Grail</p>
            <p className="text-lg font-semibold">Charizard Base Set Holo</p>
          </div>
          <span className="bg-white/95 text-neutral-900 text-sm font-bold px-4 py-2">
            $1,200
          </span>
        </div>
      </div>
    </section>
  );
}
