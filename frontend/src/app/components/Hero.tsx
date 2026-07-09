import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Search, MapPin, ChevronLeft, ChevronRight, ArrowRight, Laptop, FileText, Send, Zap, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import laptopWorkspace from 'figma:asset/b560bdd03c4e4e46d04ac11d7333a517b07e30db.png';
import exampleImage from 'figma:asset/77d8cb67550763f25a95591becdc90b68aeeb976.png';
import bgImage from 'figma:asset/e682ebef5a4c1756f20ade0c8585754d78d4390e.png';

/* ─── Service data ────────────────────────────────────────── */
const SERVICES = [
  {
    icon: Laptop,
    title: 'GeM Registration',
    slug: 'gem-registration',
    desc: 'Seamless onboarding & catalog setup on Government e-Marketplace.',
    accent: '#16A34A',
  },
  {
    icon: FileText,
    title: 'Tender Bidding',
    slug: 'tender-bidding',
    desc: 'Expert document prep & compliance review for winning bids.',
    accent: '#14B8A6',
  },
  {
    icon: Send,
    title: 'OEM Panel Setup',
    slug: 'oem-panel',
    desc: 'OEM authorization & panel management on GeM portal.',
    accent: '#10B981',
  },
  {
    icon: Zap,
    title: 'Catalogue Management',
    slug: 'catalogue-management',
    desc: 'Professional product listing & profile optimization.',
    accent: '#059669',
  },
  {
    icon: GraduationCap,
    title: 'Training Services',
    slug: 'training',
    desc: 'Comprehensive GeM & tender bidding training programmes.',
    accent: '#16A34A',
  },
];

/* ─── 3-D offset helper ───────────────────────────────────── */
function getOffset(idx: number, active: number, total: number) {
  let o = idx - active;
  if (o > total / 2) o -= total;
  if (o < -total / 2) o += total;
  return o;
}

function cardTransform(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  if (abs > 2) return { opacity: 0, pointerEvents: 'none', zIndex: 0 };

  const map: Record<number, { x: number; z: number; ry: number; scale: number; opacity: number; zIndex: number }> = {
    0: { x: 0,   z: 120, ry: 0,   scale: 1,    opacity: 1,    zIndex: 10 },
    1: { x: 200, z: -50, ry: -36, scale: 0.82, opacity: 0.68, zIndex: 6  },
    2: { x: 330, z: -160,ry: -52, scale: 0.62, opacity: 0.0,  zIndex: 3  },
  };
  const c = map[abs];
  return {
    transform: `translateX(${offset < 0 ? -c.x : c.x}px) translateZ(${c.z}px) rotateY(${offset < 0 ? c.ry : -c.ry}deg) scale(${c.scale})`,
    opacity: c.opacity,
    zIndex: c.zIndex,
    pointerEvents: abs === 0 ? 'auto' : 'none',
    transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.65s ease',
  };
}

