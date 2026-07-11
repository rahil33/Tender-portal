import React, { useState, useEffect } from 'react';
import { tenderService, Tender, TenderFilters } from '../../services/tenderService';
import { LoadingSpinner, Skeleton } from '../../components/Loading';
import { useNotification } from '../../contexts/NotificationContext';
import { Search, Filter } from 'lucide-react';

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TenderFilters>({
    page: 1,
    limit: 10,
    status: 'published',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { error: showError } = useNotification();

  const categories = [
    'goods',
    'services',
    'works',
    'consultancy',
    'it_software',
    'medical',
    'construction',
    'transportation',
    'agriculture',
    'education',
    'other',
  ];

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const response = await tenderService.getAllTenders({
        ...filters,
        page,
        search: searchTerm || undefined,
      });
      setTenders(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      console.error('Failed to fetch tenders:', err);
      showError(err.response?.data?.message || 'Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [page, filters.status, filters.category]);

  const handleSearch = () => {
    setPage(1);
    setFilters({ ...filters, page: 1 });
    fetchTenders();
  };

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[80px] opacity-50 pointer-events-none -z-10" />

        <h1 className="text-4xl font-bold mb-4" style={{ color: '#111827' }}>Live Tenders</h1>
        <p className="mb-8" style={{ color: '#6B7280' }}>Browse and search from thousands of active tender opportunities</p>
        
        {/* Search and Filter Section */}
        <div className="p-6 rounded-[24px] mb-8 glass-card"
          style={{ 
            background: 'rgba(255,255,255,0.7)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)' 
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords..." 
              className="p-3 rounded-[12px] placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
            />
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none"
            >
              <option value="">All States</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="gujarat">Gujarat</option>
              <option value="delhi">Delhi</option>
              <option value="karnataka">Karnataka</option>
            </select>
            <select 
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFilters({ ...filters, category: e.target.value || undefined });
              }}
              className="p-3 rounded-[12px] focus:outline-none focus:ring-2 bg-white text-[#111827] border border-gray-200 transition-all hover:border-gray-300 focus:border-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">No tenders found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setFilters({ page: 1, limit: 10, status: 'published' });
                setPage(1);
              }}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {tenders.length} of {total} tenders
            </div>
            <div className="space-y-4">
              {tenders.map((tender) => (
                <div 
                  key={tender._id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                  onClick={() => window.location.href = `/tenders/${tender._id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-mono text-gray-500">{tender.tenderNumber}</span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tender.title}</h3>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      {tender.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Filter size={14} />
                      {tender.issuingOrganization || 'Government'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Search size={14} />
                      ₹ {tender.budget.estimated?.toLocaleString() || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {new Date(tender.submissionDeadline).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > 10 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-900 text-white rounded-lg">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={tenders.length < 10}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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

const Calendar = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);