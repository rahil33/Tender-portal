import React from 'react';
import { Link } from 'react-router';
import { Target, Users, Award, TrendingUp, Shield, Heart, MapPin, Phone, Mail, Linkedin, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{children}</p>
);

export default function AboutPage() {
  const values = [
    { icon: <Shield size={24} />, title: 'Trust & Transparency', desc: 'Complete transparency in services and pricing, building lasting partnerships with our clients.' },
    { icon: <Award size={24} />, title: 'Excellence', desc: 'We strive for excellence in every tender we handle — the highest quality of service delivery.' },
    { icon: <Users size={24} />, title: 'Client-Centric', desc: 'Your success is our success. Services are tailored to your specific business needs and goals.' },
    { icon: <Heart size={24} />, title: 'Commitment', desc: 'Fully committed to helping businesses grow through government procurement opportunities.' },
  ];

  const timeline = [
    { year: '2016', title: 'GeM Started', desc: 'Phoenix Tender Tech began specialising in Government e-Marketplace (GeM) services.' },
    { year: '2018', title: '10,000+ Clients', desc: 'Crossed the milestone of serving 10,000 businesses across India with pan-India operations.' },
    { year: '2020', title: 'Digital Platform', desc: 'Launched online portal for real-time tender tracking and digital consultation services.' },
    { year: '2022', title: 'Industry Recognition', desc: '"Best Tender Consultancy" — Indian SME Association. ISO 9001:2015 certified.' },
    { year: '2024', title: 'Continued Growth', desc: 'Expanding nationwide with 3,800+ sellers and ₹940Cr+ in transactions facilitated.' },
  ];

  const team = [
    { name: 'Rajesh Sharma', role: 'Founder & CEO', exp: '15+ years in Government Procurement', initials: 'RS' },
    { name: 'Priya Patel', role: 'Head of GeM Services', exp: '10+ years in GeM Consultancy', initials: 'PP' },
    { name: 'Amit Kumar', role: 'Tender Specialist', exp: '8+ years in Tender Management', initials: 'AK' },
    { name: 'Sneha Reddy', role: 'Legal Compliance Head', exp: '12+ years in Legal & Compliance', initials: 'SR' },
    { name: 'Vikram Singh', role: 'Training & Support Manager', exp: '7+ years in Client Training', initials: 'VS' },
    { name: 'Anita Desai', role: 'Operations Director', exp: '9+ years in Operations', initials: 'AD' },
  ];

  const stats = [
    { value: '3,800+', label: 'Businesses Served' },
    { value: '₹940Cr+', label: 'Procurement Value' },
    { value: '27', label: 'States Covered' },
    { value: '10+', label: 'Years of Experience' },
  ];

  const story = [
    'Founded in 2016, Phoenix Tender Tech emerged from a simple vision: to democratise access to government procurement opportunities for businesses of all sizes. Our founders, with over 15 years of combined experience in government contracting, recognised the challenges small and medium businesses faced in navigating the complex tender ecosystem.',
    'What started as a small consultancy helping local businesses with tender documentation has grown into a comprehensive platform serving thousands of clients across India. Today, we pride ourselves on being the bridge between ambitious businesses and lucrative government contracts.',
    'Our mission remains unchanged: to simplify the tender process, provide expert guidance, and empower businesses to compete effectively in government procurement. With Phoenix Tender Tech, you gain a strategic partner committed to your long-term success.',
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <motion.div className="max-w-2xl" {...fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              India's Most Trusted<br />Tender Management Partner
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Empowering businesses to unlock government procurement opportunities since 2016 — with expertise, transparency, and a genuine commitment to your growth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="px-6 py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                Work With Us
              </Link>
              <Link to="/services" className="px-6 py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] border-b border-gray-100 py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Eyebrow>Our Journey</Eyebrow>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Story</h2>
              <div className="space-y-5">
                {story.map((p, i) => <p key={i} className="text-gray-500 leading-relaxed text-[15px]">{p}</p>)}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=700&h=520&fit=crop&auto=format"
                alt="Our Team"
                className="w-full rounded-2xl border border-gray-100 shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Eyebrow>Our Milestones</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>A Decade of Growth</h2>
            <p className="text-gray-500 mt-4">From a small consultancy to India's leading tender management platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {timeline.map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-3xl font-bold text-gray-200 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.year}</div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Target size={24} />, title: 'Our Mission', text: 'To empower businesses across India with comprehensive tender management, expert consultation, and unwavering support — simplifying government procurement so our clients can win more contracts and grow sustainably.' },
              { icon: <TrendingUp size={24} />, title: 'Our Vision', text: "To become India's most trusted tender management platform — recognised for integrity, expertise, and client success. A future where every business, regardless of size, can confidently participate in government procurement and thrive." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-6 text-gray-700">{item.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.title}</h2>
                <p className="text-gray-500 leading-relaxed text-[15px]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Eyebrow>What Drives Us</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Core Values</h2>
            <p className="text-gray-500 mt-4">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-gray-200 rounded-2xl p-7 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-5 text-gray-700">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Eyebrow>Meet the Team</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Leadership Team</h2>
            <p className="text-gray-500 mt-4">Experienced professionals dedicated to your success.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map((m, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-28 bg-[#F8FAFC] border-b border-gray-100 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 shadow-sm">{m.initials}</div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.name}</h3>
                  <p className="text-sm font-medium text-gray-600 mb-1">{m.role}</p>
                  <p className="text-xs text-gray-400 mb-4">{m.exp}</p>
                  <button className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-500 hover:bg-gray-100 transition-colors">
                    <Linkedin size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Office ────────────────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-14">
            <Eyebrow>Visit Us</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Office</h2>
            <p className="text-gray-500 mt-4">Located in the heart of Ahmedabad, Gujarat.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-gray-900 mb-7" style={{ fontFamily: 'Poppins, sans-serif' }}>Contact Information</h3>
              <div className="space-y-7">
                {[

                  { icon: <Phone size={18} />, label: 'Phone', lines: ['+91 79 1234 5678', '+91 90 9876 5432'] },
                  { icon: <Mail size={18} />, label: 'Email', lines: ['info@phoenixtender.tech', 'support@phoenixtender.tech'] },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-700 flex-shrink-0">{c.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
                      {c.lines.map((l) => <p key={l} className="text-sm text-gray-600">{l}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-[380px] shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235013.70729429782!2d72.41493152451846!3d23.02047450525931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1647234567890!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-gray-200 bg-[#F8FAFC] px-10 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Join Thousands of Successful Businesses
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Start your journey to winning government tenders with Phoenix Tender Tech by your side.
            </p>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
              Get Started Today <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
