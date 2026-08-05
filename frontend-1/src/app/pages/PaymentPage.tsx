import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  CheckCircle, CreditCard, Smartphone, Shield, Download,
  ArrowRight, ArrowLeft, Star, Zap, Award, ChevronDown, ChevronUp,
  Clock, FileText, Receipt,
} from 'lucide-react';

type Plan = 'starter' | 'professional' | 'enterprise';
type PayMethod = 'upi' | 'card' | 'netbanking';
type Stage = 'plans' | 'checkout' | 'processing' | 'success';

const plans = [
  {
    id: 'starter' as Plan,
    name: 'Starter',
    price: 2999,
    period: 'month',
    badge: '',
    icon: <Star size={20} />,
    color: '#6B7280',
    features: [
      'Up to 50 tender searches/day',
      'Basic tender alerts',
      'Document download (5/month)',
      'Email support',
    ],
  },
  {
    id: 'professional' as Plan,
    name: 'Professional',
    price: 7999,
    period: 'month',
    badge: 'Most Popular',
    icon: <Zap size={20} />,
    color: '#16A34A',
    features: [
      'Unlimited tender searches',
      'Real-time alerts & notifications',
      'Unlimited document downloads',
      'Bid preparation assistance',
      'Priority support (24/7)',
      'GeM portal access',
    ],
  },
  {
    id: 'enterprise' as Plan,
    name: 'Enterprise',
    price: 19999,
    period: 'month',
    badge: 'Best Value',
    icon: <Award size={20} />,
    color: '#7C3AED',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom tender tracking',
      'API access',
      'White-label reports',
      'Training sessions included',
    ],
  },
];

const paymentHistory = [
  { id: 'INV-2026-0312', date: 'Mar 12, 2026', plan: 'Professional', amount: 7999, status: 'Paid' },
  { id: 'INV-2026-0212', date: 'Feb 12, 2026', plan: 'Professional', amount: 7999, status: 'Paid' },
  { id: 'INV-2026-0112', date: 'Jan 12, 2026', plan: 'Starter', amount: 2999, status: 'Paid' },
];

