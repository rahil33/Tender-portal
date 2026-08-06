import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';

interface TenderImage {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  referenceNumber: string;
  imageUrl: string;
}

const tenderImages: TenderImage[] = [
  {
    id: '1',
    title: 'Railway Infrastructure Development',
    category: 'Infrastructure',
    dueDate: 'March 30, 2026',
    referenceNumber: 'RFP/2026/001',
    imageUrl: ''
  },
  {
    id: '2',
    title: 'Medical Equipment Supply',
    category: 'Healthcare',
    dueDate: 'April 5, 2026',
    referenceNumber: 'RFP/2026/002',
    imageUrl: ''
  },
  {
    id: '3',
    title: 'IT Infrastructure Upgrade',
    category: 'Technology',
    dueDate: 'April 10, 2026',
    referenceNumber: 'RFP/2026/003',
    imageUrl: ''
  },
  {
    id: '4',
    title: 'School Building Construction',
    category: 'Construction',
    dueDate: 'April 15, 2026',
    referenceNumber: 'RFP/2026/004',
    imageUrl: ''
  },
  {
    id: '5',
    title: 'Water Supply Project',
    category: 'Infrastructure',
    dueDate: 'April 20, 2026',
    referenceNumber: 'RFP/2026/005',
    imageUrl: ''
  },
  {
    id: '6',
    title: 'Road Development Project',
    category: 'Infrastructure',
    dueDate: 'April 25, 2026',
    referenceNumber: 'RFP/2026/006',
    imageUrl: ''
  }
];

export const TenderGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<TenderImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenderImages.map((tender) => (
          <div
            key={tender.id}
            className="group relative bg-white/75 backdrop-blur-[20px] rounded-[20px] overflow-hidden border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_rgba(22,163,74,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedImage(tender)}
          >
            {/* Placeholder Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-100 rounded-[16px] mx-auto flex items-center justify-center border border-emerald-200">
                    <span className="text-3xl font-bold text-[#16A34A]">📄</span>
                  </div>
                  <p className="text-sm text-[#6B7280] px-4 font-medium">Tender Document Preview</p>
                </div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 backdrop-blur-[0px] group-hover:backdrop-blur-[4px] transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-12 h-12 text-[#16A34A]" />
                </div>
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-[#16A34A] text-white text-xs font-semibold rounded-full shadow-[0_2px_8px_rgba(22,163,74,0.3)]">
                {tender.category}
              </div>
              
              {/* Due Date */}
              <div className="absolute top-3 right-3 px-3 py-1 bg-white text-[#111827] text-xs font-semibold rounded-full border border-gray-100 shadow-sm">
                Due: {tender.dueDate}
              </div>
              
              {/* Reference Number Watermark */}
              <div className="absolute bottom-3 left-3 text-xs text-[#6B7280] font-mono font-medium">
                {tender.referenceNumber}
              </div>
            </div>
            
            {/* Info */}
            <div className="p-5">
              <h3 className="font-bold text-[#111827] mb-2 group-hover:text-[#16A34A] transition-colors">
                {tender.title}
              </h3>
              <button className="text-[#14B8A6] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View Details
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-teal-50 rounded-[24px] relative mb-6 border border-emerald-100 shadow-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white rounded-[20px] mx-auto flex items-center justify-center shadow-sm border border-emerald-100">
                    <span className="text-5xl">📄</span>
                  </div>
                  <div className="text-[#111827] space-y-2">
                    <p className="text-lg font-bold">Tender Document Preview</p>
                    <p className="text-sm text-[#6B7280] font-mono">{selectedImage.referenceNumber}</p>
                  </div>
                </div>
              </div>

              {/* Category and Due Date */}
              <div className="absolute top-6 left-6 right-6 flex justify-between">
                <div className="px-4 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-full shadow-md">
                  {selectedImage.category}
                </div>
                <div className="px-4 py-2 bg-white text-[#111827] text-sm font-semibold rounded-full shadow-md border border-gray-100">
                  Due: {selectedImage.dueDate}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-[24px] p-8 shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-[#111827] mb-2">{selectedImage.title}</h2>
              <p className="text-sm text-[#6B7280] font-mono mb-6">Reference: {selectedImage.referenceNumber}</p>
              <div className="flex gap-4">
                <button 
                  className="px-6 py-3 rounded-[12px] transition-all text-white font-bold hover:-translate-y-0.5 active:scale-95"
                  style={{ background: '#16A34A', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}
                >
                  View Full Details
                </button>
                <button className="px-6 py-3 border border-gray-200 bg-white text-[#111827] font-bold rounded-[12px] shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-0.5 active:scale-95">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};