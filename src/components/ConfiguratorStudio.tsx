/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  BUILD_PARAM,
  configsEqual,
  countChanges,
  estimateClearanceMm,
  getAdvisories,
  getPlatform,
  parseConfig,
  serializeConfig,
} from '../data/configuratorRules';
import { VehicleBlueprintVisualizer } from './VehicleBlueprintVisualizer';
import {
  Check,
  Send,
  RotateCcw,
  Compass,
  FileText,
  Info,
  Link2,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  ArrowUpFromLine,
} from 'lucide-react';

interface ConfiguratorStudioProps {
  onBookService?: (platformName: string) => void;
}

type CategoryId = 'paint' | 'top' | 'suspension' | 'wheels' | 'armor' | 'interior';

const CATEGORIES: { id: CategoryId; num: string; label: string }[] = [
  { id: 'paint', num: '01', label: 'Paint Finish' },
  { id: 'top', num: '02', label: 'Canopy & Roof' },
  { id: 'suspension', num: '03', label: 'Suspension' },
  { id: 'wheels', num: '04', label: 'Wheels & Tyres' },
  { id: 'armor', num: '05', label: 'Field Armor' },
  { id: 'interior', num: '06', label: 'Interior' },
];

const STORAGE_KEY = 'caw_configurator_build';
const THEME_KEY = 'caw_configurator_theme';
type CfgTheme = 'dark' | 'light';
const loadTheme = (): CfgTheme => {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    // ignore
  }
  return 'dark';
};

