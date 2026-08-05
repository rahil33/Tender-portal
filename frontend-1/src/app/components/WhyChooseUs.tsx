import React from 'react';
import { Award, HeadsetIcon, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FEATURES = [
  {
    icon: Award,
    title: 'Expert GeM Consultants',
    description: 'Certified professionals with deep platform knowledge',
  },
  {
    icon: HeadsetIcon,
    title: 'End-to-End Support',
    description: 'From registration to winning bids, we handle everything',
  },
  {
    icon: TrendingUp,
    title: 'Proven Track Record',
    description: 'Trusted by businesses across Ahmedabad',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-white border-y border-[#E5E7EB]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #E5E7EB 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Animated Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12 relative"
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative rounded-3xl overflow-hidden z-10 bg-white border border-[#E5E7EB] shadow-xl"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvcnBvcmF0ZSUyMHBhcnRuZXJzaGlwfGVufDF8fHx8MTc3NTE1MDI2OXww&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Corporate Business Partnership"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-80" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md mb-3 bg-white/20 border border-white/30 shadow-sm">
                  <ShieldCheck size={18} className="text-white" />
                  <span className="text-white font-bold text-sm">Government Verified</span>
                </div>
                <h4 className="text-white text-xl font-bold">Trusted by 500+ Enterprises</h4>
              </div>
            </motion.div>

            {/* Decorative background elements for image */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none bg-blue-400"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none bg-gray-400"
            />
          </motion.div>

          {/* Content Side */}
          <div className="w-full lg:w-7/12">
            <div className="text-left mb-10">
              <span className="font-bold uppercase tracking-widest text-sm mb-4 block text-[#2563EB]">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#111827]">
                Your Success Partner
              </h2>
              <p className="text-lg text-[#6B7280]">
                Comprehensive tender management solutions backed by expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300 flex flex-col items-start bg-white border border-[#E5E7EB] hover:border-[#111827] shadow-sm hover:shadow-md"
                  >
                    <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827]">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-[#111827]">
                      {feature.title}
                    </h3>

                    <p className="leading-relaxed text-sm text-[#6B7280]">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Simple trust bar */}
            <div className="mt-10 flex flex-wrap gap-4 md:gap-8 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <span className="text-[#16A34A]">✓</span> ISO 9001:2015 Certified
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <span className="text-[#16A34A]">✓</span> GeM Authorized
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <span className="text-[#16A34A]">✓</span> 10+ Years Exp.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
