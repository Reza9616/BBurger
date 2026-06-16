// app/admin/dashboard-main/page.tsx
'use client';

import { useState, useEffect } from 'react';

// تایپ‌ها
type Product = {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
  badge: string | null;
  category: string;
  inStock: boolean;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
};

type Reservation = {
  id: number;
  name: string;
  phone: string;
  date: string;
  guests: string;
  notes: string;
  status: string;
  createdAt: string;
};

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalReservations: number;
  pendingOrders: number;
  pendingReservations: number;
  outOfStock: number;
  popularProducts: Product[];
  recentOrders: Order[];
};

export default function DashboardMain() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalReservations: 0,
    pendingOrders: 0,
    pendingReservations: 0,
    outOfStock: 0,
    popularProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchStats();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 18) return 'عصر بخیر';
    return 'شب بخیر';
  };

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, reservationsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
        fetch('/api/reservations')
      ]);
      
      const products: Product[] = await productsRes.json();
      const orders: Order[] = await ordersRes.json();
      const reservations: Reservation[] = await reservationsRes.json();
      
      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        totalProducts: products.length,
        totalReservations: reservations.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        pendingReservations: reservations.filter(r => r.status === 'pending').length,
        outOfStock: products.filter(p => !p.inStock).length,
        popularProducts: products.slice(0, 5),
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-400">بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent rounded-2xl p-6 border border-red-500/20">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {greeting} 👋
            </h1>
            <p className="text-gray-400">به پنل مدیریت بی‌برگر خوش آمدید</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">سیستم فعال</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-cart-shopping text-blue-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm">کل سفارشات</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalOrders}</p>
            <div className="mt-2 text-xs text-green-500">
              <i className="fa-solid fa-arrow-up"></i> +12% از ماه قبل
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-chart-line text-green-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm">درآمد کل</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalRevenue.toLocaleString()} تومان</p>
            <div className="mt-2 text-xs text-green-500">
              <i className="fa-solid fa-arrow-up"></i> +8% از ماه قبل
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-hamburger text-red-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm">محصولات</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalProducts}</p>
            <div className="mt-2 text-xs text-yellow-500">
              {stats.outOfStock > 0 ? `${stats.outOfStock} عدد ناموجود` : 'همه محصولات موجود'}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-calendar-check text-yellow-400 text-xl"></i>
            </div>
            <p className="text-gray-400 text-sm">رزروها</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalReservations}</p>
            <div className="mt-2 text-xs text-yellow-500">
              {stats.pendingReservations > 0 ? `${stats.pendingReservations} در انتظار` : 'همه تایید شده'}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Alerts */}
      {(stats.pendingOrders > 0 || stats.pendingReservations > 0) && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-bell text-yellow-500"></i>
            </div>
            <div className="flex-1">
              <p className="font-bold">⚠️ موارد نیاز به توجه</p>
              <div className="flex gap-4 mt-1 text-sm">
                {stats.pendingOrders > 0 && <span className="text-yellow-500">{stats.pendingOrders} سفارش در انتظار پردازش</span>}
                {stats.pendingReservations > 0 && <span className="text-blue-500 mr-3">{stats.pendingReservations} رزرو در انتظار تایید</span>}
              </div>
            </div>
            <a href="/admin/orders" className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-all">
              مشاهده همه
            </a>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <i className="fa-solid fa-clock text-blue-400"></i>
              آخرین سفارشات
            </h2>
            <a href="/admin/orders" className="text-sm text-red-400 hover:text-red-300 transition-colors">
              مشاهده همه <i className="fa-solid fa-arrow-left mr-1"></i>
            </a>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">هیچ سفارشی ثبت نشده</p>
            ) : (
              stats.recentOrders.map((order, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-sm">{order.total.toLocaleString()} تومان</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.status === 'pending' ? 'در انتظار' : 
                       order.status === 'delivered' ? 'تحویل شده' : 
                       order.status === 'preparing' ? 'در حال آماده‌سازی' : 'آماده تحویل'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <i className="fa-solid fa-fire text-red-400"></i>
              محصولات پرفروش
            </h2>
            <a href="/admin/products" className="text-sm text-red-400 hover:text-red-300 transition-colors">
              مدیریت محصولات <i className="fa-solid fa-arrow-left mr-1"></i>
            </a>
          </div>
          <div className="space-y-3">
            {stats.popularProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">هیچ محصولی وجود ندارد</p>
            ) : (
              stats.popularProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-gray-500 text-xs">
                      {product.category === 'burgers' ? '🍔 برگر' : 
                       product.category === 'sides' ? '🍟 پیش‌غذا' : '🥤 نوشیدنی'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 text-sm font-bold">{product.price.toLocaleString()} تومان</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bolt text-yellow-400"></i>
          دسترسی سریع
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/admin/products/new" className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-red-500/10 transition-all group">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-all">
              <i className="fa-solid fa-plus text-red-400"></i>
            </div>
            <div>
              <p className="font-medium text-sm">محصول جدید</p>
              <p className="text-gray-500 text-xs">افزودن محصول</p>
            </div>
          </a>
          <a href="/admin/orders" className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-red-500/10 transition-all group">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
              <i className="fa-solid fa-truck text-blue-400"></i>
            </div>
            <div>
              <p className="font-medium text-sm">سفارشات</p>
              <p className="text-gray-500 text-xs">مدیریت سفارشات</p>
            </div>
          </a>
          <a href="/admin/reservations" className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-red-500/10 transition-all group">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all">
              <i className="fa-solid fa-calendar text-green-400"></i>
            </div>
            <div>
              <p className="font-medium text-sm">رزرو میز</p>
              <p className="text-gray-500 text-xs">مدیریت رزروها</p>
            </div>
          </a>
          <a href="/admin/reports" className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-red-500/10 transition-all group">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
              <i className="fa-solid fa-chart-pie text-purple-400"></i>
            </div>
            <div>
              <p className="font-medium text-sm">گزارشات</p>
              <p className="text-gray-500 text-xs">مشاهده آمار</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="text-center text-gray-500 text-xs py-4 border-t border-gray-800">
        <p>آخرین بروزرسانی: {new Date().toLocaleString('fa-IR')}</p>
      </div>
    </div>
  );
}