import { Sparkles, Truck, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

const announcements = [
  { icon: Sparkles, text: 'New Vintage Cards Added Daily' },
  { icon: Truck, text: 'Free Shipping on Orders Over $150' },
  { icon: Tag, text: 'Use Code CACHE10 for 10% Off Your First Order' },
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-neutral-900 text-neutral-100 overflow-hidden">
      <div className="relative h-10 flex items-center justify-center">
        {announcements.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`absolute flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase transition-all duration-700 ${
                i === index
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
