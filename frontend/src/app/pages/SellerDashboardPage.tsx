import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  UploadCloud, TrendingUp, ShoppingBag, Users, CheckCircle,
  Clock, AlertCircle, XCircle, Eye, Download, Plus, Bell,
  ArrowRight, Package, BarChart2, FileText, Loader2,
} from 'lucide-react';
import { tenderService, Tender } from '../../services/tenderService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

type TenderStatus = 'approved' | 'pending' | 'under_review' | 'rejected' | 'sold' | 'draft' | 'published' | 'closed' | 'cancelled';

interface DashboardTender {
  _id: string;
  title: string;
  category: string;
  budget: {
    estimated?: number;
    currency: string;
  };
  createdAt: string;
  status: TenderStatus;
  views: number;
  buyers: number;
}

const mockTenders: Tender[] = [
  {
    id: 'TND-2024-001',
    title: 'Office Stationery & Supplies Bundle',
    category: 'Office Supplies',
    price: '₹1,24,500',
    uploadedDate: '2024-06-10',
    status: 'approved',
    buyers: 14,
    views: 312,
  },
  {
    id: 'TND-2024-002',
    title: 'Industrial Safety Equipment Set',
    category: 'Safety & PPE',
    price: '₹3,87,000',
    uploadedDate: '2024-06-15',
    status: 'sold',
    buyers: 32,
    views: 876,
  },
  {
    id: 'TND-2024-003',
    title: 'IT Hardware — Laptops & Monitors',
    category: 'Electronics',
    price: '₹8,50,000',
    uploadedDate: '2024-06-18',
    status: 'pending',
    buyers: 0,
    views: 45,
  },
  {
    id: 'TND-2024-004',
    title: 'Water Purification Units (x20)',
    category: 'Infrastructure',
    price: '₹2,10,000',
    uploadedDate: '2024-06-20',
    status: 'under_review',
    buyers: 0,
    views: 88,
  },
  {
    id: 'TND-2024-005',
    title: 'Medical Consumables — Gloves & Masks',
    category: 'Medical',
    price: '₹55,200',
    uploadedDate: '2024-06-22',
    status: 'rejected',
    buyers: 0,
    views: 23,
  },
  {
    id: 'TND-2024-006',
    title: 'Electrical Wiring Accessories Lot',
    category: 'Electrical',
    price: '₹1,92,400',
    uploadedDate: '2024-06-24',
    status: 'approved',
    buyers: 7,
    views: 154,
  },
];

const statusMeta: Record<TenderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  published: { label: 'Published', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  pending: { label: 'Pending Approval', color: '#d97706', bg: '#fef3c7', icon: <Clock size={14} /> },
  draft: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6', icon: <FileText size={14} /> },
  under_review: { label: 'Under Review', color: '#2563eb', bg: '#dbeafe', icon: <AlertCircle size={14} /> },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> },
  closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6', icon: <Clock size={14} /> },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> },
  sold: { label: 'Sold', color: '#4f46e5', bg: '#e0e7ff', icon: <ShoppingBag size={14} /> },
};

const stats = [
  { label: 'Total Tenders', value: '6', sub: '2 awaiting action', icon: <FileText size={22} />, color: 'text-gray-900' },
  { label: 'Products Sold', value: '46', sub: 'Across 3 tenders', icon: <ShoppingBag size={22} />, color: 'text-gray-900' },
  { label: 'Total Buyers', value: '53', sub: 'Verified purchasers', icon: <Users size={22} />, color: 'text-gray-900' },
  { label: 'Total Revenue', value: '₹14.2L', sub: 'This quarter', icon: <TrendingUp size={22} />, color: 'text-gray-900' },
];

