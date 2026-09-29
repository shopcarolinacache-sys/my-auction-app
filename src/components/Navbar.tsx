"use client";


import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'New Arrivals', href: '/shop?sort=new' },
  { label: 'Trading Cards', href: '/shop?category=cards' },
  { label: 'Toys', href: '/shop?category=toys' },
  { label: 'Electronics', href: '/shop?category=electronics' },
  { label: 'Sell to Us', href: '/sell' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-neutral-900">
                CAROLINA<span className="text-emerald-600">CACHE</span>
              </span>
            </Link>
            <ul className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="hidden sm:flex text-neutral-700 hover:text-neutral-900 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative text-neutral-700 hover:text-neutral-900 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            <button
              className="lg:hidden text-neutral-700"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 $
          {open ? 'max-h-96' : 'max-h-0'}`}
      >
        <ul className="px-6 py-4 space-y-3 bg-white border-t border-neutral-200">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="block text-sm font-medium text-neutral-700 hover:text-emerald-600 transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
