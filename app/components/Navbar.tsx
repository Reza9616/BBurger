// app/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // بررسی وضعیت لاگین
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // آپدیت تعداد سبد خرید
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  // افکت اسکرول
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
    window.dispatchEvent(new Event('storage'));
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const openCart = () => {
    window.dispatchEvent(new Event('openCart'));
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="logo">
            <a href="#" className="logo-link">
              <div className="logo-wrapper">
                <Image 
                  src="/Bburger/3-03.png"
                  alt="بی‌برگر"
                  width={100}
                  height={100}
                  className="logo-image"
                  priority
                />
              </div>
              <div className="logo-text">
                <span className="logo-text-main">بی‌برگر</span>
                <span className="logo-text-sub">BURGER FIRE</span>
              </div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="nav-link">
              <i className="fa-solid fa-home"></i>
              <span>خانه</span>
              <div className="nav-link-bg"></div>
            </a>
            <a href="#menu" onClick={(e) => scrollToSection(e, '#menu')} className="nav-link">
              <i className="fa-solid fa-utensils"></i>
              <span>منو</span>
              <div className="nav-link-bg"></div>
            </a>
            <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="nav-link">
              <i className="fa-solid fa-info-circle"></i>
              <span>درباره ما</span>
              <div className="nav-link-bg"></div>
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="desktop-actions">
            <button onClick={openCart} className="cart-btn">
              <i className="fa-solid fa-cart-shopping"></i>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>

            {!isLoggedIn ? (
              <Link href="/login" className="login-btn">
                <i className="fa-solid fa-sign-in-alt"></i>
                <span>ورود</span>
              </Link>
            ) : (
              <>
                <Link href="/admin/dashboard" className="dashboard-btn">
                  <i className="fa-solid fa-chart-line"></i>
                  <span>داشبورد</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <i className="fa-solid fa-sign-out-alt"></i>
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="mobile-actions">
            <button onClick={openCart} className="cart-btn-mobile">
              <i className="fa-solid fa-cart-shopping"></i>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="menu-toggle"
            >
              <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-inner">
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="mobile-nav-link">
              <i className="fa-solid fa-home"></i>
              <span>خانه</span>
              <i className="fa-solid fa-chevron-left"></i>
            </a>
            <a href="#menu" onClick={(e) => scrollToSection(e, '#menu')} className="mobile-nav-link">
              <i className="fa-solid fa-utensils"></i>
              <span>منو</span>
              <i className="fa-solid fa-chevron-left"></i>
            </a>
            <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="mobile-nav-link">
              <i className="fa-solid fa-info-circle"></i>
              <span>درباره ما</span>
              <i className="fa-solid fa-chevron-left"></i>
            </a>
            
            <div className="mobile-divider"></div>
            
            {!isLoggedIn ? (
              <Link href="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-sign-in-alt"></i>
                <span>ورود به حساب</span>
                <i className="fa-solid fa-chevron-left"></i>
              </Link>
            ) : (
              <>
                <Link href="/admin/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fa-solid fa-chart-line"></i>
                  <span>داشبورد مدیریت</span>
                  <i className="fa-solid fa-chevron-left"></i>
                </Link>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <i className="fa-solid fa-sign-out-alt"></i>
                  <span>خروج از حساب</span>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              </>
            )}
            
            {isLoggedIn && user && (
              <div className="mobile-user-info">
                <i className="fa-solid fa-user-circle"></i>
                <div>
                  <p className="user-label">ورود با حساب</p>
                  <p className="user-name">{user.username}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        /* Navbar Base */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 1rem 0;
        }

        .navbar-scrolled {
          padding: 0.5rem 0;
          background: rgba(10, 10, 20, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Logo */
        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3));
          transition: filter 0.3s ease;
        }

        .logo-image:hover {
          filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.6));
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-text-main {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #ef4444);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.5px;
        }

        .logo-text-sub {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 1px;
          font-weight: 500;
        }

        /* Desktop Menu */
        .desktop-menu {
          display: none;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .desktop-menu {
            display: flex;
          }
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-weight: 600;
          border-radius: 40px;
          transition: all 0.3s ease;
          overflow: hidden;
          z-index: 1;
        }

        .nav-link i {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .nav-link span {
          font-size: 0.9rem;
        }

        .nav-link-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
          border-radius: 40px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .nav-link:hover {
          color: white;
        }

        .nav-link:hover i {
          transform: translateY(-2px);
        }

        .nav-link:hover .nav-link-bg {
          opacity: 1;
        }

        /* Desktop Actions */
        .desktop-actions {
          display: none;
          align-items: center;
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .desktop-actions {
            display: flex;
          }
        }

        .cart-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          font-size: 1.2rem;
        }

        .cart-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.05);
        }

        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 20px;
          min-width: 20px;
          text-align: center;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        .login-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 40px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        }

        .dashboard-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 40px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .dashboard-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          font-size: 1.2rem;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.05);
        }

        /* Mobile Actions */
        .mobile-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .mobile-actions {
            display: none;
          }
        }

        .cart-btn-mobile {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 1.1rem;
        }

        .menu-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          width: 24px;
          height: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          height: 2px;
          width: 100%;
          background: white;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.active span:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 350px;
          height: 100vh;
          background: rgba(15, 15, 26, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          transition: right 0.3s ease;
          z-index: 999;
          overflow-y: auto;
        }

        .mobile-menu.active {
          right: 0;
        }

        .mobile-menu-inner {
          padding: 80px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .mobile-nav-link i:first-child {
          width: 24px;
          font-size: 1.1rem;
        }

        .mobile-nav-link span {
          flex: 1;
          margin-right: 1rem;
        }

        .mobile-nav-link:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .mobile-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          margin: 1rem 0;
        }

        .mobile-logout-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .mobile-logout-btn i:first-child {
          width: 24px;
        }

        .mobile-logout-btn span {
          flex: 1;
          margin-right: 1rem;
          text-align: right;
        }

        .mobile-logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-top: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mobile-user-info i {
          font-size: 2rem;
          color: #4ade80;
        }

        .user-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #4ade80;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
          }
          
          .logo-text-main {
            font-size: 1.2rem;
          }
          
          .logo-wrapper {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
    </>
  );
}