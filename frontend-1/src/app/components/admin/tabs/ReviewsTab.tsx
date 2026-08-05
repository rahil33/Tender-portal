import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import type { Review } from '../types';

export function ReviewsTab({
  reviews,
  onDelete,
}: {
  reviews: Review[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <Star size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No reviews yet.</p>
        </div>
      ) : reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.company} · {r.service} · {r.date}</p>
                </div>
                <div className="flex items-center gap-0.5 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.message}</p>
            </div>
            <button
              onClick={() => onDelete(r.id)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
