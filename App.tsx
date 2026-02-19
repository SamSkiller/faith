const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Star, Trash2, Plus, Minus, Truck, Smartphone, CheckCircle2, 
  Eye, Heart, MapPin, Lock, ArrowLeft, Loader2, Sparkles, CreditCard, 
  LogOut, Users, BarChart3, ClipboardList, Camera, History, Edit3, Globe, 
  Shield, Activity, RefreshCw, Cpu, Menu, Gem, Layers, Send, Search, ArrowUpDown, 
  ChevronRight, Key, Mail, Github, User as UserIcon, Package, TrendingUp, Settings, PieChart,
  ArrowRight, CreditCard as CardIcon, Map, DollarSign, Briefcase, Moon, Sun, Bell, Gift, 
  Languages, Trash, Share2, ShieldAlert, Crown, Zap, Fingerprint, Cloud, MessageSquare,
  Wifi, WifiOff
} from 'lucide-react';
import { PRODUCTS as INITIAL_PRODUCTS, SHIPPING_OPTIONS } from './constants';
import { Product, CartItem, Order, User, Category, Review } from './types';
import { initiateSTKPush } from './services/mpesaService';
import { generateProductCopy, getStyleTips } from './services/geminiService';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, BarChart, Bar, Cell, PieChart as RePieChart, Pie } from 'recharts';

const IS_PROD = process.env.NODE_ENV === 'production';
const API_BASE = process.env.VITE_API_BASE || (IS_PROD 
  ? 'https://your-faith-shop-api.onrender.com/api' 
  : 'http://localhost:5000/api');

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070",
  "https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=2070"
];

// --- Shared Components ---

