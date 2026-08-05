import React from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Tender } from '../types';
import { Badge } from '../Badge';

export function TendersTab({
  tenders,
  search,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
}: {
  tenders: Tender[];
  search: string;
  onSearch: (v: string) => void;
  onAdd: () => void;
  onEdit: (t: Tender) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tenders…"
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all w-72 placeholder:text-gray-300"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Tender
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ID', 'Title', 'Authority', 'Value', 'Status', 'Deadline', 'Bids', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenders.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">{t.id}</td>
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-[180px] truncate">{t.title}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{t.authority}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">{t.value}</td>
                  <td className="px-5 py-4"><Badge label={t.status} /></td>
                  <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{t.deadline}</td>
                  <td className="px-5 py-4 text-gray-500">{t.bids}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
