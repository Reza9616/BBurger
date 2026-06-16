// app/admin/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // پاک کردن پیام هنگام تایپ
    if (message) setMessage(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // اعتبارسنجی سمت کلاینت
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'رمز عبور جدید و تکرار آن مطابقت ندارند'
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'رمز عبور جدید باید حداقل 6 کاراکتر باشد'
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'رمز عبور با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...'
        });
        
        // پاک کردن فرم
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // بعد از 2 ثانیه به لاگین هدایت شود
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'خطا در تغییر رمز عبور'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در ارتباط با سرور'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          🔒 تغییر رمز عبور
        </h1>
        <p className="text-gray-400 mt-2">برای امنیت بیشتر، رمز عبور خود را به طور منظم تغییر دهید</p>
      </div>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              <div className="flex items-center gap-3">
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-lg`}></i>
                <p>{message.text}</p>
              </div>
            </div>
          )}

          {/* Security Tips */}
          <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-shield-alt text-blue-400 text-lg mt-0.5"></i>
              <div className="flex-1">
                <h3 className="text-blue-400 font-bold mb-2">نکات امنیتی</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ رمز عبور باید حداقل 6 کاراکتر باشد</li>
                  <li>✓ از ترکیب حروف بزرگ، کوچک، اعداد و نمادها استفاده کنید</li>
                  <li>✓ از رمزهای تکراری و قابل حدس زدن خودداری کنید</li>
                  <li>✓ رمز عبور خود را با کسی به اشتراک نگذارید</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                رمز عبور فعلی
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pr-12 pl-12 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="رمز عبور فعلی خود را وارد کنید"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  <i className={`fa-solid ${showPassword.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                رمز عبور جدید
              </label>
              <div className="relative">
                <i className="fa-solid fa-key absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pr-12 pl-12 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="رمز عبور جدید را وارد کنید"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  <i className={`fa-solid ${showPassword.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          formData.newPassword.length < 4 ? 'w-1/3 bg-red-500' :
                          formData.newPassword.length < 6 ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formData.newPassword.length < 4 ? 'ضعیف' :
                       formData.newPassword.length < 6 ? 'متوسط' :
                       'قوی'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                تکرار رمز عبور جدید
              </label>
              <div className="relative">
                <i className="fa-solid fa-check-circle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pr-12 pl-12 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="رمز عبور جدید را مجدد وارد کنید"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  <i className={`fa-solid ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {/* Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  <p className={`text-xs flex items-center gap-1 ${
                    formData.newPassword === formData.confirmPassword 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    <i className={`fa-solid ${
                      formData.newPassword === formData.confirmPassword 
                        ? 'fa-check-circle' 
                        : 'fa-times-circle'
                    }`}></i>
                    {formData.newPassword === formData.confirmPassword 
                      ? 'رمز عبور مطابقت دارد' 
                      : 'رمز عبور مطابقت ندارد'}
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    در حال تغییر رمز...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-save"></i>
                    تغییر رمز عبور
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-700/50 rounded-xl font-medium hover:bg-gray-700 transition-all duration-200"
              >
                انصراف
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm">
              <i className="fa-solid fa-info-circle ml-1"></i>
              پس از تغییر رمز عبور، برای ورود مجدد به صفحه لاگین هدایت خواهید شد
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}