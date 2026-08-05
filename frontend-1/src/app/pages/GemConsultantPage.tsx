import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  CheckCircle, Award, Users, TrendingUp, ShieldCheck, Clock,
  ChevronDown, ChevronUp, ArrowRight, FileText, Star,
} from 'lucide-react';

/* ── Shared primitives ───────────────────────────── */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{children}</p>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
    {children}
  </h2>
);

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400';

/* ── FAQ ─────────────────────────────────────────── */
const DocsAnswer = () => (
  <div className="space-y-4 text-sm text-gray-600">
    <div>
      <p className="font-semibold text-gray-800 mb-2">At the time of GeM Registration:</p>
      <ol className="space-y-1.5 pl-1">
        {[
          'Company PAN',
          'Authorised Person PAN Card [Key Person]',
          'Aadhaar Card [Key Person]',
          'GST Certificate',
          'Email ID',
          'Mobile Number',
        ].map((doc, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0 mt-0.5">{i + 1}</span>
            <span>{doc}</span>
          </li>
        ))}
      </ol>
    </div>
    <div className="border-t border-gray-100 pt-4">
      <p className="font-semibold text-gray-800 mb-2">For 100% Profile Completion:</p>
      <ol className="space-y-2 pl-1">
        {[
          { n: 7, content: <span>Bank Account Details <span className="text-gray-400">(Cancelled Cheque)</span></span> },
          { n: 8, content: (
            <div>
              <span>ITR Forms (Last 3 Years)</span>
              <p className="text-xs text-amber-600 mt-1 font-medium">⚠ ITR PDF must be downloaded from the official Income Tax website and should contain the maximum number of pages.</p>
            </div>
          )},
          { n: 9, content: <span>ITR PDF downloaded from the official ITR website</span> },
          { n: 10, content: <span>MSME Certificate <span className="text-gray-400">(Registration Only)</span></span> },
        ].map(({ n, content }) => (
          <li key={n} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0 mt-0.5">{n}</span>
            {content}
          </li>
        ))}
      </ol>
    </div>
  </div>
);

