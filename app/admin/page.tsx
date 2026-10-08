'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Gavel, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar,
  X,
  CheckCircle2
} from 'lucide-react';

export interface AuctionItem {
  id: string;
  title: string;
  sku: string;
  category: string;
  startingPrice: number;
  currentBid: number;
  stock: number;
  status: 'PUBLISHED' | 'DRAFT' | 'LOW STOCK' | 'SCHEDULED' | 'ENDED';
  startTime?: string;
  endTime?: string;
}

const INITIAL_AUCTIONS: AuctionItem[] = [
  {
    id: '1',
    title: '1986 Fleer Basketball Wax Pack',
    sku: 'CC-1048',
    category: 'Trading Cards',
    startingPrice: 1250,
    currentBid: 1250,
    stock: 3,
    status: 'PUBLISHED',
    startTime: '2026-10-10T10:00',
    endTime: '2026-10-17T20:00',
  },
  {
    id: '2',
    title: 'Cat-eye Marble Collection',
    sku: 'CC-1047',
    category: 'Collectibles',
    startingPrice: 68,
    currentBid: 0,
    stock: 8,
    status: 'DRAFT',
  },
  {
    id: '3',
    title: 'Sony Walkman WM-2',
    sku: 'CC-1046',
    category: 'Electronics',
    startingPrice: 340,
    currentBid: 340,
    stock: 1,
    status: 'PUBLISHED',
    startTime: '2026-10-08T12:00',
    endTime: '2026-10-15T18:00',
  },
  {
    id: '4',
    title: 'Carolina Coastal Postcard Album',
    sku: 'CC-1045',
    category: 'Paper & Postal',
    startingPrice: 145,
    currentBid: 145,
    stock: 2,
    status: 'LOW STOCK',
  },
];

export default function AdminWorkspacePage() {
  const [items, setItems] = useState<AuctionItem[]>(INITIAL_AUCTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AuctionItem | null>(null);

  // Form states for creating/editing
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Collectibles');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('1');
  const [formStatus, setFormStatus] = useState<AuctionItem['status']>('DRAFT');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Collectibles');
    setFormPrice('');
    setFormStock('1');
    setFormStatus('DRAFT');
    setFormStartTime('');
    setFormEndTime('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: AuctionItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormPrice(item.startingPrice.toString());
    setFormStock(item.stock.toString());
    setFormStatus(item.status);
    setFormStartTime(item.startTime || '');
    setFormEndTime(item.endTime || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      // Update existing item
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                title: formTitle,
                category: formCategory,
                startingPrice: parseFloat(formPrice) || 0,
                stock: parseInt(formStock, 10) || 0,
                status: formStatus,
                startTime: formStartTime,
                endTime: formEndTime,
              }
            : i
        )
      );
    } else {
      // Create new item
      const newItem: AuctionItem = {
        id: Date.now().toString(),
        title: formTitle,
        sku: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
        category: formCategory,
        startingPrice: parseFloat(formPrice) || 0,
        currentBid: 0,
        stock: parseInt(formStock, 10) || 0,
        status: formStatus,
        startTime: formStartTime,
        endTime: formEndTime,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this auction item?')) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: AuctionItem['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'LOW STOCK':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENDED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col p-6 space-y-8">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-400 rounded flex items-center justify-center text-black font-bold text-lg">
              CC
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Carolina Cache</h1>
              <span className="text-xs text-neutral-400 tracking-wider uppercase">Admin Studio</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-medium">
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
            <ShoppingBag className="w-4 h-4" />
            <span>Overview</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
            <ShoppingBag className="w-4 h-4" />
            <span>Inventory</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-emerald-500 text-black font-semibold">
            <Gavel className="w-4 h-4" />
            <span>Auctions</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </a>
        </nav>

        <div className="border-t border-neutral-800 pt-4">
          <button className="text-xs text-neutral-400 hover:text-white">Sign out</button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Workspace / Auctions</span>
            <h1 className="text-3xl font-extrabold text-neutral-900">Auctions</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            <span>New Auction Item</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-medium">Gross revenue</span>
              <p className="text-2xl font-extrabold text-neutral-900">$24,680</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-medium">Orders</span>
              <p className="text-2xl font-extrabold text-neutral-900">186</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-medium">Customers</span>
              <p className="text-2xl font-extrabold text-neutral-900">1,284</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-medium">Live bids</span>
              <p className="text-2xl font-extrabold text-neutral-900">42</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Gavel className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Auctions workspace</h2>
              <p className="text-xs text-neutral-500">Monitor and manage your Carolina Cache auction inventory.</p>
            </div>

            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  <th className="py-3 px-6">Item</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Stock</th>
                  <th className="py-3 px-6">Schedule</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-neutral-400 text-sm">
                      No auction items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-neutral-900">{item.title}</div>
                        <span className="text-xs text-neutral-400 font-mono">{item.sku}</span>
                      </td>
                      <td className="py-4 px-6 text-neutral-600">{item.category}</td>
                      <td className="py-4 px-6 font-semibold text-neutral-900">
                        ${item.startingPrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-neutral-600 font-medium">{item.stock}</td>
                      <td className="py-4 px-6 text-xs text-neutral-500">
                        {item.startTime ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{new Date(item.startTime).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">Not Scheduled</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-black rounded transition"
                          title="Edit Item"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-extrabold text-neutral-900">
                {editingItem ? 'Edit Auction Item' : 'Create New Auction Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1986 Fleer Basketball Pack"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Trading Cards">Trading Cards</option>
                    <option value="Collectibles">Collectibles</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Paper & Postal">Paper & Postal</option>
                    <option value="Antiques">Antiques</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Starting Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Stock / Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AuctionItem['status'])}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="LOW STOCK">LOW STOCK</option>
                    <option value="ENDED">ENDED</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 space-y-3">
                <span className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Auction Schedule (Optional)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg text-sm shadow-sm transition"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}