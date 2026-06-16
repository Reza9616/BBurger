// app/admin/settings/page.tsx
'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'بی‌برگر',
    siteDescription: 'بهترین برگر شهر',
    contactPhone: '09123456789',
    contactEmail: 'info@burgerfire.com',
    workingHours: '۱۲:۰۰ تا ۲۳:۰۰'
  });

  const handleSave = async () => {
    // ذخیره تنظیمات
    alert('تنظیمات ذخیره شد');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">⚙️ تنظیمات سایت</h1>
      
      <div className="bg-gray-800/50 rounded-xl p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">نام سایت</label>
          <input type="text" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="w-full bg-gray-700 rounded-lg px-4 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">توضیحات سایت</label>
          <textarea value={settings.siteDescription} onChange={(e) => setSettings({...settings, siteDescription: e.target.value})} className="w-full bg-gray-700 rounded-lg px-4 py-2" rows={3} />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">شماره تماس</label>
          <input type="tel" value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} className="w-full bg-gray-700 rounded-lg px-4 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">ایمیل</label>
          <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} className="w-full bg-gray-700 rounded-lg px-4 py-2" />
        </div>
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">ساعات کاری</label>
          <input type="text" value={settings.workingHours} onChange={(e) => setSettings({...settings, workingHours: e.target.value})} className="w-full bg-gray-700 rounded-lg px-4 py-2" />
        </div>
        <button onClick={handleSave} className="w-full bg-red-500 py-3 rounded-lg font-bold">💾 ذخیره تنظیمات</button>
      </div>
    </div>
  );
}