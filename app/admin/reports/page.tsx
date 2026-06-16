// app/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

type StatsType = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  growthRate: number;
};

type SalesDataType = {
  name: string;
  فروش: number;
  تعداد: number;
  day?: number;
  month?: number;
};

type TopProductType = {
  name: string;
  quantity: number;
  revenue: number;
};

type CategoryStatType = {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
};

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsType>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    growthRate: 0
  });
  const [salesData, setSalesData] = useState<SalesDataType[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductType[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/sales-data?period=${selectedPeriod}`),
        fetch('/api/admin/top-products'),
        fetch('/api/admin/category-stats')
      ]);

      const statsData = await statsRes.json();
      const salesData = await salesRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setStats(statsData);
      setSalesData(salesData);
      setTopProducts(productsData);
      setCategoryStats(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return `${value.toLocaleString()} تومان`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {selectedChart === 'revenue' ? (
            <p className="text-red-400 font-bold">
              فروش: {formatPrice(payload[0].value)}
            </p>
          ) : (
            <p className="text-blue-400 font-bold">
              تعداد سفارشات: {payload[0].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-red-500 text-xl animate-pulse"></i>
            </div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">در حال بارگذاری گزارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          📊 گزارشات جامع
        </h1>
        <p className="text-gray-400 text-sm mt-1">آمار و گزارش‌های دقیق فروش و عملکرد رستوران</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            selectedPeriod === 'week'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-calendar-week ml-2"></i>
          هفته جاری
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            selectedPeriod === 'month'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-calendar-alt ml-2"></i>
          ماه جاری
        </button>
        <button
          onClick={() => setSelectedPeriod('year')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            selectedPeriod === 'year'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <i className="fa-solid fa-calendar-year ml-2"></i>
          سال جاری
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">کل فروش</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-blue-400 text-lg"></i>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.totalRevenue.toLocaleString()} تومان</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">تعداد سفارشات</p>
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-shopping-cart text-green-400 text-lg"></i>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.totalOrders.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">مشتریان</p>
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-users text-purple-400 text-lg"></i>
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.totalCustomers.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">میانگین سفارش</p>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-chart-simple text-yellow-400 text-lg"></i>
            </div>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.averageOrderValue.toLocaleString()} تومان</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-red-400"></i>
            {selectedPeriod === 'week' ? 'روند فروش هفتگی' : selectedPeriod === 'month' ? 'روند فروش ماهانه' : 'روند فروش سالانه'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedChart('revenue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedChart === 'revenue'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <i className="fa-solid fa-coins ml-1"></i>
              درآمد
            </button>
            <button
              onClick={() => setSelectedChart('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedChart === 'orders'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <i className="fa-solid fa-shopping-cart ml-1"></i>
              تعداد سفارشات
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {selectedChart === 'revenue' ? (
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="فروش" 
                stroke="#ef4444" 
                strokeWidth={3}
                fill="url(#colorRevenue)" 
                name="فروش (تومان)"
              />
            </AreaChart>
          ) : (
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="تعداد" 
                fill="#3b82f6" 
                name="تعداد سفارشات"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-crown text-yellow-400"></i>
            محصولات پرفروش
          </h2>
          <div className="space-y-5">
            {topProducts.map((product, index) => (
              <div key={index} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="text-red-400 font-bold">{product.revenue.toLocaleString()} تومان</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${(product.quantity / topProducts[0]?.quantity) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 min-w-[60px]">
                    {product.quantity} عدد
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-purple-400"></i>
            سهم فروش دسته‌بندی‌ها
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}  
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${Number(value).toLocaleString()} تومان`}
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs">در انتظار</p>
          <p className="text-xl font-bold text-yellow-400">{stats.pendingOrders}</p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs">فروش ماه جاری</p>
          <p className="text-lg font-bold text-cyan-400">{stats.monthlyRevenue.toLocaleString()} تومان</p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs">نرخ رشد</p>
          <p className="text-xl font-bold text-emerald-400">+{stats.growthRate}%</p>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs">محصولات</p>
          <p className="text-xl font-bold text-red-400">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 justify-center">
            <i className="fa-solid fa-download text-blue-400 text-xl"></i>
            <span className="font-medium">خروجی PDF</span>
          </div>
        </button>
        <button className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 justify-center">
            <i className="fa-solid fa-file-excel text-green-400 text-xl"></i>
            <span className="font-medium">خروجی Excel</span>
          </div>
        </button>
        <button className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 justify-center">
            <i className="fa-solid fa-print text-yellow-400 text-xl"></i>
            <span className="font-medium">پرینت</span>
          </div>
        </button>
        <button className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 justify-center">
            <i className="fa-solid fa-envelope text-red-400 text-xl"></i>
            <span className="font-medium">ارسال ایمیل</span>
          </div>
        </button>
      </div>
    </div>
  );
}