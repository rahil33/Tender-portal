import React from 'react';
import { Link } from 'react-router';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Graphic */}
        <div className="mb-8">
          <div className="inline-block relative">
            <div className="text-[200px] font-bold text-[#0B3D91] opacity-10 leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileQuestion size={120} className="text-[#0B3D91]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#0B3D91] mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0B3D91] text-white rounded-lg font-bold hover:bg-[#092d6e] transition-colors"
          >
            <Home size={20} />
            Go to Homepage
          </Link>
          <Link
            to="/tenders"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#0B3D91] text-[#0B3D91] rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            <Search size={20} />
            Browse Tenders
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-[#0B3D91] mb-6">
            You might be looking for:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/tenders"
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#0B3D91] transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-[#0B3D91] mb-1">
                Live Tenders
              </h3>
              <p className="text-sm text-gray-600">
                Browse active government tenders
              </p>
            </Link>
            <Link
              to="/services"
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#0B3D91] transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-[#0B3D91] mb-1">
                Our Services
              </h3>
              <p className="text-sm text-gray-600">
                Explore our tender solutions
              </p>
            </Link>
            <Link
              to="/gem-consultant"
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#0B3D91] transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-[#0B3D91] mb-1">
                GeM Consultant
              </h3>
              <p className="text-sm text-gray-600">
                GeM registration & support
              </p>
            </Link>
            <Link
              to="/contact"
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#0B3D91] transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-[#0B3D91] mb-1">
                Contact Us
              </h3>
              <p className="text-sm text-gray-600">
                Get in touch with our team
              </p>
            </Link>
          </div>
        </div>

        {/* Error Code */}
        <p className="mt-8 text-sm text-gray-500">
          Error Code: 404 - Page Not Found
        </p>
      </div>
    </div>
  );
}
