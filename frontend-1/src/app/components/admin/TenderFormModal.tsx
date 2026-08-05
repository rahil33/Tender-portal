import React, { useState, useCallback } from 'react';
import { X, CheckCircle, Save, RotateCcw } from 'lucide-react';
import type { Tender } from './types';
import { useEscapeKey } from '../../hooks/useEscapeKey';

export function TenderFormModal({ tender, onSave, onClose }: {
  tender: Partial<Tender> | null;
  onSave: (t: Partial<Tender>, original: Partial<Tender> | null) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Tender>>(tender ?? {});
  const [saved, setSaved] = useState(false);
  const handleClose = useCallback(() => onClose(), [onClose]);
  useEscapeKey(handleClose);

  function handleSave() { setSaved(true); setTimeout(() => { onSave(form, tender); onClose(); }, 600); }
  function handleUndo() { setForm(tender ?? {}); }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-300';
  const titleId = 'tender-form-title';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 id={titleId} className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {tender?.id ? 'Edit Tender' : 'Add New Tender'}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={16} aria-hidden="true" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tender Title *</label>
            <input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Supply of IT Equipment" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Authority *</label>
              <input value={form.authority ?? ''} onChange={(e) => setForm({ ...form, authority: e.target.value })} placeholder="Issuing authority" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
              <input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="IT Services, Construction…" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estimated Value</label>
              <input value={form.value ?? ''} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="₹10,00,000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline ?? ''} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
            <select value={form.status ?? 'Draft'} onChange={(e) => setForm({ ...form, status: e.target.value as Tender['status'] })} className={inputCls + ' cursor-pointer appearance-none'}>
              <option>Active</option><option>Draft</option><option>Closed</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-7">
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saved ? <><CheckCircle size={15} aria-hidden="true" /> Saved!</> : <><Save size={15} aria-hidden="true" /> Save Changes</>}
          </button>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={14} aria-hidden="true" /> Undo
          </button>
        </div>
      </div>
    </div>
  );
}
