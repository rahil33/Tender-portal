import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  FileText,
  Award,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const SERVICES = [
  {
    icon: Package,
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
    icon: Award,
    title: 'OEM Panel Setup',
    slug: 'oem-panel',
    desc: 'OEM authorization & panel management on GeM portal.',
    accent: '#10B981',
  },
  {
    icon: BarChart3,
    title: 'Catalogue Management',
    slug: 'catalogue-management',
    desc: 'Professional product listing & profile optimization for visibility.',
    accent: '#059669',
  },
  {
    icon: BookOpen,
    title: 'Training Services',
    slug: 'training',
    desc: 'Comprehensive GeM & tender bidding training programmes.',
    accent: '#16A34A',
  },
];

function getOffset(index: number, active: number, total: number): number {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

interface CardStyleProps {
  offset: number;
}

function getCardStyle({ offset }: CardStyleProps): React.CSSProperties {
  const absOffset = Math.abs(offset);

  if (absOffset > 2) {
    return { opacity: 0, pointerEvents: 'none', zIndex: 0 };
  }

  const configs: Record<number, { x: number; z: number; rotateY: number; scale: number; opacity: number; zIndex: number }> = {
    0:  { x: 0,    z: 120,  rotateY: 0,   scale: 1,    opacity: 1,    zIndex: 10 },
    1:  { x: 300,  z: -60,  rotateY: -42, scale: 0.82, opacity: 0.75, zIndex: 7  },
    2:  { x: 530,  z: -200, rotateY: -58, scale: 0.62, opacity: 0.40, zIndex: 4  },
  };

  const cfg = configs[absOffset] || configs[2];
  const signedX = offset < 0 ? -cfg.x : cfg.x;
  const signedRotate = offset < 0 ? -cfg.rotateY : cfg.rotateY;

  return {
    transform: `translateX(${signedX}px) translateZ(${cfg.z}px) rotateY(${signedRotate}deg) scale(${cfg.scale})`,
    opacity: cfg.opacity,
    zIndex: cfg.zIndex,
    pointerEvents: absOffset === 0 ? 'auto' : 'none',
  };
}

export const ServiceCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const total = SERVICES.length;

  const prev = useCallback(() => {
    setDirection('left');
    setActive((a) => (a - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setDirection('right');
    setActive((a) => (a + 1) % total);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 4000);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  const activeService = SERVICES[active];

  return (
    <section
      className="relative overflow-hidden py-28"
      style={{
        background: '#FFFFFF',
      }}
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(22,163,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 text-center mb-16 px-4">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
          style={{
            background: 'rgba(22,163,74,0.1)',
            border: '1px solid rgba(22,163,74,0.2)',
            color: '#16A34A',
          }}
        >
          Our Premium Services
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#111827] mb-4"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}
        >
          Expert Support for Your{' '}
          <span style={{ color: '#16A34A' }}>Bid Journey</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#6B7280] max-w-lg mx-auto text-sm leading-relaxed"
        >
          Comprehensive government procurement services designed to give your business a competitive edge.
        </motion.p>
      </div>

      {/* 3D Stage */}
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '380px',
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Cards */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {SERVICES.map((service, index) => {
            const offset = getOffset(index, active, total);
            const style = getCardStyle({ offset });
            const isActive = offset === 0;
            const Icon = service.icon;

            return (
              <div
                key={service.slug + index}
                className="absolute cursor-pointer select-none"
                style={{
                  width: isActive ? '300px' : '260px',
                  transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease, z-index 0.6s step-start',
                  transformStyle: 'preserve-3d',
                  ...style,
                }}
                onClick={() => {
                  if (!isActive) {
                    setDirection(offset > 0 ? 'right' : 'left');
                    setActive(index);
                  }
                }}
              >
                <div
                  className="relative rounded-[24px] overflow-hidden h-full flex flex-col"
                  style={{
                    height: isActive ? '310px' : '270px',
                    background: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(20px)',
                    border: isActive
                      ? `2px solid ${service.accent}`
                      : '1px solid rgba(255,255,255,0.8)',
                    boxShadow: isActive
                      ? '0 12px 32px rgba(22,163,74,0.12)'
                      : '0 4px 16px rgba(0,0,0,0.04)',
                    transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-[24px]"
                    style={{
                      background: isActive ? service.accent : 'transparent',
                    }}
                  />

                  <div className="relative z-10 p-7 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="mb-5 flex items-center justify-center rounded-[16px]"
                      style={{
                        width: isActive ? '60px' : '50px',
                        height: isActive ? '60px' : '50px',
                        background: `${service.accent}15`,
                        border: `1.5px solid ${service.accent}`,
                        transition: 'all 0.6s ease',
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                         size={isActive ? 28 : 22}
                         style={{ color: service.accent, transition: 'all 0.6s ease' }}
                      />
                    </div>

                    {/* Badge */}
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="self-start mb-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                        style={{
                          background: `${service.accent}15`,
                          color: service.accent,
                          border: `1px solid ${service.accent}`,
                        }}
                      >
                        Featured
                      </motion.span>
                    )}

                    {/* Title */}
                    <h3
                      className="font-bold mb-2 leading-tight"
                      style={{ fontSize: isActive ? '1.15rem' : '1rem', transition: 'font-size 0.4s ease', color: '#111827' }}
                    >
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="leading-relaxed mb-auto"
                      style={{ fontSize: isActive ? '0.82rem' : '0.75rem', lineClamp: 2, color: '#6B7280' }}
                    >
                      {service.desc}
                    </p>

                    {/* Learn More */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="mt-5"
                      >
                        <Link
                          to={`/services/${service.slug}`}
                          className="group inline-flex items-center gap-2 rounded-[12px] px-5 py-3 text-sm font-semibold transition-all duration-300"
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
                          Learn More
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex flex-col items-center gap-6 mt-8 px-4">
        {/* Arrows + Dots row */}
        <div className="flex items-center gap-6">
          {/* Prev */}
          <button
            onClick={prev}
            className="group flex items-center justify-center w-12 h-12 rounded-full transition-all focus:outline-none hover:bg-opacity-80"
            style={{
              background: 'rgba(22,163,74,0.1)',
              border: '1px solid rgba(22,163,74,0.2)',
            }}
            aria-label="Previous service"
          >
            <ChevronLeft size={20} style={{ color: '#16A34A' }} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {SERVICES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > active ? 'right' : 'left');
                  setActive(i);
                }}
                className="rounded-full transition-all focus:outline-none"
                style={{
                  width: i === active ? '28px' : '8px',
                  height: '8px',
                  background:
                    i === active
                      ? activeService.accent
                      : 'rgba(22,163,74,0.2)',
                  transition: 'all 0.4s ease',
                }}
                aria-label={`Go to service ${i + 1}`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            className="group flex items-center justify-center w-12 h-12 rounded-full transition-all focus:outline-none hover:bg-opacity-80"
            style={{
              background: 'rgba(22,163,74,0.1)',
              border: '1px solid rgba(22,163,74,0.2)',
            }}
            aria-label="Next service"
          >
            <ChevronRight size={20} style={{ color: '#16A34A' }} />
          </button>
        </div>

        {/* Service name indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: activeService.accent }}
            >
              {active + 1} / {total} — {activeService.title}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* View all link */}
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-bold transition-all"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#16A34A';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#6B7280';
          }}
        >
          View All Services
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};