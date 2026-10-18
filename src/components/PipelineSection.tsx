/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PipelineBuild } from '../types';
import { INITIAL_WORKSHOP_PIPELINE } from '../data/cawData';
import { Wrench, Clock, CheckCircle2, Lock, Mic, Camera } from 'lucide-react';

interface PipelineSectionProps {
  pipeline?: PipelineBuild[];
  onOpenAdminPortal?: () => void;
}

export const PipelineSection: React.FC<PipelineSectionProps> = ({
  pipeline = INITIAL_WORKSHOP_PIPELINE,
  onOpenAdminPortal,
}) => {
  return (
    <section id="pipeline" className="py-20 bg-[#0b0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-3xl">
            <div className="text-xs font-mono-num text-amber-500 uppercase tracking-wider mb-2">
              ACTIVE WORKSHOP STATUS · MATTURU DEPOT
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
              Currently on the Lifts
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400">
              Live updates directly maintained by our workshop technicians across our 4 mechanical bays.
            </p>
          </div>

          {onOpenAdminPortal && (
            <button
              onClick={onOpenAdminPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Workshop Staff Controls</span>
            </button>
          )}
        </div>

        {/* Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipeline.map((pipe) => (
            <div
              key={pipe.id}
              className="p-6 rounded-xl border border-neutral-800 bg-[#121620] hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Top Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-num font-bold text-black bg-amber-500 px-2 py-0.5 rounded">
                      BAY 0{pipe.bayNumber}
                    </span>
                    <span className="text-xs font-mono-num text-neutral-400 truncate max-w-[200px]">
                      {pipe.ownerEstate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono-num text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Target: {pipe.targetDelivery}</span>
                  </div>
                </div>

                {/* Vehicle Title & Stage */}
                <h3 className="text-lg font-bold text-white font-display">
                  {pipe.vehicleTitle}
                </h3>
                <div className="mt-1 text-xs font-medium text-amber-400/90 font-mono-num">
                  {pipe.currentPhase}
                </div>

                {/* Progress Bar with Tabular Numerals */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-mono-num mb-1.5">
                    <span className="text-neutral-400">Build Stage Completion</span>
                    <span className="text-white font-semibold">{pipe.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pipe.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Key Work Items */}
                <div className="mt-5 pt-4 border-t border-neutral-800/60 space-y-2">
                  <span className="text-[11px] font-mono-num uppercase text-neutral-500 block">
                    Active Mechanical Tasks
                  </span>
                  {pipe.keyWorkItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Technician Voice Log Updates (if recorded by staff) */}
                {pipe.voiceNotes && pipe.voiceNotes.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono-num text-amber-400 mb-1">
                      <Mic className="w-3 h-3" />
                      <span>Staff Audio Log</span>
                    </div>
                    <div className="text-neutral-300 italic">
                      &ldquo;{pipe.voiceNotes[pipe.voiceNotes.length - 1]}&rdquo;
                    </div>
                  </div>
                )}

                {/* Attached Shop Photos (if attached by staff) */}
                {pipe.photos && pipe.photos.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-800">
                    <span className="text-[10px] font-mono-num uppercase text-neutral-500 block mb-2">
                      Live Shop Photo Updates ({pipe.photos.length})
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {pipe.photos.map((img, i) => (
                        <div key={i} className="w-20 h-16 rounded-md overflow-hidden border border-neutral-700 shrink-0">
                          <img src={img} alt="Live Bay Photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {pipe.lastUpdated && (
                <div className="mt-4 pt-3 border-t border-neutral-800/50 text-[10px] font-mono-num text-neutral-500 text-right">
                  Updated: {pipe.lastUpdated}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