const Navbar = ({ cartCount, onOpenCart, setView, activeView, selectedCategory, setSelectedCategory, currentUser, onOpenProfile, searchQuery, setSearchQuery, products, isSynced }: any) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const categories: Category[] = ['All', 'Women', 'Men', 'Accessories', 'Hot Deals'];
  
  useEffect(() => {
    if (cartCount > 0) {
      setIsAnimate(true);
      const timer = setTimeout(() => setIsAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, products]);

  return (
    <header className="sticky top-0 z-[60] w-full">
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-[0.4em] animate-pulse relative">
        Nairobi Same-Day Luxury Delivery • Presence By Faith
        {!isSynced && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] bg-slate-900/40 px-2 py-0.5 rounded flex items-center gap-1 font-black">
            <WifiOff className="w-2 h-2" /> Local Mode
          </span>
        )}
      </div>
      
      <nav className="bg-white/90 dark:bg-slate-900/90 glass border-b border-rose-100 dark:border-slate-800 px-4 md:px-12 h-20 flex items-center justify-between shadow-xl transition-colors">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setView('home'); setSelectedCategory('All'); }} 
            className="group flex flex-col items-start leading-none transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-3xl font-serif font-bold tracking-tighter text-rose-600 italic">Faith</span>
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-400 mt-1 uppercase">Boutique</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => { setView('home'); setSelectedCategory(cat); }}
              className={`hover:text-rose-600 transition-all font-black uppercase ${selectedCategory === cat && activeView === 'home' ? 'text-rose-600 border-b-2 border-rose-600 pb-1' : ''}`}
            >
              {cat}
            </button>
          ))}
          
          <div className="relative group">
            <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full transition-all border border-transparent ${showSearch ? 'w-64 border-rose-200 ring-2 ring-rose-100' : 'w-48'}`}>
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                placeholder="Search sanctuary..." 
                className="bg-transparent border-none outline-none text-[10px] w-full font-bold text-slate-900 dark:text-white"
              />
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-2 border border-slate-100 dark:border-slate-700 animate-fade-in overflow-hidden">
                {searchResults.map((p: any) => (
                  <button 
                    key={p.id} 
                    onClick={() => { setView('home'); setSearchQuery(p.name); }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                  >
                    <img src={p.image} className="w-8 h-10 object-cover rounded-md" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[8px] text-rose-500 font-black">Ksh {p.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onOpenCart} className={`relative p-2 text-slate-400 hover:text-rose-500 transition-all ${isAnimate ? 'scale-125 text-rose-600' : ''}`}>
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-black border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          {!currentUser ? (
            <button onClick={() => setView('auth')} className="px-6 py-2.5 bg-slate-900 dark:bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 dark:hover:bg-rose-700 transition-all shadow-lg active:scale-95">
              Login
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setView('admin')}
                  className={`flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-neon hover:scale-105 transition-transform ${activeView === 'admin' ? 'ring-2 ring-white ring-offset-2 ring-offset-rose-600' : ''}`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:block">Admin Vault</span>
                </button>
              )}
              <div onClick={onOpenProfile} className="rotating-border-container cursor-pointer p-0.5 active:scale-95">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-white dark:border-slate-800 relative z-10 shadow-lg">
                  {currentUser.profilePic ? (
                    <img src={currentUser.profilePic} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-conic-profile w-full h-full flex items-center justify-center text-white font-black text-lg">{currentUser.name.charAt(0)}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

// --- Admin Dashboard Component ---
const AdminVault = ({ products, orders, users, onAdd, onDelete, onUpdateUser, onDeleteUser, onUpdateOrder, onBulkUpdate }: any) => {
  const [tab, setTab] = useState<'analytics' | 'products' | 'orders' | 'users'>('analytics');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: 'Women' as Category, stock: 10, image: '', description: '' });
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const stats = useMemo(() => ({
    revenue: orders.reduce((s: number, o: any) => s + o.total, 0),
    avgOrder: orders.length ? orders.reduce((s: number, o: any) => s + o.total, 0) / orders.length : 0,
    activeUsers: users.length,
    inventoryValue: products.reduce((s: number, p: any) => s + (p.price * p.stock), 0)
  }), [orders, users, products]);

  const salesTrend = useMemo(() => [
    { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 }, { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 }, { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 }
  ], []);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onBulkUpdate('edit', editingProduct.id, editingProduct);
      setEditingProduct(null);
    } else {
      onAdd({ 
        ...newProduct, 
        id: Math.random().toString(36).substr(2, 9), 
        rating: 5, 
        reviewsCount: 0,
        image: newProduct.image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800'
      });
      setShowAddForm(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    let sortableItems = [...products];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto pt-32 pb-32 px-6 animate-future-in">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
          <div className="space-y-2">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 dark:bg-rose-600 rounded-3xl flex items-center justify-center text-rose-500 dark:text-white shadow-neon">
                   <Shield className="w-8 h-8" />
                </div>
                <div>
                   <h2 className="text-5xl font-serif italic font-bold text-slate-900 dark:text-white">Staff Vault</h2>
                   <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.4em] mt-1">Operational Command Center</p>
                </div>
             </div>
          </div>
          <div className="flex p-2 bg-slate-100 dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700">
             {[
               { id: 'analytics', label: 'Analytics', icon: BarChart3 },
               { id: 'products', label: 'Products', icon: Package },
               { id: 'orders', label: 'Orders', icon: ClipboardList },
               { id: 'users', label: 'Users', icon: Users }
             ].map(t => (
               <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                 <t.icon className="w-3.5 h-3.5" /> {t.label}
               </button>
             ))}
          </div>
       </div>

       {tab === 'analytics' && (
         <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: 'Total Revenue', val: `Ksh ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
                 { label: 'Active Citizens', val: stats.activeUsers, icon: Users, color: 'text-sky-500' },
                 { label: 'Avg Order Value', val: `Ksh ${Math.round(stats.avgOrder).toLocaleString()}`, icon: TrendingUp, color: 'text-rose-500' },
                 { label: 'Pool Value', val: `Ksh ${stats.inventoryValue.toLocaleString()}`, icon: Gem, color: 'text-amber-500' }
               ].map((s, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-xl">
                    <s.icon className={`w-8 h-8 mb-6 ${s.color}`} />
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">{s.label}</p>
                    <h4 className="text-3xl font-black italic text-slate-900 dark:text-white">{s.val}</h4>
                 </div>
               ))}
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[64px] border border-slate-50 dark:border-slate-800 shadow-xl h-[400px]">
               <h3 className="text-xl font-bold mb-10 text-slate-900 dark:text-white flex items-center gap-3"><Activity className="w-6 h-6 text-rose-500" /> Capital Trend Session</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend}>
                       <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/><stop offset="95%" stopColor="#e11d48" stopOpacity={0}/></linearGradient></defs>
                       <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip />
                       <Area type="monotone" dataKey="sales" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
         </div>
       )}

       {tab === 'products' && (
         <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Asset Inventory Management</h3>
               <button onClick={() => { setShowAddForm(!showAddForm); setEditingProduct(null); }} className="px-8 py-3 bg-rose-600 text-white rounded-full font-black uppercase text-[10px] flex items-center gap-2 shadow-neon hover:scale-105 transition-all">
                  {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showAddForm ? 'Cancel' : 'Register New Asset'}
               </button>
            </div>

            {(showAddForm || editingProduct) && (
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-50 dark:border-slate-800 shadow-2xl animate-future-in mb-10">
                 <h4 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">{editingProduct ? 'Adjusting Entity' : 'New Entity Protocol'}</h4>
                 <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white" placeholder="Name" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
                    <input required type="number" className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white" placeholder="Value (Ksh)" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: Number(e.target.value)}) : setNewProduct({...newProduct, price: Number(e.target.value)})} />
                    <input required type="number" className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white" placeholder="Pool Quantity" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock: Number(e.target.value)}) : setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                    <select className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-black uppercase text-[10px] text-slate-900 dark:text-white" value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value as any}) : setNewProduct({...newProduct, category: e.target.value as any})}>
                       <option value="Women">Women</option><option value="Men">Men</option><option value="Accessories">Accessories</option><option value="Hot Deals">Hot Deals</option>
                    </select>
                    <input className="md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white" placeholder="Image URL (Unsplash preferred)" value={editingProduct ? editingProduct.image : newProduct.image} onChange={e => editingProduct ? setEditingProduct({...editingProduct, image: e.target.value}) : setNewProduct({...newProduct, image: e.target.value})} />
                    <textarea className="md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white h-32" placeholder="Seductive Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
                    <button className="md:col-span-2 py-6 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] hover:shadow-neon transition-all">Commit Configuration</button>
                 </form>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <tr>
                        <th className="px-8 py-6 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-2">Entity <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-8 py-6 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => handleSort('category')}>
                          <div className="flex items-center gap-2">Sector <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-8 py-6 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => handleSort('price')}>
                          <div className="flex items-center gap-2">Value <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-8 py-6 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => handleSort('stock')}>
                          <div className="flex items-center gap-2">Pool <ArrowUpDown className="w-3 h-3" /></div>
                        </th>
                        <th className="px-8 py-6 text-right">Commands</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {sortedProducts.map((p: any) => (
                       <tr key={p.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-800/50 transition-all group">
                          <td className="px-8 py-6 flex items-center gap-4">
                             <img src={p.image} className="w-12 h-16 rounded-xl object-cover shadow-lg" />
                             <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                          </td>
                          <td className="px-8 py-6"><span className="text-[10px] font-black uppercase text-rose-500">{p.category}</span></td>
                          <td className="px-8 py-6 font-black text-slate-900 dark:text-white">Ksh {p.price.toLocaleString()}</td>
                          <td className="px-8 py-6 font-black text-slate-900 dark:text-white">{p.stock}</td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex gap-4 justify-end">
                                <button onClick={() => setEditingProduct(p)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(p.id)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
       )}

       {tab === 'orders' && (
         <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Logistics Protocol Status</h3>
            <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <tr><th className="px-8 py-6">Protocol ID</th><th className="px-8 py-6">Citizen Trace</th><th className="px-8 py-6">Settlement</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Command</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {orders.map((o: any) => (
                       <tr key={o.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-800/50 transition-all">
                          <td className="px-8 py-6 font-black text-rose-600">#{o.id}</td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-[10px]">{o.phoneNumber.slice(-2)}</div>
                                <div><p className="font-bold text-slate-900 dark:text-white">{o.phoneNumber}</p><p className="text-[10px] text-slate-400 font-bold">{o.date}</p></div>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-black text-slate-900 dark:text-white">Ksh {o.total.toLocaleString()}</td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               o.status === 'Processing' ? 'bg-amber-100 text-amber-600' : 
                               o.status === 'Shipped' ? 'bg-sky-100 text-sky-600' : 
                               o.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                             }`}>{o.status}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <select 
                                value={o.status} 
                                onChange={(e) => onUpdateOrder(o.id, { status: e.target.value })}
                                className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-[9px] font-black uppercase outline-none border-none text-slate-900 dark:text-white"
                             >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                             </select>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
               {orders.length === 0 && <div className="p-40 text-center italic text-slate-300">Operational History Vacant</div>}
            </div>
         </div>
       )}

       {tab === 'users' && (
         <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sanctuary Citizen Nodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {users.map((u: any) => (
                 <div key={u.id} className={`bg-white dark:bg-slate-900 p-8 rounded-[48px] border-2 transition-all group relative overflow-hidden ${u.role === 'admin' ? 'border-rose-500/50 shadow-neon' : 'border-slate-50 dark:border-slate-800'}`}>
                    {u.role === 'admin' && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full"></div>}
                    <div className="flex items-center gap-6 mb-8 relative z-10">
                       <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-slate-800 flex items-center justify-center text-rose-500 font-black text-2xl border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
                         {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                       </div>
                       <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{u.name}</h4>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{u.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                       <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Tier</p><p className={`font-black uppercase text-[10px] mt-1 ${u.role === 'admin' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{u.role}</p></div>
                       <div className="text-right"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Faith Points</p><p className="font-black italic text-rose-600 mt-1">{u.faithPoints}</p></div>
                    </div>
                    {u.email !== 'faith@faith' && (
                      <div className="flex gap-4 relative z-10">
                         <button onClick={() => onUpdateUser(u.id, { role: u.role === 'admin' ? 'customer' : 'admin' })} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-slate-900 dark:text-white">{u.role === 'admin' ? 'Revoke Shield' : 'Elevate Privilege'}</button>
                         <button onClick={() => onDeleteUser(u.id)} className="p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                 </div>
               ))}
            </div>
         </div>
       )}
    </div>
  );
};

// --- Auth View ---
const AuthView = ({ onAuthSuccess }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = formData.email === 'faith@faith' && formData.password === 'faith.';
    onAuthSuccess({ 
      id: Math.random().toString(36).substr(2, 9), 
      name: isAdmin ? 'Master Faith' : (formData.name || formData.email.split('@')[0]), 
      email: formData.email, 
      password: formData.password,
      role: isAdmin ? 'admin' : 'customer', 
      joinedAt: new Date().toISOString(), 
      faithPoints: 100, 
      wishlist: [] 
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-12 rounded-[64px] shadow-2xl border border-slate-50 dark:border-slate-800 animate-future-in text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl"></div>
        <div className="w-20 h-20 bg-rose-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-10 text-rose-500 shadow-xl border-4 border-white dark:border-slate-900"><Lock className="w-8 h-8" /></div>
        <h2 className="text-4xl font-serif italic font-bold text-slate-900 dark:text-white mb-4">{isLogin ? 'Access Identity' : 'Register Identity'}</h2>
        <p className="text-slate-400 text-sm italic mb-10">Sync your persona with the sanctuary.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && <input required className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-slate-900 dark:text-white" placeholder="Name Protocol" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />}
          <input required type="email" className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-slate-900 dark:text-white" placeholder="Email Channel" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="password" className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-slate-900 dark:text-white" placeholder="Security Key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="w-full py-7 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-rose-600 transition-all active:scale-95">Verify & Initialize</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-10 text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 transition-colors tracking-widest">{isLogin ? "New visionary? Create identity" : "Existing citizen? Access sanctuary"}</button>
      </div>
    </div>
  );
};

// --- Product Modal ---
const ProductModal = ({ product, isWishlisted, onToggleWishlist, onClose, onAddToCart, onAddReview, currentUser }: any) => {
  const [copy, setCopy] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const loadAI = async () => {
      setLoading(true);
      try {
          const [c, t] = await Promise.all([
            generateProductCopy(product.name, product.category),
            getStyleTips(product.name)
          ]);
          setCopy(c); 
          setTips(t);
      } catch (err) {
          console.error("AI Error:", err);
      } finally {
          setLoading(false);
      }
    };
    loadAI();
  }, [product]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Identify self to transmit a review.");
    if (!reviewComment.trim()) return;

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      userName: currentUser.name,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString()
    };

    onAddReview(product.id, newReview);
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div className="fixed inset-0 z-[130] flex animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl m-auto bg-white dark:bg-slate-900 h-[85vh] rounded-[64px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        <div className="w-full md:w-1/2 relative h-1/2 md:h-full">
          <img src={product.image} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-8 left-8 p-4 bg-slate-900/40 backdrop-blur-xl text-white rounded-full hover:bg-slate-900/60 md:hidden"><ArrowLeft className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 p-8 md:p-16 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.4em]">{product.category}</span>
            <button onClick={onClose} className="hidden md:block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X className="w-8 h-8" /></button>
          </div>
          <h2 className="text-5xl font-serif italic font-bold text-slate-900 dark:text-white mb-6 leading-tight">{product.name}</h2>
          <div className="flex items-center gap-6 mb-8">
            <span className="text-4xl font-black italic text-rose-600">Ksh {product.price.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-amber-400">
               {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-current' : ''}`} />)}
               <span className="text-[10px] font-bold text-slate-400 ml-2">({product.reviewsCount})</span>
            </div>
          </div>
          
          <div className="space-y-12">
            <div>
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Narrative Spectrum</h4>
              <p className="text-lg text-slate-600 dark:text-slate-300 italic font-light leading-relaxed">{loading ? 'Synthesizing narrative...' : copy}</p>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3 text-rose-500" /> Style Directives</h4>
               {loading ? <div className="h-20 animate-pulse bg-slate-50 dark:bg-slate-800 rounded-3xl" /> : tips.map((t, i) => (
                 <div key={i} className="flex items-center gap-4 p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100/50">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-8 pt-8 border-t border-slate-50 dark:border-slate-800">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MessageSquare className="w-3 h-3 text-sky-500" /> Soul Reflections</h4>
               
               <div className="space-y-6">
                 {product.reviews?.length ? product.reviews.map((r: any) => (
                   <div key={r.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{r.userName}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{r.date}</p>
                         </div>
                         <div className="flex gap-0.5 text-amber-400">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-current' : ''}`} />)}
                         </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{r.comment}"</p>
                   </div>
                 )) : (
                   <p className="text-sm text-slate-400 dark:text-slate-500 italic">No reflections transmitted yet.</p>
                 )}
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 mt-10">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Transmit Reflection</h5>
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resonance:</span>
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(s => (
                             <button type="button" key={s} onClick={() => setReviewRating(s)} className="transition-transform active:scale-110">
                               <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                             </button>
                           ))}
                        </div>
                     </div>
                     <textarea 
                        required
                        placeholder="Your narrative reflection..."
                        className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-sm text-slate-900 dark:text-white min-h-[100px]"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                     />
                     <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all">Submit Reflection</button>
                  </form>
               </div>
            </div>
          </div>

          <div className="pt-12 mt-12 border-t border-slate-50 dark:border-slate-800 flex gap-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-4">
            <button onClick={() => { onAddToCart(product); onClose(); }} className="flex-1 py-7 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-rose-700 transition-all flex items-center justify-center gap-4 active-scale"><ShoppingBag className="w-5 h-5" /> Acquire Presence</button>
            <button onClick={() => onToggleWishlist(product.id)} className={`p-7 rounded-[32px] border-2 transition-all active-scale ${isWishlisted ? 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}><Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const CartDrawer = ({ cart, setCart, onClose, onCheckout }: any) => (
  <div className="fixed inset-0 z-[110] flex animate-fade-in">
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
    <div className="relative ml-auto w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col transform transition-transform duration-500 ease-out border-l border-rose-100 dark:border-slate-800">
       <div className="p-12 border-b border-rose-50 dark:border-slate-800 flex justify-between items-center bg-rose-50/20 dark:bg-slate-800/20">
          <div>
            <h2 className="text-4xl font-serif italic font-bold text-rose-600 mb-1">Your Bag</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{cart.length} acquisition payloads</p>
          </div>
          <button onClick={onClose} className="p-5 hover:bg-rose-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90"><X className="w-8 h-8 text-rose-600" /></button>
       </div>
       <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
          {cart.map((i: any, idx: number) => (
            <div key={idx} className="flex gap-8 items-center group animate-fade-in bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[40px] hover:bg-rose-50/30 transition-all">
               <div className="w-24 h-32 rounded-[32px] overflow-hidden shadow-2xl shrink-0">
                  <img src={i.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{i.name}</h4>
                    <button onClick={() => setCart(cart.filter((c: any) => c.id !== i.id))} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash className="w-4 h-4" /></button>
                  </div>
                  <p className="text-[10px] font-black uppercase text-rose-500 mb-6 tracking-widest">{i.category}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                       <button onClick={() => setCart(cart.map((c: any) => c.id === i.id && c.quantity > 1 ? { ...c, quantity: c.quantity - 1 } : c))}><Minus className="w-3 h-3 text-slate-400 hover:text-rose-500" /></button>
                       <span className="text-sm font-black text-slate-900 dark:text-white">{i.quantity}</span>
                       <button onClick={() => setCart(cart.map((c: any) => c.id === i.id ? { ...c, quantity: c.quantity + 1 } : c))}><Plus className="w-3 h-3 text-slate-400 hover:text-rose-500" /></button>
                    </div>
                    <span className="font-black italic text-xl text-slate-900 dark:text-white">Ksh {(i.price * i.quantity).toLocaleString()}</span>
                  </div>
               </div>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center py-40 text-slate-300 font-black italic text-2xl">Bag status: Empty.</div>}
       </div>
       {cart.length > 0 && (
         <div className="p-12 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-30px_60px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-4xl font-black mb-12 italic text-slate-900 dark:text-white">
               <span>Total</span>
               <span className="text-rose-600">Ksh {cart.reduce((s: any, i: any) => s + (i.price * i.quantity), 0).toLocaleString()}</span>
            </div>
            <button onClick={onCheckout} className="w-full py-8 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-rose-700 transition-all active:scale-95">Proceed to Checkout</button>
         </div>
       )}
    </div>
  </div>
);

const CartToast = ({ product, onClose }: { product: Product, onClose: () => void }) => (
  <div className="fixed bottom-10 right-10 z-[200] animate-future-in bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-2xl border border-rose-100 dark:border-slate-800 flex items-center gap-6 max-w-sm">
    <div className="w-16 h-20 rounded-2xl overflow-hidden shadow-lg shrink-0">
      <img src={product.image} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1">Added to Sanctuary</p>
      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</h4>
    </div>
    <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all">
      <X className="w-5 h-5 text-slate-400" />
    </button>
  </div>
);

const TrackOrderView = ({ orders, currentUser }: any) => {
  const userOrders = orders.filter((o: any) => o.userId === currentUser?.id);
  return (
    <div className="max-w-6xl mx-auto pt-40 pb-32 px-6 animate-future-in">
       <h2 className="text-6xl font-serif italic font-bold text-slate-900 dark:text-white mb-16">Logistics Trace</h2>
       {userOrders.length === 0 ? <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[64px] italic text-slate-300">No active transmissions.</div> : (
         <div className="grid gap-10">
           {userOrders.map((order: any) => (
             <div key={order.id} className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-50 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full"></div>
                <div className="space-y-6 relative z-10">
                   <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-slate-900 dark:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">#{order.id}</span>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Processing' ? 'bg-amber-100 text-amber-600' : 
                        order.status === 'Shipped' ? 'bg-sky-100 text-sky-600' : 
                        order.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>{order.status}</span>
                   </div>
                   <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{order.items.length} Acquisition Payload{order.items.length > 1 ? 's' : ''}</h4>
                   <div className="flex -space-x-4">
                     {order.items.map((i: any, idx: number) => <img key={idx} src={i.image} className="w-12 h-16 rounded-xl object-cover border-4 border-white dark:border-slate-900 shadow-lg" />)}
                   </div>
                </div>
                <div className="text-right flex flex-col justify-end relative z-10">
                   <p className="text-[10px] font-black uppercase text-rose-500 mb-1">Settlement Total</p>
                   <p className="text-4xl font-black italic text-slate-900 dark:text-white">Ksh {order.total.toLocaleString()}</p>
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};

const CheckoutView = ({ cart, currentUser, onComplete, onAuth }: any) => {
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0]);
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => cart.reduce((s: number, i: any) => s + (i.price * i.quantity), 0) + shipping.price, [cart, shipping]);
  
  const handlePay = async () => {
    if (!phoneNumber) return alert('Protocol Transmission Failure: Phone number missing.'); 
    setLoading(true);
    try {
      const res = await initiateSTKPush(phoneNumber, total);
      if (res.success) {
        onComplete({ 
          id: Math.random().toString(36).substr(2, 9).toUpperCase(), 
          userId: currentUser.id, 
          items: cart, 
          total, 
          shippingMethod: shipping.name, 
          status: 'Processing', 
          date: new Date().toLocaleString(), 
          phoneNumber 
        });
      } else { 
        alert(res.message); 
        setLoading(false); 
      }
    } catch (e) {
      alert("System sync error. Re-try in T-minus 10 seconds.");
      setLoading(false);
    }
  };

  if (!currentUser) return (
    <div className="pt-60 text-center animate-future-in">
      <div className="rotating-border-container mx-auto w-24 h-24 mb-8 flex items-center justify-center relative">
        <Lock className="w-10 h-10 text-rose-500 relative z-10" />
      </div>
      <h2 className="text-3xl font-serif italic font-bold text-slate-900 dark:text-white">Identity Missing</h2>
      <p className="text-slate-400 mt-4 italic">Verification required to finalize the settlement.</p>
      <button onClick={onAuth} className="mt-8 px-12 py-5 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase text-[10px] shadow-2xl active-scale">Verify Identity</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pt-40 pb-32 px-6 animate-future-in">
       <div className="mb-16">
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-5xl font-serif italic font-bold text-slate-900 dark:text-white">Checkout Protocol</h2>
             <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Step 1 of 3: Sync Payment</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-rose-500 via-emerald-500 to-sky-500 w-1/3 shadow-neon"></div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-20">
          <div className="lg:col-span-3 space-y-10">
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-50 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-3xl"></div>
                <h3 className="text-2xl font-serif italic font-bold mb-10 text-slate-900 dark:text-white flex items-center gap-3"><Smartphone className="w-6 h-6 text-rose-500" /> M-Pesa Settlement</h3>
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Transmit Linkage Number</label>
                      <input className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] font-black text-4xl outline-none focus:ring-2 focus:ring-rose-200 text-slate-900 dark:text-white transition-all" placeholder="07XX XXX XXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                      <p className="text-[9px] text-slate-400 italic ml-4 uppercase tracking-tighter">Enter your M-Pesa number to receive the secure push.</p>
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Logistics Velocity</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {SHIPPING_OPTIONS.map(opt => (
                           <button 
                             key={opt.id} 
                             onClick={() => setShipping(opt)}
                             className={`p-6 rounded-[32px] border-2 transition-all text-left ${shipping.id === opt.id ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-50 dark:border-slate-800 hover:border-rose-200'}`}
                           >
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{opt.name}</p>
                              <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{opt.days}</p>
                              <p className="mt-4 font-black italic text-rose-500 text-sm">Ksh {opt.price}</p>
                           </button>
                         ))}
                      </div>
                   </div>

                   <button onClick={handlePay} disabled={loading} className="w-full py-8 bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 shadow-2xl hover:bg-rose-700 transition-all active-scale disabled:opacity-50">
                     {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Shield className="w-6 h-6" />} 
                     {loading ? 'Synchronizing Transaction...' : 'Initiate Secure Payment'}
                   </button>
                </div>
             </div>
          </div>
          <div className="lg:col-span-2">
             <div className="bg-slate-950 p-12 rounded-[64px] text-white shadow-2xl sticky top-32 overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl"></div>
                <h3 className="text-3xl font-serif italic font-bold mb-12">Protocol Summary</h3>
                <div className="space-y-6 mb-12 max-h-64 overflow-y-auto pr-4 scrollbar-hide">
                   {cart.map((i: any) => (
                     <div key={i.id} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-12 rounded-lg overflow-hidden border border-white/10"><img src={i.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /></div>
                           <span className="font-light text-xs opacity-60">{i.name} <span className="text-rose-400 font-bold ml-1">x{i.quantity}</span></span>
                        </div>
                        <span className="font-black text-xs">Ksh {(i.price * i.quantity).toLocaleString()}</span>
                     </div>
                   ))}
                </div>
                <div className="h-px bg-white/5 my-8"></div>
                <div className="space-y-6">
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      <span>Inventory Total</span>
                      <span>Ksh {cart.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      <span>Logistics Fee</span>
                      <span>Ksh {shipping.price}</span>
                   </div>
                   <div className="space-y-3 pt-6 border-t border-white/5">
                      <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.5em]">Sanctuary Total</p>
                      <span className="text-6xl font-black italic">Ksh {total.toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Main App Controller ---

const MainContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [view, setView] = useState<'home' | 'checkout' | 'admin' | 'auth' | 'track-order' | 'success'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'default'>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCartToast, setShowCartToast] = useState<Product | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  const sync = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  useEffect(() => {
    const p = localStorage.getItem('faith_products_db');
    setProducts(p ? JSON.parse(p) : INITIAL_PRODUCTS.map(prod => ({...prod, isNew: Math.random() > 0.5, isHot: Math.random() > 0.7, soldCount: Math.floor(Math.random() * 30), reviews: []})));
    const o = localStorage.getItem('faith_orders_db');
    setOrders(o ? JSON.parse(o) : []);
    
    const storedUsers = localStorage.getItem('faith_users_db');
    let uList: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    const defaultSam = { id: 'sam-id', name: 'Sam', email: 'sam@sam', password: 'sam.', role: 'customer' as const, joinedAt: new Date().toISOString(), faithPoints: 100, wishlist: [] };
    const defaultFaith = { id: 'admin-id', name: 'faith', email: 'faith@faith', password: 'faith.', role: 'admin' as const, joinedAt: new Date().toISOString(), faithPoints: 999, wishlist: [] };
    
    if (!uList.find(u => u.email === 'sam@sam')) uList.push(defaultSam);
    if (!uList.find(u => u.email === 'faith@faith')) uList.push(defaultFaith);
    setUsers(uList);
    sync('faith_users_db', uList);

    const s = localStorage.getItem('faith_session_active');
    if (s) setCurrentUser(JSON.parse(s));
    
    const interval = setInterval(() => setHeroIdx(prev => (prev + 1) % HERO_IMAGES.length), 7000);
    
    // Connectivity Heartbeat Logic
    const checkBackendSync = async () => {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
            clearTimeout(id);
            if (res.ok) {
                setIsSynced(true);
                const [pRes, oRes] = await Promise.all([
                    fetch(`${API_BASE}/products`),
                    fetch(`${API_BASE}/orders`)
                ]);
                if (pRes.ok) {
                    const data = await pRes.json();
                    if (data.length > 0) {
                        setProducts(data);
                        sync('faith_products_db', data);
                    }
                }
                if (oRes.ok) {
                    const data = await oRes.json();
                    setOrders(data);
                    sync('faith_orders_db', data);
                }
            } else {
                setIsSynced(false);
            }
        } catch (e) {
            setIsSynced(false);
        }
    };
    
    checkBackendSync();
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

const handleAuth = async (credentials, mode = "login") => {
  try {
    const endpoint =
      mode === "register" ? "/auth/register" : "/auth/login";

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Authentication failed");
      return;
    }

    // Save token
    localStorage.setItem("faith_token", data.token);
    localStorage.setItem("faith_session_active", JSON.stringify(data.user));

    setCurrentUser(data.user);

    if (data.user.role === "admin") setView("admin");
    else setView("home");
  } catch (err) {
    alert("Network error. Backend offline.");
  }
};


  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, selectedCategory, sortBy, searchQuery]);

  const wishlistProducts = useMemo(() => {
    if (!currentUser || !currentUser.wishlist) return [];
    return products.filter(p => currentUser.wishlist.includes(p.id));
  }, [products, currentUser]);

  const toggleWishlist = (productId: string) => {
    if (!currentUser) return setView('auth');
    let nextW = currentUser.wishlist || [];
    nextW = nextW.includes(productId) ? nextW.filter(id => id !== productId) : [...nextW, productId];
    const nextU = { ...currentUser, wishlist: nextW };
    setCurrentUser(nextU);
    sync('faith_session_active', nextU);
    const nextUs = users.map(u => u.id === currentUser.id ? nextU : u);
    setUsers(nextUs);
    sync('faith_users_db', nextUs);
  };

  const handleAddToCart = (p: Product) => {
    setCart(prev => {
        const ex = prev.find(i => i.id === p.id);
        return ex ? prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1}];
    });
    setShowCartToast(p);
    setTimeout(() => setShowCartToast(null), 3000);
  };

  const handleOrderUpdate = (id: string, data: Partial<Order>) => {
    const next = orders.map(o => o.id === id ? { ...o, ...data } : o);
    setOrders(next);
    sync('faith_orders_db', next);
  };

  const handleAddReview = (productId: string, review: Review) => {
    const nextProducts = products.map(p => {
      if (p.id === productId) {
        const nextReviews = [review, ...(p.reviews || [])];
        const nextRating = nextReviews.reduce((sum, r) => sum + r.rating, 0) / nextReviews.length;
        return { 
          ...p, 
          reviews: nextReviews, 
          reviewsCount: nextReviews.length,
          rating: Number(nextRating.toFixed(1))
        };
      }
      return p;
    });
    setProducts(nextProducts);
    sync('faith_products_db', nextProducts);
    if (selectedProduct && selectedProduct.id === productId) {
       setSelectedProduct(nextProducts.find(p => p.id === productId) || null);
    }
  };

  const handleBulkUpdate = (type: string, id?: string, amount?: any) => {
    let next;
    if (type === 'restock') {
       next = products.map(p => ({ ...p, stock: p.stock + 10 }));
    } else if (type === 'adjust' && id) {
       next = products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + (amount as number)) } : p);
    } else if (type === 'edit' && id && amount) {
       next = products.map(p => p.id === id ? { ...p, ...amount } : p);
    }
    if (next) {
       setProducts(next);
       sync('faith_products_db', next);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors ${isDarkMode ? 'dark text-slate-100' : 'text-slate-900'}`}>
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        setView={setView} activeView={view}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        currentUser={currentUser} onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        products={products}
        isSynced={isSynced}
      />

      {showCartToast && <CartToast product={showCartToast} onClose={() => setShowCartToast(null)} />}

      <main className="flex-1">
        {view === 'home' && (
          <div>
            <section className="relative h-[90vh] bg-slate-950 flex items-center justify-center overflow-hidden">
               {HERO_IMAGES.map((img, i) => <img key={i} src={img} className={`absolute inset-0 w-full h-full object-cover hero-img transition-all duration-[3000ms] ${heroIdx === i ? 'opacity-50 scale-100' : 'opacity-0 scale-125'}`} />)}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40"></div>
               <div className="relative text-center text-white px-6 pt-20 animate-future-in z-10">
                  <span className="px-6 py-2 bg-rose-600/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.5em] border border-rose-500/50 shadow-neon">Couture Sanctuary</span>
                  <h1 className="text-6xl md:text-[10rem] font-serif italic font-bold mb-8 leading-none drop-shadow-2xl">Presence <br/> <span className="text-rose-400">By Faith.</span></h1>
                  <p className="text-xl max-w-2xl mx-auto font-light text-slate-300 mb-16 italic tracking-wide">Premium Nairobi fashion for the modern visionary.</p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <button onClick={() => document.getElementById('shop')?.scrollIntoView()} className="px-16 py-6 bg-white text-slate-900 rounded-[32px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-rose-600 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl active:scale-95">Discover Store</button>
                    <button onClick={() => setView('track-order')} className="px-12 py-6 bg-transparent text-white border-2 border-white/20 rounded-[32px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white/10 backdrop-blur-sm transition-all shadow-xl active:scale-95">Order Tracking</button>
                  </div>
               </div>
            </section>

            <section id="shop" className="max-w-7xl mx-auto px-6 py-32 space-y-16">
               <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                  <div className="space-y-4"><h2 className="text-6xl font-serif italic font-bold text-slate-900 dark:text-white">{selectedCategory}</h2><div className="h-1.5 w-24 bg-rose-500 rounded-full shadow-lg"></div></div>
                  <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-400">
                      <ArrowUpDown className="w-4 h-4" />
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="text-[10px] font-black uppercase tracking-widest outline-none bg-transparent dark:text-white">
                        <option value="default">Sort: Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </div>
                  </div>
               </div>
               <div className="amazon-grid">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="group relative bg-white dark:bg-slate-900 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 flex flex-col cursor-pointer p-5 overflow-hidden" onClick={() => setSelectedProduct(p)}>
                      <div className="aspect-[3/4] rounded-[40px] overflow-hidden mb-8 relative shadow-2xl">
                        <img src={p.image} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className={`p-4 rounded-full backdrop-blur-md transition-all ${currentUser?.wishlist?.includes(p.id) ? 'bg-rose-500 text-white shadow-neon' : 'bg-white/20 text-white opacity-0 group-hover:opacity-100'}`}><Heart className={`w-5 h-5 ${currentUser?.wishlist?.includes(p.id) ? 'fill-current' : ''}`} /></button>
                        </div>
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }} className="px-8 py-3 bg-white text-slate-900 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl active-scale flex items-center gap-2">
                             <Eye className="w-4 h-4" /> Quick View
                           </button>
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex-1 flex flex-col text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-3">{p.category}</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 line-clamp-1">{p.name}</h3>
                        <div className="mt-auto flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-6">
                          <span className="text-2xl font-black italic text-slate-900 dark:text-white">Ksh {p.price.toLocaleString()}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }} className="w-14 h-14 bg-slate-900 dark:bg-rose-600 text-white rounded-[24px] flex items-center justify-center hover:bg-rose-600 transition-all active:scale-90 shadow-xl"><Plus className="w-6 h-6" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
               {filteredProducts.length === 0 && <div className="text-center py-40 bg-slate-50 dark:bg-slate-800/50 rounded-[64px] italic text-slate-300 dark:text-slate-500">No entities detected matching this search signature.</div>}
            </section>
          </div>
        )}

        {view === 'admin' && (
          <AdminVault 
            products={products} orders={orders} users={users}
            onAdd={(p:any) => { const n = [...products, p]; setProducts(n); sync('faith_products_db', n); }}
            onDelete={(id:any) => { const n = products.filter(p=>p.id!==id); setProducts(n); sync('faith_products_db', n); }}
            onUpdateUser={(id:any, data:any) => { const n = users.map(u=>u.id===id?{...u, ...data}:u); setUsers(n); sync('faith_users_db', n); }}
            onDeleteUser={(id:any) => { const n = users.filter(u=>u.id!==id); setUsers(n); sync('faith_users_db', n); }}
            onUpdateOrder={handleOrderUpdate}
            onBulkUpdate={handleBulkUpdate}
          />
        )}
        
        {view === 'track-order' && <TrackOrderView orders={orders} currentUser={currentUser} />}
        {view === 'auth' && <AuthView onAuthSuccess={handleAuth} />}
        {view === 'checkout' && <CheckoutView cart={cart} currentUser={currentUser} onComplete={async (o: any) => { 
          // Local Update
          const next = [o, ...orders]; setOrders(next); sync('faith_orders_db', next);
          const updatedProducts = products.map(p => {
             const inOrder = o.items.find((item: any) => item.id === p.id);
             if (inOrder) return { ...p, soldCount: (p.soldCount || 0) + inOrder.quantity, stock: Math.max(0, p.stock - inOrder.quantity) };
             return p;
          });
          setProducts(updatedProducts); sync('faith_products_db', updatedProducts);
          
       if (isSynced) {
        try {
          const token = localStorage.getItem("faith_token");
      
          // 🔥 FORMAT ORDER HERE
          const formattedOrder = {
            phoneNumber: o.phoneNumber,
            items: o.items.map((item: any) => ({
              productId: item._id || item.id, // MUST be Mongo _id
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          };
      
          await fetch(`${API_BASE}/orders`, {
            method: "POST", // 🚨 you were missing this
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formattedOrder),
          });
      
        } catch (e) {}
      }
          
          setCart([]); setView('success'); 
        }} onAuth={() => setView('auth')} />}
        {view === 'success' && (
          <div className="pt-64 pb-64 text-center animate-future-in">
             <div className="rotating-border-container mx-auto w-40 h-40 mb-14 flex items-center justify-center relative">
                <CheckCircle2 className="w-20 h-20 text-emerald-500 relative z-10 drop-shadow-neon" />
             </div>
             <h1 className="text-8xl font-serif italic font-bold mb-8 text-rose-600">Sync Success.</h1>
             <p className="text-2xl text-slate-400 dark:text-slate-300 mb-16 font-light italic">Order protocol verified. Protocol ID Trace Active.</p>
             <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button onClick={() => setView('track-order')} className="px-12 py-6 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-2xl active-scale flex items-center gap-3"><Truck className="w-4 h-4" /> Trace Order Logistics</button>
                <button onClick={() => setView('home')} className="px-12 py-6 border-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-100 rounded-[32px] font-black uppercase tracking-widest text-[11px] active-scale">Return to Sanctuary</button>
             </div>
          </div>
        )}
      </main>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} onCheckout={() => { setIsCartOpen(false); setView('checkout'); }} />}
      {isProfileOpen && currentUser && (
        <ProfileModal 
          user={currentUser} onClose={() => setIsProfileOpen(false)}  
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem("faith_session_active");
            localStorage.removeItem("faith_token");
            setView("home");
            setIsProfileOpen(false);
          }}
          wishlistProducts={wishlistProducts} onRemoveFromWishlist={toggleWishlist} onAddToCart={handleAddToCart}
          onUpdateUser={(id:any, data:any) => { 
            const nextU = {...currentUser, ...data}; setCurrentUser(nextU); sync('faith_session_active', nextU); 
            const nextUs = users.map(u=>u.id===id?nextU:u); setUsers(nextUs); sync('faith_users_db', nextUs); 
          }}
          isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        />
      )}
      {selectedProduct && <ProductModal product={selectedProduct} isWishlisted={currentUser?.wishlist?.includes(selectedProduct.id)} onToggleWishlist={toggleWishlist} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onAddReview={handleAddReview} currentUser={currentUser} />}
    </div>
  );
};

// --- Sub Components ---

const ProfileModal = ({ user, onClose, onLogout, wishlistProducts, onRemoveFromWishlist, onAddToCart, onUpdateUser, isDarkMode, setIsDarkMode }: any) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'settings'>('profile');
  const [editData, setEditData] = useState({ name: user.name, phoneNumber: user.phoneNumber || '', address: user.address || '', profilePic: user.profilePic || '', password: user.password || '' });

  return (
    <div className="fixed inset-0 z-[120] flex animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 m-auto h-[85vh] rounded-[64px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 transition-colors">
        <aside className="w-full md:w-96 bg-slate-900 dark:bg-slate-950 text-white p-12 flex flex-col">
          <div className="text-center mb-10">
            <div className="rotating-border-container mx-auto w-32 h-32 mb-6 p-1 relative">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center font-black text-slate-900 dark:text-white text-4xl shadow-neon">
                {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
            </div>
            <h3 className="text-2xl font-serif italic font-bold">{user.name}</h3>
            <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.4em] mt-2">Verified {user.role}</p>
          </div>
          
          <nav className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
             <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-8 py-4 rounded-[24px] font-black uppercase text-[10px] flex items-center gap-5 transition-all ${activeTab === 'profile' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Activity className="w-4 h-4" /> My Dashboard</button>
             <button onClick={() => setActiveTab('wishlist')} className={`w-full text-left px-8 py-4 rounded-[24px] font-black uppercase text-[10px] flex items-center gap-5 transition-all ${activeTab === 'wishlist' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Heart className="w-4 h-4" /> My Favorites</button>
             <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-8 py-4 rounded-[24px] font-black uppercase text-[10px] flex items-center gap-5 transition-all ${activeTab === 'settings' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Settings className="w-4 h-4" /> Sync Settings</button>
             
             <div className="h-px bg-white/10 my-6"></div>
             
             <div className="space-y-1">
                <div className="flex items-center justify-between px-8 py-3 bg-white/5 rounded-2xl">
                   <span className="text-[10px] font-black uppercase text-slate-300">1. Dark Sanctuary</span>
                   <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-5 rounded-full transition-all relative ${isDarkMode ? 'bg-rose-600' : 'bg-slate-700'}`}><div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-5.5' : 'left-0.5'}`}></div></button>
                </div>
                <div className="px-8 py-3 flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 cursor-default"><Crown className="w-4 h-4 text-amber-500" /> 2. Luxury Tier: {user.role === 'admin' ? 'Gold' : 'Citizen'}</div>
                <div className="px-8 py-3 flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 cursor-default"><Fingerprint className="w-4 h-4 text-sky-500" /> 3. Bio-Metric Key</div>
                <div className="px-8 py-3 flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 cursor-default"><Languages className="w-4 h-4 text-emerald-500" /> 4. Global Dialect: EN</div>
                <div className="px-8 py-3 flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 cursor-default"><Bell className="w-4 h-4 text-rose-400" /> 5. Sync Alerts (3)</div>
                <div className="px-8 py-3 flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 cursor-default"><Cloud className="w-4 h-4 text-indigo-400" /> 6. Cloud Archive</div>
             </div>
          </nav>

          <button onClick={onLogout} className="mt-6 py-4 bg-white/5 hover:bg-rose-500 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all"><LogOut className="w-4 h-4" /> Logout</button>
        </aside>

        <main className="flex-1 p-12 overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-serif italic font-bold text-slate-900 dark:text-white">
              {activeTab === 'profile' && 'Citizen Overview'}
              {activeTab === 'wishlist' && 'Luxury Favorites'}
              {activeTab === 'settings' && 'Identity Control'}
            </h2>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X className="w-6 h-6" /></button>
          </div>
          
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-fade-in">
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Faith Points</p>
                    <div className="flex items-center gap-3">
                       <Gem className="w-10 h-10 text-rose-500" />
                       <span className="text-5xl font-black italic text-slate-900 dark:text-white">{user.faithPoints}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Favorited</p>
                    <div className="flex items-center gap-3">
                       <Heart className="w-10 h-10 text-rose-500" />
                       <span className="text-5xl font-black italic text-slate-900 dark:text-white">{wishlistProducts.length}</span>
                    </div>
                  </div>
               </div>
               <div className="bg-rose-50/30 dark:bg-rose-900/10 p-12 rounded-[56px] border border-rose-100 dark:border-rose-900/30">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-rose-600 shadow-xl border border-rose-100 dark:border-rose-900/50"><History className="w-10 h-10" /></div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Active Since</h4>
                      <p className="text-slate-500 dark:text-slate-400 italic mt-1">{new Date(user.joinedAt).toLocaleDateString()} — Identity Verified</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Full Name</label>
                     <input className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-200 text-slate-900 dark:text-white" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Sync Number</label>
                     <input className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-200 text-slate-900 dark:text-white" placeholder="07XX XXX XXX" value={editData.phoneNumber} onChange={e => setEditData({...editData, phoneNumber: e.target.value})} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Security Key (Password)</label>
                     <input type="password" className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-200 text-slate-900 dark:text-white" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Profile Photo Link</label>
                     <input className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-200 text-slate-900 dark:text-white" placeholder="URL to Image" value={editData.profilePic} onChange={e => setEditData({...editData, profilePic: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Drop-off Zone</label>
                  <input className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-200 text-slate-900 dark:text-white" placeholder="Apartment, Street, City" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
               </div>
               <button onClick={() => { onUpdateUser(user.id, editData); alert('Identity Resynced.'); }} className="w-full py-8 bg-slate-900 dark:bg-rose-600 text-white rounded-[40px] font-black uppercase tracking-widest text-[12px] shadow-2xl hover:bg-rose-700 transition-all active:scale-95 mt-10">Commit Identity Changes</button>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in">
               {wishlistProducts.length === 0 ? <div className="text-center py-20 text-slate-300 italic text-2xl dark:text-slate-500">Sanctuary is vacant.</div> : (
                 wishlistProducts.map((p: Product) => (
                   <div key={p.id} className="flex items-center gap-10 group bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[48px] hover:bg-rose-50/50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-rose-100">
                      <img src={p.image} className="w-24 h-32 rounded-[32px] object-cover shadow-2xl group-hover:scale-110 transition-transform duration-700" />
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{p.name}</h4>
                        <p className="text-sm font-black italic text-rose-600 mt-2 tracking-widest">Ksh {p.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => onAddToCart(p)} className="p-6 bg-slate-900 dark:bg-rose-600 text-white rounded-[24px] hover:bg-rose-700 transition-all shadow-xl active:scale-90"><ShoppingBag className="w-6 h-6" /></button>
                        <button onClick={() => onRemoveFromWishlist(p.id)} className="p-6 bg-white dark:bg-slate-800 text-slate-300 hover:text-rose-600 rounded-[24px] shadow-sm transition-all active:scale-90"><Trash2 className="w-6 h-6" /></button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return <MainContent />;
}
