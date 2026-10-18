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
  resolveTopColor,
  serializeConfig,
} from '../data/configuratorRules';
import { VehicleBlueprintVisualizer } from './VehicleBlueprintVisualizer';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, MaskText } from '../motion/primitives';
import {
  Check,
  ChevronDown,
  FileText,
  Info,
  Link2,
  RotateCcw,
  Send,
  TriangleAlert,
} from 'lucide-react';

interface ConfiguratorStudioProps {
  onBookService?: (platformName: string) => void;
}

type StepId = 'paint' | 'top' | 'suspension' | 'wheels' | 'armor' | 'interior';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'paint', label: 'Paint' },
  { id: 'top', label: 'Roof and canopy' },
  { id: 'suspension', label: 'Suspension' },
  { id: 'wheels', label: 'Wheels and tyres' },
  { id: 'armor', label: 'Armor and accessories' },
  { id: 'interior', label: 'Interior' },
];

const STORAGE_KEY = 'caw_configurator_build';

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

/** Light or dark check mark depending on swatch luminance */
/** CSS background for a paint swatch: a metallic gradient with a soft highlight. */
const paintBackground = (hex: string, hex2?: string) =>
  `radial-gradient(120% 90% at 28% 18%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%), linear-gradient(135deg, ${hex2 ?? hex} 0%, ${hex} 55%, rgba(0,0,0,0.55) 130%), ${hex}`;

const checkColor = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#14181c' : '#ffffff';
};

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--t-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--t-panel)]';

/* A single choice row: a left bar marks the selection */
const ChoiceRow: React.FC<{
  selected: boolean;
  role: 'radio' | 'checkbox';
  onClick: () => void;
  title: string;
  meta?: string;
  badge?: string;
  description: string;
}> = ({ selected, role, onClick, title, meta, badge, description }) => (
  <button
    role={role}
    aria-checked={selected}
    onClick={onClick}
    className={`group relative w-full flex items-start gap-3 py-3 pl-4 pr-3 rounded-md text-left transition-colors ${focusRing} ${
      selected
        ? 'bg-[color:var(--t-cardsel)]'
        : 'hover:bg-[color:var(--t-card)]'
    }`}
  >
    <span
      aria-hidden
      className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-colors ${
        selected ? 'bg-[color:var(--t-accent)]' : 'bg-transparent group-hover:bg-[color:var(--t-borderstrong)]'
      }`}
    />
    {role === 'checkbox' && (
      <span
        aria-hidden
        className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${
          selected
            ? 'bg-[color:var(--t-accent)] border-[color:var(--t-accent)] text-black'
            : 'border-[color:var(--t-borderstrong)]'
        }`}
      >
        {selected && <Check className="w-3 h-3 stroke-[3]" />}
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-[color:var(--t-fg)]">{title}</span>
        {badge && (
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[color:var(--t-goodbg)] text-[color:var(--t-good)] border border-[color:var(--t-goodborder)]">
            {badge}
          </span>
        )}
      </span>
      {meta && <span className="block text-xs font-mono-num text-[color:var(--t-accent2)] mt-0.5">{meta}</span>}
      <span className="block text-[13px] leading-relaxed text-[color:var(--t-muted)] mt-1">{description}</span>
    </span>
    {role === 'radio' && selected && (
      <Check className="w-4 h-4 mt-0.5 text-[color:var(--t-accent)] shrink-0" aria-hidden />
    )}
  </button>
);

/* Build-sheet row with a dotted leader between label and value */
const SheetRow: React.FC<{ label: string; value: string; changed?: boolean }> = ({ label, value, changed }) => (
  <div className="flex items-baseline gap-2 text-sm">
    <dt className="text-[color:var(--t-muted)] shrink-0">{label}</dt>
    <span aria-hidden className="flex-1 min-w-4 border-b border-dotted border-[color:var(--t-borderstrong)] translate-y-[-3px]" />
    <dd className="text-right font-medium text-[color:var(--t-fg)] max-w-[62%]">
      {changed && (
        <span
          className="inline-block w-1.5 h-1.5 mr-1.5 rounded-full bg-[color:var(--t-accent)] align-middle"
          title="Changed from the default build"
        />
      )}
      {value}
    </dd>
  </div>
);

