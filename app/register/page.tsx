// app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('رمز عبور و تأیید آن مطابقت ندارند');
            return;
        }

        if (password.length < 4) {
            setError('رمز عبور باید حداقل ۴ کاراکتر باشد');
            return;
        }

        if (username.length < 3) {
            setError('نام کاربری باید حداقل ۳ کاراکتر باشد');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, fullName })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('✅ ثبت نام موفق! در حال انتقال به صفحه ورود...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error || 'خطا در ثبت نام');
            }
        } catch (err) {
            setError('خطا در ارتباط با سرور');
        } finally {
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
                width: '400px'
            }}>
                <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                    🍔 ثبت نام
                </h2>
                
                {message && (
                    <div style={{
                        backgroundColor: 'rgba(34,197,94,0.2)',
                        border: '1px solid #22c55e',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '16px',
                        color: '#22c55e',
                        fontSize: '13px',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}
                
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
                        placeholder="نام کاربری *"
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
                        type="text"
                        placeholder="نام و نام خانوادگی"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
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
                    />
                    
                    <input
                        type="email"
                        placeholder="ایمیل (اختیاری)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    />
                    
                    <input
                        type="password"
                        placeholder="رمز عبور *"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        placeholder="تکرار رمز عبور *"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
                    </button>
                </form>
                
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#9ca3af'
                }}>
                    قبلاً ثبت نام کرده‌اید؟{' '}
                    <Link href="/login" style={{ color: '#ef4444', textDecoration: 'none' }}>
                        وارد شوید
                    </Link>
                </div>
            </div>
        </div>
    );
}