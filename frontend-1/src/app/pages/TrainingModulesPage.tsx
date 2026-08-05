import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  Play, Download, CheckCircle, Clock, Award, MessageCircle,
  Book, Users, ChevronDown, ChevronUp, ArrowRight, Star, Zap,
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  duration: string;
  lessons: number;
  level: string;
  description: string;
  topics: string[];
  certificate: string;
  students: number;
}

const modules: Module[] = [
  {
    id: '1',
    title: 'Product Upload & Catalogue Management',
    duration: '2 hours',
    lessons: 12,
    level: 'Beginner',
    description: 'Professional catalogue creation and product upload support for GeM sellers. Covers categorisation, specifications, image guidelines, and inventory management.',
    topics: [
      'How to create a product catalogue on GeM',
      'Product categorisation and specification upload',
      'Image optimisation and upload guidelines',
      'Price management and bulk updates',
      'Inventory tracking and management',
    ],
    certificate: 'Product Upload Specialist',
    students: 4200,
  },
  {
    id: '2',
    title: 'Tender Bidding Masterclass',
    duration: '3 hours',
    lessons: 18,
    level: 'Intermediate',
    description: 'Professional guidance on Government Tender Bidding — from reading tender documents to post-bid management with real examples.',
    topics: [
      'Understanding tender and bid documents',
      'BOQ (Bill of Quantity) bid preparation',
      'Technical and financial bid submission',
      'L1 comparison and bid tracking',
      'Post-bid management and follow-up',
    ],
    certificate: 'Tender Bidding Professional',
    students: 3100,
  },
];

const levelStyle: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: '#f0fdf4', text: '#16a34a' },
  Intermediate: { bg: '#eff6ff', text: '#2563eb' },
  Advanced: { bg: '#fef9c3', text: '#ca8a04' },
};

export default function TrainingModulesPage() {
  const [expanded, setExpanded] = useState<string | null>('1');

  const highlights = [
    { icon: <Clock size={22} />, value: '5 Hours', label: 'Total content' },
    { icon: <Award size={22} />, value: '2 Certs', label: 'On completion' },
    { icon: <Users size={22} />, value: '7,300+', label: 'Students enrolled' },
    { icon: <Star size={22} />, value: '4.9 / 5', label: 'Average rating' },
  ];

  const included = [
    'Both Module 1 & 2 (Product Upload + Bidding)',
    'Training support channel',
    'Live weekly Q&A sessions (Zoom / Google Meet)',
    'Professional certification on completion',
    '6 months access to all course materials',
    'PDF guides, Excel templates, and practice exercises',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
              Training Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Professional Training<br />Modules
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Master GeM Portal operations and tender bidding with expert-led, self-paced courses designed to get you winning government contracts faster.
            </p>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
              Enroll Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Highlights strip ──────────────────────────── */}
      <section className="border-b border-gray-100 bg-[#F8FAFC] py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-700">
                  {h.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.value}</div>
                  <div className="text-xs text-gray-500">{h.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-20">

        {/* ── Course Modules ────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Course Modules</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Learn Step by Step</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {modules.map((m) => {
            const lvl = levelStyle[m.level] || { bg: '#f3f4f6', text: '#374151' };
            const isOpen = expanded === m.id;
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                {/* Video thumb */}
                <div className="relative h-44 bg-gray-50 border-b border-gray-100 flex items-center justify-center cursor-pointer group">
                  <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Play size={22} className="text-gray-900 ml-0.5" />
                  </div>
                  <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-t-2xl" />
                  <span className="absolute bottom-3 right-3 text-xs text-gray-400">{m.duration} · {m.lessons} lessons</span>
                </div>

                <div className="p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: lvl.bg, color: lvl.text }}>
                      {m.level}
                    </span>
                    <span className="text-xs text-gray-400">{m.students.toLocaleString()} enrolled</span>
                  </div>

                  <h2 className="font-bold text-gray-900 text-lg mb-3 leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{m.description}</p>

                  {/* Curriculum accordion */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : m.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors mb-3"
                  >
                    <Book size={15} /> Curriculum
                    {isOpen ? <ChevronUp size={15} className="ml-auto text-gray-400" /> : <ChevronDown size={15} className="ml-auto text-gray-400" />}
                  </button>
                  {isOpen && (
                    <ul className="space-y-2 mb-5 pl-1">
                      {m.topics.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-gray-500">
                          <CheckCircle size={13} className="flex-shrink-0 mt-0.5 text-gray-400" /> {t}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Certificate badge */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-5">
                    <Award size={16} className="text-gray-700 flex-shrink-0" />
                    <span className="text-xs text-gray-600 font-medium">Certificate: <span className="text-gray-900 font-semibold">{m.certificate}</span></span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Download size={13} /> PDF guides · Excel templates · Practice exercises included
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── WhatsApp Training ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 mb-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
                <Zap size={13} /> Training Support
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Expert Training Support
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Daily video lessons, PDF worksheets, interactive quizzes, and 1-on-1 instructor support — available on your schedule.
              </p>
              <ul className="space-y-3 mb-7">
                {['Learn at your own pace, anywhere', '24/7 access to all course materials', '1-on-1 instructor support included', 'Live doubt-clearing sessions weekly'].map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-gray-400 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
                <MessageCircle size={16} /> Contact for Training
              </Link>
            </div>
            <div className="h-56 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                <MessageCircle size={28} className="text-gray-700" />
              </div>
              <p className="text-sm text-gray-400">WhatsApp Training Interface</p>
            </div>
          </div>
        </div>

        {/* ── Pricing ──────────────────────────────────── */}
        <div className="bg-[#F8FAFC] rounded-2xl border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 mb-5">
              Complete Package
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Full Training Access
            </h2>
            <div className="flex items-baseline justify-center gap-2 mt-4">
              <span className="text-5xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>₹10,000</span>
              <span className="text-gray-400 text-lg">+ GST</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Total: ₹11,800 (including 18% GST)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>What's Included</h3>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-gray-700 flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Options</h3>
              <div className="space-y-3">
                <div className="bg-white border-2 border-gray-900 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">One-time Payment</span>
                    <span className="font-bold text-gray-900">₹11,800</span>
                  </div>
                  <p className="text-xs text-gray-400">Pay once — 6 months access to all materials</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">EMI Option</span>
                    <span className="font-bold text-gray-600">₹3,933 × 3</span>
                  </div>
                  <p className="text-xs text-gray-400">Easy 3-month instalments, no extra charge</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-4 p-3 rounded-xl bg-white border border-gray-100">
                <CheckCircle size={15} className="text-gray-700 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">Certificate issued on successful completion</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button className="px-10 py-4 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
              Enroll Now — ₹10,000 + GST
            </button>
            <p className="text-xs text-gray-400 mt-3">Limited seats available · Price exclusive of GST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
