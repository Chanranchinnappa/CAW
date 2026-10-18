/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WORKSHOP_INFO } from '../data/cawData';
import { MapPin, Phone, MessageSquare, Clock, Navigation, ExternalLink, Wrench, Lock } from 'lucide-react';

interface WorkshopLocationProps {
  onOpenBooking: () => void;
  onOpenAdminPortal?: () => void;
}

export const WorkshopLocation: React.FC<WorkshopLocationProps> = ({
  onOpenBooking,
  onOpenAdminPortal,
}) => {
  return (
    <section id="workshop-facility" className="py-20 bg-[#0b0e14] border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Workshop Address & Contact Details */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="text-xs font-mono-num text-amber-500 uppercase tracking-wider mb-2">
              FACILITY &amp; MECHANICAL DEPOT
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
              Visit Coorg Auto Works in Matturu
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed">
              Our 4-bay workshop is situated on Balale Road in Matturu, right next to the Coorg Sports Club grounds. We welcome vehicle owners for diagnostic inspections, custom consultations, and test drives.
            </p>

            {/* Address Box */}
            <div className="mt-8 p-6 rounded-xl border border-neutral-800 bg-[#121620] space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Workshop Facility Address</div>
                  <div className="text-neutral-300 mt-1">
                    {WORKSHOP_INFO.location.village}, {WORKSHOP_INFO.location.landmark}
                  </div>
                  <div className="text-neutral-400">
                    {WORKSHOP_INFO.location.town}, {WORKSHOP_INFO.location.taluk},{' '}
                    {WORKSHOP_INFO.location.district}, {WORKSHOP_INFO.location.state} –{' '}
                    {WORKSHOP_INFO.location.pincode}
                  </div>
                  <div className="text-xs font-mono-num text-neutral-500 mt-1.5">
                    GPS Coordinates: {WORKSHOP_INFO.location.gps}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-neutral-800">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-white">Workshop Operating Hours</div>
                  <div className="text-neutral-300 mt-0.5">{WORKSHOP_INFO.contact.hours}</div>
                  <div className="text-xs font-mono-num text-amber-400 mt-1">
                    {WORKSHOP_INFO.contact.emergencyHours}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${WORKSHOP_INFO.contact.phonePrimary}`}
                className="flex items-center gap-2 px-5 py-3 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call {WORKSHOP_INFO.contact.phoneFormatted}</span>
              </a>

              <a
                href={`https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=Hello%20Coorg%20Auto%20Works!%20I%20am%20looking%20for%20directions%20or%20a%20workshop%20appointment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={WORKSHOP_INFO.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 text-neutral-400" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Right Column: Directions & Regional Access Guide */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-[#121620]">
              <div className="flex items-center gap-2 text-xs font-mono-num text-amber-500 mb-2">
                <Navigation className="w-4 h-4" />
                <span>REGIONAL ACCESS ROUTES</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                How to Reach Coorg Auto Works
              </h3>

              <div className="mt-5 space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <div className="font-semibold text-neutral-200">From Ponnampet Town Center (2.5 km)</div>
                  <div className="text-neutral-400 mt-1">
                    Head south on Balale Road towards Coorg Sports Club. Our workshop gates are situated 200m past the sports ground on the right.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <div className="font-semibold text-neutral-200">From Gonikoppal (9 km)</div>
                  <div className="text-neutral-400 mt-1">
                    Take the Gonikoppal – Ponnampet state highway (SH-89), turn onto Balale road at the Ponnampet junction. Approx. 12 minutes drive.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <div className="font-semibold text-neutral-200">From Mysore / Hunsur (85 km)</div>
                  <div className="text-neutral-400 mt-1">
                    Follow Mysore – Hunsur – Anechaukur checkpost – Gonikoppal – Ponnampet route. Scenic drive along coffee plantations.
                  </div>
                </div>
              </div>

              {/* Discreet Staff Portal trigger */}
              {onOpenAdminPortal && (
                <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Workshop Staff Access:</span>
                  <button
                    onClick={onOpenAdminPortal}
                    className="flex items-center gap-1.5 text-neutral-400 hover:text-amber-400 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Staff Operations Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 BAYS INFRASTRUCTURE LAYOUT (ARCHITECTURAL & ACCURATE, NO FAKE IMAGES) */}
        <div className="mt-16 pt-12 border-t border-neutral-800">
          <div className="mb-6">
            <div className="text-xs font-mono-num text-amber-500 uppercase tracking-wider mb-1">
              DEPOT INFRASTRUCTURE &amp; WORKFLOW
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              Matturu 4-Bay Mechanical Facility
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              Dedicated bays engineered for ladder-chassis off-road restorations and heavy machinery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-neutral-800 bg-[#121620]">
              <span className="text-xs font-mono-num font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                BAY 01
              </span>
              <h4 className="text-sm font-bold text-white mt-2 font-display">
                Heavy Hydraulic Lift &amp; Chassis Alignment
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Dedicated to body-off frame inspection, rust conversion, differential shimming, and shackle reversal geometry.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-800 bg-[#121620]">
              <span className="text-xs font-mono-num font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                BAY 02
              </span>
              <h4 className="text-sm font-bold text-white mt-2 font-display">
                Precision Engine Rebuild &amp; Machining Room
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Clean assembly environment for cylinder head decking, dynamic crank balancing, and diesel injection pump calibration.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-800 bg-[#121620]">
              <span className="text-xs font-mono-num font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                BAY 03
              </span>
              <h4 className="text-sm font-bold text-white mt-2 font-display">
                Metal Fabrication &amp; Roll Cage Shop
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                MIG welding, rotary tube bender, and plate cutting for custom winch bumpers, rock sliders, and tubular cages.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-800 bg-[#121620]">
              <span className="text-xs font-mono-num font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                BAY 04
              </span>
              <h4 className="text-sm font-bold text-white mt-2 font-display">
                Pre-Delivery Articulation &amp; Mud Testing Yard
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Staging and test ramp ground along Balale Road where completed builds undergo 4WD low crawl verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
