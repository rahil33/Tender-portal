import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Calendar, MapPin, Building2, FileText, Clock, ArrowLeft,
  Download, CheckCircle, History, ChevronDown, ChevronUp,
  ExternalLink, MessageCircle, AlertCircle,
} from 'lucide-react';
import { DigitalSignaturePad } from '../components/DigitalSignaturePad';

type DownloadState = 'idle' | 'downloading' | 'done';

const revisions = [
  {
    version: 'v3.0',
    date: 'April 10, 2026',
    updatedBy: 'Procurement Cell, Govt. of Maharashtra',
    summary: 'Extended submission deadline by 10 days. Updated EMD amount from ₹1,00,000 to ₹1,50,000.',
    current: true,
  },
  {
    version: 'v2.0',
    date: 'March 28, 2026',
    updatedBy: 'Procurement Cell, Govt. of Maharashtra',
    summary: 'Revised technical specifications for server requirements. Added ISO 27001 as mandatory certification.',
    current: false,
  },
  {
    version: 'v1.0',
    date: 'March 15, 2026',
    updatedBy: 'Procurement Cell, Govt. of Maharashtra',
    summary: 'Initial tender notice published.',
    current: false,
  },
];

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedRevision, setExpandedRevision] = useState<string | null>('v3.0');

  const tender = {
    id,
    title: 'Supply and Installation of IT Infrastructure Equipment',
    reference: 'TENDER/2026/' + id,
    authority: 'Government of Maharashtra',
    location: 'Mumbai, Maharashtra',
    category: 'IT Services & Equipment',
    value: '₹45,00,000',
    publishDate: 'March 15, 2026',
    deadline: 'April 25, 2026',
    description:
      'Tender for supply, installation, and commissioning of IT infrastructure equipment including servers, networking equipment, and storage solutions for government offices across Mumbai region.',
    eligibility: [
      'Registered company with valid GST registration',
      'Minimum 3 years experience in IT equipment supply',
      'Annual turnover of minimum ₹50 lakhs',
      'Valid ISO 9001:2015 certification',
    ],
    documents: [
      'Technical Bid Document',
      'Financial Bid Document',
      'Tender Fee Payment Receipt',
      'EMD (Earnest Money Deposit) Proof',
      'Company Registration Certificate',
      'GST Registration Certificate',
      'ISO Certification',
      'Past Performance Certificates',
    ],
    scope: [
      'Supply of 50 high-performance servers',
      'Installation of networking equipment',
      'Configuration and commissioning',
      '3 years comprehensive warranty',
      'Training for government staff',
      '24/7 technical support',
    ],
  };

  function handleDownload() {
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setDownloadState('done');
          setTimeout(() => { setDownloadState('idle'); setDownloadProgress(0); }, 4000);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  }

  const inputCls =
    'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-gray-300';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1200px] mx-auto px-4 py-12">

        {/* Back */}
        <Link to="/tenders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 text-sm font-medium transition-colors">
          <ArrowLeft size={18} /> Back to Tenders
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {tender.title}
              </h1>
              <p className="text-sm text-gray-400">Reference No: <span className="font-medium text-gray-600">{tender.reference}</span></p>
            </div>
            <span className="self-start px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full font-semibold text-sm whitespace-nowrap">
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {[
              { icon: <Building2 size={18} />, label: 'Authority', value: tender.authority },
              { icon: <MapPin size={18} />, label: 'Location', value: tender.location },
              { icon: <FileText size={18} />, label: 'Estimated Value', value: tender.value },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-[#16A34A] flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-[#16A34A]" />
              <span className="text-gray-500">Published:</span>
              <span className="font-semibold text-gray-900">{tender.publishDate}</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-red-500" />
              <span className="text-gray-500">Deadline:</span>
              <span className="font-semibold text-red-600">{tender.deadline}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Tender Description</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{tender.description}</p>
            </div>

            {/* Scope */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Scope of Work</h2>
              <ul className="space-y-2.5">
                {tender.scope.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-[#16A34A] flex-shrink-0 mt-0.5">
                      <CheckCircle size={12} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Eligibility Criteria</h2>
              <ul className="space-y-2.5">
                {tender.eligibility.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Required Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tender.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <FileText size={15} className="text-[#16A34A] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Revision History ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
                    <History size={16} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Tender Changes / Revision History</h2>
                    <p className="text-xs text-gray-400">{revisions.length} versions — current: {revisions[0].version}</p>
                  </div>
                </div>
                {historyOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {historyOpen && (
                <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                  <div className="relative">
                    {/* Timeline rail */}
                    <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-100" />

                    <div className="space-y-4">
                      {revisions.map((rev) => (
                        <div key={rev.version} className="relative pl-11">
                          {/* Dot */}
                          <div className={`absolute left-0 top-3 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${rev.current ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                            {rev.version.replace('v', '')}
                          </div>

                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rev.current ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500'}`}>
                                  {rev.current ? 'Current' : rev.version}
                                </span>
                                <span className="text-xs text-gray-400">{rev.date}</span>
                              </div>
                              {!rev.current && (
                                <button className="text-xs text-[#16A34A] hover:underline font-medium flex items-center gap-1">
                                  <ExternalLink size={11} /> View Previous Version
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{rev.summary}</p>
                            <p className="text-xs text-gray-400">Updated by: {rev.updatedBy}</p>
                          </div>

                          {/* Accordion expand toggle */}
                          <button
                            onClick={() => setExpandedRevision(expandedRevision === rev.version ? null : rev.version)}
                            className="text-xs text-gray-400 hover:text-gray-600 mt-1 ml-1 flex items-center gap-1 transition-colors"
                          >
                            {expandedRevision === rev.version ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {expandedRevision === rev.version ? 'Hide details' : 'Show details'}
                          </button>
                          {expandedRevision === rev.version && (
                            <div className="mt-2 ml-1 p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 leading-relaxed">
                              <strong className="text-gray-700">Change note:</strong> {rev.summary}
                              <div className="mt-1 text-gray-400">Last updated {rev.date} by the {rev.updatedBy}.</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Digital Signature */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Apply with Digital Signature</h2>
              <DigitalSignaturePad />
              <button className="w-full mt-6 py-3.5 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                Submit Tender Application
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-1 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Interested in this tender?</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Get complete documents and expert assistance for your bid.</p>

              {/* Download Button */}
              <div className="mb-3">
                {downloadState === 'downloading' && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Preparing documents…</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDownload}
                  disabled={downloadState === 'downloading'}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    downloadState === 'done'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : downloadState === 'downloading'
                      ? 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#16A34A] text-white hover:bg-[#15803D] hover:-translate-y-0.5'
                  }`}
                >
                  {downloadState === 'done' ? (
                    <><CheckCircle size={16} /> Documents Downloaded</>
                  ) : downloadState === 'downloading' ? (
                    <><Download size={16} className="animate-bounce" /> Downloading…</>
                  ) : (
                    <><Download size={16} /> Download Documents</>
                  )}
                </button>

                {downloadState === 'done' && (
                  <p className="text-xs text-green-600 text-center mt-2 flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Saved to your downloads folder
                  </p>
                )}
              </div>

              <Link
                to="/contact"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all mb-4"
              >
                <MessageCircle size={15} /> Get Expert Help
              </Link>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Our consultants help with:</h4>
                <ul className="space-y-2">
                  {['Document preparation', 'Eligibility assessment', 'Bid submission support'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Deadline on <strong>{tender.deadline}</strong>. Ensure all documents are ready.
                </p>
              </div>
            </div>

            {/* Payment CTA */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h4 className="font-bold text-gray-900 mb-2 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Need Premium Access?</h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Unlock full tender database, expert support, and priority notifications.</p>
              <Link
                to="/payment"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
