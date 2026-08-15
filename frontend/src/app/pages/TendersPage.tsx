import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { liveTenderService, LiveTender } from '../../services/liveTenderService';
import { Skeleton } from '../../components/Loading';
import { useNotification } from '../../contexts/NotificationContext';
import { AuthModal } from '../components/AuthModal';
import {
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  Download,
  RefreshCw,
  LogIn,
  X,
} from 'lucide-react';

const PAGE_SIZE = 10;
const MAX_VALUE = '5000000000';

const ALL_INDIAN_STATES_AND_UTS = [
  'All States',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const STATE_NORMALIZATION_MAP: Record<string, string> = {
  'tamilnadu': 'Tamil Nadu',
  'orissa': 'Odisha',
};

function normalizeState(state: string): string {
  if (!state) return state;
  const lower = state.trim().toLowerCase().replace(/_/g, ' ');
  if (STATE_NORMALIZATION_MAP[lower]) {
    return STATE_NORMALIZATION_MAP[lower];
  }
  return state
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const CATEGORIES = [
  'goods',
  'services',
  'works',
  'construction',
  'it_software',
  'medical',
  'transportation',
  'agriculture',
  'education',
  'consultancy',
  'other',
];

const BID_TYPES = [
  { value: '', label: 'All Bid Types' },
  { value: '1', label: 'Product Bid/RA' },
  { value: '2', label: 'Service Bid/RA' },
  { value: '3', label: 'Bid To RA' },
  { value: '4', label: 'BOQ Bid' },
  { value: '5', label: 'Product Custom Bid/RA' },
  { value: '6', label: 'Rate Contract Bid' },
];

const formatIST = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function TendersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { error: showError } = useNotification();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const initialSearch = searchParams.get('search') ?? '';
  const initialState = searchParams.get('state') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
  const initialAuthority = searchParams.get('authority') ?? '';
  const initialBidType = searchParams.get('bidType') ?? '';
  const initialMinValue = searchParams.get('minValue') ?? '';
  const initialMaxValue = searchParams.get('maxValue') ?? '';
  const initialDeadlineFrom = searchParams.get('deadlineFrom') ?? '';
  const initialDeadlineTo = searchParams.get('deadlineTo') ?? '';
  const initialPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [tenders, setTenders] = useState<LiveTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAuthority, setSelectedAuthority] = useState(initialAuthority);
  const [selectedBidType, setSelectedBidType] = useState(initialBidType);
  const [minValue, setMinValue] = useState(initialMinValue);
  const [maxValue, setMaxValue] = useState(initialMaxValue);
  const [deadlineFrom, setDeadlineFrom] = useState(initialDeadlineFrom);
  const [deadlineTo, setDeadlineTo] = useState(initialDeadlineTo);
  const [states, setStates] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [authorities, setAuthorities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Keep the search/filter/page state reflected in the URL so the page is
  // refreshable and shareable (e.g. /tenders?keyword=laptop&state=Tamil%20Nadu).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (submittedSearch) params.set('search', submittedSearch);
    else params.delete('search');
    if (selectedState) params.set('state', selectedState);
    else params.delete('state');
    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');
    if (selectedAuthority) params.set('authority', selectedAuthority);
    else params.delete('authority');
    if (selectedBidType) params.set('bidType', selectedBidType);
    else params.delete('bidType');
    if (minValue) params.set('minValue', minValue);
    else params.delete('minValue');
    if (maxValue) params.set('maxValue', maxValue);
    else params.delete('maxValue');
    if (deadlineFrom) params.set('deadlineFrom', deadlineFrom);
    else params.delete('deadlineFrom');
    if (deadlineTo) params.set('deadlineTo', deadlineTo);
    else params.delete('deadlineTo');
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedSearch, selectedState, selectedCategory, selectedAuthority, selectedBidType, minValue, maxValue, deadlineFrom, deadlineTo, page]);

  const fetchOptionLists = async () => {
    try {
      const stateRes = await liveTenderService.getStates();
      const authRes = await liveTenderService.getAuthorities();
      setStates(Array.isArray(stateRes) ? stateRes : stateRes?.states ?? []);
      setCounts(stateRes.counts ?? {});
      setAuthorities(Array.isArray(authRes) ? authRes : authRes?.data ?? []);
    } catch (error) {
      console.error('Failed to fetch option lists:', error);
    }
  };

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await liveTenderService.getLiveTenders({
        page,
        limit: PAGE_SIZE,
        search: submittedSearch || undefined,
        state: selectedState || undefined,
        category: selectedCategory || undefined,
        authority: selectedAuthority || undefined,
        bidType: selectedBidType || undefined,
        minValue: minValue ? Number(minValue) : undefined,
        maxValue: maxValue ? Number(maxValue) : undefined,
        deadlineFrom: deadlineFrom || undefined,
        deadlineTo: deadlineTo || undefined,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load tenders');
      }

      setTenders(response.data.data ?? []);
      setTotal(response.data.pagination.total ?? 0);
      setTotalPages(response.data.pagination.pages ?? 1);
    } catch (err: any) {
      console.error('Failed to fetch live tenders:', err);
      if (err.response?.status === 401) {
        // Session expired/revoked - do not expose any cached tender data.
        setTenders([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      showError(
        err.response?.data?.message || err.message || 'Failed to load live tenders'
      );
      setTenders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, submittedSearch, selectedState, selectedCategory, selectedAuthority, selectedBidType, minValue, maxValue, deadlineFrom, deadlineTo, showError]);

  // Fetch only when authenticated. On logout/session expiry, the login gate
  // renders and previously fetched data is cleared by the 401 handler above.
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOptionLists();
    fetchTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, fetchTenders]);

  const resetPage = () => setPage(1);

  const handleSearch = () => {
    setSubmittedSearch(searchTerm.trim());
    resetPage();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSubmittedSearch('');
    setSelectedCategory('');
    setSelectedState('');
    setSelectedAuthority('');
    setSelectedBidType('');
    setMinValue('');
    setMaxValue('');
    setDeadlineFrom('');
    setDeadlineTo('');
    setPage(1);
  };

  // ---- Auth gate ----------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
        <div className="max-w-[1200px] mx-auto px-4 py-20 relative">
          <div className="flex flex-col items-center justify-center pt-24">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#16A34A] rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
        <div className="max-w-[1200px] mx-auto px-4 py-20 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[80px] opacity-50 pointer-events-none -z-10" />
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <LogIn size={36} className="text-gray-500" />
            </div>
            <h1 className="text-4xl font-bold mb-3" style={{ color: '#111827' }}>
              Login Required
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Please sign in to access live GeM tenders.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all text-white hover:-translate-y-0.5 active:scale-95"
              style={{ background: '#16A34A', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}
            >
              <LogIn size={18} /> Login
            </button>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode="login" />
      </div>
    );
  }

  // ---- Authenticated / Live tenders view ---------------------------------
  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode="login" />
      <div className="max-w-[1200px] mx-auto px-4 py-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[80px] opacity-50 pointer-events-none -z-10" />

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>
              Live GeM Tenders
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Source: Government e-Marketplace (GeM)
            </p>
          </div>
          <button
            onClick={fetchTenders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <p className="mb-8 text-gray-600">
          Search and browse live tender opportunities from GeM (Government e-Marketplace)
        </p>

        {/* Search + quick filters */}
        <div className="p-6 rounded-[24px] mb-4 glass-card"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search GeM tenders..."
                className="w-full p-3 pl-10 rounded-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-[12px] font-bold transition-all flex items-center justify-center gap-2 text-white hover:-translate-y-0.5 active:scale-95"
              style={{ background: '#16A34A', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}
            >
              <Search size={20} /> Search
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`px-6 py-3 rounded-[12px] font-bold transition-all flex items-center justify-center gap-2 border ${
                showFilters
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} /> Filters
            </button>
          </div>

{showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  resetPage();
                }}
                className="p-3 rounded-[12px] w-full focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none block"
                style={{ maxHeight: 200, overflow: 'auto' }}
              >
                <option value="">All States</option>
                {ALL_INDIAN_STATES_AND_UTS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); resetPage(); }}
                className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>

              <select
                value={selectedAuthority}
                onChange={(e) => { setSelectedAuthority(e.target.value); resetPage(); }}
                className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none truncate"
              >
                <option value="">All Authorities</option>
                {authorities.map((auth) => (
                  <option key={auth} value={auth}>{auth}</option>
                ))}
              </select>

              <select
                value={selectedBidType}
                onChange={(e) => { setSelectedBidType(e.target.value); resetPage(); }}
                className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none"
              >
                {BID_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>{bt.label}</option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={minValue}
                  onChange={(e) => { setMinValue(e.target.value); resetPage(); }}
                  placeholder="Min bid value (₹)"
                  className="w-full p-3 rounded-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                />
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={MAX_VALUE}
                  value={maxValue}
                  onChange={(e) => { setMaxValue(e.target.value); resetPage(); }}
                  placeholder="Max bid value (₹)"
                  className="w-full p-3 rounded-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={deadlineFrom}
                  onChange={(e) => { setDeadlineFrom(e.target.value); resetPage(); }}
                  className="w-full p-3 rounded-[12px] text-[#111827] focus:outline-none focus:ring-2 bg-white border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                />
                <span className="absolute -top-2 left-3 px-1 text-[10px] font-bold uppercase tracking-wider bg-white text-gray-500">Bid ends from</span>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={deadlineTo}
                  onChange={(e) => { setDeadlineTo(e.target.value); resetPage(); }}
                  className="w-full p-3 rounded-[12px] text-[#111827] focus:outline-none focus:ring-2 bg-white border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                />
                <span className="absolute -top-2 left-3 px-1 text-[10px] font-bold uppercase tracking-wider bg-white text-gray-500">Bid ends to</span>
              </div>

              <button
                onClick={clearFilters}
                className="p-3 rounded-[12px] font-bold transition-all flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 md:col-span-2 lg:col-span-2"
              >
                <X size={18} /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No live GeM tenders found.</p>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
              <span>Showing {tenders.length} of {total} live tenders</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {total} Active tenders
              </span>
            </div>
            <div className="space-y-4">
              {tenders.map((tender) => {
                const downloadUrl = tender.metadata?.bidDownloadUrl;
                return (
                  <div
                    key={tender._id || tender.tenderNumber}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded break-all">
                            {tender.tenderNumber}
                          </span>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-semibold">
                            Live
                          </span>
                          <span className="text-xs px-2 py-1 rounded font-bold text-blue-700 bg-blue-50">
                            GeM
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{tender.title}</h3>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                        {tender.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1 min-w-0">
                        <Building2 size={14} className="shrink-0" />
                        <span className="truncate">{tender.issuingOrganization}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {tender.metadata?.state || tender.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Bid Ends: {formatIST(tender.submissionDeadline)} IST
                      </span>
                    </div>
                    {tender.budget.estimated ? (
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Estimated Value: ₹ {tender.budget.estimated.toLocaleString('en-IN')}
                      </div>
                    ) : null}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      {downloadUrl ? (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Download size={14} /> Download Bid
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-gray-400 px-3 py-2">
                          <Download size={14} /> Bid document unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
