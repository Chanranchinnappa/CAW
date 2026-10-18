/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConfiguratorState, VehiclePlatformId } from '../types';
import {
  VEHICLE_PLATFORMS,
  PAINT_OPTIONS,
  TOP_OPTIONS,
  SUSPENSION_OPTIONS,
  WHEEL_OPTIONS,
  ARMOR_OPTIONS,
  INTERIOR_OPTIONS,
  WORKSHOP_INFO,
} from '../data/cawData';
import { VehicleBlueprintVisualizer } from './VehicleBlueprintVisualizer';
import {
  Check,
  Send,
  RotateCcw,
  Compass,
  FileText,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface ConfiguratorStudioProps {
  onBookService?: (platformName: string) => void;
}

export const ConfiguratorStudio: React.FC<ConfiguratorStudioProps> = ({ onBookService }) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<VehiclePlatformId>('mm540');
  const [activeCategory, setActiveCategory] = useState<
    'paint' | 'top' | 'suspension' | 'wheels' | 'armor' | 'interior'
  >('paint');
  const [copiedState, setCopiedState] = useState(false);

  const currentPlatform =
    VEHICLE_PLATFORMS.find((p) => p.id === selectedPlatformId) || VEHICLE_PLATFORMS[0];

  const [config, setConfig] = useState<ConfiguratorState>(currentPlatform.defaultOptions);

  // Switch base platform
  const handleSelectPlatform = (platformId: VehiclePlatformId) => {
    setSelectedPlatformId(platformId);
    const plat = VEHICLE_PLATFORMS.find((p) => p.id === platformId) || VEHICLE_PLATFORMS[0];
    setConfig(plat.defaultOptions);
  };

  // Armor toggle
  const toggleArmor = (armorId: string) => {
    setConfig((prev) => {
      const exists = prev.selectedArmorIds.includes(armorId);
      return {
        ...prev,
        selectedArmorIds: exists
          ? prev.selectedArmorIds.filter((id) => id !== armorId)
          : [...prev.selectedArmorIds, armorId],
      };
    });
  };

  // Reset to default
  const handleReset = () => {
    setConfig(currentPlatform.defaultOptions);
  };

  // Selected option lookups
  const selectedPaint = PAINT_OPTIONS.find((p) => p.id === config.paintId) || PAINT_OPTIONS[0];
  const selectedTop = TOP_OPTIONS.find((t) => t.id === config.topId) || TOP_OPTIONS[0];
  const selectedSuspension =
    SUSPENSION_OPTIONS.find((s) => s.id === config.suspensionId) || SUSPENSION_OPTIONS[0];
  const selectedWheel = WHEEL_OPTIONS.find((w) => w.id === config.wheelId) || WHEEL_OPTIONS[0];
  const selectedInterior =
    INTERIOR_OPTIONS.find((i) => i.id === config.interiorId) || INTERIOR_OPTIONS[0];

  // Generate WhatsApp inquiry text
  const generateWhatsAppMessage = () => {
    const armorNames = config.selectedArmorIds
      .map((id) => ARMOR_OPTIONS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const text = `Hello Coorg Auto Works (Matturu)!%0A%0AI configured a custom build on your CAW Studio:%0A*Vehicle:* ${currentPlatform.name}%0A*Finish:* ${selectedPaint.name} (${selectedPaint.finish})%0A*Top / Canopy:* ${selectedTop.name}%0A*Suspension:* ${selectedSuspension.name}%0A*Wheels & Tyres:* ${selectedWheel.name}%0A*Off-Road Armor:* ${armorNames || 'None'}%0A*Interior:* ${selectedInterior.name}%0A%0ACan you provide the official workshop quotation, spec sheet confirmation, and build slot timeline?`;

    return `https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=${text}`;
  };

  const handleCopySpec = () => {
    const armorNames = config.selectedArmorIds
      .map((id) => ARMOR_OPTIONS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const summary = `COORG AUTO WORKS // BESPOKE BUILD SPECIFICATION
Platform: ${currentPlatform.name}
Finish: ${selectedPaint.name} (${selectedPaint.finish})
Top: ${selectedTop.name}
Suspension: ${selectedSuspension.name}
Wheels/Tyres: ${selectedWheel.name}
Armor: ${armorNames || 'None'}
Interior: ${selectedInterior.name}
Quotation: Company Direct Quote via Coorg Auto Works
Facility: Matturu, Balale Road, Ponnampet, Kodagu`;

    navigator.clipboard.writeText(summary);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
  };

  return (
    <section id="configurator-studio" className="relative py-20 bg-[#0e121a] border-t border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-num text-amber-500 mb-2">
              <Compass className="w-4 h-4" />
              <span>CAW BESPOKE STUDIO · INDIAN 4X4 LINEUP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
              Bespoke Vehicle Studio &amp; Spec Customizer
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-2xl">
              Inspired by classic automotive ateliers, tailored for the rugged mountain trails of Coorg. Select your platform, paint luster, suspension lift, and recovery armor.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Configuration</span>
            </button>
          </div>
        </div>

        {/* Platform Selection Tabs (6 Vehicles: MM540, Commander, Major MDI, Bolero, Safari/Sierra, Gypsy) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-[#141822] rounded-xl border border-neutral-800 mb-8">
          {VEHICLE_PLATFORMS.map((plat) => {
            const isSelected = plat.id === selectedPlatformId;
            return (
              <button
                key={plat.id}
                onClick={() => handleSelectPlatform(plat.id)}
                className={`flex flex-col text-left p-3 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-amber-500">
                  {plat.lineup}
                </span>
                <span className="font-semibold text-xs sm:text-sm mt-0.5 truncate text-white">
                  {plat.name}
                </span>
                <span className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{plat.tagline}</span>
              </button>
            );
          })}
        </div>

        {/* Main Configurator Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive 3-Angle Visualizer & Quick Specs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <VehicleBlueprintVisualizer
              config={config}
              className="shadow-2xl"
            />

            {/* Platform Mechanical Specs Strip */}
            <div className="p-5 bg-[#121620] rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/80">
                <span className="text-xs font-mono-num uppercase tracking-wider text-neutral-400">
                  Donor Platform Architecture
                </span>
                <span className="text-xs text-amber-500 font-medium font-mono-num">
                  ESTATE TESTED
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono-num">
                <div>
                  <span className="text-neutral-500 block">Factory Engine</span>
                  <span className="text-neutral-200 font-medium mt-0.5 block truncate">
                    {currentPlatform.stockSpecs.engine}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Displacement</span>
                  <span className="text-neutral-200 font-medium mt-0.5 block">
                    {currentPlatform.stockSpecs.displacement}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Peak Torque</span>
                  <span className="text-neutral-200 font-medium mt-0.5 block">
                    {currentPlatform.stockSpecs.torque}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Ground Clearance</span>
                  <span className="text-neutral-200 font-medium mt-0.5 block">
                    {currentPlatform.stockSpecs.groundClearance}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Differential &amp; Axle</span>
                  <span className="text-neutral-200 font-medium mt-0.5 block truncate">
                    {currentPlatform.stockSpecs.axle}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Drive System</span>
                  <span className="text-neutral-200 font-medium mt-0.5 block truncate">
                    {currentPlatform.driveType}
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Sheet Notice Callout */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-neutral-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-medium">Bespoke Spec Sheets Integration:</strong>{' '}
                Our engineering team will update these specs with your vehicle’s factory build card or custom donor options. If you have the original RC or spec preferences, share them directly for a tailored blueprint.
              </div>
            </div>
          </div>

          {/* Right Column: Customizer Controls & Company Quote Module */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Customizer Tabs */}
            <div className="bg-[#121620] rounded-xl border border-neutral-800 p-5">
              {/* Category Sub-tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-neutral-800 scrollbar-none mb-4">
                <button
                  onClick={() => setActiveCategory('paint')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === 'paint'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  01. Paint Finish
                </button>
                <button
                  onClick={() => setActiveCategory('top')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === 'top'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  02. Canopy &amp; Roof
                </button>
                <button
                  onClick={() => setActiveCategory('suspension')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === 'suspension'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  03. Suspension
                </button>
                <button
                  onClick={() => setActiveCategory('wheels')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === 'wheels'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  04. Wheels &amp; Tyres
                </button>
                <button
                  onClick={() => setActiveCategory('armor')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === 'armor'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  05. Field Armor
                </button>
                <button
                  onClick={() => setActiveCategory('interior')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === 'interior'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  06. Interior
                </button>
              </div>

              {/* Panel 1: Paint Colors */}
              {activeCategory === 'paint' && (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400">
                    High-durability 2K polyurethane formulations designed to endure Kodagu monsoon humidity.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PAINT_OPTIONS.map((paint) => {
                      const isSelected = config.paintId === paint.id;
                      return (
                        <button
                          key={paint.id}
                          onClick={() => setConfig({ ...config, paintId: paint.id })}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-neutral-800/90 text-white'
                              : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full shrink-0 border border-neutral-700 shadow-inner"
                            style={{ backgroundColor: paint.hex }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate text-white">{paint.name}</div>
                            <div className="text-[11px] text-amber-400/90 truncate">{paint.inspiration || paint.finish}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Panel 2: Tops & Canopies */}
              {activeCategory === 'top' && (
                <div className="space-y-2.5">
                  {TOP_OPTIONS.map((top) => {
                    const isSelected = config.topId === top.id;
                    return (
                      <button
                        key={top.id}
                        onClick={() => setConfig({ ...config, topId: top.id })}
                        className={`w-full flex items-start justify-between gap-3 p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-neutral-800/90 text-white'
                            : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{top.name}</div>
                          <div className="text-[11px] text-neutral-400 mt-1">{top.description}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Panel 3: Suspension & Lifts */}
              {activeCategory === 'suspension' && (
                <div className="space-y-2.5">
                  {SUSPENSION_OPTIONS.map((susp) => {
                    const isSelected = config.suspensionId === susp.id;
                    return (
                      <button
                        key={susp.id}
                        onClick={() => setConfig({ ...config, suspensionId: susp.id })}
                        className={`w-full flex items-start justify-between gap-3 p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-neutral-800/90 text-white'
                            : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{susp.name}</span>
                            {susp.liftInches > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                                +{susp.liftInches}&quot; LIFT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-1">{susp.description}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Panel 4: Wheels & Off-road Tyres */}
              {activeCategory === 'wheels' && (
                <div className="space-y-2.5">
                  {WHEEL_OPTIONS.map((wh) => {
                    const isSelected = config.wheelId === wh.id;
                    return (
                      <button
                        key={wh.id}
                        onClick={() => setConfig({ ...config, wheelId: wh.id })}
                        className={`w-full flex items-start justify-between gap-3 p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-neutral-800/90 text-white'
                            : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{wh.name}</div>
                          <div className="text-[11px] font-mono-num text-amber-400/90 mt-0.5">
                            Rim: {wh.rimSpec}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-1">{wh.description}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Panel 5: Armor & Protection (Multi-select) */}
              {activeCategory === 'armor' && (
                <div className="space-y-2.5">
                  <div className="text-xs text-neutral-400 mb-1">
                    Select heavy-duty recovery accessories fabricated in our Matturu metal shop:
                  </div>
                  {ARMOR_OPTIONS.map((arm) => {
                    const isChecked = config.selectedArmorIds.includes(arm.id);
                    return (
                      <button
                        key={arm.id}
                        onClick={() => toggleArmor(arm.id)}
                        className={`w-full flex items-start justify-between gap-3 p-3.5 rounded-lg border text-left transition-all ${
                          isChecked
                            ? 'border-amber-500 bg-neutral-800/90 text-white'
                            : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-amber-500 border-amber-500 text-black'
                                : 'border-neutral-600 bg-neutral-900'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{arm.name}</div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">{arm.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Panel 6: Interior & Cabin Trim */}
              {activeCategory === 'interior' && (
                <div className="space-y-2.5">
                  {INTERIOR_OPTIONS.map((int) => {
                    const isSelected = config.interiorId === int.id;
                    return (
                      <button
                        key={int.id}
                        onClick={() => setConfig({ ...config, interiorId: int.id })}
                        className={`w-full flex items-start justify-between gap-3 p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-neutral-800/90 text-white'
                            : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{int.name}</div>
                          <div className="text-[11px] font-mono-num text-amber-400/90 mt-0.5">
                            {int.material}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-1">{int.description}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Spec Summary & Company Quotation Module */}
            <div className="p-5 bg-[#141923] rounded-xl border border-neutral-700 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-xs font-mono-num text-amber-500 uppercase tracking-wider block">
                    Bespoke Specification Summary
                  </span>
                  <span className="text-base font-bold text-white font-display">
                    {currentPlatform.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-400 font-semibold block font-mono-num">
                    Official Workshop Quote
                  </span>
                  <span className="text-xs text-neutral-400">
                    Set directly by Coorg Auto Works
                  </span>
                </div>
              </div>

              {/* Itemized spec overview */}
              <div className="py-3 space-y-1.5 text-xs font-mono-num border-b border-neutral-800 text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Chassis Platform</span>
                  <span className="text-white">{currentPlatform.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Paint Formulation</span>
                  <span className="text-white">{selectedPaint.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Canopy / Top</span>
                  <span className="text-white">{selectedTop.name.split(' ')[0]} {selectedTop.name.split(' ')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Suspension Setup</span>
                  <span className="text-white">{selectedSuspension.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Wheels &amp; Tyres</span>
                  <span className="text-white">{selectedWheel.name.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Armor &amp; Winch Accessories</span>
                  <span className="text-white">{config.selectedArmorIds.length} Items Selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cabin Trim</span>
                  <span className="text-white">{selectedInterior.name}</span>
                </div>
              </div>

              {/* Company Pricing Disclaimer */}
              <div className="py-2.5 text-[11px] text-neutral-400 leading-relaxed border-b border-neutral-800">
                <span className="text-neutral-300 font-medium">Company Pricing Note:</span> Actual fabrication and overhaul costs are determined by Coorg Auto Works following physical inspection of your donor vehicle and engine condition.
              </div>

              {/* Call to Actions */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Spec to Workshop</span>
                </a>
                <button
                  onClick={handleCopySpec}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{copiedState ? 'Copied to Clipboard!' : 'Copy Spec'}</span>
                </button>
              </div>

              <div className="mt-3 text-[11px] text-neutral-500 text-center">
                All vehicles fabricated and assembled on-site at Matturu workshop, Ponnampet, South Kodagu.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
