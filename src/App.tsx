import { useState } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import type { CategoryId } from '@/types';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');

  const handleCategorySelect = (id: CategoryId) => {
    setActiveCategory(id);
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid onSelect={handleCategorySelect} />
        <ProductGrid active={activeCategory} onFilter={setActiveCategory} />
      </main>
      <Footer />
    </div>
  );
}
