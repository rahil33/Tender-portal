import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, Users, CreditCard, Star, BarChart2,
  TrendingUp, Bell, LogOut, Shield,
} from 'lucide-react';
import type { Tab, Tender, Review } from '../components/admin/types';
import { mockTenders, mockUsers, mockReviews } from '../components/admin/mockData';
import { AdminLogin } from '../components/admin/AdminLogin';
import { TenderFormModal } from '../components/admin/TenderFormModal';
import { ConfirmDelete } from '../components/admin/ConfirmDelete';
import { DashboardTab } from '../components/admin/tabs/DashboardTab';
import { TendersTab } from '../components/admin/tabs/TendersTab';
import { UsersTab } from '../components/admin/tabs/UsersTab';
import { PaymentsTab } from '../components/admin/tabs/PaymentsTab';
import { ReviewsTab } from '../components/admin/tabs/ReviewsTab';
import { AnalyticsTab } from '../components/admin/tabs/AnalyticsTab';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [tenders, setTenders] = useState<Tender[]>(mockTenders);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [tenderModal, setTenderModal] = useState<{ open: boolean; tender: Partial<Tender> | null }>({ open: false, tender: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: string } | null>(null);
  const [search, setSearch] = useState('');

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

  const stats = [
    { label: 'Total Tenders', value: tenders.length, icon: <FileText size={20} />, color: '#16A34A', sub: `${tenders.filter((t) => t.status === 'Active').length} active` },
    { label: 'Active Tenders', value: tenders.filter((t) => t.status === 'Active').length, icon: <TrendingUp size={20} />, color: '#10B981', sub: 'Currently live' },
    { label: 'Registered Users', value: mockUsers.length, icon: <Users size={20} />, color: '#7C3AED', sub: `${mockUsers.filter((u) => u.status === 'Active').length} active` },
    { label: 'Revenue (Apr)', value: '₹36,577', icon: <CreditCard size={20} />, color: '#F59E0B', sub: '3 transactions' },
  ];

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'tenders', label: 'Tenders', icon: <FileText size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
  ];

  function deleteTender(id: string) { setTenders((prev) => prev.filter((t) => t.id !== id)); setDeleteModal(null); }
  function deleteReview(id: string) { setReviews((prev) => prev.filter((r) => r.id !== id)); setDeleteModal(null); }

  const filteredTenders = tenders.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.authority.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-30 hidden lg:flex">
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Phoenix Admin</p>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {navItems.find((n) => n.id === tab)?.label}
            </h1>
            <p className="text-xs text-gray-400">Phoenix Tender Tech · Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        <div className="p-6">
          {tab === 'dashboard' && (
            <DashboardTab tenders={tenders} stats={stats} onNavigate={setTab} />
          )}
          {tab === 'tenders' && (
            <TendersTab
              tenders={filteredTenders}
              search={search}
              onSearch={setSearch}
              onAdd={() => setTenderModal({ open: true, tender: null })}
              onEdit={(t) => setTenderModal({ open: true, tender: t })}
              onDelete={(id) => setDeleteModal({ open: true, type: 'tender', id })}
            />
          )}
          {tab === 'users' && <UsersTab />}
          {tab === 'payments' && <PaymentsTab />}
          {tab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              onDelete={(id) => setDeleteModal({ open: true, type: 'review', id })}
            />
          )}
          {tab === 'analytics' && <AnalyticsTab />}
        </div>
      </main>

      {tenderModal.open && (
        <TenderFormModal
          tender={tenderModal.tender}
          onSave={(updated) => {
            if (tenderModal.tender?.id) {
              setTenders((prev) => prev.map((t) => (t.id === tenderModal.tender!.id ? { ...t, ...updated } : t)));
            } else {
              setTenders((prev) => [...prev, { id: `T${Date.now()}`, bids: 0, ...updated } as Tender]);
            }
          }}
          onClose={() => setTenderModal({ open: false, tender: null })}
        />
      )}

      {deleteModal?.open && (
        <ConfirmDelete
          label={deleteModal.type === 'tender' ? 'Tender' : 'Review'}
          onConfirm={() => {
            if (deleteModal.type === 'tender') deleteTender(deleteModal.id);
            else deleteReview(deleteModal.id);
          }}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
