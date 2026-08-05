import React, { useState, useEffect, useCallback } from 'react';
import { Award, ShieldCheck, FileCheck, Fingerprint, Rocket, Globe, Building2, Leaf, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CERTIFICATES = [
  {
    icon: Building2,
    title: 'GST Registration',
    desc: 'Complete assistance in obtaining GSTIN for government tendering portals, e-procurement, and maintaining periodic compliance.',
    type: 'Gov Tendering Portal',
    accent: '#111827',
  },
  {
    icon: Award,
    title: 'ISO Certification',
    desc: 'Enhance your brand value and operational efficiency with ISO 9001, 14001, 27001, and 45001 certifications.',
    type: 'International Standards',
    accent: '#2563EB',
  },
  {
    icon: ShieldCheck,
    title: 'NSIC Registration',
    desc: 'Get exemption from Earnest Money Deposit (EMD) and participate in the government stores purchase programme.',
    type: 'Tender Benefits',
    accent: '#111827',
  },
  {
    icon: Globe,
    title: 'Import Export Code',
    desc: 'Essential 10-digit IEC code for businesses looking to expand globally and engage in import/export activities.',
    type: 'Trade',
    accent: '#2563EB',
  },
  {
    icon: Fingerprint,
    title: 'Digital Signature (DSC)',
    desc: 'Class 3 DSC for e-tendering, e-filing of Income Tax, ROC, and GST. Secure your online business transactions.',
    type: 'Compliance',
    accent: '#111827',
  },
  {
    icon: Building2,
    title: 'GST Registration',
    desc: 'Full GST registration support — obtaining GSTIN, filing assistance, and ongoing compliance management for your business.',
    type: 'Taxation',
    accent: '#2563EB',
  },
  {
    icon: Rocket,
    title: 'Startup India',
    desc: 'Get tax exemptions, access to government funds, and relaxed norms for public procurement tenders under DPIIT recognition.',
    type: 'Recognition',
    accent: '#111827',
  },
  {
    icon: Leaf,
    title: 'ZED Certificate',
    desc: 'Zero Defect Zero Effect certification for MSMEs — quality benchmarks, environmental compliance, and preference in government procurement.',
    type: 'Quality & Environment',
    accent: '#16A34A',
  },
];

function getOffset(idx: number, active: number, total: number) {
  let o = idx - active;
  if (o > total / 2) o -= total;
  if (o < -total / 2) o += total;
  return o;
}

function cardTransform(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  if (abs > 2) return { opacity: 0, pointerEvents: 'none', zIndex: 0 };

  const map: Record<number, { x: number; scale: number; opacity: number; zIndex: number }> = {
    0: { x: 0,   scale: 1.05, opacity: 1,    zIndex: 10 },
    1: { x: 260, scale: 0.95, opacity: 0.75, zIndex: 6  },
    2: { x: 480, scale: 0.85, opacity: 0.0,  zIndex: 3  },
  };
  const c = map[abs];
  return {
    transform: `translateX(${offset < 0 ? -c.x : c.x}px) scale(${c.scale})`,
    opacity: c.opacity,
    zIndex: c.zIndex,
    pointerEvents: abs === 0 ? 'auto' : 'none',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  };
}

const CertificateCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const total = CERTIFICATES.length;

  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next]);

  const cur = CERTIFICATES[active];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Stage */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '320px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {CERTIFICATES.map((cert, i) => {
            const offset = getOffset(i, active, total);
            const Icon = cert.icon;
            const isActive = offset === 0;

            return (
              <div
                key={i}
                className="absolute cursor-pointer"
                style={{
                  width: '250px',
                  ...cardTransform(offset),
                }}
                onClick={() => !isActive && setActive(i)}
              >
                <div
                  className="rounded-2xl flex flex-col p-6 h-[270px] relative overflow-hidden bg-white border border-[#E5E7EB]"
                  style={{
                    boxShadow: isActive 
                      ? '0 12px 24px -4px rgba(17, 24, 39, 0.1)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                    borderColor: isActive ? cert.accent : '#E5E7EB',
                  }}
                >
                  {/* Top accent line */}
                  {isActive && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                      style={{ background: cert.accent }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="mb-4 flex items-center justify-center rounded-xl flex-shrink-0 relative z-10 bg-[#F8FAFC] border border-[#E5E7EB]"
                    style={{
                      width: '52px',
                      height: '52px',
                      background: isActive ? cert.accent : '#F8FAFC',
                      borderColor: isActive ? cert.accent : '#E5E7EB',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon size={26} style={{ color: isActive ? '#FFFFFF' : '#6B7280' }} />
                  </div>

                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider mb-2 block relative z-10"
                    style={{ color: isActive ? cert.accent : '#6B7280' }}
                  >
                    {cert.type}
                  </span>

                  <h3
                    className="font-bold mb-2 leading-tight relative z-10 text-[#111827]"
                    style={{ 
                      fontSize: isActive ? '1.1rem' : '0.95rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {cert.title}
                  </h3>
                  <p 
                    className="leading-relaxed mb-auto relative z-10 line-clamp-3 text-[#6B7280]" 
                    style={{ 
                      fontSize: '0.8rem',
                      lineHeight: '1.5',
                    }}
                  >
                    {cert.desc}
                  </p>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="mt-4 flex-shrink-0 relative z-10"
                    >
                      <button
                        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-all duration-300 bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] hover:border-[#111827] w-full justify-center"
                      >
                        Learn More <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={prev}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#111827]"
          aria-label="Previous"
        >
          <ChevronLeft size={18} className="text-[#111827]" />
        </button>

        <div className="flex items-center gap-2">
          {CERTIFICATES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === active ? '28px' : '8px',
                height: '8px',
                background: i === active ? cur.accent : '#E5E7EB',
              }}
              aria-label={`Go to certificate ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#111827]"
          aria-label="Next"
        >
          <ChevronRight size={18} className="text-[#111827]" />
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
          className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B7280]"
        >
          {active + 1} / {total} — <span style={{ color: cur.accent }}>{cur.title}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export const CertificateServices: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="font-bold uppercase tracking-[0.15em] text-sm mb-4 block text-[#2563EB]">
            Compliance & Certifications
          </span>
          <h2 className="text-4xl font-bold mb-6 text-[#111827]">
            Business Certificates We Provide
          </h2>
          <p className="max-w-[600px] mx-auto leading-relaxed text-[#6B7280]">
            Boost your eligibility for high-value tenders with the right certifications. Our legal experts handle the entire documentation and registration process for you.
          </p>
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-green-50 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-semibold text-green-700">All services completed on the same day</span>
          </div>
        </div>

        {/* Carousel */}
        <div className="max-w-[900px] mx-auto mb-16">
          <CertificateCarousel />
        </div>

        {/* Banner */}
        <div className="mt-16 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-white border border-[#E5E7EB] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="max-w-xl text-center md:text-left relative z-10">
            <h3 className="text-2xl font-bold mb-3 text-[#111827]">
              Need help deciding which certificate is right for you?
            </h3>
            <p className="text-sm md:text-base leading-relaxed text-[#6B7280]">
              Our consultants provide a free assessment of your business profile and suggest necessary certifications for your industry.
            </p>
          </div>
          <button className="whitespace-nowrap px-8 py-4 font-bold rounded-lg transition-all duration-300 bg-[#111827] text-white hover:bg-[#2563EB] shadow-md relative z-10">
            Get Certified Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default CertificateServices;