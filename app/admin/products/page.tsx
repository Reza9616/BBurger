// app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
  badge: string | null;
  badgeIcon: string | null;
  badgeText: string | null;
  category: string;
  inStock: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    desc: '',
    image: '',
    badge: '',
    category: 'burgers',
    inStock: true
  });

  const categories = [
    { value: 'all', label: 'همه', icon: 'fa-list' },
    { value: 'burgers', label: 'برگرها', icon: 'fa-hamburger' },
    { value: 'drinks', label: 'نوشیدنی‌ها', icon: 'fa-coffee' },
    { value: 'sides', label: 'پیش غذاه', icon: 'fa-fries' },
    { value: 'desserts', label: 'دسرها', icon: 'fa-ice-cream' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    if (!productForm.name || !productForm.price) {
      alert('❌ لطفاً نام و قیمت محصول را وارد کنید');
      return;
    }
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        await fetchProducts();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      alert('❌ خطا در اضافه کردن محصول');
    }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        await fetchProducts();
        setEditingProduct(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      alert('❌ خطا در ویرایش محصول');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (error) {
      alert('❌ خطا در حذف محصول');
    }
  };

  const toggleStock = async (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) await fetchProducts();
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: 0,
      desc: '',
      image: '',
      badge: '',
      category: 'burgers',
      inStock: true
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      burgers: 'fa-hamburger',
      drinks: 'fa-coffee',
      sides: 'fa-fries',
      desserts: 'fa-ice-cream'
    };
    return icons[category] || 'fa-utensils';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-hamburger text-red-500 text-xl animate-pulse"></i>
            </div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">در حال بارگذاری محصولات...</p>
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
            🍔 مدیریت محصولات
          </h1>
          <p className="text-gray-400 text-sm mt-1">مدیریت، ویرایش و افزودن محصولات رستوران</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); resetForm(); setIsModalOpen(true); }} 
          className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          محصول جدید
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            placeholder="جستجوی محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
          <p className="text-gray-400 text-sm">کل محصولات</p>
          <p className="text-2xl font-bold text-blue-400">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
          <p className="text-gray-400 text-sm">موجود</p>
          <p className="text-2xl font-bold text-green-400">{products.filter(p => p.inStock).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-4 border border-red-500/20">
          <p className="text-gray-400 text-sm">ناموجود</p>
          <p className="text-2xl font-bold text-red-400">{products.filter(p => !p.inStock).length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-4 border border-yellow-500/20">
          <p className="text-gray-400 text-sm">میانگین قیمت</p>
          <p className="text-xl font-bold text-yellow-400">
            {Math.floor(products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1)).toLocaleString()} تومان
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
          <i className="fa-solid fa-box-open text-gray-600 text-5xl mb-4"></i>
          <p className="text-gray-500">محصولی یافت نشد</p>
          {searchTerm && <p className="text-gray-600 text-sm mt-2">جستجوی خود را تغییر دهید</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative p-5">
                <div className="flex gap-5">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-700/50">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-hamburger text-3xl text-gray-500"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50">
                            <i className={`fa-solid ${getCategoryIcon(product.category)} ml-1`}></i>
                            {categories.find(c => c.value === product.category)?.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            product.inStock 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {product.inStock ? 'موجود' : 'ناموجود'}
                          </span>
                        </div>
                      </div>
                      <p className="text-red-400 font-bold text-lg whitespace-nowrap">
                        {product.price.toLocaleString()} تومان
                      </p>
                    </div>

                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {product.desc || 'توضیحاتی برای این محصول وجود ندارد'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => toggleStock(product)}
                        className={`flex-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                          product.inStock
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                        }`}
                      >
                        <i className={`fa-solid ${product.inStock ? 'fa-ban' : 'fa-check'}`}></i>
                        {product.inStock ? 'غیرفعال' : 'فعال'}
                      </button>
                      <button
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="flex-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-pen"></i>
                        ویرایش
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="flex-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-trash"></i>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <i className={`fa-solid ${editingProduct ? 'fa-pen' : 'fa-plus'} text-red-400`}></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{editingProduct ? 'ویرایش محصول' : 'محصول جدید'}</h2>
                  <p className="text-sm text-gray-400">
                    {editingProduct ? 'اطلاعات محصول را ویرایش کنید' : 'اطلاعات محصول جدید را وارد کنید'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">نام محصول *</label>
                <input
                  type="text"
                  placeholder="مثال: برگر مخصوص"
                  value={editingProduct ? editingProduct.name : productForm.name}
                  onChange={(e) => editingProduct 
                    ? setEditingProduct({...editingProduct, name: e.target.value})
                    : setProductForm({...productForm, name: e.target.value})
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">قیمت (تومان) *</label>
                <input
                  type="number"
                  placeholder="0"
                  value={editingProduct ? editingProduct.price : productForm.price}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({...editingProduct, price: Number(e.target.value)})
                    : setProductForm({...productForm, price: Number(e.target.value)})
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">دسته‌بندی</label>
                <select
                  value={editingProduct ? editingProduct.category : productForm.category}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({...editingProduct, category: e.target.value})
                    : setProductForm({...productForm, category: e.target.value})
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-all"
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">توضیحات</label>
                <textarea
                  placeholder="توضیحات محصول..."
                  rows={3}
                  value={editingProduct ? editingProduct.desc : productForm.desc}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({...editingProduct, desc: e.target.value})
                    : setProductForm({...productForm, desc: e.target.value})
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">آدرس تصویر</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={editingProduct ? editingProduct.image : productForm.image}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({...editingProduct, image: e.target.value})
                    : setProductForm({...productForm, image: e.target.value})
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct ? editingProduct.inStock : productForm.inStock}
                    onChange={(e) => editingProduct
                      ? setEditingProduct({...editingProduct, inStock: e.target.checked})
                      : setProductForm({...productForm, inStock: e.target.checked})
                    }
                    className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                  />
                  <span className="text-gray-300 text-sm">موجود در انبار</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-700 p-5 flex gap-3">
              <button
                onClick={editingProduct ? updateProduct : addProduct}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-save"></i>
                ذخیره
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
              >
                انصراف
              </button>
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}