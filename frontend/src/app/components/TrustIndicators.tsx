import React from 'react';
import { Users, Award, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const STATS = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Clients',
    color: '#16A34A',
    description: 'Businesses trust us',
  },
  {
    icon: Award,
    value: '10+ Years',
    label: 'Experience',
    color: '#14B8A6',
    description: 'In the industry',
  },
  {
    icon: TrendingUp,
    value: '95%',
    label: 'Success Rate',
    color: '#10B981',
    description: 'Tender wins',
  },
  {
    icon: Shield,
    value: '100%',
    label: 'Compliance',
    color: '#059669',
    description: 'Guaranteed',
  },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden"
      style={{ background: '#F8FAFC' }}
    >
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(22,163,74,0.1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)', transform: 'translate(-50%,-40%)' }}
      />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)', transform: 'translate(30%,30%)' }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className="font-bold uppercase tracking-widest text-sm mb-4 block"
            style={{ color: '#16A34A' }}
          >
            Trusted Nationwide
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#111827]">
            Numbers That Speak for Themselves
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            A decade of excellence in helping businesses succeed in government procurement
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-[24px] p-8 text-center backdrop-blur-[20px] transition-all hover:-translate-y-1 duration-300 shadow-sm hover:shadow-xl"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.8)',
                }}
              >
                {/* Icon */}
                <div 
                  className="mb-6 flex items-center justify-center w-16 h-16 rounded-[16px] mx-auto"
                  style={{
                    background: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`,
                    boxShadow: `0 4px 12px ${stat.color}10`,
                  }}
                >
                  <Icon size={32} style={{ color: stat.color }} />
                </div>

                {/* Value */}
                <div 
                  className="text-4xl md:text-5xl font-extrabold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>

                {/* Label */}
                <div 
                  className="text-xl font-bold mb-2 text-[#111827]"
                >
                  {stat.label}
                </div>

                {/* Description */}
                <p className="text-sm text-[#6B7280]">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Client Logos Section */}
        <div className="mt-20">
          <h3 className="text-center text-xl font-bold mb-10 text-[#6B7280]">
            Trusted by Leading Organizations
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 hover:opacity-100 transition-opacity">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-32 h-16 rounded-[12px] flex items-center justify-center font-bold text-sm backdrop-blur-[20px]"
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  color: '#9CA3AF',
                }}
              >
                CLIENT {i}
              </div>
            ))}
          </div>
        </div>

        {/* Certification Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div 
            className="px-6 py-3 rounded-full font-bold text-sm backdrop-blur-[20px]"
            style={{
              background: 'rgba(22,163,74,0.05)',
              border: '1px solid rgba(22,163,74,0.2)',
              color: '#16A34A',
            }}
          >
            🏆 ISO 9001:2015 Certified
          </div>
          <div 
            className="px-6 py-3 rounded-full font-bold text-sm backdrop-blur-[20px]"
            style={{
              background: 'rgba(20,184,166,0.05)',
              border: '1px solid rgba(20,184,166,0.2)',
              color: '#14B8A6',
            }}
          >
            ⭐ 4.9/5 Client Rating
          </div>
          <div 
            className="px-6 py-3 rounded-full font-bold text-sm backdrop-blur-[20px]"
            style={{
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#10B981',
            }}
          >
            🔒 GDPR Compliant
          </div>
        </div>
      </div>
    </section>
  );
};