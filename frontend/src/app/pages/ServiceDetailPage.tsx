import React from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle, Clock, Users, Award, TrendingUp } from 'lucide-react';

const servicesData: Record<string, any> = {
  'gem-registration': {
    title: 'GeM Registration Assistance',
    subtitle: 'Complete Support for Government e-Marketplace Registration',
    description: 'Get your business registered on the Government e-Marketplace (GeM) portal with expert guidance. We handle the entire registration process, ensuring compliance with all government requirements.',
    features: [
      'Complete documentation support',
      'Profile creation and verification',
      'Product/Service catalog setup',
      'Bank account verification',
      'Digital signature assistance',
      'OEM authorization support'
    ],
    benefits: [
      'Access to government tenders worth crores',
      'Direct selling to government departments',
      'Transparent and fair bidding process',
      'Quick payment settlements',
      'No tender fees required',
      'Pan-India market access'
    ],
    process: [
      { step: '1', title: 'Document Collection', desc: 'We help you gather all required documents' },
      { step: '2', title: 'Profile Setup', desc: 'Create and verify your GeM seller profile' },
      { step: '3', title: 'Catalog Creation', desc: 'Upload products/services with proper categorization' },
      { step: '4', title: 'Verification', desc: 'Complete all necessary verifications' },
      { step: '5', title: 'Training', desc: 'Learn how to use the GeM portal effectively' }
    ],
    pricing: '₹15,000 - ₹25,000',
    duration: '5-7 business days'
  },
  'tender-bidding': {
    title: 'Tender Bidding Support',
    subtitle: 'Expert Assistance in Winning Government Tenders',
    description: 'Maximize your chances of winning tenders with our professional bidding support services. From documentation to bid submission, we guide you through every step.',
    features: [
      'Tender identification and analysis',
      'Technical bid preparation',
      'Financial bid optimization',
      'Document compilation and verification',
      'EMD and tender fee guidance',
      'Online submission support'
    ],
    benefits: [
      'Higher success rate in winning tenders',
      'Professional documentation',
      'Compliance with all tender requirements',
      'Time-saving and efficient process',
      'Expert guidance from experienced consultants',
      'Post-bid support'
    ],
    process: [
      { step: '1', title: 'Tender Analysis', desc: 'Review eligibility and requirements' },
      { step: '2', title: 'Documentation', desc: 'Prepare all required documents' },
      { step: '3', title: 'Bid Preparation', desc: 'Create technical and financial bids' },
      { step: '4', title: 'Review', desc: 'Quality check of all submissions' },
      { step: '5', title: 'Submission', desc: 'Timely online bid submission' }
    ],
    pricing: '₹10,000 - ₹50,000 per tender',
    duration: 'Varies by tender complexity'
  },
  'oem-panel': {
    title: 'OEM Panel Setup',
    subtitle: 'Original Equipment Manufacturer Authorization',
    description: 'Get authorized as an OEM or reseller on the GeM portal. We help you establish your brand presence and enable other sellers to offer your products.',
    features: [
      'OEM authorization documentation',
      'Brand registration on GeM',
      'Product specifications setup',
      'Reseller authorization management',
      'Quality certification support',
      'Compliance documentation'
    ],
    benefits: [
      'Expand market reach through authorized resellers',
      'Brand protection on GeM platform',
      'Direct government procurement opportunities',
      'Control over product pricing and quality',
      'Streamlined authorization process',
      'Enhanced brand credibility'
    ],
    process: [
      { step: '1', title: 'Brand Assessment', desc: 'Evaluate OEM eligibility' },
      { step: '2', title: 'Documentation', desc: 'Prepare brand and product documents' },
      { step: '3', title: 'Registration', desc: 'Submit OEM application on GeM' },
      { step: '4', title: 'Verification', desc: 'Complete GeM verification process' },
      { step: '5', title: 'Activation', desc: 'Activate OEM panel and manage resellers' }
    ],
    pricing: '₹30,000 - ₹50,000',
    duration: '10-15 business days'
  },
  'catalogue-management': {
    title: 'Catalogue & Profile Management',
    subtitle: 'Professional Product Listing and Profile Optimization',
    description: 'Optimize your GeM catalog and seller profile for maximum visibility and sales. We ensure your products are properly categorized and competitively priced.',
    features: [
      'Product catalog creation',
      'Professional product descriptions',
      'Image optimization and upload',
      'Pricing strategy consultation',
      'Category-wise product mapping',
      'Regular catalog updates'
    ],
    benefits: [
      'Increased product visibility',
      'Better search rankings on GeM',
      'Professional presentation',
      'Competitive pricing advantage',
      'Reduced listing errors',
      'Higher conversion rates'
    ],
    process: [
      { step: '1', title: 'Catalog Audit', desc: 'Review existing products and listings' },
      { step: '2', title: 'Content Creation', desc: 'Develop professional descriptions' },
      { step: '3', title: 'Image Processing', desc: 'Optimize and upload quality images' },
      { step: '4', title: 'Pricing Analysis', desc: 'Set competitive prices' },
      { step: '5', title: 'Ongoing Support', desc: 'Regular updates and optimization' }
    ],
    pricing: '₹8,000 - ₹20,000 per month',
    duration: 'Ongoing service'
  },
  'training': {
    title: 'GeM Training Services',
    subtitle: 'Comprehensive Training for GeM Portal Usage',
    description: 'Learn to navigate and utilize the GeM portal effectively with our hands-on training programs. Suitable for sellers, buyers, and procurement professionals.',
    features: [
      'One-on-one training sessions',
      'Group training workshops',
      'Portal navigation guidance',
      'Bidding process training',
      'Order management training',
      'Best practices and tips'
    ],
    benefits: [
      'Confidence in using GeM portal',
      'Reduced dependency on consultants',
      'Better understanding of bidding process',
      'Improved success rate',
      'Cost savings in long term',
      'Continuous support'
    ],
    process: [
      { step: '1', title: 'Needs Assessment', desc: 'Identify training requirements' },
      { step: '2', title: 'Customization', desc: 'Tailor training to your needs' },
      { step: '3', title: 'Training Sessions', desc: 'Conduct interactive training' },
      { step: '4', title: 'Hands-on Practice', desc: 'Practice with live scenarios' },
      { step: '5', title: 'Follow-up Support', desc: 'Post-training assistance' }
    ],
    pricing: '₹5,000 - ₹15,000 per session',
    duration: '2-4 hours per session'
  }
};

