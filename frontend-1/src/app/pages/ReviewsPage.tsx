import React, { useState } from 'react';
import { Star, Send, CheckCircle, Shield, MessageSquare } from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-gray-300';

export default function ReviewsPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', email: '', service: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    // In production: POST to backend → triggers email to phoenixtendertech@gmail.com
    setSubmitted(true);
  }

  const services = [
    'GeM Registration',
    'Tender Bidding',
    'Professional Training',
    'Vendor Registration',
    'Compliance Services',
    'OEM Panel Setup',
    'Catalogue Management',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
            Share Your Experience
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-[1.1]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Submit a Review
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Your feedback is important to us. Share your experience with Phoenix Tender Tech — our team reads every review.
          </p>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-20">
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Form — 3 cols */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={36} className="text-[#16A34A]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Thank You, {formData.name.split(' ')[0]}!
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                  Your review has been submitted successfully and forwarded to our team. We appreciate you taking the time to share your experience.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-50 border border-green-100 text-sm font-semibold text-green-700">
                  <Send size={14} /> Review sent to phoenixtendertech@gmail.com
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => { setSubmitted(false); setRating(0); setFormData({ name: '', company: '', email: '', service: '', message: '' }); }}
                    className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                  >
                    Submit another review
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Write a Review</h3>
                  <p className="text-sm text-gray-400">All fields marked * are required.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Rajesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Acme Enterprises Pvt Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Your email will not be published publicly.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Used *</label>
                  <select
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className={inputCls + ' appearance-none cursor-pointer'}
                  >
                    <option value="">Select a service…</option>
                    {services.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Your Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        onMouseEnter={() => setHovered(r)}
                        onMouseLeave={() => setHovered(0)}
                        className="hover:scale-110 transition-transform"
                        aria-label={`${r} star`}
                      >
                        <Star
                          size={30}
                          className={r <= (hovered || rating) ? 'fill-gray-900 text-gray-900' : 'text-gray-200'}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm font-semibold text-gray-500">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                      </span>
                    )}
                  </div>
                  {!rating && (
                    <p className="text-xs text-gray-300 mt-1.5">Click a star to rate</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    minLength={30}
                    placeholder="Describe your experience with our services in detail…"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={inputCls + ' resize-none'}
                  />
                  <p className="text-xs text-gray-300 mt-1.5">Minimum 30 characters.</p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                    I confirm this review is based on my genuine experience with Phoenix Tender Tech. I understand that the review will be sent to the company for internal quality improvement purposes.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!rating}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={15} /> Submit Review
                </button>

                <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
                  <Shield size={11} /> Your review is sent directly to our team — not published publicly.
                </p>
              </form>
            )}
          </div>

          {/* Sidebar info — 2 cols */}
          <div className="lg:col-span-2 space-y-5 pt-2">
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-7">
              <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-5">
                <MessageSquare size={20} className="text-gray-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Why Your Feedback Matters</h3>
              <ul className="space-y-3">
                {[
                  'Helps us continuously improve our services',
                  'Directly read by our leadership team',
                  'Shapes new features and training programs',
                  'Recognised and acted upon within 48 hours',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <CheckCircle size={14} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-7">
              <h4 className="font-bold text-gray-900 mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Review Guidelines</h4>
              <ul className="space-y-2.5 text-xs text-gray-500">
                {[
                  'Be honest and constructive',
                  'Mention the specific service used',
                  'Avoid sharing personal contact details',
                  'Focus on your own experience',
                ].map((g) => (
                  <li key={g} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-xs text-gray-400 mb-2">Reviews are sent to</p>
              <p className="text-sm font-semibold text-gray-900">phoenixtendertech@gmail.com</p>
              <p className="text-xs text-gray-400 mt-2">Response within 1–2 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
