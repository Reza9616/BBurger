'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass, ArrowLeft, CalendarDays, Radio, Music,
  Star, Crosshair, Trophy, Car, Flame, MapPin, Clock, Users
} from "lucide-react";

// ─────────────────────────────────────────────
// Data (بدون تغییر)
// ─────────────────────────────────────────────
const BURGER_IMAGE = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop";

const STAR_ACHIEVEMENTS = [
  "گوشت واگیو ۱۰۰٪",
  "سس مخفی اختصاصی",
  "نان تازه روزانه",
  "پنیر چدار اصل",
  "سبزیجات ارگانیک",
];

const STATS = [
  { icon: Flame,  label: "BURGERS SERVED", value: "154,200+", color: "#FF003C" },
  { icon: MapPin, label: "NEYSHABUR, IR",  value: "36.2°N",   color: "#DFFF00" },
  { icon: Clock,  label: "OPEN DAILY",     value: "11-23",    color: "#FF003C" },
  { icon: Users,  label: "HAPPY CLIENTS",  value: "12K+",     color: "#DFFF00" },
];

// ─────────────────────────────────────────────
// Background (بک‌گراند شطرنجی با شفافیت کمتر + لایه محو برای متن)
// ─────────────────────────────────────────────
function Background() {
  return (
    <div className="fixed inset-0 w-full h-screen" style={{ zIndex: -1 }}>
      {/* رنگ پایه مشکی (تیره‌تر) */}
      <div className="absolute inset-0 bg-black" />

      {/* پترن شطرنجی مشکی و سفید با شفافیت خیلی کم */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #ffffff 25%, transparent 25%),
            linear-gradient(-45deg, #ffffff 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ffffff 75%),
            linear-gradient(-45deg, transparent 75%, #ffffff 75%)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
          opacity: 0.15, // کاهش شفافیت برای افزایش خوانایی
        }}
      />

      {/* لایه محو سیاه برای پس‌زمینه متون (در سمت راست) */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-black/40 to-black/80 pointer-events-none" />

      {/* هاله‌های نوری */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-white rounded-full filter blur-[180px] opacity-[0.03] animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-white rounded-full filter blur-[160px] opacity-[0.02] animate-pulse-slow" style={{ animationDelay: "3s" }} />

      {/* خط اسکنر */}
      <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF003C] to-transparent opacity-20 animate-scanner" />

      {/* افکت Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, black 100%)" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Ticker tape (بدون تغییر)
// ─────────────────────────────────────────────
function TickerTape() {
  const text = "NEYSHABUR • B-BURGER • ORIGINAL TASTE • نیشابور • بی‌برگر • طعم اصیل • ";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center" style={{ zIndex: 1 }}>
      <div className="whitespace-nowrap animate-ticker opacity-[0.025]">
        <span className="text-[10rem] md:text-[14rem] font-black tracking-tight text-white select-none">
          {text.repeat(8)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Wanted badge (بدون تغییر)
// ─────────────────────────────────────────────
function WantedBadge() {
  const [hovered, setHovered] = useState<number | null>(null);
  
  return (
    <div className="absolute -top-5 -left-5 md:-top-8 md:-left-8 z-20">
      <div
        className="relative bg-[#0A0A0B]/95 backdrop-blur-xl border border-[#FF003C]/60 p-3 md:p-4 rounded-2xl"
        style={{ boxShadow: "0 0 30px rgba(255,0,60,.15),inset 0 1px 0 rgba(255,255,255,.05)" }}
      >
        {[
          "top-0 left-0 border-t border-l rounded-tl-2xl",
          "top-0 right-0 border-t border-r rounded-tr-2xl",
          "bottom-0 left-0 border-b border-l rounded-bl-2xl",
          "bottom-0 right-0 border-b border-r rounded-br-2xl",
        ].map((cls, i) => (
          <div key={i} className={`absolute w-3 h-3 border-[#FF003C]/40 ${cls}`} />
        ))}

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-[9px] text-[#888] font-mono tracking-widest">
            <Crosshair className="w-2.5 h-2.5 text-[#FF003C]" />
            <span>WANTED LEVEL</span>
          </div>

          <div className="flex gap-1 my-1 relative">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <Star
                  className={`w-4 h-4 md:w-5 md:h-5 fill-[#FF003C] text-[#FF003C] transition-all duration-300 ${hovered === i ? "scale-125" : ""}`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              </div>
            ))}
            {hovered !== null && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#FF003C] text-white text-[8px] font-mono px-2 py-1 rounded whitespace-nowrap z-30">
                {STAR_ACHIEVEMENTS[hovered]}
              </div>
            )}
          </div>

          <span className="text-[8px] text-[#DFFF00] font-mono tracking-wider">
            ★ BOUNTY: FREE DRINK ★
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Achievement badge (بدون تغییر)
// ─────────────────────────────────────────────
function AchievementBadge() {
  return (
    <div className="absolute -bottom-5 -right-5 md:-bottom-8 md:-right-8 z-20">
      <div
        className="relative bg-gradient-to-br from-[#0A0A0B]/95 to-[#1a0000]/80 backdrop-blur-xl border border-[#DFFF00]/30 p-3 md:p-4 rounded-2xl w-44 md:w-48"
        style={{ boxShadow: "0 0 25px rgba(223,255,0,.08),inset 0 1px 0 rgba(255,255,255,.05)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#DFFF00]/10 rounded-xl flex items-center justify-center border border-[#DFFF00]/20">
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#DFFF00]" />
          </div>
          <div>
            <p className="text-[8px] text-[#666] font-mono tracking-widest">ACHIEVEMENT</p>
            <p className="font-bold text-xs md:text-sm text-[#DFFF00]">MASTER BURGER</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[0,1,2,3,4].map(i => <Star key={i} className="w-2 h-2 fill-[#DFFF00] text-[#DFFF00]" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// License plate (بدون تغییر)
// ─────────────────────────────────────────────
function LicensePlate() {
  return (
    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20">
      <div
        className="bg-[#0A0A0B]/95 backdrop-blur-xl px-5 py-2 rounded-full flex items-center gap-2.5 text-xs font-mono border border-[#FF003C]/50"
        style={{ boxShadow: "0 4px 20px rgba(255,0,60,.15)" }}
      >
        <Car className="w-3 h-3 text-[#FF003C]" />
        <span className="text-[#FF003C] font-bold">LSPD</span>
        <span className="text-[#333]">|</span>
        <span className="text-[#DFFF00] font-bold">BURGER</span>
        <span className="text-[#333]">|</span>
        <span className="text-[#FF003C] font-bold">LS</span>
        <Crosshair className="w-3 h-3 text-[#FF003C]" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Burger image (بدون تغییر)
// ─────────────────────────────────────────────
function BurgerImage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  return (
    <div className="relative flex justify-center animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
      <div
        ref={ref}
        className="relative w-full max-w-sm md:max-w-md animate-float"
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "radial-gradient(circle at center,rgba(255,0,60,.18) 0%,transparent 70%)",
              filter: "blur(40px)",
              transform: "scale(1.2)",
            }}
          />

          <img
            src={BURGER_IMAGE}
            alt="B-Burger - Los Santos Edition"
            className="rounded-3xl z-10 relative object-cover w-full h-[380px] md:h-[500px]"
            style={{ boxShadow: "0 25px 80px rgba(0,0,0,.6),0 0 40px rgba(255,0,60,.12)" }}
          />

          <div className="absolute inset-0 rounded-3xl z-10 bg-gradient-to-t from-[#0A0A0B]/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-3xl overflow-hidden z-10 pointer-events-none">
            <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF003C]/40 to-transparent animate-scanner" />
          </div>
        </div>

        <WantedBadge />
        <AchievementBadge />
        <LicensePlate />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Text content (اصلاح شده با رنگ‌های تیره و readable)
// ─────────────────────────────────────────────
function TextContent() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    // اضافه کردن backdrop blur و بک‌گراند نیمه شفاف برای خوانایی
    <div className="text-center lg:text-right animate-fade-in-up relative z-30 bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10" style={{ opacity: 0 }}>

      {/* Top tag strip */}
      <div className="flex justify-center lg:justify-start items-center gap-3 mb-8">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#FF003C]/50" />
        <span className="text-[10px] font-mono tracking-[.3em] text-gray-400 uppercase">Rockstar</span>
        <span className="w-1 h-1 rounded-full bg-[#FF003C]" />
        <span className="text-[10px] font-mono tracking-[.3em] text-[#FF003C] uppercase">Wanted: Taste</span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#FF003C]/50" />
      </div>

      {/* Main headline - رنگ‌ها تیره و readable */}
      <h1 className="text-6xl md:text-7xl lg:text-[6.5rem] font-black leading-[.95] mb-2 tracking-tight">
        <span
          className="block text-white drop-shadow-lg"
          style={{
            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
          }}
        >
          بی‌برگر
        </span>
        <span
          className="block mt-2 relative text-gray-200 drop-shadow-lg"
          style={{
            letterSpacing: "-.02em",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
          }}
        >
          نیشابور
          <span className="absolute bottom-0 right-0 h-1 w-16 md:w-24 bg-gradient-to-l from-[#FF003C] to-transparent rounded-full" />
        </span>
      </h1>

      {/* Divider */}
      <div className="flex items-center justify-center lg:justify-start gap-3 my-6 md:my-8">
        <div className="w-12 h-[2px] bg-[#FF003C]" />
        <span className="text-[9px] font-mono text-[#FF003C]/80 tracking-widest">EST. 2024</span>
        <div className="w-4 h-[2px] bg-[#FF003C]/30" />
      </div>

      {/* Description - متن خاکستری روشن با سایه */}
      <p className="text-gray-300 text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed mb-8 md:mb-10 drop-shadow-md">
        <span className="text-[#FF003C] font-medium">گوشت ۱۰۰٪ خالص</span>
        <span className="text-gray-500 mx-2">•</span>
        <span className="text-gray-300">سس مخفی اختصاصی</span>
        <span className="text-gray-500 mx-2">•</span>
        <span className="text-gray-300">نان تازه روزانه</span>
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
        <a
          href="#menu"
          onClick={(e) => scrollToSection(e, '#menu')}
          className="group relative overflow-hidden px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2.5"
          style={{
            background: "linear-gradient(135deg,#FF003C,#cc0030)",
            color: "white",
            boxShadow: "0 4px 20px rgba(255,0,60,.35)",
          }}
        >
          <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
          <span>مشاهده منو</span>
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </a>
        <a
          href="#reservation"
          onClick={(e) => scrollToSection(e, '#reservation')}
          className="group px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 border border-gray-600 hover:border-[#FF003C]/50 text-gray-300 hover:text-[#FF003C] bg-black/40"
        >
          <CalendarDays className="w-4 h-4" />
          <span>رزرو میز</span>
        </a>
      </div>

      {/* Radio bar */}
      <div className="mt-10 flex items-center justify-center lg:justify-start">
        <div
          className="flex items-center gap-5 px-4 py-2 rounded-full border border-gray-800 bg-black/50"
        >
          <button className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 hover:text-[#FF003C] transition-colors">
            <Radio className="w-2.5 h-2.5" />
            <span>LS UNDERGROUND</span>
          </button>
          <span className="text-gray-700 text-[10px]">/</span>
          <button className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 hover:text-[#FF003C] transition-colors">
            <Music className="w-2.5 h-2.5" />
            <span>BURGER FM</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stats bar (بدون تغییر)
// ─────────────────────────────────────────────
function StatsBar() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4">
      <div
        className="flex items-center justify-between gap-4 md:gap-8 px-6 py-3 rounded-2xl border border-[#1a1a1a] overflow-x-auto"
        style={{ background: "rgba(10,10,11,.8)", backdropFilter: "blur(20px)" }}
      >
        {STATS.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div className="hidden md:block w-px h-8 bg-[#1a1a1a]" />}
            <div className="flex items-center gap-3 min-w-fit">
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <div>
                <p className="text-[8px] font-mono tracking-widest text-[#555]">{s.label}</p>
                <p className="text-xs md:text-sm font-bold text-[#eee]">{s.value}</p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Watermark (بدون تغییر)
// ─────────────────────────────────────────────
function Watermark() {
  return (
    <div className="absolute bottom-2 right-4 z-20 flex items-center gap-2 text-[8px] text-[#333] font-mono">
      <span>©</span>
      <span>ROCKSTAR GAMES</span>
      <span className="w-1 h-1 rounded-full bg-[#FF003C]" />
      <span>LOS SANTOS</span>
      <span className="w-1 h-1 rounded-full bg-[#FF003C]" />
      <span>BURGER EDITION</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// ★ HERO
// ─────────────────────────────────────────────
export default function Hero() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out forwards;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
      }
      .animate-float {
        animation: float 5s ease-in-out infinite;
      }
      
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.02; transform: scale(1); }
        50% { opacity: 0.05; transform: scale(1.1); }
      }
      .animate-pulse-slow {
        animation: pulse-slow 6s ease-in-out infinite;
      }
      
      @keyframes scanner {
        0% { top: -10%; }
        100% { top: 110%; }
      }
      .animate-scanner {
        animation: scanner 4s ease-in-out infinite;
      }
      
      @keyframes ticker {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      .animate-ticker {
        animation: ticker 20s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Background />

      <section
        id="home"
        dir="rtl"
        className="relative min-h-screen flex items-center bg-transparent overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <TickerTape />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-24 md:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <TextContent />
            <BurgerImage />
          </div>
        </div>

        <StatsBar />
        <Watermark />
      </section>
    </>
  );
}