'use client';

import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import AboutSection from './components/AboutSection';
import ReservationSection from './components/ReservationSection';
import Footer from './components/Footer';
import Gallery from './components/Gallery';

export default function HomePage() {
  useEffect(() => {
    // Scroll Reveal Animation
    function reveal() {
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add("active");
        }
      }
    }

    window.addEventListener("scroll", reveal);
    reveal();

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('bg-dark-surface/95', 'shadow-lg');
        navbar?.classList.remove('glass');
      } else {
        navbar?.classList.remove('bg-dark-surface/95', 'shadow-lg');
        navbar?.classList.add('glass');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const toggleMenu = () => {
      menu?.classList.toggle('hidden');
    };
    btn?.addEventListener('click', toggleMenu);

    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener('scroll', handleScroll);
      btn?.removeEventListener('click', toggleMenu);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <MenuSection />
      <Gallery />
      <AboutSection />
      <ReservationSection /> 
      <Footer />
    </>
  );
}