const inputCls =
  'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-gray-300';

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('professional');
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [stage, setStage] = useState<Stage>('plans');
  const [upiId, setUpiId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState<string | null>(null);

  const plan = plans.find((p) => p.id === selectedPlan)!;

  function startCheckout() { setStage('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function processPayment(e: React.FormEvent) {
    e.preventDefault();
    setStage('processing');
    setTimeout(() => setStage('success'), 2200);
  }
  function downloadInvoice(id: string) {
    setInvoiceDownloaded(id);
    setTimeout(() => setInvoiceDownloaded(null), 3000);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1100px] mx-auto px-4 py-16">

        {/* ── Success Screen ── */}
        {stage === 'success' && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
              <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-[#16A34A]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Payment Successful!
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                Your <strong className="text-gray-900">{plan.name}</strong> plan is now active.
              </p>
              <p className="text-xs text-gray-400 mb-8">A confirmation email has been sent to your registered address.</p>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono font-semibold text-gray-900">TXN-{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Plan</span>
                  <span className="font-semibold text-gray-900">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valid Until</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => downloadInvoice('new')}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
                >
                  {invoiceDownloaded === 'new' ? <><CheckCircle size={15} /> Invoice Saved!</> : <><Download size={15} /> Download Invoice</>}
                </button>
                <Link to="/tenders" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Browse Tenders <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Processing Screen ── */}
        {stage === 'processing' && (
          <div className="max-w-sm mx-auto text-center mt-20">
            <div className="w-20 h-20 border-4 border-gray-100 border-t-[#16A34A] rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Processing Payment…</h2>
            <p className="text-sm text-gray-400">Please do not close or refresh this page.</p>
          </div>
        )}

        {/* ── Plans ── */}
        {stage === 'plans' && (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 mb-5">
                Pricing
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Simple, transparent pricing
              </h1>
              <p className="text-gray-400 max-w-md mx-auto text-sm">
                Choose a plan that fits your business. All plans include a 7-day free trial.
              </p>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {plans.map((p) => {
                const active = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative bg-white rounded-2xl border-2 p-7 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      active ? 'border-[#16A34A] shadow-md' : 'border-gray-200 hover:-translate-y-0.5'
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                        style={{ background: p.color }}>
                        {p.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15`, color: p.color }}>
                        {p.icon}
                      </div>
                      <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{p.name}</h3>
                    </div>
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>₹{p.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-400">/ {p.period}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">+ 18% GST</p>
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: p.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors ${
                      active ? 'text-white' : 'border border-gray-200 text-gray-700 bg-gray-50'
                    }`} style={active ? { background: p.color } : {}}>
                      {active ? 'Selected' : 'Select Plan'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mb-12">
              <button
                onClick={startCheckout}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm bg-[#16A34A] text-white hover:bg-[#15803D] hover:-translate-y-0.5 transition-all shadow-lg"
                style={{ boxShadow: '0 8px 24px rgba(22,163,74,0.25)' }}
              >
                Continue with {plan.name} Plan — ₹{plan.price.toLocaleString()}/mo <ArrowRight size={16} />
              </button>
              <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Shield size={12} /> Secured by Razorpay · 100% safe · Cancel anytime
              </p>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt size={18} className="text-gray-500" />
                  <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment History</span>
                </div>
                {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showHistory && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Invoice', 'Date', 'Plan', 'Amount', 'Status', ''].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paymentHistory.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-gray-600">{row.id}</td>
                            <td className="px-5 py-4 text-gray-500 text-xs">{row.date}</td>
                            <td className="px-5 py-4 font-medium text-gray-900">{row.plan}</td>
                            <td className="px-5 py-4 font-semibold text-gray-900">₹{row.amount.toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">{row.status}</span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => downloadInvoice(row.id)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
                              >
                                {invoiceDownloaded === row.id ? <><CheckCircle size={13} className="text-green-600" /> Saved!</> : <><Download size={13} /> Invoice</>}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Checkout ── */}
        {stage === 'checkout' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStage('plans')} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors font-medium">
              <ArrowLeft size={16} /> Back to Plans
            </button>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Form — 3 cols */}
              <div className="md:col-span-3">
                <form onSubmit={processPayment} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-5">
                  <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Secure Checkout</h2>

                  {/* Payment method tabs */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'upi' as PayMethod, label: 'UPI', icon: <Smartphone size={16} /> },
                        { id: 'card' as PayMethod, label: 'Card', icon: <CreditCard size={16} /> },
                        { id: 'netbanking' as PayMethod, label: 'Net Banking', icon: <FileText size={16} /> },
                      ] as { id: PayMethod; label: string; icon: React.ReactNode }[]).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                            payMethod === m.id
                              ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                              : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                          }`}
                        >
                          {m.icon} {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UPI */}
                  {payMethod === 'upi' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">UPI ID *</label>
                      <input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                        placeholder="yourname@upi"
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 mt-2">Supports all UPI apps: GPay, PhonePe, Paytm, BHIM</p>
                    </div>
                  )}

                  {/* Card */}
                  {payMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cardholder Name *</label>
                        <input required placeholder="As on card" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Card Number *</label>
                        <input required placeholder="1234 5678 9012 3456" maxLength={19} className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry *</label>
                          <input required placeholder="MM / YY" maxLength={7} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">CVV *</label>
                          <input required placeholder="•••" maxLength={3} type="password" className={inputCls} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  {payMethod === 'netbanking' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Bank *</label>
                      <select required className={inputCls + ' appearance-none cursor-pointer'}>
                        <option value="">Choose your bank…</option>
                        {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <input required type="email" placeholder="you@company.com" className={inputCls} />
                  </div>

                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                    <Shield size={14} className="text-[#16A34A] flex-shrink-0" />
                    <p className="text-xs text-green-700">Powered by Razorpay · 256-bit SSL encryption · PCI DSS compliant</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-sm bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors shadow-md flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 8px 24px rgba(22,163,74,0.25)' }}
                  >
                    <Shield size={15} /> Pay ₹{plan.price.toLocaleString()} Securely
                  </button>
                </form>
              </div>

              {/* Order summary — 2 cols */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-5 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Order Summary</h3>
                  <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}15`, color: plan.color }}>
                      {plan.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{plan.name} Plan</p>
                      <p className="text-xs text-gray-400">Billed monthly</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-gray-900">₹{plan.price.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">GST (18%)</span><span className="text-gray-900">₹{Math.round(plan.price * 0.18).toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100"><span className="text-gray-900">Total</span><span className="text-gray-900">₹{Math.round(plan.price * 1.18).toLocaleString()}</span></div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                        <CheckCircle size={12} className="flex-shrink-0 mt-0.5 text-[#16A34A]" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={11} /> 7-day free trial · Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
