import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-neutral-400">
          © {new Date().getFullYear()} Property Auctions Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
