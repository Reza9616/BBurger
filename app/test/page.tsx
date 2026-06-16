// app/test/page.tsx
'use client';

export default function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <button onClick={async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const data = await res.json();
        console.log('Login result:', data);
        if (res.ok) {
          window.location.href = '/admin/dashboard';
        }
      }}>
        Test Login
      </button>
    </div>
  );
}