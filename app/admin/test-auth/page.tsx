// app/admin/test-auth/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const [status, setStatus] = useState('در حال بررسی...');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // بررسی کوکی
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        const data = await res.json();
        
        // خواندن کوکی از مرورگر
        const cookies = document.cookie;
        const tokenMatch = cookies.match(/admin_token=([^;]+)/);
        setToken(tokenMatch ? tokenMatch[1] : 'ندارد');
        
        if (res.ok) {
          setStatus(`✅ احراز هویت موفق - کاربر: ${data.user?.username}`);
        } else {
          setStatus(`❌ احراز هویت ناموفق: ${data.error}`);
        }
      } catch (error) {
        setStatus('❌ خطا در ارتباط با سرور');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>تست احراز هویت</h1>
      <p>وضعیت: {status}</p>
      <p>توکن در کوکی: {token}</p>
      <button onClick={() => window.location.href = '/login'}>
        رفتن به لاگین
      </button>
    </div>
  );
}