const getDynamicStats = (tenders: DashboardTender[]) => {
  const total = tenders.length;
  const approved = tenders.filter(t => t.status === 'approved' || t.status === 'published').length;
  const pending = tenders.filter(t => t.status === 'pending' || t.status === 'draft').length;
  const totalRevenue = tenders
    .filter(t => t.status === 'sold' || t.status === 'approved')
    .reduce((sum, t) => sum + (t.budget.estimated || 0), 0);
  
  return [
    { label: 'Total Tenders', value: total.toString(), sub: `${pending} awaiting action`, icon: <FileText size={22} />, color: 'text-gray-900' },
    { label: 'Approved', value: approved.toString(), sub: 'Active listings', icon: <CheckCircle size={22} />, color: 'text-gray-900' },
    { label: 'Pending', value: pending.toString(), sub: 'Awaiting review', icon: <Clock size={22} />, color: 'text-gray-900' },
    { 
      label: 'Total Value', 
      value: totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : '₹0', 
      sub: 'Estimated value', 
      icon: <TrendingUp size={22} />, 
      color: 'text-gray-900' 
    },
  ];
};

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { error: showError } = useNotification();
  const [filter, setFilter] = useState<TenderStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'tenders' | 'analytics'>('tenders');
  const [tenders, setTenders] = useState<DashboardTender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await tenderService.getAllTenders({
        page: 1,
        limit: 50,
        createdBy: user._id,
      });
      setTenders(response.data.data.map((t: Tender) => ({
        _id: t._id,
        title: t.title,
        category: t.category,
        budget: t.budget,
        createdAt: t.createdAt,
        status: t.status as TenderStatus,
        views: 0,
        buyers: 0,
      })));
    } catch (err: any) {
      console.error('Failed to fetch tenders:', err);
      showError('Failed to load your tenders');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? tenders : tenders.filter((t) => t.status === filter);

  const filterOptions: { value: TenderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Tenders' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'sold', label: 'Sold' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Dashboard Header */}
      <div className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 font-medium">Logged in as Seller</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome back, <span className="text-gray-900">Rajesh Kumar</span>
              </h1>
              <p className="text-gray-500 mt-1">Acme Enterprises Pvt Ltd · GST: 22AAAAA0000A1Z5</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-900" />
              </button>
              <Link
                to="/seller/upload"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-gray-800 shadow-sm bg-gray-900 text-white"
              >
                <Plus size={16} /> Upload Tender
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {getDynamicStats(tenders).map((s, i) => (
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

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit bg-gray-50 border border-gray-100">
          {[
            { key: 'tenders', label: 'My Tenders', icon: <FileText size={15} /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={15} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as 'tenders' | 'analytics')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 border border-transparent'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'tenders' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-gray-400" />
              </div>
            ) : tenders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <UploadCloud size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No tenders yet</h3>
                <p className="text-gray-500 mb-6">Upload your first tender to start selling to government buyers.</p>
                <Link
                  to="/seller/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:bg-gray-800 shadow-sm bg-gray-900 text-white"
                >
                  <Plus size={16} /> Upload First Tender
                </Link>
              </div>
            ) : (
              <>
                {/* Filter bar */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilter(opt.value)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        filter === opt.value
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Tender Cards */}
                <div className="space-y-4">
                  {filtered.map((tender) => {
                    const meta = statusMeta[tender.status];
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
                                {tender.category.charAt(0).toUpperCase() + tender.category.slice(1)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold mb-1 text-gray-900">{tender.title}</h3>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span>Created: {new Date(tender.createdAt).toLocaleDateString('en-IN')}</span>
                              <span className="flex items-center gap-1"><Eye size={14} /> {tender.views} views</span>
                              <span className="flex items-center gap-1"><Users size={14} /> {tender.buyers} buyers</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                ₹ {tender.budget.estimated?.toLocaleString() || '0'}
                              </div>
                              <div className="text-xs text-gray-500">Estimated Value</div>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/tenders/${tender._id}`}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                              <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100" title="Download PDF">
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Status-specific message */}
                        {tender.status === 'pending' && (
                          <div className="mt-4 p-3 rounded-xl text-sm flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-100">
                            <Clock size={14} className="flex-shrink-0" />
                            Your tender is queued for admin review. Approval usually takes 24–48 hours.
                          </div>
                        )}
                        {tender.status === 'rejected' && (
                          <div className="mt-4 p-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 text-red-800 border border-red-100">
                            <XCircle size={14} className="flex-shrink-0" />
                            Tender rejected: Incomplete product specification. Please re-upload with full details.{' '}
                            <Link to="/seller/upload" className="underline font-bold ml-1 text-gray-900">Re-upload</Link>
                          </div>
                        )}
                        {tender.status === 'sold' && (
                          <div className="mt-4 p-3 rounded-xl text-sm flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-100">
                            <ShoppingBag size={14} className="flex-shrink-0" />
                            This tender was fulfilled. {tender.buyers} buyers completed purchases. Revenue credited.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Upload CTA */}
            <div className="mt-8 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 border border-dashed border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white border border-gray-200 shadow-sm text-gray-700">
                  <UploadCloud size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Upload a new tender</h3>
                  <p className="text-gray-500 text-sm">Add products, upload PDF specs, and attach media files.</p>
                </div>
              </div>
              <Link
                to="/seller/upload"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:bg-gray-800 shadow-sm whitespace-nowrap bg-gray-900 text-white"
              >
                Upload Now <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category breakdown */}
            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-5 text-gray-900">Sales by Category</h3>
              <div className="space-y-4">
                {[
                  { label: 'Safety & PPE', pct: 68, val: '₹9.6L' },
                  { label: 'Electronics', pct: 52, val: '₹7.4L' },
                  { label: 'Office Supplies', pct: 38, val: '₹5.3L' },
                  { label: 'Electrical', pct: 25, val: '₹3.5L' },
                  { label: 'Medical', pct: 12, val: '₹1.7L' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.val}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all bg-gray-900"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer stats */}
            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-5 text-gray-900">Buyer Activity</h3>
              <div className="space-y-4">
                {[
                  { label: 'New buyers this month', value: '18', change: '+22%', up: true },
                  { label: 'Repeat buyers', value: '14', change: '+8%', up: true },
                  { label: 'Avg. order value', value: '₹3.1L', change: '-4%', up: false },
                  { label: 'Tender view-to-bid rate', value: '24%', change: '+11%', up: true },
                  { label: 'Avg. approval time', value: '31 hrs', change: '-2 hrs', up: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{row.value}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          row.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {row.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent orders */}
            <div className="md:col-span-2 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-5 text-gray-900">Recent Purchase Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Order ID', 'Buyer', 'Tender', 'Amount', 'Date', 'Status'].map((h) => (
                        <th key={h} className="text-left py-3 pr-4 text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'ORD-2024-119', buyer: 'Ministry of Defence', tender: 'Safety Equipment Set', amount: '₹3,87,000', date: '2024-06-22', status: 'Delivered' },
                      { id: 'ORD-2024-118', buyer: 'AIIMS, New Delhi', tender: 'Medical Consumables', amount: '₹55,200', date: '2024-06-21', status: 'Processing' },
                      { id: 'ORD-2024-117', buyer: 'PWD Maharashtra', tender: 'Electrical Accessories', amount: '₹1,92,400', date: '2024-06-20', status: 'Shipped' },
                      { id: 'ORD-2024-116', buyer: 'CBSE Board', tender: 'Office Stationery', amount: '₹48,500', date: '2024-06-19', status: 'Delivered' },
                    ].map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 pr-4 font-mono text-xs text-gray-500">{row.id}</td>
                        <td className="py-4 pr-4 font-medium text-gray-900">{row.buyer}</td>
                        <td className="py-4 pr-4 text-gray-600">{row.tender}</td>
                        <td className="py-4 pr-4 font-bold text-gray-900">{row.amount}</td>
                        <td className="py-4 pr-4 text-gray-500">{row.date}</td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              row.status === 'Delivered'
                                ? 'bg-green-50 text-green-700'
                                : row.status === 'Processing'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
