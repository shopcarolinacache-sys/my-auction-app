import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-semibold text-white">AuctionPlatform V0</p>
          <p className="text-xs mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        
        <div className="flex gap-6 items-center">
          {/* Custom SVG Instagram Icon */}
          <a href="#" className="hover:text-white transition-colors">
            <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          
          {/* Custom SVG Twitter/X Icon */}
          <a href="#" className="hover:text-white transition-colors">
            <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
          
          {/* Custom SVG Youtube Icon */}
          <a href="#" className="hover:text-white transition-colors">
            <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><record width="20" height="15" x="2" y="4.5" rx="2.18" ry="2.18"/><polygon points="10 9.75 14 12 10 14.25 10 9.75"/></svg>
          </a>

          {/* Mail Icon remains functional */}
          <a href="#" className="hover:text-white transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
