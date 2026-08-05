import React, { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

export function ConfirmDelete({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  const handleCancel = useCallback(() => onCancel(), [onCancel]);
  useEscapeKey(handleCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onCancel} role="presentation">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-sm w-full p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" aria-hidden="true" />
        </div>
        <h3 id="confirm-delete-title" className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Delete {label}?</h3>
        <p id="confirm-delete-desc" className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}
