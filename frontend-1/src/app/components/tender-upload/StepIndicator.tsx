import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Step } from './types';

export function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Product Info' },
    { n: 2, label: 'Media & Docs' },
    { n: 3, label: 'Pricing' },
    { n: 4, label: 'Review' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center z-10">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm"
              style={
                s.n < current
                  ? { background: '#16A34A', color: 'white', border: 'none' }
                  : s.n === current
                  ? { background: '#111827', color: 'white', boxShadow: '0 0 0 4px rgba(22,163,74,0.15)' }
                  : { background: 'rgba(255,255,255,0.8)', color: '#6B7280', border: '2px solid rgba(22,163,74,0.2)' }
              }
            >
              {s.n < current ? <CheckCircle size={16} /> : s.n}
            </div>
            <span
              className="text-xs font-semibold mt-2 hidden sm:block"
              style={{ color: s.n === current ? '#111827' : '#6B7280' }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-12 sm:w-20 h-0.5 mb-6"
              style={{ background: s.n < current ? '#16A34A' : 'rgba(22,163,74,0.15)' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
