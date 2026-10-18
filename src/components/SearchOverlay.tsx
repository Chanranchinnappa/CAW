import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare, Search, X } from 'lucide-react';
import { search } from '../lib/search';
import { WORKSHOP_INFO } from '../data/cawData';

const SUGGESTIONS = ['Engine rebuild', 'Irrigation pump', 'Jeep trailer', 'Gypsy', 'Power steering', 'Phone number'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<Props> = ({ open, onClose }) => {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(q), [q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      // Wait a frame so the field exists before it takes focus.
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  const go = (target: string) => {
    onClose();
    // The page's smooth-scroll handler picks up clicks on hash links.
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = `#${target}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 60);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter' && results[sel]) go(results[sel].target);
  };

  const waText = encodeURIComponent(`Hello Coorg Auto Works! I was looking for: ${q}`);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-3 pt-[8vh] sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKey}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[color:var(--t-borderstrong)] bg-[color:var(--t-panel)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[color:var(--t-border)] px-4">
              <Search className="h-5 w-5 shrink-0 text-[color:var(--t-muted)]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search services, builds, vehicles"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full bg-transparent text-base text-[color:var(--t-fg)] placeholder:text-[color:var(--t-dim)] focus:outline-none"
              />
              <button onClick={onClose} aria-label="Close search" className="rounded-full p-2 text-[color:var(--t-muted)] hover:text-[color:var(--t-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60svh] overflow-y-auto p-2">
              {!q.trim() && (
                <div className="p-3">
                  <p className="text-sm text-[color:var(--t-muted)]">Try one of these</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ(s)}
                        className="rounded-full border border-[color:var(--t-border)] bg-[color:var(--t-raised)] px-3.5 py-1.5 text-sm text-[color:var(--t-fg2)] hover:text-[color:var(--t-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.trim() && results.length > 0 && (
                <ul role="listbox" aria-label="Results">
                  {results.map((r, i) => (
                    <li key={r.id} role="option" aria-selected={i === sel}>
                      <button
                        onClick={() => go(r.target)}
                        onMouseEnter={() => setSel(i)}
                        className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left focus:outline-none ${
                          i === sel ? 'bg-[color:var(--t-raised)]' : ''
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[color:var(--t-fg)]">{r.title}</span>
                          <span className="block truncate text-sm text-[color:var(--t-muted)]">{r.detail}</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-[color:var(--t-border)] px-2.5 py-0.5 text-xs text-[color:var(--t-muted)]">{r.kind}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {q.trim() && results.length === 0 && (
                <div className="p-4">
                  <p className="text-[color:var(--t-fg)]">Nothing found for “{q.trim()}”.</p>
                  <p className="mt-1 text-sm text-[color:var(--t-muted)]">Ask us directly and we will tell you if we can do it.</p>
                  <a
                    href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
