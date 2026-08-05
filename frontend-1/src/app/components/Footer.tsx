import React from 'react';
import { Link } from 'react-router';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight, MessageCircle, Info } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { ISOCertificates } from './ISOCertificates';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-900 pt-20 pb-10 relative overflow-hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#111827 1px, transparent 1px), linear-gradient(90deg, #111827 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        {/* ISO Certifications Section */}
        <div className="mb-12 pb-12 border-b border-white/10">
          <h3 className="text-xl font-bold mb-6 text-center">Our Certifications</h3>
          <ISOCertificates variant="badges" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20 shadow-lg">
                <img src={logoImg} alt="Phoenix Tender Tech" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">Phoenix Tender Tech</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              India's most trusted tender notification service provider. Helping businesses scale with timely opportunities.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.linkedin.com/company/phoenix-tender-tech" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 rounded-full hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://www.facebook.com/phoenixtendertech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 rounded-full hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://x.com/phoenixtendertech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 rounded-full hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                aria-label="Twitter / X"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.instagram.com/phoenixtendertech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 rounded-full hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:support@phoenixtender.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 rounded-full hover:bg-[#16A34A] hover:text-white transition-colors cursor-pointer"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li><Link to="/tenders" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> Search Tenders</Link></li>
              <li><Link to="/services" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> Our Services</Link></li>
              <li><Link to="/gem-consultant" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> GeM Consultant</Link></li>
              <li><Link to="/training" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> Training Modules</Link></li>
              <li><Link to="/reviews" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> Client Reviews</Link></li>
              <li><Link to="/about" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900 flex items-center gap-2"><ArrowRight size={14} /> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Popular Sectors */}
          <div>
            <h4 className="text-lg font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li><Link to="/resources" className="hover:text-gray-900">Blog & Articles</Link></li>
              <li><Link to="/faq" className="hover:text-gray-900">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-gray-900">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li>
                <a
                  href="https://wa.me/919601005549?text=I%20want%20to%20enquire%20about%20training"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 flex items-center gap-2"
                >
                  <MessageCircle size={14} /> Training Enquiry
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Get In Touch</h4>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex gap-3">
                <MapPin size={20} className="shrink-0 text-[#16A34A]" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="shrink-0 text-[#16A34A]" />
                <span>+91 96010 05549</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="shrink-0 text-[#16A34A]" />
                <span>phoenixtendertech@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Consulting disclaimer */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
          <Info size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-600">Disclaimer:</strong> Consultation charges cover professional service only. Government fees, statutory charges, certification fees, taxes, and any third-party expenses shall be borne separately by the client wherever applicable. All prices are exclusive of GST.
          </p>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p>© 2026 PHOENIX TENDER TECH. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};