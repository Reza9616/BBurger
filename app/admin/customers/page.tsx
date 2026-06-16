// app/admin/customers/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Customer = {
  id: number;
  customer_code: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  registered_date: string;
  notes: string;
  customer_status: string;
  loyalty_points: number;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[] | string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    avgSpent: 0
  });

  // تابع کمکی برای درخواست با مدیریت خودکار خطای 401
  const fetchWithAuth = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (res.status === 401) {
      router.push('/login');
      throw new Error('Unauthorized');
    }
    return res;
  }, [router]);

  const fetchCustomers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchWithAuth('/api/crm');
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const customersArray = Array.isArray(data) ? data : (data.customers || data.data || []);
      
      setCustomers(customersArray);
      
      const activeCount = customersArray.filter((c: Customer) => c.customer_status === 'active').length;
      const totalRev = customersArray.reduce((sum: number, c: Customer) => sum + (c.total_spent || 0), 0);
      
      setStats({
        totalCustomers: customersArray.length,
        activeCustomers: activeCount,
        totalRevenue: totalRev,
        avgSpent: customersArray.length ? Math.floor(totalRev / customersArray.length) : 0
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (error instanceof Error && error.message !== 'Unauthorized') {
        setError('خطا در دریافت اطلاعات مشتریان');
      }
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const fetchCustomerDetails = async (id: number) => {
    setLoadingOrders(true);
    try {
      // دریافت اطلاعات مشتری
      const customerRes = await fetchWithAuth(`/api/crm?type=customer&id=${id}`);
      const customerData = await customerRes.json();
      setSelectedCustomer(customerData.customer || customerData);
      
      // دریافت تاریخچه سفارشات
      const ordersRes = await fetchWithAuth(`/api/admin/orders?customer_id=${id}`);
      const ordersData = await ordersRes.json();
      
      // پردازش آیتم‌های سفارش
      const processedOrders = (Array.isArray(ordersData) ? ordersData : (ordersData.orders || ordersData.data || [])).map((order: any) => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
      }));
      
      setCustomerOrders(processedOrders);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      if (!(error instanceof Error && error.message === 'Unauthorized')) {
        setError('خطا در دریافت جزئیات مشتری');
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, string> = {
      active: 'bg-gradient-to-r from-green-500 to-green-600',
      inactive: 'bg-gradient-to-r from-gray-500 to-gray-600',
      vip: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    };
    return statuses[status] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'فعال',
      inactive: 'غیرفعال',
      vip: 'VIP',
    };
    return texts[status] || 'نامشخص';
  };

  const getOrderStatusBadge = (status: string) => {
    const statuses: Record<string, string> = {
      delivered: 'bg-gradient-to-r from-green-500 to-green-600',
      cancelled: 'bg-gradient-to-r from-red-500 to-red-600',
      pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      preparing: 'bg-gradient-to-r from-blue-500 to-blue-600',
      ready: 'bg-gradient-to-r from-purple-500 to-purple-600',
    };
    return statuses[status] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getOrderStatusText = (status: string) => {
    const texts: Record<string, string> = {
      delivered: 'تحویل شده',
      cancelled: 'لغو شده',
      pending: 'در انتظار',
      preparing: 'در حال آماده‌سازی',
      ready: 'آماده تحویل',
    };
    return texts[status] || 'نامشخص';
  };

  const getOrderItems = (order: Order): OrderItem[] => {
    if (typeof order.items === 'string') {
      try {
        return JSON.parse(order.items);
      } catch {
        return [];
      }
    }
    return order.items || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-users text-red-500 text-xl animate-pulse"></i>
            </div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">در حال بارگذاری اطلاعات مشتریان...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-500/10 rounded-2xl p-8 border border-red-500/20">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchCustomers}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold shadow-lg"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            👥 مدیریت مشتریان
          </h1>
          <p className="text-gray-400 text-sm mt-1">مدیریت اطلاعات، تاریخچه و آمار مشتریان</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"></i>
            <input
              type="text"
              placeholder="جستجو بر اساس نام، شماره یا کد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pr-10 pl-4 text-sm w-64 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>
          <button className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            مشتری جدید
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">کل مشتریان</p>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-users text-blue-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.totalCustomers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">تعداد کل مشتریان ثبت شده</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">مشتریان فعال</p>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-user-check text-green-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.activeCustomers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">مشتریان با وضعیت فعال</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-red-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">کل فروش</p>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-red-400 text-xl"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.totalRevenue.toLocaleString()} تومان</p>
            <p className="text-xs text-gray-500 mt-2">مجموع فروش از همه مشتریان</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">میانگین خرید</p>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-chart-simple text-yellow-400 text-xl"></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgSpent.toLocaleString()} تومان</p>
            <p className="text-xs text-gray-500 mt-2">میانگین خرید هر مشتری</p>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
          <p className="text-blue-400 text-sm">
            <i className="fa-solid fa-search ml-2"></i>
            {filteredCustomers.length} نتیجه برای "{searchTerm}" یافت شد
          </p>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl overflow-hidden border border-gray-700/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/70">
              <tr>
                <th className="text-right p-4 text-sm font-bold text-gray-300">کد مشتری</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">نام و نام خانوادگی</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">شماره تماس</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">تعداد سفارش</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">کل خرید</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">امتیاز</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">وضعیت</th>
                <th className="text-right p-4 text-sm font-bold text-gray-300">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="text-center">
                      <i className="fa-solid fa-users-slash text-gray-600 text-5xl mb-4"></i>
                      <p className="text-gray-500">مشتری‌ای یافت نشد</p>
                      {searchTerm && <p className="text-gray-600 text-sm mt-2">جستجوی خود را تغییر دهید</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-800/30 transition-all duration-200 group">
                    <td className="p-4 text-sm font-mono text-gray-300">{customer.customer_code}</td>
                    <td className="p-4 text-sm font-medium text-gray-200">{customer.full_name || '-'}</td>
                    <td className="p-4 text-sm">
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-phone text-gray-500 text-xs"></i>
                        {customer.phone}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-blue-400 font-bold">{customer.total_orders || 0}</span>
                      <span className="text-gray-500 text-xs mr-1">سفارش</span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-red-400 font-bold">{(customer.total_spent || 0).toLocaleString()}</span>
                      <span className="text-gray-500 text-xs mr-1">تومان</span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-star text-yellow-500 text-xs"></i>
                        <span className="text-yellow-500 font-bold">{customer.loyalty_points || 0}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${getStatusBadge(customer.customer_status)}`}>
                        {getStatusText(customer.customer_status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => fetchCustomerDetails(customer.id)}
                        className="text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center gap-2 hover:gap-3 group"
                      >
                        <i className="fa-solid fa-eye"></i>
                        <span className="text-sm">جزئیات</span>
                        <i className="fa-solid fa-chevron-left text-xs opacity-0 group-hover:opacity-100 transition-all duration-200"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn" onClick={() => setShowModal(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <i className="fa-solid fa-user text-blue-400"></i>
                  {selectedCustomer.full_name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  <i className="fa-solid fa-barcode ml-1"></i>
                  {selectedCustomer.customer_code}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white text-3xl transition-all duration-200 hover:rotate-90"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">📞 شماره تماس</p>
                  <p className="text-lg font-bold text-gray-200">{selectedCustomer.phone}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">✉️ ایمیل</p>
                  <p className="text-lg font-bold text-gray-200">{selectedCustomer.email || '—'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 md:col-span-2">
                  <p className="text-gray-400 text-sm mb-1">📍 آدرس</p>
                  <p className="text-sm text-gray-300">{selectedCustomer.address || '—'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">📅 تاریخ ثبت نام</p>
                  <p className="text-sm text-gray-300">{new Date(selectedCustomer.registered_date).toLocaleDateString('fa-IR')}</p>
                </div>
                {selectedCustomer.notes && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">📝 یادداشت</p>
                    <p className="text-sm text-gray-300">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 text-center border border-blue-500/20">
                  <p className="text-gray-400 text-sm mb-2">تعداد سفارشات</p>
                  <p className="text-3xl font-bold text-blue-400">{selectedCustomer.total_orders || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-5 text-center border border-red-500/20">
                  <p className="text-gray-400 text-sm mb-2">کل خرید</p>
                  <p className="text-2xl font-bold text-red-400">{(selectedCustomer.total_spent || 0).toLocaleString()} تومان</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-5 text-center border border-yellow-500/20">
                  <p className="text-gray-400 text-sm mb-2">امتیاز وفاداری</p>
                  <p className="text-3xl font-bold text-yellow-400">{selectedCustomer.loyalty_points || 0}</p>
                </div>
              </div>

              {/* Orders History */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-blue-400"></i>
                  تاریخچه سفارشات
                  {loadingOrders ? (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                  ) : (
                    <span className="text-sm text-gray-400">({customerOrders.length} سفارش)</span>
                  )}
                </h3>
                <div className="space-y-3">
                  {loadingOrders ? (
                    <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
                      <p className="text-gray-500 mt-3">در حال بارگذاری سفارشات...</p>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                      <i className="fa-solid fa-receipt text-gray-600 text-5xl mb-3"></i>
                      <p className="text-gray-500">هیچ سفارشی برای این مشتری ثبت نشده است</p>
                    </div>
                  ) : (
                    customerOrders.map((order) => {
                      const orderItems = getOrderItems(order);
                      return (
                        <div key={order.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                          <div className="flex flex-wrap justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-bold text-gray-300">#{order.id}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderStatusBadge(order.order_status)}`}>
                                  {getOrderStatusText(order.order_status)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.payment_status === 'paid' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'}`}>
                                  {order.payment_status === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                <i className="fa-regular fa-calendar ml-1"></i>
                                {new Date(order.created_at).toLocaleString('fa-IR')}
                              </p>
                            </div>
                            <div className="text-left">
                              <p className="text-red-400 font-bold text-xl">{order.total.toLocaleString()}</p>
                              <p className="text-gray-500 text-xs">تومان</p>
                            </div>
                          </div>
                          {orderItems.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <p className="text-xs text-gray-400 mb-2">آیتم‌ها:</p>
                              <div className="flex flex-wrap gap-2">
                                {orderItems.map((item, idx) => (
                                  <span key={idx} className="text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                                    {item.quantity}× {item.name}
                                    <span className="text-gray-400 mr-1">({item.price.toLocaleString()} تومان)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}