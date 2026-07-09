import React from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen } from 'lucide-react';

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Mock blog data - in real app, fetch based on slug
  const article = {
    slug: slug,
    title: 'Complete Guide to GeM Registration in 2026',
    category: 'GeM Portal',
    author: 'Rajesh Sharma',
    authorRole: 'Founder & CEO',
    date: 'March 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGFydGljbGV8ZW58MXx8fHwxNzc0NzY2ODEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    content: `
      <h2>Introduction to Government e-Marketplace (GeM)</h2>
      <p>The Government e-Marketplace (GeM) is a revolutionary online platform that has transformed how government procurement works in India. Launched in 2016, GeM provides a transparent, efficient, and inclusive platform for government buyers and sellers to connect.</p>
      
      <p>In this comprehensive guide, we'll walk you through everything you need to know about GeM registration in 2026, including the latest updates, requirements, and best practices.</p>

      <h2>Why Register on GeM?</h2>
      <p>Before diving into the registration process, let's understand why your business should be on GeM:</p>
      <ul>
        <li><strong>Direct Access to Government Buyers:</strong> Connect directly with thousands of government departments and PSUs</li>
        <li><strong>Transparent Bidding Process:</strong> Fair and transparent procurement system</li>
        <li><strong>No Tender Fees:</strong> Unlike traditional tenders, GeM transactions don't require tender fees</li>
        <li><strong>Quick Payments:</strong> Faster payment processing compared to traditional government procurement</li>
        <li><strong>Pan-India Reach:</strong> Access to buyers across the entire country</li>
      </ul>

      <h2>Eligibility Criteria</h2>
      <p>To register as a seller on GeM, your business must meet the following requirements:</p>
      <ul>
        <li>Valid PAN card</li>
        <li>GST registration (mandatory for most categories)</li>
        <li>Active business bank account</li>
        <li>Digital signature certificate (Class 3)</li>
        <li>Business registration documents (proprietorship/partnership/company registration)</li>
      </ul>

      <h2>Step-by-Step Registration Process</h2>
      
      <h3>Step 1: Initial Registration</h3>
      <p>Visit the GeM portal at gem.gov.in and click on the "Sign Up" button. You'll need to provide basic details including your mobile number and email address for OTP verification.</p>

      <h3>Step 2: Choose Seller Type</h3>
      <p>Select your business entity type:</p>
      <ul>
        <li>Sole Proprietorship</li>
        <li>Partnership Firm</li>
        <li>Limited Liability Partnership (LLP)</li>
        <li>Private/Public Limited Company</li>
      </ul>

      <h3>Step 3: Complete Business Profile</h3>
      <p>Fill in comprehensive business information including company name, address, PAN details, GST number, and banking information. Ensure all details match your official documents exactly.</p>

      <h3>Step 4: Document Upload</h3>
      <p>Upload all required documents in the specified format. Common documents include:</p>
      <ul>
        <li>PAN card</li>
        <li>GST registration certificate</li>
        <li>Company registration certificate</li>
        <li>Bank account details with cancelled cheque</li>
        <li>Digital signature certificate</li>
      </ul>

      <h3>Step 5: Verification</h3>
      <p>After submission, your application will undergo verification by the GeM team. This typically takes 2-5 business days. You'll receive updates via email and SMS.</p>

      <h3>Step 6: Catalog Creation</h3>
      <p>Once verified, you can start creating your product/service catalog. This is crucial for visibility and sales on the platform.</p>

      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li><strong>Incorrect GST Details:</strong> Double-check your GST number matches exactly with your certificate</li>
        <li><strong>Poor Product Descriptions:</strong> Invest time in creating detailed, accurate product descriptions</li>
        <li><strong>Wrong Categorization:</strong> Ensure products are listed in the correct categories</li>
        <li><strong>Pricing Errors:</strong> Be competitive but realistic with your pricing</li>
      </ul>

      <h2>Post-Registration Best Practices</h2>
      <p>After successful registration, follow these best practices:</p>
      <ul>
        <li>Keep your catalog updated regularly</li>
        <li>Respond promptly to buyer queries</li>
        <li>Maintain adequate stock levels</li>
        <li>Ensure timely delivery</li>
        <li>Monitor your seller rating and feedback</li>
      </ul>

      <h2>Need Help with Registration?</h2>
      <p>If you find the registration process overwhelming or want expert assistance, Phoenix Tender Tech offers comprehensive GeM registration services. Our team can handle the entire process for you, ensuring error-free registration and optimal catalog setup.</p>

      <h2>Conclusion</h2>
      <p>GeM registration opens up immense opportunities for businesses to tap into the government procurement market. While the process might seem complex initially, following this guide will help you navigate it successfully. Remember, proper registration and catalog management are key to your success on the platform.</p>

      <p>For any assistance with GeM registration or questions about the process, feel free to contact our expert team at Phoenix Tender Tech.</p>
    `
  };

  const relatedArticles = [
    { title: '10 Essential Tips for Winning Government Tenders', slug: 'tender-bidding-tips' },
    { title: 'Understanding OEM Authorization on GeM', slug: 'oem-authorization-process' },
    { title: 'MSME Certificates: Types and Benefits', slug: 'msme-certificates-guide' }
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/resources"
          className="inline-flex items-center gap-2 text-[#0B3D91] hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Resources
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Featured Image */}
          <div className="aspect-video overflow-hidden">
            <img 
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Meta */}
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="px-4 py-2 bg-blue-50 text-[#0B3D91] font-semibold rounded-full">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span>{article.readTime}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-[#0B3D91] mb-6">{article.title}</h1>

            {/* Author Info */}
            <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0B3D91] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{article.author}</p>
                  <p className="text-sm text-gray-600">{article.authorRole}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
                Share
              </button>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:text-[#0B3D91] prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-ul:my-6 prose-li:text-gray-700 prose-li:mb-2
                prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        {/* Author CTA */}
        <div className="bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white text-[#0B3D91] rounded-full flex items-center justify-center font-bold text-2xl">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-xl">{article.author}</p>
              <p className="opacity-90">{article.authorRole}</p>
            </div>
          </div>
          <p className="mb-4 opacity-90">
            Expert in government procurement with over 15 years of experience helping businesses succeed in tender bidding.
          </p>
          <Link 
            to="/contact"
            className="inline-block px-6 py-3 bg-white text-[#0B3D91] rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Get Expert Consultation
          </Link>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={24} className="text-[#0B3D91]" />
            <h2 className="text-2xl font-bold text-[#0B3D91]">Related Articles</h2>
          </div>
          <div className="space-y-4">
            {relatedArticles.map((related, index) => (
              <Link
                key={index}
                to={`/resources/${related.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#0B3D91] transition-all group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0B3D91] flex items-center justify-between">
                  {related.title}
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-[#0B3D91]" />
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
