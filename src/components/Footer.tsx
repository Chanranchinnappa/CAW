/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { WORKSHOP_INFO } from '../data/cawData';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminPortal?: () => void;
}

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#showcase', label: 'Builds' },
  { href: '#pipeline', label: 'On the lifts' },
  { href: '#workshop-facility', label: 'Visit' },
];

export const Footer: React.FC<FooterProps> = ({ onOpenAdminPortal }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['35%', '0%']);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-[color:var(--t-border)] bg-[color:var(--t-page2)] text-sm text-[color:var(--t-muted)]">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-1">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="inline-block py-2.5 transition-colors hover:text-[color:var(--t-fg)] focus:outline-none focus-visible:text-[color:var(--t-fg)]">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="space-y-1 md:text-right">
            <a href={`tel:${WORKSHOP_INFO.contact.phonePrimary}`} className="block py-2 font-semibold text-[color:var(--t-fg)] hover:text-[color:var(--t-accent2)] transition-colors">
              {WORKSHOP_INFO.contact.phoneFormatted}
            </a>
            <p>{WORKSHOP_INFO.contact.hours}</p>
          </div>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ y: wordY }}
        className="mt-12 select-none whitespace-nowrap text-center font-display text-[8.6vw] font-black leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--t-borderstrong)]"
      >
        COORG AUTO WORKS
      </motion.div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8">
        <span>&copy; {new Date().getFullYear()} Coorg Auto Works, Ponnampet, Kodagu</span>
        {onOpenAdminPortal && (
          <button
            onClick={onOpenAdminPortal}
            className="flex items-center gap-1.5 text-[color:var(--t-dim)] transition-colors hover:text-[color:var(--t-accent2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            <Lock className="h-3 w-3" />
            Staff login
          </button>
        )}
      </div>
    </footer>
  );
};
