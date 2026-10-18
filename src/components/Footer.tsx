/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WORKSHOP_INFO } from '../data/cawData';
import { Phone, MessageSquare, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminPortal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminPortal }) => {
  return (
    <footer className="bg-[#080b0f] border-t border-neutral-800 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <a href="#" className="text-lg font-bold text-white font-display flex items-center gap-2 mb-3">
              <span className="text-amber-500 font-black">CAW</span>
              <span>COORG AUTO WORKS</span>
            </a>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Dedicated 4x4 engineering, engine overhauls, and custom chassis fabrication in Matturu, Kodagu. Preserving India&apos;s greatest rugged automobile icons for the trails of the Western Ghats.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs font-mono-num text-neutral-500">
              <span>{WORKSHOP_INFO.location.village}, Ponnampet</span>
              <span>·</span>
              <span>Kodagu, Karnataka</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-white font-semibold text-xs font-mono-num uppercase tracking-wider mb-3">
              Workshop
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services &amp; Overhauls
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-white transition-colors">
                  Finished Restorations
                </a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-white transition-colors">
                  Active Bays Pipeline
                </a>
              </li>
              <li>
                <a href="#configurator-studio" className="text-amber-400 hover:text-amber-300 transition-colors">
                  4x4 Configurator Studio
                </a>
              </li>
              <li>
                <a href="#workshop-facility" className="hover:text-white transition-colors">
                  Directions &amp; Hours
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Emergency Support */}
          <div>
            <div className="text-white font-semibold text-xs font-mono-num uppercase tracking-wider mb-3">
              Emergency &amp; Inquiries
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`tel:${WORKSHOP_INFO.contact.phonePrimary}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono-num">{WORKSHOP_INFO.contact.phoneFormatted}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Workshop</span>
                </a>
              </li>
              <li className="pt-2 text-neutral-400 text-[11px]">
                {WORKSHOP_INFO.contact.hours}
              </li>
              <li className="text-amber-500/80 text-[11px]">
                {WORKSHOP_INFO.contact.emergencyHours}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div>
            &copy; {new Date().getFullYear()} Coorg Auto Works (CAW). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Matturu, Ponnampet, Kodagu</span>
            {onOpenAdminPortal && (
              <>
                <span>·</span>
                <button
                  onClick={onOpenAdminPortal}
                  className="flex items-center gap-1 text-neutral-500 hover:text-amber-400 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Workshop Staff Operations</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
