import React from 'react';
import { FileText, AlertCircle, Shield, UserCheck, Ban, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText size={64} className="mx-auto text-[#0B3D91] mb-4" />
          <h1 className="text-4xl font-bold text-[#0B3D91] mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: March 29, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Phoenix Tender Tech website and services, you agree to be bound by these Terms 
              and Conditions. If you do not agree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">User Accounts</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms.</p>
              <p>You are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Services Description</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Phoenix Tender Tech provides:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Government tender information and alerts</li>
                <li>GeM registration and consultation services</li>
                <li>Tender bidding support and documentation</li>
                <li>Certificate assistance (MSME, ISO, etc.)</li>
                <li>OEM panel setup and management</li>
              </ul>
              <p className="mt-4">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time without 
                prior notice.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Payment Terms</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>All fees are quoted in Indian Rupees (INR) and are subject to applicable taxes.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment is required before service delivery unless otherwise agreed</li>
                <li>All prices are subject to change with prior notice</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Late payments may incur additional charges</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Disclaimer of Warranties</h2>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded">
              <p className="text-gray-700 leading-relaxed">
                Our services are provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or 
                implied, regarding:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-gray-700">
                <li>The accuracy or completeness of tender information</li>
                <li>Guaranteed success in winning tenders</li>
                <li>Uninterrupted or error-free service availability</li>
                <li>Results obtained from using our services</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Limitation of Liability</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Phoenix Tender Tech shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits, 
              data, or business opportunities, arising from your use of our services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Ban size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Prohibited Activities</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to engage in any of the following activities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit harmful code, viruses, or malicious software</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems to access our services without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in fraudulent activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on our website, including text, graphics, logos, images, and software, is the property of 
              Phoenix Tender Tech or its licensors and is protected by copyright, trademark, and other intellectual 
              property laws. You may not reproduce, distribute, or create derivative works without our explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Confidentiality</h2>
            <p className="text-gray-700 leading-relaxed">
              We treat all client information with strict confidentiality. Similarly, you agree to keep confidential 
              any proprietary information, strategies, or methodologies shared by us during the course of service delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend your account and access to our services immediately, without 
              prior notice, for any reason, including breach of these Terms. Upon termination, your right to use our 
              services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless Phoenix Tender Tech, its affiliates, officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use 
              of our services or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising 
              from these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by 
              posting the updated Terms on our website. Your continued use of our services after such changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited 
              or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-gray-700"><strong>Email:</strong> legal@phoenixtender.tech</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 9876543210</p>
              <p className="text-gray-700"><strong>Address:</strong> BKC Business Hub, Mumbai, Maharashtra 400051</p>
            </div>
          </section>

          <section className="border-t-2 border-gray-200 pt-6">
            <p className="text-sm text-gray-600 italic">
              By using Phoenix Tender Tech's services, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
