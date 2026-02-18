import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silk Aurora Gown',
    price: 34500,
    category: 'Women',
    description: 'A fluid silk masterpiece that captures the light of a Nairobi sunrise.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
    rating: 4.9,
    reviewsCount: 240,
    isHot: true,
    stock: 12,
    reviews: []
  },
  {
    id: '2',
    name: 'Midnight Velvet Blazer',
    price: 28900,
    category: 'Men',
    description: 'Double-breasted excellence crafted from premium obsidian velvet.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800',
    rating: 4.8,
    reviewsCount: 156,
    isHot: true,
    stock: 7,
    reviews: []
  },
  {
    id: '3',
    name: 'Cyber-Gold Link Bracelet',
    price: 15400,
    category: 'Accessories',
    description: '18k gold interlocking links designed for the modern architect of life.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800',
    rating: 5.0,
    reviewsCount: 89,
    stock: 45,
    reviews: []
  },
  {
    id: '4',
    name: 'Aero-Linen Dress',
    price: 22000,
    category: 'Women',
    description: 'Breathable structured linen that defies the tropical heat.',
    image: 'https://images.unsplash.com/photo-1572804013307-f9a8a97ee04b?q=80&w=800',
    rating: 4.7,
    reviewsCount: 312,
    stock: 20,
    reviews: []
  },
  {
    id: '5',
    name: 'Titanium Leather Duffel',
    price: 48000,
    category: 'Accessories',
    description: 'Indestructible full-grain leather for the global traveler.',
    image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800',
    rating: 4.9,
    reviewsCount: 67,
    isHot: true,
    stock: 4,
    reviews: []
  },
  {
    id: '6',
    name: 'Prism-Tech Sneaker',
    price: 19500,
    category: 'Men',
    description: 'Reflective structural design with reactive cushioning technology.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
    rating: 4.6,
    reviewsCount: 42,
    stock: 15,
    reviews: []
  },
  {
    id: '7',
    name: 'Nebula Silk Scarf',
    price: 8500,
    category: 'Accessories',
    description: 'Hand-dyed ethereal patterns on pure Mulberry silk.',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800',
    rating: 4.9,
    reviewsCount: 110,
    stock: 30,
    reviews: []
  },
  {
    id: '8',
    name: 'Elysian Quartz Watch',
    price: 62000,
    category: 'Accessories',
    description: 'Precision engineering meets divine aesthetic in this limited quartz timepiece.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800',
    rating: 5.0,
    reviewsCount: 12,
    isHot: true,
    stock: 3,
    reviews: []
  },
  {
    id: '9',
    name: 'Solaris Summer Hat',
    price: 7500,
    category: 'Hot Deals',
    description: 'Hand-woven wide-brim hat with UV-shielding fibers.',
    image: 'https://images.unsplash.com/photo-1521316730702-829ad88e7ff7?q=80&w=800',
    rating: 4.5,
    reviewsCount: 95,
    stock: 50,
    reviews: []
  }
];

export const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard (Nairobi)', price: 0, days: '24–48 hours' },
  { id: 'priority', name: 'Priority Express', price: 500, days: '3–5 hours' },
  { id: 'instant', name: 'Boutique Drop (Instant)', price: 1200, days: 'Under 1 hour' }
];