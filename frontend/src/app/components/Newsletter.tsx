import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToNewsletter } from '../../services/blogService';
import { toast } from 'sonner';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await subscribeToNewsletter(email, 'website');
      setSubmitted(true);
      toast.success(result.message || 'Successfully subscribed to newsletter!');
      setEmail('');
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to subscribe. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden bg-[#111827]">
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glowing orbs */}
      <div
        className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 bg-blue-500"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 bg-indigo-500"
        style={{ transform: 'translate(50%, -50%)' }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl mx-auto bg-white/10 border border-white/20 backdrop-blur-sm">
            <Mail size={40} className="text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Never Miss a Tender Opportunity
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            Get instant alerts for relevant tenders, expert insights, and exclusive industry updates delivered to your inbox daily
          </p>

          {/* Form */}
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              >
                <div className="flex-1 relative">
                  <Mail 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" 
                    size={20} 
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-[#111827] bg-white border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap bg-[#2563EB] text-white hover:bg-blue-700 shadow-lg border border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading || submitted}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Subscribing...
                    </>
                  ) : submitted ? (
                    <><CheckCircle size={18} /> Subscribed!</>
                  ) : (
                    <><Send size={18} /> Subscribe</>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
                  <CheckCircle size={36} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Successfully Subscribed!
                </h3>
                <p className="text-gray-300">
                  Check your inbox for a confirmation email
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#16A34A]" />
              <span>Daily tender alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#16A34A]" />
              <span>Expert tips & guides</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#16A34A]" />
              <span>Unsubscribe anytime</span>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            We respect your privacy. Your information will never be shared with third parties.
          </p>
        </div>
      </div>
    </section>
  );
};