/* ─── Carousel sub-component ─────────────────────────────── */
const HeroCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const total = SERVICES.length;

  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 3800);
    return () => clearInterval(t);
  }, [next]);

  const cur = SERVICES[active];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Stage */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '310px',
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
          {SERVICES.map((svc, i) => {
            const offset = getOffset(i, active, total);
            const Icon = svc.icon;
            const isActive = offset === 0;

            return (
              <div
                key={svc.slug}
                className="absolute cursor-pointer"
                style={{
                  width: '240px',
                  transformStyle: 'preserve-3d',
                  ...cardTransform(offset),
                }}
                onClick={() => !isActive && setActive(i)}
              >
                <div
                  className="rounded-[20px] flex flex-col p-6 h-[260px] glass-card"
                  style={{
                    background: isActive
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.75)',
                    border: isActive ? `2px solid ${svc.accent}` : '1px solid rgba(255,255,255,0.8)',
                    boxShadow: isActive
                      ? '0 12px 32px rgba(22,163,74,0.12)'
                      : '0 4px 16px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="mb-4 flex items-center justify-center rounded-[12px] flex-shrink-0"
                    style={{
                      width: '52px',
                      height: '52px',
                      background: `${svc.accent}15`,
                      border: `1.5px solid ${svc.accent}`,
                    }}
                  >
                    <Icon size={24} style={{ color: svc.accent }} />
                  </div>

                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="self-start mb-2 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex-shrink-0"
                      style={{ background: `${svc.accent}15`, color: svc.accent, border: `1px solid ${svc.accent}` }}
                    >
                      Active
                    </motion.span>
                  )}

                  <h3
                    className="font-bold mb-2 leading-tight"
                    style={{ fontSize: isActive ? '1.05rem' : '0.88rem', color: '#111827' }}
                  >
                    {svc.title}
                  </h3>
                  <p className="leading-relaxed mb-auto" style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {svc.desc}
                  </p>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 flex-shrink-0"
                    >
                      <Link
                        to={`/services/${svc.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] text-xs font-semibold transition-all duration-300"
                        style={{
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          border: '1px solid #15803D',
                          boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#15803D';
                          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 16px rgba(22,163,74,0.3)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#16A34A';
                          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)';
                        }}
                      >
                        Learn More <ArrowRight size={11} />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={prev}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-opacity-80"
          style={{ background: 'rgba(22,163,74,0.1)', border: '1.5px solid rgba(22,163,74,0.3)' }}
          aria-label="Previous"
        >
          <ChevronLeft size={16} style={{ color: '#16A34A' }} />
        </button>

        <div className="flex items-center gap-1.5">
          {SERVICES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all"
              style={{
                width: i === active ? '22px' : '6px',
                height: '6px',
                background: i === active ? cur.accent : 'rgba(22,163,74,0.2)',
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-opacity-80"
          style={{ background: 'rgba(22,163,74,0.1)', border: '1.5px solid rgba(22,163,74,0.3)' }}
          aria-label="Next"
        >
          <ChevronRight size={16} style={{ color: '#16A34A' }} />
        </button>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: cur.accent }}
        >
          {active + 1} / {total} — {cur.title}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Hero ───────────────────────────────────────────── */
export const Hero: React.FC = () => {
  return (
    <section
      className="relative w-full min-h-[calc(100svh-80px)] md:min-h-[calc(100svh-116px)] flex flex-col overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 50%, rgba(240, 253, 244, 0.85) 100%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(22,163,74,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Soft radial glows */}
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          transform: 'translate(-30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
          transform: 'translate(30%, 30%)',
        }}
      />

      {/* Professional Workspace Image - Background decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-[12%] right-[5%] w-[420px] h-[300px] pointer-events-none hidden lg:block opacity-40 mix-blend-multiply"
        style={{
          filter: 'brightness(1.05)',
        }}
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img
            src={laptopWorkspace}
            alt="Professional Tender Workspace"
            className="w-full h-full object-cover rounded-[20px]"
            style={{
              boxShadow: '0 20px 60px rgba(22, 163, 74, 0.1)',
              border: '1px solid rgba(22, 163, 74, 0.1)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Animated document icon - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute bottom-[5%] left-[5%] pointer-events-none hidden md:block z-0 opacity-40 mix-blend-multiply"
      >
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src={exampleImage} 
            alt="Document Icon" 
            className="w-[200px] h-[200px] object-contain opacity-40"
          />
        </motion.div>
      </motion.div>

      {/* Animated shield icon - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute bottom-[20%] right-[12%] pointer-events-none hidden lg:block"
      >
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ShieldCheck size={100} style={{ color: '#16A34A' }} />
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
          }}
          transition={{ 
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut"
          }}
          className="absolute pointer-events-none"
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: i % 2 === 0 ? '#14B8A6' : '#16A34A',
          }}
        />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-[1200px] mx-auto w-full px-6 pt-16 pb-10 gap-10 lg:gap-6">

        {/* LEFT — Text & Search */}
        <div className="flex-1 text-[#111827] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Pill badge */}
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6"
              style={{
                background: 'rgba(22,163,74,0.1)',
                border: '1px solid rgba(22,163,74,0.2)',
                color: '#16A34A',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Trusted by Businesses Nationwide
            </span>

            <h1
              className="text-[#111827] mb-6 leading-[1.08] tracking-tight"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 900 }}
            >
              India's Premier <br />
              <span style={{ color: '#16A34A' }}>Tender Ecosystem</span>
            </h1>

            <p className="text-[#6B7280] mb-10 leading-relaxed max-w-[540px]" style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)' }}>
              Empowering businesses with real-time access to 20,000+ government &amp; corporate opportunities daily. Bid smarter, win faster.
            </p>

            {/* Search bar */}
            <div
              className="flex flex-col sm:flex-row gap-2.5 p-2.5 rounded-[24px] max-w-[620px] mb-8 shadow-sm"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex-1 flex items-center px-4 rounded-[16px] bg-white border border-gray-100">
                <Search className="text-[#16A34A]/50 mr-2 flex-shrink-0" size={18} />
                <input
                  type="text"
                  placeholder="Keywords, Tender ID, Department…"
                  className="w-full py-3 bg-transparent text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] text-sm"
                />
              </div>
              <div className="sm:w-[160px] flex items-center px-4 rounded-[16px] bg-white border border-gray-100 relative">
                <MapPin className="text-[#16A34A]/50 mr-2 flex-shrink-0" size={16} />
                <select className="w-full py-3 bg-transparent text-[#111827] focus:outline-none appearance-none cursor-pointer text-sm pr-6">
                  <option>All States</option>
                  <option>Maharashtra</option>
                  <option>Delhi NCR</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                </select>
                <div className="absolute right-3 pointer-events-none text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <Link
                to="/tenders"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-[16px] font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: '#16A34A', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}
              >
                <Search size={16} />
                Search
              </Link>
            </div>

            {/* Live indicators */}
            <div className="flex flex-wrap items-center gap-5 text-sm mb-8">
              <div className="flex items-center gap-2 text-[#4B5563]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                15,432 Live Tenders
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <span className="w-2 h-2 rounded-full" style={{ background: '#14B8A6' }} />
                89 Departments
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                Updated Every Hour
              </div>
            </div>

            {/* Featured Hero Image Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-full max-w-[620px] h-[160px] sm:h-[180px] rounded-[20px] overflow-hidden shadow-lg"
              style={{ border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1771147372627-7fffe86cf00b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIwb3JhbmdlfGVufDF8fHx8MTc3NTA3MDA0NXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Corporate Tender Management"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.2))' }} />
              
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: '#16A34A', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-[#111827] font-bold text-sm tracking-wide">Enterprise Trusted</h4>
                    <p className="text-[#6B7280] text-xs">Securing contracts</p>
                  </div>
                </div>
                
                {/* Trust Avatars */}
                <div className="hidden sm:flex items-center -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80",
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80",
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80"
                  ].map((avatar, idx) => (
                    <ImageWithFallback
                      key={idx}
                      src={avatar}
                      alt="Partner Avatar"
                      className="w-8 h-8 rounded-full border-2 object-cover relative"
                      style={{ borderColor: '#FFFFFF', zIndex: 10 - idx }}
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white relative border-2" style={{ background: '#16A34A', borderColor: '#FFFFFF', zIndex: 0 }}>
                    +5k
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — 3-D Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center w-full lg:max-w-[520px]"
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-6 self-start lg:self-center">
            <div className="w-8 h-px" style={{ background: 'rgba(22,163,74,0.3)' }} />
            <span
              className="text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: '#16A34A' }}
            >
              Our Services
            </span>
            <div className="w-8 h-px" style={{ background: 'rgba(22,163,74,0.3)' }} />
          </div>

          <HeroCarousel />

          <Link
            to="/services"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
            style={{ color: '#6B7280' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#16A34A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          >
            View All Services <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};