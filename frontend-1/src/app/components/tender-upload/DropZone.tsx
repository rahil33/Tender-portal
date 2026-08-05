import React, { useState, useRef } from 'react';
import { FileText, Image, X } from 'lucide-react';
import type { UploadedFile } from './types';

export function DropZone({
  label, accept, hint, onAdd, files, onRemove, icon,
}: {
  label: string;
  accept: string;
  hint: string;
  onAdd: (f: UploadedFile[]) => void;
  files: UploadedFile[];
  onRemove: (i: number) => void;
  icon: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const simulate = () => {
    const names =
      accept === '.pdf'
        ? ['TenderSpec_v2.pdf', 'ProductCatalogue.pdf', 'ComplianceCert.pdf']
        : ['product_front.jpg', 'product_side.jpg', 'product_detail.png', 'packaging.jpg'];
    const picked = names[Math.floor(Math.random() * names.length)];
    onAdd([{ name: picked, size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`, type: accept === '.pdf' ? 'pdf' : 'image' }]);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-[#111827]">{label}</label>
      <div
        className="rounded-[20px] border-2 border-dashed p-8 text-center cursor-pointer transition-all bg-white hover:bg-emerald-50/50"
        style={{
          borderColor: dragging ? '#16A34A' : 'rgba(22,163,74,0.25)',
          background: dragging ? 'rgba(22,163,74,0.04)' : 'rgba(255,255,255,0.8)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); simulate(); }}
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" accept={accept} className="hidden" multiple onChange={simulate} />
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}
        >
          {icon}
        </div>
        <p className="font-bold text-[#111827] mb-1">Drag & drop or click to browse</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-[12px] bg-white shadow-sm"
              style={{ border: '1px solid rgba(22,163,74,0.15)' }}
            >
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{ background: f.type === 'pdf' ? '#fee2e2' : '#dcfce7', color: f.type === 'pdf' ? '#dc2626' : '#16A34A' }}
              >
                {f.type === 'pdf' ? <FileText size={16} /> : <Image size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827] truncate">{f.name}</p>
                <p className="text-xs text-[#6B7280]">{f.size}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
