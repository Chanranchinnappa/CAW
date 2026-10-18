/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SHOWCASE_BUILDS } from '../data/cawData';
import { ShowcaseBuild, VehiclePlatformId } from '../types';
import { Check, X, ArrowRight, ShieldCheck, MapPin, Calendar, Wrench, Mountain, Info } from 'lucide-react';

export const ShowcaseSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | VehiclePlatformId>('all');
  const [selectedBuild, setSelectedBuild] = useState<ShowcaseBuild | null>(null);

  const filteredBuilds =
    filter === 'all'
      ? SHOWCASE_BUILDS
      : SHOWCASE_BUILDS.filter((b) => b.platform === filter);

  return (
    <section id="showcase" className="py-20 bg-[#0e121a] border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs font-mono-num text-amber-500 uppercase tracking-wider mb-2">
              WORKSHOP PORTFOLIO · PAST PROJECTS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
              Finished Restorations &amp; Custom Builds
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-2xl">
              Representative examples of completed 4x4 vehicles built for local coffee estates and mountain trails. We will be updating this section with verified customer build sheets and photography.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#141822] rounded-lg border border-neutral-800 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Builds
            </button>
            <button
              onClick={() => setFilter('mm540')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'mm540'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Mahindra MM540
            </button>
            <button
              onClick={() => setFilter('bolero')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'bolero'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bolero 4x4
            </button>
            <button
              onClick={() => setFilter('safari')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'safari'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tata Sierra / Safari
            </button>
            <button
              onClick={() => setFilter('gypsy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'gypsy'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Maruti Gypsy
            </button>
          </div>
        </div>

        {/* Notice Strip */}
        <div className="mb-8 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong className="text-neutral-300">Sample Showcase:</strong> Vehicle specs shown below are examples. Official workshop build records and verified owner spec sheets will replace these.
            </span>
          </div>
          <span className="text-[11px] font-mono-num text-neutral-500 hidden sm:inline">
            CAW ARCHIVE
          </span>
        </div>

        {/* Builds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredBuilds.map((build) => (
            <div
              key={build.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-[#121620] overflow-hidden group hover:border-neutral-700 transition-all duration-200"
            >
              <div>
                {/* Visual Header / Diagram */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-[#161b26] to-[#0c0f16] p-6 flex flex-col justify-between border-b border-neutral-800">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between text-xs font-mono-num text-neutral-400">
                    <span className="text-amber-500 font-semibold">{build.category}</span>
                    <span>{build.clientRegion}</span>
                  </div>

                  {/* Clean Visual Badge & Title */}
                  <div className="my-auto flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="inline-block px-3 py-1 rounded text-xs font-mono-num font-bold text-white border border-neutral-700 mb-2"
                        style={{ backgroundColor: `${build.accentColor}cc` }}
                      >
                        {build.year} · {build.platform.toUpperCase()}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white font-display">
                        {build.title}
                      </div>
                    </div>
                  </div>

                  {/* Clean status strip */}
                  <div className="flex items-center justify-between text-[11px] font-mono-num text-neutral-400">
                    <span>{build.platform.toUpperCase()} 4WD</span>
                    <span>Full Restoration</span>
                  </div>
                </div>

                {/* Card Content - Clean, jargon-free */}
                <div className="p-6">
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {build.story}
                  </p>

                  {/* Clean Key Highlights */}
                  <div className="mt-4 pt-4 border-t border-neutral-800/70 space-y-2">
                    <span className="text-[11px] font-mono-num uppercase text-neutral-500 block">
                      Build Highlights
                    </span>
                    <div className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>Complete chassis rust cleanup and protective painting</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>Raised suspension &amp; off-road tyres for muddy estate climbs</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>Heavy-duty steel bumper and recovery winch fitted</span>
                    </div>
                  </div>

                  {/* Terrain Note */}
                  <div className="mt-4 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2">
                    <Mountain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-neutral-200">Estate Road Trial:</strong> Built to handle steep mud slopes and wet harvest trails with confidence.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedBuild(build)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
                >
                  <span>View Project Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Detailed Build Inspection */}
        {selectedBuild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#121622] rounded-2xl border border-neutral-700 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setSelectedBuild(null)}
                className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="pr-10">
                <div className="flex items-center gap-2 text-xs font-mono-num text-amber-500 mb-1">
                  <span>{selectedBuild.category}</span>
                  <span>·</span>
                  <span>{selectedBuild.clientRegion}</span>
                  <span>·</span>
                  <span>BUILT {selectedBuild.year}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {selectedBuild.title}
                </h3>
              </div>

              {/* Build Story */}
              <div className="mt-5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {selectedBuild.story}
              </div>

              {/* Work Carried Out - Simple, clear language */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <h4 className="text-xs font-mono-num uppercase tracking-wider text-neutral-400 mb-3">
                  Summary of Work Carried Out
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Complete chassis teardown, rust treatment, and high-durability paint</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Full engine overhaul tuned for mountain torque and cooling</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Suspension lifted and tuned for rough coffee estate paths</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Custom heavy-duty front steel bumper with electric recovery winch</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Waterproof army-grade canvas canopy with roll-up sides</span>
                  </div>
                </div>
              </div>

              {/* Simple Details Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 text-xs font-mono-num">
                <div>
                  <span className="text-neutral-500 block">Drive System</span>
                  <span className="text-neutral-200 font-medium">4WD High &amp; Low Range</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Fuel Type</span>
                  <span className="text-neutral-200 font-medium">Diesel / Petrol</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Scope of Work</span>
                  <span className="text-neutral-200 font-medium">Full Restoration</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Location Tested</span>
                  <span className="text-neutral-200 font-medium">{selectedBuild.clientRegion}</span>
                </div>
              </div>

              {/* Estate trial note */}
              <div className="mt-4 p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                <strong className="text-emerald-400">Tested in the Field:</strong> Thoroughly driven across Kodagu plantation mud tracks and steep rocky slopes before final handover.
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => setSelectedBuild(null)}
                  className="px-5 py-2 text-xs font-semibold bg-neutral-800 text-neutral-200 hover:text-white rounded-lg transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
