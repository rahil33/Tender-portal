import React, { useState } from 'react';
import { Link } from 'react-router';
import { MessageCircle, Phone, Mail, ArrowRight, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingModulesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Enquiry submitted successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Expert Tender<br />Consultation
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Get professional guidance on GeM registration, tender bidding, and government procurement. Our experts are here to help you succeed.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://wa.me/919876543210"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <MessageCircle size={18} /> WhatsApp Us
              </a>
              <a 
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Phone size={18} /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="border-b border-gray-100 bg-[#F8FAFC] py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700">
                <MessageCircle size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>WhatsApp</div>
                <div className="text-sm text-gray-500">+91 98765 43210</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                <Phone size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Phone</div>
                <div className="text-sm text-gray-500">+91 98765 43210</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-700">
                <Mail size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Email</div>
                <div className="text-sm text-gray-500">info@phoenixtender.com</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - What We Offer */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How We Can Help
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Our team of experts provides comprehensive support for businesses looking to participate in government procurement and GeM marketplace.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                'GeM Registration & Onboarding',
                'Tender Document Preparation',
                'Bid Submission Support',
                'MSME & ISO Certification Guidance',
                'OEM Authorization on GeM',
                'Post-Bid Follow-up & Support',
                'Training & Capacity Building',
                'Compliance & Regulatory Advice',
              ].map((service, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gradient-to-br from-[#0B3D91] to-[#1e5bb8] text-white rounded-2xl">
              <h3 className="font-bold text-xl mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Why Choose Us?
              </h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>15+ years of experience in government procurement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>5000+ successful tender participations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Dedicated support throughout the process</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Competitive pricing with transparent fees</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Send Us an Enquiry
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Fill in the details below and we'll get back to you within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all resize-none"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Enquiry</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to our{' '}
                <Link to="/privacy" className="text-gray-600 underline">Privacy Policy</Link>
                {' '}and{' '}
                <Link to="/terms" className="text-gray-600 underline">Terms of Service</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}