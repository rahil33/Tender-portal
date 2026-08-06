import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ShoppingBag, TrendingUp, Eye, Bell, Search, Filter,
  Calendar, MapPin, IndianRupee, FileText, Loader2, CheckCircle,
  Clock, AlertCircle, Package, Download, ArrowRight,
  ArrowUpRight, ArrowDownRight, Target, Award, Building2,
  ChevronRight, Bookmark, Share2, ExternalLink, Edit2
} from 'lucide-react';
import { tenderService, Tender } from '../../services/tenderService';
import { bidService } from '../../services/bidService';
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
  submissionDeadline?: string;
}

interface BidSummary {
  _id: string;
  status: string;
  bidAmount: number;
  tenderId: {
    _id: string;
    title: string;
    submissionDeadline?: string;
  };
  createdAt: string;
  submittedAt?: string;
}

interface DashboardStats {
  activeTenders: number;
  totalValue: string;
  categories: number;
  thisMonth: number;
  totalBids: number;
  draftBids: number;
  submittedBids: number;
  awardedBids: number;
  successRate: number;
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
  const [recentBids, setRecentBids] = useState<BidSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeTenders: 0,
    totalValue: '₹0',
    categories: 0,
    thisMonth: 0,
    totalBids: 0,
    draftBids: 0,
    submittedBids: 0,
    awardedBids: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tendersResponse, bidsResponse] = await Promise.all([
        tenderService.getAllTenders({ page: 1, limit: 50, status: 'published' }),
        bidService.getAllBids({ page: 1, limit: 20 }),
      ]);

      const tendersData = tendersResponse.data.data || [];
      const bidsData = bidsResponse.data?.data || [];

      setTenders(tendersData);
      setRecentBids(bidsData.slice(0, 5));

      const awardedCount = bidsData.filter((b: any) => b.status === 'accepted').length;
      const totalBids = bidsData.length;

      setStats({
        activeTenders: tendersData.filter(t => t.status === 'published').length,
        totalValue: `₹${(tendersData.reduce((sum, t) => sum + (t.budget.estimated || 0), 0) / 100000).toFixed(1)}L`,
        categories: new Set(tendersData.map(t => t.category)).size,
        thisMonth: tendersData.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth()).length,
        totalBids,
        draftBids: bidsData.filter((b: any) => b.status === 'draft').length,
        submittedBids: bidsData.filter((b: any) => ['submitted', 'under_review'].includes(b.status)).length,
        awardedBids: awardedCount,
        successRate: totalBids > 0 ? Math.round((awardedCount / totalBids) * 100) : 0,
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      showError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: 'Closed', color: '#dc2626' };
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: '#dc2626' };
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: '#d97706' };
    return { label: `${daysLeft}d left`, color: '#16a34a' };
  };

  const upcomingDeadlines = tenders
    .filter(t => t.submissionDeadline)
    .sort((a, b) => new Date(a.submissionDeadline!).getTime() - new Date(b.submissionDeadline!).getTime())
    .slice(0, 5);

  const categoryDistribution = Array.from(new Set(tenders.map(t => t.category))).slice(0, 5);

  const filteredTenders = tenders.filter((tender) => {
    const matchesFilter = filter === 'all' || tender.status === filter;
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const dashboardStats = [
    { label: 'Active Tenders', value: stats.activeTenders.toString(), sub: 'Available for bidding', icon: <ShoppingBag size={22} />, color: 'text-gray-900' },
    { label: 'Total Value', value: stats.totalValue, sub: 'Combined budget', icon: <TrendingUp size={22} />, color: 'text-gray-900' },
    { label: 'Categories', value: stats.categories.toString(), sub: 'Unique categories', icon: <Filter size={22} />, color: 'text-gray-900' },
    { label: 'This Month', value: stats.thisMonth.toString(), sub: 'New tenders', icon: <Calendar size={22} />, color: 'text-gray-900' },
  ];

  const bidStats = [
    { label: 'Total Bids', value: stats.totalBids.toString(), sub: 'All time', icon: <FileText size={22} />, trend: null },
    { label: 'Drafts', value: stats.draftBids.toString(), sub: 'Pending submission', icon: <Edit2 size={22} />, trend: null },
    { label: 'In Progress', value: stats.submittedBids.toString(), sub: 'Under evaluation', icon: <Clock size={22} />, trend: null },
    { label: 'Awarded', value: stats.awardedBids.toString(), sub: 'Won contracts', icon: <Award size={22} />, trend: stats.successRate > 50 ? 'up' : stats.successRate < 20 ? 'down' : null },
    { label: 'Success Rate', value: `${stats.successRate}%`, sub: 'Bid acceptance', icon: <Target size={22} />, trend: stats.successRate > 50 ? 'up' : 'down' },
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
                <span className="text-xs text-gray-500 font-medium">Buyer Portal</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome back, <span className="text-gray-900">{user?.fullName || 'Buyer'}</span>
              </h1>
              <p className="text-gray-500 mt-1">{user?.companyName || 'Government Organization'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/bids/my-bids"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all border border-gray-200 hover:bg-gray-50 bg-white"
              >
                <FileText size={18} />
                My Bids
              </Link>
              <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        {/* Tender Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tender Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardStats.map((s, i) => (
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
        </div>

        {/* Bid Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bid Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {bidStats.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-700">
                    {s.icon}
                  </div>
                  {s.trend && (
                    s.trend === 'up' ? (
                      <ArrowUpRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-600" />
                    )
                  )}
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">{s.value}</div>
                <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Upcoming Deadlines */}
          <div className="lg:col-span-1 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Upcoming Deadlines</h3>
              <Calendar size={20} className="text-gray-400" />
            </div>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((tender) => {
                  const deadline = getDeadlineStatus(tender.submissionDeadline);
                  return (
                    <div key={tender._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: deadline?.color + '20', color: deadline?.color }}
                        >
                          {deadline?.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{tender.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(tender.submissionDeadline!).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="lg:col-span-1 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Top Categories</h3>
              <Filter size={20} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {categoryDistribution.map((cat, i) => {
                const count = tenders.filter(t => t.category === cat).length;
                const percentage = tenders.length > 0 ? (count / tenders.length) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{cat}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Bids */}
          <div className="lg:col-span-1 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Bids</h3>
              <Link to="/bids/my-bids" className="text-blue-600 hover:underline text-sm font-medium">
                View All
              </Link>
            </div>
            {recentBids.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent bids</p>
            ) : (
              <div className="space-y-3">
                {recentBids.map((bid: any) => (
                  <div key={bid._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-gray-500">{bid.bidNumber}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        bid.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{bid.tenderId?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">₹ {bid.bidAmount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
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