
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, X, Star, Trash2, Plus, Minus, Truck, Smartphone, CheckCircle2, 
  Eye, Heart, MapPin, Lock, ArrowLeft, Loader2, Sparkles, CreditCard, 
  LogOut, Users, BarChart3, ClipboardList, Camera, History, Edit3, Globe, 
  Shield, Activity, RefreshCw, Cpu, Menu, Gem, Layers, Send, Search, ArrowUpDown, 
  ChevronRight, Key, Mail, Github, User as UserIcon, Package, TrendingUp, Settings, PieChart,
  ArrowRight, CreditCard as CardIcon, Map, DollarSign, Briefcase, Moon, Sun, Bell, Gift, 
  Languages, Trash, Share2, ShieldAlert, Crown, Zap, Fingerprint, Cloud, MessageSquare,
  Wifi, WifiOff, Clock, Youtube // <-- Added Clock and Youtube
} from 'lucide-react';
import { PRODUCTS as INITIAL_PRODUCTS, SHIPPING_OPTIONS } from './constants';
import { Product, CartItem, Order, User, Category, Review } from './types';
import { initiateSTKPush } from './services/mpesaService';
import { generateProductCopy, getStyleTips } from './services/geminiService';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, BarChart, Bar, Cell, PieChart as RePieChart, Pie } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || 
  (import.meta.env.MODE === 'production' 
    ? "https://faith-blst.onrender.com/api" 
    : "http://localhost:5000/api");

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070",
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=2070",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1509664158680-07c5032b51e5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGZhc2hpb24lMjBiYWNrZ3JvdW5kfGVufDB8MHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1566958799193-c2aa57a835d4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGlnaCUyMGhlZWxzfGVufDB8MHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1658043408629-a99f0fc6bf0b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTQyfHxiaWtpbml8ZW58MHwwfDB8fHww",
  "https://images.unsplash.com/photo-1771151723402-d45f379ceaa9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHNob3J0JTIwc2tpcnR8ZW58MHwwfDB8fHww",
  "https://images.unsplash.com/photo-1722467180322-0bd55d4d99e8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTd8fHNob3J0JTIwc2tpcnR8ZW58MHwwfDB8fHww"
];

// E-Commerce Nested Category Hierarchy 
const CATEGORY_HIERARCHY = {
  'Women': ['Dresses', 'Tops', 'Bottoms', 'Shoes'],
  'Men': ['Shirts', 'Pants', 'Suits', 'Shoes'],
  'Accessories': ['Bags', 'Jewelry', 'Watches'],
  'Hot Deals': []
};

//Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'faith_shop'); 
  
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/dqph9r4kj/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary Error:", err);
    return null;
  }
};


// --- Shared Components ---

