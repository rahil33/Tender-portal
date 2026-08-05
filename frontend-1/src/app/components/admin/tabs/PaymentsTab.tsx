import React from 'react';
import { Download } from 'lucide-react';
import { mockPayments } from '../mockData';
import { Badge } from '../Badge';

export function PaymentsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: '₹36,577', sub: 'This month' },
          { label: 'Successful', value: mockPayments.filter((p) => p.status === 'Paid').length, sub: 'Transactions' },
          { label: 'Pending', value: mockPayments.filter((p) => p.status === 'Pending').length, sub: 'Awaiting payment' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xl font-bold text-gray-900 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</p>
            <p className="text-sm font-medium text-gray-700">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Invoice', 'User', 'Plan', 'Amount', 'Date', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">{p.id}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{p.user}</td>
                  <td className="px-5 py-4 text-gray-500">{p.plan}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">₹{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{p.date}</td>
                  <td className="px-5 py-4"><Badge label={p.status} /></td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                      <Download size={13} /> Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
