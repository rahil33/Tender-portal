import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { liveTenderService, LiveTender } from '../../services/liveTenderService';
import { Skeleton } from '../../components/Loading';
import { useNotification } from '../../contexts/NotificationContext';
import { Search, Filter, Calendar, Building2, MapPin, Download, RefreshCw, ExternalLink } from 'lucide-react';

const PAGE_SIZE = 10;

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

export default function TendersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State is initialized from /tenders?search=..&state=..&category=..&page=..
  // so searches can be refreshed and shared without breaking existing routing.
  const initialSearch = searchParams.get('search') ?? '';
  const initialState = searchParams.get('state') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
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
  const [states, setStates] = useState<string[]>([]);
  const { error: showError, success } = useNotification();

  // Keep the search/filter/page state reflected in the URL so the page is
  // refreshable and shareable (e.g. /tenders?search=laptop&state=Tamil%20Nadu).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (submittedSearch) params.set('search', submittedSearch);
    else params.delete('search');
    if (selectedState) params.set('state', selectedState);
    else params.delete('state');
    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedSearch, selectedState, selectedCategory, page]);

  const fetchStates = async () => {
    try {
      const result = await liveTenderService.getStates();
      setStates(Array.isArray(result) ? result : result?.data ?? []);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const fetchTenders = async () => {
    setLoading(true);

    try {
      const response = await liveTenderService.getLiveTenders({
        page,
        limit: PAGE_SIZE,
        search: submittedSearch || undefined,
        state: selectedState || undefined,
        category: selectedCategory || undefined,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load tenders');
      }

      setTenders(response.data.data ?? []);
      setTotal(response.data.pagination.total ?? 0);
      setTotalPages(response.data.pagination.pages ?? 1);
    } catch (err: any) {
      console.error('Failed to fetch live tenders:', err);
      showError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load live tenders'
      );

      setTenders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, filters, or the submitted search term change. The raw
  // search input intentionally does not trigger requests on every keystroke.
  useEffect(() => {
    fetchStates();
    fetchTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, selectedState, submittedSearch]);

  const handleSearch = () => {
    const term = searchTerm.trim();
    setSubmittedSearch(term);
    setPage(1);
  };

  const handleDownload = async (tender: LiveTender, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      success('Document download started', 'The tender document will be downloaded shortly');
    } catch (error) {
      showError('Failed to download document');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[80px] opacity-50 pointer-events-none -z-10" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>Live GeM Tenders</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Source: Government e-Marketplace (GeM)
            </p>
          </div>
          <button
            onClick={fetchTenders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <p className="mb-8 text-gray-600">
          Search and browse live tender opportunities from GeM (Government e-Marketplace)
        </p>

        {/* Search and Filter Section */}
        <div className="p-6 rounded-[24px] mb-8 glass-card"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
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
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="p-3 rounded-[12px] font-bold transition-all flex items-center justify-center gap-2 text-white hover:-translate-y-0.5 active:scale-95"
              style={{ background: '#16A34A', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}
            >
              <Search size={20} />
              Search
            </button>
          </div>
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
              onClick={() => {
                setSearchTerm('');
                setSubmittedSearch('');
                setSelectedCategory('');
                setSelectedState('');
                setPage(1);
              }}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {tenders.length} of {total} live tenders</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {total} Active tenders
              </span>
            </div>
            <div className="space-y-4">
              {tenders.map((tender) => (
                <div
                  key={tender.tenderNumber}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                  onClick={() => {
                    const url = tender.metadata?.originalUrl;
                    if (url) window.open(url, '_blank');
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {tender.issuingOrganization}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {tender.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {formatDate(tender.submissionDeadline)}
                    </span>
                  </div>
                  {tender.budget.estimated && (
                    <div className="text-sm font-semibold text-gray-900 mb-3">
                      Estimated Value: ₹ {tender.budget.estimated.toLocaleString('en-IN')}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <a
                      href={tender.metadata?.originalUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-semibold"
                    >
                      View on GeM <ExternalLink size={14} />
                    </a>
                    {tender.documents && tender.documents.length > 0 && (
                      <button
                        onClick={(e) => handleDownload(tender, e)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-semibold"
                      >
                        <Download size={14} /> Documents
                      </button>
                    )}
                  </div>
                </div>
              ))}
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