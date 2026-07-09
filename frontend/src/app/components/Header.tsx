import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Mail, Facebook, Twitter, Linkedin, Instagram, LogIn, UserPlus, Menu, X } from 'lucide-react';
import logoImg from "figma:asset/017d37535b23405206a333d588f1e3b1ba502224.png";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/tenders', label: 'Live Tenders' },
    { to: '/services', label: 'Our Services' },
    { to: '/gem-consultant', label: 'GeM Consultant' },
    { to: '/training', label: 'Training' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/seller', label: 'Seller Portal' },
  ];

  return (
    <header className="w-full">
      {/* Top Strip — desktop only, not sticky (scrolls away) */}
      <div className="bg-gray-50 text-gray-600 py-2 px-4 border-b border-gray-200 hidden md:block">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mail size={13} />
              <span>info@phoenixtender.tech</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/company/phoenix-tender-tech" 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on LinkedIn" 
              className="hover:text-[#0077B5] transition-colors"
              title="Follow us on LinkedIn"
            >
              <Linkedin size={15} />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-blue-600 transition-colors"><Facebook size={15} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition-colors"><Twitter size={15} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-600 transition-colors"><Instagram size={15} /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar — sticky */}
      <nav className="bg-white text-gray-900 h-[80px] sticky top-0 z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto h-full px-4 flex justify-between items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
            <div className="w-11 h-11 bg-white rounded-full overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform border border-gray-200 shadow-sm">
              <img src={logoImg} alt="Phoenix Tender Tech Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold leading-none tracking-tight">PHOENIX</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-500">Tender Tech</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-6 font-bold text-sm tracking-wide">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`hover:text-blue-600 transition-colors uppercase text-xs tracking-widest ${
                    isActive(to) ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Buttons + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLoginClick}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
            <button
              onClick={onRegisterClick}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors cursor-pointer text-sm"
            >
              <UserPlus size={16} />
              <span>Register</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="lg:hidden absolute top-[80px] left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-2xl">
            <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-bold text-sm transition-colors ${
                    isActive(to)
                      ? 'bg-gray-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => { onLoginClick(); setMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                  <LogIn size={16} /> Login
                </button>
                <button
                  onClick={() => { onRegisterClick(); setMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm"
                >
                  <UserPlus size={16} /> Register
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};