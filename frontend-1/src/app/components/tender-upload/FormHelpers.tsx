import React from 'react';

export function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-emerald-50 text-[#16A34A]">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-[#111827]">{title}</h2>
    </div>
  );
}

export function FormField({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#374151] mb-2">
        {label} {required && <span className="text-[#16A34A] ml-0.5">*</span>}
        {hint && <span className="font-normal text-[#9CA3AF] ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

/** Same scoped form styles as the original page */
export const uploadFormStyles = `
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid #E5E7EB;
    background: #FFFFFF;
    font-size: 0.875rem;
    color: #111827;
    outline: none;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .form-input:focus {
    border-color: #16A34A;
    box-shadow: 0 0 0 4px rgba(22,163,74,0.1);
  }
  .form-input::placeholder {
    color: #9CA3AF;
  }
`;
