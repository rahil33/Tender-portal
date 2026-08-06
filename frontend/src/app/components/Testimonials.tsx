import React, { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'CEO, Tech Solutions Pvt Ltd',
    company: 'Maharashtra',
    rating: 5,
    text: 'Phoenix Tender Tech transformed our tendering process. We went from winning 2-3 tenders per year to consistently securing 15+ government contracts. Their expertise in GeM and compliance is unmatched.',
    avatar: 'RK',
    color: '#111827',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Director, Green Infrastructure',
    company: 'Delhi NCR',
    rating: 5,
    text: 'The team\'s attention to detail and understanding of government procedures saved us countless hours. Their GeM registration service was seamless, and we were bidding within a week!',
    avatar: 'PS',
    color: '#2563EB',
  },
  {
    id: 3,
    name: 'Amit Patel',
    role: 'Founder, Industrial Equipment Co',
    company: 'Gujarat',
    rating: 5,
    text: 'Outstanding service! From OEM panel setup to catalogue management, everything was handled professionally. We\'ve seen a 300% increase in our tender success rate.',
    avatar: 'AP',
    color: '#111827',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    role: 'Manager, Healthcare Solutions',
    company: 'Karnataka',
    rating: 5,
    text: 'Professional, responsive, and results-driven. Phoenix helped us navigate complex tender requirements and secure our first major government contract worth ₹5 crores.',
    avatar: 'SR',
    color: '#2563EB',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    role: 'Operations Head, Logistics Ltd',
    company: 'Rajasthan',
    rating: 5,
    text: 'Their training programs gave our team the confidence to handle tenders independently. The ROI has been phenomenal - we recovered our investment in just 2 months!',
    avatar: 'VS',
    color: '#111827',
  },
];

export const Testimonials: React.FC = () => {
  const [active, setActive] = useState(0);
  const total = TESTIMONIALS.length;

  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const currentTestimonial = TESTIMONIALS[active];

  return (
    <section className="py-24 relative overflow-hidden bg-white border-y border-[#E5E7EB]">
      {/* Background decoration */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none bg-blue-50"
      />
      <div 
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none bg-gray-100"
      />
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #111827 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-bold uppercase tracking-widest text-sm mb-4 block text-[#2563EB]">
            Client Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#111827]">
            What Our Clients Say
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Discover how businesses have transformed their tendering success with our expertise
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl p-8 md:p-12 lg:p-16 bg-white border border-[#E5E7EB] shadow-xl"
            >
              {/* Quote Icon */}
              <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl mx-auto bg-[#F8FAFC] border border-[#E5E7EB]">
                <Quote size={32} className="text-[#2563EB]" />
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill="#F59E0B" 
                    stroke="#F59E0B"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-center text-lg md:text-xl leading-relaxed mb-8 text-[#111827] font-medium">
                "{currentTestimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg"
                  style={{ background: currentTestimonial.color }}
                >
                  {currentTestimonial.avatar}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-[#111827]">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm text-[#6B7280]">
                    {currentTestimonial.role}
                  </div>
                  <div className="text-xs font-semibold text-[#2563EB]">
                    {currentTestimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all hover:scale-110 active:scale-95 bg-white border border-[#E5E7EB] shadow-sm hover:border-[#111827]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} className="text-[#111827]" />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === active ? '32px' : '8px',
                    height: '8px',
                    background: i === active ? '#111827' : '#E5E7EB',
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all hover:scale-110 active:scale-95 bg-white border border-[#E5E7EB] shadow-sm hover:border-[#111827]"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} className="text-[#111827]" />
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#F8FAFC] border border-[#E5E7EB]">
            <div className="flex -space-x-2">
              {['#111827', '#2563EB', '#374151', '#1D4ED8', '#4B5563'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  style={{ background: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="font-bold text-[#111827]">
              Join thousands of happy businesses
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};