/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, Phone, MessageSquare, Lock, Sun, Moon } from 'lucide-react';
import { useSiteTheme } from '../theme';
import { WORKSHOP_INFO } from '../data/cawData';
import { EASE } from '../motion/primitives';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenAdminPortal?: () => void;
}

const NAV = [
  { id: 'services', label: 'Services' },
  { id: 'showcase', label: 'Builds' },
  { id: 'pipeline', label: 'On the lifts' },
  { id: 'workshop-facility', label: 'Visit' },
];

const ring = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70';

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenAdminPortal }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const [hidden, setHidden] = useState(false);
  const [theme, setTheme] = useSiteTheme();
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Tuck away while reading down, return the moment you scroll up.
      if (y > 480 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 480) setHidden(false);
      lastY.current = y;

      const probe = y + 200;
      let current = '';
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= probe) current = item.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const showHeader = !hidden || menuOpen;

  return (
    <motion.header
      animate={{ y: showHeader ? 0 : '-101%' }}
      transition={{ duration: 0.5, ease: EASE }}
      className="sticky top-0 z-40 border-b border-[color:var(--t-border)] bg-[color:color-mix(in_srgb,var(--t-page)_88%,transparent)] backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-6">
          <a href="#" className={`shrink-0 whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-[color:var(--t-fg)] rounded ${ring}`}>
            <span className="flex items-center gap-2.5">
              <span className="text-sm uppercase tracking-[0.08em] sm:text-lg">Coorg Auto Works</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm font-medium lg:flex">
            {NAV.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${ring} ${
                  active === link.id ? 'text-[color:var(--t-fg)]' : 'text-[color:var(--t-muted)] hover:text-[color:var(--t-fg)]'
                }`}
              >
                {active === link.id && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-[color:var(--t-raised)]"
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className={`rounded-full p-2 text-[color:var(--t-muted)] transition-colors hover:bg-[color:var(--t-raised)] hover:text-[color:var(--t-fg)] ${ring}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button
              onClick={onOpenBooking}
              className={`whitespace-nowrap rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400 ${ring}`}
            >
              Book a service
            </button>
            {onOpenAdminPortal && (
              <button
                onClick={onOpenAdminPortal}
                aria-label="Staff login"
                title="Staff login"
                className={`rounded-full p-2 text-[color:var(--t-dim)] transition-colors hover:bg-[color:var(--t-raised)] hover:text-[color:var(--t-accent2)] ${ring}`}
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={onOpenBooking} className={`rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-black ${ring}`}>
              Book
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className={`rounded-full p-2 text-[color:var(--t-fg2)] ${ring}`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden border-t border-[color:var(--t-border)] lg:hidden"
          >
            <div className="space-y-1 px-4 pb-5 pt-3">
              {NAV.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: EASE }}
                  className={`block rounded-xl px-3 py-3 font-display text-2xl font-bold ${ring} ${
                    active === link.id ? 'text-[color:var(--t-accent)]' : 'text-[color:var(--t-fg)]'
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="flex gap-2 pt-3">
                <a href={`tel:${WORKSHOP_INFO.contact.phonePrimary}`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--t-raised)] py-3 text-sm font-medium text-[color:var(--t-fg)]">
                  <Phone className="h-4 w-4 text-[color:var(--t-accent2)]" />
                  Call
                </a>
                <a
                  href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center justify-between pt-3 text-sm text-[color:var(--t-muted)]">
                <button onClick={toggleTheme} className={`flex items-center gap-2 rounded px-1 py-1 ${ring}`}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === 'dark' ? 'Light theme' : 'Dark theme'}
                </button>
                {onOpenAdminPortal && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAdminPortal();
                    }}
                    className={`flex items-center gap-1.5 rounded px-1 py-1 ${ring}`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Staff login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
};
