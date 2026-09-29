import Hero from '../src/components/Hero';
import { ProductGrid } from '../src/components/ProductGrid';
import AuctionTools from '../src/components/AuctionTools';
import AnnouncementBar from '../src/components/AnnouncementBar';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import CategoryGrid from '../src/components/CategoryGrid'; // Fixed: Using your actual component

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <CategoryGrid /> {/* Swapped out the missing component for your real grid */}
      <ProductGrid />
      <AuctionTools />
      <Footer />
    </main>
  );
}
