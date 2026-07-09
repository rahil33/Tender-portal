import React from 'react';
import { Link } from 'react-router';
import { Clock, Award, ShieldCheck, ArrowRight } from 'lucide-react';

export const GetStartedToday: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-white border-b border-[#E5E7EB]">
      {/* Decorative elements */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-20" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111827] mb-4">
            Get Started Today
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Partner with India's most trusted tender consultancy and unlock government opportunities
          </p>
        </div>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Column 1: Pricing */}
          <div className="rounded-2xl p-8 transition-all hover:-translate-y-1 duration-300 bg-white border border-[#E5E7EB] hover:border-[#111827] shadow-sm hover:shadow-md">
            <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <Clock size={28} className="text-[#111827]" />
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-3">Flexible Pricing</h3>
            <div className="mb-4">
              <div className="text-4xl font-extrabold mb-2 text-[#2563EB]">
                ₹8,000 - ₹20,000
              </div>
              <p className="text-[#6B7280] text-sm">per month</p>
            </div>
            <div className="space-y-3 text-[#6B7280] text-sm font-medium">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 flex-shrink-0" />
                <span>Ongoing service support</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 flex-shrink-0" />
                <span>No hidden charges</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 flex-shrink-0" />
                <span>Pay-per-service options available</span>
              </div>
            </div>
          </div>

          {/* Column 2: CTA */}
          <div className="rounded-2xl p-8 transition-all hover:-translate-y-1 duration-300 flex flex-col justify-center items-center text-center bg-[#F8FAFC] border-2 border-[#111827] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-[#111827] relative z-10 shadow-sm">
              <Award size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-3 relative z-10">10+ Years Experience</h3>
            <p className="text-[#6B7280] leading-relaxed mb-6 relative z-10 font-medium">
              Proven track record with 500+ successful projects across central and state departments.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 group bg-[#111827] text-white hover:bg-[#2563EB] shadow-md relative z-10"
            >
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Column 3: Compliance */}
          <div className="rounded-2xl p-8 transition-all hover:-translate-y-1 duration-300 flex flex-col bg-white border border-[#E5E7EB] hover:border-[#111827] shadow-sm hover:shadow-md">
            <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <ShieldCheck size={28} className="text-[#111827]" />
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-3">100% Compliance</h3>
            <p className="text-[#6B7280] mb-4 leading-relaxed font-medium">
              ISO-certified processes ensuring complete adherence to government regulations.
            </p>
            <div className="space-y-3 text-[#6B7280] text-sm font-medium">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                <span>ISO 9001:2015 certified processes</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                <span>Expert legal & compliance team</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                <span>100% document accuracy guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-[#6B7280] text-sm">
            *Pricing varies based on service type and project complexity. Contact us for a detailed quote.
          </p>
        </div>
      </div>
    </section>
  );
};