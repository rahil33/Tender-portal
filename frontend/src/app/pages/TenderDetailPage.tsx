import React from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, MapPin, Building2, FileText, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { DigitalSignaturePad } from '../components/DigitalSignaturePad';

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Mock tender data - in real app, fetch based on id
  const tender = {
    id: id,
    title: "Supply and Installation of IT Infrastructure Equipment",
    reference: "TENDER/2026/" + id,
    authority: "Government of Maharashtra",
    location: "Mumbai, Maharashtra",
    category: "IT Services & Equipment",
    value: "₹45,00,000",
    publishDate: "March 15, 2026",
    deadline: "April 25, 2026",
    description: "Tender for supply, installation, and commissioning of IT infrastructure equipment including servers, networking equipment, and storage solutions for government offices across Mumbai region.",
    eligibility: [
      "Registered company with valid GST registration",
      "Minimum 3 years experience in IT equipment supply",
      "Annual turnover of minimum ₹50 lakhs",
      "Valid ISO 9001:2015 certification"
    ],
    documents: [
      "Technical Bid Document",
      "Financial Bid Document",
      "Tender Fee Payment Receipt",
      "EMD (Earnest Money Deposit) Proof",
      "Company Registration Certificate",
      "GST Registration Certificate",
      "ISO Certification",
      "Past Performance Certificates"
    ],
    scope: [
      "Supply of 50 high-performance servers",
      "Installation of networking equipment",
      "Configuration and commissioning",
      "3 years comprehensive warranty",
      "Training for government staff",
      "24/7 technical support"
    ]
  };

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/tenders"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Tenders
        </Link>

        {/* Tender Header */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{tender.title}</h1>
              <p className="text-muted-foreground">Reference No: {tender.reference}</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
              Active
            </span>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Authority</p>
                <p className="font-semibold">{tender.authority}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{tender.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="font-semibold">{tender.value}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-secondary" />
              <span className="text-sm"><strong>Published:</strong> {tender.publishDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-700" />
              <span className="text-sm"><strong className="text-red-700">Deadline:</strong> {tender.deadline}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Tender Description</h2>
              <p className="text-foreground leading-relaxed">{tender.description}</p>
            </div>

            {/* Scope of Work */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Scope of Work</h2>
              <ul className="space-y-2">
                {tender.scope.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Eligibility Criteria</h2>
              <ul className="space-y-2">
                {tender.eligibility.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-foreground">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tender.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <FileText size={18} className="text-primary" />
                    <span className="text-sm text-foreground">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Signature Section */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Apply with Digital Signature</h2>
              <DigitalSignaturePad />
              <button className="w-full mt-6 px-6 py-3 bg-white text-gray-900 border border-gray-200 shadow-sm rounded-md hover:bg-gray-50 transition-colors font-bold">
                Submit Tender Application
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
              <h3 className="text-xl font-bold text-primary mb-4">Interested in this tender?</h3>
              <p className="text-muted-foreground text-sm mb-6">Get complete tender documents and expert assistance with your bid preparation.</p>
              <button className="w-full bg-white text-gray-900 border border-gray-200 shadow-sm py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors mb-3">
                Download Documents
              </button>
              <Link 
                to="/contact"
                className="w-full block text-center border border-gray-200 bg-white text-gray-900 shadow-sm py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Get Expert Help
              </Link>
              
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-bold mb-3">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-3">Our tender consultants can help you with:</p>
                <ul className="text-sm text-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Document preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Eligibility assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Bid submission support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}