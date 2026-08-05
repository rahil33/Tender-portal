import React, { useState } from 'react';
import { Mail, Phone, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const contactMethods = [
    {
      icon: <Mail size={20} />,
      title: 'Email Us',
      desc: 'We reply within 2 business hours.',
      lines: ['phoenixtendertech@gmail.com'],
    },
    {
      icon: <Phone size={20} />,
      title: 'Call Us',
      desc: 'Mon – Fri, 10 AM – 6:30 PM IST.',
      lines: ['+91 96010 05549'],
    },
  ];

  const hours = [
    { day: 'Monday – Friday', time: '10:00 AM – 6:30 PM' },
    { day: 'Saturday', time: '10:00 AM – 4:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
              Contact Us
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Let's Talk
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Have a question, need a quote, or want to explore how Phoenix Tender Tech can help your business? Reach out — our team responds within 2 hours.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-16">

        {/* ── Contact method cards ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {contactMethods.map((m, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-7 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-5 text-gray-700">{m.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{m.desc}</p>
              {m.lines.map((l) => <p key={l} className="text-sm text-gray-600">{l}</p>)}
            </div>
          ))}
        </div>

        {/* ── Form + Sidebar ────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Form — spans 3 cols */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Message Sent!</h3>
                <p className="text-gray-400 text-sm max-w-xs">Thank you for reaching out. Our team will get back to you within 2 business hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Send Us a Message</h2>
                  <p className="text-sm text-gray-400">All fields marked * are required.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name *</label>
                    <input type="text" required placeholder="Rajesh" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name *</label>
                    <input type="text" required placeholder="Kumar" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input type="email" required placeholder="rajesh@company.com" className={inputCls} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <input type="tel" required placeholder="+91 98765 43210" className={inputCls} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                  <input type="text" placeholder="Acme Enterprises Pvt Ltd" className={inputCls} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Interest</label>
                  <select className={inputCls + ' appearance-none cursor-pointer'}>
                    <option value="">Select a service…</option>
                    {['GeM Registration', 'Tender Bidding Support', 'OEM Panel Setup', 'Certificate Services', 'Professional Training', 'Other'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message *</label>
                  <textarea required rows={5} placeholder="Tell us about your requirements and we'll get back to you with a personalised plan…"
                    className={inputCls + ' resize-none'} />
                </div>

                <button type="submit"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <Send size={15} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Sidebar — spans 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Business hours */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-700">
                  <Clock size={18} />
                </div>
                <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Business Hours</h3>
              </div>
              <div className="space-y-0">
                {hours.map((h, i) => (
                  <div key={h.day} className={`flex justify-between items-center py-3 ${i < hours.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-sm font-medium text-gray-700">{h.day}</span>
                    <span className={`text-sm ${h.time === 'Closed' ? 'text-red-400 font-medium' : 'text-gray-500'}`}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp quick help */}
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-700">
                  <MessageCircle size={18} />
                </div>
                <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Instant Support</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                For urgent tender-related queries, our team is available on WhatsApp for immediate assistance.
              </p>
              <a href="https://wa.me/919601005549"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
                <MessageCircle size={15} /> Chat on WhatsApp
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