const MAKES = Array.from(new Set(VEHICLE_PLATFORMS.map((p) => p.lineup)));

export const ConfiguratorStudio: React.FC<ConfiguratorStudioProps> = ({ onBookService }) => {
  const initial = useRef(loadInitialConfig()).current;
  const [config, setConfig] = useState<ConfiguratorState>(initial.config);
  const [openStep, setOpenStep] = useState<StepId | null>('paint');
  const [hoverPaintId, setHoverPaintId] = useState<string | null>(null);
  const [copied, setCopied] = useState<'spec' | 'link' | 'failed' | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [make, setMake] = useState<string>(getPlatform(config.platformId).lineup);
  const currentPlatform = getPlatform(config.platformId);
  const baseline = currentPlatform.defaultOptions;
  const isModified = !configsEqual(config, baseline);
  const changeCount = countChanges(config, baseline);

  const selectedPaint = PAINT_OPTIONS.find((p) => p.id === config.paintId) || PAINT_OPTIONS[0];
  const selectedTop = TOP_OPTIONS.find((t) => t.id === config.topId) || TOP_OPTIONS[0];
  const selectedTopColor = resolveTopColor(selectedTop.id, config.topColorId);
  const selectedSuspension =
    SUSPENSION_OPTIONS.find((s) => s.id === config.suspensionId) || SUSPENSION_OPTIONS[0];
  const selectedWheel = WHEEL_OPTIONS.find((w) => w.id === config.wheelId) || WHEEL_OPTIONS[0];
  const selectedInterior =
    INTERIOR_OPTIONS.find((i) => i.id === config.interiorId) || INTERIOR_OPTIONS[0];
  const selectedArmor = ARMOR_OPTIONS.filter((a) => config.selectedArmorIds.includes(a.id));
  const shownPaint = PAINT_OPTIONS.find((p) => p.id === hoverPaintId) || selectedPaint;

  const advisories = useMemo(() => getAdvisories(config), [config]);
  const clearanceMm = estimateClearanceMm(currentPlatform, selectedSuspension.liftInches);

  const changedStep: Record<StepId, boolean> = {
    paint: config.paintId !== baseline.paintId,
    top: config.topId !== baseline.topId,
    suspension: config.suspensionId !== baseline.suspensionId,
    wheels: config.wheelId !== baseline.wheelId,
    armor: [...config.selectedArmorIds].sort().join() !== [...baseline.selectedArmorIds].sort().join(),
    interior: config.interiorId !== baseline.interiorId,
  };

  const stepValue = (id: StepId): string => {
    switch (id) {
      case 'paint': return selectedPaint.name;
      case 'top': return selectedTopColor ? `${selectedTopColor.name} · ${selectedTop.name}` : selectedTop.name;
      case 'suspension': return selectedSuspension.liftInches ? `+${selectedSuspension.liftInches}" lift` : 'Stock height';
      case 'wheels': return selectedWheel.tyreSpec;
      case 'armor': return selectedArmor.length ? `${selectedArmor.length} of ${ARMOR_OPTIONS.length} fitted` : 'None';
      case 'interior': return selectedInterior.name;
    }
  };

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

  const toggleStep = (id: StepId) => setOpenStep((cur) => (cur === id ? null : id));

  const goNext = (id: StepId) => {
    const idx = STEPS.findIndex((s) => s.id === id);
    const next = STEPS[idx + 1];
    if (!next) return;
    setOpenStep(next.id);
    setTimeout(
      () => stepRefs.current[next.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
      60
    );
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
    `Top / Canopy: ${selectedTop.name}${selectedTopColor ? ` (${selectedTopColor.name})` : ''}`,
    `Suspension: ${selectedSuspension.name}`,
    `Wheels & Tyres: ${selectedWheel.name}`,
    `Off-Road Armor: ${selectedArmor.map((a) => a.name).join('; ') || 'None'}`,
    `Interior: ${selectedInterior.name}`,
  ];

  const whatsappHref = () => {
    const text = [
      'Hello Coorg Auto Works!',
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

  /* ---------- Step bodies ---------- */
  const renderStep = (id: StepId) => {
    switch (id) {
      case 'paint':
        return (
          <div>
            <div role="radiogroup" aria-label="Paint colour" className="grid grid-cols-5 sm:grid-cols-5 gap-3 px-1 pt-1">
              {PAINT_OPTIONS.map((paint) => {
                const sel = config.paintId === paint.id;
                return (
                  <button
                    key={paint.id}
                    role="radio"
                    aria-checked={sel}
                    aria-label={`${paint.name}, ${paint.finish}`}
                    onClick={() => setConfig({ ...config, paintId: paint.id })}
                    onMouseEnter={() => setHoverPaintId(paint.id)}
                    onMouseLeave={() => setHoverPaintId(null)}
                    onFocus={() => setHoverPaintId(paint.id)}
                    onBlur={() => setHoverPaintId(null)}
                    className={`relative aspect-square rounded-full border border-[color:var(--t-borderstrong)] transition-transform hover:scale-105 ${focusRing} ${
                      sel ? 'ring-2 ring-offset-2 ring-[color:var(--t-accent)] ring-offset-[color:var(--t-panel)]' : ''
                    }`}
                    style={{ background: paintBackground(paint.hex, paint.hex2) }}
                  >
                    {sel && (
                      <Check
                        className="absolute inset-0 m-auto w-4 h-4 stroke-[3]"
                        style={{ color: checkColor(paint.hex) }}
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 px-1 min-h-[3.25rem]" aria-live="polite">
              <div className="text-sm font-semibold text-[color:var(--t-fg)]">{shownPaint.name}</div>
              <div className="text-[13px] text-[color:var(--t-muted)]">
                {shownPaint.finish}
                {shownPaint.inspiration ? `, ${shownPaint.inspiration.toLowerCase()}` : ''}
              </div>
              <div className="text-xs text-[color:var(--t-dim)] mt-1">
                2K polyurethane, built to hold up through Kodagu monsoon humidity.
              </div>
            </div>
          </div>
        );
      case 'top':
        return (
          <div role="radiogroup" aria-label="Roof and canopy" className="space-y-1">
            {TOP_OPTIONS.map((t) => (
              <ChoiceRow key={t.id} role="radio" selected={config.topId === t.id}
                onClick={() => setConfig({ ...config, topId: t.id, topColorId: undefined })} title={t.name} description={t.description} />
            ))}
            {selectedTopColor && (
              <div className="px-1 pt-4">
                <div className="text-sm font-semibold text-[color:var(--t-fg)]">
                  Colour <span className="font-normal text-[color:var(--t-muted)]">· {selectedTopColor.name}</span>
                </div>
                <div role="radiogroup" aria-label="Roof colour" className="mt-3 flex flex-wrap gap-3">
                  {(selectedTop.colors ?? []).map((c) => {
                    const sel = c.id === selectedTopColor.id;
                    return (
                      <button
                        key={c.id}
                        role="radio"
                        aria-checked={sel}
                        aria-label={c.name}
                        title={c.name}
                        onClick={() => setConfig({ ...config, topColorId: c.id })}
                        className={`relative h-10 w-10 rounded-full border border-[color:var(--t-borderstrong)] transition-transform hover:scale-105 ${focusRing} ${
                          sel ? 'ring-2 ring-offset-2 ring-[color:var(--t-accent)] ring-offset-[color:var(--t-panel)]' : ''
                        }`}
                        style={{ background: paintBackground(c.hex, c.hex2) }}
                      >
                        {sel && <Check className="absolute inset-0 m-auto h-4 w-4 stroke-[3]" style={{ color: checkColor(c.hex) }} aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      case 'suspension':
        return (
          <div role="radiogroup" aria-label="Suspension" className="space-y-1">
            {SUSPENSION_OPTIONS.map((s) => (
              <ChoiceRow key={s.id} role="radio" selected={config.suspensionId === s.id}
                onClick={() => setConfig({ ...config, suspensionId: s.id })} title={s.name}
                badge={s.liftInches > 0 ? `+${s.liftInches}" lift` : undefined} description={s.description} />
            ))}
          </div>
        );
      case 'wheels':
        return (
          <div role="radiogroup" aria-label="Wheels and tyres" className="space-y-1">
            {WHEEL_OPTIONS.map((w) => (
              <ChoiceRow key={w.id} role="radio" selected={config.wheelId === w.id}
                onClick={() => setConfig({ ...config, wheelId: w.id })} title={w.name} meta={w.rimSpec} description={w.description} />
            ))}
          </div>
        );
      case 'armor':
        return (
          <div>
            <div className="flex items-center justify-between px-1 pb-2 text-xs text-[color:var(--t-muted)]">
              <span>Fabricated in our own metal shop. Choose any combination.</span>
              <span className="flex gap-3 shrink-0 ml-3">
                <button className={`underline underline-offset-2 hover:text-[color:var(--t-fg)] rounded ${focusRing}`}
                  onClick={() => setConfig({ ...config, selectedArmorIds: ARMOR_OPTIONS.map((a) => a.id) })}>All</button>
                <button className={`underline underline-offset-2 hover:text-[color:var(--t-fg)] rounded ${focusRing}`}
                  onClick={() => setConfig({ ...config, selectedArmorIds: [] })}>None</button>
              </span>
            </div>
            <div role="group" aria-label="Armor and accessories" className="space-y-1">
              {ARMOR_OPTIONS.map((a) => (
                <ChoiceRow key={a.id} role="checkbox" selected={config.selectedArmorIds.includes(a.id)}
                  onClick={() => toggleArmor(a.id)} title={a.name} description={a.description} />
              ))}
            </div>
          </div>
        );
      case 'interior':
        return (
          <div role="radiogroup" aria-label="Interior" className="space-y-1">
            {INTERIOR_OPTIONS.map((i) => (
              <ChoiceRow key={i.id} role="radio" selected={config.interiorId === i.id}
                onClick={() => setConfig({ ...config, interiorId: i.id })} title={i.name} meta={i.material} description={i.description} />
            ))}
          </div>
        );
    }
  };

  const specs: [string, string][] = [
    ['Engine', currentPlatform.stockSpecs.engine],
    ['Displacement', currentPlatform.stockSpecs.displacement],
    ['Peak torque', currentPlatform.stockSpecs.torque],
    ['Axle', currentPlatform.stockSpecs.axle],
    ['Drive', currentPlatform.driveType],
  ];

  return (
    <section
      id="configurator-studio"
      ref={sectionRef}
      className="relative py-16 lg:py-24 bg-[color:var(--t-bg)] border-y border-[color:var(--t-border)] scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h2 className="font-display font-extrabold tracking-tight text-[color:var(--t-fg)] text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">
              <MaskText text="Build your 4x4" />
            </h2>
            <p className="mt-4 text-base text-[color:var(--t-muted)] leading-relaxed">
              Start from a base vehicle, then choose paint, roof, suspension, tyres, armor and trim. Send the finished sheet to the workshop and they will quote after inspecting your vehicle.
            </p>
          </div>
          <button
            onClick={() => setConfig(baseline)}
            disabled={!isModified}
            className={`self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] hover:bg-[color:var(--t-raised)] transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${focusRing}`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to default build
          </button>
        </div>

        {/* Make, then model */}
        <div className="mb-8">
          <div role="radiogroup" aria-label="Make" className="flex flex-wrap gap-2">
            {MAKES.map((m) => {
              const sel = m === make;
              return (
                <button
                  key={m}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => {
                    setMake(m);
                    const cur = getPlatform(config.platformId);
                    if (cur.lineup !== m) {
                      const first = VEHICLE_PLATFORMS.find((p) => p.lineup === m);
                      if (first) handleSelectPlatform(first.id);
                    }
                  }}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${focusRing} ${
                    sel
                      ? 'border-[color:var(--t-accent)] bg-[color:var(--t-accent)] text-black'
                      : 'border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] hover:bg-[color:var(--t-raised)]'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={make}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              role="radiogroup"
              aria-label={`${make} models`}
              className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {VEHICLE_PLATFORMS.filter((p) => p.lineup === make).map((plat, i) => {
                const sel = plat.id === config.platformId;
                return (
                  <motion.button
                    key={plat.id}
                    role="radio"
                    aria-checked={sel}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                    onClick={() => handleSelectPlatform(plat.id)}
                    className={`snap-start shrink-0 w-56 text-left rounded-xl border px-5 py-4 transition-colors ${focusRing} ${
                      sel
                        ? 'border-[color:var(--t-accent)] bg-[color:var(--t-panel)] shadow-sm'
                        : 'border-[color:var(--t-border)] hover:border-[color:var(--t-borderstrong)] hover:bg-[color:var(--t-panel2)]'
                    }`}
                  >
                    <span className="block text-base font-semibold text-[color:var(--t-fg)] leading-snug">
                      {plat.name.replace(plat.lineup, '').replace(/\s*\(.*?\)\s*/g, ' ').trim()}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-[color:var(--t-muted)]">{plat.tagline}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
          {/* Stage + specs: stays in view while you work through the steps */}
          <div className="flex flex-col gap-5 min-w-0 lg:sticky lg:top-24">
            <VehicleBlueprintVisualizer config={config} />

            <div className="rounded-xl border border-[color:var(--t-border)] bg-[color:var(--t-panel)] px-5 py-4">
              <h3 className="font-display font-bold text-lg text-[color:var(--t-fg)] [font-stretch:85%]">
                {currentPlatform.name}
              </h3>
              <p className="text-[13px] text-[color:var(--t-muted)] mt-1 leading-relaxed max-w-prose">
                {currentPlatform.tagline}. Factory figures below; we confirm them against your RC and build card.
              </p>
              <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs text-[color:var(--t-dim)]">{k}</dt>
                    <dd className="mt-0.5 font-mono-num text-[13px] text-[color:var(--t-fg2)] leading-snug">{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs text-[color:var(--t-dim)]">Ground clearance</dt>
                  <dd className="mt-0.5 font-mono-num text-[13px] text-[color:var(--t-fg2)] leading-snug">
                    {currentPlatform.stockSpecs.groundClearance}
                    {selectedSuspension.liftInches > 0 && clearanceMm && (
                      <span className="text-[color:var(--t-good)]"> to about {clearanceMm} mm</span>
                    )}
                  </dd>
                  {selectedSuspension.liftInches > 0 && (
                    <dd className="text-[11px] text-[color:var(--t-dim)] mt-0.5">Lift only, tyres not included</dd>
                  )}
                </div>
              </dl>
            </div>
          </div>

          {/* Steps + build sheet */}
          <div className="flex flex-col gap-6 min-w-0">
            <div className="rounded-xl border border-[color:var(--t-border)] bg-[color:var(--t-panel)] divide-y divide-[color:var(--t-border)]">
              {STEPS.map((step) => {
                const open = openStep === step.id;
                return (
                  <div key={step.id} ref={(el) => { stepRefs.current[step.id] = el; }}>
                    <h3>
                      <button
                        id={`step-btn-${step.id}`}
                        aria-expanded={open}
                        aria-controls={`step-panel-${step.id}`}
                        onClick={() => toggleStep(step.id)}
                        className={`w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[color:var(--t-panel2)] transition-colors first:rounded-t-xl ${focusRing}`}
                      >
                        <span className="text-[15px] font-semibold text-[color:var(--t-fg)] shrink-0">{step.label}</span>
                        {changedStep[step.id] && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--t-accent)] shrink-0" title="Changed from the default build" />
                        )}
                        <span className="ml-auto text-[13px] text-[color:var(--t-muted)] truncate text-right">
                          {stepValue(step.id)}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[color:var(--t-dim)] shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          key="panel"
                          id={`step-panel-${step.id}`}
                          role="region"
                          aria-labelledby={`step-btn-${step.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-5">
                            {renderStep(step.id)}
                            {step.id !== 'interior' && (
                              <div className="mt-3 flex justify-end">
                                <button
                                  onClick={() => goNext(step.id)}
                                  className={`text-[13px] font-medium text-[color:var(--t-accent)] hover:underline underline-offset-2 rounded ${focusRing}`}
                                >
                                  Next: {STEPS[STEPS.findIndex((s) => s.id === step.id) + 1].label}
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {advisories.length > 0 && (
              <div className="space-y-2" aria-live="polite">
                {advisories.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 ${
                      a.level === 'caution'
                        ? 'bg-[color:var(--t-warnbg)] border-[color:var(--t-warnborder)]'
                        : 'bg-[color:var(--t-card)] border-[color:var(--t-border)]'
                    }`}
                  >
                    {a.level === 'caution' ? (
                      <TriangleAlert className="w-4 h-4 text-[color:var(--t-accent)] shrink-0 mt-0.5" aria-hidden />
                    ) : (
                      <Info className="w-4 h-4 text-[color:var(--t-dim)] shrink-0 mt-0.5" aria-hidden />
                    )}
                    <div>
                      <div className="font-semibold text-[color:var(--t-fg)]">{a.title}</div>
                      <div className="text-[13px] text-[color:var(--t-muted)] mt-0.5 leading-relaxed">{a.detail}</div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-[color:var(--t-dim)] px-1">
                  These are suggestions only. Nothing is blocked, and the workshop checks fitment on your vehicle.
                </p>
              </div>
            )}

            {/* Build sheet */}
            <div className="rounded-xl border border-[color:var(--t-borderstrong)] bg-[color:var(--t-panel)] shadow-[0_1px_0_0_var(--t-border),0_12px_30px_-18px_rgb(0_0_0/0.45)]">
              <div className="px-5 pt-5 pb-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display font-black text-2xl leading-none text-[color:var(--t-fg)] [font-stretch:75%]">
                    Build sheet
                  </div>
                  <div className="text-[13px] text-[color:var(--t-muted)] mt-1.5 truncate">{currentPlatform.name}</div>
                </div>
                <div className="text-xs text-[color:var(--t-dim)] text-right shrink-0">
                  {isModified ? `${changeCount} of 6 changed` : 'Default build'}
                </div>
              </div>

              <div className="mx-5 border-t border-dashed border-[color:var(--t-borderstrong)]" />

              <dl className="px-5 py-4 space-y-2.5">
                <SheetRow label="Paint" value={selectedPaint.name} changed={changedStep.paint} />
                <SheetRow label="Roof" value={selectedTopColor ? `${selectedTop.name}, ${selectedTopColor.name}` : selectedTop.name} changed={changedStep.top} />
                <SheetRow
                  label="Suspension"
                  value={selectedSuspension.liftInches ? `+${selectedSuspension.liftInches}" lift` : 'Stock height'}
                  changed={changedStep.suspension}
                />
                <SheetRow label="Tyres" value={selectedWheel.tyreSpec} changed={changedStep.wheels} />
                <SheetRow label="Interior" value={selectedInterior.name} changed={changedStep.interior} />
                <SheetRow
                  label="Armor"
                  value={selectedArmor.length ? `${selectedArmor.length} of ${ARMOR_OPTIONS.length}` : 'None'}
                  changed={changedStep.armor}
                />
                {selectedArmor.length > 0 && (
                  <ul className="pl-4 pt-0.5 space-y-1 text-[13px] text-[color:var(--t-muted)] list-disc marker:text-[color:var(--t-dim)]">
                    {selectedArmor.map((a) => (
                      <li key={a.id}>{a.name}</li>
                    ))}
                  </ul>
                )}
                {selectedSuspension.liftInches > 0 && clearanceMm && (
                  <SheetRow label="Ground clearance" value={`about ${clearanceMm} mm`} />
                )}
              </dl>

              <div className="mx-5 border-t border-dashed border-[color:var(--t-borderstrong)]" />

              <div className="px-5 pt-4 pb-5">
                <p className="text-[13px] text-[color:var(--t-muted)] leading-relaxed">
                  No price is shown on purpose. Coorg Auto Works quotes after inspecting your vehicle and engine.
                </p>

                <div className="mt-4 flex flex-col gap-2.5">
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors ${focusRing}`}
                  >
                    <Send className="w-4 h-4" />
                    Send this build to the workshop
                  </a>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleCopySpec}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] hover:bg-[color:var(--t-raised)] transition-colors ${focusRing}`}
                    >
                      <FileText className="w-4 h-4" />
                      {copied === 'spec' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy spec'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border border-[color:var(--t-borderstrong)] text-[color:var(--t-fg2)] hover:bg-[color:var(--t-raised)] transition-colors ${focusRing}`}
                    >
                      <Link2 className="w-4 h-4" />
                      {copied === 'link' ? 'Link copied' : 'Copy link'}
                    </button>
                  </div>
                  {onBookService && (
                    <button
                      onClick={() => onBookService(currentPlatform.name)}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[color:var(--t-accent)] hover:bg-[color:var(--t-cardsel)] transition-colors ${focusRing}`}
                    >
                      Book a consultation for this build
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
