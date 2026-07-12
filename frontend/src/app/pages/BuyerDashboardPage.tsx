import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ShoppingBag, TrendingUp, Eye, Bell, Search, Filter,
  Calendar, MapPin, Rupee, FileText, Loader2, CheckCircle,
  Clock, AlertCircle, Package, Download, ArrowRight,
} from 'lucide-react';
import { tenderService, Tender } from '../../services/tenderService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface DashboardTender {
  _id: string;
  title: string;
  category: string;
  budget: {
    estimated?: number;
    currency: string;
  };
  createdAt: string;
  status: string;
  views: number;
  description?: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  published: { label: 'Published', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  pending: { label: 'Pending', color: '#d97706', bg: '#fef3c7', icon: <Clock size={14} /> },
  closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6', icon: <Clock size={14} /> },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2', icon: <AlertCircle size={14} /> },
  under_review: { label: 'Under Review', color: '#2563eb', bg: '#dbeafe', icon: <AlertCircle size={14} /> },
};

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const { error: showError, success } = useNotification();
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenders, setTenders] = useState<DashboardTender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const response = await tenderService.getAllTenders({
        page: 1,
        limit: 50,
        status: 'published',
      });
      setTenders(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tenders:', err);
      showError('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesFilter = filter === 'all' || tender.status === filter;
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { label: 'Active Tenders', value: tenders.filter(t => t.status === 'published').length.toString(), sub: 'Available for bidding', icon: <ShoppingBag size={22} />, color: 'text-gray-900' },
    { label: 'Total Value', value: `₹${(tenders.reduce((sum, t) => sum + (t.budget.estimated || 0), 0) / 100000).toFixed(1)}L`, sub: 'Combined budget', icon: <TrendingUp size={22} />, color: 'text-gray-900' },
    { label: 'Categories', value: new Set(tenders.map(t => t.category)).size.toString(), sub: 'Unique categories', icon: <Filter size={22} />, color: 'text-gray-900' },
    { label: 'This Month', value: tenders.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth()).length.toString(), sub: 'New tenders', icon: <Calendar size={22} />, color: 'text-gray-900' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Tenders' },
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Dashboard Header */}
      <div className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500 font-medium">Logged in as Buyer</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome back, <span className="text-gray-900">{user?.fullName || 'Buyer'}</span>
              </h1>
              <p className="text-gray-500 mt-1">{user?.companyName || 'Government Organization'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md duration-200"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gray-50 border border-gray-100 text-gray-700">
                {s.icon}
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">{s.value}</div>
              <div className="text-sm font-semibold text-gray-900">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tenders by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  filter === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tender List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-gray-400" />
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tenders found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTenders.map((tender) => {
              const meta = statusMeta[tender.status] || statusMeta.published;
              return (
                <div
                  key={tender._id}
                  className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-500">TND-{new Date(tender.createdAt).getFullYear()}-XXX</span>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.icon} {meta.label}
                        </span>
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {tender.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1 text-gray-900">{tender.title}</h3>
                      <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                        <span>Posted: {new Date(tender.createdAt).toLocaleDateString('en-IN')}</span>
                        <span className="flex items-center gap-1"><Eye size={14} /> {tender.views || 0} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ₹ {(tender.budget.estimated || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Estimated Value</div>
                      </div>
                      <Link
                        to={`/tenders/${tender._id}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-blue-700 shadow-sm bg-blue-600 text-white"
                      >
                        View Details <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}