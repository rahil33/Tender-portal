import React from 'react';
import { Download } from 'lucide-react';
import { analyticsCategories } from '../mockData';

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h3 className="font-bold text-gray-900 mb-5 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Tenders by Category</h3>
          <div className="space-y-4">
            {analyticsCategories.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{c.label}</span>
                  <span className="text-gray-400">{c.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16A34A] transition-all"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h3 className="font-bold text-gray-900 mb-5 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Download Reports</h3>
          <div className="space-y-3">
            {[
              { label: 'Tender Performance Report', sub: 'All tenders · April 2026', format: 'PDF' },
              { label: 'User Activity Report', sub: 'Registration & login data', format: 'XLSX' },
              { label: 'Payment Summary', sub: 'Revenue & invoices · April 2026', format: 'PDF' },
              { label: 'Review Analytics', sub: 'All submitted reviews', format: 'CSV' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                  <Download size={13} /> {r.format}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Downloads', value: '8,240' },
          { label: 'Avg Bids / Tender', value: '9.5' },
          { label: 'Conversion Rate', value: '14.3%' },
          { label: 'Renewal Rate', value: '82%' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
