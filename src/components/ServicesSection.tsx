/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, ArrowRight, MessageSquare, Phone } from 'lucide-react';
import { WORKSHOP_INFO } from '../data/cawData';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

const CLEAN_SERVICES = [
  {
    number: '01',
    title: 'Complete Engine Rebuilding',
    tagline: 'Full engine restoration and tuning for mountain roads and hill climbs.',
    description:
      'We dismantle, repair, and rebuild diesel and petrol engines, tuning them for reliable power and better cooling so your vehicle climbs steep estate tracks without overheating.',
    turnaround: 'Timeline Discussed On-Call',
  },
  {
    number: '02',
    title: '4x4 Gearbox, Transfer Case & Axles',
    tagline: 'Reliable four-wheel drive engagement and water protection.',
    description:
      'Full servicing of 4WD gearboxes, transfer cases, and front & rear axles. We install differential locks for tough mud trails and seal all joints for deep monsoon water crossings.',
    turnaround: 'Timeline Discussed On-Call',
  },
  {
    number: '03',
    title: 'Custom Steel Bumpers & Safety Bars',
    tagline: 'Tough metalwork, winches, and protection built in our workshop.',
    description:
      'Handcrafted front and rear steel bumpers, electric recovery winches, side steps, and reinforced cabin safety roll bars built directly in our Matturu metal shop.',
    turnaround: 'Timeline Discussed On-Call',
  },
  {
    number: '04',
    title: 'Off-Road Suspension & Ride Comfort',
    tagline: 'Smoother rides over rocky coffee estate ruts and better clearance.',
    description:
      'Upgraded leaf springs and heavy-duty shock absorbers that eliminate harsh bumps, give you extra ground clearance, and keep the vehicle stable on uneven plantation roads.',
    turnaround: 'Timeline Discussed On-Call',
  },
  {
    number: '05',
    title: 'Full Rust Protection & Paint',
    tagline: 'Thorough rust removal and long-lasting exterior paint for heavy rains.',
    description:
      'We strip rusted areas clean, apply anti-rust primers, and spray high-durability exterior paint and underbody protective coating to protect against torrential Coorg monsoons.',
    turnaround: 'Timeline Discussed On-Call',
  },
  {
    number: '06',
    title: 'Estate Breakdown & Towing Assistance',
    tagline: 'On-call roadside and trail assistance across South Kodagu.',
    description:
      'Quick response if your vehicle is stuck in deep mud or broken down inside a coffee plantation. We bring recovery winches and tools directly to your location.',
    turnaround: 'Emergency On-Call Dispatch',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 bg-[#0b0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean, Plain-Language Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono-num text-amber-500 uppercase tracking-wider mb-2">
            WORKSHOP SERVICES · MATTURU, PONNAMPET
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
            Mechanical Repairs &amp; 4x4 Workshop Work
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            Built for local estate owners, planters, and 4x4 drivers in Kodagu. No hidden rates or fixed pricing — all work is discussed in person or on call to fit your vehicle’s exact needs.
          </p>
        </div>

        {/* Clean, Uncluttered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLEAN_SERVICES.map((srv) => (
            <div
              key={srv.number}
              className="flex flex-col justify-between p-6 rounded-xl border border-neutral-800 bg-[#121620] hover:border-neutral-700 hover:bg-[#141924] transition-all duration-200"
            >
              <div>
                {/* Number & Turnaround indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-4">
                  <span className="text-base font-bold font-mono-num text-amber-500">
                    {srv.number}.
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono-num">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{srv.turnaround}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white font-display">
                  {srv.title}
                </h3>
                <p className="mt-1.5 text-xs font-medium text-amber-400/90 leading-snug">
                  {srv.tagline}
                </p>

                {/* Plain-Language Description */}
                <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              {/* Service Action Button */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono-num text-neutral-500">
                  Custom Quote · On-Call
                </span>
                <button
                  onClick={() => onSelectService(srv.title)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Discuss On-Call</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
