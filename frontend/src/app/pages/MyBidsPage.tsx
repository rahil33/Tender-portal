import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  FileText, Clock, CheckCircle, XCircle, Loader2, Search, Filter,
  ArrowUpRight, ArrowDownRight, Calendar, IndianRupee, Building2, Eye,
  Edit2, Trash2, ExternalLink, AlertCircle, TrendingUp, Package,
  ChevronRight, Plus, Download, Upload, History
} from 'lucide-react';
import { bidService, Bid } from '../../services/bidService';
import { tenderService } from '../../services/tenderService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6', icon: <FileText size={14} /> },
  submitted: { label: 'Submitted', color: '#2563eb', bg: '#dbeafe', icon: <CheckCircle size={14} /> },
  under_review: { label: 'Under Review', color: '#d97706', bg: '#fef3c7', icon: <Clock size={14} /> },
  accepted: { label: 'Accepted', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> },
  withdrawn: { label: 'Withdrawn', color: '#6b7280', bg: '#f3f4f6', icon: <ArrowDownRight size={14} /> },
};

export default function MyBidsPage() {
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useNotification();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?.userId;
      if (!userId) return;

      const response = await bidService.getVendorBids(userId, 1, 100);
      setBids(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch bids:', err);
      showError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedBid) return;
    if (!withdrawalReason.trim()) {
      showError('Please provide a reason for withdrawal');
      return;
    }

    try {
      await bidService.withdrawBid(selectedBid._id, withdrawalReason);
      showSuccess('Bid withdrawn successfully');
      setShowWithdrawModal(false);
      setWithdrawalReason('');
      fetchBids();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to withdraw bid');
    }
  };

  const handleDelete = async (bidId: string) => {
    if (!confirm('Are you sure you want to delete this draft bid? This action cannot be undone.')) return;

    try {
      await bidService.deleteBid(bidId);
      showSuccess('Bid deleted successfully');
      fetchBids();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete bid');
    }
  };

  const filteredBids = bids.filter((bid) => {
    const matchesFilter = filter === 'all' || bid.status === filter;
    const tenderTitle = (bid.tenderId as any)?.title || '';
    const bidNumber = bid.bidNumber || '';
    const matchesSearch = tenderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bidNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: bids.length,
    draft: bids.filter(b => b.status === 'draft').length,
    submitted: bids.filter(b => b.status === 'submitted' || b.status === 'under_review').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500 font-medium">Buyer Portal</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Bids</h1>
              <p className="text-gray-500 mt-1">Manage and track your bid submissions</p>
            </div>
            <Link
              to="/tenders"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:bg-blue-700 shadow-sm bg-blue-600 text-white"
            >
              <Plus size={18} />
              New Bid
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold mb-1 text-gray-900">{stats.total}</div>
            <div className="text-sm font-semibold text-gray-900">Total Bids</div>
            <div className="text-xs text-gray-500 mt-0.5">All time</div>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold mb-1 text-gray-900">{stats.draft}</div>
            <div className="text-sm font-semibold text-gray-900">Drafts</div>
            <div className="text-xs text-gray-500 mt-0.5">Pending submission</div>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold mb-1 text-gray-900">{stats.submitted}</div>
            <div className="text-sm font-semibold text-gray-900">In Progress</div>
            <div className="text-xs text-gray-500 mt-0.5">Under evaluation</div>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold mb-1 text-green-600">{stats.accepted}</div>
            <div className="text-sm font-semibold text-gray-900">Awarded</div>
            <div className="text-xs text-gray-500 mt-0.5">Won contracts</div>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold mb-1 text-gray-900">{successRate}%</div>
            <div className="text-sm font-semibold text-gray-900">Success Rate</div>
            <div className="text-xs text-gray-500 mt-0.5">Bid acceptance</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by bid number or tender title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'draft', label: 'Draft' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'under_review', label: 'Review' },
              { value: 'accepted', label: 'Awarded' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'withdrawn', label: 'Withdrawn' },
            ].map((opt) => (
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

        {/* Bids List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-gray-400" />
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bids found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'Start by creating your first bid' : 'No bids match this filter'}
            </p>
            {filter === 'all' && (
              <Link
                to="/tenders"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:bg-blue-700 shadow-sm bg-blue-600 text-white"
              >
                Browse Tenders
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => {
              const meta = statusMeta[bid.status] || statusMeta.draft;
              const tender = bid.tenderId as any;
              const isEditable = bid.status === 'draft';
              const isSubmittable = bid.status === 'draft';
              const isWithdrawable = ['submitted', 'under_review'].includes(bid.status);

              return (
                <div
                  key={bid._id}
                  className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-500">{bid.bidNumber}</span>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.icon} {meta.label}
                        </span>
                        {tender?.category && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {tender.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-1 text-gray-900">{tender?.title || 'Unknown Tender'}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {tender?.issuingOrganization || 'Government'}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee size={14} />
                          ₹ {bid.bidAmount?.toLocaleString() || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {bid.submittedAt ? new Date(bid.submittedAt).toLocaleDateString('en-IN') : 'Not submitted'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {bid.evaluation?.totalScore && (
                        <div className="text-right px-4 py-2 bg-gray-50 rounded-xl">
                          <div className="text-lg font-bold text-gray-900">{bid.evaluation.totalScore}/100</div>
                          <div className="text-xs text-gray-500">Evaluation Score</div>
                        </div>
                      )}
                      <Link
                        to={`/bids/${bid._id}`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-gray-200 hover:bg-gray-50"
                      >
                        View
                        <ChevronRight size={16} />
                      </Link>
                      {isEditable && (
                        <>
                          <Link
                            to={`/bids/${bid._id}/edit`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <Edit2 size={16} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(bid._id)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </>
                      )}
                      {isSubmittable && (
                        <Link
                          to={`/bids/${bid._id}/submit`}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-green-700 shadow-sm bg-green-600 text-white"
                        >
                          <Upload size={16} />
                          Submit
                        </Link>
                      )}
                      {isWithdrawable && (
                        <button
                          onClick={() => {
                            setSelectedBid(bid);
                            setShowWithdrawModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all bg-orange-50 text-orange-600 hover:bg-orange-100"
                        >
                          <ArrowDownRight size={16} />
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Withdraw Bid</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to withdraw this bid? This action cannot be undone.
            </p>
            <textarea
              value={withdrawalReason}
              onChange={(e) => setWithdrawalReason(e.target.value)}
              placeholder="Please provide a reason for withdrawal..."
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawalReason('');
                  setSelectedBid(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-orange-600 text-white hover:bg-orange-700"
              >
                Withdraw Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}