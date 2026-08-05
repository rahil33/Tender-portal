import React from 'react';
import { Eye } from 'lucide-react';
import { mockUsers } from '../mockData';
import { Badge } from '../Badge';

export function UsersTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Registered Users</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ID', 'Name', 'Email', 'Plan', 'Joined', 'Status', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-mono text-xs text-gray-400">{u.id}</td>
                <td className="px-5 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-5 py-4 text-gray-500">{u.email}</td>
                <td className="px-5 py-4"><span className="text-xs font-semibold text-[#16A34A]">{u.plan}</span></td>
                <td className="px-5 py-4 text-gray-400 text-xs">{u.joined}</td>
                <td className="px-5 py-4"><Badge label={u.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
