/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WORKSHOP_INFO } from '../data/cawData';
import { ArrowRight, Phone, MessageSquare, Compass, ShieldCheck, FileText, Camera } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#0b0e14] pt-12 pb-20 border-b border-neutral-800">
      {/* Background Ambience & Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Concrete Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Location & Division Marker (Text with separator) */}
            <div className="flex items-center gap-2 text-xs font-mono-num text-neutral-400 mb-4">
              <span className="text-amber-500 font-semibold">COORG AUTO WORKS</span>
              <span aria-hidden="true">·</span>
              <span>Matturu, Near Ponnampet</span>
              <span aria-hidden="true">·</span>
              <span>Kodagu, Karnataka</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.1] max-w-2xl text-balance">
              Engineered for the Ghats. Built for the Wilds.
            </h1>

            {/* Paragraph Body */}
            <p className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
              Precision diesel and petrol engine care, custom 4x4 chassis fabrication, and ground-up restorations in the heart of South Coorg. Specializing in Mahindra MM540s, Boleros, Tata Safaris, and Gypsy King legends.
            </p>

            {/* Primary Action Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#configurator-studio"
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-amber-500/10"
              >
                <Compass className="w-4 h-4" />
                <span>Launch 4x4 Studio</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=Hello%20Coorg%20Auto%20Works!%20I%20would%20like%20to%20inquire%20about%20a%20vehicle%20build/service.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Workshop</span>
              </a>

              <button
                onClick={onOpenBooking}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-300 hover:text-white transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                <span>Book Consultation</span>
              </button>
            </div>

            {/* Trust Assurance Line */}
            <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>All pricing in situ &amp; on-call discussion · No fixed catalogue prices</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase Card (Photographic Presentation) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-neutral-800 bg-[#121620] p-5 shadow-2xl overflow-hidden group">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono-num font-semibold text-neutral-200">
                    FEATURED 4X4 RESTOMOD
                  </span>
                </div>
                <span className="text-xs font-mono-num text-neutral-400">
                  MATTURU FACILITY
                </span>
              </div>

              {/* Real Photographic Showcase */}
              <div className="mt-4 relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 group">
                {!imgError ? (
                  <img
                    src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
                    alt="Custom Mahindra MM540 4x4 open-top build in Coorg estate"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-neutral-900 text-center">
                    <Camera className="w-10 h-10 text-amber-500 mb-2" />
                    <span className="text-xs text-white font-semibold">Mahindra MM540 4x4 Rebuild</span>
                    <span className="text-[11px] text-neutral-400">Awaiting your real workshop photos</span>
                  </div>
                )}

                {/* Scrim & Badging */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono-num text-neutral-200">
                  <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-neutral-700">
                    MAHINDRA MM540 4X4
                  </span>
                  <span className="text-amber-400 font-semibold">
                    KUTTA MONSOON SPEC
                  </span>
                </div>
              </div>

              {/* Quick Spec Highlights */}
              <div className="mt-4 space-y-2 text-xs font-mono-num">
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Chassis &amp; Axle:</span>
                  <span className="font-semibold text-white">Full-Floating Dana 44 Rear</span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Suspension:</span>
                  <span className="font-semibold text-white">Front Shackle Reversal Setup</span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Build Quotation:</span>
                  <span className="font-semibold text-amber-400">In Situ On-Call Consultation</span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Waiting for your MM540 photos</span>
                <a
                  href="#showcase"
                  className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1"
                >
                  <span>Explore Showcase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Proof & Metrics Strip */}
        <div className="mt-16 pt-10 border-t border-neutral-800 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {WORKSHOP_INFO.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-neutral-400 mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
