/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfiguratorState, VehiclePlatform, VehiclePlatformId } from '../types';
import {
  VEHICLE_PLATFORMS,
  PAINT_OPTIONS,
  TOP_OPTIONS,
  SUSPENSION_OPTIONS,
  WHEEL_OPTIONS,
  ARMOR_OPTIONS,
  INTERIOR_OPTIONS,
} from './cawData';

/* ------------------------------------------------------------------ */
/* Advisories: soft guidance, never blocks a choice. The workshop      */
/* confirms everything on physical inspection of the donor vehicle.    */
/* ------------------------------------------------------------------ */

export type AdvisoryLevel = 'caution' | 'info';

export interface Advisory {
  id: string;
  level: AdvisoryLevel;
  title: string;
  detail: string;
}

export const getAdvisories = (config: ConfiguratorState): Advisory[] => {
  const out: Advisory[] = [];
  const lift = SUSPENSION_OPTIONS.find((s) => s.id === config.suspensionId)?.liftInches ?? 0;
  const armor = config.selectedArmorIds;
  const isLight = config.platformId === 'gypsy';

  if (isLight && config.suspensionId === 'heavy-overland-lift') {
    out.push({
      id: 'gypsy-heavy-lift',
      level: 'caution',
      title: 'Heavy expedition pack on a light platform',
      detail:
        'The +3.5" pack is rated for 1,200 kg payload, which is far beyond what a Gypsy needs. The +2.5" composite parabolic setup suits it better.',
    });
  }
  if (isLight && config.wheelId === 'trepador-31') {
    out.push({
      id: 'gypsy-wide-tyre',
      level: 'caution',
      title: '31x10.5 is wide for a Gypsy',
      detail: 'Expect arch trimming or fender flares at full lock. We confirm clearance on the donor vehicle.',
    });
  }
  if (isLight && config.topId === 'expedition-rack-tent') {
    out.push({
      id: 'gypsy-roof-tent',
      level: 'caution',
      title: 'Roof tent adds a lot of weight up high',
      detail: 'A clamshell tent plus exoskeleton rack is heavy for a short-wheelbase Gypsy roof. A lighter rack is the safer choice.',
    });
  }
  if (config.topId === 'expedition-rack-tent' && lift >= 3.5) {
    out.push({
      id: 'high-cog',
      level: 'caution',
      title: 'High centre of gravity',
      detail: 'A roof tent on a +3.5" lift is tall. Steep side-slopes on estate tracks need extra care; consider the +2.0" setup.',
    });
  }
  if (
    config.interiorId === 'vintage-tan-leather' &&
    (config.topId === 'open-trail-tub' || config.topId === 'bimini-safari' || config.topId === 'canvas-olive' || config.topId === 'canvas-sand')
  ) {
    out.push({
      id: 'leather-monsoon',
      level: 'info',
      title: 'Leather and open or canvas tops',
      detail: 'Kodagu monsoon spray reaches the cabin on open or canvas tops. Marine vinyl is easier to live with; leather needs regular waxing.',
    });
  }
  if (armor.includes('rally-hella-pods') && !armor.includes('winch-bumper-warn')) {
    out.push({
      id: 'pods-no-bumper',
      level: 'info',
      title: 'Auxiliary lamps are bumper-mounted',
      detail: 'Without the winch bumper we fit a separate bracket bar for the lamps. The workshop will confirm the mounting.',
    });
  }
  if (armor.includes('snorkel-safari') && config.topId === 'insulated-hardtop' && config.platformId !== 'safari') {
    out.push({
      id: 'snorkel-hardtop',
      level: 'info',
      title: 'Snorkel routing with a hardtop',
      detail: 'The A-pillar routing is checked against the hardtop seal line during fitting.',
    });
  }
  return out;
};

/* ------------------------------------------------------------------ */
/* Derived numbers                                                     */
/* ------------------------------------------------------------------ */

