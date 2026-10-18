/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageSquare, Lock } from 'lucide-react';
import { WORKSHOP_INFO } from '../data/cawData';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenAdminPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenAdminPortal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['services', 'showcase', 'pipeline', 'configurator-studio', 'workshop-facility'];
      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }

      if (window.scrollY < 300) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'services', label: 'Services' },
    { id: 'showcase', label: 'Showcase' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'configurator-studio', label: 'Bespoke Studio' },
    { id: 'workshop-facility', label: 'Workshop' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0e14]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="#"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0"
          >
            <span className="text-amber-500 font-black">CAW</span>
            <span>COORG AUTO WORKS</span>
          </a>

          {/* Zone 2: 4–5 clean single-line nav links with active state */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setActiveSection(link.id)}
                  className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'text-amber-400 font-semibold bg-neutral-900/80'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-500 rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Book Service
            </button>
            {onOpenAdminPortal && (
              <button
                onClick={onOpenAdminPortal}
                title="Workshop Staff Login"
                className="p-2 text-neutral-500 hover:text-amber-400 rounded-lg hover:bg-neutral-800/60 transition-colors"
                aria-label="Staff Portal"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 text-xs font-semibold text-black bg-amber-500 rounded-lg whitespace-nowrap"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-[#0e121a] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => {
                  setActiveSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'text-amber-400 bg-neutral-900 font-semibold'
                    : 'text-neutral-200 hover:text-amber-400'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-2 border-t border-neutral-800 flex gap-2">
            <a
              href={`tel:${WORKSHOP_INFO.contact.phonePrimary}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs bg-neutral-800 text-white rounded-lg"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Call Workshop</span>
            </a>
            <a
              href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs bg-emerald-600 text-white rounded-lg font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
          {onOpenAdminPortal && (
            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminPortal();
                }}
                className="text-xs text-neutral-500 hover:text-amber-400 flex items-center justify-center gap-1.5 mx-auto py-1"
              >
                <Lock className="w-3 h-3" />
                <span>Workshop Staff Portal</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