export default function ServiceDetailPage() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const service = serviceSlug ? servicesData[serviceSlug] : null;

  if (!service) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[#0B3D91] mb-4">Service Not Found</h1>
          <Link to="/services" className="text-[#D4AF37] hover:underline">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-[#0B3D91] hover:underline mb-8"
        >
          <ArrowLeft size={18} />
          Back to Services
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white rounded-2xl p-10 mb-8">
          <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
          <p className="text-lg opacity-90">{service.subtitle}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{service.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-[#0B3D91] mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-[#0B3D91] mb-6">Our Process</h2>
              <div className="space-y-5">
                {service.process.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-[#0B3D91] text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold mb-0.5">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-[#0B3D91] mb-6">Key Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.benefits.map((benefit: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <TrendingUp size={18} className="text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Get Started Today Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-[96px]">
              <h3 className="text-lg font-bold text-[#0B3D91] mb-5 pb-3 border-b border-gray-100">
                Get Started Today
              </h3>

              {/* Pricing box */}
              <div
                className="rounded-xl p-5 mb-4 text-center"
                style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0d2f4f 100%)' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Starting From</span>
                <span className="block font-bold mb-0.5" style={{ color: '#FFB347', fontSize: '1.6rem' }}>
                  {service.pricing}
                </span>
                <span className="text-gray-400 text-xs">per engagement</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-3">
                <Clock className="text-[#0B3D91] shrink-0" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Timeline</p>
                  <p className="font-bold text-sm text-[#0B3D91]">{service.duration}</p>
                </div>
              </div>

              <Link
                to="/contact"
                className="w-full block text-center bg-[#0B3D91] text-white py-3 rounded-lg font-bold hover:bg-[#092d6e] transition-colors mb-2 text-sm"
              >
                Request Consultation
              </Link>
              <Link
                to="/contact"
                className="w-full block text-center border-2 border-[#FFB347] text-[#0B3D91] py-3 rounded-lg font-bold hover:bg-amber-50 transition-colors text-sm"
              >
                Get a Quote
              </Link>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gradient-to-br from-[#0B3D91] to-[#1e5bb8] text-white rounded-xl p-6">
              <h3 className="font-bold mb-4">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="shrink-0 mt-0.5 text-[#FFB347]" />
                  <div>
                    <p className="font-semibold text-sm">10+ Years Experience</p>
                    <p className="text-xs opacity-75">Expert GeM consultants</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="shrink-0 mt-0.5 text-[#FFB347]" />
                  <div>
                    <p className="font-semibold text-sm">5000+ Successful Projects</p>
                    <p className="text-xs opacity-75">Proven track record</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="shrink-0 mt-0.5 text-[#FFB347]" />
                  <div>
                    <p className="font-semibold text-sm">100% Compliance</p>
                    <p className="text-xs opacity-75">All government regulations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}