const Navbar = ({ cartCount, onOpenCart, setView, activeView, selectedCategory, setSelectedCategory, currentUser, onOpenProfile, searchQuery, setSearchQuery, products, isSynced }: any) => {
const [showSearch, setShowSearch] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (cartCount > 0) {
      setIsAnimate(true);
      const timer = setTimeout(() => setIsAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

const searchResults = useMemo(() => {
    if (!searchQuery || !products) return []; // Added !products check
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, products]);

  return (
    <header className="sticky top-0 z-[60] w-full">
<div className="bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-[0.4em] animate-gradient-x relative">
  Nairobi Same-Day Luxury Delivery • Presence By Faith
</div>
      
      <nav className="bg-white/90 dark:bg-slate-900/90 glass border-b border-rose-100 dark:border-slate-800 px-4 md:px-12 h-20 flex items-center justify-between shadow-xl transition-colors">
<div className="flex items-center gap-4">
          <button className="lg:hidden text-slate-600 dark:text-slate-300 p-2 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <button 
             onClick={() => { setView('home'); setSelectedCategory('All'); }} 
            className="group flex flex-col items-start leading-none transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-3xl font-serif font-bold tracking-tighter text-rose-600 italic">Faith</span>
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-400 mt-1 uppercase">Boutique</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">
<button onClick={() => { setView('home'); setSelectedCategory('All'); }} className={`hover:text-rose-600 transition-all ${selectedCategory === 'All' && activeView === 'home' ? 'text-rose-600 border-b-2 border-rose-600 pb-1' : ''}`}>
            All
          </button>
          {Object.keys(CATEGORY_HIERARCHY).map((parentCat) => (
             <div key={parentCat} className="relative group py-4">
                <button 
                  onClick={() => { setView('home'); setSelectedCategory(parentCat); }} 
                  className={`hover:text-rose-600 transition-all ${selectedCategory.startsWith(parentCat) && activeView === 'home' ? 'text-rose-600' : ''}`}
                >
                  {parentCat}
                </button>
                {CATEGORY_HIERARCHY[parentCat as keyof typeof CATEGORY_HIERARCHY].length > 0 && (
                  <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-50">
                    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col min-w-[180px] gap-1 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-xl rounded-full"></div>
                       {CATEGORY_HIERARCHY[parentCat as keyof typeof CATEGORY_HIERARCHY].map(sub => (
                          <button 
                            key={sub} 
                            onClick={() => { setView('home'); setSelectedCategory(`${parentCat} - ${sub}`); }} 
                            className="text-left px-4 py-3 hover:bg-rose-50 dark:hover:bg-slate-800/80 rounded-xl transition-all text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600"
                          >
                            {sub}
                          </button>
                       ))}
                    </div>
                  </div>
                )}
             </div>
          ))}
          
          <div className="relative group">
            <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full transition-all border border-transparent ${showSearch ? 'w-64 border-rose-200 ring-2 ring-rose-100' : 'w-48'}`}>
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                placeholder="Search sanctuary..." 
                className="bg-transparent border-none outline-none text-[10px] w-full font-bold text-slate-900 dark:text-white placeholder:text-slate-500"
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
          <button onClick={onOpenCart} className={`relative p-2 text-slate-600 hover:text-rose-500 transition-all ${isAnimate ? 'scale-125 text-rose-600' : ''}`}>
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

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-[100] flex animate-fade-in-left lg:hidden">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative w-72 bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 flex flex-col border-r border-slate-100 dark:border-slate-800">
               <div className="flex justify-between items-center mb-10">
                  <span className="text-3xl font-serif font-bold text-rose-600 italic">Faith</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
               </div>
               
               <div className="relative mb-8">
                 <input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search sanctuary..." 
                   className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border-none outline-none text-xs font-bold text-slate-900 dark:text-white"
                 />
                 <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
               </div>

               <div className="flex flex-col gap-6 flex-1">
                  <button 
                    onClick={() => { setView('home'); setSelectedCategory('All'); setIsMobileMenuOpen(false); }} 
                    className={`text-left text-xs font-black uppercase tracking-widest ${selectedCategory === 'All' ? 'text-rose-600' : 'text-slate-500 hover:text-rose-500'}`}
                  >
                    All Collection
                  </button>

                  {Object.keys(CATEGORY_HIERARCHY).map(parentCat => (
                     <div key={parentCat} className="flex flex-col gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
                        <button 
                          onClick={() => { setView('home'); setSelectedCategory(parentCat); setIsMobileMenuOpen(false); }} 
                          className={`text-left text-sm font-black uppercase tracking-widest ${selectedCategory.startsWith(parentCat) ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}
                        >
                          {parentCat}
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                           {CATEGORY_HIERARCHY[parentCat as keyof typeof CATEGORY_HIERARCHY].map(sub => (
                              <button 
                                key={sub} 
                                onClick={() => { setView('home'); setSelectedCategory(`${parentCat} - ${sub}`); setIsMobileMenuOpen(false); }} 
                                className={`text-left px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] font-bold uppercase tracking-wider ${selectedCategory === `${parentCat} - ${sub}` ? 'text-rose-500 ring-1 ring-rose-200 bg-rose-50' : 'text-slate-500'}`}
                              >
                                {sub}
                              </button>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </header>
  );
};

// --- Admin Dashboard Component ---
const AdminVault = ({ products, orders, users, onAdd, onDelete, onUpdateUser, onDeleteUser, onUpdateOrder, onBulkUpdate }: any) => {
  const [tab, setTab] = useState<'analytics' | 'products' | 'orders' | 'users'>('analytics');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: 'Women' as any, stock: 10, image: '', description: '', isHot: false });
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const prevOrderCount = useRef(orders.length);

useEffect(() => {
  // If order count increases, it's a new order! Play a cool futuristic sound
  if (orders.length > prevOrderCount.current) {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio autoplay blocked"));
    // Update the ref
    prevOrderCount.current = orders.length;
  }
}, [orders.length]);
  
const stats = useMemo(() => ({
    revenue: orders.reduce((s: number, o: any) => s + (o.total || 0), 0),
    avgOrder: orders.length ? orders.reduce((s: number, o: any) => s + (o.total || 0), 0) / orders.length : 0,
    activeUsers: users.length,
    inventoryValue: products.reduce((s: number, p: any) => s + ((p.price || 0) * (p.stock || 0)), 0)
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
          <div className="flex flex-wrap sm:flex-nowrap p-2 bg-slate-100 dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 gap-2 overflow-x-auto scrollbar-hide">
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
         <div className="space-y-6 md:space-y-10 animate-fade-in w-full overflow-hidden">
            {/* Stats Grid - Now responsive for mobile (1 col), tablet (2 cols), and desktop (4 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
               {[
                 { label: 'Total Revenue', val: `Ksh ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
                 { label: 'Active Citizens', val: stats.activeUsers, icon: Users, color: 'text-sky-500' },
                 { label: 'Avg Order Value', val: `Ksh ${Math.round(stats.avgOrder).toLocaleString()}`, icon: TrendingUp, color: 'text-rose-500' },
                 { label: 'Pool Value', val: `Ksh ${stats.inventoryValue.toLocaleString()}`, icon: Gem, color: 'text-amber-500' }
               ].map((s: any, i: number) => (
                 <div key={i} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-center">
                    <s.icon className={`w-6 h-6 md:w-8 md:h-8 mb-4 md:mb-6 ${s.color}`} />
                    <p className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-widest mb-1 md:mb-2">{s.label}</p>
                    <h4 className="text-2xl md:text-3xl font-black italic text-slate-900 dark:text-white truncate">{s.val}</h4>
                 </div>
               ))}
            </div>
            
            {/* Chart Container - Padding and height adjusted for mobile */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-12 rounded-[32px] md:rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-xl h-[350px] md:h-[400px] flex flex-col w-full">
               <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-10 text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
                 <Activity className="w-5 h-5 md:w-6 md:h-6 text-rose-500" /> Capital Trend Session
               </h3>
               <div className="flex-1 w-full min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend}>
                       <defs>
                         <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip 
                         contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                         labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                         itemStyle={{ color: '#e11d48', fontWeight: 'bold' }}
                       />
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
                      <select className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-black uppercase text-[10px] text-slate-900 dark:text-white outline-none" value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                       <optgroup label="General / Top Level">
                         <option value="Women">Women (All)</option>
                         <option value="Men">Men (All)</option>
                         <option value="Accessories">Accessories (All)</option>
                         <option value="Hot Deals">Hot Deals (Standalone)</option>
                       </optgroup>
                       {Object.keys(CATEGORY_HIERARCHY).map(parentCat => CATEGORY_HIERARCHY[parentCat as keyof typeof CATEGORY_HIERARCHY].length > 0 && (
                          <optgroup key={parentCat} label={`${parentCat} Specifics`}>
                            {CATEGORY_HIERARCHY[parentCat as keyof typeof CATEGORY_HIERARCHY].map(sub => (
                               <option key={`${parentCat} - ${sub}`} value={`${parentCat} - ${sub}`}>{parentCat} - {sub}</option>
                            ))}
                          </optgroup>
                       ))}
                    </select>
                   <div className="md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-[24px]">
  <input 
    type="file" 
    accept="image/*"
    className="w-full font-bold text-slate-900 dark:text-white file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-rose-100 file:text-rose-600 hover:file:bg-rose-200 transition-all cursor-pointer"
    onChange={async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = await uploadToCloudinary(file); // Calls your Cloudinary function
        if (url) {
          if (editingProduct) setEditingProduct({...editingProduct, image: url});
          else setNewProduct({...newProduct, image: url});
        }
      }
    }} 
  />
  {(editingProduct?.image || newProduct.image) && (
    <img src={editingProduct ? editingProduct.image : newProduct.image} className="w-16 h-16 rounded-xl object-cover shadow-md" alt="Preview" />
  )}
</div>
                   <textarea className="md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white h-32" placeholder="Seductive Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
                    
                    <label className="md:col-span-2 flex items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] font-bold text-slate-900 dark:text-white cursor-pointer select-none border border-transparent hover:border-rose-100 transition-colors">
                       <input type="checkbox" checked={editingProduct ? editingProduct.isHot : newProduct.isHot} onChange={e => editingProduct ? setEditingProduct({...editingProduct, isHot: e.target.checked}) : setNewProduct({...newProduct, isHot: e.target.checked})} className="w-6 h-6 rounded-lg accent-rose-600" />
                       Mark as "Hot Deal" 🔥 (Shows glowing badge)
                    </label>

                    <button className="md:col-span-2 py-6 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] hover:shadow-neon transition-all">Commit Configuration</button>
                 </form>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto"> 
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
                           <td className="px-8 py-6">
                             <span className="text-[10px] font-black uppercase text-rose-500">{p.category}</span>
                             {p.isHot && <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[8px] font-black uppercase tracking-wider">Hot</span>}
                          </td>
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
         </div>
       )}

      {tab === 'orders' && (
  <div className="space-y-8 animate-fade-in">
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
      <Activity className="w-6 h-6 text-rose-500" /> Logistics Protocol Status
    </h3>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((o: any) => {
        // Assume standard 3 days delivery if missing, or use o.deliveryDays
        const daysLeft = o.deliveryDays || 3; 
        const isDelivered = o.status === 'Delivered';

        return (
          <div key={o._id || o.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border ${isDelivered ? 'border-emerald-500/30' : 'border-rose-500/50 shadow-neon'} transition-all relative overflow-hidden flex flex-col`}>
            {/* Glowing background for active orders */}
            {!isDelivered && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full"></div>}
            
            {/* Header: Profile Pic & Status */}
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                 {/* Replaced 2-digits with User Profile Icon */}
                 <div className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800 overflow-hidden bg-rose-50 flex items-center justify-center shrink-0 shadow-md">
                   {o.userProfilePic ? <img src={o.userProfilePic} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-rose-400" />}
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">#{ (o._id || o.id || 'XXXX').slice(-6).toUpperCase() }</p>
                   <p className="font-bold text-sm text-slate-900 dark:text-white">{o.userName || o.phoneNumber}</p>
                 </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                o.status === 'Processing' ? 'bg-amber-100 text-amber-600' : 
                o.status === 'Shipped' ? 'bg-sky-100 text-sky-600' : 
                o.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>{o.status || 'Processing'}</span>
            </div>

            {/* Content: Details & Countdown */}
            {!isDelivered && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 relative z-10 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black uppercase text-slate-400">Total Value</span>
                  <span className="text-lg font-black italic text-slate-900 dark:text-white">Ksh {o.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Countdown</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{daysLeft} Days to Drop-off</span>
                </div>
              </div>
            )}

            {/* Drop-off Zone Note */}
            <p className="text-[10px] font-bold text-slate-500 mb-6 truncate"><MapPin className="w-3 h-3 inline mr-1"/> {o.address || 'Drop-off Zone Pending'}</p>

            {/* Action Buttons */}
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
               {isDelivered ? (
                 <p className="text-xs font-black uppercase tracking-widest text-emerald-500 w-full text-center">Settled & Closed</p>
               ) : (
                 <select 
                    value={o.status || 'Processing'} 
                    onChange={(e) => onUpdateOrder(o._id || o.id, { status: e.target.value })}
                    className="w-full bg-slate-900 dark:bg-rose-600 text-white p-3 rounded-xl text-[10px] font-black uppercase outline-none shadow-xl cursor-pointer hover:bg-rose-700 transition-colors text-center appearance-none"
                 >
                    <option value="Processing">Tap to Update: Processing</option>
                    <option value="Shipped">Tap to Update: Shipped</option>
                    <option value="Delivered">Tap to Update: Delivered</option>
                    <option value="Cancelled">Cancel Order</option>
                 </select>
               )}
            </div>
          </div>
        )
      })}
    </div>
    {orders.length === 0 && <div className="p-40 text-center italic text-slate-300">Operational History Vacant</div>}
  </div>
)}

{tab === 'users' && (
  <div className="space-y-8 animate-fade-in">
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sanctuary Citizen Nodes</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {users.map((u: any) => (
        <div key={u.id || u._id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-slate-800 flex items-center justify-center text-rose-500 font-black text-2xl border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
                {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.name?.charAt(0) || '?'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {u.name} 
                  {u.email === 'faith@faith' && <Crown className="w-4 h-4 text-amber-500" />}
                </h4>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{u.email}</p>
              </div>
            </div>
          </div>
          {u.email !== 'faith@faith' ? (
            <div className="flex gap-4 relative z-10 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => onUpdateUser(u._id || u.id, { role: u.role === 'admin' ? 'customer' : 'admin' })} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-slate-900 dark:text-white">
                {u.role === 'admin' ? 'Revoke Shield' : 'Elevate Privilege'}
              </button>
              <button onClick={() => onDeleteUser(u._id || u.id)} className="p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Supreme System Architect</p>
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const endpoint = isLogin ? "/auth/login" : "/auth/register";
  
  let authData = null;

  // ONLY catch network/server errors here
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    authData = await res.json();

    if (!res.ok) {
      return alert(authData.message || "Identity verification failed.");
    }
  } catch (err) {
    return alert("Sanctuary server is offline. Check connection.");
  }

  if (authData) {
    onAuthSuccess(authData.user, authData.token);
  }
};

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-12 rounded-[64px] shadow-2xl border border-slate-200 dark:border-slate-800 animate-future-in text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl"></div>
        <div className="w-20 h-20 bg-rose-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-10 text-rose-500 shadow-xl border-4 border-white dark:border-slate-900"><Lock className="w-8 h-8" /></div>
        <h2 className="text-4xl font-serif italic font-bold text-slate-900 dark:text-white mb-4">{isLogin ? 'Access Identity' : 'Register Identity'}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm italic mb-10 font-medium">Sync your persona with the sanctuary.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && <input required className="w-full p-6 bg-slate-100 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-slate-900 dark:text-white border border-transparent focus:border-rose-300 transition-all" placeholder="Name Protocol" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />}
          <input required type="email" className="w-full p-6 bg-slate-100 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-slate-900 dark:text-white border border-transparent focus:border-rose-300 transition-all" placeholder="Email Channel" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="password" className="w-full p-6 bg-slate-100 dark:bg-slate-800 rounded-[24px] font-bold outline-none text-slate-900 dark:text-white border border-transparent focus:border-rose-300 transition-all" placeholder="Security Key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="w-full py-7 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-rose-600 transition-all active:scale-95">Verify & Initialize</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-10 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors tracking-widest">{isLogin ? "New visionary? Create identity" : "Existing citizen? Access sanctuary"}</button>
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
  const [isEditingReview, setIsEditingReview] = useState(false);
const [showAllComments, setShowAllComments] = useState(false);

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
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 animate-fade-in">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl m-auto bg-white dark:bg-slate-900 h-[90vh] md:h-[85vh] rounded-[32px] md:rounded-[64px] shadow-2xl overflow-hidden flex flex-row border border-white/10">
        
        {/* DESKTOP Image (Hidden on mobile) */}
        <div className="hidden md:block w-1/2 relative h-full">
          <img src={product.image} className="w-full h-full object-cover" />
        </div>

        {/* RIGHT SIDE (Takes full width on mobile, separates scroll content from fixed footer) */}
        <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
          
          {/* SCROLLING CONTENT AREA */}
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col w-full">
            
            {/* MOBILE Image (Scrolls with text, hidden on desktop) */}
            <div className="block md:hidden w-full relative h-[45vh] shrink-0">
              <img src={product.image} className="w-full h-full object-cover" />
              <button onClick={onClose} className="absolute top-4 left-4 p-3 bg-slate-900/40 backdrop-blur-xl text-white rounded-full hover:bg-slate-900/60 z-10">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Text Content */}
            <div className="p-6 md:p-16 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.4em]">{product.category}</span>
                <button onClick={onClose} className="hidden md:block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X className="w-8 h-8" /></button>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-slate-900 dark:text-white mb-6 leading-tight">{product.name}</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <span className="text-3xl md:text-4xl font-black italic text-rose-600">Ksh {product.price.toLocaleString()}</span>
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
                     <div key={i} className="flex items-center gap-4 p-4 md:p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100/50">
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t}</p>
                     </div>
                   ))}
                </div>

<div className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
  <div className="flex justify-between items-center">
    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
      <MessageSquare className="w-3 h-3 text-sky-500" /> Comments & Ratings
    </h4>
    {product.reviews?.length > 2 && (
      <button onClick={() => setShowAllComments(!showAllComments)} className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors">
        {showAllComments ? 'Collapse' : 'Expand All'}
      </button>
    )}
  </div>

  {/* Comments Display Box (Flexible & Scrolling) */}
  <div className={`space-y-4 transition-all duration-500 overflow-y-auto scrollbar-hide pr-2 ${showAllComments ? 'max-h-[400px]' : 'max-h-[200px]'}`}>
    {product.reviews?.length ? (
      (showAllComments ? product.reviews : product.reviews.slice(0, 2)).map((r: any) => (
        <div key={r.id || r.userId} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {r.userProfilePic ? <img src={r.userProfilePic} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-rose-400" />}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">{r.userName}</p>
                <p className="text-[8px] text-slate-400 mt-0.5">{r.date}</p>
              </div>
              <div className="flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-current' : ''}`} />)}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{r.comment}"</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-xs text-slate-400 dark:text-slate-500 italic p-4 text-center">No comments transmitted yet.</p>
    )}
  </div>

  {/* User's Input / Edit Section */}
  <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 mt-6 relative transition-opacity">
    {currentUser && product.reviews?.find((r: any) => r.userId === currentUser.id) && !isEditingReview ? (
      <div className="text-center opacity-70">
        <div className="flex justify-center items-center gap-4 mb-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Rating:</span>
          <div className="flex gap-1 text-amber-400">
             {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= (product.reviews.find((r: any) => r.userId === currentUser.id)?.rating || 5) ? 'fill-current' : ''}`} />)}
          </div>
        </div>
        <p className="text-sm text-slate-500 italic mb-6">"{product.reviews.find((r: any) => r.userId === currentUser.id)?.comment}"</p>
        <button onClick={() => {
          setReviewRating(product.reviews.find((r: any) => r.userId === currentUser.id)?.rating || 5);
          setReviewComment(product.reviews.find((r: any) => r.userId === currentUser.id)?.comment || '');
          setIsEditingReview(true);
        }} className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase text-rose-500 hover:text-rose-600">
          <Edit3 className="w-3 h-3" /> Edit Your Comment
        </button>
      </div>
    ) : (
      <form onSubmit={(e) => { handleReviewSubmit(e); setIsEditingReview(false); }} className="space-y-6">
        <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          {isEditingReview ? 'Update Your Comment' : 'Leave a Comment'}
        </h5>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rating:</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button type="button" key={s} onClick={() => setReviewRating(s)} className="transition-transform active:scale-110">
                <Star className={`w-6 h-6 ${s <= reviewRating ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'text-slate-200'}`} />
              </button>
            ))}
          </div>
        </div>
        <textarea 
          required
          placeholder="Share your experience..."
          className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[20px] font-bold outline-none text-xs text-slate-900 dark:text-white min-h-[80px]"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
        />
        <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-rose-600 text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-xl">
                            {isEditingReview ? 'Save Updates' : 'Submit Comment'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div> {/* <-- ADDED: Closes space-y-12 */}
              </div>
            </div>
          </div>
        </div>
      </div> {/* <-- ADDED: Closes fixed inset-0 */}
    );
  };
// --- Helper Components ---

const CartDrawer = ({ cart, setCart, onClose, onCheckout }: any) => {
  return (
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
                  <div className="flex flex-wrap gap-4 justify-between items-center mt-2">
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
  const userOrders = orders.filter((o: any) => o.userId === currentUser?._id || o.userId === currentUser?.id);
  const stages = ['Processing', 'Shipped', 'Delivered'];

  return (
    <div className="max-w-6xl mx-auto pt-40 pb-32 px-6 animate-future-in">
       <h2 className="text-6xl font-serif italic font-bold text-slate-900 dark:text-white mb-16">Logistics Trace</h2>
       {userOrders.length === 0 ? <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[64px] italic text-slate-500 font-bold">No active transmissions.</div> : (
         <div className="grid gap-10">
           {userOrders.map((order: any) => {
             const currentIdx = stages.indexOf(order.status);
             return (
               <div key={order._id || order.id} className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between mb-10">
                     <div>
                        <span className="px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full">Protocol #{(order._id || order.id).slice(-6)}</span>
                        <h4 className="text-2xl font-bold mt-4 text-slate-900 dark:text-white">{order.items.length} Payload(s)</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-4xl font-black italic text-rose-600">Ksh {order.total.toLocaleString()}</p>
                     </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="flex justify-between mb-4">
                     {stages.map((s, i) => (
                       <span key={s} className={`text-[9px] font-black uppercase ${i <= currentIdx ? 'text-emerald-500' : 'text-slate-300'}`}>{s}</span>
                     ))}
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex gap-1 overflow-hidden">
                     {stages.map((_, i) => (
                       <div key={i} className={`h-full flex-1 transition-all duration-1000 ${i <= currentIdx ? 'bg-emerald-500 shadow-neon' : 'bg-transparent'}`} />
                     ))}
                  </div>
               </div>
             )
           })}
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
           userId: currentUser.id || currentUser._id,
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

if (currentUser && !currentUser.address) {
  return (
    <div className="pt-60 text-center animate-future-in">
      <div className="mx-auto w-24 h-24 mb-8 flex items-center justify-center text-rose-500">
        <MapPin className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-serif italic font-bold text-slate-900 dark:text-white">Drop-off Zone Missing</h2>
      <p className="text-slate-400 mt-4 italic">You must configure your Drop-off Zone in settings before settlement.</p>
      <button onClick={() => onAuth('profile')} className="mt-8 px-12 py-5 bg-rose-600 text-white rounded-full font-black uppercase text-[10px] shadow-2xl active-scale">
        Configure Profile
      </button>
    </div>
  );
}

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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS || []);
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

    const toastTimeoutRef = useRef(null);
  
  // Persisted Dark Mode configuration
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('faith_theme') === 'dark';
  });
  
  const [showCartToast, setShowCartToast] = useState<Product | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  const sync = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

    useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
   }, [view, selectedProduct]);

// 1. DEFINED HERE: Now both handleAuth and useEffect can access it!
  const checkBackendSync = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) { setIsSynced(false); return; }
      setIsSynced(true);

      const token = localStorage.getItem('faith_token');
      if (!token) return;

      // Fetch Products
      fetch(`${API_BASE}/products`)
        .then(r => r.json())
        .then(data => setProducts(data.map((p: any) => ({ ...p, id: p._id }))))
        .catch(e => console.log("Product sync delayed"));

      // 1. Get user session FIRST so we know if they are an admin
      const session = localStorage.getItem('faith_session_active');
      const localUser = session ? JSON.parse(session) : null;

      // 2. Fetch Orders based on role (Admin sees all, normal user sees /my)
      const orderEndpoint = localUser?.role === 'admin' ? '/orders' : '/orders/my';
      fetch(`${API_BASE}${orderEndpoint}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(data => setOrders(data))
        .catch(e => console.log("Order sync delayed"));

      // 3. Admin Data (Users)
      if (localUser?.role === 'admin') {
        fetch(`${API_BASE}/users`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : [])
          .then(data => {
             // Ensure data is an array and map MongoDB _id to standard id
             const formattedUsers = Array.isArray(data) ? data.map((u: any) => ({ ...u, id: u._id || u.id })) : [];
             setUsers(formattedUsers);
          })
          .catch(e => console.log("User list sync delayed"));
      }
    } catch (e) {
      setIsSynced(false);
    }
  };

  const handleAuth = (user: User, token?: string) => {
    // Standardize the ID format
    const normalizedUser = { 
      ...user, 
      id: (user as any)._id || user.id 
    };

    setCurrentUser(normalizedUser);
    localStorage.setItem("faith_session_active", JSON.stringify(normalizedUser));
    if (token) localStorage.setItem("faith_token", token);
    
    setView("home");
    // 2. THIS WILL NOW WORK WITHOUT CRASHING!
    checkBackendSync();
  };

  const filteredProducts = useMemo(() => {
    let result = [...(products || [])];

    if (searchQuery)
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

if (selectedCategory !== 'All') {
      if (selectedCategory === 'Hot Deals') {
        result = result.filter(p => p.category === 'Hot Deals' || p.isHot === true);
      } else {
        // Matches sub-categories exactly OR matches parent category group
        result = result.filter(p => p.category === selectedCategory || p.category?.startsWith(`${selectedCategory} -`));
      }
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    const session = localStorage.getItem('faith_session_active');
    if (session) setCurrentUser(JSON.parse(session));

    localStorage.removeItem('faith_products_db');
    localStorage.removeItem('faith_orders_db');
    localStorage.removeItem('faith_users_db');

    setProducts(INITIAL_PRODUCTS);
    
    // 🔹 Hero interval
    const interval = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % HERO_IMAGES.length);
    }, 7000);

    // 3. THIS ALSO WORKS!
    checkBackendSync();

    return () => clearInterval(interval);
  }, []);

// Sync Dark Mode state to DOM and Storage
  useEffect(() => {
    if (isDarkMode) {
       document.documentElement.classList.add('dark');
       localStorage.setItem('faith_theme', 'dark');
    } else {
       document.documentElement.classList.remove('dark');
       localStorage.setItem('faith_theme', 'light');
    }
  }, [isDarkMode]);




  const wishlistProducts = useMemo(() => {
    if (!currentUser || !currentUser.wishlist) return [];
    return products.filter(p => currentUser.wishlist.includes(p.id));
  }, [products, currentUser]);

const toggleWishlist = async (productId: string) => {
    if (!currentUser) return setView('auth');
    
    let nextW = currentUser.wishlist || [];
    nextW = nextW.includes(productId) ? nextW.filter(id => id !== productId) : [...nextW, productId];
    const nextU = { ...currentUser, wishlist: nextW };
    
    setCurrentUser(nextU);
    localStorage.setItem('faith_session_active', JSON.stringify(nextU));

    // Sync to backend DB
    try {
      await fetch(`${API_BASE}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
        },
        body: JSON.stringify({ wishlist: nextW })
      });
    } catch (e) {
      console.error("Failed to sync wishlist to server");
    }
  };

  const handleAddToCart = (p: Product) => {
    setCart(prev => {
        const ex = prev.find(i => i.id === p.id);
        return ex ? prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i) : [...prev, {...p, quantity: 1}];
    });
    
    setShowCartToast(p);
    
    // Clear previous timeout so rapid clicks don't cause visual glitches
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    
    toastTimeoutRef.current = setTimeout(() => setShowCartToast(null), 3000);
  };

const handleOrderUpdate = async (id: string, data: Partial<Order>) => {
    // 1. Update instantly on screen
    const next = orders.map((o: any) => (o._id === id || o.id === id) ? { ...o, ...data } : o);
    setOrders(next);
    sync('faith_orders_db', next);

    // 2. Sync change to Backend Database
    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.log("Failed to sync order update to server");
    }
  };

const handleAddReview = async (productId: string, review: Review) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
        },
        body: JSON.stringify({ rating: review.rating, comment: review.comment })
      });
      
      if (res.ok) {
        const updatedProduct = await res.json();
        // Replace product in list with updated DB product
        const nextProducts = products.map(p => p.id === productId ? { ...updatedProduct, id: updatedProduct._id } : p);
        setProducts(nextProducts);
        
        // Update modal view if currently open
        if (selectedProduct && selectedProduct.id === productId) {
           setSelectedProduct({ ...updatedProduct, id: updatedProduct._id });
        }
      } else {
        alert("Failed to submit comment to Sanctuary.");
      }
    } catch (e) {
      console.error("Review error:", e);
    }
  };

const handleBulkUpdate = async (type: string, id?: string, amount?: any) => {
    if (type === 'edit' && id && amount) {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
          },
          body: JSON.stringify(amount) // 'amount' is the edited product object here
        });
        
        if (res.ok) {
          const updatedProduct = await res.json();
          setProducts(products.map(p => p.id === id ? { ...updatedProduct, id: updatedProduct._id } : p));
        } else {
          alert("Failed to update entity on server.");
        }
      } catch (e) {
        console.error("Product update failed");
      }
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
                        
                        {p.isHot && (
                           <div className="absolute top-6 left-6 z-10 px-3 py-1.5 bg-rose-600/90 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-neon flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Hot Deal
                           </div>
                        )}

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

{/* --- ADMIN VIEW --- */}
        {view === 'admin' && (
          <AdminVault 
            products={products} 
            orders={orders} 
            users={users}
            onAdd={async (p: any) => {
              // Connect to MongoDB: POST /api/products (You'll need this route in server.js)
              const res = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
                },
                body: JSON.stringify(p)
              });
              if(res.ok) {
                const newProd = await res.json();
                setProducts([...products, { ...newProd, id: newProd._id }]);
              }
            }}
            onDelete={async (id: any) => {
              const res = await fetch(`${API_BASE}/products/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('faith_token')}` }
              });
              if(res.ok) setProducts(products.filter(p => p.id !== id));
            }}
onUpdateUser={async (id: any, data: any) => {
              try {
                const res = await fetch(`${API_BASE}/users/${id}`, { 
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
                  },
                  body: JSON.stringify(data)
                });
                if(res.ok) {
                   setUsers(users.map(u => (u.id === id || u._id === id) ? { ...u, ...data } : u));
                } else {
                   alert("Failed to update user role on server.");
                }
              } catch (e) {
                console.log(e);
              }
            }}
            onDeleteUser={async (id: any) => {
              if(!window.confirm("Are you sure you want to permanently banish this citizen?")) return;
              try {
                const res = await fetch(`${API_BASE}/users/${id}`, { 
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('faith_token')}` }
                });
                if(res.ok) {
                  setUsers(users.filter(u => u.id !== id && u._id !== id));
                } else {
                  alert("Failed to delete user on server.");
                }
              } catch (e) {
                console.log(e);
              }
            }}
            onUpdateOrder={handleOrderUpdate}
            onBulkUpdate={handleBulkUpdate}
          />
        )}
        
        {/* --- ORDER TRACKING --- */}
        {view === 'track-order' && <TrackOrderView orders={orders} currentUser={currentUser} />}
        
        {/* --- AUTHENTICATION --- */}
        {view === 'auth' && <AuthView onAuthSuccess={handleAuth} />}
        
        {/* --- CHECKOUT PROTOCOL --- */}
        {view === 'checkout' && (
          <CheckoutView 
            cart={cart} 
            currentUser={currentUser} 
            onComplete={async (o: any) => { 
              // 1. We no longer save to localStorage mock DBs here.
              // 2. Format the order for MongoDB
              const formattedOrder = {
                phoneNumber: o.phoneNumber,
                total: o.total,
                userName: currentUser.name,                 // <-- Added
                deliveryMethod: o.shippingMethod,           // <-- Renamed to match schema
                items: o.items.map((item: any) => ({
                  productId: item.id || item._id, 
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                })),
              };

              try {
                const token = localStorage.getItem("faith_token");
                const res = await fetch(`${API_BASE}/orders`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                  },
                  body: JSON.stringify(formattedOrder),
                });

                if (res.ok) {
                  const savedOrder = await res.json();
                  setOrders([savedOrder, ...orders]);
                  // Refresh products to show updated stock from DB
                  const pRes = await fetch(`${API_BASE}/products`);
                  if (pRes.ok) setProducts(await pRes.json());
                  
                  setCart([]); 
                  setView('success'); 
                } else {
                  alert("Order processing failed on server.");
                }
              } catch (e) {
                alert("Network error: Could not transmit order.");
              }
            }} 
            onAuth={() => setView('auth')} 
          />
        )}

        {/* --- SUCCESS STATE (FIXED CONTRAST) --- */}
        {view === 'success' && (
          <div className="pt-64 pb-64 text-center animate-future-in bg-white dark:bg-slate-950">
             <div className="rotating-border-container mx-auto w-40 h-40 mb-14 flex items-center justify-center relative">
                <CheckCircle2 className="w-20 h-20 text-emerald-500 relative z-10 drop-shadow-neon" />
             </div>
             <h1 className="text-8xl font-serif italic font-bold mb-8 text-rose-600">Sync Success.</h1>
             {/* Changed text-slate-400 to text-slate-900 for light mode visibility */}
             <p className="text-2xl text-slate-900 dark:text-slate-300 mb-16 font-light italic">Order protocol verified. Protocol ID Trace Active.</p>
             <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button onClick={() => setView('track-order')} className="px-12 py-6 bg-slate-900 dark:bg-rose-600 text-white rounded-[32px] font-black uppercase tracking-widest text-[11px] shadow-2xl active-scale flex items-center gap-3">
                  <Truck className="w-4 h-4" /> Trace Order Logistics
                </button>
                <button onClick={() => setView('home')} className="px-12 py-6 border-2 border-slate-900 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-[32px] font-black uppercase tracking-widest text-[11px] active-scale">
                  Return to Sanctuary
                </button>
             </div>
          </div>
        )}
        
      </main> 
      
      <Footer />

      {/* --- DRAWER & MODALS --- */}
      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          setCart={setCart} 
          onClose={() => setIsCartOpen(false)} 
          onCheckout={() => { setIsCartOpen(false); setView('checkout'); }} 
        />
      )}

      {isProfileOpen && currentUser && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setIsProfileOpen(false)}  
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem("faith_session_active");
            localStorage.removeItem("faith_token");
            setView("home");
            setIsProfileOpen(false);
          }}
          wishlistProducts={wishlistProducts} 
          onRemoveFromWishlist={toggleWishlist} 
          onAddToCart={handleAddToCart}
          onUpdateUser={async (id: any, data: any) => { 
            try {
              const res = await fetch(`${API_BASE}/users/${id}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('faith_token')}`
                },
                body: JSON.stringify(data)
              });
              if(res.ok) {
                const updatedUser = await res.json();
                const nextU = { ...currentUser, ...updatedUser, id: updatedUser._id };
                setCurrentUser(nextU);
                localStorage.setItem("faith_session_active", JSON.stringify(nextU)); 
              } else {
                alert("Failed to sync profile changes.");
              }
            } catch (e) {
              console.error(e);
            }
          }}
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
        />
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          isWishlisted={currentUser?.wishlist?.includes(selectedProduct.id)} 
          onToggleWishlist={toggleWishlist} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart} 
          onAddReview={handleAddReview} 
          currentUser={currentUser} 
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const ProfileModal = ({ user, onClose, onLogout, wishlistProducts, onRemoveFromWishlist, onAddToCart, onUpdateUser, isDarkMode, setIsDarkMode }: any) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'settings'>('profile');
  const [editData, setEditData] = useState({ 
  name: user.name, 
  email: user.email, 
  phoneNumber: user.phoneNumber || '', 
  address: user.address || '', 
  password: '' 
});

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Blurred Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Main Modal Container - Responsive Height & Border Radius */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 h-full max-h-[90vh] rounded-[32px] md:rounded-[64px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 dark:border-white/10 transition-colors">
        
        {/* GLOBAL CLOSE BUTTON - Always visible on top right */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 md:p-4 bg-white/80 hover:bg-rose-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 backdrop-blur-md rounded-full transition-all text-slate-900 dark:text-white shadow-xl active:scale-90"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* SIDEBAR - Dynamically adjusts width to stop squishing */}
        <aside className="w-full md:w-72 lg:w-96 bg-slate-900 dark:bg-slate-950 text-white p-6 md:p-8 lg:p-12 flex flex-col shrink-0 overflow-y-auto max-h-[40vh] md:max-h-full border-b md:border-b-0 md:border-r border-slate-800">
          <div className="text-center mb-6 md:mb-10 mt-4 md:mt-0">
            <div className="rotating-border-container mx-auto w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-6 p-1 relative group cursor-pointer"
              onClick={() => document.getElementById('profilePicInput').click()}>
             <input 
                  type="file" 
                  id="profilePicInput" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      alert("Uploading Identity Visual to Cloud Archive... Please wait.");
                      const url = await uploadToCloudinary(file);
                      
                      if (url) {
                        onUpdateUser(user.id || user._id, { profilePic: url });
                        alert("✅ Identity Visual Resynced Successfully.");
                      } else {
                        alert("❌ Upload failed. Check network connection.");
                      }
                    }
                  }}
              />
              
              <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden flex items-center justify-center relative shadow-neon">
                {user.profilePic ? (
                  <img src={user.profilePic} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  <div className="text-white font-black text-3xl md:text-4xl">{user.name.charAt(0)}</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-serif italic font-bold text-white">{user.name}</h3>
            <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.4em] mt-2">Verified {user.role}</p>
          </div>
          
          <nav className="space-y-2 flex-1">
             <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-6 md:px-8 py-3 md:py-4 rounded-[20px] md:rounded-[24px] font-black uppercase text-[9px] md:text-[10px] flex items-center gap-4 transition-all ${activeTab === 'profile' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Activity className="w-4 h-4" /> My Dashboard</button>
             <button onClick={() => setActiveTab('wishlist')} className={`w-full text-left px-6 md:px-8 py-3 md:py-4 rounded-[20px] md:rounded-[24px] font-black uppercase text-[9px] md:text-[10px] flex items-center gap-4 transition-all ${activeTab === 'wishlist' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Heart className="w-4 h-4" /> My Favorites</button>
             <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-6 md:px-8 py-3 md:py-4 rounded-[20px] md:rounded-[24px] font-black uppercase text-[9px] md:text-[10px] flex items-center gap-4 transition-all ${activeTab === 'settings' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Settings className="w-4 h-4" /> Sync Settings</button>
             
             <div className="h-px bg-white/10 my-4 md:my-6"></div>
             
             <div className="space-y-1">
            {/* FIXED DARK MODE TOGGLE ANIMATION */}
                <div className="flex items-center justify-between px-6 md:px-8 py-3 bg-white/5 rounded-2xl cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
                   <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-300">1. Dark Sanctuary</span>
                   <button className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isDarkMode ? 'bg-rose-600' : 'bg-slate-600'}`}>
                     <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
                <div className="px-6 md:px-8 py-3 flex items-center gap-4 text-[9px] md:text-[10px] font-black uppercase text-slate-400 cursor-default"><Crown className="w-4 h-4 text-amber-500" /> 2. Luxury Tier: {user.role === 'admin' ? 'Gold' : 'Citizen'}</div>
                
                {/* DISABLED "COMING SOON" OPTIONS */}
                <div className="px-6 md:px-8 py-3 flex items-center justify-between gap-4 text-[9px] md:text-[10px] font-black uppercase text-slate-500 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4"><Fingerprint className="w-4 h-4" /> 3. Bio-Metric Key</div>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[8px]">V2</span>
                </div>
                <div className="px-6 md:px-8 py-3 flex items-center justify-between gap-4 text-[9px] md:text-[10px] font-black uppercase text-slate-500 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4"><Languages className="w-4 h-4" /> 4. Global Dialect</div>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[8px]">V2</span>
                </div>
                <div className="px-6 md:px-8 py-3 flex items-center justify-between gap-4 text-[9px] md:text-[10px] font-black uppercase text-slate-500 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4"><Cloud className="w-4 h-4" /> 5. Cloud Archive</div>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[8px]">V2</span>
                </div>
             </div>
          </nav>

          <button onClick={onLogout} className="mt-6 py-4 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"><LogOut className="w-4 h-4" /> Disconnect</button>
        </aside>

       {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide relative">
          
          <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-slate-900 dark:text-white mb-8 md:mb-12 pr-12 mt-2 md:mt-0">
            {activeTab === 'profile' && 'Citizen Overview'}
            {activeTab === 'wishlist' && 'Luxury Favorites'}
            {activeTab === 'settings' && 'Identity Control'}
          </h2>
          
          {activeTab === 'profile' && (
            <div className="space-y-6 md:space-y-10 animate-fade-in">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 md:mb-4 tracking-widest">Faith Points</p>
                    <div className="flex items-center gap-2 md:gap-3">
                       <Gem className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />
                       <span className="text-4xl md:text-5xl font-black italic text-slate-900 dark:text-white">{user.faithPoints}</span>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 md:mb-4 tracking-widest">Favorites</p>
                    <div className="flex items-center gap-2 md:gap-3">
                       <Heart className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />
                       <span className="text-4xl md:text-5xl font-black italic text-slate-900 dark:text-white">{wishlistProducts.length}</span>
                    </div>
                  </div>
               </div>
               <div className="bg-rose-50 dark:bg-rose-900/10 p-6 md:p-12 rounded-[32px] md:rounded-[56px] border border-rose-100 dark:border-rose-900/30">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl flex items-center justify-center text-rose-600 shadow-xl border border-rose-100 dark:border-rose-900/50 shrink-0"><History className="w-8 h-8 md:w-10 md:h-10" /></div>
                    <div>
                      <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Active Since</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">{new Date(user.joinedAt).toLocaleDateString()} — Identity Verified</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

{activeTab === 'settings' && (
            <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-4">Full Name</label>
                     <input className="w-full p-4 md:p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl md:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-300 text-slate-900 dark:text-white transition-all placeholder:text-slate-400" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-4">Sync Number</label>
                     <input className="w-full p-4 md:p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl md:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-300 text-slate-900 dark:text-white transition-all placeholder:text-slate-400" placeholder="07XX XXX XXX" value={editData.phoneNumber} onChange={e => setEditData({...editData, phoneNumber: e.target.value})} />
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-4">Security Key (Password)</label>
                     <input type="password" className="w-full p-4 md:p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl md:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-300 text-slate-900 dark:text-white transition-all placeholder:text-slate-400" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-4">Profile Photo Link</label>
                     <input className="w-full p-4 md:p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl md:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-300 text-slate-900 dark:text-white transition-all placeholder:text-slate-400" placeholder="URL to Image" value={editData.profilePic} onChange={e => setEditData({...editData, profilePic: e.target.value})} />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-4">Drop-off Zone</label>
                  <input className="w-full p-4 md:p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl md:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-rose-300 text-slate-900 dark:text-white transition-all placeholder:text-slate-400" placeholder="Apartment, Street, City" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
               </div>
               <button onClick={() => { onUpdateUser(user.id || user._id, editData); alert('Identity Resynced.'); }} className="w-full py-6 md:py-8 bg-slate-900 dark:bg-rose-600 text-white rounded-3xl md:rounded-[40px] font-black uppercase tracking-widest text-[10px] md:text-[12px] shadow-2xl hover:bg-rose-700 transition-all active:scale-95 mt-6 md:mt-10">Commit Identity Changes</button>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in pb-10">
               {wishlistProducts.length === 0 ? <div className="text-center py-20 text-slate-400 italic text-xl md:text-2xl">Sanctuary is vacant.</div> : (
                 wishlistProducts.map((p: Product) => (
                   <div key={p.id} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 group bg-slate-50 dark:bg-slate-800/30 p-6 md:p-8 rounded-[32px] md:rounded-[48px] hover:bg-rose-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-transparent hover:border-rose-100">
                      <img src={p.image} className="w-full sm:w-24 h-48 sm:h-32 rounded-[24px] md:rounded-[32px] object-cover shadow-xl sm:group-hover:scale-110 transition-transform duration-700" />
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{p.name}</h4>
                        <p className="text-sm font-black italic text-rose-600 mt-2 tracking-widest">Ksh {p.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => onAddToCart(p)} className="flex-1 sm:flex-none p-4 md:p-6 bg-slate-900 dark:bg-rose-600 text-white rounded-2xl md:rounded-[24px] hover:bg-rose-700 transition-all shadow-xl active:scale-90 flex justify-center"><ShoppingBag className="w-5 h-5 md:w-6 md:h-6" /></button>
                        <button onClick={() => onRemoveFromWishlist(p.id)} className="flex-1 sm:flex-none p-4 md:p-6 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-2xl md:rounded-[24px] shadow-md transition-all active:scale-90 flex justify-center"><Trash2 className="w-5 h-5 md:w-6 md:h-6" /></button>
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

     const Footer = () => (
  <footer className="bg-slate-950 text-white pt-20 pb-10 px-6 mt-20 border-t border-white/10 relative overflow-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
      <div>
        <h2 className="text-3xl font-serif font-bold italic text-rose-600 mb-6">Faith</h2>
        <p className="text-slate-400 text-sm font-light italic">Premium Nairobi fashion for the modern visionary.</p>
      </div>
      <div>
        <h4 className="font-black uppercase tracking-widest text-[10px] mb-6">Sanctuary Links</h4>
        <div className="space-y-4 text-sm text-slate-400">
          <p className="hover:text-rose-500 cursor-pointer">Order Tracking</p>
          <p className="hover:text-rose-500 cursor-pointer">Return Policy</p>
          <p className="hover:text-rose-500 cursor-pointer">Privacy Protocol</p>
        </div>
      </div>
      <div>
        <h4 className="font-black uppercase tracking-widest text-[10px] mb-6">Socials</h4>
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-600 transition-colors"><Github className="w-4 h-4" /></a>
          <a href="http://www.youtube.com/@samskiller4" target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-600 transition-colors"><Youtube className="w-4 h-4" /></a>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col items-center justify-center">
      {/* Supercrazy SKILLER animation button */}
      <a 
        href="http://www.youtube.com/@samskiller4" 
        target="_blank"
        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all hover:scale-110 active:scale-90"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-purple-600 to-sky-600 opacity-20 group-hover:opacity-100 group-hover:animate-gradient-x transition-all duration-500"></div>
        <span className="relative z-10 text-white drop-shadow-lg flex items-center gap-2">
          Developed By SKILLER <Sparkles className="w-3 h-3 animate-pulse" />
        </span>
      </a>
    </div>
  </footer>
);

export default function App() {
  return <MainContent />;
}
