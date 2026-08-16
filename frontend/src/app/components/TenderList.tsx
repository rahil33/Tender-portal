import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, Building2, ExternalLink, Clock, Tag, LogIn, FileText, Download, X } from 'lucide-react';
import { motion } from 'motion/react';
import { liveTenderService, LiveTender } from '../../services/liveTenderService';
import { LoadingSpinner, Skeleton } from '../../components/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export const TenderList: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tenders, setTenders] = useState<LiveTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [docMenuTender, setDocMenuTender] = useState<LiveTender | null>(null);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        // First try to get live tenders from GeM sync
        const response = await liveTenderService.getLiveTenders({
          page: 1,
          limit: 4,
          status: 'published',
          isArchived: false,
        });
        setTenders(response.data?.data ?? []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError(null);
          setTenders([]);
          return;
        }
        console.error('Failed to fetch tenders:', err);
        setError(err.response?.data?.message || 'Failed to load tenders');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTenders();
    } else {
      setLoading(false);
      setTenders([]);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="mb-12">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <div className="hidden lg:block rounded-2xl shadow-sm bg-white border border-[#E5E7EB]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 border-b border-gray-100 last:border-0">
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="font-bold uppercase tracking-widest text-sm mb-3 block text-[#2563EB]">Market Opportunities</span>
              <h2 className="text-4xl font-bold mb-4 text-[#111827]">Latest Active Tenders</h2>
              <p className="text-lg leading-relaxed text-[#6B7280]">
                Real-time feed of the most recent GeM procurement opportunities across India.
              </p>
            </div>
            <Link
              to="/tenders"
              className="px-6 py-2.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 text-white bg-[#111827] hover:bg-[#2563EB] shadow-md"
            >
              Browse All <ExternalLink size={18} />
            </Link>
          </div>
          <div className="p-12 bg-white border border-[#E5E7EB] rounded-2xl text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={30} className="text-gray-500" />
            </div>
            <p className="text-lg font-bold text-[#111827] mb-2">Login Required</p>
            <p className="text-sm text-[#6B7280] mb-6">Please sign in to access live GeM tenders.</p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-3 rounded-lg font-bold transition-all cursor-pointer text-white bg-[#16A34A] hover:bg-[#15803D]"
            >
              Login
            </button>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode="login" />
      </section>
    );
  }

  if (tenders.length === 0) {
    return (
      <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="font-bold uppercase tracking-widest text-sm mb-3 block text-[#2563EB]">Market Opportunities</span>
              <h2 className="text-4xl font-bold mb-4 text-[#111827]">Latest Active Tenders</h2>
              <p className="text-lg leading-relaxed text-[#6B7280]">
                Real-time feed of the most recent government and private sector procurement opportunities across India.
              </p>
            </div>
            <Link
              to="/tenders"
              className="px-6 py-2.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 text-white bg-[#111827] hover:bg-[#2563EB] shadow-md"
            >
              Browse All <ExternalLink size={18} />
            </Link>
          </div>
          <div className="p-12 bg-white border border-[#E5E7EB] rounded-2xl text-center">
            <p className="text-lg font-bold text-[#111827] mb-2">No live tenders available at the moment</p>
            <p className="text-sm text-[#6B7280]">New tenders are synced automatically. Please check back shortly.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="font-bold uppercase tracking-widest text-sm mb-3 block text-[#2563EB]">Market Opportunities</span>
            <h2 className="text-4xl font-bold mb-4 text-[#111827]">Latest Active Tenders</h2>
            <p className="text-lg leading-relaxed text-[#6B7280]">
              Real-time feed of the most recent government and private sector procurement opportunities across India.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg px-4 py-2 flex items-center gap-2 bg-white border border-[#E5E7EB]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              <span className="text-sm font-bold text-[#111827]">{tenders.length} Active</span>
            </div>
            <Link 
              to="/tenders"
              className="px-6 py-2.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 text-white bg-[#111827] hover:bg-[#2563EB] shadow-md"
            >
              Browse All <ExternalLink size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link
            to="/tenders"
            className="px-5 py-2 rounded-full text-sm font-bold cursor-pointer bg-[#111827] text-white hover:bg-[#2563EB] transition-colors shadow-sm inline-block"
          >
            All Sectors
          </Link>
          <Link
            to="/tenders?category=construction"
            className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827] inline-block"
          >
            Construction
          </Link>
          <Link
            to="/tenders?category=it-telecom"
            className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827] inline-block"
          >
            IT & Telecom
          </Link>
          <Link
            to="/tenders?category=healthcare"
            className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827] inline-block"
          >
            Healthcare
          </Link>
          <Link
            to="/tenders?category=defence"
            className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827] inline-block"
          >
            Defence
          </Link>
        </div>

        {/* Table Layout for Desktop */}
        <div className="hidden lg:block overflow-hidden rounded-2xl shadow-sm bg-white border border-[#E5E7EB]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">Opportunity Details</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">Department / Authority</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">Value & Location</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">Due Date</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {tenders.map((tender, index) => (
                <motion.tr 
                  key={tender._id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="transition-colors group hover:bg-[#F8FAFC]"
                >
                  <td className="px-8 py-7 max-w-[450px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280]">
                          {tender.tenderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          GeM
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#6B7280]">
                          <Tag size={12} /> {tender.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold transition-colors leading-snug text-[#111827] group-hover:text-[#2563EB]">
                        {tender.title}
                      </h3>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                        <Building2 size={16} className="shrink-0 text-[#6B7280]" />
                        <span className="line-clamp-1">{tender.issuingOrganization || 'Government Tender'}</span>
                      </div>
                      <span className="text-xs pl-6 text-[#6B7280]">Verified Authority</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-sm font-bold w-fit px-2 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                        ₹ {tender.budget.estimated?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <MapPin size={14} className="shrink-0" />
                        {tender.location || 'India'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#EF4444]">
                        <Clock size={16} />
                        {tender.submissionDeadline
                          ? new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden bg-[#E5E7EB]">
                        <div className="h-full w-[30%] bg-[#EF4444]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {tender.metadata?.bidDownloadUrl ? (
                        <a
                          href={tender.metadata.bidDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-2.5 text-[#16A34A] bg-white border border-[#16A34A]/40 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95 hover:bg-[#16A34A]/5"
                        >
                          Download Bid
                        </a>
                      ) : (
                        <span className="inline-block px-6 py-2.5 text-[#9CA3AF] text-xs font-bold whitespace-nowrap">
                          Bid doc unavailable
                        </span>
                      )}
                      <button
                        onClick={() => setDocMenuTender(tender)}
                        disabled={!((tender.documents ?? []).some((d) => d.url || d.documentUrl))}
                        title={(tender.documents ?? []).some((d) => d.url || d.documentUrl)
                          ? 'View tender documents'
                          : 'No documents available for this tender'}
                        className="inline-block px-6 py-2.5 text-[#2563EB] bg-white border border-[#2563EB]/40 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95 hover:bg-[#2563EB]/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center gap-1.5"
                      >
                        <FileText size={14} /> Documents
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="lg:hidden flex flex-col gap-6">
          {tenders.map((tender) => (
            <div
              key={tender._id}
              className="p-6 rounded-2xl flex flex-col gap-4 transition-all bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280]">
                  {tender.tenderNumber}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    GeM
                  </span>
                  <span className="text-xs font-bold flex items-center gap-1 text-[#EF4444]">
                    <Clock size={14} />
                    {tender.submissionDeadline
                      ? new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                      : 'N/A'}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-[#6B7280]">{tender.category}</span>
                <h3 className="text-xl font-bold leading-tight text-[#111827]">{tender.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#E5E7EB]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Authority</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                    <Building2 size={14} className="text-[#6B7280]" />
                    <span className="line-clamp-1">{tender.issuingOrganization || 'Govt'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Estimated Value</span>
                  <div className="text-xs font-bold text-[#16A34A]">
                    ₹ {tender.budget.estimated?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <MapPin size={14} className="text-[#6B7280]" />
                {tender.location || 'India'}
              </div>
              <div className="flex items-center gap-2">
                {tender.metadata?.bidDownloadUrl ? (
                  <a
                    href={tender.metadata.bidDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 font-bold rounded-xl text-sm cursor-pointer transition-all text-[#16A34A] bg-white border border-[#16A34A]/40 hover:bg-[#16A34A]/5 text-center"
                  >
                    Download Bid
                  </a>
                ) : (
                  <span className="flex-1 py-3 font-bold rounded-xl text-sm text-center text-[#9CA3AF] bg-[#F8FAFC] border border-[#E5E7EB]">
                    Bid document unavailable
                  </span>
                )}
                <button
                  onClick={() => setDocMenuTender(tender)}
                  disabled={!((tender.documents ?? []).some((d) => d.url || d.documentUrl))}
                  title={(tender.documents ?? []).some((d) => d.url || d.documentUrl)
                    ? 'View tender documents'
                    : 'No documents available for this tender'}
                  className="flex-1 py-3 font-bold rounded-xl text-sm cursor-pointer transition-all text-[#2563EB] bg-white border border-[#2563EB]/40 hover:bg-[#2563EB]/5 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center justify-center gap-1.5"
                >
                  <FileText size={14} /> Documents
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents modal */}
      {docMenuTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDocMenuTender(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900">Tender Documents</h3>
                <p className="text-xs font-mono text-gray-500 break-all mt-1">{docMenuTender.tenderNumber}</p>
              </div>
              <button
                onClick={() => setDocMenuTender(null)}
                className="shrink-0 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close documents"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const docs = docMenuTender.documents ?? [];
              const available = docs.filter((d) => d.url || d.documentUrl);
              if (available.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No documents are available for this tender.
                  </div>
                );
              }
              return (
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {available.map((doc, idx) => {
                    const url = doc.url || doc.documentUrl || '';
                    const label = doc.name || doc.documentName || 'GeM Document';
                    const sub = (doc.type || doc.documentType || 'document').toUpperCase();
                    return (
                      <li key={idx}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          <FileText size={16} className="shrink-0 text-green-600" />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-gray-900 truncate">{label}</span>
                            <span className="block text-xs text-gray-400">{sub}</span>
                          </span>
                          <Download size={14} className="shrink-0 text-gray-400" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default TenderList;