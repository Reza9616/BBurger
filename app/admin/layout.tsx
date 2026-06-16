// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'داشبورد اصلی', icon: 'fa-chart-line', description: 'آمار و گزارشات' },
    { path: '/admin/products', name: 'مدیریت محصولات', icon: 'fa-utensils', description: 'افزودن، ویرایش محصولات' },
    { path: '/admin/orders', name: 'سفارشات', icon: 'fa-truck', description: 'مدیریت سفارشات' },
    { path: '/admin/reservations', name: 'رزرو میز', icon: 'fa-calendar-alt', description: 'مدیریت رزروها' },
    { path: '/admin/customers', name: 'مشتریان', icon: 'fa-users', description: 'اطلاعات مشتریان' },
    { path: '/admin/gallery', name: 'گالری تصاویر', icon: 'fa-images', description: 'مدیریت رسانه' }, 
    { path: '/admin/crm', name: '📱 CRM', icon: 'fa-comments', description: 'ارسال پیام به مشتریان' },
    { path: '/admin/reports', name: 'گزارشات', icon: 'fa-file-alt', description: 'گزارشات فروش' },
    { path: '/admin/change-password', name: 'تغییر رمز عبور', icon: 'fa-key', description: 'امنیت حساب' },
    { path: '/admin/settings', name: 'تنظیمات', icon: 'fa-sliders-h', description: 'تنظیمات سایت' },
  ];

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(239, 68, 68, 0.2);
            border-top: 3px solid #ef4444;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          p {
            color: white;
            margin-top: 20px;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <i className="fa-solid fa-burger"></i>
            </div>
            <div className="logo-text">
              <span className="logo-title">بی‌برگر</span>
              <span className="logo-badge">پنل مدیریت</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            <i className="fa-solid fa-user-astronaut"></i>
          </div>
          <div className="user-details">
            <p className="user-name">{user?.username || 'مدیر سیستم'}</p>
            <p className="user-email">مدیر ارشد</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-icon">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <div className="nav-content">
                <span className="nav-title">{item.name}</span>
                <span className="nav-description">{item.description}</span>
              </div>
              {pathname === item.path && <div className="nav-indicator"></div>}
              {hoveredItem === item.path && pathname !== item.path && (
                <div className="nav-tooltip">
                  <i className="fa-solid fa-arrow-left"></i>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <i className="fa-solid fa-sign-out-alt"></i>
            <span>خروج از حساب</span>
            <i className="fa-solid fa-arrow-left logout-icon"></i>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
          <div className="header-info">
            <h1 className="page-title">
              {menuItems.find(item => item.path === pathname)?.name || 'داشبورد'}
            </h1>
            <p className="page-description">
              {menuItems.find(item => item.path === pathname)?.description || 'خوش آمدید'}
            </p>
          </div>
          <div className="header-actions">
            <div className="date-badge">
              <i className="fa-regular fa-calendar"></i>
              <span>{new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
        }

        /* Sidebar Styles */
        .sidebar {
          position: fixed;
          top: 0;
          right: -320px;
          width: 320px;
          height: 100vh;
          background: linear-gradient(180deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5);
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 4px;
        }

        .sidebar.open {
          right: 0;
        }

        @media (min-width: 1024px) {
          .sidebar {
            position: relative;
            right: 0;
            width: 320px;
          }
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (min-width: 1024px) {
          .sidebar-overlay {
            display: none;
          }
        }

        /* Sidebar Header */
        .sidebar-header {
          padding: 32px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
        }

        .logo-icon i {
          font-size: 28px;
          color: white;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #fff, #ef4444);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-badge {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 2px;
        }

        /* User Profile */
        .user-profile {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
        }

        .user-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;
          box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: bold;
          font-size: 16px;
          color: white;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nav-item:hover::before {
          opacity: 1;
        }

        .nav-item:hover {
          transform: translateX(-8px);
          color: #ef4444;
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08));
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }

        .nav-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-title {
          font-size: 14px;
          font-weight: 500;
        }

        .nav-description {
          font-size: 10px;
          opacity: 0.6;
        }

        .nav-indicator {
          width: 3px;
          height: 24px;
          background: #ef4444;
          border-radius: 3px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: 24px;
            opacity: 1;
          }
        }

        .nav-tooltip {
          position: absolute;
          left: -40px;
          background: #ef4444;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          animation: fadeInLeft 0.3s ease;
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Footer */
        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .logout-button:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .logout-icon {
          transition: transform 0.3s ease;
        }

        .logout-button:hover .logout-icon {
          transform: translateX(-5px);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: auto;
        }

        .main-header {
          background: rgba(26, 26, 46, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .menu-toggle {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-toggle:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
          transform: scale(1.05);
        }

        @media (min-width: 1024px) {
          .menu-toggle {
            display: none;
          }
        }

        .header-info {
          flex: 1;
          margin-right: 20px;
        }

        .page-title {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #fff, #ef4444);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 4px;
        }

        .page-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .page-content {
          flex: 1;
          padding: 32px;
          animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}