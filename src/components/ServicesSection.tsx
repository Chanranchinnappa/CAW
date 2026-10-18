/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { EASE, SectionHead } from '../motion/primitives';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

const SERVICES = [
  {
    title: 'Jeep 4x4 ground-up restoration',
    option: 'Jeep 4x4 Ground-Up Restoration',
    tagline: 'Stripped, repaired and rebuilt from the chassis up.',
    description:
      'We take a tired jeep down to the chassis and rebuild it: engine, gearbox, axles, suspension, wiring, body and paint, so it is ready for another few decades of estate work.',
  },
  {
    title: 'Car mechanical services',
    option: 'Car Mechanical Services',
    tagline: 'Servicing and repairs for everyday cars.',
    description:
      'Servicing, diagnosis and mechanical repairs for cars, from routine maintenance to engine, clutch, brake and suspension work.',
  },
  {
    title: 'Irrigation engines and pumps',
    option: 'Irrigation Engine & Pump Building',
    tagline: 'Self-priming engine and pump sets built for the estate.',
    description:
      'We build all types of self-priming irrigation engine and pump sets, matched to your water source, head and the area you need to cover.',
  },
  {
    title: 'Underground HDPE irrigation',
    option: 'Underground HDPE Irrigation',
    tagline: 'Pipe laying that stays out of the way and lasts.',
    description:
      'Underground HDPE pipeline work for irrigation, from the pump to the field, so water reaches your crop without exposed pipes in the way.',
  },
  {
    title: 'Diesel generator builds',
    option: 'Diesel Generator Build',
    tagline: 'Generator sets assembled to suit your load.',
    description:
      'We build diesel generator sets for estates, workshops and farms, sized to the load you need to run.',
  },
  {
    title: 'Sprinkler jet set-up and fabrication',
    option: 'Sprinkler Jet Set-up & Fabrication',
    tagline: 'Sprinkler stands and jets fabricated and fitted.',
    description:
      'Fabrication and set-up of sprinkler jets and their stands, planned around your field layout and pump.',
  },
  {
    title: 'Jeep trailer builds',
    option: 'Jeep Trailer Build',
    tagline: 'Trailers built to be towed behind your jeep.',
    description:
      'Purpose-built trailers for jeeps, fabricated in our own metal shop for hauling on estate roads and tracks.',
  },
  {
    title: 'Jeep alterations',
    option: 'Jeep Alterations',
    tagline: 'Power steering, disc brakes and hydraulic clutch.',
    description:
      'Upgrades that make an old jeep easier and safer to drive: power steering, disc brakes and a hydraulic power clutch, fitted and set up in the workshop.',
  },
  {
    title: 'Complete engine rebuilding',
    option: 'Engine Overhaul & Rebuild',
    tagline: 'Full restoration and tuning for mountain roads and hill climbs.',
    description:
      'We dismantle, repair, and rebuild diesel and petrol engines, tuning them for reliable power and better cooling so your vehicle climbs steep estate tracks without overheating.',
  },
  {
    title: '4x4 gearbox, transfer case and axles',
    option: 'Differential Re-Gearing & Locking Hubs',
    tagline: 'Reliable four-wheel drive and water protection.',
    description:
      'Full servicing of 4WD gearboxes, transfer cases, and front and rear axles. We install differential locks for tough mud trails and seal all joints for deep monsoon water crossings.',
  },
  {
    title: 'Custom steel bumpers and safety bars',
    option: 'Custom Bumper, Winch & Roll Cage Fabrication',
    tagline: 'Tough metalwork, winches and protection, built in our workshop.',
    description:
      'Handcrafted front and rear steel bumpers, electric recovery winches, side steps, and reinforced cabin roll bars built directly in our own metal shop.',
  },
  {
    title: 'Off-road suspension and ride comfort',
    option: 'Front Shackle Reversal & Suspension Lift',
    tagline: 'Smoother rides over rocky estate ruts, with better clearance.',
    description:
      'Upgraded leaf springs and heavy-duty shock absorbers that take out harsh bumps, give you extra ground clearance, and keep the vehicle stable on uneven plantation roads.',
  },
  {
    title: 'Rust protection and paint',
    option: 'Complete Monsoon Rust Treatment & Respray',
    tagline: 'Thorough rust removal and long-lasting paint for heavy rain.',
    description:
      'We strip rusted areas clean, apply anti-rust primers, and spray durable exterior paint and underbody coating to protect against torrential Coorg monsoons.',
  },
  {
    title: 'Estate breakdown and towing',
    option: 'General 4x4 Mechanical Inspection',
    tagline: 'On-call roadside and trail help across South Kodagu.',
    description:
      'Quick response if your vehicle is stuck in deep mud or broken down inside a coffee plantation. We bring recovery winches and tools to your location.',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="services" className="bg-[color:var(--t-page)] py-24 sm:py-32 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          title="What we fix and build"
          intro="We work on jeeps, Gypsys, utility pickups and cars. Every job is discussed in person or on call, so the work fits your vehicle. We don't publish fixed prices."
        />

        <ul className="border-t border-[color:var(--t-border)]">
          {SERVICES.map((srv, i) => {
            const isOpen = open === i;
            return (
              <li key={srv.title} className="border-b border-[color:var(--t-border)]">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group relative flex w-full items-center justify-between gap-6 py-6 text-left sm:py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 rounded"
                >
                  <motion.span
                    className="font-display text-2xl font-bold tracking-tight text-[color:var(--t-fg)] sm:text-4xl lg:text-5xl"
                    animate={{ x: isOpen ? 14 : 0 }}
                    whileHover={{ x: 14 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {srv.title}
                  </motion.span>
                  <span className="hidden max-w-xs text-sm text-[color:var(--t-muted)] lg:block">{srv.tagline}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      isOpen
                        ? 'border-[color:var(--t-accent)] bg-[color:var(--t-accent)] text-black'
                        : 'border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] group-hover:border-[color:var(--t-accent)]'
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                  </motion.span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--t-accent)] transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-6 pb-8 sm:pl-[14px] md:flex-row md:items-end md:justify-between">
                        <p className="max-w-2xl text-base leading-relaxed text-[color:var(--t-fg2)] sm:text-lg">
                          {srv.description}
                        </p>
                        <button
                          onClick={() => onSelectService(srv.option)}
                          className="group/btn flex shrink-0 items-center gap-2 self-start rounded-full bg-[color:var(--t-fg)] px-5 py-3 text-sm font-semibold text-[color:var(--t-page)] transition-transform duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          Discuss this job
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
