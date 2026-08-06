import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield size={64} className="mx-auto text-[#0B3D91] mb-4" />
          <h1 className="text-4xl font-bold text-[#0B3D91] mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: March 29, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Phoenix Tender Tech ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you visit our website and 
              use our services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold mb-2">Personal Information</h3>
                <p className="leading-relaxed">
                  We may collect personal information that you voluntarily provide to us when you register on the website, 
                  express an interest in obtaining information about us or our services, or otherwise contact us. This includes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Name and contact information (email, phone, address)</li>
                  <li>Business information (company name, GST number, PAN)</li>
                  <li>Payment and billing information</li>
                  <li>User credentials (username, password)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">Automatically Collected Information</h3>
                <p className="leading-relaxed">
                  When you visit our website, we automatically collect certain information about your device, including 
                  IP address, browser type, operating system, and browsing behavior.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide, operate, and maintain our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you tender alerts and service updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve and optimize our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
              the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Disclosure of Your Information</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck size={24} className="text-[#0B3D91]" />
              <h2 className="text-2xl font-bold text-[#0B3D91]">Your Rights</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access and obtain a copy of your personal data</li>
              <li>Rectify inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices 
              of these external sites and encourage you to read their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you become aware that a child has provided us with personal information, 
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-gray-700"><strong>Email:</strong> privacy@phoenixtender.tech</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 9876543210</p>
              <p className="text-gray-700"><strong>Address:</strong> BKC Business Hub, Mumbai, Maharashtra 400051</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