/** Stock ground clearance + suspension lift, in mm. Tyre size is not included. */
export const estimateClearanceMm = (platform: VehiclePlatform, liftInches: number): number | null => {
  const m = platform.stockSpecs.groundClearance.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return Math.round(parseFloat(m[1]) + liftInches * 25.4);
};

/* ------------------------------------------------------------------ */
/* Share links (?build=...) and validation                             */
/* ------------------------------------------------------------------ */

export const BUILD_PARAM = 'build';

const has = (list: { id: string }[], id: string) => list.some((x) => x.id === id);

export const getPlatform = (id: VehiclePlatformId): VehiclePlatform =>
  VEHICLE_PLATFORMS.find((p) => p.id === id) || VEHICLE_PLATFORMS[0];

/** Colour a roof starts with: the matching one for sand canvas, otherwise the first offered. */
export const resolveTopColor = (topId: string, colorId?: string) => {
  const top = TOP_OPTIONS.find((t) => t.id === topId);
  const cols = top?.colors ?? [];
  if (!cols.length) return undefined;
  return cols.find((c) => c.id === colorId) || (topId === 'canvas-sand' ? cols.find((c) => c.id === 'sand') : undefined) || cols[0];
};

export const serializeConfig = (c: ConfiguratorState): string =>
  [c.platformId, c.paintId, `${c.topId}.${resolveTopColor(c.topId, c.topColorId)?.id ?? ''}`, c.suspensionId, c.wheelId, c.selectedArmorIds.join('+'), c.interiorId].join('~');

/** Returns a fully valid config, or null if the string is missing or malformed. */
export const parseConfig = (raw: string | null | undefined): ConfiguratorState | null => {
  if (!raw) return null;
  const parts = raw.split('~');
  if (parts.length !== 7) return null;
  const [platformId, paintId, topRaw, suspensionId, wheelId, armorRaw, interiorId] = parts;
  const [topId, topColorRaw] = topRaw.split('.');
  if (!has(VEHICLE_PLATFORMS, platformId)) return null;
  if (!has(PAINT_OPTIONS, paintId)) return null;
  if (!has(TOP_OPTIONS, topId)) return null;
  if (!has(SUSPENSION_OPTIONS, suspensionId)) return null;
  if (!has(WHEEL_OPTIONS, wheelId)) return null;
  if (!has(INTERIOR_OPTIONS, interiorId)) return null;
  const armorIds = armorRaw ? armorRaw.split('+').filter(Boolean) : [];
  if (!armorIds.every((a) => has(ARMOR_OPTIONS, a))) return null;
  return {
    platformId: platformId as VehiclePlatformId,
    paintId,
    topId,
    topColorId: resolveTopColor(topId, topColorRaw)?.id,
    suspensionId,
    wheelId,
    selectedArmorIds: Array.from(new Set(armorIds)),
    interiorId,
  };
};

export const configsEqual = (a: ConfiguratorState, b: ConfiguratorState): boolean =>
  serializeConfig({ ...a, selectedArmorIds: [...a.selectedArmorIds].sort() }) ===
  serializeConfig({ ...b, selectedArmorIds: [...b.selectedArmorIds].sort() });

/** Number of categories that differ from the platform's default build. */
export const countChanges = (c: ConfiguratorState, base: ConfiguratorState): number => {
  let n = 0;
  if (c.paintId !== base.paintId) n++;
  if (c.topId !== base.topId || resolveTopColor(c.topId, c.topColorId)?.id !== resolveTopColor(base.topId, base.topColorId)?.id) n++;
  if (c.suspensionId !== base.suspensionId) n++;
  if (c.wheelId !== base.wheelId) n++;
  if (c.interiorId !== base.interiorId) n++;
  const a = [...c.selectedArmorIds].sort().join();
  const b = [...base.selectedArmorIds].sort().join();
  if (a !== b) n++;
  return n;
};
