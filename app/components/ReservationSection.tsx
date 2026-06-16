// app/components/ReservationSection.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ReservationSection() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    guests: '2',
    notes: ''
  });

  // بررسی مشتری با وارد کردن شماره
  const checkCustomer = async (phone: string) => {
    if (phone.length < 11) return;
    
    try {
      const res = await fetch(`/api/crm?phone=${phone}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setCustomerInfo(data[0]);
          setFormData(prev => ({ ...prev, name: data[0].full_name }));
          showToastMessage(`خوش آمدید ${data[0].full_name}!`, 'success');
        } else {
          setCustomerInfo(null);
        }
      }
    } catch (error) {
      console.error('Error checking customer:', error);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const convertToPersianDate = (gregorianDate: string): string => {
    if (!gregorianDate) return '';
    const date = new Date(gregorianDate);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      showToastMessage('لطفاً تاریخ را انتخاب کنید', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          date: formData.date,
          shamsiDate: convertToPersianDate(formData.date),
          guests: formData.guests,
          notes: formData.notes
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToastMessage(data.message || 'رزرو شما با موفقیت ثبت شد!', 'success');
        setFormData({ name: '', phone: '', date: '', guests: '2', notes: '' });
        setCustomerInfo(null);
      } else {
        showToastMessage(data.error || 'خطا در ثبت رزرو', 'error');
      }
    } catch (error) {
      showToastMessage('خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setFormData({ ...formData, phone });
    if (phone.length >= 11) {
      checkCustomer(phone);
    } else {
      setCustomerInfo(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <section id="reservation" className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1920')] bg-cover bg-fixed opacity-5"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-bl-full z-0"></div>
          
          <div className="text-center mb-10 relative z-10">
            <div className="inline-block bg-red-500/20 rounded-full px-4 py-1 mb-4">
              <span className="text-red-500 text-sm font-bold">★ رزرو آنلاین ★</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
              میز خودت رو <span className="text-red-500">رزرو کن</span>
            </h2>
            <p className="text-gray-400">برای دورهمی‌های دوستانه یا خانوادگی، از قبل جا رزرو کن تا معطل نشی.</p>
          </div>

          {/* اطلاعات مشتری وفادار */}
          {customerInfo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-xl border border-yellow-500/30">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-crown text-yellow-500"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">مشتری وفادار</p>
                    <p className="font-bold">{customerInfo.full_name}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">سفارشات</p>
                    <p className="font-bold text-blue-400">{customerInfo.total_orders || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">امتیاز</p>
                    <p className="font-bold text-yellow-400">{customerInfo.loyalty_points || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">نام و نام خانوادگی *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" 
                  placeholder="علی احمدی" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">شماره تماس *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handlePhoneChange} 
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" 
                  placeholder="0912XXX XXXX" 
                />
                <p className="text-gray-500 text-xs mt-1">با وارد کردن شماره، اطلاعات شما به طور خودکار تکمیل می‌شود</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">تاریخ *</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  value={formData.date} 
                  onChange={handleChange} 
                  min={minDate}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all [color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">تعداد نفرات *</label>
                <select 
                  name="guests" 
                  value={formData.guests} 
                  onChange={handleChange} 
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                >
                  <option value="1">1 نفر</option>
                  <option value="2">2 نفر</option>
                  <option value="3">3 نفر</option>
                  <option value="4">4 نفر</option>
                  <option value="5">5 نفر</option>
                  <option value="6">6 نفر</option>
                  <option value="7">7 نفر</option>
                  <option value="8">8 نفر</option>
                  <option value="9+">9 نفر و بیشتر</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">توضیحات ویژه (اختیاری)</label>
              <textarea 
                name="notes" 
                rows={3} 
                value={formData.notes} 
                onChange={handleChange} 
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none" 
                placeholder="مثلاً: صندلی کودک نیاز داریم، مناسبت خاصی داریم..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg shadow-red-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ثبت...
                </span>
              ) : (
                'ثبت درخواست رزرو'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>پس از ثبت درخواست، همکاران ما با شما تماس خواهند گرفت.</p>
            <p className="mt-1">مشتریان وفادار از تخفیف ویژه برخوردار می‌شوند</p>
          </div>
        </div>
      </div>

      {showToast && (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3 animate-fadeIn ${
          toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <i className={`fa-solid ${toastType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {toastMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}