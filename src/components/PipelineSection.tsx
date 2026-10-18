/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { PipelineBuild } from '../types';
import { INITIAL_WORKSHOP_PIPELINE } from '../data/cawData';
import { Check, Plus } from 'lucide-react';
import { CountUp, EASE, SectionHead } from '../motion/primitives';

interface PipelineSectionProps {
  pipeline?: PipelineBuild[];
  onOpenAdminPortal?: () => void;
}

const BayRow: React.FC<{ pipe: PipelineBuild; index: number }> = ({ pipe, index }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const hasMore =
    pipe.keyWorkItems.length > 0 || (pipe.voiceNotes && pipe.voiceNotes.length > 0) || (pipe.photos && pipe.photos.length > 0);

  return (
    <li ref={ref} className="border-b border-[color:var(--t-border)]">
      <button
        onClick={() => hasMore && setOpen((o) => !o)}
        aria-expanded={open}
        disabled={!hasMore}
        className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-4 py-7 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 rounded sm:grid-cols-[5rem_1fr_16rem_auto] sm:gap-x-8"
      >
        <span
          aria-hidden="true"
          className="font-display text-5xl font-black leading-none text-transparent [-webkit-text-stroke:1px_var(--t-borderstrong)] transition-[-webkit-text-stroke-color] duration-500 group-hover:[-webkit-text-stroke-color:var(--t-accent)] sm:text-6xl"
        >
          {pipe.bayNumber}
        </span>

        <span className="min-w-0">
          <span className="block font-display text-xl font-bold leading-tight tracking-tight text-[color:var(--t-fg)] sm:text-2xl">
            {pipe.vehicleTitle}
          </span>
          <span className="mt-1 block text-sm text-[color:var(--t-muted)]">{pipe.currentPhase}</span>
        </span>

        <span className="col-span-3 order-last sm:col-span-1 sm:order-none">
          <span className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-[color:var(--t-muted)]">Due {pipe.targetDelivery.toLowerCase()}</span>
            <span className="font-semibold text-[color:var(--t-fg)] tabular-nums">
              <CountUp value={`${pipe.progressPercent}%`} />
            </span>
          </span>
          <span className="block h-1.5 overflow-hidden rounded-full bg-[color:var(--t-raised)]">
            <motion.span
              className="block h-full origin-left rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
              style={{ width: `${pipe.progressPercent}%` }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : undefined}
              transition={{ duration: 1.6, ease: EASE, delay: 0.15 + index * 0.12 }}
            />
          </span>
        </span>

        <motion.span
          animate={{ rotate: open ? 135 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-opacity ${
            hasMore ? 'border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)]' : 'opacity-0'
          }`}
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pb-8 sm:pl-[6.5rem] md:grid-cols-2">
              <ul className="space-y-2.5">
                {pipe.keyWorkItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[color:var(--t-fg2)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--t-good)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-4">
                {pipe.voiceNotes && pipe.voiceNotes.length > 0 && (
                  <blockquote className="border-l-2 border-[color:var(--t-accent)] pl-4 text-sm italic text-[color:var(--t-fg2)]">
                    {pipe.voiceNotes[pipe.voiceNotes.length - 1]}
                  </blockquote>
                )}
                {pipe.photos && pipe.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {pipe.photos.map((img, i) => (
                      <img key={i} src={img} alt={`Bay ${pipe.bayNumber} update ${i + 1}`} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
                {pipe.lastUpdated && <p className="text-xs text-[color:var(--t-dim)]">Updated {pipe.lastUpdated}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export const PipelineSection: React.FC<PipelineSectionProps> = ({ pipeline = INITIAL_WORKSHOP_PIPELINE }) => (
  <section id="pipeline" className="bg-[color:var(--t-page)] py-24 sm:py-32 scroll-mt-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHead title="On the lifts right now" intro="What each bay is working on today, updated by the technicians." />
      <ul className="border-t border-[color:var(--t-border)]">
        {pipeline.map((pipe, i) => (
          <BayRow key={pipe.id} pipe={pipe} index={i} />
        ))}
      </ul>
    </div>
  </section>
);
