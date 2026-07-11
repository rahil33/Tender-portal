import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, Building2, ExternalLink, Clock, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { tenderService, Tender } from '../../services/tenderService';
import { LoadingSpinner, Skeleton } from '../../components/Loading';

export const TenderList: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await tenderService.getAllTenders({
          page: 1,
          limit: 4,
          status: 'published',
        });
        setTenders(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch tenders:', err);
        setError(err.response?.data?.message || 'Failed to load tenders');
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

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
          <button className="px-5 py-2 rounded-full text-sm font-bold cursor-pointer bg-[#111827] text-white hover:bg-[#2563EB] transition-colors shadow-sm">All Sectors</button>
          <button className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]">Construction</button>
          <button className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]">IT & Telecom</button>
          <button className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]">Healthcare</button>
          <button className="px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]">Defence</button>
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
                        {new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden bg-[#E5E7EB]">
                        <div className="h-full w-[30%] bg-[#EF4444]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <Link 
                      to={`/tenders/${tender._id}`}
                      className="inline-block px-6 py-2.5 text-[#111827] bg-white border border-[#E5E7EB] text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95 hover:border-[#111827]"
                    >
                      View Details
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="lg:hidden flex flex-col gap-6">
          {tenders.map((tender) => (
            <Link 
              key={tender._id}
              to={`/tenders/${tender._id}`}
              className="p-6 rounded-2xl flex flex-col gap-4 transition-all bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280]">
                  {tender.tenderNumber}
                </span>
                <span className="text-xs font-bold flex items-center gap-1 text-[#EF4444]">
                  <Clock size={14} />
                  {new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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
              <button className="w-full py-3 font-bold rounded-xl text-sm cursor-pointer transition-all text-[#111827] bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC]">
                View Tender Details
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};