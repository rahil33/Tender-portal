import React from 'react';
import { TenderList } from '../components/TenderList';
import { Search } from 'lucide-react';

export default function TendersPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-20 relative">
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[80px] opacity-50 pointer-events-none -z-10" />

        <h1 className="text-4xl font-bold mb-4" style={{ color: '#111827' }}>Live Tenders</h1>
        <p className="mb-8" style={{ color: '#6B7280' }}>Browse and search from thousands of active tender opportunities</p>
        
        {/* Search and Filter Section */}
        <div className="p-6 rounded-[24px] mb-8 glass-card"
          style={{ 
            background: 'rgba(255,255,255,0.7)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)' 
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Search by keywords..." 
              className="p-3 rounded-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
            />
            <select className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none">
              <option>All States</option>
              <option>Maharashtra</option>
              <option>Gujarat</option>
              <option>Delhi</option>
              <option>Karnataka</option>
            </select>
            <select className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none">
              <option>All Categories</option>
              <option>Construction</option>
              <option>IT Services</option>
              <option>Medical Equipment</option>
              <option>Office Supplies</option>
            </select>
            <button className="p-3 rounded-[12px] font-bold transition-all flex items-center justify-center gap-2 text-white hover:-translate-y-0.5 active:scale-95"
              style={{ background: '#16A34A', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}>
              <Search size={20} />
              Search
            </button>
          </div>
        </div>

        <TenderList />
      </div>
    </div>
  );
}