const faqs: { q: string; node?: React.ReactNode; a?: string }[] = [
  { q: 'What is GeM and why should my business register?', a: "Government e-Marketplace (GeM) is India's national public procurement portal. Registration opens access to thousands of tenders worth billions — with no tender fees and simplified processes." },
  { q: 'How long does GeM registration take?', a: 'All services are completed on the same day once all required documents are submitted. Our experts handle everything from document preparation to profile verification.' },
  { q: 'What documents are required for GeM registration?', node: <DocsAnswer /> },
  { q: 'Do you provide ongoing support after registration?', a: 'Yes — we offer catalogue management, bid assistance, order processing guidance, and quarterly account reviews.' },
  { q: 'Can you help with OEM authorization?', a: 'Absolutely. We assist in obtaining OEM authorization letters, panel registration, and maintaining manufacturer compliance.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {faqs.map((f, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden bg-white transition-shadow hover:shadow-sm">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between text-left px-6 py-5 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {f.q}
            </span>
            {open === i
              ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
              : <ChevronDown size={18} className="text-gray-300 flex-shrink-0" />}
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {f.node ?? f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────── */
export default function GemConsultantPage() {
  const services = [
    { title: 'GeM Seller Registration', desc: 'Full GeM seller/buyer registration — document collection, GSTIN linking, bank verification, and profile activation. Completed same day.', icon: <CheckCircle size={22} /> },
    { title: 'Complete Profile Management', desc: 'Ongoing GeM profile management: category selection, profile completion, account maintenance, and compliance checks beyond initial registration.', icon: <Clock size={22} /> },
    { title: 'Assessment Application', desc: 'Application for quality assessment including desktop assessment documentation and step-by-step video assessment guidance.', icon: <Award size={22} /> },
    { title: 'OEM Panel Activation', desc: 'OEM authorization letters, brand listing, panel registration, reseller management, and manufacturer compliance on GeM.', icon: <ShieldCheck size={22} /> },
    { title: 'Catalogue Creation (Products & Services)', desc: 'Professional product and service catalogue creation on GeM — a dedicated service not included in registration. Starting at ₹10,000 + GST.', icon: <TrendingUp size={22} /> },
    { title: 'Brand Listing & Category Support', desc: 'Brand registration on GeM, finding suitable product categories, and product guidance to ensure correct placement and visibility.', icon: <Users size={22} /> },
  ];

  const stats = [
    { value: '2,000+', label: 'Businesses Onboarded' },
    { value: '98%', label: 'Registration Success Rate' },
    { value: 'Same Day', label: 'Service Completion' },
    { value: 'Since 2016', label: 'Serving Businesses' },
  ];

  const steps = [
    { n: '01', title: 'Register', desc: 'Complete GeM registration with all necessary documents handled by our team.' },
    { n: '02', title: 'List', desc: 'Professional catalogue setup with optimized product listings and pricing.' },
    { n: '03', title: 'Bid', desc: 'Expert bid preparation, submission, and technical proposal writing.' },
    { n: '04', title: 'Win', desc: 'Secure government contracts and grow your business with ongoing support.' },
  ];

  const plans = [
    {
      name: 'Basic',
      price: '₹8,000',
      period: 'one-time',
      desc: 'For businesses getting started on GeM.',
      features: ['GeM Registration (Same Day)', 'Profile Setup', 'Email Support', '1-month post-registration support', 'Catalogue Creation: ₹10,000 + GST (separate)', 'MSME Certificate: ₹2,000 + GST (add-on)'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹15,000',
      period: 'per month',
      desc: 'For active sellers with ongoing needs.',
      features: ['Everything in Basic', 'Unlimited Catalogue Management', 'Bid Document Preparation', 'OEM Panel Setup', 'Dedicated Account Manager', 'Priority Support', 'Quarterly Performance Review'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored',
      desc: 'For large organizations with complex needs.',
      features: ['Everything in Pro', 'Multi-category Management', 'Advanced Bid Strategy', 'Contract Negotiation Support', '24/7 Priority Support', 'Monthly Training Sessions', 'Dedicated Team'],
      popular: false,
    },
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
                Expert GeM Consultancy
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-gray-900 leading-[1.1] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                GeM Consultant<br />Services
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-5 max-w-lg">
                Your trusted partner for Government e-Marketplace registration, bidding, and ongoing support. We help businesses unlock procurement opportunities worth crores.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold text-green-700">All services completed on the same day</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/contact"
                  className="px-6 py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                  Get Started Free
                </Link>
                <Link to="/services"
                  className="px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                  View All Services
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['RS', 'PP', 'AK', 'SD'].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">{i}</div>
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#111827" className="text-gray-900" />)}
                </div>
                <span className="text-xs text-gray-500">Trusted by 2,000+ businesses</span>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&h=520&fit=crop&auto=format"
                alt="GeM Consultant team"
                className="w-full rounded-2xl border border-gray-100 shadow-lg"
              />
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white border border-gray-200 rounded-2xl shadow-lg px-5 py-4">
                <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>98%</div>
                <div className="text-xs text-gray-500 mt-0.5">Registration success rate</div>
              </div>
              <div className="absolute -top-5 -right-5 bg-white border border-gray-200 rounded-2xl shadow-lg px-5 py-4">
                <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>3–5 Days</div>
                <div className="text-xs text-gray-500 mt-0.5">Average completion time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────── */}
      <section className="bg-[#F8FAFC] border-b border-gray-100 py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Eyebrow>What We Offer</Eyebrow>
            <SectionTitle>Comprehensive GeM Services</SectionTitle>
            <p className="text-gray-500 mt-4 leading-relaxed">End-to-end solutions covering every aspect of your GeM journey — from day one to ongoing growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <div key={i} className="group rounded-2xl p-7 bg-white border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5 text-gray-700 group-hover:bg-gray-100 transition-colors">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Eyebrow>How It Works</Eyebrow>
            <SectionTitle>Register → List → Bid → Win</SectionTitle>
            <p className="text-gray-500 mt-4">A proven 4-step process to get your business selling to the government.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gray-200" />
            {steps.map((s, i) => (
              <div key={i} className="relative bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-xs font-bold text-gray-300 mb-4 tracking-widest">{s.n}</div>
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-sm mb-5 relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Eyebrow>Transparent Pricing</Eyebrow>
            <SectionTitle>Simple, Flexible Plans</SectionTitle>
            <p className="text-gray-500 mt-4">All prices shown are exclusive of GST.</p>
            <div className="mt-3 inline-flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-left max-w-xl mx-auto">
              <span className="text-amber-600 font-bold text-sm flex-shrink-0">Note:</span>
              <p className="text-sm text-amber-700">All consulting charges are professional service fees only. Any additional government fees, statutory charges, certification fees, or third-party expenses shall be borne separately by the client.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <div key={i}
                className={`rounded-2xl p-8 transition-all relative ${p.popular
                  ? 'bg-gray-900 shadow-xl ring-1 ring-gray-900 scale-[1.02]'
                  : 'bg-white border border-gray-200 hover:shadow-md'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full bg-white text-gray-900 shadow-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: p.popular ? 'white' : '#111827' }}>{p.name}</h3>
                <p className="text-xs mb-5" style={{ color: p.popular ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>{p.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: p.popular ? 'white' : '#111827' }}>{p.price}</span>
                  <span className="text-sm ml-1.5" style={{ color: p.popular ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: p.popular ? 'rgba(255,255,255,0.8)' : '#6B7280' }}>
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: p.popular ? 'rgba(255,255,255,0.5)' : '#374151' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/contact"
                  className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all"
                  style={p.popular
                    ? { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }
                    : { background: '#111827', color: 'white' }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Add-on Services Pricing ──────────────────── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { service: 'Catalogue Creation (Products/Services)', price: '₹10,000 + GST', note: 'Per catalogue, not included in registration' },
              { service: 'MSME Certificate', price: '₹2,000 + GST', note: 'Registration assistance' },
              { service: 'Digital Signature (DSC)', price: 'Contact for price', note: 'Class 3 DSC' },
              { service: 'ZED Certificate', price: 'Contact for price', note: 'Quality & Environment certification' },
            ].map((item) => (
              <div key={item.service} className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Add-on Service</div>
                <div className="font-bold text-gray-900 text-sm mb-1 leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.service}</div>
                <div className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.price}</div>
                <div className="text-xs text-gray-400">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <Eyebrow>Got Questions?</Eyebrow>
              <SectionTitle>GeM FAQs</SectionTitle>
              <p className="text-gray-500 mt-4 mb-8 leading-relaxed">
                Find answers to the most common questions about our GeM registration and consultancy services.
              </p>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                Ask a Question <ArrowRight size={15} />
              </Link>
            </div>
            <FAQ />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] px-10 py-16 text-center max-w-3xl mx-auto">
            <Eyebrow>Get Started</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ready to Start Your GeM Journey?
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Join thousands of successful businesses selling to the government. Our experts will guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact"
                className="px-8 py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                Schedule Free Consultation
              </Link>
              <Link to="/services"
                className="px-8 py-3.5 rounded-xl font-semibold text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                Explore All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