/** Initial build priority: shared link, then last session, then the first platform's default. */
const loadInitialConfig = (): { config: ConfiguratorState; fromLink: boolean } => {
  try {
    const fromUrl = parseConfig(new URLSearchParams(window.location.search).get(BUILD_PARAM));
    if (fromUrl) return { config: fromUrl, fromLink: true };
  } catch {
    // ignore
  }
  try {
    const fromStore = parseConfig(localStorage.getItem(STORAGE_KEY));
    if (fromStore) return { config: fromStore, fromLink: false };
  } catch {
    // ignore
  }
  return { config: VEHICLE_PLATFORMS[0].defaultOptions, fromLink: false };
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

/* Shared option-card styling */
const cardClass = (selected: boolean) =>
  `w-full flex items-start justify-between gap-3 p-3.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${
    selected
      ? 'border-amber-500 bg-[color:var(--cfg-cardsel)] text-[color:var(--cfg-fg)]'
      : 'border-[color:var(--cfg-border)] bg-[color:var(--cfg-card)] text-[color:var(--cfg-fg2)] hover:border-[color:var(--cfg-borderstrong)]'
  }`;

export const ConfiguratorStudio: React.FC<ConfiguratorStudioProps> = ({ onBookService }) => {
  const initial = useRef(loadInitialConfig()).current;
  const [config, setConfig] = useState<ConfiguratorState>(initial.config);
  const [theme, setTheme] = useState<CfgTheme>(loadTheme);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('paint');
  const [copied, setCopied] = useState<'spec' | 'link' | 'failed' | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const currentPlatform = getPlatform(config.platformId);
  const baseline = currentPlatform.defaultOptions;
  const isModified = !configsEqual(config, baseline);
  const changeCount = countChanges(config, baseline);

  // Option lookups
  const selectedPaint = PAINT_OPTIONS.find((p) => p.id === config.paintId) || PAINT_OPTIONS[0];
  const selectedTop = TOP_OPTIONS.find((t) => t.id === config.topId) || TOP_OPTIONS[0];
  const selectedSuspension =
    SUSPENSION_OPTIONS.find((s) => s.id === config.suspensionId) || SUSPENSION_OPTIONS[0];
  const selectedWheel = WHEEL_OPTIONS.find((w) => w.id === config.wheelId) || WHEEL_OPTIONS[0];
  const selectedInterior =
    INTERIOR_OPTIONS.find((i) => i.id === config.interiorId) || INTERIOR_OPTIONS[0];
  const selectedArmor = ARMOR_OPTIONS.filter((a) => config.selectedArmorIds.includes(a.id));

  const advisories = useMemo(() => getAdvisories(config), [config]);
  const clearanceMm = estimateClearanceMm(currentPlatform, selectedSuspension.liftInches);

  // Scroll to the studio when opened from a shared link
  useEffect(() => {
    if (initial.fromLink) {
      const t = setTimeout(
        () => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        350
      );
      return () => clearTimeout(t);
    }
  }, [initial.fromLink]);

  // Persist build locally and keep the address bar shareable
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeConfig(config));
    } catch {
      // storage unavailable
    }
    try {
      const url = new URL(window.location.href);
      if (isModified) url.searchParams.set(BUILD_PARAM, serializeConfig(config));
      else url.searchParams.delete(BUILD_PARAM);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  }, [config, isModified]);

  const chooseTheme = (t: CfgTheme) => {
    setTheme(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // ignore
    }
  };

  const flash = (kind: 'spec' | 'link' | 'failed') => {
    setCopied(kind);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleSelectPlatform = (platformId: VehiclePlatformId) => {
    if (platformId === config.platformId) return;
    setConfig(getPlatform(platformId).defaultOptions);
  };

  const toggleArmor = (armorId: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedArmorIds: prev.selectedArmorIds.includes(armorId)
        ? prev.selectedArmorIds.filter((id) => id !== armorId)
        : [...prev.selectedArmorIds, armorId],
    }));
  };

  const handleReset = () => setConfig(baseline);

  // Tab keyboard navigation (arrow keys / Home / End)
  const focusCategory = (idx: number) => {
    const next = CATEGORIES[(idx + CATEGORIES.length) % CATEGORIES.length];
    setActiveCategory(next.id);
    tabRefs.current[next.id]?.focus();
  };
  const handleTabKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusCategory(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusCategory(idx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusCategory(0); }
    else if (e.key === 'End') { e.preventDefault(); focusCategory(CATEGORIES.length - 1); }
  };

  const activeIdx = CATEGORIES.findIndex((c) => c.id === activeCategory);
  const goStep = (delta: number) => {
    const next = CATEGORIES[activeIdx + delta];
    if (next) setActiveCategory(next.id);
  };

  const currentSelectionLabel = (id: CategoryId): string => {
    switch (id) {
      case 'paint': return selectedPaint.name;
      case 'top': return selectedTop.name;
      case 'suspension': return selectedSuspension.liftInches ? `+${selectedSuspension.liftInches}" lift` : 'Stock height';
      case 'wheels': return selectedWheel.tyreSpec;
      case 'armor': return `${config.selectedArmorIds.length} of ${ARMOR_OPTIONS.length}`;
      case 'interior': return selectedInterior.name;
    }
  };

  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set(BUILD_PARAM, serializeConfig(config));
    url.hash = 'configurator-studio';
    return url.toString();
  };

  const specLines = () => [
    `Platform: ${currentPlatform.name}`,
    `Finish: ${selectedPaint.name} (${selectedPaint.finish})`,
    `Top / Canopy: ${selectedTop.name}`,
    `Suspension: ${selectedSuspension.name}`,
    `Wheels & Tyres: ${selectedWheel.name}`,
    `Off-Road Armor: ${selectedArmor.map((a) => a.name).join('; ') || 'None'}`,
    `Interior: ${selectedInterior.name}`,
  ];

  const whatsappHref = () => {
    const text = [
      'Hello Coorg Auto Works (Matturu)!',
      '',
      'I configured a custom build on your CAW Studio:',
      ...specLines().map((l) => `*${l.replace(': ', ':*  ')}`),
      '',
      `Build link: ${shareUrl()}`,
      '',
      'Can you provide the official workshop quotation, spec sheet confirmation, and build slot timeline?',
    ].join('\n');
    return `https://wa.me/${WORKSHOP_INFO.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const handleCopySpec = async () => {
    const summary = [
      'COORG AUTO WORKS // BESPOKE BUILD SPECIFICATION',
      ...specLines(),
      'Quotation: set by Coorg Auto Works after physical inspection',
      `Facility: ${WORKSHOP_INFO.location.village}, ${WORKSHOP_INFO.location.landmark}, ${WORKSHOP_INFO.location.town}, ${WORKSHOP_INFO.location.district}`,
      `Build link: ${shareUrl()}`,
    ].join('\n');
    flash((await copyText(summary)) ? 'spec' : 'failed');
  };

  const handleCopyLink = async () => {
    flash((await copyText(shareUrl())) ? 'link' : 'failed');
  };

  const SummaryRow: React.FC<{ label: string; value: string; changed?: boolean }> = ({ label, value, changed }) => (
    <div className="flex justify-between gap-4">
      <span className="text-[color:var(--cfg-muted)] shrink-0">{label}</span>
      <span className="text-[color:var(--cfg-fg)] text-right">
        {changed && <span className="inline-block w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 align-middle" title="Changed from the default build" />}
        {value}
      </span>
    </div>
  );

  return (
    <section
      id="configurator-studio"
      ref={sectionRef}
      data-cfg-theme={theme}
      className="cfg-root relative py-20 bg-[color:var(--cfg-bg)] border-t border-b border-[color:var(--cfg-border)] scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-num text-[color:var(--cfg-accent)] mb-2">
              <Compass className="w-4 h-4" />
              <span>CAW BESPOKE STUDIO · INDIAN 4X4 LINEUP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[color:var(--cfg-fg)] font-display">
              Bespoke Vehicle Studio &amp; Spec Customizer
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[color:var(--cfg-muted)] max-w-2xl">
              Inspired by classic automotive ateliers, tailored for the rugged mountain trails of Coorg. Select your platform, paint luster, suspension lift, and recovery armor.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              role="radiogroup"
              aria-label="Studio theme"
              className="flex items-center p-1 rounded-lg border border-[color:var(--cfg-border)] bg-[color:var(--cfg-card)]"
            >
              {([['dark', 'Dark', Moon], ['light', 'Light', Sun]] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={theme === id}
                  onClick={() => chooseTheme(id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${
                    theme === id ? 'bg-amber-500 text-black font-semibold' : 'text-[color:var(--cfg-muted)] hover:text-[color:var(--cfg-fg)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleReset}
              disabled={!isModified}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[color:var(--cfg-borderstrong)] bg-[color:var(--cfg-card)] text-[color:var(--cfg-muted)] hover:text-[color:var(--cfg-fg)] transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[color:var(--cfg-muted)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to {currentPlatform.name.split(' ').slice(0, 2).join(' ')} default</span>
            </button>
          </div>
        </div>

        {/* Platform Selection */}
        <div
          role="radiogroup"
          aria-label="Base vehicle platform"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-[color:var(--cfg-panel2)] rounded-xl border border-[color:var(--cfg-border)] mb-8"
        >
          {VEHICLE_PLATFORMS.map((plat) => {
            const isSelected = plat.id === config.platformId;
            return (
              <button
                key={plat.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectPlatform(plat.id)}
                className={`flex flex-col text-left p-3 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${
                  isSelected
                    ? 'bg-[color:var(--cfg-raised)] text-[color:var(--cfg-fg)] shadow-md border border-[color:var(--cfg-borderstrong)]'
                    : 'text-[color:var(--cfg-muted)] hover:text-[color:var(--cfg-fg)] hover:bg-[color:var(--cfg-card)] border border-transparent'
                }`}
              >
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[color:var(--cfg-accent)]">
                  {plat.lineup}
                </span>
                <span className="font-semibold text-xs sm:text-sm mt-0.5 truncate text-[color:var(--cfg-fg)]">
                  {plat.name}
                </span>
                <span className="text-[11px] text-[color:var(--cfg-muted)] mt-1 line-clamp-1">{plat.tagline}</span>
              </button>
            );
          })}
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Visualizer & Specs */}
          <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
            <VehicleBlueprintVisualizer config={config} className="shadow-2xl" />

            <div className="p-5 bg-[color:var(--cfg-panel)] rounded-xl border border-[color:var(--cfg-border)]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[color:var(--cfg-border)]">
                <span className="text-xs font-mono-num uppercase tracking-wider text-[color:var(--cfg-muted)]">
                  Donor Platform Architecture
                </span>
                <span className="text-xs text-[color:var(--cfg-accent)] font-medium font-mono-num">ESTATE TESTED</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono-num">
                {[
                  ['Factory Engine', currentPlatform.stockSpecs.engine],
                  ['Displacement', currentPlatform.stockSpecs.displacement],
                  ['Peak Torque', currentPlatform.stockSpecs.torque],
                  ['Differential & Axle', currentPlatform.stockSpecs.axle],
                  ['Drive System', currentPlatform.driveType],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <span className="text-[color:var(--cfg-dim)] block">{label}</span>
                    <span className="text-[color:var(--cfg-fg2)] font-medium mt-0.5 block" title={value}>{value}</span>
                  </div>
                ))}
                <div>
                  <span className="text-[color:var(--cfg-dim)] block">Ground Clearance</span>
                  <span className="text-[color:var(--cfg-fg2)] font-medium mt-0.5 block">
                    {currentPlatform.stockSpecs.groundClearance}
                    {selectedSuspension.liftInches > 0 && clearanceMm && (
                      <span className="text-[color:var(--cfg-good)]"> → ~{clearanceMm} mm</span>
                    )}
                  </span>
                  {selectedSuspension.liftInches > 0 && (
                    <span className="text-[10px] text-[color:var(--cfg-dim)] block mt-0.5">suspension lift only, tyres excluded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[color:var(--cfg-warnbg)] border border-[color:var(--cfg-warnborder)] text-xs text-[color:var(--cfg-fg2)] flex items-start gap-3">
              <Info className="w-4 h-4 text-[color:var(--cfg-accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[color:var(--cfg-fg)] font-medium">Bespoke Spec Sheets Integration:</strong>{' '}
                Our engineering team will update these specs with your vehicle’s factory build card or custom donor options. If you have the original RC or spec preferences, share them directly for a tailored blueprint.
              </div>
            </div>
          </div>

          {/* Right: Controls & Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6 min-w-0">
            <div className="bg-[color:var(--cfg-panel)] rounded-xl border border-[color:var(--cfg-border)] p-5">
              {/* Category tabs */}
              <div
                role="tablist"
                aria-label="Customisation categories"
                className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[color:var(--cfg-border)] mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {CATEGORIES.map((cat, idx) => {
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      ref={(el) => { tabRefs.current[cat.id] = el; }}
                      role="tab"
                      id={`cfg-tab-${cat.id}`}
                      aria-selected={active}
                      aria-controls={`cfg-panel-${cat.id}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setActiveCategory(cat.id)}
                      onKeyDown={(e) => handleTabKey(e, idx)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${
                        active ? 'bg-amber-500 text-black font-semibold' : 'text-[color:var(--cfg-muted)] hover:text-[color:var(--cfg-fg)]'
                      }`}
                    >
                      {cat.num}. {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Current choice for this category */}
              <div className="flex items-center justify-between gap-3 mb-3 text-[11px] font-mono-num">
                <span className="text-[color:var(--cfg-dim)]">Step {activeIdx + 1} of {CATEGORIES.length}</span>
                <span className="text-[color:var(--cfg-accent2)] truncate" title={currentSelectionLabel(activeCategory)}>
                  {currentSelectionLabel(activeCategory)}
                </span>
              </div>

              <div
                role="tabpanel"
                id={`cfg-panel-${activeCategory}`}
                aria-labelledby={`cfg-tab-${activeCategory}`}
                className="max-h-[26rem] overflow-y-auto pr-1 -mr-1"
              >
                {activeCategory === 'paint' && (
                  <div className="space-y-3">
                    <div className="text-xs text-[color:var(--cfg-muted)]">
                      High-durability 2K polyurethane formulations designed to endure Kodagu monsoon humidity.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PAINT_OPTIONS.map((paint) => {
                        const isSelected = config.paintId === paint.id;
                        return (
                          <button
                            key={paint.id}
                            aria-pressed={isSelected}
                            onClick={() => setConfig({ ...config, paintId: paint.id })}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${
                              isSelected
                                ? 'border-amber-500 bg-[color:var(--cfg-cardsel)] text-[color:var(--cfg-fg)]'
                                : 'border-[color:var(--cfg-border)] bg-[color:var(--cfg-card)] text-[color:var(--cfg-fg2)] hover:border-[color:var(--cfg-borderstrong)]'
                            }`}
                          >
                            <div
                              className="w-7 h-7 rounded-full shrink-0 border border-[color:var(--cfg-borderstrong)] shadow-inner"
                              style={{ backgroundColor: paint.hex }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold truncate text-[color:var(--cfg-fg)]">{paint.name}</div>
                              <div className="text-[11px] text-[color:var(--cfg-accent2)] truncate">{paint.finish}</div>
                              {paint.inspiration && (
                                <div className="text-[10px] text-[color:var(--cfg-dim)] truncate">{paint.inspiration}</div>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[color:var(--cfg-accent)] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeCategory === 'top' && (
                  <div className="space-y-2.5">
                    {TOP_OPTIONS.map((top) => {
                      const isSelected = config.topId === top.id;
                      return (
                        <button key={top.id} aria-pressed={isSelected} onClick={() => setConfig({ ...config, topId: top.id })} className={cardClass(isSelected)}>
                          <div>
                            <div className="text-xs font-semibold text-[color:var(--cfg-fg)]">{top.name}</div>
                            <div className="text-[11px] text-[color:var(--cfg-muted)] mt-1">{top.description}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[color:var(--cfg-accent)] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeCategory === 'suspension' && (
                  <div className="space-y-2.5">
                    {SUSPENSION_OPTIONS.map((susp) => {
                      const isSelected = config.suspensionId === susp.id;
                      return (
                        <button key={susp.id} aria-pressed={isSelected} onClick={() => setConfig({ ...config, suspensionId: susp.id })} className={cardClass(isSelected)}>
                          <div>
                            <div className="text-xs font-semibold text-[color:var(--cfg-fg)] flex flex-wrap items-center gap-2">
                              <span>{susp.name}</span>
                              {susp.liftInches > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[color:var(--cfg-goodbg)] text-[color:var(--cfg-good)] border border-[color:var(--cfg-goodborder)] rounded">
                                  +{susp.liftInches}&quot; LIFT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[color:var(--cfg-muted)] mt-1">{susp.description}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[color:var(--cfg-accent)] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeCategory === 'wheels' && (
                  <div className="space-y-2.5">
                    {WHEEL_OPTIONS.map((wh) => {
                      const isSelected = config.wheelId === wh.id;
                      return (
                        <button key={wh.id} aria-pressed={isSelected} onClick={() => setConfig({ ...config, wheelId: wh.id })} className={cardClass(isSelected)}>
                          <div>
                            <div className="text-xs font-semibold text-[color:var(--cfg-fg)]">{wh.name}</div>
                            <div className="text-[11px] font-mono-num text-[color:var(--cfg-accent2)] mt-0.5">Rim: {wh.rimSpec}</div>
                            <div className="text-[11px] text-[color:var(--cfg-muted)] mt-1">{wh.description}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[color:var(--cfg-accent)] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeCategory === 'armor' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[color:var(--cfg-muted)] mb-1">
                      <span>Heavy-duty accessories fabricated in our Matturu metal shop. Pick any combination.</span>
                    </div>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        onClick={() => setConfig({ ...config, selectedArmorIds: ARMOR_OPTIONS.map((a) => a.id) })}
                        className="px-2 py-1 rounded border border-[color:var(--cfg-borderstrong)] text-[color:var(--cfg-fg2)] hover:text-[color:var(--cfg-fg)]"
                      >
                        Select all
                      </button>
                      <button
                        onClick={() => setConfig({ ...config, selectedArmorIds: [] })}
                        className="px-2 py-1 rounded border border-[color:var(--cfg-borderstrong)] text-[color:var(--cfg-fg2)] hover:text-[color:var(--cfg-fg)]"
                      >
                        Clear
                      </button>
                    </div>
                    {ARMOR_OPTIONS.map((arm) => {
                      const isChecked = config.selectedArmorIds.includes(arm.id);
                      return (
                        <button
                          key={arm.id}
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() => toggleArmor(arm.id)}
                          className={cardClass(isChecked)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                                isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-[color:var(--cfg-borderstrong)] bg-[color:var(--cfg-card)]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-[color:var(--cfg-fg)]">{arm.name}</div>
                              <div className="text-[11px] text-[color:var(--cfg-muted)] mt-0.5">{arm.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeCategory === 'interior' && (
                  <div className="space-y-2.5">
                    {INTERIOR_OPTIONS.map((int) => {
                      const isSelected = config.interiorId === int.id;
                      return (
                        <button key={int.id} aria-pressed={isSelected} onClick={() => setConfig({ ...config, interiorId: int.id })} className={cardClass(isSelected)}>
                          <div>
                            <div className="text-xs font-semibold text-[color:var(--cfg-fg)]">{int.name}</div>
                            <div className="text-[11px] font-mono-num text-[color:var(--cfg-accent2)] mt-0.5">{int.material}</div>
                            <div className="text-[11px] text-[color:var(--cfg-muted)] mt-1">{int.description}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[color:var(--cfg-accent)] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step navigation */}
              <div className="mt-4 pt-3 border-t border-[color:var(--cfg-border)] flex items-center justify-between">
                <button
                  onClick={() => goStep(-1)}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-[color:var(--cfg-fg2)] hover:text-[color:var(--cfg-fg)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => goStep(1)}
                  disabled={activeIdx === CATEGORIES.length - 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-[color:var(--cfg-fg2)] hover:text-[color:var(--cfg-fg)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next: {CATEGORIES[Math.min(activeIdx + 1, CATEGORIES.length - 1)].label} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advisories */}
            {advisories.length > 0 && (
              <div className="space-y-2" aria-live="polite">
                {advisories.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                      a.level === 'caution'
                        ? 'bg-[color:var(--cfg-warnbg)] border-[color:var(--cfg-warnborder)] text-[color:var(--cfg-warnfg)]'
                        : 'bg-[color:var(--cfg-card)] border-[color:var(--cfg-borderstrong)] text-[color:var(--cfg-fg2)]'
                    }`}
                  >
                    {a.level === 'caution' ? (
                      <TriangleAlert className="w-4 h-4 text-[color:var(--cfg-accent2)] shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-[color:var(--cfg-muted)] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-[color:var(--cfg-fg)]">{a.title}</div>
                      <div className="text-[color:var(--cfg-muted)] mt-0.5">{a.detail}</div>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] text-[color:var(--cfg-dim)] px-1">Advisory only. Nothing is blocked; we confirm fitment on your donor vehicle.</div>
              </div>
            )}

            {/* Summary & Quote */}
            <div className="p-5 bg-[color:var(--cfg-panel2)] rounded-xl border border-[color:var(--cfg-borderstrong)] shadow-xl">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[color:var(--cfg-border)]">
                <div className="min-w-0">
                  <span className="text-xs font-mono-num text-[color:var(--cfg-accent)] uppercase tracking-wider block">
                    Bespoke Specification Summary
                  </span>
                  <span className="text-base font-bold text-[color:var(--cfg-fg)] font-display block truncate">
                    {currentPlatform.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-[color:var(--cfg-accent2)] font-semibold block font-mono-num">Official Workshop Quote</span>
                  <span className="text-xs text-[color:var(--cfg-muted)]">
                    {isModified ? `${changeCount} of 6 changed` : 'Default build'}
                  </span>
                </div>
              </div>

              <div className="py-3 space-y-1.5 text-xs font-mono-num border-b border-[color:var(--cfg-border)] text-[color:var(--cfg-fg2)]">
                <SummaryRow label="Paint" value={`${selectedPaint.name}`} changed={config.paintId !== baseline.paintId} />
                <SummaryRow label="Canopy / Top" value={selectedTop.name} changed={config.topId !== baseline.topId} />
                <SummaryRow
                  label="Suspension"
                  value={selectedSuspension.liftInches ? `+${selectedSuspension.liftInches}" ${selectedSuspension.name.replace(/^\+[\d.]+"\s*/, '')}` : selectedSuspension.name}
                  changed={config.suspensionId !== baseline.suspensionId}
                />
                <SummaryRow label="Wheels & Tyres" value={selectedWheel.tyreSpec} changed={config.wheelId !== baseline.wheelId} />
                <SummaryRow label="Cabin Trim" value={selectedInterior.name} changed={config.interiorId !== baseline.interiorId} />
                <div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--cfg-muted)]">Armor &amp; Accessories</span>
                    <span className="text-[color:var(--cfg-fg)]">{selectedArmor.length} of {ARMOR_OPTIONS.length}</span>
                  </div>
                  {selectedArmor.length > 0 && (
                    <ul className="mt-1 ml-3 space-y-0.5 text-[11px] text-[color:var(--cfg-muted)] list-disc list-inside">
                      {selectedArmor.map((a) => (
                        <li key={a.id}>{a.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedSuspension.liftInches > 0 && clearanceMm && (
                  <div className="flex justify-between pt-1 text-[color:var(--cfg-good)]">
                    <span className="flex items-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> Est. ground clearance</span>
                    <span>~{clearanceMm} mm</span>
                  </div>
                )}
              </div>

              <div className="py-2.5 text-[11px] text-[color:var(--cfg-muted)] leading-relaxed border-b border-[color:var(--cfg-border)]">
                <span className="text-[color:var(--cfg-fg2)] font-medium">Company Pricing Note:</span> Actual fabrication and overhaul costs are determined by Coorg Auto Works following physical inspection of your donor vehicle and engine condition.
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Spec to Workshop on WhatsApp</span>
                </a>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleCopySpec}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[color:var(--cfg-raised)] hover:bg-[color:var(--cfg-raisedhover)] text-[color:var(--cfg-fg2)] rounded-lg text-xs font-medium border border-[color:var(--cfg-borderstrong)] transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{copied === 'spec' ? 'Copied!' : copied === 'failed' ? 'Copy failed' : 'Copy Spec'}</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[color:var(--cfg-raised)] hover:bg-[color:var(--cfg-raisedhover)] text-[color:var(--cfg-fg2)] rounded-lg text-xs font-medium border border-[color:var(--cfg-borderstrong)] transition-colors whitespace-nowrap"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{copied === 'link' ? 'Link copied!' : 'Copy Build Link'}</span>
                  </button>
                </div>
                {onBookService && (
                  <button
                    onClick={() => onBookService(currentPlatform.name)}
                    className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold border border-amber-600/60 text-[color:var(--cfg-accent2)] hover:bg-amber-500/10 transition-colors"
                  >
                    Book a Consultation for This Build
                  </button>
                )}
              </div>

              <div className="mt-3 text-[11px] text-[color:var(--cfg-dim)] text-center">
                All vehicles fabricated and assembled on-site at Matturu workshop, Ponnampet, South Kodagu.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
