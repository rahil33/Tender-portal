import React from 'react';
import { Services } from '../components/Services';
import { CertificateServices } from '../components/CertificateServices';

export default function ServicesPage() {
  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0B3D91] mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tender and certification solutions to help your business grow
          </p>
        </div>
        
        <Services />
        <CertificateServices />
      </div>
    </div>
  );
}
