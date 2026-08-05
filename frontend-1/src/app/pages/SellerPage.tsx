import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  User, Mail, Lock, Phone, Building, Eye, EyeOff,
  ShoppingBag, Users, TrendingUp, Shield, ArrowRight,
  CheckCircle, UploadCloud, BarChart2, Bell,
} from 'lucide-react';

type AuthTab = 'login' | 'register';
type AccountType = 'seller' | 'customer';

/* ── Shared form field ───────────────────────────── */
function Field({ icon, label, type, placeholder, required = false }: {
  icon: React.ReactNode; label: string; type: string; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}{required && ' *'}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
        <input type={type} placeholder={placeholder} required={required}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300" />
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────── */
export default function SellerPage() {
  const [tab, setTab] = useState<AuthTab>('login');
  const [accountType, setAccountType] = useState<AccountType>('seller');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === 'login') navigate(accountType === 'seller' ? '/seller/dashboard' : '/');
    }, 1100);
  };

  const stats = [
    { icon: <ShoppingBag size={20} />, value: '12,400+', label: 'Active Tenders' },
    { icon: <Users size={20} />, value: '3,800+', label: 'Registered Sellers' },
    { icon: <TrendingUp size={20} />, value: '₹940Cr+', label: 'GMV Closed' },
    { icon: <Shield size={20} />, value: '100%', label: 'Secure Portal' },
  ];

  const benefits = [
    { icon: <UploadCloud size={18} />, text: 'Upload tenders and product catalogues in minutes' },
    { icon: <BarChart2 size={18} />, text: 'Real-time tender status tracking dashboard' },
    { icon: <Users size={18} />, text: 'Connect with thousands of verified government buyers' },
    { icon: <Bell size={18} />, text: 'Automated notifications for every bid and sale' },
    { icon: <CheckCircle size={18} />, text: 'Dedicated seller success manager included' },
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 mb-7">
            Seller Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-5 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sell Smarter to the Government
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-12">
            List products, upload tenders, track sales, and manage your entire government procurement business from one clean dashboard.
          </p>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:shadow-sm transition-all">
                <div className="flex justify-center mb-2 text-gray-500">{s.icon}</div>
                <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Auth + Benefits ───────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-14 items-start">

            {/* Auth card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              {/* Tab switcher */}
              <div className="flex p-1 rounded-xl bg-gray-50 border border-gray-100 mb-7">
                {(['login', 'register'] as AuthTab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      tab === t ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'
                    }`}>
                    {t === 'login' ? 'Login' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Account type */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Account Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['seller', 'customer'] as AccountType[]).map((type) => (
                    <button key={type} onClick={() => setAccountType(type)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                        accountType === type
                          ? 'border-gray-900 bg-gray-50 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                      }`}>
                      {type === 'seller' ? '🏪 Seller / Vendor' : '🛍️ Buyer / Customer'}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'register' && (
                  <>
                    <Field icon={<User size={16} />} label="Full Name" type="text" placeholder="Rajesh Kumar" required />
                    <Field
                      icon={<Building size={16} />}
                      label={accountType === 'seller' ? 'Company / Business Name' : 'Organisation Name'}
                      type="text"
                      placeholder="Acme Enterprises Pvt Ltd"
                    />
                    <Field icon={<Phone size={16} />} label="Phone Number" type="tel" placeholder="+91 98765 43210" required />
                    {accountType === 'seller' && (
                      <Field icon={<ShoppingBag size={16} />} label="GST Number" type="text" placeholder="22AAAAA0000A1Z5" />
                    )}
                  </>
                )}

                <Field icon={<Mail size={16} />} label="Email Address" type="email" placeholder="you@company.com" required />

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {tab === 'login' && (
                  <div className="text-right -mt-1">
                    <button type="button" className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm mt-1">
                  {loading ? 'Please wait…'
                    : tab === 'login'
                    ? `Sign In as ${accountType === 'seller' ? 'Seller' : 'Customer'}`
                    : `Create ${accountType === 'seller' ? 'Seller' : 'Customer'} Account`}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                {tab === 'login' ? "Don't have an account? " : 'Already registered? '}
                <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                  className="font-semibold text-gray-700 hover:text-gray-900 transition-colors underline underline-offset-2">
                  {tab === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>

            {/* Benefits */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Why Sell With Phoenix</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-7 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Everything a seller needs,<br />in one place
              </h2>
              <ul className="space-y-4 mb-9">
                {benefits.map((b) => (
                  <li key={b.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 mt-0.5">
                      {b.icon}
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed pt-1.5">{b.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/seller/dashboard"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                  Go to Dashboard <ArrowRight size={15} />
                </Link>
                <Link to="/seller/upload"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Upload a Tender <ArrowRight size={15} />
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex flex-wrap gap-6">
                  {[
                    { value: '3,800+', label: 'Active Sellers' },
                    { value: '98%', label: 'Satisfaction Rate' },
                    { value: '24h', label: 'Avg Approval Time' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center rounded-2xl bg-[#F8FAFC] border border-gray-200 px-10 py-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ready to start selling to the government?
            </h2>
            <p className="text-gray-500 mb-7 text-sm leading-relaxed">
              Join 3,800+ sellers who trust Phoenix Tender Tech to manage their government procurement business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setTab('register'); setAccountType('seller'); window.scrollTo({ top: 600, behavior: 'smooth' }); }}
                className="px-7 py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                Register as Seller
              </button>
              <Link to="/contact"
                className="px-7 py-3.5 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
