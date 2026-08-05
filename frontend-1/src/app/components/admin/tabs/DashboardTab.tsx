import React from 'react';
import type { Tender, Tab } from '../types';
import { mockPayments } from '../mockData';
import { Badge } from '../Badge';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub: string;
}

export function DashboardTab({
  tenders,
  stats,
  onNavigate,
}: {
  tenders: Tender[];
  stats: Stat[];
  onNavigate: (tab: Tab) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</p>
            <p className="text-xs font-medium text-gray-700">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Tenders</h3>
          <button onClick={() => onNavigate('tenders')} className="text-xs text-[#16A34A] hover:underline font-medium">View all</button>
        </div>
        <div className="divide-y divide-gray-50">
          {tenders.slice(0, 3).map((t) => (
            <div key={t.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.authority} · Deadline {t.deadline}</p>
              </div>
              <Badge label={t.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Payments</h3>
          <button onClick={() => onNavigate('payments')} className="text-xs text-[#16A34A] hover:underline font-medium">View all</button>
        </div>
        <div className="divide-y divide-gray-50">
          {mockPayments.map((p) => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{p.user}</p>
                <p className="text-xs text-gray-400">{p.plan} · {p.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">₹{p.amount.toLocaleString()}</span>
                <Badge label={p.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
