// app/components/CartSidebar.tsx
'use client';

import { useState, useEffect } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onCartUpdate?: () => void;
};

export default function CartSidebar({ isOpen, onClose, onCheckout, onCartUpdate }: CartSidebarProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (onCartUpdate) onCartUpdate();
    
    // dispatch event for navbar update
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    updateCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const clearCart = () => {
    if (confirm('آیا از حذف همه آیتم‌ها از سبد خرید مطمئن هستید؟')) {
      updateCart([]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">🛒 سبد خرید</h2>
            <p className="text-xs text-gray-400">{getTotalItems()} آیتم - {cart.length} نوع محصول</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <i className="fa-solid fa-times text-white"></i>
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400">سبد خرید شما خالی است</p>
              <button
                onClick={onClose}
                className="mt-4 text-red-500 hover:text-red-400 transition-colors"
              >
                مشاهده منو
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-800/50 rounded-xl p-3 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">{item.name}</h3>
                    <p className="text-gray-400 text-xs mt-1">{item.price.toLocaleString()} تومان</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 bg-gray-700 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <i className="fa-solid fa-minus text-white text-xs"></i>
                        </button>
                        <span className="text-white text-sm w-8 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-500 transition-colors"
                        >
                          <i className="fa-solid fa-plus text-white text-xs"></i>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-red-500 font-bold text-sm">
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">تومان</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">تعداد کل:</span>
                <span className="text-white font-bold">{getTotalItems()} عدد</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">مجموع:</span>
                <span className="text-2xl font-bold text-red-500">
                  {getTotalPrice().toLocaleString()} تومان
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500 transition-all"
                >
                  🗑️ خالی کردن
                </button>
                <button
                  onClick={onCheckout}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all transform hover:scale-[1.02]"
                >
                  🚀 ثبت سفارش
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}