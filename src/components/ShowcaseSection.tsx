/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { SHOWCASE_BUILDS } from '../data/cawData';
import { ShowcaseBuild, VehiclePlatformId } from '../types';
import { BuildGallery } from './BuildGallery';
import { ArrowUpRight, X } from 'lucide-react';
import { EASE, SectionHead } from '../motion/primitives';

type Filter = 'all' | VehiclePlatformId;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mm540', label: 'MM540' },
  { id: 'bolero', label: 'Bolero' },
  { id: 'safari', label: 'Safari' },
  { id: 'gypsy', label: 'Gypsy' },
];

const BuildCard: React.FC<{ build: ShowcaseBuild; onOpen: () => void }> = ({ build, onOpen }) => (
  <motion.button
    layout
    onClick={onOpen}
    whileHover="hover"
    initial="rest"
    className="on-dark group relative flex h-[26rem] w-[80vw] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-3xl p-6 text-left text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:w-[46vw] lg:h-[min(34rem,calc(100svh-14rem))] lg:w-[30vw] lg:max-w-[28rem] lg:p-8"
    style={{ background: `linear-gradient(155deg, ${build.accentColor} 0%, #0b0e14 78%)` }}
  >
    {/* Year as oversized outline type */}
    <motion.span
      aria-hidden="true"
      variants={{ rest: { y: 0, scale: 1 }, hover: { y: -10, scale: 1.04 } }}
      transition={{ duration: 0.7, ease: EASE }}
      className="pointer-events-none absolute left-5 top-[16%] origin-top-left font-display text-[6.5rem] font-black leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.3)] lg:left-7 lg:text-[8.5rem]"
    >
      {build.year}
    </motion.span>

    <span className="relative text-sm text-white/70">
      {build.category} · {build.clientRegion}
    </span>

    <div className="relative">
      <h3 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl text-balance">{build.title}</h3>
      <p className="mt-3 line-clamp-2 max-w-sm text-sm leading-relaxed text-white/70">{build.story}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">
        See the build
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </div>

    <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 transition-shadow duration-500 group-hover:ring-amber-400/50" />
  </motion.button>
);

const BuildDialog: React.FC<{ build: ShowcaseBuild; onClose: () => void }> = ({ build, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={build.title}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[color:var(--t-borderstrong)] bg-[color:var(--t-panel)] p-6 shadow-2xl sm:rounded-3xl sm:p-10"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full bg-[color:var(--t-raised)] p-2 text-[color:var(--t-fg2)] transition-colors hover:text-[color:var(--t-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="pr-10 text-sm text-[color:var(--t-accent)]">
          {build.category} · {build.clientRegion} · {build.year}
        </p>
        <h3 className="mt-2 pr-10 font-display text-3xl font-extrabold leading-tight tracking-tight text-[color:var(--t-fg)] text-balance">
          {build.title}
        </h3>
        <p className="mt-5 text-base leading-relaxed text-[color:var(--t-fg2)]">{build.story}</p>

        <ul className="mt-6 space-y-2.5 border-t border-[color:var(--t-border)] pt-6">
          {build.specs.map((s) => (
            <li key={s} className="flex gap-3 text-sm text-[color:var(--t-fg2)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[color:var(--t-accent)]" />
              {s}
            </li>
          ))}
        </ul>

        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-[color:var(--t-card)] p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[color:var(--t-dim)]">Engine</dt>
            <dd className="mt-0.5 text-[color:var(--t-fg2)]">{build.engine}</dd>
          </div>
          <div>
            <dt className="text-[color:var(--t-dim)]">Transmission</dt>
            <dd className="mt-0.5 text-[color:var(--t-fg2)]">{build.transmission}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[color:var(--t-dim)]">On the trail</dt>
            <dd className="mt-0.5 text-[color:var(--t-fg2)]">{build.terrainNotes}</dd>
          </div>
        </dl>
      </motion.div>
    </motion.div>
  );
};

export const ShowcaseSection: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<ShowcaseBuild | null>(null);
  const builds = filter === 'all' ? SHOWCASE_BUILDS : SHOWCASE_BUILDS.filter((b) => b.platform === filter);

  // Desktop: the section pins while the row of builds slides sideways with your scroll.
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const lg = window.matchMedia('(min-width: 1024px)').matches;
      setPinned(lg);
      if (lg && trackRef.current) {
        setTravel(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
      } else {
        setTravel(0);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [builds.length]);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  const barScale = useTransform(scrollYProgress, [0, 1], [0.04, 1]);

  return (
    <section id="showcase" className="bg-[color:var(--t-bg)] pt-24 sm:pt-32 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          title="Builds that left the workshop"
          intro="Sample builds are shown until verified customer records and photos are published."
          right={
            <div role="tablist" aria-label="Filter builds by vehicle" className="flex w-fit items-center gap-1 rounded-full border border-[color:var(--t-border)] bg-[color:var(--t-panel2)] p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className="relative rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {filter === f.id && (
                    <motion.span
                      layoutId="showcase-filter"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      className="absolute inset-0 rounded-full bg-[color:var(--t-accent)]"
                    />
                  )}
                  <span className={`relative transition-colors ${filter === f.id ? 'text-black' : 'text-[color:var(--t-muted)]'}`}>
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          }
        />
        <BuildGallery />
      </div>

      <div ref={outerRef} style={pinned ? { height: `calc(${travel}px + 100svh - 4rem)` } : undefined} className="relative">
        <div className="lg:sticky lg:top-16 lg:flex lg:h-[calc(100svh-4rem)] lg:flex-col lg:justify-center lg:overflow-hidden">
          <motion.div
            ref={trackRef}
            style={pinned ? { x } : undefined}
            className="flex w-max snap-x snap-mandatory gap-5 px-4 pb-16 sm:px-6 max-lg:w-full max-lg:overflow-x-auto max-lg:[scrollbar-width:none] lg:gap-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pb-0 lg:pr-24"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {builds.map((b) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="shrink-0"
                >
                  <BuildCard build={b} onOpen={() => setSelected(b)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {pinned && travel > 0 && (
            <div className="mx-auto mt-10 h-px w-full max-w-7xl px-8" aria-hidden="true">
              <div className="h-px w-full bg-[color:var(--t-border)]">
                <motion.div style={{ scaleX: barScale }} className="h-px origin-left bg-[color:var(--t-accent)]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>{selected && <BuildDialog build={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
};
