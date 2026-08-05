import React from 'react';

export function Badge({ label }: { label: string }) {
  const map: Record<string, string> = {
    Active: 'bg-green-50 text-green-700 border-green-100',
    Paid: 'bg-green-50 text-green-700 border-green-100',
    Closed: 'bg-gray-100 text-gray-500 border-gray-200',
    Draft: 'bg-amber-50 text-amber-600 border-amber-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Suspended: 'bg-red-50 text-red-600 border-red-100',
    Failed: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[label] ?? 'bg-gray-100 text-gray-500'}`}>
      {label}
    </span>
  );
}
