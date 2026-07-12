import React from 'react';
import { Link } from 'react-router';
import { ShieldCheck, FileText, Send, Users, Laptop, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const SERVICES = [
  {
    icon: Laptop,
    title: 'GeM Registration',
    slug: 'gem-registration',
    desc: 'Seamless registration and catalog management on the Government e-Marketplace (GeM) portal.'
  },
  {
    icon: FileText,
    title: 'Tender Bidding Support',
    slug: 'tender-bidding',
    desc: 'Expert review and preparation of necessary tender documentation to ensure 100% compliance.'
  },
  {
    icon: Send,
    title: 'OEM Panel Setup',
    slug: 'oem-panel',
    desc: 'Original Equipment Manufacturer authorization and panel management on GeM.'
  },
  {
    icon: Zap,
    title: 'Catalogue Management',
    slug: 'catalogue-management',
    desc: 'Professional product listing and profile optimization for maximum visibility.'
  },
  {
    icon: ShieldCheck,
    title: 'Training Services',
    slug: 'training',
    desc: 'Comprehensive training for using GeM portal and tender bidding processes effectively.'
  },
  {
    icon: Users,
    title: 'Consulting Services',
    slug: 'gem-registration',
    desc: 'Expert consultation for all your government procurement needs and strategy.'
  }
];

export const Services: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none bg-blue-50/50 blur-3xl"
        style={{ transform: 'translate(30%,-30%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none bg-gray-50/50 blur-3xl"
        style={{ transform: 'translate(-30%,30%)' }} />

      <div className="max-w-[1200px] mx-auto px-4 text-center relative z-10">
        <span className="text-[#2563EB] font-bold uppercase tracking-widest text-sm mb-4 block">Our Services</span>
        <h2 className="text-4xl font-bold text-[#111827] mb-6">Expert Support for Your Bid Journey</h2>
        <p className="text-[#6B7280] max-w-[700px] mx-auto mb-16 leading-relaxed">
          Beyond just listing tenders, we provide comprehensive support to help your business grow through government and corporate contracts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {SERVICES.map((service, index) => {
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="p-10 rounded-3xl transition-all group relative overflow-hidden bg-white border border-[#E5E7EB] hover:border-[#111827] shadow-sm hover:shadow-xl"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700 bg-[#F8FAFC]" />
                
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 relative z-10 group-hover:-translate-y-1 bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] group-hover:bg-[#111827] group-hover:text-white group-hover:border-[#111827]">
                  <service.icon size={28} strokeWidth={1.5} className="transition-colors" />
                </div>
                
                <h3 className="text-2xl font-bold text-[#111827] mb-4 relative z-10">{service.title}</h3>
                <p className="text-[#6B7280] leading-relaxed mb-8 relative z-10">
                  {service.desc}
                </p>
                
                <Link 
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 relative z-10 bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#111827] hover:text-white"
                >
                  Learn More
                  <Zap size={16} className="transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹ 0',
      period: 'Forever',
      features: ['Daily Tender Summary', 'Basic Search', 'Email Alerts (1 Category)', 'Public Tender Access'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Professional',
      price: '₹ 4,999',
      period: 'per year',
      features: ['Unlimited Search Filters', 'WhatsApp Notifications', 'GEM Portal Assistance', 'DSC Registration Support', 'Document Checklists', 'Bid Value Analysis'],
      cta: 'Subscribe Now',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'per year',
      features: ['Dedicated Account Manager', 'ISO & MSME Consultation', 'Legal Advisory for Bids', 'Joint Venture Matching', 'Priority Document Prep', 'Competitor Analysis'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="max-w-[1200px] mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl font-bold text-[#111827] mb-6">Simple, Transparent Pricing</h2>
        <p className="text-[#6B7280] mb-16">Choose the plan that fits your business needs.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl text-left flex flex-col transition-all hover:scale-[1.02] duration-300 bg-white shadow-md ${plan.popular ? 'border-2 border-[#111827]' : 'border border-[#E5E7EB]'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#111827] shadow-sm">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-[#111827] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[#111827]">{plan.price}</span>
                <span className="text-[#6B7280] text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-[#6B7280]">
                    <ShieldCheck size={18} className="text-[#16A34A] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`w-full block text-center py-3 rounded-lg font-bold transition-all ${
                  plan.popular
                    ? 'bg-[#111827] text-white hover:bg-[#2563EB] shadow-md'
                    : 'bg-white border border-[#E5E7EB] text-[#111827] hover:border-[#111827]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
