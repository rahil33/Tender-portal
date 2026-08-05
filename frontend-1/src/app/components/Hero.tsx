import React from 'react';
import { Link } from 'react-router';
import { Search, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import bgImage from '@/assets/hero-bg.png';
import { HeroCarousel } from './hero/HeroCarousel';
import { HeroDecorations } from './hero/HeroDecorations';

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
      <HeroDecorations />

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
                  aria-label="Search keywords, tender ID, or department"
                  className="w-full py-3 bg-transparent text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] text-sm"
                />
              </div>
              <div className="sm:w-[160px] flex items-center px-4 rounded-[16px] bg-white border border-gray-100 relative">
                <MapPin className="text-[#16A34A]/50 mr-2 flex-shrink-0" size={16} aria-hidden="true" />
                <select
                  aria-label="Filter by state"
                  className="w-full py-3 bg-transparent text-[#111827] focus:outline-none appearance-none cursor-pointer text-sm pr-6"
                >
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

            {/* Primary CTA */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                to="/tenders"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[16px] font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg"
                style={{ background: '#16A34A', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(22,163,74,0.30)' }}
              >
                Browse Tenders <ArrowRight size={15} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[16px] font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                Talk to an Expert
              </Link>
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
