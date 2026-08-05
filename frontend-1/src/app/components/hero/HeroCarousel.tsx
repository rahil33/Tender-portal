import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HERO_SERVICES } from './services';

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

export const HeroCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const total = HERO_SERVICES.length;

  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 3800);
    return () => clearInterval(t);
  }, [next]);

  const cur = HERO_SERVICES[active];

  return (
    <div className="w-full flex flex-col items-center" role="region" aria-roledescription="carousel" aria-label="Our services">
      {/* Stage */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '310px',
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
        aria-live="polite"
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
          {HERO_SERVICES.map((svc, i) => {
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
          type="button"
          onClick={prev}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-opacity-80"
          style={{ background: 'rgba(22,163,74,0.1)', border: '1.5px solid rgba(22,163,74,0.3)' }}
          aria-label="Previous service"
        >
          <ChevronLeft size={16} style={{ color: '#16A34A' }} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Service slides">
          {HERO_SERVICES.map((svc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className="rounded-full transition-all"
              aria-label={`Go to ${svc.title}`}
              aria-current={i === active ? 'true' : undefined}
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
          type="button"
          onClick={next}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-opacity-80"
          style={{ background: 'rgba(22,163,74,0.1)', border: '1.5px solid rgba(22,163,74,0.3)' }}
          aria-label="Next service"
        >
          <ChevronRight size={16} style={{ color: '#16A34A' }} aria-hidden="true" />
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
