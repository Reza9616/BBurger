// app/components/MenuSection.tsx
'use client';

import { useState, useEffect } from 'react';
import CartSidebar from './CartSidebar';
import { 
  ShoppingBag, 
  ChevronLeft, 
  Star, 
  Flame, 
  Crown,
  TrendingUp,
  Coffee,
  Sandwich,
  Plus,
  Minus,
  X,
  MapPin,
  Clock,
  Phone,
  CheckCircle
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
  badge: string | null;
  badgeIcon: string | null;
  category: string;
  inStock: boolean;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const getBadgeStyle = (badge: string | null) => {
  switch(badge) {
    case 'HOT':
      return { icon: Flame, text: 'HOT', color: '#FF003C', bg: 'linear-gradient(135deg, #FF003C, #cc0030)' };
    case 'NEW':
      return { icon: Star, text: 'NEW', color: '#22c55e', bg: 'linear-gradient(135deg, #22c55e, #16a34a)' };
    case 'VIP':
      return { icon: Crown, text: 'VIP', color: '#eab308', bg: 'linear-gradient(135deg, #eab308, #ca8a04)' };
    case 'REC':
      return { icon: TrendingUp, text: 'REC', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' };
    default:
      return { icon: Flame, text: badge || '', color: '#FF003C', bg: 'linear-gradient(135deg, #FF003C, #cc0030)' };
  }
};

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [visibleItems, setVisibleItems] = useState(6);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const categories = [
    { id: 'burgers', name: 'برگرها', icon: Sandwich, color: '#FF003C', count: 0 },
    { id: 'sides', name: 'پیش‌غذا', icon: Coffee, color: '#fbbf24', count: 0 },
    { id: 'drinks', name: 'نوشیدنی', icon: Coffee, color: '#3b82f6', count: 0 }
  ];

  useEffect(() => {
    fetchProducts();
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      const productsWithNumberPrice = data.map((p: any) => ({
        ...p,
        price: Number(p.price)
      }));
      setProducts(productsWithNumberPrice);
      
      // Update category counts
      categories.forEach(cat => {
        cat.count = productsWithNumberPrice.filter((p: Product) => p.category === cat.id && p.inStock).length;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart: CartItem[] = JSON.parse(savedCart);
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  const openQuantityModal = (product: Product) => {
    if (!product.inStock) {
      showToast('این محصول موجود نیست!', 'error');
      return;
    }
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setShowQuantityModal(true);
  };

  const addToCartWithQuantity = () => {
    if (!selectedProduct) return;
    
    const savedCart = localStorage.getItem('cart');
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find(item => item.id === selectedProduct.id);
    
    if (existingItem) {
      existingItem.quantity += selectedQuantity;
    } else {
      cart.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: selectedQuantity,
        image: selectedProduct.image
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    setShowQuantityModal(false);
    showToast(`${selectedQuantity} عدد ${selectedProduct.name} اضافه شد`, 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-24 left-4 right-4 text-center px-4 py-3 rounded-xl shadow-lg z-50 animate-fadeIn ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white text-sm font-medium`;
    toast.innerHTML = `${type === 'success' ? '✓' : '✗'} ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const handleCheckout = async (formData: {
    customerName: string;
    customerPhone: string;
    address: string;
  }) => {
    setCheckoutLoading(true);
    
    const savedCart = localStorage.getItem('cart');
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    
    if (cart.length === 0) {
      alert('سبد خرید خالی است');
      setCheckoutLoading(false);
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          address: formData.address,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: total
        }),
      });
      
      if (res.ok) {
        localStorage.removeItem('cart');
        updateCartCount();
        setShowCheckoutModal(false);
        setIsCartOpen(false);
        showToast('سفارش شما ثبت شد!', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        alert('خطا در ثبت سفارش');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const currentItems = products.filter(p => p.category === activeCategory && p.inStock);
  const displayedItems = currentItems.slice(0, visibleItems);
  const hasMore = visibleItems < currentItems.length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF003C]"></div>
          <p className="text-gray-400 mt-4 text-sm font-mono">LOADING MENU...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section id="menu" className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-[#FF003C]/30 px-4 py-1.5 rounded-full mb-4">
              <span className="text-[#FF003C] text-xs font-mono tracking-wider">★ MENU ★</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              منوی <span className="text-[#FF003C]">اختصاصی</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              تجربه‌ای متفاوت از طعم با بهترین مواد اولیه و دستور پخت‌های ویژه
            </p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#FF003C] to-transparent mx-auto mt-6"></div>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setVisibleItems(6);
                  }}
                  className={`group relative px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? cat.color : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-75">({cat.count})</span>
                </button>
              );
            })}
          </div>

          {/* Menu Grid */}
          {currentItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-50">🍽️</div>
              <p className="text-gray-400">محصولی در این دسته یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayedItems.map((item, index) => {
                const badgeStyle = item.badge ? getBadgeStyle(item.badge) : null;
                const Icon = badgeStyle?.icon || Flame;
                const isHovered = hoveredCard === item.id;
                
                return (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-gray-700 transition-all duration-500 hover:border-[#FF003C]/50 hover:shadow-2xl hover:shadow-[#FF003C]/10"
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Image Container */}
                    <div className="relative h-56 md:h-64 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          isHovered ? 'scale-110' : 'scale-100'
                        }`}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                      
                      {/* Badge */}
                      {item.badge && badgeStyle && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-sm border border-[#FF003C]/50">
                            <Icon className="w-3 h-3 text-[#FF003C]" />
                            <span className="text-[10px] font-bold text-white tracking-wider">{badgeStyle.text}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Price Tag */}
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-baseline gap-1 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <span className="text-[#FF003C] font-bold text-lg">{item.price.toLocaleString()}</span>
                          <span className="text-gray-400 text-xs">تومان</span>
                        </div>
                      </div>
                      
                      {/* Out of Stock Overlay */}
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold px-4 py-2 rounded-full bg-red-600/90 text-sm">
                            ناموجود
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF003C] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                      
                      {/* Order Button */}
                      <button
                        onClick={() => openQuantityModal(item)}
                        disabled={!item.inStock}
                        className={`mt-5 w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                          item.inStock
                            ? 'bg-gradient-to-r from-[#FF003C] to-red-700 hover:shadow-lg hover:shadow-[#FF003C]/30 hover:scale-[1.02] text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{item.inStock ? 'سفارش' : 'ناموجود'}</span>
                      </button>
                    </div>
                    
                    {/* Hover Effect Border */}
                    <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`} style={{
                      boxShadow: 'inset 0 0 0 2px rgba(255,0,60,0.3)'
                    }} />
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Load More Button */}
          {(hasMore || visibleItems > 6) && (
            <div className="text-center mt-12">
              {hasMore && (
                <button
                  onClick={() => setVisibleItems(prev => prev + 6)}
                  className="group px-8 py-3 rounded-full border border-[#FF003C]/30 hover:border-[#FF003C] text-white font-medium transition-all duration-300 hover:bg-[#FF003C]/10 inline-flex items-center gap-2"
                >
                  <span>مشاهده بیشتر</span>
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#FF003C] to-red-700 hover:shadow-lg hover:shadow-[#FF003C]/30 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <ShoppingBag className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setShowCheckoutModal(true);
        }}
      />

      {/* Quantity Modal */}
      {showQuantityModal && selectedProduct && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setShowQuantityModal(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl shadow-2xl z-50 p-6 animate-slideUp border-t border-[#FF003C]/30">
            <div className="flex items-center gap-4 mb-5">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-20 h-20 rounded-xl object-cover border border-[#FF003C]/50"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-[#FF003C] font-bold">{selectedProduct.price.toLocaleString()} تومان</p>
              </div>
              <button onClick={() => setShowQuantityModal(false)} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 text-center">تعداد</label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center active:bg-[#FF003C] transition-all"
                >
                  <Minus className="w-5 h-5 text-white" />
                </button>
                <div className="w-20 text-center">
                  <input
                    type="number"
                    value={selectedQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) {
                        setSelectedQuantity(val);
                      }
                    }}
                    className="w-full text-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-xl font-bold"
                    min="1"
                  />
                </div>
                <button
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center active:bg-green-500 transition-all"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <button
              onClick={addToCartWithQuantity}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF003C] to-red-700 text-white font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#FF003C]/30"
            >
              اضافه به سبد خرید • {(selectedQuantity * selectedProduct.price).toLocaleString()} تومان
            </button>
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={() => setShowCheckoutModal(false)}
          onSubmit={handleCheckout}
          loading={checkoutLoading}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </>
  );
}

// Checkout Modal Component
function CheckoutModal({ onClose, onSubmit, loading }: any) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto animate-slideUp border-t border-[#FF003C]/30">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-800 active:bg-gray-700 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">تکمیل سفارش</h2>
              <p className="text-xs text-gray-500">اطلاعات خود را وارد کنید</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">نام و نام خانوادگی *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF003C] transition-all"
              placeholder="علی احمدی"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">شماره تماس *</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF003C] transition-all"
              placeholder="0912XXX XXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">آدرس تحویل *</label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF003C] transition-all resize-none"
              placeholder="استان، شهر، خیابان، پلاک..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-gray-600 text-gray-400 font-medium active:bg-gray-800 transition-all"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#FF003C] to-red-700 text-white font-bold transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ثبت سفارش
                </span>
              ) : (
                '✓ ثبت سفارش'
              )}
            </button>
          </div>
        </form>
        
        <div className="border-t border-gray-800 p-4 text-center">
          <p className="text-xs text-gray-500">پس از ثبت سفارش، همکاران ما با شما تماس خواهند گرفت</p>
        </div>
      </div>
    </>
  );
}