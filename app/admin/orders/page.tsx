// app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import InvoiceModal from '../../components/InvoiceModal';

type Order = {
  id: string;
  customerId: number;
  customerName: string;
  customerFullName: string;
  customerPhone: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  order_status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryTime: string;
  note: string;
  createdAt: string;
  loyaltyPoints: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    copies: 1,
    includeHeader: true,
    includeFooter: true
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, order_status: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, order_status })
    });
    if (res.ok) await fetchOrders();
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, payment_status: paymentStatus })
    });
    if (res.ok) await fetchOrders();
  };

  const openInvoice = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const printInvoice = (order: Order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      setShowPrintSettings(true);
    }, 100);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerPhone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
  const preparingOrders = orders.filter(o => o.order_status === 'preparing').length;
  const readyOrders = orders.filter(o => o.order_status === 'ready').length;
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.order_status === 'cancelled').length;

  const statusColors: Record<string, string> = {
    pending: '#fbbf24',
    preparing: '#3b82f6',
    ready: '#22c55e',
    delivered: '#6b7280',
    cancelled: '#ef4444'
  };

  const statusBgColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    preparing: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    ready: 'bg-green-500/20 border-green-500/30 text-green-400',
    delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    cancelled: 'bg-red-500/20 border-red-500/30 text-red-400'
  };

  const statusPersian: Record<string, string> = {
    pending: 'در انتظار',
    preparing: 'در حال آماده‌سازی',
    ready: 'آماده تحویل',
    delivered: 'تحویل شده',
    cancelled: 'لغو شده'
  };

  const statusIcons: Record<string, string> = {
    pending: 'fa-clock',
    preparing: 'fa-utensils',
    ready: 'fa-check-circle',
    delivered: 'fa-truck',
    cancelled: 'fa-ban'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-truck text-red-500 text-xl animate-pulse"></i>
            </div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          📦 مدیریت سفارشات
        </h1>
        <p className="text-gray-400 text-sm mt-1">مدیریت، پیگیری و به‌روزرسانی وضعیت سفارشات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-xs">کل سفارشات</p>
            <p className="text-2xl font-bold text-blue-400">{orders.length}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-xs">در انتظار</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingOrders}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-xs">در حال آماده‌سازی</p>
            <p className="text-2xl font-bold text-blue-400">{preparingOrders}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-xs">آماده تحویل</p>
            <p className="text-2xl font-bold text-green-400">{readyOrders}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-gray-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-xs">تحویل شده</p>
            <p className="text-2xl font-bold text-gray-400">{deliveredOrders}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700 hover:border-red-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <p className="text-gray-400 text-xs">کل فروش</p>
            <p className="text-lg font-bold text-red-400">{totalRevenue.toLocaleString()} تومان</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            placeholder="جستجوی سفارش بر اساس کد، نام مشتری یا شماره تماس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        <button 
          onClick={() => setFilterStatus('all')} 
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            filterStatus === 'all' 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-list ml-2"></i>
          همه
        </button>
        <button 
          onClick={() => setFilterStatus('pending')} 
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            filterStatus === 'pending' 
              ? 'bg-yellow-500 text-white shadow-lg' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-clock ml-2"></i>
          در انتظار
        </button>
        <button 
          onClick={() => setFilterStatus('preparing')} 
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            filterStatus === 'preparing' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-utensils ml-2"></i>
          در حال آماده‌سازی
        </button>
        <button 
          onClick={() => setFilterStatus('ready')} 
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            filterStatus === 'ready' 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-check-circle ml-2"></i>
          آماده تحویل
        </button>
        <button 
          onClick={() => setFilterStatus('delivered')} 
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            filterStatus === 'delivered' 
              ? 'bg-gray-500 text-white shadow-lg' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-truck ml-2"></i>
          تحویل شده
        </button>
        <button 
          onClick={() => setFilterStatus('cancelled')} 
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            filterStatus === 'cancelled' 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-ban ml-2"></i>
          لغو شده
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
          <i className="fa-solid fa-inbox text-gray-600 text-5xl mb-4"></i>
          <p className="text-gray-500">سفارشی یافت نشد</p>
          {searchTerm && <p className="text-gray-600 text-sm mt-2">جستجوی خود را تغییر دهید</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div 
              key={order.id} 
              className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative p-5">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-mono text-lg font-bold text-white">
                        #{order.id}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${statusBgColors[order.order_status]}`}>
                        <i className={`fa-solid ${statusIcons[order.order_status]} ml-1`}></i>
                        {statusPersian[order.order_status]}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                          : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                      }`}>
                        <i className={`fa-solid ${order.paymentStatus === 'paid' ? 'fa-check' : 'fa-hourglass-half'} ml-1`}></i>
                        {order.paymentStatus === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <i className="fa-solid fa-user text-gray-500 w-5"></i>
                        {order.customerFullName || order.customerName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <i className="fa-solid fa-phone text-gray-500 w-5"></i>
                        {order.customerPhone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <i className="fa-solid fa-location-dot text-gray-500 w-5"></i>
                        {order.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <i className="fa-regular fa-clock text-gray-500 w-5"></i>
                        {new Date(order.createdAt).toLocaleString('fa-IR')}
                      </div>
                    </div>
                    
                    {order.note && (
                      <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <p className="text-yellow-400 text-sm flex items-center gap-2">
                          <i className="fa-solid fa-pen"></i>
                          یادداشت: {order.note}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <p className="text-red-500 font-bold text-2xl">{order.total.toLocaleString()} تومان</p>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1 justify-end">
                      <i className="fa-solid fa-credit-card"></i>
                      {order.paymentMethod === 'cash' ? 'پرداخت نقدی' : 'کارت به کارت'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-receipt text-red-400"></i>
                    آیتم‌های سفارش
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-xs bg-gray-700/50 px-3 py-1.5 rounded-full hover:bg-gray-700 transition">
                        {item.quantity}× {item.name}
                        <span className="text-gray-400 mr-1">({item.price.toLocaleString()} تومان)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-700">
                  <select 
                    value={order.order_status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)} 
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-700 transition cursor-pointer focus:outline-none focus:border-red-500"
                  >
                    <option value="pending">🕐 در انتظار</option>
                    <option value="preparing">🍳 در حال آماده‌سازی</option>
                    <option value="ready">✅ آماده تحویل</option>
                    <option value="delivered">🚚 تحویل شده</option>
                    <option value="cancelled">❌ لغو شده</option>
                  </select>
                  
                  <select 
                    value={order.paymentStatus} 
                    onChange={(e) => updatePaymentStatus(order.id, e.target.value)} 
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-700 transition cursor-pointer focus:outline-none focus:border-red-500"
                  >
                    <option value="unpaid">⏳ پرداخت نشده</option>
                    <option value="paid">✅ پرداخت شده</option>
                  </select>
                  
                  <button 
                    onClick={() => openInvoice(order)}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 border border-green-500/30"
                  >
                    <i className="fa-solid fa-receipt"></i>
                    مشاهده فاکتور
                  </button>
                  
                  <button 
                    onClick={() => printInvoice(order)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 border border-blue-500/30"
                  >
                    <i className="fa-solid fa-print"></i>
                    پرینت فاکتور
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          onClose={() => {
            setShowInvoice(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Print Settings Modal */}
      {showPrintSettings && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn" onClick={() => setShowPrintSettings(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl z-50 animate-slideUp">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-print text-blue-400 text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold">تنظیمات پرینت</h2>
                  <p className="text-sm text-gray-400">تنظیمات چاپ فاکتور را انتخاب کنید</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">تعداد نسخ</label>
                  <select 
                    value={printSettings.copies} 
                    onChange={(e) => setPrintSettings({...printSettings, copies: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  >
                    <option value={1}>1 نسخه</option>
                    <option value={2}>2 نسخه</option>
                    <option value={3}>3 نسخه</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="includeHeader" 
                      checked={printSettings.includeHeader}
                      onChange={(e) => setPrintSettings({...printSettings, includeHeader: e.target.checked})}
                      className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-300">نمایش هدر فاکتور</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="includeFooter" 
                      checked={printSettings.includeFooter}
                      onChange={(e) => setPrintSettings({...printSettings, includeFooter: e.target.checked})}
                      className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-300">نمایش فوتر فاکتور</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPrintSettings(false);
                    setShowInvoice(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  ادامه به پرینت
                </button>
                <button
                  onClick={() => setShowPrintSettings(false)}
                  className="flex-1 bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}