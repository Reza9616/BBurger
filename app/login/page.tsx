// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // استفاده از window.location به جای router.push برای اطمینان از رفرش کامل
                window.location.href = '/admin/dashboard';
            } else {
                setError(data.error || 'نام کاربری یا رمز عبور اشتباه است');
                setLoading(false);
            }
        } catch (err) {
            setError('خطا در ارتباط با سرور');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f0f1a',
            fontFamily: 'system-ui'
        }}>
            <div style={{
                backgroundColor: '#1a1a2e',
                padding: '40px',
                borderRadius: '16px',
                width: '340px'
            }}>
                <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                    🍔 ورود به پنل
                </h2>
                
                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239,68,68,0.2)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '16px',
                        color: '#ef4444',
                        fontSize: '13px',
                        textAlign: 'center'
                    }}>
                        ❌ {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="نام کاربری"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '16px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            backgroundColor: '#2a2a3e',
                            color: 'white',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                    
                    <input
                        type="password"
                        placeholder="رمز عبور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            backgroundColor: '#2a2a3e',
                            color: 'white',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading ? '#6b7280' : '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'در حال ورود...' : 'ورود'}
                    </button>
                </form>
                
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#9ca3af'
                }}>
                    حساب کاربری ندارید؟{' '}
                    <Link href="/register" style={{ color: '#ef4444', textDecoration: 'none' }}>
                        ثبت نام کنید
                    </Link>
                </div>
            </div>
        </div>
    );
}