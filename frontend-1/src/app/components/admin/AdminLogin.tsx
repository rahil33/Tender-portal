import React, { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export function AdminLogin({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === 'admin2026') { onAuth(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Access</h2>
        <p className="text-sm text-gray-400 mb-7">Enter the admin password to continue.</p>
        <form onSubmit={submit} className="space-y-4 text-left">
          <input
            type="password"
            required
            placeholder="Admin password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
          />
          {err && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> Incorrect password</p>}
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
            Sign In
          </button>
        </form>
        <p className="text-xs text-gray-300 mt-5">Demo password: admin2026</p>
      </div>
    </div>
  );
}
